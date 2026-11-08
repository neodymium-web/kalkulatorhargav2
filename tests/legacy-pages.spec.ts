import { test, expect, type Page } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import sources from '../docs/audit/legacy55/source-pages.json'
import blocked from '../docs/audit/legacy55/blocked.json'
import { legacyPaths } from '../lib/legacy/routes'
const catalogue=JSON.parse(readFileSync('docs/audit/catalogue.json','utf8'))
const paths=[...catalogue.paths,...legacyPaths]
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim()
async function accessibility(page:Page) {
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')})
  return page.evaluate(async()=>{
    const api=(window as unknown as {axe:{run:(doc:Document,options:unknown)=>Promise<{violations:{id:string;nodes:unknown[]}[]}>}}).axe
    return (await api.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}})).violations
  })
}
for(const source of sources)test(`legacy disposition and independent source text ${source.path}`,async({page,request,isMobile},info)=>{
  const response=await request.get(source.path,{maxRedirects:0})
  writeFileSync(info.outputPath('legacy-outcome.json'),JSON.stringify({path:source.path,status:response.status(),observedAtUtc:new Date().toISOString()}))
  if(source.path in blocked){expect(response.status()).toBe(404);expect(paths).not.toContain(source.path);return}
  expect(response.status()).toBe(200);expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow')
  const errors:string[]=[],external:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3100/'))external.push(r.url())})
  await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto(source.path)
  await expect(page.locator('main h1')).toHaveText(source.h1);await expect(page).toHaveTitle(source.title)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://kalkulatorharga.com'+source.path)
  await expect(page.getByRole('complementary',{name:'Status review arsip'})).toContainText('menunggu review pemilik')
  expect(normalize(await page.locator('[data-legacy-source]').evaluate(el=>{const copy=el.cloneNode(true)as HTMLElement;copy.querySelectorAll('[data-legacy-annotation]').forEach(n=>n.remove());return copy.textContent??''}))).toBe(normalize(source.text.replaceAll('Ruang iklan','')))
  expect(await page.locator('[data-legacy-source] time').evaluateAll(ns=>ns.filter(n=>!n.closest('[data-legacy-annotation]')).map(n=>({datetime:n.getAttribute('datetime'),text:n.textContent})))).toEqual(source.dates)
  expect(await page.locator('[data-legacy-source] script,[data-legacy-source] iframe,[data-legacy-source] img,[data-legacy-source] input,[data-legacy-source] button').count()).toBe(0)
  const links=await page.locator('main a[href]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')!))
  for(const href of links){expect(href).not.toMatch(/^(javascript|data|vbscript):/i);if(href.startsWith('/')&&!href.startsWith('//'))expect(paths).toContain(href.split(/[?#]/)[0]||'/')}
  for(const width of[320,375,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth),source.path+' '+width).toBe(width)}
  await page.setViewportSize({width:isMobile?375:1440,height:900})
  const violations=await accessibility(page);await info.attach('accessibility.json',{body:JSON.stringify(violations),contentType:'application/json'});expect(violations).toEqual([])
  const toc=page.getByRole('navigation',{name:'Daftar isi artikel'});if(await toc.count()){const first=toc.getByRole('link').first();await first.focus();await first.press('Enter');expect(await page.evaluate(()=>location.hash)).toMatch(/^#legacy-section-/)}
  await page.screenshot({path:info.outputPath('legacy-full.jpg'),fullPage:true,scale:'css',quality:70});await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(null)))) });await page.screenshot({path:info.outputPath('legacy-viewport.jpg'),scale:'css',quality:80})
  expect(errors).toEqual([]);expect(external).toEqual([])
})
test('blog and every inherited archive work without JS and preserve external legacy feature destinations',async({browser},info)=>{
  const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage()
  await page.goto('http://127.0.0.1:3100/');await page.locator('footer a[href="/blog"]').press('Enter');await expect(page).toHaveURL(/\/blog$/)
  const nav=page.getByRole('navigation',{name:'Arsip legacy yang tersedia'});await expect(nav.getByRole('link')).toHaveCount(22)
  for(const path of legacyPaths){await page.goto('http://127.0.0.1:3100'+path);await expect(page.locator('main h1')).toHaveCount(1);expect(normalize(await page.locator('[data-legacy-source]').evaluate(el=>{const copy=el.cloneNode(true)as HTMLElement;copy.querySelectorAll('[data-legacy-annotation]').forEach(n=>n.remove());return copy.textContent??''}))).toBe(normalize(sources.find(p=>p.path===path)!.text.replaceAll('Ruang iklan','')))}
  await page.goto('http://127.0.0.1:3100/blog/kalkulator-average-down-saham-harga-rata-rata');await expect(page.locator('[data-legacy-source] a[href="https://www.kalkulatorharga.com/kalkulator/emas"]')).toHaveCount(1)
  await page.screenshot({path:info.outputPath('legacy-nojs.jpg'),fullPage:true,scale:'css',quality:70});await context.close()
})
test('archive tables support keyboard scrolling and text resizing without clipping',async({page})=>{
 await page.setViewportSize({width:375,height:900});await page.goto('/biaya-admin-marketplace')
 const table=page.locator('[data-legacy-source] [role=region]').first();await table.focus();await table.press('ArrowRight');await expect.poll(()=>table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0)
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%'});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375)
 await expect(page.locator('main h1')).toBeVisible();await table.focus();await expect(table).toBeFocused()
})
