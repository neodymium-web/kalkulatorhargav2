import { expect, it } from 'vitest'
import {
  calculateBreakEven, calculateGrossMargin, calculateMarkup, calculateProfitTarget, calculateSellingPrice,
} from '../lib/business/engines'

it('harga jual uses gross margin and rounds up to meet the threshold', () => {
  const result = calculateSellingPrice({ cost: '10000', margin: '25' })
  expect(result).toEqual({ success: true, values: { minimum: 13334n } })
  const minimum = 13334n
  expect(minimum * 7500n).toBeGreaterThanOrEqual(10000n * 10000n)
  expect((minimum - 1n) * 7500n).toBeLessThan(10000n * 10000n)
})

it('harga jual supports exact, zero-cost and large thresholds', () => {
  expect(calculateSellingPrice({ cost: '75', margin: '25,00' })).toMatchObject({ values: { minimum: 100n } })
  expect(calculateSellingPrice({ cost: '75', margin: '0' })).toMatchObject({ values: { minimum: 75n } })
  expect(calculateSellingPrice({ cost: '0', margin: '99.99' })).toMatchObject({ values: { minimum: 1n } })
  expect(calculateSellingPrice({ cost: '9999999999999', margin: '99,99' })).toMatchObject({
    values: { minimum: 99999999999990000n },
  })
})

it('harga jual rejects invalid percentages', () => {
  for (const margin of ['', '-1', '100', '100,00', '99.999', '1e2', '1,2.3', 'Infinity', null]) {
    expect(calculateSellingPrice({ cost: '10', margin })).toMatchObject({ success: false, errors: { margin: expect.any(Array) } })
  }
})

it('margin and markup use different denominators', () => {
  const input = { price: '120000', cost: '90000' }
  expect(calculateGrossMargin(input)).toMatchObject({ values: { profit: 30000n, percent: 2500n } })
  expect(calculateMarkup(input)).toMatchObject({ values: { difference: 30000n, percent: 3333n } })
})

it('margin reports losses and rejects a zero selling price', () => {
  expect(calculateGrossMargin({ price: '120000', cost: '150000' })).toMatchObject({ values: { profit: -30000n, percent: -2500n } })
  expect(calculateGrossMargin({ price: '1', cost: '0' })).toMatchObject({ values: { profit: 1n, percent: 10000n } })
  expect(calculateGrossMargin({ price: '0', cost: '0' })).toMatchObject({ success: false, errors: { price: expect.any(Array) } })
})

it('markup accepts a zero price but rejects a zero cost', () => {
  expect(calculateMarkup({ price: '0', cost: '1' })).toMatchObject({ values: { difference: -1n, percent: -10000n } })
  expect(calculateMarkup({ price: '120000', cost: '150000' })).toMatchObject({ values: { difference: -30000n, percent: -2000n } })
  expect(calculateMarkup({ price: '1', cost: '0' })).toMatchObject({ success: false, errors: { cost: expect.any(Array) } })
})

it('percentages round to two places without floating-point conversion', () => {
  expect(calculateGrossMargin({ price: '32', cost: '31' })).toMatchObject({ values: { percent: 313n } })
  expect(calculateGrossMargin({ price: '32', cost: '33' })).toMatchObject({ values: { percent: -313n } })
  expect(calculateGrossMargin({ price: '1', cost: '9999999999999' })).toMatchObject({ values: { percent: -99999999999980000n } })
  expect(calculateMarkup({ price: '9999999999999', cost: '1' })).toMatchObject({ values: { percent: 99999999999980000n } })
})

it('BEP rounds fractional units up and preserves exact division', () => {
  const unit = { price: '50000', variable: '30000' }
  expect(calculateBreakEven({ ...unit, fixed: '1000000' })).toMatchObject({ values: { units: 50n, contribution: 20000n } })
  expect(calculateBreakEven({ ...unit, fixed: '1000001' })).toMatchObject({ values: { units: 51n, contribution: 20000n } })
})

