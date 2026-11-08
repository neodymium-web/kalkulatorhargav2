import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fillAudit } from './audit-browser-helpers'
const cases = JSON.parse(readFileSync('docs/audit/oracles.json','utf8')).cases
for (const slug of ['hpp','kpr','tiktok','bagi-tagihan','usia','pph-21-bulanan','pajak-impor','shopee','tiktok-shop','tokopedia','lazada']) test(`WebKit emulated iPhone audited ${slug}`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`/kalkulator/${slug}`);await fillAudit(page,cases.find((c:{slug:string})=>c.slug===slug).input)
 await page.getByRole('button',{name:slug==='hpp'?'Hitung HPP':'Hitung',exact:true}).press('Enter');await expect(page.getByRole('region',{name:'Hasil perhitungan',exact:true}).locator('dd').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));expect(errors).toEqual([])
 await page.screenshot({path:info.outputPath(`${slug}-webkit.jpg`),fullPage:true,quality:70})
})
