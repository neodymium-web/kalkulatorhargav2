import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import { fillAudit } from './audit-browser-helpers'
import { test, expect, type Page } from '@playwright/test'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const catalogue = JSON.parse(readFileSync('docs/audit/catalogue.json', 'utf8'))
const copyChanges: { id: string; before: string; after: string }[] = JSON.parse(readFileSync('docs/audit/cutover/metadata-copy-changes.json', 'utf8'))
const cases: { slug: string; id: string; input: Record<string, unknown> }[] = JSON.parse(readFileSync('docs/audit/oracles.json', 'utf8')).cases
const sample = new Set(['hpp','bep','food-cost','kpr','refinancing','npv','tiktok','ctr','bagi-tagihan','usia','ppn','pph-23','pph-4-ayat-2-sewa','gross-up-pajak','pph-final-umkm','pph-21-bulanan','pph-21-rekonsiliasi','pajak-impor','bphtb','pbb-p2','shopee','tiktok-shop','tokopedia','lazada'])
const widths = [320,375,768,1024,1440]

async function axe(page: Page) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  return page.evaluate(async () => {
    const api = (window as unknown as { axe: { run: (context: Document, options: unknown) => Promise<{ violations: { id: string; impact: string; description: string; helpUrl: string; nodes: { target: string[]; failureSummary: string }[] }[] }> } }).axe
    const r = await api.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] } })
    return r.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, helpUrl: v.helpUrl, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) }))
  })
}
async function reflow(page: Page, report: Record<string, unknown>, state = 'initial') {
  const results=[]
  for (const width of widths) { await page.setViewportSize({ width, height: 900 }); const actual = await page.evaluate(() => document.documentElement.scrollWidth); results.push({ width, actual }); expect(actual).toBe(width) }
  report[`reflow_${state}`] = results
}
async function seo(page: Page, html: string, url: string) {
  return page.evaluate(({ html, url }) => {
    const d = new DOMParser().parseFromString(html, 'text/html'); const jsonLd = [...d.querySelectorAll('script[type="application/ld+json"]')].map(el => el.textContent); d.querySelectorAll('script,style').forEach(el => el.remove())
    return { path: url, title: d.title, description: d.querySelector('meta[name=description]')?.getAttribute('content'), canonical: d.querySelector('link[rel=canonical]')?.getAttribute('href'), robots: d.querySelector('meta[name=robots]')?.getAttribute('content'), h1: [...d.querySelectorAll('main h1')].map(el => el.textContent), ssrCharacters: d.querySelector('main')?.textContent?.length ?? 0, headings: [...d.querySelectorAll('main h2,main h3')].map(el => el.textContent), links: [...new Set([...d.querySelectorAll('a[href]')].map(el => el.getAttribute('href')))], jsonLd }
  }, { html, url })
}
for (const route of catalogue.paths as string[]) test(`independent rendered audit ${route}`, async ({ page, isMobile }, info) => {
  const errors: string[] = [], requests: string[] = []
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) }); page.on('request', r => requests.push(r.url()))
  const width = isMobile ? 375 : 1440; await page.setViewportSize({ width, height: 900 })
  const response = await page.goto(route); expect(response?.status()).toBe(200)
  const report: Record<string, unknown> = { ...await seo(page, await response!.text(), route), http: response!.status(), xRobotsTag: response!.headers()['x-robots-tag'], viewport: width, baseline: catalogue.baseline, testedCommit: execFileSync('git', ['rev-parse','HEAD']).toString().trim() }
  expect(report.xRobotsTag).toBe('noindex, nofollow'); expect(new URL(String(report.canonical)).href).toBe(new URL(route, 'https://kalkulatorharga.com').href); expect(report.h1).toHaveLength(1); expect(String(report.title).length).toBeGreaterThan(5); expect(String(report.description).length).toBeGreaterThan(20); expect(report.ssrCharacters).toBeGreaterThan(200)
  for (const link of report.links as string[]) if (link?.startsWith('/') && !link.startsWith('//')) expect([...catalogue.paths, ...legacyPaths, ...supplementalPaths], `internal ${link}`).toContain(link.split('#')[0].split('?')[0] || '/')
  const c = cases.find(c => `/kalkulator/${c.slug}` === route), selected = !c || sample.has(c.slug)
  await reflow(page, report)
  await page.setViewportSize({ width, height: 900 })
  if (selected) { report.axeInitial = await axe(page); await page.screenshot({ path: info.outputPath('initial.jpg'), fullPage: true, quality: 70 }); await page.screenshot({ path: info.outputPath('initial-viewport.jpg'), quality: 80 }) }
  if (c) {
    const metadata = catalogue.tools.find((t: { slug: string }) => t.slug === c.slug)
    expect(report.title).toBe(`${metadata.metadata.title} | KalkulatorHarga`); expect(report.description).toBe(copyChanges.find(change => change.id === c.id)?.after ?? metadata.metadata.description)
    await fillAudit(page, c.input); await page.getByRole('button', { name: c.slug === 'hpp' ? 'Hitung HPP' : 'Hitung', exact: true }).press('Enter')
    const result = page.getByRole('region', { name: 'Hasil perhitungan', exact: true })
    await expect(result.locator('dd').first()).toBeVisible(); await expect(page.getByRole('form').getByRole('alert')).toHaveCount(0)
    report.id = c.id; report.slug = c.slug; report.resultText = await result.innerText()
    await reflow(page, report, 'result'); await page.setViewportSize({ width, height: 900 })
    if (selected) {
      report.axeResult = await axe(page); await page.screenshot({ path: info.outputPath('result-full.jpg'), fullPage: true, quality: 70 }); await result.screenshot({ path: info.outputPath('result.jpg'), quality: 80 }); await result.scrollIntoViewIfNeeded(); await page.screenshot({ path: info.outputPath('result-viewport.jpg'), quality: 80 })
    }
    const field = c.slug === 'volume-beton' ? page.locator('[name="elements.0.length"]') : page.getByRole('form').locator('input').first(); const previous = await field.inputValue(); await field.fill(''); await expect(result.locator('dd')).toHaveCount(0)
    await page.getByRole('button', { name: c.slug === 'hpp' ? 'Hitung HPP' : 'Hitung', exact: true }).click()
    await expect(result.locator('dd')).toHaveCount(0); await expect(page.getByRole('form').getByRole('alert')).toBeVisible(); report.invalidFocus = await field.evaluate(el => document.activeElement === el)
    expect(report.invalidFocus).toBe(true)
    if (selected) await page.getByRole('form').screenshot({ path: info.outputPath('invalid-form.jpg'), quality: 70 })
    await field.fill(previous); report.workflow = 'baseline + cleared required input + stale removal + invalid focus'
  } else {
    const more = page.getByRole('button', { name: 'Muat lebih banyak', exact: true }); if (await more.count()) { await more.press('Enter'); report.cardsAfterMore = await page.locator('main section ul > li').count() }
  }
  expect(errors).toEqual([]); report.errors = errors
  report.externalRequests = requests.filter(url => !url.startsWith('http://127.0.0.1:3100/'))
  expect(report.externalRequests).toEqual([])
  mkdirSync(info.outputDir, { recursive: true }); writeFileSync(info.outputPath('audit.json'), JSON.stringify(report, null, 2))
})
test('audit sitemap robots unknown routes injection and input privacy', async ({ page, request }, info) => {
  const xml = await (await request.get('/sitemap.xml')).text(), robots = await (await request.get('/robots.txt')).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]); expect(urls).toHaveLength(107 + legacyPaths.length + supplementalPaths.length); expect(new Set(urls).size).toBe(107 + legacyPaths.length + supplementalPaths.length); expect(urls.sort()).toEqual([...catalogue.paths, ...legacyPaths, ...supplementalPaths].map((p: string) => `https://kalkulatorharga.com${p}`).sort()); expect(robots).toContain('Disallow: /')
  for (const p of ['/kalkulator/tidak-ada-audit','/kalkulator/%3Cscript%3E','/kalkulator/__proto__']) expect((await request.get(p)).status()).toBe(404)
  const sent: string[]=[]; page.on('request', r => sent.push(r.url())); await page.goto('/kalkulator/shopee')
  const c = cases.find(c => c.slug === 'shopee')!; const input = structuredClone(c.input); const payload='<img src=x onerror="window.__auditXss=1">'; (input.fees as Record<string, unknown>[])[0].label=payload
  await fillAudit(page,input); await page.getByRole('button',{name:'Hitung',exact:true}).click(); await expect(page.getByRole('table').getByRole('rowheader').first()).toHaveText(payload)
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__auditXss)).toBeUndefined(); expect(sent.some(u=>u.includes('onerror')||u.includes('1237'))).toBe(false)
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie }))).toEqual({local:[],session:[],cookie:''})
  await info.attach('indexing-and-privacy.json',{body:JSON.stringify({urls,robots,requests:sent,xssExecuted:false,storage:'empty'}),contentType:'application/json'})
})
