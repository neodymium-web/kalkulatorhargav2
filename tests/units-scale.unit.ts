import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculateScale, calculateLength, calculateMass, calculateTemperature, calculateSpeed, toKelvin, fromKelvin, quantizeSigned, type UnitsResult } from '../lib/units-scale/engines'
import { lengthUnits, massUnits, speedUnits, convertRatio, type TemperatureUnit } from '../lib/units-scale/units'
import { fraction, type Rational } from '../lib/utilities-materials/rational'
import { formatExact, formatUnits } from '../lib/units-scale/format'
import { findPublished, listPublished, listCategory, listCategoryHubs, sitemapPaths } from '../lib/registry'
const ok = (r: UnitsResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: UnitsResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const equal = (r: Rational, n: bigint, d = 1n) => expect(r.n * d).toBe(n * r.d)
const abs = (n: bigint) => n < 0n ? -n : n
const scale = { value: '1', from: 'cm', to: 'm', scale: '100', mode: 'drawing-real' }
const length = { value: '1', from: 'km', to: 'm' }
const mass = { value: '1', from: 'kg', to: 'g' }
const temperature = { value: '0', from: 'C', to: 'F' }
const speed = { distance: '150', distanceUnit: 'km', hours: '2', minutes: '30', seconds: '0', to: 'km/h' }
const max = '9999999999999.999999'
describe('Batch 16 independent reference vectors', () => {
  it('plan scale converts both directions after exact unit normalization', () => {
    const r = ok(calculateScale(scale)); equal(r.exact, 1n); equal(r.base, 1n); expect(r.converted).toBe(1000000n); expect(r.unit).toBe('m'); expect(r.scale).toBe(100n)
    expect(ok(calculateScale({ ...scale, to: 'cm' })).converted).toBe(100000000n)
    const reverse = ok(calculateScale({ value: '2.5', from: 'm', to: 'cm', scale: '50', mode: 'real-drawing' })); equal(reverse.exact, 5n); equal(reverse.base, 1n, 20n); expect(reverse.converted).toBe(5000000n)
    const identity = ok(calculateScale({ ...scale, value: '9.876543', scale: '1', to: 'cm' })); equal(identity.exact, 9876543n, 1000000n); expect(identity.converted).toBe(9876543n)
  })
  it('scale zero tiny maximum and display half-ties use original rational values', () => {
    const zero = ok(calculateScale({ ...scale, value: '0' })); equal(zero.exact, 0n); expect(zero.tiny).toBeUndefined()
    const tie = ok(calculateScale({ value: '1.000001', from: 'm', to: 'm', scale: '2', mode: 'real-drawing' })); equal(tie.exact, 1000001n, 2000000n); expect(tie.converted).toBe(500001n)
    const tiny = ok(calculateScale({ value: '0.000001', from: 'mm', to: 'km', scale: '1000000000', mode: 'real-drawing' })); equal(tiny.exact, 1n, 10n ** 21n); expect(tiny.converted).toBe(0n); expect(tiny.tiny).toBe('positive')
    const big = ok(calculateScale({ value: max, from: 'km', to: 'mm', scale: '1000000000', mode: 'drawing-real' })); equal(big.exact, 9999999999999999999000000000n); expect(big.converted).toBe(9999999999999999999000000000n * 1000000n)
  })
  it('length factors use exact international and metric definitions', () => {
    for (const [value, from, to, n, d, display] of [
      ['1', 'km', 'm', 1000n, 1n, 1000000000n], ['1', 'km', 'cm', 100000n, 1n, 100000000000n],
      ['25.4', 'mm', 'in', 1n, 1n, 1000000n], ['3', 'ft', 'm', 1143n, 1250n, 914400n],
      ['1', 'mi', 'km', 25146n, 15625n, 1609344n], ['0.001', 'mm', 'um', 1n, 1n, 1000000n],
      ['1', 'm', 'in', 5000n, 127n, 39370079n], ['1', 'yd', 'ft', 3n, 1n, 3000000n],
    ] as const) { const r = ok(calculateLength({ value, from, to })); equal(r.exact, n, d); expect(r.converted).toBe(display) }
  })
  it('length tiny zero and magnitudes above safe Number remain exact', () => {
    const r = ok(calculateLength({ value: '0.000001', from: 'um', to: 'km' })); equal(r.exact, 1n, 10n ** 15n); expect(r.tiny).toBe('positive'); expect(r.converted).toBe(0n)
    const big = ok(calculateLength({ value: max, from: 'km', to: 'um' })); equal(big.exact, 9999999999999999999000n); expect(big.converted).toBeGreaterThan(9007199254740991n)
    expect(ok(calculateLength({ ...length, value: '0' })).converted).toBe(0n)
  })
  it('mass uses exact avoirdupois pound ounce and metric tonne factors', () => {
    for (const [value, from, to, n, d, display] of [
      ['1', 'kg', 'g', 1000n, 1n, 1000000000000n], ['1', 'kg', 'mg', 1000000n, 1n, 1000000000000000n],
      ['2.5', 't', 'kg', 2500n, 1n, 2500000000000n], ['1', 'lb', 'g', 45359237n, 100000n, 453592370000n],
      ['16', 'oz', 'lb', 1n, 1n, 1000000000n], ['1', 'oz', 'g', 45359237n, 1600000n, 28349523125n],
      ['1', 'g', 'lb', 100000n, 45359237n, 2204623n],
    ] as const) { const r = ok(calculateMass({ value, from, to })); equal(r.exact, n, d); expect(r.converted).toBe(display); expect(r.digits).toBe(9) }
  })
  it('mass tiny zero and maximum metric conversions do not lose precision', () => {
    const tiny = ok(calculateMass({ value: '0.000001', from: 'ug', to: 't' })); equal(tiny.exact, 1n, 10n ** 18n); expect(tiny.tiny).toBe('positive')
    const big = ok(calculateMass({ value: max, from: 't', to: 'ug' })); equal(big.exact, 9999999999999999999000000n); expect(big.converted).toBeGreaterThan(9007199254740991n)
    const zero = ok(calculateMass({ ...mass, value: '0' })); expect(zero.converted).toBe(0n); expect(zero.tiny).toBeUndefined()
  })
  it('temperature affine conversion enforces absolute zero on exact input', () => {
    for (const [value, from, to, n, d, display] of [
      ['0', 'C', 'F', 32n, 1n, 32000000n], ['0', 'C', 'K', 27315n, 100n, 273150000n],
      ['100', 'C', 'F', 212n, 1n, 212000000n], ['100', 'C', 'K', 37315n, 100n, 373150000n],
      ['-40', 'C', 'F', -40n, 1n, -40000000n], ['98.6', 'F', 'C', 37n, 1n, 37000000n],
      ['-273.15', 'C', 'K', 0n, 1n, 0n], ['-273.15', 'C', 'F', -45967n, 100n, -459670000n],
      ['-459.67', 'F', 'K', 0n, 1n, 0n], ['0', 'K', 'C', -27315n, 100n, -273150000n],
      ['0', 'K', 'F', -45967n, 100n, -459670000n],
    ] as const) { const r = ok(calculateTemperature({ value, from, to })); equal(r.exact, n, d); expect(r.converted).toBe(display); expect(r.base.n).toBeGreaterThanOrEqual(0n) }
  })
  it('temperature below bounds cannot be hidden by identity or output rounding', () => {
    for (const [from, value] of [['C', '-273.150001'], ['F', '-459.670001'], ['K', '-0.000001']] as const) for (const to of ['C', 'F', 'K']) bad(calculateTemperature({ from, to, value }), 'value')
    const c = ok(calculateTemperature({ value: '-273.149999', from: 'C', to: 'K' })); equal(c.exact, 1n, 1000000n); expect(c.converted).toBe(1n)
    const f = ok(calculateTemperature({ value: '-459.669999', from: 'F', to: 'K' })); equal(f.exact, 1n, 1800000n); expect(f.converted).toBe(1n)
    const signedZero = ok(calculateTemperature({ value: '-0.000000', from: 'K', to: 'K' })); expect(signedZero.converted).toBe(0n); expect(signedZero.tiny).toBeUndefined()
  })
  it('temperature negative subprecision and high values preserve sign and exact affine offset', () => {
    const r = ok(calculateTemperature({ value: '-17.777778', from: 'C', to: 'F' })); equal(r.exact, -1n, 2500000n); expect(r.converted).toBe(0n); expect(r.tiny).toBe('negative')
    const big = ok(calculateTemperature({ value: max, from: 'C', to: 'F' })); equal(big.exact, 90000000000159999991n, 5000000n); expect(big.converted).toBeGreaterThan(9007199254740991n)
  })
  it('average speed uses exact elapsed seconds and distance unit factors', () => {
    const r = ok(calculateSpeed(speed)); equal(r.exact, 60n); equal(r.base, 50n, 3n); expect(r.elapsed).toBe(9000000000n); expect(r.converted).toBe(60000000n)
    const sprint = ok(calculateSpeed({ distance: '100', distanceUnit: 'm', hours: '0', minutes: '0', seconds: '9.58', to: 'm/s' })); equal(sprint.exact, 5000n, 479n); expect(sprint.converted).toBe(10438413n); expect(sprint.elapsed).toBe(9580000n)
    expect(ok(calculateSpeed({ distance: '1', distanceUnit: 'km', hours: '0', minutes: '0', seconds: '1', to: 'km/h' })).converted).toBe(3600000000n)
    const mph = ok(calculateSpeed({ distance: '1', distanceUnit: 'mi', hours: '1', minutes: '0', seconds: '0', to: 'mph' })); equal(mph.exact, 1n); expect(mph.converted).toBe(1000000n)
  })
  it('speed zero long-duration tiny max and zero-duration cases are explicit', () => {
    expect(ok(calculateSpeed({ ...speed, distance: '0' })).converted).toBe(0n)
    const long = ok(calculateSpeed({ ...speed, hours: '90', minutes: '0' })); equal(long.exact, 5n, 3n); expect(long.converted).toBe(1666667n)
    const tiny = ok(calculateSpeed({ distance: '0.000001', distanceUnit: 'm', hours: '999999999', minutes: '59', seconds: '59.999999', to: 'm/s' })); equal(tiny.exact, 1n, 3599999999999999999n); expect(tiny.tiny).toBe('positive')
    const big = ok(calculateSpeed({ distance: max, distanceUnit: 'km', hours: '0', minutes: '0', seconds: '0.000001', to: 'm/s' })); equal(big.exact, 9999999999999999999000n)
    bad(calculateSpeed({ ...speed, distance: '0', hours: '0', minutes: '0', seconds: '0' }), 'seconds')
  })
})
describe('exact inverse and quantization invariants', () => {
  it('all length and mass unit pairs preserve identity roundtrip and transitivity before display', () => {
    const samples = [fraction(0n), fraction(1n, 1000000n), fraction(127n, 5n), fraction(1n, 3n), fraction(9999999999999999999n, 1000000n)]
    for (const units of [Object.values(lengthUnits), Object.values(massUnits)]) for (const a of units) for (const b of units) for (const x of samples) {
      const y = convertRatio(x, a, b), back = convertRatio(y, b, a); equal(back, x.n, x.d); equal(convertRatio(x, a, a), x.n, x.d)
      const c = units[units.length - 1], via = convertRatio(y, b, c), direct = convertRatio(x, a, c); equal(via, direct.n, direct.d)
      expect(y.d).toBeGreaterThan(0n)
    }
  })
  it('scale multiply divide inverses and units normalize independently of formatted values', () => {
    for (const n of ['1', '2', '50', '1000000000']) for (const from of ['mm', 'cm', 'm', 'km'] as const) for (const to of ['mm', 'cm', 'm', 'km'] as const) for (const value of ['0', '0.000001', '2.5', max]) {
      const a = ok(calculateScale({ value, from, to, scale: n, mode: 'drawing-real' })), b = ok(calculateScale({ value, from, to, scale: n, mode: 'real-drawing' }))
      const normal = convertRatio(fraction(BigInt(value.replace('.', '').padEnd(value.includes('.') ? value.replace('.', '').length + 6 - value.split('.')[1].length : value.length + 6, '0')), 1000000n), lengthUnits[from], lengthUnits[to])
      equal(a.exact, normal.n * BigInt(n), normal.d); equal(b.exact, normal.n, normal.d * BigInt(n))
      const inverse = convertRatio({ n: a.exact.n, d: a.exact.d * BigInt(n) }, lengthUnits[to], lengthUnits[from]); equal(inverse, normal.n * lengthUnits[to].factor.n * lengthUnits[from].factor.d, normal.d * lengthUnits[to].factor.d * lengthUnits[from].factor.n)
    }
  })
  it('temperature affine inverse and three-scale consistency hold at rational precision', () => {
    const sources: Record<TemperatureUnit, string[]> = { C: ['-273.15', '-273.149999', '-40', '-17.777778', '0', '100', max], F: ['-459.67', '-459.669999', '-40', '32', '98.6', max], K: ['0', '0.000001', '273.15', max] }
    for (const from of ['C', 'F', 'K'] as const) for (const value of sources[from]) for (const to of ['C', 'F', 'K'] as const) {
      const r = ok(calculateTemperature({ value, from, to })), input = fromKelvin(r.base, from), back = toKelvin(r.exact, to)
      equal(back, r.base.n, r.base.d); equal(fromKelvin(toKelvin(input, from), from), input.n, input.d)
      for (const third of ['C', 'F', 'K'] as const) { const direct = fromKelvin(r.base, third), indirect = fromKelvin(toKelvin(r.exact, to), third); equal(direct, indirect.n, indirect.d) }
      expect(r.base.n).toBeGreaterThanOrEqual(0n)
    }
  })
  it('signed quantization has bounded error odd symmetry and away-from-zero ties', () => {
    for (const digits of [6, 9]) for (const n of [-9999999999999999999n, -37n, -1n, 0n, 1n, 37n, 9999999999999999999n]) for (const d of [1n, 3n, 9n, 2000000n, 2000000000n, 10n ** 30n]) {
      const x = fraction(n, d), q = quantizeSigned(x, digits)
      expect(abs(q * x.d - x.n * 10n ** BigInt(digits)) * 2n).toBeLessThanOrEqual(x.d)
      expect(quantizeSigned(fraction(-n, d), digits)).toBe(-q)
    }
    expect(quantizeSigned(fraction(1n, 2000000n), 6)).toBe(1n); expect(quantizeSigned(fraction(-1n, 2000000n), 6)).toBe(-1n)
  })
  it('speed target units share one exact m/s quantity and elapsed scale', () => {
    for (const distance of ['0', '0.000001', '100', max]) for (const distanceUnit of ['m', 'km', 'mi']) for (const seconds of ['0.000001', '9.58', '59.999999']) for (const to of ['m/s', 'km/h', 'mph'] as const) {
      const r = ok(calculateSpeed({ distance, distanceUnit, hours: '0', minutes: '0', seconds, to })), restored = convertRatio(r.exact, speedUnits[to], speedUnits['m/s'])
      equal(restored, r.base.n, r.base.d); expect(abs(r.converted * r.exact.d - r.exact.n * 1000000n) * 2n).toBeLessThanOrEqual(r.exact.d)
    }
    const a = ok(calculateSpeed({ ...speed, hours: '1', minutes: '0', seconds: '0' })), b = ok(calculateSpeed({ ...speed, distance: '300', hours: '2', minutes: '0', seconds: '0' })); equal(a.exact, b.exact.n, b.exact.d)
  })
  it('rounded inch display is deliberately not reused as the exact reverse input', () => {
    const original = ok(calculateLength({ value: '1', from: 'm', to: 'in' })), backExact = convertRatio(original.exact, lengthUnits.in, lengthUnits.m)
    equal(backExact, 1n)
    const copiedDisplay = ok(calculateLength({ value: '39.370079', from: 'in', to: 'm' })); expect(copiedDisplay.exact.n).not.toBe(copiedDisplay.exact.d)
  })
})
describe('strict validation format and catalog', () => {
  it.each(['', '-1', 'NaN', 'Infinity', '1e3', '1.0000001', '10000000000000', '1,000,000', '+1'])('rejects malformed physical input %s', value => {
    bad(calculateScale({ ...scale, value }), 'value'); bad(calculateLength({ ...length, value }), 'value'); bad(calculateMass({ ...mass, value }), 'value'); bad(calculateSpeed({ ...speed, distance: value }), 'distance')
  })
  it('temperature permits signed values but rejects malformed and over-precision inputs', () => {
    for (const value of ['', 'NaN', 'Infinity', '1e3', '1.0000001', '10000000000000', '--1', '−1', '+1']) bad(calculateTemperature({ ...temperature, value }), 'value')
    expect(ok(calculateTemperature({ ...temperature, value: '-40' })).converted).toBe(-40000000n)
  })
  it('scale requires bounded positive integer N and recognized metric units and mode', () => {
    for (const value of ['0', '-1', '1.5', '1000000001', '', 'NaN', '1e3']) bad(calculateScale({ ...scale, scale: value }), 'scale')
    bad(calculateScale({ ...scale, mode: 'area' }), 'mode'); bad(calculateScale({ ...scale, from: 'in' }), 'from')
  })
  it('unit families unsupported force troy survey and unknown units are rejected', () => {
    for (const key of ['from', 'to']) { bad(calculateLength({ ...length, [key]: 'kg' }), key); bad(calculateMass({ ...mass, [key]: 'N' }), key); bad(calculateTemperature({ ...temperature, [key]: 'R' }), key) }
    bad(calculateLength({ ...length, from: 'survey-ft' }), 'from'); bad(calculateMass({ ...mass, from: 'oz-troy' }), 'from'); bad(calculateSpeed({ ...speed, distanceUnit: 'ft' }), 'distanceUnit'); bad(calculateSpeed({ ...speed, to: 'knots' }), 'to')
  })
  it('duration validates all components without a hidden 24-hour cap', () => {
    for (const hours of ['-1', '1000000000', '1.5', '', 'NaN']) bad(calculateSpeed({ ...speed, hours }), 'hours')
    for (const minutes of ['-1', '60', '1.5', '', 'NaN']) bad(calculateSpeed({ ...speed, minutes }), 'minutes')
    for (const seconds of ['-1', '60', '59.9999999', '', 'NaN', 'Infinity']) bad(calculateSpeed({ ...speed, seconds }), 'seconds')
    bad(calculateSpeed({ ...speed, hours: '0', minutes: '0', seconds: '0' }), 'seconds')
    expect(ok(calculateSpeed({ ...speed, hours: '999999999', minutes: '59', seconds: '59.999999' })).elapsed).toBe(3599999999999999999n)
  })
  it('null numeric missing payloads and invalid refinements return field errors without exceptions', () => {
    for (const engine of [calculateScale, calculateLength, calculateMass, calculateTemperature, calculateSpeed]) for (const input of [null, undefined, {}, [], 0, '']) bad(engine(input))
    bad(calculateTemperature({ ...temperature, value: null }), 'value'); bad(calculateTemperature({ ...temperature, from: 'invalid' }), 'from'); bad(calculateSpeed({ ...speed, seconds: null }), 'seconds'); bad(calculateLength({ ...length, value: 1 }), 'value')
  })
  it('formats exact fractions signed zero and tiny intervals without floating-point', () => {
    expect(formatUnits(10438413n, 6, 'm/s')).toBe('10,438413 m/s'); expect(formatUnits(28349523125n, 9, 'g')).toBe('28,349523125 g'); expect(formatUnits(-40000000n, 6, '°F')).toBe('−40,000000 °F')
    expect(formatUnits(0n, 6, 'K')).toBe('0,000000 K'); expect(formatUnits(0n, 6, '°F', 'negative')).toBe('Antara −0,000001 °F dan 0 °F (negatif)'); expect(formatUnits(0n, 9, 't', 'positive')).toBe('<0,000000001 t (positif)')
    expect(formatExact(fraction(5000n, 479n), 'm/s')).toBe('5000/479 m/s'); expect(formatExact(fraction(-45967n, 100n), '°F')).toBe('−45967/100 °F'); expect(formatExact(fraction(60n), 'km/h')).toBe('60 km/h')
  })
  it('publishes five existing IDs finishing twenty everyday tools and 87 sitemap URLs', () => {
    expect(listPublished()).toHaveLength(86); expect(listCategory('sehari-hari')).toHaveLength(20); expect(listCategoryHubs()).toHaveLength(5); expect(sitemapPaths()).toHaveLength(92)
    for (const slug of ['skala-denah', 'konversi-panjang', 'konversi-berat', 'konversi-suhu', 'kecepatan-rata-rata']) expect(findPublished(slug)?.id).toBe(`calc-${slug}`)
    for (const slug of ['ppn', 'shopee', 'tiktok-shop', 'pph-final-umkm', 'pph-21-bulanan']) expect(findPublished(slug)).toBeUndefined()
    const rows = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(rows).toHaveLength(100); expect(new Set(rows.map(r => r[1])).size).toBe(100); expect(rows.filter(r => r[10] === 'published')).toHaveLength(86)
  })
})
