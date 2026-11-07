import { describe, it, expect } from 'vitest'
import {
  calculatePromo,
  calculateShipping,
  calculatePackaging,
  calculateReturns,
  calculateCod,
} from '../lib/seller-costs/engines'
const values = (r: ReturnType<typeof calculatePromo>) => {
  expect(r.success).toBe(true)
  if (!r.success) throw Error('Invalid')
  return r.values
}
const row = { price: '1', quantity: '3', usage: '1', waste: '0', unit: 'pcs' }
describe('seller costs', () => {
  it('promo reconciles seller and platform funding', () => {
    expect(values(calculatePromo({ price: '100000', discount: '20000', share: '25' }))).toEqual({
      burden: 500000n,
      platform: 1500000n,
      buyer: 8000000n,
      proceeds: 9500000n,
    })
    expect(values(calculatePromo({ price: '3', discount: '1', share: '33,33' }))).toEqual({
      burden: 33n,
      platform: 67n,
      buyer: 200n,
      proceeds: 267n,
    })
    expect(calculatePromo({ price: '1', discount: '2', share: '0' }).success).toBe(false)
    for (const share of ['0', '100'])
      expect(calculatePromo({ price: '0', discount: '0', share }).success).toBe(true)
  })
  it('allocates nonzero discounts at both participation boundaries', () => {
    expect(values(calculatePromo({price:'100',discount:'20',share:'0'}))).toEqual({burden:0n,platform:2000n,buyer:8000n,proceeds:10000n})
    expect(values(calculatePromo({price:'100',discount:'20',share:'100'}))).toEqual({burden:2000n,platform:0n,buyer:8000n,proceeds:8000n})
    expect(calculatePromo({price:'100',discount:'20',share:'100.01'}).success).toBe(false)
  })
  it('shipping rejects overfunding', () => {
    expect(values(calculateShipping({ actual: '20000', buyer: '5000', credit: '10000' })).seller).toBe(
      500000n,
    )
    expect(values(calculateShipping({ actual: '15000', buyer: '0', credit: '15000' })).seller).toBe(0n)
    expect(calculateShipping({ actual: '10000', buyer: '8000', credit: '3000' }).success).toBe(false)
  })
  it('packaging sums rational materials before rounding', () => {
    expect(values(calculatePackaging({ shipments: '3', materials: [row, row] }))).toEqual({
      per: 67n,
      total: 200n,
    })
    expect(
      values(
        calculatePackaging({
          shipments: '10',
          materials: [
            { ...row, price: '100000', quantity: '100' },
            { ...row, price: '20000', quantity: '100', usage: '2', waste: '20', unit: 'm' },
          ],
        }),
      ),
    ).toEqual({ per: 150000n, total: 1500000n })
    for (const changes of [{ quantity: '0' }, { waste: '100' }, { unit: 'invalid' }, { usage: '-1' }])
      expect(calculatePackaging({ shipments: '1', materials: [{ ...row, ...changes }] }).success).toBe(false)
    expect(calculatePackaging({ shipments: '1', materials: [] }).success).toBe(false)
    expect(calculatePackaging({ shipments: '1', materials: Array(101).fill(row) }).success).toBe(false)
  })
  it('returns preserve small probabilities in batch totals', () => {
    expect(values(calculateReturns({ gross: '50000', recovery: '20000', rate: '5', orders: '100' }))).toEqual(
      { net: 3000000n, per: 150000n, total: 15000000n },
    )
    const r = calculateReturns({ gross: '1', recovery: '0', rate: '0.01', orders: '10000' })
    expect(values(r)).toEqual({ net: 100n, per: 0n, total: 100n })
    expect(r.success && r.tiny).toContain('per')
    expect(calculateReturns({ gross: '1', recovery: '2', rate: '5', orders: '1' }).success).toBe(false)
  })
  it('COD never rounds expected failures before loss', () => {
    expect(values(calculateCod({ attempts: '1', rate: '1', loss: '100' }))).toEqual({
      failures: 100n,
      total: 100n,
      per: 100n,
    })
    expect(values(calculateCod({ attempts: '100', rate: '3.5', loss: '20000' }))).toEqual({
      failures: 35000n,
      total: 7000000n,
      per: 70000n,
    })
    expect(values(calculateCod({ attempts: '0', rate: '100', loss: '1' }))).toEqual({
      failures: 0n,
      total: 0n,
      per: 100n,
    })
    expect(
      values(calculateCod({ attempts: '9999999999999', rate: '100', loss: '9999999999999' })).total,
    ).toBe(9999999999999n ** 2n * 100n)
  })
  for (const rate of ['-1', '100.01', '', 'NaN', 'Infinity', '1e2', '0.001'])
    it(`rejects invalid probability ${rate}`, () =>
      expect(calculateCod({ attempts: '1', rate, loss: '1' }).success).toBe(false))
  for (const rate of ['0', '100'])
    it(`supports probability boundary ${rate}`, () => {
      expect(values(calculateCod({ attempts: '10', rate, loss: '1' })).total).toBe(rate === '0' ? 0n : 1000n)
      expect(calculateReturns({ gross: '0', recovery: '0', rate, orders: '1' }).success).toBe(true)
    })
  for (const bad of [
    null,
    {},
    { attempts: '1.5', rate: '1', loss: '1' },
    { attempts: '1', rate: '1', loss: '-1' },
    { attempts: '1', rate: '1', loss: '10000000000000' },
  ])
    it('rejects malformed or out-of-range input', () => expect(calculateCod(bad).success).toBe(false))
})
