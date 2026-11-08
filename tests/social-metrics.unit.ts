import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculateEngagement, calculateFollowerGrowth, calculateCpm, calculateCpc, calculateCpa, type SocialResult } from '../lib/social-metrics/engines'
import { formatSocial } from '../lib/social-metrics/format'
import { listPublished, listCategory, listCategoryHubs, sitemapPaths, findPublished } from '../lib/registry'
import { directoryEntry, searchDirectory } from '../lib/directory'
const ok = (r: SocialResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const invalid = (r: SocialResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected invalid'); if (key) expect(r.errors[key]).toBeTruthy() }
const engagement = { likes: '100', comments: '20', saves: '10', shares: '5', basis: 'followers', denominator: '1000' }
const one = { likes: '1', comments: '0', saves: '0', shares: '0', basis: 'reach', denominator: '32' }
const maximum = '9999999999999'
const costCases = [
  { engine: calculateCpm, key: 'impressions', multiplier: 1000n, extra: {} },
  { engine: calculateCpc, key: 'clicks', multiplier: 1n, extra: {} },
  { engine: calculateCpa, key: 'acquisitions', multiplier: 1n, extra: { action: 'sale' } },
]
const magnitude = (x: bigint) => x < 0n ? -x : x
function roundingError(result: bigint, numerator: bigint, denominator: bigint) {
  // Cross multiplication checks the final quantization without repeating the engine's rounding code.
  expect(2n * magnitude(result * denominator - numerator)).toBeLessThanOrEqual(denominator)
}
describe('social metric independent vectors', () => {
  it('engagement sums four actions and preserves both denominator bases beyond 100 percent', () => {
    expect(ok(calculateEngagement(engagement))).toMatchObject({ values: { rate: 1350n, interactions: 135n, denominator: 1000n }, basis: 'followers', overBasis: false })
    expect(ok(calculateEngagement({ ...engagement, basis: 'reach', denominator: '100' }))).toMatchObject({ values: { rate: 13500n, interactions: 135n }, basis: 'reach', overBasis: true })
  })
  it('engagement rounds ties once and differentiates zero from tiny actions', () => {
    expect(ok(calculateEngagement(one)).values.rate).toBe(313n)
    expect(ok(calculateEngagement({ ...one, denominator: maximum }))).toMatchObject({ values: { rate: 0n }, tiny: 'positive' })
    expect(ok(calculateEngagement({ ...one, likes: '0' }))).toMatchObject({ values: { rate: 0n, interactions: 0n }, tiny: undefined })
  })
  it('ER warning uses exact ratio even when rounded display equals 100 percent', () => {
    expect(ok(calculateEngagement({ ...one, likes: maximum, denominator: '9999999999998' }))).toMatchObject({ values: { rate: 10000n }, overBasis: true })
    expect(ok(calculateEngagement({ ...one, likes: maximum, denominator: maximum })).overBasis).toBe(false)
  })
  it('four maximum engagement fields sum beyond individual input cap without overflow', () => {
    const r = ok(calculateEngagement({ ...engagement, likes: maximum, comments: maximum, saves: maximum, shares: maximum, denominator: '1' }))
    expect(r.values).toEqual({ rate: 399999999999960000n, interactions: 39999999999996n, denominator: 1n })
    expect(formatSocial(r.values.rate, '%')).toBe('3.999.999.999.999.600,00%')
  })
  it('follower growth supports signed changes and leaves zero-base percent undefined', () => {
    expect(ok(calculateFollowerGrowth({ start: '1000', end: '1250' })).values).toEqual({ rate: 2500n, change: 250n, start: 1000n, end: 1250n })
    expect(ok(calculateFollowerGrowth({ start: '1000', end: '800' })).values).toEqual({ rate: -2000n, change: -200n, start: 1000n, end: 800n })
    expect(ok(calculateFollowerGrowth({ start: '0', end: '200' })).values).toEqual({ rate: null, change: 200n, start: 0n, end: 200n })
    expect(ok(calculateFollowerGrowth({ start: '0', end: '0' })).values).toEqual({ rate: null, change: 0n, start: 0n, end: 0n })
  })
  it.each([
    ['32', '33', 313n, 1n], ['32', '31', -313n, -1n], ['1000', '1000', 0n, 0n], ['1000', '0', -10000n, -1000n], ['1', '1000', 9990000n, 999n],
  ])('growth %s to %s has signed exact delta and rounded percent', (start, end, rate, change) => {
    expect(ok(calculateFollowerGrowth({ start, end })).values).toMatchObject({ rate, change })
  })
  it('growth keeps direction below display precision', () => {
    expect(ok(calculateFollowerGrowth({ start: maximum, end: '9999999999998' }))).toMatchObject({ values: { rate: 0n, change: -1n }, tiny: 'negative' })
    expect(ok(calculateFollowerGrowth({ start: '9999999999998', end: maximum }))).toMatchObject({ values: { rate: 0n, change: 1n }, tiny: 'positive' })
    expect(ok(calculateFollowerGrowth({ start: maximum, end: maximum })).tiny).toBeUndefined()
  })
  it('CPM scales exact spend by one thousand impressions before rounding', () => {
    expect(ok(calculateCpm({ spend: '150000', impressions: '50000' })).values).toEqual({ cost: 300000n, spend: 150000n, events: 50000n })
    expect(ok(calculateCpm({ spend: '1', impressions: '3000' })).values.cost).toBe(33n)
    expect(ok(calculateCpm({ spend: '1', impressions: '8000' })).values.cost).toBe(13n)
  })
  it('CPC divides matched campaign spend by positive click events', () => {
    expect(ok(calculateCpc({ spend: '100000', clicks: '250' })).values.cost).toBe(40000n)
    expect(ok(calculateCpc({ spend: '1', clicks: '3' })).values.cost).toBe(33n)
    expect(ok(calculateCpc({ spend: '1', clicks: '8' })).values.cost).toBe(13n)
  })
  it('CPA preserves chosen acquisition definition while dividing attributed results', () => {
    for (const action of ['sale', 'lead', 'signup'] as const) {
      expect(ok(calculateCpa({ spend: '500000', acquisitions: '20', action }))).toMatchObject({ values: { cost: 2500000n }, action })
      expect(ok(calculateCpa({ spend: '1', acquisitions: '3', action })).values.cost).toBe(33n)
      expect(ok(calculateCpa({ spend: '1', acquisitions: '8', action })).values.cost).toBe(13n)
    }
  })
  it.each(costCases)('cost rounding handles half cents zero and tiny for $key', ({ engine, key, multiplier, extra }) => {
    expect(ok(engine({ spend: '1', [key]: String(200n * multiplier), ...extra })).values.cost).toBe(1n)
    const tiny = ok(engine({ spend: '1', [key]: String(200n * multiplier + 1n), ...extra }))
    expect(tiny.values.cost).toBe(0n); expect(tiny.tiny).toBe('positive')
    expect(ok(engine({ spend: '0', [key]: '1', ...extra }))).toMatchObject({ values: { cost: 0n }, tiny: undefined })
    invalid(engine({ spend: '0', [key]: '0', ...extra }), key)
    invalid(engine({ spend: '100', [key]: '0', ...extra }), key)
  })
  it.each(costCases)('maximum costs and counts retain integer precision for $key', ({ engine, key, multiplier, extra }) => {
    expect(ok(engine({ spend: maximum, [key]: '1', ...extra })).values.cost).toBe(BigInt(maximum) * multiplier * 100n)
    expect(ok(engine({ spend: maximum, [key]: maximum, ...extra })).values.cost).toBe(multiplier * 100n)
    const tiny = ok(engine({ spend: '1', [key]: maximum, ...extra })); expect(tiny.values.cost).toBe(0n); expect(tiny.tiny).toBe('positive')
  })
})
describe('social exact ratio invariants', () => {
  it('ER cross-product quantization and both basis modes agree numerically', () => {
    for (const n of [0n, 1n, 7n, 100n, 9999999999999n]) for (const denominator of [1n, 3n, 32n, 997n, 9999999999999n]) {
      const input = { ...one, likes: String(n), denominator: String(denominator) }
      const a = ok(calculateEngagement({ ...input, basis: 'reach' })), b = ok(calculateEngagement({ ...input, basis: 'followers' }))
      expect(a.values).toEqual(b.values); roundingError(a.values.rate!, n * 10000n, denominator)
      expect(a.overBasis).toBe(n > denominator)
    }
  })
  it('ER is invariant when every component and denominator are scaled together', () => {
    const a = ok(calculateEngagement(engagement)), b = ok(calculateEngagement({ ...engagement, likes: '700', comments: '140', saves: '70', shares: '35', denominator: '7000' }))
    expect(a.values.rate).toBe(b.values.rate)
  })
  it('growth delta reconstructs ending count with bounded signed quantization', () => {
    for (const start of [0n, 1n, 32n, 1000n, 9999999999999n]) for (const end of [0n, 1n, 31n, 2000n, 9999999999999n]) {
      const r = ok(calculateFollowerGrowth({ start: String(start), end: String(end) }))
      expect(r.values.change! + start).toBe(end)
      if (start) { roundingError(r.values.rate!, (end - start) * 10000n, start); expect(r.values.rate!).toBeGreaterThanOrEqual(-10000n) }
      else expect(r.values.rate).toBeNull()
    }
  })
  it.each(costCases)('cost cross-products scaling and monotonicity for $key', ({ engine, key, multiplier, extra }) => {
    for (const spend of [0n, 1n, 100n, 12345n, 9999999999999n]) for (const n of [1n, 3n, 8n, 200n, 9999999999999n]) {
      const r = ok(engine({ spend: String(spend), [key]: String(n), ...extra }))
      roundingError(r.values.cost!, spend * multiplier * 100n, n)
      if (n < 9999999999999n) expect(ok(engine({ spend: String(spend), [key]: String(n + 1n), ...extra })).values.cost!).toBeLessThanOrEqual(r.values.cost!)
    }
    expect(ok(engine({ spend: '1', [key]: '3', ...extra })).values.cost).toBe(ok(engine({ spend: '7', [key]: '21', ...extra })).values.cost)
  })
})
describe('social validation and formatting', () => {
  const fields = [
    ...['likes', 'comments', 'saves', 'shares', 'denominator'].map(key => ({ engine: calculateEngagement, key, valid: engagement })),
    ...['start', 'end'].map(key => ({ engine: calculateFollowerGrowth, key, valid: { start: '1000', end: '800' } })),
    { engine: calculateCpm, key: 'spend', valid: { spend: '100', impressions: '3' } },
    { engine: calculateCpm, key: 'impressions', valid: { spend: '100', impressions: '3' } },
    { engine: calculateCpc, key: 'spend', valid: { spend: '100', clicks: '3' } },
    { engine: calculateCpc, key: 'clicks', valid: { spend: '100', clicks: '3' } },
    { engine: calculateCpa, key: 'spend', valid: { spend: '100', action: 'lead', acquisitions: '3' } },
    { engine: calculateCpa, key: 'acquisitions', valid: { spend: '100', action: 'lead', acquisitions: '3' } },
  ]
  it.each(fields)('rejects malformed scalar $key for $engine', ({ engine, key, valid }) => {
    for (const value of ['', ' ', '-1', '1.1', '1,1', '1e3', '1_000', '1 000', 'NaN', 'Infinity', '10000000000000', 1, null, undefined]) invalid(engine({ ...valid, [key]: value }), key)
  })
  it('requires native denominator and action choices', () => {
    for (const basis of ['', 'impressions', 'views', null, undefined]) invalid(calculateEngagement({ ...engagement, basis }), 'basis')
    invalid(calculateEngagement({ ...engagement, denominator: '0' }), 'denominator')
    for (const action of ['', 'customer', null, undefined]) invalid(calculateCpa({ spend: '1', acquisitions: '1', action }), 'action')
  })
  it('rejects missing input objects without throwing and trims valid input', () => {
    for (const engine of [calculateEngagement, calculateFollowerGrowth, calculateCpm, calculateCpc, calculateCpa]) for (const input of [null, undefined, {}, [], '100']) invalid(engine(input))
    expect(ok(calculateCpc({ spend: ' 1 ', clicks: ' 3 ' })).values.cost).toBe(33n)
  })
  it('formats units signs undefined and subprecision without false zero', () => {
    expect(formatSocial(1350n, '%')).toBe('13,50%'); expect(formatSocial(2500n, 'growth')).toBe('+25,00%')
    expect(formatSocial(-313n, 'growth')).toBe('−3,13%'); expect(formatSocial(0n, 'growth')).toBe('0,00%')
    expect(formatSocial(250n, 'change')).toBe('+250'); expect(formatSocial(-200n, 'change')).toBe('−200')
    expect(formatSocial(0n, 'change')).toBe('0'); expect(formatSocial(1000n, 'count')).toBe('1.000')
    expect(formatSocial(100000n, 'IDR-whole')).toBe('Rp100.000'); expect(formatSocial(33n, 'IDR-cents')).toBe('Rp0,33')
    expect(formatSocial(0n, 'IDR-cents', 'positive')).toBe('<Rp0,01'); expect(formatSocial(0n, '%', 'positive')).toBe('<0,01%')
    expect(formatSocial(0n, 'growth', 'negative')).toContain('negatif'); expect(formatSocial(0n, 'growth', 'positive')).toContain('positif')
    expect(formatSocial(null, 'growth')).toBe('Tidak terdefinisi (pengikut awal nol)')
  })
  it('publishes precisely five social tools with complete sources and a real fourth hub', () => {
    expect(listPublished()).toHaveLength(96); expect(listCategory('media-sosial')).toHaveLength(10)
    expect(listCategory('keuangan')).toHaveLength(20); expect(listCategory('bisnis')).toHaveLength(20); expect(listCategory('marketplace')).toHaveLength(16)
    expect(listCategoryHubs()).toHaveLength(6); expect(listCategoryHubs()).toContainEqual({ name: 'Media Sosial', path: '/media-sosial' }); expect(sitemapPaths()).toHaveLength(103)
    const inventory = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8').split('\n').filter(l => /^\| (production-cost|calc-)/.test(l)).map(l => l.split('|').map(x => x.trim()))
    expect(inventory).toHaveLength(100); expect(new Set(inventory.map(x => x[1])).size).toBe(100); expect(inventory.filter(x => x[10] === 'published')).toHaveLength(96)
    for (const tool of listCategory('media-sosial').slice(0, 5)) {
      expect(tool.id).toBe(`calc-${tool.slug}`); expect(tool.officialSources.length).toBeGreaterThan(0); expect(tool.officialSources.every(s => s.verifiedAt === '2026-11-07')).toBe(true)
      expect(searchDirectory(listPublished().map(directoryEntry), tool.metadata.title).map(x => x.id)).toContain(tool.id)
    }
    for (const slug of ['tiktok-shop', 'shopee', 'estimasi-tiktok-kreator']) { expect(findPublished(slug)).toBeUndefined(); expect(sitemapPaths()).not.toContain(`/kalkulator/${slug}`) }
  })
})
