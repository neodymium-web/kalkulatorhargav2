import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { calculatePlatformSettlement as calc } from '../lib/platform-settlement/engine'
import { platformTools } from '../lib/platform-settlement/tools'
import { fraction as R, add, subtract, type Rational } from '../lib/utilities-materials/rational'
import { definitions, findPublished, listPublished, listCategory, listCategoryHubs, sitemapPaths } from '../lib/registry'
import { platformFixture as f, percentFee as p, fixedFee as flat } from './platform-settlement-fixtures'
function ledger(input: unknown = f) { const r = calc(input); if (!r.success || !r.ledger) throw new Error(JSON.stringify(r)); return r.ledger }
function held(input: unknown) { const r = calc(input); expect(r.success).toBe(true); if (r.success) { expect(r.ledger).toBeUndefined(); expect(r.details).toEqual([]); expect(r.status).toContain('Belum') } }
function equals(a: Rational, b: Rational) { expect(a.n * b.d).toBe(b.n * a.d) }
for (const slug of Object.keys(platformTools)) describe(slug, () => {
  it(`reconciles independent ${slug} settlement`, () => {
    const l = ledger(); expect(l.payoutCash).toBe(175500n); expect(l.profitCash).toBe(55500n); expect(l.gross).toEqual(R(200000n)); expect(l.sales).toEqual(R(190000n)); expect(l.fees[0].value).toEqual(R(9500n))
    expect(ledger({ ...f, fees: [...f.fees, { ...p, label: 'Bruto', rate: '2', basis: 'gross' }] }).payoutCash).toBe(171500n)
    expect(ledger({ ...f, fees: [{ ...p, capMode: 'enabled', cap: '8000' }, flat] }).payoutCash).toBe(177000n)
    expect(ledger({ ...f, fees: [{ ...p, minimumMode: 'enabled', minimum: '10000' }, flat] }).payoutCash).toBe(175000n)
    expect(ledger({ ...f, fees: [{ ...p, basis: 'custom', custom: '80000' }, flat] }).payoutCash).toBe(181000n)
    expect(ledger({ ...f, fees: [{ ...flat, scope: 'unit' }] }).payoutCash).toBe(183000n)
    equals(add(subtract(subtract(subtract(add(l.sales, l.receipts), l.feeTotal), l.shipping), l.other), l.adjustment), R(l.payoutCash))
    expect(l.profitCash).toBe(l.payoutCash - l.cost.n)
  })
  it('preserves both signed ties aggregate rounding and maximum precision', () => {
    const small = { ...f, price: '1', quantity: '1', discount: '0', cost: '2', shipping: '0', fees: [{ ...p, rate: '50' }] }
    expect(ledger(small)).toMatchObject({ payout: R(1n, 2n), payoutCash: 1n, adjustment: R(1n, 2n), profitCash: -1n })
    expect(ledger({ ...small, fees: [...small.fees, { ...flat, amount: '1' }] })).toMatchObject({ payout: R(-1n, 2n), payoutCash: -1n, adjustment: R(-1n, 2n), profitCash: -3n })
    expect(ledger({ ...small, fees: [{ ...p, label: 'A', rate: '50' }, { ...p, label: 'B', rate: '50' }] }).payoutCash).toBe(0n)
    expect(ledger({ ...small, price: '9999999999999', quantity: '10000', fees: [{ ...p, basis: 'gross', rate: '0.000001' }] }).payout).toEqual(R(999999989999900000001n, 10000n))
    const zero = { ...f, price: '0', discount: '0', cost: '0', shipping: '0', fees: [{ ...p, rate: '100' }] }
    expect(ledger(zero).payoutCash).toBe(0n); const r = calc(zero); if (r.success) expect(r.details.some(d => d.kind === 'percent')).toBe(false)
    expect(ledger({ ...f, discount: '0', fees: [] }).payoutCash).toBe(197000n)
    expect(ledger({ ...f, fees: [{ ...p, rate: '100' }] }).payoutCash).toBe(-3000n)
  })
  it('maps shipping receipts without automatically deducting platform display discounts', () => {
    expect(ledger({ ...f, buyerShipping: '10000' }).payoutCash).toBe(175500n)
    expect(ledger({ ...f, buyerShipping: '10000', shippingFlow: 'credited' }).payoutCash).toBe(185500n)
    expect(ledger({ ...f, reimbursement: '3000' }).payoutCash).toBe(178500n)
    expect(ledger({ ...f, platformDisplayDiscount: '10000' }).payoutCash).toBe(175500n)
    held({ ...f, shippingFlow: 'unknown' }); held({ ...f, confirmation: 'unknown' }); held({ ...f, coverage: 'unsupported' })
  })
  it('does not invent unknown scope basis rate or fee bounds', () => {
    for (const patch of [{ type: 'unknown' }, { basis: 'unknown' }, { capMode: 'unknown' }, { minimumMode: 'unknown' }]) held({ ...f, fees: [{ ...p, ...patch }] })
    held({ ...f, fees: [{ ...flat, scope: 'unknown' }] })
    for (const key of ['confirmation', 'coverage', 'shippingFlow']) for (const value of [null, undefined, '']) held({ ...f, [key]: value })
    for (const value of [undefined, '', null]) expect(calc({ ...f, fees: [{ ...p, rate: value }] }).success).toBe(false)
    expect(calc({ ...f, fees: [{ ...p, minimumMode: 'enabled', minimum: '9000', capMode: 'enabled', cap: '8000' }] }).success).toBe(false)
    expect(calc({ ...f, fees: [{ ...p, capMode: 'enabled' }] }).success).toBe(false)
  })
  it('rejects malformed boundary and duplicate input', () => {
    for (const bad of ['', null, undefined, '-1', '1.5', '1e5', 'Infinity', '10000000000000']) expect(calc({ ...f, price: bad }).success).toBe(false)
    for (const quantity of ['0', '10001', '1.5']) expect(calc({ ...f, quantity }).success).toBe(false)
    for (const rate of ['100.000001', '-1', '0.0000001', '1e1']) expect(calc({ ...f, fees: [{ ...p, rate }] }).success).toBe(false)
    expect(calc({ ...f, discount: '200001' }).success).toBe(false)
    expect(calc({ ...f, fees: [p, { ...p, label: ' ADMIN ASUMSI ' }] }).success).toBe(false)
    const fees = Array.from({ length: 12 }, (_, i) => ({ ...p, label: `Fee ${i}` })); expect(calc({ ...f, fees }).success).toBe(true); expect(calc({ ...f, fees: [...fees, { ...p, label: '13' }] }).success).toBe(false)
  })
  it('preserves uncapped splitting reordering and cap monotonicity', () => {
    const once = ledger({ ...f, fees: [p] }), split = ledger({ ...f, fees: [{ ...p, rate: '2' }, { ...p, label: 'Sisa', rate: '3' }] }); equals(once.payout, split.payout)
    equals(ledger({ ...f, fees: [...f.fees].reverse() }).payout, ledger().payout)
    const order = ledger({ ...f, shipping: '0', fees: [p] }), half = ledger({ ...f, shipping: '0', quantity: '1', discount: '5000', fees: [p] })
    equals(order.payout, add(half.payout, half.payout))
    let previous = 0n
    for (const cap of ['0', '1', '8000', '9500', '10000']) { const l = ledger({ ...f, fees: [{ ...p, capMode: 'enabled', cap }] }); expect(l.feeTotal.n).toBeGreaterThanOrEqual(previous); previous = l.feeTotal.n }
  })
})
it('publishes all 100 unique working inventory IDs and 107 canonical URLs', () => {
  expect(listPublished()).toHaveLength(100); expect(definitions).toHaveLength(100); expect(new Set(definitions.map(t => t.id)).size).toBe(100); expect(listCategory('marketplace')).toHaveLength(20); expect(listCategory('pajak')).toHaveLength(10); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(107)
  expect(findPublished('tiktok-shop')?.id).toBe('calc-tiktok'); expect(findPublished('tiktok')?.id).toBe('calc-estimasi-tiktok-kreator')
  const rows = readFileSync('docs/CALCULATOR_INVENTORY.md', 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)); expect(rows).toHaveLength(100); expect(rows.every(l => l.includes('| published |'))).toBe(true)
})
