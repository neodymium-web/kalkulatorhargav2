import { afterEach, expect, it, vi } from 'vitest'
import { listPublished, sitemapPaths } from '../lib/registry'
import { publishedPaths } from '../lib/published-paths'
import { legacyPaths } from '../lib/legacy/routes'
import { legacyPages } from '../lib/legacy/registry'
import { migrationPaths } from '../lib/migration/routes'
import { supplementalPaths } from '../lib/supplemental/routes'
const { inventory } = require('../scripts/post-migration-seo/inventory.cjs')

const critical = ['/kalkulator/tiktok', '/kalkulator/emas', '/kalkulator/saham/average', '/kalkulator/tiktok/benchmark', '/kalkulator/hpp', '/kalkulator/shopee', '/kalkulator/tiktok-shop']
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

it('accounts for canonical tools, retained directory alias and pending legacy without granting approval', () => {
    const rows = inventory({ tools: listPublished(), registryPaths: sitemapPaths(), published: publishedPaths(), legacyPaths, legacyPages, migrationPaths, supplementalPaths }).rows as { path: string; family: string; sitemap: boolean; publication: string; indexPolicy: string; canonicalPath: string }[]
    expect(rows).toHaveLength(134)
    expect(new Set(rows.map(r => r.path)).size).toBe(134)
    expect(rows.filter(r => r.family === 'calculator').map(r => r.path).sort()).toEqual(listPublished().map(t => t.path).sort())
    expect(rows.filter(r => r.sitemap)).toHaveLength(111)
    expect(rows.filter(r => r.family === 'legacy')).toHaveLength(22)
    expect(rows.filter(r => r.family === 'legacy').every(r => !r.sitemap && r.indexPolicy === 'noindex' && r.publication === 'PENDING_OWNER_APPROVAL')).toBe(true)
    expect(rows.find(r => r.path === '/kalkulator')).toMatchObject({ canonicalPath: '/', sitemap: false, indexPolicy: 'canonicalized' })
    for (const p of critical) expect(rows.find(r => r.path === p)).toMatchObject({ sitemap: true, indexPolicy: 'indexable' })
})

it.each(['production', 'preview', 'development'])('retains the SEO contract in %s even with release flags supplied', async (environment) => {
  vi.resetModules(); vi.stubEnv('VERCEL_ENV', environment); vi.stubEnv('SITE_INDEXABLE', 'true'); vi.stubEnv('MIGRATION_CUTOVER_APPROVED', 'true')
  const sitemap = (await import('../app/sitemap')).default()
  const robots = (await import('../app/robots')).default()
  const { canonicalOrigin, indexable } = await import('../lib/seo')
  if (environment === 'production') {
    expect(canonicalOrigin).toBe('https://www.kalkulatorharga.com'); expect(indexable).toBe(true)
    expect(sitemap).toHaveLength(111); expect(robots).toEqual({ rules: { userAgent: '*', allow: '/' }, sitemap: canonicalOrigin + '/sitemap.xml' })
  } else {
    expect(indexable).toBe(false); expect(canonicalOrigin).toBe('https://kalkulatorharga.com')
    expect(sitemap).toHaveLength(133); expect(robots).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  }
  expect(new Set(sitemap.map(r => r.url)).size).toBe(sitemap.length)
  for (const p of critical) expect(sitemap.some(r => new URL(r.url).pathname === p)).toBe(true)
  expect(sitemap.some(r => new URL(r.url).pathname === '/kalkulator')).toBe(false)
})
