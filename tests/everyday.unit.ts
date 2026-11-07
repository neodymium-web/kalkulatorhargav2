import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculateDiscount, calculateUnitPrice, calculateBill, calculatePortion, calculateRatioPercent, calculatePercent, calculatePercentChange, type EverydayResult, units } from '../lib/everyday/engines'
import { formatEveryday } from '../lib/everyday/format'
import { listPublished, listCategory, listCategoryHubs, sitemapPaths, findPublished } from '../lib/registry'
const ok = (r: EverydayResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: EverydayResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const max = '9999999999999'
const discount = { original: '100000', discounts: [{ rate: '10' }, { rate: '20' }] }
const packages = [{ price: '12000', quantity: '500', unit: 'g' }, { price: '22000', quantity: '1', unit: 'kg' }]
const bill = { service: '3', tax: '4', mode: 'proportional', people: [{ subtotal: '10000' }, { subtotal: '20000' }, { subtotal: '30000' }] }
const abs = (n: bigint) => n < 0n ? -n : n
function conserve(r: ReturnType<typeof ok>) {
  expect(r.people!.reduce((s, p) => s + p.extra, 0n)).toBe(r.values.shared)
  expect(r.people!.reduce((s, p) => s + p.subtotal, 0n)).toBe(r.values.subtotal)
  expect(r.people!.reduce((s, p) => s + p.total, 0n)).toBe(r.values.grand)
  expect(r.values.allocated).toBe(r.values.grand); expect(r.values.difference).toBe(0n)
  for (const p of r.people!) { expect(p.extra).toBeGreaterThanOrEqual(0n); expect(p.total).toBe(p.subtotal + p.extra) }
}
describe('everyday independently derived reference vectors', () => {
  it('sequential discount keeps exact factors and rounds cash only once', () => {
    const r = ok(calculateDiscount(discount))
    expect(r.values).toEqual({ final: 72000n, saved: 28000n, original: 100000n, modelPercent: 2800n, cashPercent: 2800n })
    expect(r.stages).toEqual([{ rate: 100000n, factor: 900000n, model: 9000000n }, { rate: 200000n, factor: 720000n, model: 7200000n }])
    const tiny = ok(calculateDiscount({ original: '1', discounts: [{ rate: '50' }] }))
    expect(tiny.values).toMatchObject({ final: 1n, saved: 0n, modelPercent: 5000n, cashPercent: 0n }); expect(tiny.stages).toEqual([{ rate: 500000n, factor: 500000n, model: 50n }])
    const sequential = ok(calculateDiscount({ original: '1', discounts: [{ rate: '50' }, { rate: '50' }] }))
    expect(sequential.values).toMatchObject({ final: 0n, saved: 1n, modelPercent: 7500n, cashPercent: 10000n }); expect(sequential.stages![1]).toEqual({ rate: 500000n, factor: 250000n, model: 25n })
  })
  it('discount 0 and 100 preserve cash boundaries and zero-price distinction', () => {
    expect(ok(calculateDiscount({ original: '100', discounts: [{ rate: '100' }] })).values).toMatchObject({ final: 0n, saved: 100n, modelPercent: 10000n, cashPercent: 10000n })
    expect(ok(calculateDiscount({ original: max, discounts: [{ rate: '0' }] })).values).toMatchObject({ final: BigInt(max), saved: 0n, modelPercent: 0n, cashPercent: 0n })
    expect(ok(calculateDiscount({ ...discount, original: '0' })).values).toEqual({ final: 0n, saved: 0n, original: 0n, modelPercent: 2800n, cashPercent: null })
  })
  it('discount stage diagnostics retain nonzero tiny factors without influencing cash', () => {
    const r = ok(calculateDiscount({ original: max, discounts: Array.from({ length: 20 }, () => ({ rate: '99.9999' })) }))
    expect(r.values.final).toBe(0n); expect(r.precision['stages.19.factor']).toBe('positive'); expect(r.precision['stages.19.model']).toBe('positive')
    expect(r.values.modelPercent).toBe(10000n)
    const zero = ok(calculateDiscount({ original: '1', discounts: [{ rate: '100' }] })); expect(zero.precision['stages.0.factor']).toBeUndefined()
  })
  it('unit prices normalize families and compare unrounded cross products', () => {
    const r = ok(calculateUnitPrice({ packages }))
    expect(r.values).toEqual({ minimum: 2200000n, maximum: 2400000n, saving: 833n }); expect(r.winners).toEqual([1]); expect(r.comparisonUnit).toBe('kg')
    expect(r.packages!.map(p => [p.unitPrice, p.saving, p.cheapest])).toEqual([[2400000n, 0n, false], [2200000n, 833n, true]])
    const volume = ok(calculateUnitPrice({ packages: [{ price: '5000', quantity: '250', unit: 'mL' }, { price: '8000', quantity: '500', unit: 'mL' }] }))
    expect(volume.values).toEqual({ minimum: 1600000n, maximum: 2000000n, saving: 2000n }); expect(volume.comparisonUnit).toBe('L'); expect(volume.winners).toEqual([1])
  })
  it('unit prices preserve exact ties all-free and free-versus-paid cases', () => {
    const tie = ok(calculateUnitPrice({ packages: [packages[0], { price: '24000', quantity: '1', unit: 'kg' }] }))
    expect(tie.winners).toEqual([0, 1]); expect(tie.roundedTie).toBe(false); expect(tie.values.saving).toBe(0n)
    const free = ok(calculateUnitPrice({ packages: packages.map(p => ({ ...p, price: '0' })) }))
    expect(free.winners).toEqual([0, 1]); expect(free.values).toEqual({ minimum: 0n, maximum: 0n, saving: null }); expect(free.packages!.every(p => p.saving === null)).toBe(true)
    const mixed = ok(calculateUnitPrice({ packages: [{ ...packages[0], price: '0' }, packages[1]] }))
    expect(mixed.winners).toEqual([0]); expect(mixed.values.saving).toBe(10000n)
  })
  it('near-tie display cannot override a genuinely cheaper exact unit ratio', () => {
    const r = ok(calculateUnitPrice({ packages: [{ price: '1', quantity: '1000', unit: 'pcs' }, { price: '1', quantity: '1001', unit: 'pcs' }] }))
    expect(r.winners).toEqual([1]); expect(r.roundedTie).toBe(true); expect(r.values.saving).toBe(10n)
    expect(r.packages!.map(p => p.unitPrice)).toEqual([0n, 0n]); expect(r.precision.minimum).toBe('positive'); expect(r.precision['packages.0.unitPrice']).toBe('positive')
  })
  it('all metric prefix conversions are exact and never compare density', () => {
    const r = ok(calculateUnitPrice({ packages: [{ price: '1', quantity: '1000', unit: 'mg' }, { price: '1', quantity: '1', unit: 'g' }, { price: '1', quantity: '0.001', unit: 'kg' }] }))
    expect(r.winners).toEqual([0, 1, 2]); expect(r.values.minimum).toBe(100000n)
    const small = ok(calculateUnitPrice({ packages: [{ price: max, quantity: '0.001', unit: 'mg' }, { price: max, quantity: '0.001', unit: 'mg' }] }))
    expect(small.values.minimum).toBe(BigInt(max) * 100000000000n)
    for (const unit of ['mL', 'pcs']) bad(calculateUnitPrice({ packages: [packages[0], { ...packages[1], unit }] }), 'packages.1.unit')
  })
  it('bill allocations conserve every rupiah with largest remainder and stable ties', () => {
    const r = ok(calculateBill(bill)); expect(r.values).toEqual({ grand: 60007n, subtotal: 60000n, shared: 7n, service: 3n, tax: 4n, allocated: 60007n, difference: 0n })
    expect(r.people).toEqual([{ subtotal: 10000n, extra: 1n, total: 10001n }, { subtotal: 20000n, extra: 2n, total: 20002n }, { subtotal: 30000n, extra: 4n, total: 30004n }]); conserve(r)
    const equal = ok(calculateBill({ ...bill, service: '3', tax: '7', mode: 'equal' })); expect(equal.people!.map(p => [p.extra, p.total])).toEqual([[4n, 10004n], [3n, 20003n], [3n, 30003n]]); expect(equal.values.grand).toBe(60010n); conserve(equal)
  })
  it('bill zero subtotal rules are explicit without silently falling back to equal', () => {
    const people = [{ subtotal: '0' }, { subtotal: '0' }]
    const equal = ok(calculateBill({ service: '1', tax: '0', mode: 'equal', people })); expect(equal.people!.map(p => p.total)).toEqual([1n, 0n]); conserve(equal)
    const zero = ok(calculateBill({ service: '0', tax: '0', mode: 'proportional', people })); expect(zero.people!.map(p => p.total)).toEqual([0n, 0n]); conserve(zero)
    bad(calculateBill({ service: '1', tax: '0', mode: 'proportional', people }), 'mode')
    const partial = ok(calculateBill({ service: '2', tax: '0', mode: 'proportional', people: [{ subtotal: '0' }, { subtotal: '1' }, { subtotal: '2' }] }))
    expect(partial.people!.map(p => [p.extra, p.total])).toEqual([[0n, 0n], [1n, 2n], [1n, 3n]]); conserve(partial)
  })
  it('percent portion handles signed fixed-point products and four-decimal ties', () => {
    expect(ok(calculatePortion({ value: '200', percent: '15' })).values.result).toBe(300000n)
    expect(ok(calculatePortion({ value: '40', percent: '12.5' })).values.result).toBe(50000n)
    expect(ok(calculatePortion({ value: '-200', percent: '15' })).values.result).toBe(-300000n)
    expect(ok(calculatePortion({ value: '40', percent: '-12.5' })).values.result).toBe(-50000n)
    expect(ok(calculatePortion({ value: '0.01', percent: '0.5' })).values.result).toBe(1n)
    expect(ok(calculatePortion({ value: '-0.01', percent: '0.5' })).values.result).toBe(-1n)
    expect(ok(calculatePortion({ value: '0.000001', percent: '0.0001' })).precision.result).toBe('positive')
    expect(ok(calculatePortion({ value: '-0.000001', percent: '0.0001' })).precision.result).toBe('negative')
  })
  it('percent ratio normalizes signed denominators and rejects zero', () => {
    expect(ok(calculateRatioPercent({ part: '3', whole: '8' })).values.result).toBe(375000n)
    expect(ok(calculateRatioPercent({ part: '0', whole: '8' })).values.result).toBe(0n)
    for (const [part, whole, expected] of [['-3', '8', -375000n], ['3', '-8', -375000n], ['-3', '-8', 375000n]] as const) expect(ok(calculateRatioPercent({ part, whole })).values.result).toBe(expected)
    bad(calculateRatioPercent({ part: '0', whole: '0' }), 'whole')
    expect(ok(calculateRatioPercent({ part: '0.000001', whole: max })).precision.result).toBe('positive')
    expect(ok(calculateRatioPercent({ part: '-0.000001', whole: max })).precision.result).toBe('negative')
  })
  it('percent dispatcher exposes both complete signed arithmetic modes', () => {
    expect(calculatePercent({ mode: 'portion', value: '200', percent: '15' })).toEqual(calculatePortion({ value: '200', percent: '15' }))
    expect(calculatePercent({ mode: 'ratio', part: '3', whole: '8' })).toEqual(calculateRatioPercent({ part: '3', whole: '8' }))
    for (const mode of ['', 'discount', null, undefined]) bad(calculatePercent({ mode }), 'mode')
  })
  it('percent change preserves exact decimal delta and undefined zero baseline', () => {
    for (const [previous, current, change, percent] of [['100', '125', 25000000n, 250000n], ['100', '80', -20000000n, -200000n], ['100', '0', -100000000n, -1000000n], ['100', '100', 0n, 0n], ['0', '100', 100000000n, null], ['0', '0', 0n, null]] as const) {
      expect(ok(calculatePercentChange({ previous, current })).values).toEqual({ percent, change, previous: BigInt(previous) * 1000000n, current: BigInt(current) * 1000000n })
    }
    expect(ok(calculatePercentChange({ previous: '32', current: '33' })).values.percent).toBe(31250n)
    const r = ok(calculatePercentChange({ previous: max, current: '9999999999998.999999' })); expect(r.values.change).toBe(-1n); expect(r.precision.percent).toBe('negative')
  })
})
describe('allocation and rational invariants', () => {
  it('all equal and proportional allocations conserve totals and respect floor/ceil quota', () => {
    for (const mode of ['equal', 'proportional']) for (const subtotals of [[0n, 0n], [1n, 1n], [0n, 1n, 2n], [10000n, 20000n, 30000n], Array(20).fill(9999999999999n)]) for (const service of [0n, 1n, 7n, 10n, 9999999999999n]) {
      const tax = service, totalWeight = mode === 'equal' ? BigInt(subtotals.length) : subtotals.reduce((s, n) => s + n, 0n)
      const input = { mode, service: String(service), tax: String(tax), people: subtotals.map(subtotal => ({ subtotal: String(subtotal) })) }
      if (!totalWeight && service > 0n) { bad(calculateBill(input), 'mode'); continue }
      const r = ok(calculateBill(input)); conserve(r)
      for (const [i, p] of r.people!.entries()) {
        const n = (service + tax) * (mode === 'equal' ? 1n : subtotals[i])
        const floor = totalWeight ? n / totalWeight : 0n, ceil = totalWeight ? (n + totalWeight - 1n) / totalWeight : 0n
        expect(p.extra).toBeGreaterThanOrEqual(floor); expect(p.extra).toBeLessThanOrEqual(ceil)
      }
    }
  })
  it('non-tied proportional rows retain allocation after permutation; equal ties use visual order', () => {
    const a = ok(calculateBill(bill)), b = ok(calculateBill({ ...bill, people: [bill.people[2], bill.people[0], bill.people[1]] }))
    expect(b.people!.map(p => p.extra)).toEqual([a.people![2].extra, a.people![0].extra, a.people![1].extra])
    const equal = ok(calculateBill({ ...bill, service: '10', tax: '0', mode: 'equal', people: [bill.people[2], bill.people[0], bill.people[1]] }))
    expect(equal.people!.map(p => p.extra)).toEqual([4n, 3n, 3n]); expect(equal.people![0].subtotal).toBe(30000n)
    expect(calculateBill(bill)).toEqual(calculateBill(bill))
  })
  it('unit price winners and diagnostic rounding agree with independent cross products', () => {
    const p = [{ price: '12000', quantity: '500', unit: 'g' }, { price: '22000', quantity: '1', unit: 'kg' }, { price: '20000', quantity: '900000', unit: 'mg' }] as const
    const r = ok(calculateUnitPrice({ packages: [...p] }))
    const independent = p.map(x => ({ n: BigInt(x.price) * 1000n * units[x.unit].denominator, d: BigInt(x.quantity) * 1000n }))
    for (const winner of r.winners!) for (const f of independent) expect(independent[winner].n * f.d).toBeLessThanOrEqual(f.n * independent[winner].d)
    for (const [i, f] of independent.entries()) expect(2n * abs(r.packages![i].unitPrice * f.d - f.n * 100n)).toBeLessThanOrEqual(f.d)
    const reversed = ok(calculateUnitPrice({ packages: [...p].reverse() })); expect(reversed.values).toEqual(r.values); expect(reversed.winners).toEqual([1])
  })
  it('discount conservation order invariance and cumulative factor monotonicity hold without intermediate rounding', () => {
    for (const original of ['0', '1', '101', max]) for (const rates of [['0'], ['10', '20'], ['33.3333', '50', '99.9999'], ['100', '10']]) {
      const r = ok(calculateDiscount({ original, discounts: rates.map(rate => ({ rate })) }))
      expect(r.values.final! + r.values.saved!).toBe(BigInt(original)); expect(r.values.final!).toBeGreaterThanOrEqual(0n); expect(r.values.final!).toBeLessThanOrEqual(BigInt(original))
      expect(r.values).toEqual(ok(calculateDiscount({ original, discounts: [...rates].reverse().map(rate => ({ rate })) })).values)
      let last = 1000000n; for (const stage of r.stages!) { expect(stage.factor).toBeLessThanOrEqual(last); last = stage.factor }
    }
  })
  it('signed ratio and portion have symmetric rounding and exact delta reconstructs current', () => {
    for (const n of ['0', '1', '0.01', '0.000001', max]) {
      const positive = ok(calculatePortion({ value: n, percent: '12.5' })), negative = ok(calculatePortion({ value: '-' + n, percent: '12.5' }))
      expect(negative.values.result).toBe(-positive.values.result!)
      const r = ok(calculatePercentChange({ previous: '0.000001', current: n })); expect(r.values.previous! + r.values.change!).toBe(r.values.current)
    }
    expect(ok(calculateRatioPercent({ part: max, whole: '0.000001' })).values.result!).toBeGreaterThan(9007199254740991n)
  })
})
describe('everyday malformed input and caps', () => {
  it.each(['', '-1', '1.1', '1e3', 'NaN', 'Infinity', '10000000000000', null, undefined, 1])('rejects invalid whole money %s', value => {
    bad(calculateDiscount({ ...discount, original: value }), 'original'); bad(calculateUnitPrice({ packages: [{ ...packages[0], price: value }, packages[1]] }), 'packages.0.price'); bad(calculateBill({ ...bill, service: value }), 'service'); bad(calculateBill({ ...bill, people: [{ subtotal: value }, bill.people[1]] }), 'people.0.subtotal')
  })
  it('enforces row minima maxima rates unit families quantities and modes', () => {
    for (const discounts of [[], Array(21).fill({ rate: '1' })]) bad(calculateDiscount({ original: '1', discounts }), 'discounts')
    for (const rate of ['-1', '100.0001', '20.00001', '', null]) bad(calculateDiscount({ original: '1', discounts: [{ rate }] }), 'discounts.0.rate')
    for (const p of [[], [packages[0]], Array(11).fill(packages[0])]) bad(calculateUnitPrice({ packages: p }), 'packages')
    for (const quantity of ['0', '-1', '0.0001', '10000000000000', null]) bad(calculateUnitPrice({ packages: [{ ...packages[0], quantity }, packages[1]] }), 'packages.0.quantity')
    bad(calculateUnitPrice({ packages: [{ ...packages[0], unit: 'oz' }, packages[1]] }), 'packages.0.unit')
    for (const people of [[], [bill.people[0]], Array(21).fill(bill.people[0])]) bad(calculateBill({ ...bill, people }), 'people')
    for (const mode of ['', 'weighted', null]) bad(calculateBill({ ...bill, mode }), 'mode')
  })
  it('bounds decimal precision and restricts ordinary change to nonnegative values', () => {
    for (const value of ['', '1e3', 'NaN', 'Infinity', '10000000000000', '1.0000001', null, undefined, 1]) {
      bad(calculatePortion({ value, percent: '15' }), 'value'); bad(calculateRatioPercent({ part: value, whole: '8' }), 'part'); bad(calculatePercentChange({ previous: value, current: '10' }), 'previous')
    }
    for (const percent of ['1.00001', '1000000000', '-1000000000']) bad(calculatePortion({ value: '1', percent }), 'percent')
    bad(calculatePercentChange({ previous: '-1', current: '2' }), 'previous'); bad(calculatePercentChange({ previous: '1', current: '-2' }), 'current')
    for (const engine of [calculateDiscount, calculateUnitPrice, calculateBill, calculatePortion, calculateRatioPercent, calculatePercentChange]) for (const input of [null, undefined, {}, []]) bad(engine(input))
  })
  it('formats domain units precision undefined and signed exact decimal changes', () => {
    expect(formatEveryday(72000n, 'IDR')).toBe('Rp72.000'); expect(formatEveryday(2800n, 'pct2')).toBe('28,00%'); expect(formatEveryday(720000n, 'factor')).toBe('0,720000')
    expect(formatEveryday(300000n, 'number4')).toBe('30,0000'); expect(formatEveryday(-375000n, 'pct4')).toBe('−37,5000%')
    expect(formatEveryday(250000n, 'signed-pct4')).toBe('+25,0000%'); expect(formatEveryday(-1n, 'signed-number6')).toBe('−0,000001')
    expect(formatEveryday(0n, 'number4', 'negative')).toContain('negatif'); expect(formatEveryday(0n, 'signed-pct4', 'positive')).toContain('positif'); expect(formatEveryday(null, 'pct4')).toContain('Tidak terdefinisi')
    expect(formatEveryday(500000n, 'quantity3')).toBe('500')
  })
  it('retains original everyday IDs with twenty tools five hubs and 87 sitemap URLs', () => {
    expect(listPublished()).toHaveLength(81); expect(listCategory('sehari-hari')).toHaveLength(20); expect(listCategoryHubs()).toHaveLength(5); expect(sitemapPaths()).toHaveLength(87)
    for (const [category, count] of [['bisnis', 20], ['marketplace', 11], ['keuangan', 20], ['media-sosial', 10]] as const) expect(listCategory(category)).toHaveLength(count)
    const rows = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(rows).toHaveLength(100); expect(new Set(rows.map(r => r[1])).size).toBe(100); expect(rows.filter(r => r[10] === 'published')).toHaveLength(81)
    for (const slug of ['diskon', 'harga-per-satuan', 'bagi-tagihan', 'persen', 'perubahan-persen']) expect(findPublished(slug)?.id).toBe(`calc-${slug}`)
    for (const slug of ['ppn', 'shopee', 'tiktok-shop', 'pph-final-umkm']) expect(findPublished(slug)).toBeUndefined()
  })
})