it('BEP handles zero fixed costs and nonpositive contribution', () => {
  expect(calculateBreakEven({ fixed: '0', price: '1', variable: '2' })).toMatchObject({ values: { units: 0n, contribution: -1n } })
  expect(calculateBreakEven({ fixed: '0', price: '2', variable: '1' })).toMatchObject({ values: { units: 0n, contribution: 1n } })
  expect(calculateBreakEven({ fixed: '1', price: '2', variable: '2' })).toMatchObject({ values: { units: null, contribution: 0n } })
  expect(calculateBreakEven({ fixed: '1', price: '1', variable: '2' })).toMatchObject({ values: { units: null, contribution: -1n } })
})

it('target laba rounds up and reduces to BEP when target is zero', () => {
  const input = { fixed: '1000000', price: '50000', variable: '30000' }
  expect(calculateProfitTarget({ ...input, target: '500001' })).toMatchObject({ values: { units: 76n, contribution: 20000n } })
  expect(calculateProfitTarget({ ...input, target: '500000' })).toMatchObject({ values: { units: 75n, contribution: 20000n } })
  expect(calculateProfitTarget({ ...input, target: '0' })).toEqual(calculateBreakEven(input))
})

it('target laba handles zero requirement and unreachable targets', () => {
  expect(calculateProfitTarget({ fixed: '0', target: '0', price: '0', variable: '0' })).toMatchObject({ values: { units: 0n } })
  expect(calculateProfitTarget({ fixed: '0', target: '1', price: '1', variable: '1' })).toMatchObject({ values: { units: null } })
  expect(calculateProfitTarget({ fixed: '0', target: '1', price: '0', variable: '1' })).toMatchObject({ values: { units: null } })
})

it('volume targets preserve large values', () => {
  const input = { fixed: '9999999999999', price: '1', variable: '0' }
  expect(calculateBreakEven(input)).toMatchObject({ values: { units: 9999999999999n } })
  expect(calculateProfitTarget({ ...input, target: '9999999999999' })).toMatchObject({ values: { units: 19999999999998n } })
})

it.each([
  [calculateSellingPrice, 'cost', { margin: '10' }],
  [calculateGrossMargin, 'price', { cost: '1' }],
  [calculateMarkup, 'cost', { price: '1' }],
  [calculateBreakEven, 'variable', { price: '2', fixed: '1' }],
  [calculateProfitTarget, 'target', { price: '2', variable: '1', fixed: '1' }],
] as const)('rejects blank, negative, fractional, oversized and non-string amounts for %s', (engine, key, input) => {
  for (const value of ['', '-1', '1,5', '1.000', '1e5', '10000000000000', undefined, null, Infinity]) {
    expect(engine({ ...input, [key]: value })).toMatchObject({ success: false, errors: { [key]: expect.any(Array) } })
  }
})

it('matches the independently calculated examples in the verification record', () => {
  const sale = { price: '64000', cost: '50000' }
  const volume = { price: '45000', variable: '33000', fixed: '83500' }
  expect(calculateSellingPrice({ cost: '7350', margin: '18' })).toMatchObject({ values: { minimum: 8964n } })
  expect(calculateGrossMargin(sale)).toMatchObject({ values: { profit: 14000n, percent: 2188n } })
  expect(calculateMarkup(sale)).toMatchObject({ values: { difference: 14000n, percent: 2800n } })
  expect(calculateBreakEven(volume)).toMatchObject({ values: { units: 7n, contribution: 12000n } })
  expect(calculateProfitTarget({ ...volume, target: '25000' })).toMatchObject({ values: { units: 10n, contribution: 12000n } })
  expect(calculateBreakEven({ ...volume, price: '33000' })).toMatchObject({ values: { units: null, contribution: 0n } })
  expect(calculateProfitTarget({ ...volume, price: '32999', target: '25000' })).toMatchObject({ values: { units: null, contribution: -1n } })
})
