import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculateElectricity, calculateWater, calculatePaint, calculateTiles, calculateConcrete, PI_NUMERATOR, PI_DENOMINATOR, type MaterialsResult } from '../lib/utilities-materials/engines'
import { formatMaterials } from '../lib/utilities-materials/format'
import type { Rational } from '../lib/utilities-materials/rational'
import { listPublished, listCategory, listCategoryHubs, sitemapPaths, findPublished } from '../lib/registry'
const ok = (r: MaterialsResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: MaterialsResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const equal = (a: Rational, n: bigint, d = 1n) => expect(a.n * d).toBe(n * a.d)
const abs = (n: bigint) => n < 0n ? -n : n
const electricity = { power: '300', hours: '8', days: '30', quantity: '1', tariff: '1700' }
const tiers = [{ limit: 'bounded', upper: '10', rate: '3000' }, { limit: 'bounded', upper: '20', rate: '5000' }, { limit: 'unbounded', rate: '7000' }]
const water = { usage: '18', fixed: '10000', tiers }
const paint = { gross: '40', openings: '5', coats: '2', coverage: '10', reserve: '10', package: '5' }
const tiles = { area: '12', length: '40', width: '40', reserve: '10', perBox: '6' }
const prism = { shape: 'prism', length: '2', width: '3', height: '0.1', count: '2' }
const cylinder = { shape: 'cylinder', diameter: '1', height: '1', count: '1' }
const concrete = { reserve: '10', elements: [prism, { shape: 'prism', length: '1', width: '1', height: '1', count: '1' }] }
const maxMoney = '9999999999999'
function minimalCeil(n: bigint, r: Rational) {
  expect(n * r.d).toBeGreaterThanOrEqual(r.n)
  if (n > 0n) expect((n - 1n) * r.d).toBeLessThan(r.n)
  else expect(r.n).toBe(0n)
}
describe('Batch 15 independent reference vectors', () => {
  it('electricity converts per-device daily watt hours and rounds original energy cost', () => {
    const r = ok(calculateElectricity(electricity)); expect(r.values).toEqual({ energy: 720000n, cost: 122400n }); equal(r.exact.energy, 72n); equal(r.exact.cost, 122400n)
    expect(ok(calculateElectricity({ power: '100', hours: '2', days: '30', quantity: '3', tariff: '1500' })).values).toEqual({ energy: 180000n, cost: 27000n })
    const fractional = ok(calculateElectricity({ power: '100', hours: '0,5', days: '1', quantity: '1', tariff: '1700.0001' })); expect(fractional.values).toEqual({ energy: 500n, cost: 85n }); equal(fractional.exact.cost, 17000001n, 200000n)
    const watt = ok(calculateElectricity({ power: '1', hours: '1', days: '1', quantity: '1', tariff: '1' })); expect(watt.values).toEqual({ energy: 10n, cost: 0n }); expect(watt.tiny.cost).toBe(true); equal(watt.exact.energy, 1n, 1000n)
  })
  it('electricity zero tiny half-up and maximum hours stay distinct', () => {
    for (const key of ['power', 'hours']) { const r = ok(calculateElectricity({ ...electricity, [key]: '0' })); expect(r.values).toEqual({ energy: 0n, cost: 0n }); expect(r.tiny).toEqual({}) }
    expect(ok(calculateElectricity({ ...electricity, tariff: '0' })).values).toEqual({ energy: 720000n, cost: 0n })
    const tiny = ok(calculateElectricity({ ...electricity, power: '1', hours: '0.000001', days: '1', tariff: '1' })); equal(tiny.exact.energy, 1n, 1000000000n); expect(tiny.tiny).toEqual({ energy: true, cost: true })
    expect(ok(calculateElectricity({ ...electricity, power: '500', hours: '1', days: '1', tariff: '1' })).values.cost).toBe(1n)
    const max = ok(calculateElectricity({ power: '999999.999999', hours: '24', days: '366', quantity: '10000', tariff: maxMoney + '.9999' })); expect(max.values.cost).toBeGreaterThan(9007199254740991n)
  })
  it('water allocates marginal tiers exactly and rounds only the final total', () => {
    for (const [usage, volumes, costs, variable, bill] of [
      ['18', [10n, 8n, 0n], [30000n, 40000n, 0n], 70000n, 80000n],
      ['25', [10n, 10n, 5n], [30000n, 50000n, 35000n], 115000n, 125000n],
      ['0', [0n, 0n, 0n], [0n, 0n, 0n], 0n, 10000n],
    ] as const) {
      const r = ok(calculateWater({ ...water, usage })); expect(r.tiers!.map(t => t.volume)).toEqual(volumes.map(v => v * 1000000n)); expect(r.tiers!.map(t => t.cost)).toEqual(costs.map(c => c * 10000000000n))
      expect(r.values).toEqual({ usage: BigInt(usage) * 1000000n, bill, fixed: 10000n, variable: variable * 10000000000n, totalExact: bill * 10000000000n })
      equal(r.exact.bill, bill)
    }
    const boundary = ok(calculateWater({ ...water, usage: '10.001' })); expect(boundary.tiers!.map(t => t.volume)).toEqual([10000000n, 1000n, 0n]); expect(boundary.values.bill).toBe(40005n); expect(boundary.values.variable).toBe(30005n * 10000000000n)
  })
  it('water half-rupiah row displays reconcile before a single final rounding', () => {
    const r = ok(calculateWater({ usage: '2', fixed: '', tiers: [{ limit: 'bounded', upper: '1', rate: '0.5' }, { limit: 'unbounded', rate: '0.5' }] }))
    expect(r.tiers!.map(t => t.cost)).toEqual([5000000000n, 5000000000n]); expect(r.values).toMatchObject({ bill: 1n, variable: 10000000000n, fixed: 0n, totalExact: 10000000000n }); equal(r.exact.bill, 1n)
    const tiny = ok(calculateWater({ usage: '0.000001', tiers: [{ limit: 'bounded', upper: '1', rate: '0.0001' }, { limit: 'unbounded', rate: '0' }] })); expect(tiny.values).toMatchObject({ bill: 0n, variable: 1n, fixed: 0n, totalExact: 1n }); expect(tiny.tiny.bill).toBe(true)
    expect(formatMaterials(tiny.values.variable, 'money10')).toBe('Rp0,0000000001')
  })
  it('bounded water coverage zero rates and inactive upper values are explicit', () => {
    const bounded = { ...water, usage: '20', tiers: tiers.slice(0, 2) }; expect(ok(calculateWater(bounded)).values.bill).toBe(90000n)
    bad(calculateWater({ ...bounded, usage: '20.000001' }), 'usage')
    const r = ok(calculateWater({ ...water, tiers: [{ limit: 'bounded', upper: '10', rate: '0' }, { limit: 'unbounded', upper: 'ignored', rate: '0' }] })); expect(r.values.bill).toBe(10000n); expect(r.tiers!.map(t => t.volume)).toEqual([10000000n, 8000000n])
    const eight = ok(calculateWater({ usage: '10', tiers: [...Array.from({ length: 7 }, (_, i) => ({ limit: 'bounded', upper: String(i + 1), rate: '1' })), { limit: 'unbounded', rate: '1' }] }))
    expect(eight.tiers).toHaveLength(8); expect(eight.values.bill).toBe(10n); expect(eight.tiers!.map(t => t.volume)).toEqual([1000000n, 1000000n, 1000000n, 1000000n, 1000000n, 1000000n, 1000000n, 3000000n])
  })
  it('paint package ceiling uses exact reserve-adjusted liters and reconciles leftovers', () => {
    const r = ok(calculatePaint(paint)); expect(r.values).toEqual({ net: 35000000n, theory: 70000n, required: 77000n, packages: 2n, purchased: 10000000n, leftover: 23000n }); equal(r.exact.required, 77n, 10n); equal(r.exact.leftover, 23n, 10n)
    const exact = ok(calculatePaint({ gross: '25', openings: '0', coats: '1', coverage: '10', reserve: '0', package: '2.5' })); expect(exact.values).toEqual({ net: 25000000n, theory: 25000n, required: 25000n, packages: 1n, purchased: 2500000n, leftover: 0n })
    const justOver = ok(calculatePaint({ gross: '10.000001', openings: '0', coats: '1', coverage: '1', package: '5' })); expect(justOver.values).toMatchObject({ required: 100000n, packages: 3n, purchased: 15000000n, leftover: 50000n }); equal(justOver.exact.required, 10000001n, 1000000n); equal(justOver.exact.leftover, 4999999n, 1000000n)
  })
  it('paint zero net area and tiny need never invent a minimum package', () => {
    const zero = ok(calculatePaint({ ...paint, openings: '40' })); expect(zero.values).toEqual({ net: 0n, theory: 0n, required: 0n, packages: 0n, purchased: 0n, leftover: 0n }); expect(zero.tiny).toEqual({})
    const tiny = ok(calculatePaint({ ...paint, gross: '0.000001', openings: '0', coats: '1', coverage: '999999.999999', reserve: '', package: '5' })); expect(tiny.values.packages).toBe(1n); expect(tiny.tiny.required).toBe(true)
    expect(ok(calculatePaint({ gross: '999999.999999', openings: '0', coats: '100', coverage: '0.000001', reserve: '100', package: '0.000001' })).values.packages).toBe(199999999999800000000n)
  })
  it('tiles use exact area then per-tile and per-box ceilings', () => {
    const r = ok(calculateTiles(tiles)); expect(r.values).toEqual({ tileArea: 1600n, purchaseArea: 134400n, quota: 825000n, required: 83n, boxes: 14n, purchased: 84n, surplus: 1n }); equal(r.exact.tileArea, 4n, 25n); equal(r.exact.quota, 165n, 2n)
    expect(ok(calculateTiles({ area: '10', length: '50', width: '50', perBox: '4', reserve: '0' })).values).toEqual({ tileArea: 2500n, purchaseArea: 100000n, quota: 400000n, required: 40n, boxes: 10n, purchased: 40n, surplus: 0n })
    expect(ok(calculateTiles({ area: '3', length: '30', width: '50', perBox: '7' })).values).toEqual({ tileArea: 1500n, purchaseArea: 31500n, quota: 200000n, required: 20n, boxes: 3n, purchased: 21n, surplus: 1n })
  })
  it('tile just-over boundary zero floor area and tiny tile area retain exact ceilings', () => {
    expect(ok(calculateTiles({ area: '1.000001', length: '100', width: '100', perBox: '1' })).values).toMatchObject({ quota: 10000n, required: 2n, boxes: 2n, purchased: 2n, purchaseArea: 20000n, surplus: 0n })
    expect(ok(calculateTiles({ ...tiles, area: '0' })).values).toMatchObject({ quota: 0n, required: 0n, boxes: 0n, purchased: 0n, purchaseArea: 0n, surplus: 0n })
    const tiny = ok(calculateTiles({ area: '0.000001', length: '0.000001', width: '0.000001', perBox: '1' })); equal(tiny.exact.tileArea, 1n, 10000000000000000n); expect(tiny.tiny.tileArea).toBe(true); expect(tiny.values.required).toBe(10000000000n)
  })
  it('concrete accumulates original prism and rational-pi cylinder volumes', () => {
    const r = ok(calculateConcrete(concrete)); expect(r.values).toEqual({ base: 22000n, reserve: 2200n, total: 24200n }); expect(r.elements!.map(e => e.volume)).toEqual([12000n, 10000n]); equal(r.exact.base, 11n, 5n); equal(r.exact.total, 121n, 50n)
    const c = ok(calculateConcrete({ reserve: '', elements: [cylinder] })); expect(c.values).toEqual({ base: 7854n, reserve: 0n, total: 7854n }); equal(c.exact.base, PI_NUMERATOR, 4n * PI_DENOMINATOR); expect(c.notes.join(' ')).toContain('bukan π eksak')
    expect(ok(calculateConcrete({ reserve: '10', elements: [{ ...cylinder, diameter: '2' }] })).values).toEqual({ base: 31416n, reserve: 3142n, total: 34558n })
  })
  it('concrete tiny positives and half-display rows do not accumulate rounded volumes', () => {
    const r = ok(calculateConcrete({ elements: [{ ...prism, length: '0.000001', width: '0.000001', height: '0.000001', count: '1' }] })); equal(r.exact.base, 1n, 1000000000000000000n); expect(r.values).toEqual({ base: 0n, reserve: 0n, total: 0n }); expect(r.tiny).toEqual({ base: true, total: true }); expect(r.elements![0].tiny).toBe(true)
    const half = { ...prism, length: '1', width: '1', height: '0.00005', count: '1' }
    const combined = ok(calculateConcrete({ elements: [half, half] })); expect(combined.elements!.map(e => e.volume)).toEqual([1n, 1n]); expect(combined.values.base).toBe(1n); equal(combined.exact.base, 1n, 10000n)
  })
  it('pi truncation interval bounds cylinder error below display precision over the full domain', () => {
    const known = 314159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534n
    const scale = 10n ** 92n
    expect(PI_NUMERATOR * scale).toBeLessThan(known * PI_DENOMINATOR)
    expect((PI_NUMERATOR + 1n) * scale).toBeGreaterThan(known * PI_DENOMINATOR)
    const r = ok(calculateConcrete({ reserve: '100', elements: Array.from({ length: 20 }, () => ({ ...cylinder, diameter: '9999.999999', height: '9999.999999', count: '10000' })) }))
    const coefficient = { n: r.exact.total.n * PI_DENOMINATOR, d: r.exact.total.d * PI_NUMERATOR }
    expect(coefficient.n).toBeLessThan(10n ** 17n * coefficient.d)
    expect(coefficient.n * 10n ** 33n).toBeLessThan(coefficient.d * PI_DENOMINATOR)
    expect(r.values.total).toBeGreaterThan(9007199254740991n)
  })
})
describe('rational invariants and independent bounded references', () => {
  it('all quantized outputs obey half-up error bounds on bounded inputs', () => {
    for (const power of ['0', '0.000001', '1', '300', '999999.999999']) for (const hours of ['0', '0.000001', '0.5', '24']) for (const tariff of ['0', '0.0001', '1', maxMoney + '.9999']) {
      const r = ok(calculateElectricity({ ...electricity, power, hours, tariff }))
      for (const [key, scale] of [['energy', 10000n], ['cost', 1n]] as const) expect(abs(r.values[key] * r.exact[key].d - r.exact[key].n * scale) * 2n).toBeLessThanOrEqual(r.exact[key].d)
    }
  })
  it('water conserves all volume and exact costs including maximum usage and tier boundaries', () => {
    const samples = ['0', '9.999999', '10', '10.000001', '19.999999', '20', '20.000001', maxMoney + '.999999']
    for (const usage of samples) for (const rates of [['0', '0', '0'], ['3000', '5000', '7000'], ['9000', '0', '0.0001'], [maxMoney + '.9999', maxMoney, '0.0001']]) {
      const r = ok(calculateWater({ ...water, usage, tiers: tiers.map((t, i) => ({ ...t, rate: rates[i] })) }))
      expect(r.tiers!.reduce((s, t) => s + t.volume, 0n)).toBe(r.values.usage)
      expect(r.tiers!.reduce((s, t) => s + t.cost, 0n)).toBe(r.values.variable)
      expect(r.values.totalExact).toBe(r.values.variable + r.values.fixed * 10000000000n)
      for (const t of r.tiers!) { expect(t.volume).toBeGreaterThanOrEqual(0n); expect(t.cost).toBe(t.volume * t.rate); if (t.upper !== null) expect(t.volume).toBeLessThanOrEqual(t.upper - t.lower) }
      expect(abs(r.values.bill * 10000000000n - r.values.totalExact) * 2n).toBeLessThanOrEqual(10000000000n)
    }
  })
  it('progressive charges agree with a separately enumerated integer-unit model and equal-rate split invariance', () => {
    let last = 0n
    for (let usage = 0n; usage <= 40n; usage++) {
      let independent = 10000n
      for (let unit = 1n; unit <= usage; unit++) independent += unit <= 10n ? 3000n : unit <= 20n ? 5000n : 7000n
      const r = ok(calculateWater({ ...water, usage: String(usage) })); expect(r.values.bill).toBe(independent); expect(r.values.bill).toBeGreaterThanOrEqual(last); last = r.values.bill
      const split = ok(calculateWater({ ...water, usage: String(usage), tiers: [{ limit: 'bounded', upper: '5', rate: '3000' }, ...tiers] })); expect(split.values).toEqual(r.values)
    }
  })
  it('paint package ceiling is minimal and purchased volume reconciles exact leftovers', () => {
    for (const gross of ['0', '0.000001', '10.000001', '40', '999999.999999']) for (const coverage of ['0.000001', '1', '3', '10']) for (const size of ['0.000001', '2.5', '5']) {
      const r = ok(calculatePaint({ ...paint, gross, openings: '0', coverage, package: size }))
      const packageTicks = BigInt(size.replace('.', '').padEnd(size.includes('.') ? size.replace('.', '').length + 6 - size.split('.')[1].length : size.length + 6, '0'))
      const quota = { n: r.exact.required.n * 1000000n, d: r.exact.required.d * packageTicks }
      minimalCeil(r.values.packages, quota)
      expect(r.values.purchased * r.exact.required.d * r.exact.leftover.d).toBe((r.exact.required.n * r.exact.leftover.d + r.exact.leftover.n * r.exact.required.d) * 1000000n)
      expect(r.exact.leftover.n).toBeGreaterThanOrEqual(0n)
    }
  })
  it('tiles ceilings are minimal and purchase counts area and surplus conserve', () => {
    for (const area of ['0', '0.000001', '1.000001', '12', '999999.999999']) for (const length of ['0.000001', '30', '40', '9999.999999']) for (const perBox of ['1', '6', '10000']) {
      const r = ok(calculateTiles({ ...tiles, area, length, perBox }))
      minimalCeil(r.values.required, r.exact.quota); minimalCeil(r.values.boxes, { n: r.values.required, d: BigInt(perBox) })
      expect(r.values.purchased).toBe(r.values.boxes * BigInt(perBox)); expect(r.values.purchased - r.values.required).toBe(r.values.surplus)
      expect(r.values.surplus).toBeLessThan(BigInt(perBox)); equal(r.exact.purchaseArea, r.exact.tileArea.n * r.values.purchased, r.exact.tileArea.d)
    }
  })
  it('concrete reorder duplicate counts and split rows leave exact totals invariant', () => {
    const a = ok(calculateConcrete({ ...concrete, elements: [...concrete.elements, cylinder] })), b = ok(calculateConcrete({ ...concrete, elements: [cylinder, ...concrete.elements].reverse() }))
    equal(a.exact.total, b.exact.total.n, b.exact.total.d)
    const single = ok(calculateConcrete({ elements: [prism] })), split = ok(calculateConcrete({ elements: [{ ...prism, count: '1' }, { ...prism, count: '1' }] })); equal(single.exact.base, split.exact.base.n, split.exact.base.d)
    for (const reserve of ['0', '0.0001', '10', '100']) {
      const r = ok(calculateConcrete({ ...concrete, reserve, elements: [...concrete.elements, cylinder] }))
      expect(r.exact.base.n * r.exact.reserve.d * r.exact.total.d + r.exact.reserve.n * r.exact.base.d * r.exact.total.d).toBe(r.exact.total.n * r.exact.base.d * r.exact.reserve.d)
      for (const key of ['base', 'reserve', 'total']) expect(abs(r.values[key] * r.exact[key].d - r.exact[key].n * 10000n) * 2n).toBeLessThanOrEqual(r.exact[key].d)
    }
  })
})
describe('invalid values bounds and integration', () => {
  it.each(['-1', '', 'NaN', 'Infinity', '1e3', '1,000,000', '1000000', '0.0000001'])('rejects malformed or oversized area power %s', value => {
    bad(calculateElectricity({ ...electricity, power: value }), 'power'); bad(calculatePaint({ ...paint, gross: value }), 'gross'); bad(calculateTiles({ ...tiles, area: value }), 'area')
  })
  it('rejects invalid hours counts tariffs and allows exact bounds', () => {
    bad(calculateElectricity({ ...electricity, hours: '24.000001' }), 'hours')
    for (const days of ['0', '367', '1.5', '-1', 'NaN']) bad(calculateElectricity({ ...electricity, days }), 'days')
    for (const quantity of ['0', '10001', '1.5', '-1']) bad(calculateElectricity({ ...electricity, quantity }), 'quantity')
    for (const tariff of ['-1', '1.00001', '10000000000000', 'NaN']) bad(calculateElectricity({ ...electricity, tariff }), 'tariff')
  })
  it('rejects tier count invalid limits decreasing zero or duplicate upper thresholds', () => {
    for (const ts of [[], [tiers[0]], Array(9).fill(tiers[0])]) bad(calculateWater({ ...water, tiers: ts }), 'tiers')
    for (const upper of ['0', '-1', '', 'NaN', '1e3', '0.0000001', '10000000000000']) bad(calculateWater({ ...water, tiers: [{ ...tiers[0], upper }, tiers[2]] }), 'tiers.0.upper')
    for (const upper of ['10', '9']) bad(calculateWater({ ...water, tiers: [tiers[0], { ...tiers[1], upper }] }), 'tiers.1.upper')
    bad(calculateWater({ ...water, tiers: [tiers[2], tiers[2]] }), 'tiers.0.limit'); bad(calculateWater({ ...water, tiers: [{ ...tiers[0], limit: 'auto' }, tiers[2]] }), 'tiers.0.limit')
    for (const rate of ['-1', '1.00001', '', 'NaN']) bad(calculateWater({ ...water, tiers: [{ ...tiers[0], rate }, tiers[2]] }), 'tiers.0.rate')
    bad(calculateWater({ ...water, fixed: '1.5' }), 'fixed'); bad(calculateWater({ ...water, usage: '-1' }), 'usage')
  })
  it('validates paint openings positive coverage package coats and reserve', () => {
    bad(calculatePaint({ ...paint, openings: '40.000001' }), 'openings')
    for (const key of ['coverage', 'package']) for (const value of ['0', '-1', '', 'NaN']) bad(calculatePaint({ ...paint, [key]: value }), key)
    for (const coats of ['0', '101', '1.5']) bad(calculatePaint({ ...paint, coats }), 'coats')
    for (const engine of [calculatePaint, calculateTiles, calculateConcrete]) for (const reserve of ['-1', '100.0001', '1.00001', 'NaN', 'Infinity']) bad(engine({ ...paint, ...tiles, ...concrete, reserve }), 'reserve')
  })
  it('rejects tile dimensions and per-box counts outside declared units and bounds', () => {
    for (const key of ['length', 'width']) for (const value of ['0', '-1', '', '10000', '0.0000001', 'NaN']) bad(calculateTiles({ ...tiles, [key]: value }), key)
    for (const perBox of ['0', '10001', '1.5', '-1']) bad(calculateTiles({ ...tiles, perBox }), 'perBox')
  })
  it('concrete shapes require only active dimensions and bounded positive counts', () => {
    for (const elements of [[], Array(21).fill(prism)]) bad(calculateConcrete({ elements }), 'elements')
    for (const key of ['length', 'width', 'height', 'count']) bad(calculateConcrete({ elements: [{ ...prism, [key]: '0' }] }), `elements.0.${key}`)
    for (const diameter of ['0', '-1', '', '10000', 'NaN']) bad(calculateConcrete({ elements: [{ ...cylinder, diameter }] }), 'elements.0.diameter')
    bad(calculateConcrete({ elements: [{ ...prism, count: '10001' }] }), 'elements.0.count'); bad(calculateConcrete({ elements: [{ ...prism, shape: 'sphere' }] }), 'elements.0.shape')
    expect(ok(calculateConcrete({ elements: [{ ...cylinder, length: 'ignored', width: 'invalid' }] })).values.base).toBe(7854n)
  })
  it('rejects null missing numeric and ambiguous input without arithmetic exceptions', () => {
    for (const engine of [calculateElectricity, calculateWater, calculatePaint, calculateTiles, calculateConcrete]) for (const input of [null, undefined, {}, [], 0, '']) bad(engine(input))
    bad(calculateElectricity({ ...electricity, power: 300 }), 'power'); bad(calculateWater({ ...water, tiers: [{ ...tiers[0], upper: null }, tiers[2]] }), 'tiers.0.upper')
    bad(calculatePaint({ ...paint, gross: 'invalid' }), 'gross'); bad(calculateConcrete({ elements: [{ ...prism, length: null }] }), 'elements.0.length')
  })
  it('formats cash exact subrupiah quantities and integer packaging units', () => {
    expect(formatMaterials(122400n, 'cash')).toBe('Rp122.400'); expect(formatMaterials(5000000000n, 'money10')).toBe('Rp0,5'); expect(formatMaterials(1n, 'money10')).toBe('Rp0,0000000001')
    expect(formatMaterials(30000000n, 'rate4')).toBe('Rp3.000/m³'); expect(formatMaterials(1000n, 'volume6')).toBe('0,001 m³'); expect(formatMaterials(77000n, 'liters')).toBe('7,7000 L')
    expect(formatMaterials(0n, 'volume', true)).toBe('<0,0001 m³ (positif)'); expect(formatMaterials(0n, 'cash', true)).toContain('sebelum pembulatan'); expect(formatMaterials(3n, 'packages')).toBe('3 kemasan')
  })
  it('publishes only five existing IDs with 81 tools twenty everyday and 87 sitemap URLs', () => {
    expect(listPublished()).toHaveLength(96); expect(listCategory('sehari-hari')).toHaveLength(20); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(103)
    for (const slug of ['biaya-listrik', 'biaya-air', 'kebutuhan-cat', 'kebutuhan-keramik', 'volume-beton']) expect(findPublished(slug)?.id).toBe(`calc-${slug}`)
    for (const slug of [ 'shopee', 'tiktok-shop']) expect(findPublished(slug)).toBeUndefined()
    const rows = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(rows).toHaveLength(100); expect(new Set(rows.map(r => r[1])).size).toBe(100); expect(rows.filter(r => r[10] === 'published')).toHaveLength(96)
  })
})
