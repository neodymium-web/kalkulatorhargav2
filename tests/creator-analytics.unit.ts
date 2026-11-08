import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { calculateCtr, calculateYoutube, calculateCreatorEarnings, calculateAccount, calculateEndorsement, calculateRateCard, calculateComparison, calculateWatchTime, calculateTiktok, type CreatorResult } from '../lib/creator-analytics/engines'
import { formatCreator } from '../lib/creator-analytics/format'
import { listPublished, listCategory, listCategoryHubs, sitemapPaths, findPublished } from '../lib/registry'
const ok = (r: CreatorResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: CreatorResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const price = { production: '100', hours: '2', hourly: '100', overhead: '50', usage: '50', deliverables: '1' }
const pricing2 = { production: '100', hours: '1.25', hourly: '80', overhead: '25', usage: '20', deliverables: '3' }
const earnings = { eligibleViews: '10000', rpm: '100', sponsor: '200', affiliate: '30', gift: '20', incomeBasis: 'assumed' }
const account = { followers: '1000', views: '3000', videos: '3', likes: '100', comments: '20', saves: '10', shares: '5', basis: 'followers' }
const comparison = { basis: 'followers', followersA: '1000', viewsA: '1000', interactionsA: '100', videosA: '3', followersB: '2000', viewsB: '800', interactionsB: '100', videosB: '2' }
const max = '9999999999999'
const abs = (x: bigint) => x < 0n ? -x : x
const roundedError = (display: bigint, n: bigint, d: bigint) => expect(2n * abs(display * d - n)).toBeLessThanOrEqual(d)
describe('creator independent reference vectors', () => {
  it('CTR uses exact event counts and warns above impressions', () => {
    expect(ok(calculateCtr({ clicks: '5', impressions: '100' })).values).toEqual({ rate: 500n, clicks: 5n, impressions: 100n })
    expect(ok(calculateCtr({ clicks: '1', impressions: '32' })).values.rate).toBe(313n)
    const r = ok(calculateCtr({ clicks: '135', impressions: '100' })); expect(r.values.rate).toBe(13500n); expect(r.notes?.join(' ')).toContain('melebihi impresi')
    const edge = ok(calculateCtr({ clicks: max, impressions: '9999999999998' })); expect(edge.values.rate).toBe(10000n); expect(edge.notes?.join(' ')).toContain('melebihi impresi')
  })
  it('YouTube model uses matching total-view RPM without invented revenue share', () => {
    expect(ok(calculateYoutube({ views: '10000', rpm: '1500.25' })).values).toEqual({ income: 1500250n, views: 10000n, rpm: 150025n })
    expect(ok(calculateYoutube({ views: '12345', rpm: '1500,25' })).values.income).toBe(1852059n)
    expect(ok(calculateYoutube({ views: '1', rpm: '5' })).values.income).toBe(1n)
    const tiny = ok(calculateYoutube({ views: '1', rpm: '0.01' })); expect(tiny.values.income).toBe(0n); expect(tiny.precision.income).toBe('positive')
  })
  it('creator earnings reconciles modeled and separate net income once', () => {
    expect(ok(calculateCreatorEarnings(earnings)).values).toEqual({ platform: 100000n, total: 125000n, sponsor: 20000n, affiliate: 3000n, gift: 2000n })
    const r = ok(calculateCreatorEarnings({ ...earnings, eligibleViews: '1', rpm: '5', sponsor: '0.01', affiliate: '0.02', gift: '0.03' }))
    expect(r.values).toEqual({ platform: 1n, total: 7n, sponsor: 1n, affiliate: 2n, gift: 3n })
    expect(ok(calculateCreatorEarnings({ ...earnings, rpm: '0' })).values.total).toBe(25000n)
    expect(ok(calculateCreatorEarnings({ ...earnings, incomeBasis: 'realized' })).notes?.join(' ')).toContain('realisasi neto')
  })
  it('creator account metrics preserve views follower basis and zero denominators', () => {
    expect(ok(calculateAccount(account)).values).toEqual({ rate: 1350n, average: 100000n, interactions: 135n, followers: 1000n, views: 3000n, videos: 3n })
    expect(ok(calculateAccount({ ...account, basis: 'views' })).values.rate).toBe(450n)
    expect(ok(calculateAccount({ ...account, followers: '32', views: '1000', likes: '1', comments: '0', saves: '0', shares: '0' })).values).toMatchObject({ rate: 313n, average: 33333n, interactions: 1n })
    expect(ok(calculateAccount({ ...account, followers: '0', videos: '0' })).values).toMatchObject({ rate: null, average: null, interactions: 135n })
    expect(ok(calculateAccount({ ...account, basis: 'views', views: '0' })).values.rate).toBeNull()
  })
  it('endorsement ceilings minimum production price and passes rights separately', () => {
    expect(ok(calculateEndorsement({ ...price, margin: '20' })).values).toEqual({ effective: 2009n, quote: 488n, productionQuote: 438n, base: 35000n, labor: 20000n, rights: 50n, profit: 8800n })
    expect(ok(calculateEndorsement({ ...pricing2, margin: '25' })).values).toEqual({ effective: 2500n, quote: 960n, productionQuote: 900n, base: 67500n, labor: 30000n, rights: 60n, profit: 22500n })
    expect(ok(calculateEndorsement({ ...pricing2, margin: '0' })).values).toMatchObject({ quote: 735n, productionQuote: 675n, effective: 0n, profit: 0n })
    expect(ok(calculateEndorsement({ ...price, production: '0', hours: '0.01', hourly: '1', overhead: '0', usage: '0', margin: '0' })).values).toMatchObject({ quote: 1n, base: 1n, labor: 1n, profit: 99n, effective: 9900n })
  })
  it('creator rate card reuses exact pricing with ordered margins and package slots', () => {
    expect(ok(calculateRateCard({ ...price, lowMargin: '20', highMargin: '30', slots: '2' })).values).toEqual({ low: 488n, high: 550n, base: 35000n, rights: 50n, slots: 2n, revenueLow: 976n, revenueHigh: 1100n })
    expect(ok(calculateRateCard({ ...pricing2, lowMargin: '0', highMargin: '25', slots: '3' })).values).toEqual({ low: 735n, high: 960n, base: 67500n, rights: 60n, slots: 3n, revenueLow: 2205n, revenueHigh: 2880n })
    const r = ok(calculateRateCard({ ...price, lowMargin: '20', highMargin: '20', slots: '0' })); expect(r.values.low).toBe(r.values.high); expect(r.values.revenueLow).toBe(0n); expect(r.values.revenueHigh).toBe(0n)
  })
  it('creator comparison derives signed differences from unrounded ratios', () => {
    expect(ok(calculateComparison(comparison)).values).toEqual({ erA: 1000n, erB: 500n, erChange: -500n, averageA: 33333n, averageB: 40000n, averageChange: 6667n,
      followersA: 1000n, followersB: 2000n, followersChange: 1000n, viewsA: 1000n, viewsB: 800n, viewsChange: -200n,
      interactionsA: 100n, interactionsB: 100n, interactionsChange: 0n, videosA: 3n, videosB: 2n, videosChange: -1n })
    expect(ok(calculateComparison({ ...comparison, basis: 'views' })).values).toMatchObject({ erA: 1000n, erB: 1250n, erChange: 250n, averageChange: 6667n })
    expect(ok(calculateComparison({ basis: 'followers', followersA: '32', viewsA: '32', interactionsA: '1', videosA: '1', followersB: '31', viewsB: '31', interactionsB: '1', videosB: '1' })).values).toMatchObject({ erA: 313n, erB: 323n, erChange: 10n, averageA: 3200n, averageB: 3100n, averageChange: -100n, followersChange: -1n, viewsChange: -1n, interactionsChange: 0n, videosChange: 0n })
  })
  it('comparison difference does not subtract rounded display metrics', () => {
    const r = ok(calculateComparison({ ...comparison, followersA: '32', followersB: '33', interactionsA: '1', interactionsB: '1' }))
    expect(r.values.erA).toBe(313n); expect(r.values.erB).toBe(303n); expect(r.values.erChange).toBe(-9n)
    expect(r.values.erB! - r.values.erA!).not.toBe(r.values.erChange)
  })
  it('watch time derives hours and minutes independently from one exact ledger', () => {
    expect(ok(calculateWatchTime({ views: '1000', minutes: '1.5' })).values).toEqual({ hours: 2500n, minutes: 150000n })
    expect(ok(calculateWatchTime({ views: '3', minutes: '0.1' })).values).toEqual({ hours: 1n, minutes: 30n })
    const tiny = ok(calculateWatchTime({ views: '1', minutes: '0.0001' })); expect(tiny.values).toEqual({ hours: 0n, minutes: 0n }); expect(tiny.precision).toEqual({ hours: 'positive', minutes: 'positive' })
  })
  it('TikTok suite dispatches every functional manual mode without seller intent', () => {
    const cases = [{ mode: 'earnings', ...earnings }, { mode: 'account', ...account }, { mode: 'ratecard', ...price, lowMargin: '20', highMargin: '30', slots: '2' }, { mode: 'comparison', ...comparison }]
    for (const input of cases) expect(calculateTiktok(input).success).toBe(true)
    for (const mode of ['', 'seller', 'tiktok-shop', null, undefined]) bad(calculateTiktok({ ...earnings, mode }), 'mode')
  })
})
describe('creator boundaries and algebraic invariants', () => {
  it('all relevant zero numerators stay zero rather than subprecision', () => {
    expect(ok(calculateCtr({ clicks: '0', impressions: '1' }))).toMatchObject({ values: { rate: 0n }, precision: {} })
    for (const input of [{ views: '0', rpm: '1' }, { views: '1', rpm: '0' }]) expect(ok(calculateYoutube(input)).values.income).toBe(0n)
    expect(ok(calculateCreatorEarnings({ ...earnings, eligibleViews: '0', rpm: '0', sponsor: '0', affiliate: '0', gift: '0' })).values).toEqual({ platform: 0n, total: 0n, sponsor: 0n, affiliate: 0n, gift: 0n })
    expect(ok(calculateEndorsement({ production: '0', hours: '0', hourly: '0', overhead: '0', usage: '0', deliverables: '1', margin: '20' })).values).toEqual({ quote: 0n, productionQuote: 0n, labor: 0n, base: 0n, rights: 0n, profit: 0n, effective: null })
    for (const input of [{ views: '0', minutes: '1' }, { views: '1', minutes: '0' }]) expect(ok(calculateWatchTime(input))).toMatchObject({ values: { hours: 0n, minutes: 0n }, precision: {} })
  })
  it('engagement may exceed basis and its null status is separate from zero actions', () => {
    expect(ok(calculateAccount({ ...account, followers: '1' }))).toMatchObject({ values: { rate: 1350000n }, notes: expect.arrayContaining([expect.stringContaining('melebihi 100')]) })
    const r = ok(calculateAccount({ ...account, likes: '0', comments: '0', saves: '0', shares: '0' })); expect(r.values.rate).toBe(0n); expect(r.precision.rate).toBeUndefined()
    expect(ok(calculateAccount({ ...account, followers: max, views: '1', videos: max, likes: '1', comments: '0', saves: '0', shares: '0' })).precision).toEqual({ rate: 'positive', average: 'positive' })
  })
  it('comparison zeros are undefined only for their own basis', () => {
    const r = ok(calculateComparison({ ...comparison, followersA: '0', videosB: '0' }))
    expect(r.values.erA).toBeNull(); expect(r.values.erB).toBe(500n); expect(r.values.erChange).toBeNull()
    expect(r.values.averageA).toBe(33333n); expect(r.values.averageB).toBeNull(); expect(r.values.averageChange).toBeNull(); expect(r.values.followersChange).toBe(2000n)
    const viewsBasis = ok(calculateComparison({ ...comparison, basis: 'views', followersA: '0' })); expect(viewsBasis.values.erA).toBe(1000n)
  })
  it('ceiling price is minimal whole rupiah satisfying exact target margin', () => {
    for (const margin of ['0', '20', '33.3333', '99.9999']) for (const hours of ['0', '0.01', '1.25', '999999.99']) {
      const v = ok(calculateEndorsement({ ...price, hours, margin })).values
      const m = BigInt(margin.replace('.', '').padEnd(margin.includes('.') ? margin.split('.')[0].length + 4 : margin.length + 4, '0'))
      const p = v.productionQuote!, base = v.base!
      expect(p * 100n * (1000000n - m)).toBeGreaterThanOrEqual(base * 1000000n)
      if (p > 0n) expect((p - 1n) * 100n * (1000000n - m)).toBeLessThan(base * 1000000n)
      expect(v.quote).toBe(p + v.rights!); expect(v.profit).toBe(p * 100n - base)
    }
  })
  it('rights change leaves production quote profit and effective margin unchanged', () => {
    const a = ok(calculateEndorsement({ ...price, margin: '20', usage: '0' })).values, b = ok(calculateEndorsement({ ...price, margin: '20', usage: '9999999999999' })).values
    expect(b.quote! - a.quote!).toBe(9999999999999n)
    for (const key of ['base', 'labor', 'profit', 'productionQuote', 'effective']) expect(b[key]).toBe(a[key])
  })
  it('ratecard exactly reuses endorsement package quote at either margin', () => {
    for (const input of [price, pricing2]) for (const lowMargin of ['0', '20', '99.9999']) {
      const r = ok(calculateRateCard({ ...input, lowMargin, highMargin: '99.9999', slots: '1000' })).values
      expect(r.low).toBe(ok(calculateEndorsement({ ...input, margin: lowMargin })).values.quote)
      expect(r.high).toBe(ok(calculateEndorsement({ ...input, margin: '99.9999' })).values.quote)
      expect(r.revenueLow).toBe(r.low! * 1000n); expect(r.revenueHigh).toBe(r.high! * 1000n); expect(r.high!).toBeGreaterThanOrEqual(r.low!)
    }
  })
  it('earnings component display reconciles with final total across half-sen boundaries', () => {
    for (const eligibleViews of ['0', '1', '499', '500', '9999999999999']) for (const rpm of ['0', '0.01', '5', '9999999999999.99']) {
      const v = ok(calculateCreatorEarnings({ ...earnings, eligibleViews, rpm, sponsor: '0.01', affiliate: '0.02', gift: '0.03' })).values
      expect(v.total).toBe(v.platform! + v.sponsor! + v.affiliate! + v.gift!)
    }
  })
  it('swapping comparison accounts negates every exact delta including tiny signs', () => {
    const input = { ...comparison, followersA: max, followersB: '9999999999998', interactionsA: '1', interactionsB: '1' }
    const swapped = { ...input }
    for (const name of ['followers', 'views', 'interactions', 'videos'] as const) {
      swapped[`${name}A`] = input[`${name}B`]; swapped[`${name}B`] = input[`${name}A`]
    }
    const a = ok(calculateComparison(input)), b = ok(calculateComparison(swapped))
    for (const key of ['followersChange', 'viewsChange', 'interactionsChange', 'videosChange', 'erChange', 'averageChange']) expect(b.values[key]).toBe(-a.values[key]!)
    expect(a.precision.erChange).toBe('positive'); expect(b.precision.erChange).toBe('negative')
  })
  it('ratio and RPM display errors stay within half increment at huge magnitudes', () => {
    for (const views of [1n, 32n, 1000n, 9999999999999n]) {
      const ctr = ok(calculateCtr({ clicks: '1', impressions: String(views) })); roundedError(ctr.values.rate!, 10000n, views)
      const income = ok(calculateYoutube({ views: String(views), rpm: '9999999999999.99' })); roundedError(income.values.income!, views * 999999999999999n, 1000n)
    }
    expect(ok(calculateWatchTime({ views: max, minutes: '999999.9999' })).values.minutes).toBe(999999999899900000000n)
    const r = ok(calculateEndorsement({ production: max, hours: '999999.99', hourly: max, overhead: max, usage: max, deliverables: '1000', margin: '99.9999' }))
    expect(r.values.quote!).toBeGreaterThan(9007199254740991n)
  })
})
describe('additional creator ledger boundaries', () => {
  it('zero comparison bases keep counts while identical positive accounts have exact zero differences', () => {
    const zero = { basis: 'followers', followersA: '0', viewsA: '0', interactionsA: '0', videosA: '0', followersB: '0', viewsB: '0', interactionsB: '0', videosB: '0' }
    const a = ok(calculateComparison(zero))
    for (const key of ['erA', 'erB', 'erChange', 'averageA', 'averageB', 'averageChange']) expect(a.values[key]).toBeNull()
    for (const key of ['followersChange', 'viewsChange', 'interactionsChange', 'videosChange']) expect(a.values[key]).toBe(0n)
    const same = ok(calculateComparison({ ...comparison, followersB: '1000', viewsB: '1000', interactionsB: '100', videosB: '3' }))
    expect(same.values.erChange).toBe(0n); expect(same.values.averageChange).toBe(0n); expect(same.precision).toEqual({})
  })
  it('net income tiny signs and license-only quotes remain explicit', () => {
    const tiny = ok(calculateCreatorEarnings({ ...earnings, eligibleViews: '1', rpm: '0.01', sponsor: '0', affiliate: '0', gift: '0' }))
    expect(tiny.values.total).toBe(0n); expect(tiny.values.platform).toBe(0n); expect(tiny.precision).toEqual({ total: 'positive', platform: 'positive' })
    const rights = ok(calculateEndorsement({ production: '0', hours: '0', hourly: '0', overhead: '0', usage: '5', deliverables: '3', margin: '99.9999' }))
    expect(rights.values).toMatchObject({ quote: 15n, rights: 15n, base: 0n, profit: 0n, effective: null })
  })
  it('watch-time quantization uses the same exact ledger for both units', () => {
    for (const views of [0n, 1n, 3n, 1000n, 9999999999999n]) for (const ticks of [0n, 1n, 50n, 1000n, 9999999999n]) {
      const minutes = `${ticks / 10000n}.${String(ticks % 10000n).padStart(4, '0')}`
      const r = ok(calculateWatchTime({ views: String(views), minutes }))
      roundedError(r.values.minutes!, views * ticks * 100n, 10000n); roundedError(r.values.hours!, views * ticks * 100n, 600000n)
    }
    expect(ok(calculateWatchTime({ views: '1', minutes: '0.005' })).values.minutes).toBe(1n)
  })
})
describe('creator validation and integration', () => {
  const cases = [
    { engine: calculateCtr, valid: { clicks: '1', impressions: '1' } }, { engine: calculateYoutube, valid: { views: '1', rpm: '1' } },
    { engine: calculateCreatorEarnings, valid: earnings }, { engine: calculateAccount, valid: account },
    { engine: calculateEndorsement, valid: { ...price, margin: '20' } }, { engine: calculateRateCard, valid: { ...price, lowMargin: '20', highMargin: '30', slots: '2' } },
    { engine: calculateComparison, valid: comparison }, { engine: calculateWatchTime, valid: { views: '1', minutes: '1' } },
  ]
  it.each(cases)('rejects invalid scalar and missing shapes for $engine', ({ engine, valid }) => {
    for (const [key] of Object.entries(valid)) for (const value of ['', '-1', 'NaN', 'Infinity', '1e3', null, undefined, 1]) bad(engine({ ...valid, [key]: value }), key)
    for (const input of [undefined, null, [], {}]) bad(engine(input))
  })
  it('caps counts precision quantities margins and ordered quote range', () => {
    bad(calculateCtr({ clicks: '10000000000000', impressions: '1' }), 'clicks'); bad(calculateCtr({ clicks: '0', impressions: '0' }), 'impressions')
    bad(calculateYoutube({ views: '1', rpm: '0.001' }), 'rpm'); bad(calculateWatchTime({ views: '1', minutes: '0.00001' }), 'minutes'); bad(calculateWatchTime({ views: '1', minutes: '1000000' }), 'minutes')
    for (const deliverables of ['0', '1001', '1.1']) bad(calculateEndorsement({ ...price, margin: '20', deliverables }), 'deliverables')
    for (const margin of ['100', '100.0000', '20.00001']) bad(calculateEndorsement({ ...price, margin }), 'margin')
    bad(calculateRateCard({ ...price, lowMargin: '30', highMargin: '20', slots: '1' }), 'highMargin'); bad(calculateRateCard({ ...price, lowMargin: '20', highMargin: '30', slots: '1001' }), 'slots')
    bad(calculateAccount({ ...account, basis: 'reach' }), 'basis')
  })
  it('formats signed percentage points currencies time undefined and tiny fields', () => {
    expect(formatCreator(-500n, 'pp')).toBe('−5,00 poin persentase'); expect(formatCreator(667n, 'delta-decimal')).toBe('+6,67'); expect(formatCreator(-1n, 'delta')).toBe('−1')
    expect(formatCreator(488n, 'IDR')).toBe('Rp488'); expect(formatCreator(1n, 'cents')).toBe('Rp0,01'); expect(formatCreator(2500n, 'hours')).toBe('25,00 jam')
    expect(formatCreator(0n, 'hours', 'positive')).toContain('<0,01 jam'); expect(formatCreator(0n, 'pp', 'negative')).toContain('negatif'); expect(formatCreator(null, '%')).toContain('Tidak terdefinisi')
  })
  it('publishes exactly five reserved entries and preserves distinct TikTok seller intent', () => {
    expect(listPublished()).toHaveLength(100); expect(listCategory('media-sosial')).toHaveLength(10); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(107)
    expect(listCategory('bisnis')).toHaveLength(20); expect(listCategory('marketplace')).toHaveLength(20); expect(listCategory('keuangan')).toHaveLength(20)
    expect(findPublished('tiktok')?.id).toBe('calc-estimasi-tiktok-kreator'); expect(findPublished('tiktok-shop')?.id).toBe('calc-tiktok'); expect(findPublished('shopee')?.id).toBe('calc-shopee')
    const rows = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(rows).toHaveLength(100); expect(new Set(rows.map(x => x[1])).size).toBe(100); expect(rows.filter(x => x[10] === 'published')).toHaveLength(100)
  })
})
