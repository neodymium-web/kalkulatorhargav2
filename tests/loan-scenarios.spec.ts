import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; inputs: Record<string,string>; primary: string; detail: string; invalid: string; bad: string; table?: string }
const fixtures: Fixture[] = [
 {slug:'bunga-efektif-pinjaman',title:'Kalkulator Bunga Efektif Pinjaman',inputs:{proceeds:'1000',disbursed:'2023-01-01','repayments.0.amount':'1100','repayments.0.date':'2024-01-01'},primary:'10,0000%',detail:'Rp1.100',invalid:'repayments.0.date',bad:'2023-01-01',table:'Rincian 1 pembayaran bertanggal'},
 {slug:'kpr',title:'Kalkulator KPR Fixed dan Floating',inputs:{price:'1200',down:'200',months:'3',fixedRate:'12',fixedMonths:'1',nextRate:'24',fees:'50'},primary:'Rp1.280',detail:'Rp345',invalid:'down',bad:'1201',table:'Jadwal KPR dua fase (3 bulan)'},
 {slug:'pelunasan-dipercepat',title:'Kalkulator Pelunasan Dipercepat',inputs:{principal:'1000',months:'3',rate:'12',extra:'400',eventMonth:'1',penalty:'2'},primary:'Rp5',detail:'Rp1.015',invalid:'eventMonth',bad:'3',table:'Jadwal Dengan tambahan dan penalti (3 bulan)'},
 {slug:'refinancing',title:'Kalkulator Refinancing Pinjaman',inputs:{principal:'1000',months:'3',oldRate:'12',newRate:'0',newMonths:'3',cost:'14'},primary:'Bulan 2',detail:'Rp6',invalid:'newMonths',bad:'0',table:'Perbandingan kas kumulatif refinancing'},
 {slug:'kurs-mata-uang',title:'Kalkulator Kurs Mata Uang USD dan IDR',inputs:{direction:'usd-idr',amount:'100.25',rate:'15000.5',fee:'1000'},primary:'Rp1.502.800',detail:'Rp1.503.800',invalid:'fee',bad:'2000000'},
]
async function fill(page: Page, values: Record<string,string>) {
 for(const [name,value] of Object.entries(values)){
  const field=page.locator(`[name="${name}"]`)
  if(name==='direction')await field.selectOption(value)
  else await field.fill(value)
 }
}
const submit = (page:Page)=>page.getByRole('button',{name:'Hitung',exact:true}).click()
const result = (page:Page)=>page.getByRole('region',{name:'Hasil perhitungan'})
for(const f of fixtures)test(`loan scenarios results invalid and tables: ${f.slug}`,async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900})
 const response=await page.goto(`/kalkulator/${f.slug}`)
 expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
 await expect(page.getByRole('heading',{level:1})).toHaveText(f.title)
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://kalkulatorharga.com/kalkulator/${f.slug}`)
 await expect(result(page)).toContainText('Isi semua kolom')
 await fill(page,f.inputs)
 await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter')
 await expect(result(page).locator('dd').first()).toHaveText(f.primary)
 await expect(result(page)).toContainText(f.detail)
 if(f.table){
  const summary=page.locator('summary').filter({hasText:f.table})
  await summary.focus();await summary.press('Enter')
  const table=page.getByRole('table',{name:f.table,exact:true})
  await expect(table).toBeVisible()
  const region=page.getByRole('region',{name:f.table,exact:true})
  await region.focus();await expect(region).toBeFocused();await region.press('ArrowRight')
  if(f.slug==='kpr')await expect(table.locator('tfoot th, tfoot td')).toHaveText(['Total','Rp1.030','Rp0','Rp0','Rp1.030','Rp1.000','Rp30','Rp0'])
  if(f.slug==='pelunasan-dipercepat')await expect(table.locator('tfoot th, tfoot td')).toHaveText(['Total','Rp613','Rp400','Rp2','Rp1.015','Rp1.000','Rp13','Rp0'])
  await page.locator('details').filter({has:table}).screenshot({path:info.outputPath(`${f.slug}-rincian.jpg`),quality:75})
 }
 await page.screenshot({path:info.outputPath(`${f.slug}.jpg`),fullPage:true,quality:75})
 await result(page).screenshot({path:info.outputPath(`${f.slug}-hasil.jpg`),quality:75})
 await page.locator(`[name="${f.invalid}"]`).fill(f.bad)
 await expect(result(page)).toContainText('Isi semua kolom')
 await expect(page.locator('details')).toHaveCount(0)
 await submit(page)
 await expect(page.locator(`[name="${f.invalid}"]`)).toBeFocused()
 await expect(page.locator(`[name="${f.invalid}"]`)).toHaveAttribute('aria-invalid','true')
 await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
 await page.screenshot({path:info.outputPath(`${f.slug}-invalid.jpg`),fullPage:true,quality:75})
})
test('dated repayments add delete preserve values dates and focus',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900})
 await page.goto('/kalkulator/bunga-efektif-pinjaman')
 await fill(page,{proceeds:'1000',disbursed:'2024-01-01','repayments.0.amount':'550','repayments.0.date':'2024-07-01'})
 await page.getByRole('button',{name:'Tambah pembayaran',exact:true}).click()
 await expect(page.locator('[name="repayments.1.amount"]')).toBeFocused()
 await fill(page,{'repayments.1.amount':'600','repayments.1.date':'2025-01-01'})
 await submit(page);await expect(result(page).locator('dd').first()).toHaveText('20,3129%')
 await page.locator('summary').press('Enter')
 await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('td').first()).toHaveText('366')
 await result(page).screenshot({path:info.outputPath('dated-irregular-hasil.jpg'),quality:75})
 await page.getByRole('button',{name:'Hapus pembayaran 1',exact:true}).click()
 await expect(page.locator('[name="repayments.0.amount"]')).toBeFocused()
 await expect(page.locator('[name="repayments.0.amount"]')).toHaveValue('600')
 await expect(page.locator('[name="repayments.0.date"]')).toHaveValue('2025-01-01')
 await expect(page.getByRole('button',{name:'Hapus pembayaran 1',exact:true})).toBeDisabled()
 await expect(page.getByText('Maksimal 100 pembayaran.',{exact:true})).toBeVisible()
 await expect(page.locator('details')).toHaveCount(0)
})
test('dated negative zero and unsupported yields do not invent a result',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto('/kalkulator/bunga-efektif-pinjaman');await fill(page,fixtures[0].inputs)
 await fill(page,{'repayments.0.amount':'900'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('−10,0000%')
 await result(page).screenshot({path:info.outputPath('dated-negatif.jpg'),quality:75})
 await fill(page,{'repayments.0.amount':'1000'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('0,0000%')
 await fill(page,{'repayments.0.amount':'9999999999999','repayments.0.date':'2023-01-02'});await submit(page)
 await expect(page.locator('[name=proceeds]')).toBeFocused();await expect(page.getByRole('form')).toContainText('di luar batas pencarian');await expect(result(page).locator('dd')).toHaveCount(0)
 await page.screenshot({path:info.outputPath('dated-di-luar-batas.jpg'),quality:75,fullPage:true})
})
test('KPR zero full fixed and full DP scenarios clear stale schedules',async({page})=>{
 await page.goto('/kalkulator/kpr');await fill(page,{...fixtures[1].inputs,fixedRate:'0',nextRate:'0',fixedMonths:'0'});await submit(page)
 await expect(result(page)).toContainText('Rp1.250');await expect(result(page)).toContainText('Rp334')
 await fill(page,{fixedMonths:'3'});await expect(page.locator('details')).toHaveCount(0);await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp1.250')
 await fill(page,{down:'1200'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp1.250');await expect(result(page).locator('dd').nth(1)).toHaveText('Rp0')
})
test('early high penalty negative savings cap extra and zero extra',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto('/kalkulator/pelunasan-dipercepat');await fill(page,{...fixtures[2].inputs,penalty:'10'});await submit(page)
 await expect(result(page).locator('dd').first()).toHaveText('−Rp3');await result(page).screenshot({path:info.outputPath('pelunasan-neto-negatif.jpg'),quality:75})
 await fill(page,{rate:'0',extra:'9999',penalty:'5'});await submit(page);await expect(result(page)).toContainText('Rp666');await expect(result(page).locator('dd').first()).toHaveText('−Rp5')
 await fill(page,{extra:'0',penalty:'0'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp0')
})
test('refinance temporary no and month zero permanent crossings are distinct',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto('/kalkulator/refinancing')
 await fill(page,{...fixtures[3].inputs,oldRate:'0',newRate:'12',newMonths:'6',cost:'10'});await submit(page)
 await expect(result(page).locator('dd').first()).toHaveText('Tidak tercapai pada skenario ini')
 await expect(result(page)).toContainText('Bulan 1');await expect(result(page)).toContainText('−Rp45')
 await page.locator('summary').first().press('Enter')
 await expect(page.getByRole('table').first().locator('tbody tr').last().locator('th,td')).toHaveText(['6','Rp0','Rp170','−Rp45'])
 await result(page).screenshot({path:info.outputPath('refinancing-impas-sementara.jpg'),quality:75})
 await page.locator('details').first().screenshot({path:info.outputPath('refinancing-kumulatif.jpg'),quality:75})
 await fill(page,{...fixtures[3].inputs,cost:'21'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Tidak tercapai pada skenario ini');await expect(result(page).locator('dd').nth(1)).toHaveText('Tidak tercapai')
 await fill(page,{newRate:'12',cost:'0'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Bulan 0')
})
test('FX reverse precision fee bound and subunit result',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto('/kalkulator/kurs-mata-uang')
 await fill(page,{direction:'idr-usd',amount:'100000',rate:'15000',fee:'0.10'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('USD6,57')
 await result(page).screenshot({path:info.outputPath('kurs-idr-usd.jpg'),quality:75})
 await fill(page,{amount:'1',rate:'200',fee:'0'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('USD0,01')
 await fill(page,{fee:'0.01'});await submit(page);await expect(page.locator('[name=fee]')).toBeFocused();await expect(page.getByRole('form')).toContainText('sebelum pembulatan')
 await fill(page,{rate:'1000',fee:'0'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('<USD0,01 (positif)')
 await result(page).screenshot({path:info.outputPath('kurs-subunit.jpg'),quality:75})
 await page.locator('[name=direction]').selectOption('usd-idr');await expect(result(page)).toContainText('Isi semua kolom')
})
test('finance twenty tools pagination search sitemap and staging protections',async({page,request,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});const response=await page.goto('/keuangan');expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
 const listing=page.getByRole('region',{name:'Kalkulator tersedia'});await expect(listing.getByRole('link')).toHaveCount(12);await listing.getByRole('button',{name:'Muat lebih banyak'}).click();await expect(listing.getByRole('link')).toHaveCount(20)
 await expect(listing.locator('a[href="/kalkulator/inflasi"]')).toBeFocused()
 for(const f of fixtures)await expect(listing.locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible()
 await page.screenshot({path:info.outputPath('keuangan-20-alat.jpg'),fullPage:true,quality:75})
 for(const f of fixtures){await page.goto('/');await page.getByRole('searchbox').fill(f.title);await expect(page.getByRole('region',{name:'Hasil pencarian'}).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible()}
 const xml=await(await request.get('/sitemap.xml')).text();expect(xml.match(/<loc>/g)).toHaveLength(103)
 for(const f of fixtures)expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
 for(const slug of ['tiktok-shop','shopee']){expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404);expect(xml).not.toContain(`/kalkulator/${slug}</loc>`);await page.goto('/');await page.getByRole('searchbox').fill(slug.replaceAll('-',' '));await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0)}
 expect((await(await request.get('/robots.txt')).text())).toContain('Disallow: /')
})
test('all loan forms tables and results fit every design width',async({page,isMobile})=>{
 if(isMobile)return
 test.setTimeout(90000)
 for(const width of [320,375,768,1024,1440]){
  await page.setViewportSize({width,height:900})
  for(const f of fixtures){
   await page.goto(`/kalkulator/${f.slug}`);await fill(page,f.inputs);await submit(page)
   for(const summary of await page.locator('summary').all())await summary.press('Enter')
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
   await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  }
  await page.goto('/keuangan');await page.getByRole('button',{name:'Muat lebih banyak'}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
 }
})
test('long amounts tiny signed rates and rounding tails fit 320px',async({page},info)=>{
 await page.setViewportSize({width:320,height:900})
 await page.goto('/kalkulator/bunga-efektif-pinjaman')
 await fill(page,{...fixtures[0].inputs,proceeds:'9999999999999','repayments.0.amount':'9999999999998'});await submit(page)
 await expect(result(page).locator('dd').first()).toHaveText('Antara −0,0001% dan 0% (negatif)')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
 await result(page).screenshot({path:info.outputPath('dated-negatif-subpresisi-320.jpg'),quality:75})
 await page.goto('/kalkulator/kpr');await fill(page,{...fixtures[1].inputs,price:'9',down:'0',months:'600',fixedMonths:'600',fixedRate:'100'});await submit(page)
 await expect(result(page)).toContainText('penutup lebih besar');await expect(result(page)).toContainText('Rp10')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
 await result(page).screenshot({path:info.outputPath('kpr-penutup-pembulatan.jpg'),quality:75})
 await page.goto('/kalkulator/kurs-mata-uang');await fill(page,{...fixtures[4].inputs,amount:'9999999999999.99',rate:'9999999999999.999999',fee:'0'});await submit(page)
 await expect(result(page).locator('dd').first()).toHaveText('Rp99.999.999.999.999.899.990.000.000')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
 await result(page).screenshot({path:info.outputPath('kurs-nominal-besar-320.jpg'),quality:75})
})
test('all five methodology sources and FAQs are present without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage()
 for(const f of fixtures){await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`);await expect(page.getByRole('heading',{name:'Cara menghitung',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Sumber rumus',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Pertanyaan tentang perhitungan ini',exact:true})).toBeVisible();expect(await page.locator('article a[href^="https://"]').count()).toBeGreaterThanOrEqual(2)}
 await context.close()
})
