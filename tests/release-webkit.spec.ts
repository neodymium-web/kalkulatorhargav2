import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fillAudit } from './audit-browser-helpers'
const cases = JSON.parse(readFileSync('docs/audit/oracles.json','utf8')).cases
for (const slug of ['hpp','kpr','tiktok','bagi-tagihan','usia','pph-21-bulanan','pajak-impor','shopee','tiktok-shop','tokopedia','lazada']) test(`WebKit emulated iPhone audited ${slug}`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`/kalkulator/${slug}`);await fillAudit(page,cases.find((c:{slug:string})=>c.slug===slug).input)
 await page.getByRole('button',{name:slug==='hpp'?'Hitung HPP':'Hitung',exact:true}).press('Enter');await expect(page.getByRole('region',{name:'Hasil perhitungan',exact:true}).locator('dd').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));expect(errors).toEqual([])
 await info.attach('page-dimensions.json',{body:JSON.stringify(await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,dpr:devicePixelRatio}))),contentType:'application/json'})
 await page.screenshot({path:info.outputPath(`${slug}-webkit.jpg`),fullPage:true,scale:'css',quality:70})
})

const legacySources: {path:string;h1:string;text:string}[]=JSON.parse(readFileSync('docs/audit/legacy55/source-pages.json','utf8'))
const deferred=JSON.parse(readFileSync('docs/audit/legacy55/blocked.json','utf8'))
for(const source of legacySources.filter(p=>!(p.path in deferred)))test(`WebKit inherited source parity ${source.path}`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(source.path);expect(response?.status()).toBe(200)
 await expect(page.locator('main h1')).toHaveText(source.h1)
 expect((await page.locator('[data-legacy-source]').evaluate(el=>{const copy=el.cloneNode(true)as HTMLElement;copy.querySelectorAll('[data-legacy-annotation]').forEach(n=>n.remove());return copy.textContent??''})).replace(/\s+/g,' ').trim()).toBe(source.text.replaceAll('Ruang iklan','').replace(/\s+/g,' ').trim())
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));expect(errors).toEqual([])
 await page.screenshot({path:info.outputPath('legacy-webkit.jpg'),fullPage:true,scale:'css',quality:70})
})
