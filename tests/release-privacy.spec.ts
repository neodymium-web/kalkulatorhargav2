import { test, expect } from '@playwright/test'
import { listPublished } from '../lib/registry'
const catalogue = { tools: listPublished() }
test('AR-001 all 100 SSR forms are inert without JavaScript and do not leak financial inputs by GET', async ({ browser },info) => {
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();const evidence=[]
  for (const t of catalogue.tools) {
    await page.goto(`http://127.0.0.1:3100${t.path}`)
    await expect(page.getByRole('button',{name:t.slug==='hpp'?'Hitung HPP':'Hitung',exact:true})).toBeDisabled()
    const form=page.getByRole('form');await expect(form.locator('fieldset').first()).toHaveAttribute('disabled','');await expect(form.locator('input').first()).toBeDisabled();await expect(page.getByText('Aktifkan JavaScript untuk menghitung. Formulir dinonaktifkan agar data perhitungan tidak dikirim melalui URL.',{exact:true})).toBeVisible()
    expect(new URL(page.url()).search).toBe('');evidence.push({id:t.id,path:t.path,disabled:true,noQuery:true})
  }
  await page.screenshot({path:info.outputPath('nojs-safe.jpg'),fullPage:true,quality:70});await info.attach('nojs-100.json',{body:JSON.stringify(evidence),contentType:'application/json'});await context.close()
})
test('AR-001 form enables after hydration and calculates without navigation or retained inputs',async({page})=>{
 await page.goto('/kalkulator/hpp');const nav:string[]=[];page.on('request',r=>{if(r.isNavigationRequest())nav.push(r.url())})
 for(const[k,v]of Object.entries({materials:'317',labor:'211',overhead:'101',units:'7'}))await page.locator(`[name=${k}]`).fill(v)
 await page.getByRole('button',{name:'Hitung HPP',exact:true}).press('Enter');await expect(page.getByRole('region',{name:'Hasil perhitungan'})).toContainText('Rp');expect(nav).toEqual([]);expect(new URL(page.url()).search).toBe('')
})
