import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { addMonthsClamped, civilString, daysInMonth, isLeap, ordinal, parseCivil, weekday } from '../lib/calendar-time/civil'
import { calculateDateDifference, calculateWorkdays, calculateAge, calculateShift, calculateFuel, type CalendarResult } from '../lib/calendar-time/engines'
import { formatCalendar } from '../lib/calendar-time/format'
import { findPublished, listPublished, listCategory, listCategoryHubs, sitemapPaths } from '../lib/registry'
const ok = (r: CalendarResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: CalendarResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const civil = (s: string) => { const d = parseCivil(s); if (!d) throw Error(s); return d }
const difference = { start: '2024-02-28', end: '2024-03-01', mode: 'elapsed' }
const work = { start: '2026-11-02', end: '2026-11-08', weekend: 'sat-sun', holidays: [] as { date: string }[] }
const shift = { start: '09:00', end: '17:30', endDay: 'same-day', break: '60' }
const fuel = { distance: '150', efficiency: '15', price: '10000' }
const max = '9999999999999'
const abs = (v: bigint) => v < 0n ? -v : v

describe('Batch 14 independent reference vectors', () => {
  it('date differences respect Gregorian boundaries and both endpoint conventions', () => {
    for (const [start, end, days] of [['2024-02-28', '2024-03-01', 2n], ['2023-02-28', '2023-03-01', 1n], ['2026-11-07', '2026-11-07', 0n], ['2024-12-31', '2025-01-01', 1n], ['1900-02-28', '1900-03-01', 1n], ['2000-02-28', '2000-03-01', 2n]] as const) {
      for (const mode of ['elapsed', 'inclusive']) {
        const n = days + (mode === 'inclusive' ? 1n : 0n)
        expect(ok(calculateDateDifference({ start, end, mode })).values).toEqual({ days: n, elapsed: days, weeks: n / 7n, remainder: n % 7n })
      }
    }
    expect(ok(calculateDateDifference({ start: '2026-11-02', end: '2026-11-09', mode: 'elapsed' })).values).toEqual({ days: 7n, elapsed: 7n, weeks: 1n, remainder: 0n })
  })
  it('ordinal anchors and maximum supported range match independently checked dates', () => {
    for (const [s, n, w] of [['0001-01-01', 0n, 0], ['1970-01-01', 719162n, 3], ['2000-01-01', 730119n, 5], ['2024-02-28', 738943n, 2], ['2024-03-01', 738945n, 4], ['1900-02-28', 693653n, 2], ['2000-02-28', 730177n, 0], ['9999-12-31', 3652058n, 4]] as const) {
      expect(ordinal(civil(s))).toBe(n); expect(weekday(civil(s))).toBe(w)
    }
    expect(ok(calculateDateDifference({ start: '0001-01-01', end: '9999-12-31', mode: 'inclusive' })).values).toEqual({ days: 3652059n, elapsed: 3652058n, weeks: 521722n, remainder: 5n })
    expect(ok(calculateWorkdays({ ...work, start: '0001-01-01', end: '9999-12-31' })).values).toMatchObject({ total: 3652059n, scheduled: 2608615n, workdays: 2608615n })
  })
  it('workdays deduplicate explicit holidays and reconcile their classification ledger', () => {
    expect(ok(calculateWorkdays(work)).values).toEqual({ total: 7n, scheduled: 5n, workdays: 5n, qualifying: 0n, unique: 0n, duplicates: 0n, weekendHolidays: 0n, outside: 0n })
    const r = ok(calculateWorkdays({ ...work, holidays: ['2026-11-04', '2026-11-04', '2026-11-07', '2026-11-09'].map(date => ({ date })) }))
    expect(r.values).toEqual({ total: 7n, scheduled: 5n, workdays: 4n, qualifying: 1n, unique: 3n, duplicates: 1n, weekendHolidays: 1n, outside: 1n })
    expect(r.holidays).toEqual([{ date: '2026-11-04', weekday: 2, status: 'working' }, { date: '2026-11-07', weekday: 5, status: 'weekend' }, { date: '2026-11-09', weekday: 0, status: 'outside' }])
    expect(ok(calculateWorkdays({ ...work, start: '2024-02-26', end: '2024-03-03' })).values).toMatchObject({ total: 7n, scheduled: 5n, workdays: 5n })
    expect(ok(calculateWorkdays({ ...work, start: '2024-02-26', end: '2024-03-03', holidays: [{ date: '2024-02-29' }] })).values.workdays).toBe(4n)
  })
  it('workday patterns all none Friday Saturday and single-day boundaries are explicit', () => {
    expect(ok(calculateWorkdays({ ...work, weekend: 'fri-sat', holidays: [{ date: '2026-11-08' }] })).values).toMatchObject({ scheduled: 5n, qualifying: 1n, workdays: 4n })
    for (const [weekend, scheduled] of [['sun', 6n], ['none', 7n], ['all', 0n]] as const) expect(ok(calculateWorkdays({ ...work, weekend })).values.scheduled).toBe(scheduled)
    for (const [date, expected] of [['2026-11-02', 1n], ['2026-11-07', 0n]] as const) {
      expect(ok(calculateWorkdays({ ...work, start: date, end: date })).values.workdays).toBe(expected)
      expect(ok(calculateWorkdays({ ...work, start: date, end: date, holidays: [{ date }] })).values.workdays).toBe(0n)
    }
  })
  it('age uses maximal original-anchor clamped months without anniversary drift', () => {
    for (const [birth, reference, expected, anniversary] of [
      ['2024-02-29', '2025-02-28', [1n, 0n, 0n, 12n, 365n], '2025-02-28'],
      ['2024-02-29', '2025-02-27', [0n, 11n, 29n, 11n, 364n], '2025-01-29'],
      ['2024-01-31', '2024-02-29', [0n, 1n, 0n, 1n, 29n], '2024-02-29'],
      ['2023-01-31', '2023-02-28', [0n, 1n, 0n, 1n, 28n], '2023-02-28'],
      ['2024-01-31', '2024-03-30', [0n, 1n, 30n, 1n, 59n], '2024-02-29'],
      ['2024-01-31', '2024-03-31', [0n, 2n, 0n, 2n, 60n], '2024-03-31'],
      ['2000-02-29', '2024-02-29', [24n, 0n, 0n, 288n, 8766n], '2024-02-29'],
      ['2026-11-07', '2026-11-07', [0n, 0n, 0n, 0n, 0n], '2026-11-07'],
      ['0001-01-01', '9999-12-31', [9998n, 11n, 30n, 119987n, 3652058n], '9999-12-01'],
    ] as const) {
      const r = ok(calculateAge({ birth, reference })), [years, months, days, totalMonths, totalDays] = expected
      expect(r.values).toEqual({ years, months, days, totalMonths, totalDays }); expect(r.anniversary).toBe(anniversary)
    }
  })
  it('shift minutes respect explicit rollover and conserve gross break and net', () => {
    expect(ok(calculateShift(shift)).values).toEqual({ gross: 510n, break: 60n, net: 450n, decimalHours: 75000n })
    expect(ok(calculateShift({ start: '22:00', end: '06:00', endDay: 'next-day', break: '30' })).values).toEqual({ gross: 480n, break: 30n, net: 450n, decimalHours: 75000n })
    for (const [endDay, gross, decimalHours] of [['same-day', 0n, 0n], ['next-day', 1440n, 240000n]] as const) expect(ok(calculateShift({ ...shift, end: '09:00', break: '0', endDay })).values).toEqual({ gross, net: gross, break: 0n, decimalHours })
    expect(ok(calculateShift({ ...shift, start: '00:00', end: '00:01', break: '0' })).values).toEqual({ gross: 1n, net: 1n, break: 0n, decimalHours: 167n })
    expect(ok(calculateShift({ ...shift, start: '00:00', end: '23:59', endDay: 'next-day', break: '0' })).values).toEqual({ gross: 2879n, net: 2879n, break: 0n, decimalHours: 479833n })
    bad(calculateShift({ ...shift, start: '00:00', end: '00:30', break: '31' }), 'break')
    expect(ok(calculateShift({ ...shift, start: '00:00', end: '00:30', break: '30' })).values.net).toBe(0n)
    bad(calculateShift({ ...shift, start: '22:00', end: '06:00' }), 'end')
  })
  it('fuel costs round original rational liters once without display intermediates', () => {
    expect(ok(calculateFuel(fuel)).values).toEqual({ liters: 100000n, cost: 100000n, distance: 150000000n, efficiency: 15000000n, price: 10000n })
    expect(ok(calculateFuel({ distance: '125', efficiency: '12,5', price: '13500' })).values).toEqual({ liters: 100000n, cost: 135000n, distance: 125000000n, efficiency: 12500000n, price: 13500n })
    expect(ok(calculateFuel({ distance: '1', efficiency: '3', price: '10000' })).values).toMatchObject({ liters: 3333n, cost: 3333n })
    expect(ok(calculateFuel({ distance: '1', efficiency: '7', price: max })).values).toMatchObject({ liters: 1429n, cost: 1428571428571n })
    expect(ok(calculateFuel({ distance: '1', efficiency: '2', price: '1' })).values).toMatchObject({ liters: 5000n, cost: 1n })
  })
  it('fuel zero tiny and maximum values preserve cash and unrounded direction', () => {
    const zero = ok(calculateFuel({ ...fuel, distance: '0' })); expect(zero.values).toMatchObject({ liters: 0n, cost: 0n }); expect(zero.tiny).toEqual({})
    expect(ok(calculateFuel({ ...fuel, price: '0' })).values).toMatchObject({ liters: 100000n, cost: 0n })
    const tiny = ok(calculateFuel({ distance: '0.000001', efficiency: max, price: '1' })); expect(tiny.values).toMatchObject({ liters: 0n, cost: 0n }); expect(tiny.tiny).toEqual({ liters: true, cost: true })
    expect(ok(calculateFuel({ distance: '0.000001', efficiency: max, price: '0' })).tiny).toEqual({ liters: true })
    expect(ok(calculateFuel({ distance: max, efficiency: '0.000001', price: max })).values).toMatchObject({ liters: 99999999999990000000000n, cost: 99999999999980000000000001000000n })
    bad(calculateFuel({ ...fuel, efficiency: '0' }), 'efficiency')
  })
})
describe('calendar and rational invariants', () => {
  it('Gregorian 400-year cycle has 97 leap years and identical weekdays with exact adjacency', () => {
    let leaps = 0
    for (let y = 1600n; y < 2000n; y++) {
      if (isLeap(y)) leaps++
      for (let m = 1n; m <= 12n; m++) {
        const first = { year: y, month: m, day: 1n }, next = addMonthsClamped(first, 1n), later = { ...first, year: y + 400n }
        expect(ordinal(next) - ordinal(first)).toBe(daysInMonth(y, m))
        expect(ordinal(later) - ordinal(first)).toBe(146097n); expect(weekday(later)).toBe(weekday(first))
        const last = { ...first, day: daysInMonth(y, m) }; expect(ordinal(next) - ordinal(last)).toBe(1n)
      }
    }
    expect(leaps).toBe(97); expect(isLeap(1900n)).toBe(false); expect(isLeap(2000n)).toBe(true); expect(isLeap(2100n)).toBe(false); expect(isLeap(2400n)).toBe(true)
  })
  it('whole-week workday arithmetic matches independent enumeration and zero schedules', () => {
    const base = ordinal(civil('2026-11-02'))
    const patterns = [['sat-sun', [5n, 6n]], ['fri-sat', [4n, 5n]], ['sun', [6n]], ['none', []], ['all', [0n, 1n, 2n, 3n, 4n, 5n, 6n]]] as const
    for (const [weekend, off] of patterns) for (let first = 1; first <= 15; first++) for (let last = first; last <= 28; last += 3) {
      const start = `2026-11-${String(first).padStart(2, '0')}`, end = `2026-11-${String(last).padStart(2, '0')}`
      let expected = 0n
      for (let d = first; d <= last; d++) if (!(off as readonly bigint[]).includes((BigInt(d - 2) + 7n) % 7n)) expected++
      const r = ok(calculateWorkdays({ ...work, start, end, weekend }))
      expect(r.values.workdays).toBe(expected); expect(r.values.total).toBe(BigInt(last - first + 1)); expect(base % 7n).toBe(0n)
    }
  })
  it('holiday conservation deduplication permutation and nonnegative results hold', () => {
    const dates = ['2026-11-01', '2026-11-02', '2026-11-04', '2026-11-07', '2026-11-08', '2026-11-09']
    for (const weekend of ['sat-sun', 'fri-sat', 'sun', 'none', 'all']) {
      const r = ok(calculateWorkdays({ ...work, weekend, holidays: dates.map(date => ({ date })) }))
      expect(r.values.unique).toBe(r.values.qualifying + r.values.weekendHolidays + r.values.outside)
      expect(r.values.workdays + r.values.qualifying).toBe(r.values.scheduled); expect(r.values.workdays).toBeGreaterThanOrEqual(0n)
      const repeated = ok(calculateWorkdays({ ...work, weekend, holidays: [...dates, ...dates].reverse().map(date => ({ date })) }))
      expect(repeated.values).toEqual({ ...r.values, duplicates: 6n })
    }
    expect(ok(calculateWorkdays({ ...work, holidays: Array(100).fill({ date: '2026-11-04' }) })).values).toMatchObject({ workdays: 4n, unique: 1n, duplicates: 99n })
  })
  it('age anniversary maximality and exact reconstruction hold near all month ends', () => {
    for (const birth of ['1900-02-28', '2000-02-29', '2023-01-31', '2024-02-29', '2024-08-31', '0001-01-01']) {
      const b = civil(birth)
      for (let n = 0n; n <= 60n; n++) {
        const anniversary = addMonthsClamped(b, n)
        for (const day of [1n, anniversary.day]) {
          const ref = { ...anniversary, day }; if (ordinal(ref) < ordinal(b)) continue
          const r = ok(calculateAge({ birth, reference: civilString(ref) })), months = r.values.totalMonths
          const last = ordinal(addMonthsClamped(b, months)), next = ordinal(addMonthsClamped(b, months + 1n))
          expect(last).toBeLessThanOrEqual(ordinal(ref)); expect(next).toBeGreaterThan(ordinal(ref))
          expect(last + r.values.days).toBe(ordinal(ref)); expect(r.values.years * 12n + r.values.months).toBe(months); expect(r.values.months).toBeLessThan(12n)
          expect(r.values.totalDays).toBe(ordinal(ref) - ordinal(b)); expect(r.values.days).toBeGreaterThanOrEqual(0n)
        }
      }
    }
  })
  it('all sampled clock shifts conserve minutes and round hours once', () => {
    const clock = (n: bigint) => `${String(n / 60n).padStart(2, '0')}:${String(n % 60n).padStart(2, '0')}`
    for (let start = 0n; start < 1440n; start += 137n) for (let end = 0n; end < 1440n; end += 119n) for (const endDay of ['same-day', 'next-day']) {
      const gross = end - start + (endDay === 'next-day' ? 1440n : 0n)
      const input = { start: clock(start), end: clock(end), endDay, break: '0' }
      if (gross < 0n) { bad(calculateShift(input), 'end'); continue }
      for (const pause of [0n, gross / 2n, gross]) {
        const v = ok(calculateShift({ ...input, break: String(pause) })).values
        expect(v.net + v.break).toBe(v.gross); expect(v.gross).toBe(gross); expect(v.net).toBeGreaterThanOrEqual(0n)
        expect(abs(v.decimalHours * 60n - v.net * 10000n) * 2n).toBeLessThanOrEqual(60n)
      }
    }
  })
  it('fuel rational rounding bounds and scale invariance hold without Number values', () => {
    for (const j of ['0', '0.000001', '1', '150', max]) for (const e of ['0.000001', '3', '7', '12.5', max]) for (const price of ['0', '1', '10000', max]) {
      const r = ok(calculateFuel({ distance: j, efficiency: e, price })), { distance, efficiency, liters, cost } = r.values
      expect(abs(liters * efficiency - distance * 10000n) * 2n).toBeLessThanOrEqual(efficiency)
      expect(abs(cost * efficiency - distance * BigInt(price)) * 2n).toBeLessThanOrEqual(efficiency)
      expect(liters).toBeGreaterThanOrEqual(0n); expect(cost).toBeGreaterThanOrEqual(0n)
    }
    expect(ok(calculateFuel({ ...fuel, distance: '300', efficiency: '30' })).values.liters).toBe(ok(calculateFuel(fuel)).values.liters)
  })
  it('civil and clock models are unchanged across host timezones and DST dates', () => {
    const saved = process.env.TZ
    try {
      for (const tz of ['UTC', 'Asia/Jakarta', 'America/New_York', 'Pacific/Kiritimati', 'Pacific/Honolulu']) {
        process.env.TZ = tz
        expect(ok(calculateDateDifference({ start: '2024-03-09', end: '2024-03-11', mode: 'elapsed' })).values.days).toBe(2n)
        expect(ok(calculateDateDifference({ start: '2024-11-02', end: '2024-11-04', mode: 'elapsed' })).values.days).toBe(2n)
        expect(ok(calculateShift({ start: '01:00', end: '04:00', endDay: 'same-day', break: '0' })).values.net).toBe(180n)
        expect(ok(calculateAge({ birth: '2024-02-29', reference: '2025-02-28' })).values.years).toBe(1n)
      }
    } finally { if (saved === undefined) delete process.env.TZ; else process.env.TZ = saved }
    for (const file of ['civil.ts', 'engines.ts']) expect(readFileSync(new URL(`../lib/calendar-time/${file}`, import.meta.url), 'utf8')).not.toMatch(/\bDate\b|Date\.parse|86400000/)
  })
})
describe('strict bounds malformed input and catalog', () => {
  it.each(['0000-01-01', '10000-01-01', '2023-02-29', '1900-02-29', '2100-02-29', '2024-02-30', '2024-04-31', '2024-00-01', '2024-13-01', '2024-01-00', '2024-01-32', '2024-1-01', '24-01-01', '2024-01-01T00:00:00Z', '2024-01-01 ', '2024-01-01Z', '', 'NaN', 'Infinity', '01/02/2024'])('rejects impossible or ambiguous civil date %s', value => {
    expect(parseCivil(value)).toBeNull(); bad(calculateDateDifference({ ...difference, start: value }), 'start'); bad(calculateWorkdays({ ...work, holidays: [{ date: value }] }), 'holidays.0.date'); bad(calculateAge({ birth: value, reference: '2026-11-07' }), 'birth')
  })
  it('rejects reverse ranges unknown modes holidays and invalid reference', () => {
    bad(calculateDateDifference({ ...difference, end: '2024-02-27' }), 'end'); bad(calculateDateDifference({ ...difference, mode: 'signed' }), 'mode')
    bad(calculateWorkdays({ ...work, end: '2026-11-01' }), 'end'); bad(calculateWorkdays({ ...work, weekend: '' }), 'weekend')
    bad(calculateWorkdays({ ...work, holidays: Array(101).fill({ date: '2026-11-04' }) }), 'holidays'); bad(calculateWorkdays({ ...work, holidays: [{ date: '' }] }), 'holidays.0.date')
    bad(calculateAge({ birth: '2026-11-07', reference: '2026-11-06' }), 'reference')
  })
  it.each(['24:00', '12:60', '9:00', '09:0', '09:00:00', '09:00Z', '-01:00', '09:00 ', '', 'NaN'])('rejects malformed clock %s', value => {
    bad(calculateShift({ ...shift, start: value }), 'start'); bad(calculateShift({ ...shift, end: value }), 'end')
  })
  it('validates shift choices and bounded whole-minute breaks', () => {
    for (const value of ['-1', '0.5', '1e2', '2880', '10000', '', 'NaN', 'Infinity']) bad(calculateShift({ ...shift, break: value }), 'break')
    bad(calculateShift({ ...shift, endDay: 'auto' }), 'endDay')
    expect(ok(calculateShift({ ...shift, start: '00:00', end: '23:59', endDay: 'next-day', break: '2879' })).values.net).toBe(0n)
  })
  it.each(['-1', '1e3', 'Infinity', 'NaN', '', '10000000000000', '0.0000001', '1,000,000'])('rejects malformed or out-of-bound fuel scalar %s', value => {
    bad(calculateFuel({ ...fuel, distance: value }), 'distance'); bad(calculateFuel({ ...fuel, efficiency: value }), 'efficiency'); bad(calculateFuel({ ...fuel, price: value }), 'price')
  })
  it('rejects currency fractions zero efficiency null missing and numeric payloads', () => {
    for (const price of ['1.5', '1,5', '1.000']) bad(calculateFuel({ ...fuel, price }), 'price')
    for (const efficiency of ['0', '0.000000']) bad(calculateFuel({ ...fuel, efficiency }), 'efficiency')
    for (const engine of [calculateDateDifference, calculateWorkdays, calculateAge, calculateShift, calculateFuel]) for (const value of [null, undefined, {}, [], 0, '']) bad(engine(value))
    bad(calculateFuel({ ...fuel, distance: 150 }), 'distance'); bad(calculateDateDifference({ ...difference, start: null }), 'start')
  })
  it('formats exact duration quantity cash and tiny values with units', () => {
    expect(formatCalendar(450n, 'duration')).toBe('7 jam 30 menit'); expect(formatCalendar(167n, 'decimal-hours')).toBe('0,0167 jam')
    expect(formatCalendar(3333n, 'liters')).toBe('0,3333 L'); expect(formatCalendar(100000n, 'IDR')).toBe('Rp100.000')
    expect(formatCalendar(0n, 'liters', true)).toBe('<0,0001 L (positif)'); expect(formatCalendar(0n, 'IDR', true)).toBe('Rp0 (estimasi positif <Rp0,50)')
    expect(formatCalendar(150000000n, 'km')).toBe('150,000000 km'); expect(formatCalendar(13500n, 'IDR-per-L')).toBe('Rp13.500/L')
  })
  it('publishes five existing IDs with 81 tools twenty everyday and 87 sitemap URLs', () => {
    expect(listPublished()).toHaveLength(96); expect(listCategory('sehari-hari')).toHaveLength(20); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(103)
    for (const slug of ['selisih-tanggal', 'hari-kerja', 'usia', 'durasi-kerja', 'konsumsi-bbm']) expect(findPublished(slug)?.id).toBe(`calc-${slug}`)
    for (const slug of [ 'shopee', 'tiktok-shop']) expect(findPublished(slug)).toBeUndefined()
    const rows = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(rows).toHaveLength(100); expect(new Set(rows.map(r => r[1])).size).toBe(100); expect(rows.filter(r => r[10] === 'published')).toHaveLength(96)
  })
})
