const { expectedArchive } = require('../scripts/legacy/editorial-contract.cjs')
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
 expect((await page.locator('[data-legacy-source]').evaluate(el=>{const copy=el.cloneNode(true)as HTMLElement;copy.querySelectorAll('[data-legacy-annotation]').forEach(n=>n.remove());return copy.textContent??''})).replace(/\s+/g,' ').trim()).toBe(expectedArchive(source.path).expectedText)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));expect(errors).toEqual([])
 await page.screenshot({path:info.outputPath('legacy-webkit.jpg'),fullPage:true,scale:'css',quality:70})
})

import{goldFixture,scenarioFixture,comparisonPlatforms,fillFields,addManualFees}from'./deferred-browser-helpers'
test('WebKit manual gold oracle and stale quote suppress amounts',async({page},info)=>{
 await page.goto('/kalkulator/emas');const form=page.getByRole('form');await fillFields(form,goldFixture);await form.getByRole('button',{name:'Hitung emas',exact:true}).click();await expect(page.getByRole('region',{name:'Hasil perhitungan',exact:true}).locator('dd').first()).toHaveText('Rp 6.720.000')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth));await page.screenshot({path:info.outputPath('gold-webkit.jpg'),fullPage:true,scale:'css',quality:70})
 await fillFields(form,{asOf:'2026-11-09'});await form.getByRole('button',{name:'Hitung emas',exact:true}).click();await expect(page.getByRole('region',{name:'Hasil perhitungan',exact:true})).toContainText('kedaluwarsa');await expect(page.getByRole('table')).toHaveCount(0)
})
test('WebKit manual four-channel ledger and ranking invalidation',async({page},info)=>{
 await page.goto('/bandingkan');for(const name of comparisonPlatforms){const form=page.getByRole('form',{name:`Skenario ${name}`,exact:true});await fillFields(form,scenarioFixture);await addManualFees(form);await form.getByRole('button',{name:'Hitung',exact:true}).click()}
 const region=page.getByRole('region',{name:'Perbandingan empat kanal'});await expect(region.getByRole('table')).toBeVisible();await expect(region).toContainText('Rp 89.500');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth))
 await page.screenshot({path:info.outputPath('comparison-webkit.jpg'),fullPage:true,scale:'css',quality:70});await fillFields(page.getByRole('form',{name:'Skenario Shopee',exact:true}),{taxScope:'unknown'});await expect(region.getByRole('table')).toHaveCount(0);await expect(region).toContainText('UNKNOWN')
})
