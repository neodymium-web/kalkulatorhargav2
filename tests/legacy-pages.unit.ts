import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { legacyPages, legacyLink, type LegacyNode } from '../lib/legacy/registry'
import { legacyPaths } from '../lib/legacy/routes'
import { listPublished, listCategoryHubs, sitemapPaths } from '../lib/registry'
import { canonicalOrigin, indexable } from '../lib/seo'
import sources from '../docs/audit/legacy55/source-pages.json'
import blocked from '../docs/audit/legacy55/blocked.json'
const { readCsv } = require('../scripts/migration/csv.cjs')
const normalize = (s: string) => s.replace(/\s+/g,' ').trim()
function text(n: LegacyNode): string { return typeof n === 'string' ? n : n.children.map(text).join('') }
function nodes(n: LegacyNode): Exclude<LegacyNode,string>[] { return typeof n === 'string' ? [] : [n,...n.children.flatMap(nodes)] }

describe('independent legacy source inventory and explicit dispositions', () => {
  for (const source of sources) it(source.path, () => {
    expect(source.status).toBe(200); expect(source.finalUrl).toBe(source.url)
    expect(createHash('sha256').update(source.text).digest('hex')).toBe(source.textSha256)
    const page=legacyPages.find(p=>p.path===source.path)
    if (source.path in blocked) { expect(page).toBeUndefined(); expect(legacyPaths).not.toContain(source.path); return }
    expect(page).toBeDefined(); expect(page!.title).toBe(source.title); expect(page!.h1).toBe(source.h1)
    expect(normalize(text(page!.tree))).toBe(normalize(source.text.replaceAll('Ruang iklan','')))
    expect(page!.dates).toEqual(source.dates); expect(page!.sha256).toBe(source.sha256)
    expect(page!.approval).toBe('PENDING_OWNER_REVIEW'); expect(page!.reviewNotice).toContain('bukan data resmi terbaru')
    const treeNodes=nodes(page!.tree)
    expect(treeNodes.filter(n=>n.tag==='h1').map(text)).toEqual([source.h1])
    for (const n of treeNodes) { expect(['script','iframe','img','input','button','select','style']).not.toContain(n.tag); expect(Object.keys(n.attrs).every(k=>['href','datetime','colspan','rowspan','scope','start'].includes(k))).toBe(true) }
  })
  it('preserves 100 calculator records and adds only actual archives to 107 baseline URLs', () => {
    expect(listPublished()).toHaveLength(100); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(107)
    expect(legacyPages).toHaveLength(22); expect(legacyPaths).toHaveLength(22); expect(new Set([...sitemapPaths(),...legacyPaths]).size).toBe(129)
    const before=readCsv('docs/audit/legacy55/cutover-url-map-before.csv'),after=readCsv('docs/audit/cutover-url-map.csv')
    expect(before).toHaveLength(107);expect(after.slice(0,107)).toEqual(before);expect(after.slice(107).map((r:{v2_route:string})=>r.v2_route).sort()).toEqual([...legacyPaths].sort())
    const decisions=readCsv('docs/audit/legacy-page-decisions.csv'),parity=readCsv('docs/audit/legacy-content-parity.csv')
    expect(decisions).toHaveLength(25);expect(parity).toHaveLength(25);expect(new Set(decisions.map((r:{path:string})=>r.path)).size).toBe(25)
    expect(parity.filter((r:{outcome:string})=>r.outcome==='BLOCKED')).toHaveLength(3)
    expect(canonicalOrigin).toBe('https://kalkulatorharga.com');expect(indexable).toBe(false)
    expect(readFileSync('next.config.ts','utf8')).not.toMatch(/redirects\s*\(/)
  })
  it('resolves only archive links locally without implying calculator feature parity', () => {
    expect(legacyLink('/blog/fee-shopee-2026')).toBe('/blog/fee-shopee-2026')
    expect(legacyLink('/kalkulator/emas')).toBe('https://www.kalkulatorharga.com/kalkulator/emas')
    expect(legacyLink('/kalkulator/tiktok')).toBe('https://www.kalkulatorharga.com/kalkulator/tiktok')
    expect(legacyLink('/kalkulator/tiktok-shop')).toBe('https://www.kalkulatorharga.com/kalkulator/tiktok-shop')
    expect(legacyLink('/?marketplace=shopee')).toBe('https://www.kalkulatorharga.com/?marketplace=shopee')
    for(const href of ['javascript:alert(1)','data:text/html,alert(1)','vbscript:alert(1)','file:///tmp/x'])expect(legacyLink(href)).toBeUndefined()
  })
})
