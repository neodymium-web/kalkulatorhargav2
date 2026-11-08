import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import {test,expect,type Page} from '@playwright/test'
import {monthlyFixture as m,annualFixture as a,importFixture as i,bphtbFixture as b,pbbFixture as p} from './tax-advanced-fixtures'
const fixtures=[
 {slug:'pph-21-bulanan',title:'Kalkulator PPh21 Bulanan TER: Kategori A, B, C',input:m,primary:'Rp 200.000',invalid:'gross',bad:'-1',first:'year'},
 {slug:'pph-21-rekonsiliasi',title:'Kalkulator Rekonsiliasi PPh21: Selisih Masa Akhir',input:a,primary:'Rp 515.000',invalid:'contributions',bad:'120000001',first:'year'},
 {slug:'pajak-impor',title:'Kalkulator Pajak Impor: Simulasi CIF dan Tarif Manual',input:i,primary:'Rp 519.000',invalid:'fx',bad:'0',first:'date'},
 {slug:'bphtb',title:'Kalkulator BPHTB: Dasar DKI Jakarta Tahun2024',input:b,primary:'Rp 37.500.000',invalid:'value',bad:'-1',first:'date'},
 {slug:'pbb-p2',title:'Kalkulator PBB-P2: Bruto DKI Jakarta Tahun2024',input:p,primary:'Rp 880.000',invalid:'land',bad:'-1',first:'year'},
]
async function fill(page:Page,input:Record<string,string|undefined>){for(const[name,value]of Object.entries(input)){if(value===undefined)continue;const field=page.locator(`[name="${name}"]`);if(await field.evaluate(el=>el.tagName==='SELECT'))await field.selectOption(value);else await field.fill(value)}}
const result=(page:Page)=>page.getByRole('region',{name:'Hasil perhitungan'})
const submit=(page:Page)=>page.getByRole('button',{name:'Hitung',exact:true}).click()
async function open(page:Page,index:number){await page.goto(`/kalkulator/${fixtures[index].slug}`);await fill(page,fixtures[index].input)}
async function held(page:Page){await expect(result(page).locator('dd')).toHaveCount(1);await expect(result(page)).not.toContainText('Rp 0');await expect(result(page)).toContainText('Tidak ada angka pajak');await expect(page.getByRole('table').filter({visible:true})).toHaveCount(0)}
for(const f of fixtures)test(`Batch19 normal invalid SEO ${f.slug}`,async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});const response=await page.goto(`/kalkulator/${f.slug}`);expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://kalkulatorharga.com/kalkulator/${f.slug}`);await expect(page.getByRole('heading',{level:1})).toHaveText(f.title);await expect(page.getByRole('navigation',{name:'Jejak navigasi'}).getByRole('link',{name:'Pajak'})).toHaveAttribute('href','/pajak')
 await submit(page);await expect(page.locator(`[name="${f.first}"]`)).toBeFocused();await expect(page.getByRole('form').getByRole('alert')).toBeVisible();await fill(page,f.input);await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');await expect(result(page).locator('dd').first()).toHaveText(f.primary);await expect(result(page)).toContainText('2026-11-08');await expect(result(page)).toContainText('bukan penetapan')
 await page.screenshot({path:info.outputPath(`${f.slug}.jpg`),quality:75,fullPage:true});await result(page).screenshot({path:info.outputPath(`${f.slug}-hasil.jpg`),quality:75})
 await fill(page,{[f.invalid]:f.bad});await expect(result(page)).toContainText('Isi kolom');await expect(result(page)).not.toContainText(f.primary);await submit(page);await expect(page.locator(`[name="${f.invalid}"]`)).toBeFocused();await expect(page.locator(`[name="${f.invalid}"]`)).toHaveAttribute('aria-invalid','true');await expect(page.locator(`[name="${f.invalid}"]`)).toHaveAttribute('aria-describedby',/error/);await page.screenshot({path:info.outputPath(`${f.slug}-invalid.jpg`),quality:75,fullPage:true})
})
test('TER all complete source tables keyboard disclosure category boundary and final period workflow',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,0);await submit(page);await expect(result(page)).toContainText('Kategori TER A');await expect(result(page)).toContainText('9650001 sampai 10050000')
 const disclosure=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Lihat seluruh tabel TER'})});await disclosure.locator('summary').focus();await disclosure.locator('summary').press('Enter')
 for(const[category,count]of[['A',44],['B',40],['C',41]]as const)await expect(page.getByRole('table',{name:`Tabel TER kategori ${category}`,exact:true}).locator('tbody tr')).toHaveCount(count)
 const scroll=page.getByRole('region',{name:'Tabel TER kategori A',exact:true});await scroll.focus();await scroll.press('ArrowRight');if(isMobile)await expect.poll(()=>scroll.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0)
 await disclosure.locator('summary').press('Enter')
 for(const[ptkp,gross,expected,category]of[['TK/0','5400000','Rp 0','A'],['TK/0','5400001','Rp 13.500','A'],['TK/2','6200001','Rp 15.500','B'],['K/3','6600001','Rp 16.500','C']]){await fill(page,{ptkp,gross});await submit(page);await expect(result(page).locator('dd').first()).toHaveText(expected);await expect(result(page)).toContainText(`Kategori TER ${category}`)}
 await result(page).screenshot({path:info.outputPath('ter-batas-kategori-c.jpg'),quality:75})
 await fill(page,{month:'12'});await submit(page);await held(page);await expect(result(page)).toContainText('Masa terakhir');await page.getByRole('link',{name:'rekonsiliasi PPh21 dan batas kelayakannya'}).click();await expect(page).toHaveURL(/pph-21-rekonsiliasi$/)
})
test('payroll unsupported partial employment DTP classification and period remove all stale payable',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,0);await submit(page)
 for(const patch of[{finalMonth:'8',month:'8'},{finalMonth:'12',month:'5',employment:'partial-year'},{employment:'full-year',employers:'multiple'},{employers:'single',relief:'dtp'},{relief:'none',classification:'special'},{classification:'ordinary',ptkp:'other'},{ptkp:'K/0',confirmation:'unknown'},{confirmation:'confirmed',year:'2023'},{year:'2027'},{year:'2024',gross:''}]){await fill(page,patch);await expect(result(page)).toContainText('Isi kolom');await submit(page);await held(page)}
 await result(page).screenshot({path:info.outputPath('payroll-status-tanpa-angka.jpg'),quality:75})
})
test('annual progressive layers bonus negative adjustment and actual withholding remain clear',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,1);await submit(page);const table=page.getByRole('table',{name:'Rincian pajak progresif Pasal 17'});await expect(table.locator('tbody tr')).toHaveCount(5);await expect(result(page)).toContainText('Rp 2.715.000');await expect(result(page)).toContainText('Rp 54.300.000')
 await fill(page,{gross:'130000000'});await expect(table).toHaveCount(0);await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 1.445.000');await expect(result(page)).toContainText('Rp 3.645.000')
 await fill(page,{withheld:'5000000'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('−Rp 1.355.000');await expect(result(page)).toContainText('kelebihan pemotongan untuk diproses');await expect(result(page)).toContainText('bukan pajak terutang negatif');await result(page).screenshot({path:info.outputPath('rekonsiliasi-lebih-potong.jpg'),quality:75});await table.locator('..').screenshot({path:info.outputPath('rekonsiliasi-lapisan-progresif.jpg'),quality:75})
 for(const patch of[{aggregate:'partial'},{aggregate:'complete',year:'2026'},{year:'2024',deductions:'unknown'},{deductions:'confirmed',employers:'multiple'}]){await fill(page,patch);await submit(page);await held(page)}
})
test('import manual FOB CFR CIF and base choices keep component ledger and cents exact',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,2);await submit(page);await expect(result(page)).toContainText('SIMULASI MANUAL');const table=page.getByRole('table',{name:'Komponen simulasi manual impor'});await expect(table.locator('tbody tr')).toHaveCount(3);await expect(table.locator('tbody tr').nth(1)).toContainText('Rp 264.000')
 for(const [incoterm,value,freight,insurance]of[['CFR','120','0','5'],['CIF','125','0','0'],['declared','125','0','0']]){await fill(page,{incoterm,value,freight,insurance});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 519.000')}
 await fill(page,{vatBase:'customs',vatFactor:'50'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 375.000');await table.locator('..').screenshot({path:info.outputPath('impor-dasar-manual-terpisah.jpg'),quality:75})
 await fill(page,{value:'1',fx:'1',dutyRate:'50',vatRate:'50',vatFactor:'100',incomeRate:'0'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 2');await expect(result(page)).toContainText('Rp 0,5');await expect(result(page)).toContainText('Jumlah pungutan eksak');await result(page).screenshot({path:info.outputPath('impor-rounding-komponen.jpg'),quality:75})
 await fill(page,{value:'100.01',dutyRate:'0',vatRate:'0'});await submit(page);await expect(result(page)).toContainText('10001/100 USD')
})
test('import invalid double additions official FX week and legal unsupported modes fail closed',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,2)
 await fill(page,{incoterm:'CIF'});await submit(page);await expect(page.locator('[name=freight]')).toBeFocused();await fill(page,{freight:'0'});await submit(page);await expect(page.locator('[name=insurance]')).toBeFocused();await fill(page,{insurance:'0',date:'2024-06-05'});await submit(page);await expect(page.locator('[name=date]')).toBeFocused();await fill(page,{date:'2024-06-03',fxEnd:'2024-06-05'});await submit(page);await expect(page.locator('[name=fxEnd]')).toBeFocused()
 await fill(page,{fxEnd:'2024-06-04'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 415.200')
 for(const patch of[{mode:'legal'},{mode:'manual',regime:'consignment'},{regime:'special'},{regime:'regular',confirmation:'unknown'},{confirmation:'confirmed',reference:''},{reference:i.reference,fx:''},{fx:'16000',vatRate:''}]){await fill(page,patch);await submit(page);await held(page)}
 await result(page).screenshot({path:info.outputPath('impor-kelayakan-belum-jelas.jpg'),quality:75})
})
test('BPHTB official NJOP floor first acquisition family and local year limits',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,3);await submit(page);await expect(result(page)).toContainText('NPOP setelah floor NJOP');await expect(result(page)).toContainText('bukan tagihan final')
 await fill(page,{acquisition:'inheritance',taxpayer:'individual',property:'apartment',relation:'direct-family',value:'1200000000'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 10.000.000');await result(page).screenshot({path:info.outputPath('bphtb-waris-hubungan-terverifikasi.jpg'),quality:75})
 for(const patch of[{relation:'unknown'},{relation:'direct-family',first:'unknown'},{first:'confirmed',facility:'special'},{facility:'none-confirmed',region:'other'},{region:'DKI',date:'2025-01-01'},{date:'2026-06-01'},{date:'2024-06-01',property:'landed',value:'800000000'}]){await fill(page,patch);await submit(page);await held(page)}
 await result(page).screenshot({path:info.outputPath('bphtb-fasilitas-perlu-konfirmasi.jpg'),quality:75})
})
test('PBB gross before facilities single allowance use rates and unsupported SPPT no stale numbers',async({page,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await open(page,4);await submit(page);await expect(result(page)).toContainText('bukan tagihan SPPT');await expect(result(page)).toContainText('NJOPTKP objek ini, satu kali per WP')
 for(const [use,expected]of[['nonresidential','Rp 1.320.000'],['food','Rp 660.000'],['residential','Rp 880.000']]){await fill(page,{use});await submit(page);await expect(result(page).locator('dd').first()).toHaveText(expected)}
 await fill(page,{allocation:'other-object'});await submit(page);await expect(result(page).locator('dd').first()).toHaveText('Rp 1.000.000');await result(page).screenshot({path:info.outputPath('pbb-njoptkp-objek-lain.jpg'),quality:75})
 for(const patch of[{allocation:'unknown'},{allocation:'this-object',purpose:'payable'},{purpose:'gross-only',use:'central'},{use:'residential',year:'2025'},{year:'2026'},{year:'2024',region:'other'},{region:'DKI',confirmation:'unknown'}]){await fill(page,patch);await submit(page);await held(page)}
 await result(page).screenshot({path:info.outputPath('pbb-bukan-sppt-tanpa-angka.jpg'),quality:75})
})
test('Batch19 five widths large results and source tables fit without clipping',async({page})=>{
 for(let j=0;j<fixtures.length;j++){
  await open(page,j);await submit(page)
  for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${fixtures[j].slug} ${width}`).toBe(width)}
  await page.setViewportSize({width:320,height:900});for(const font of ['Arial','Verdana']){await page.evaluate(font=>{document.body.style.fontFamily=font},font);expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${fixtures[j].slug} ${font}`).toBe(320)}
 }
 await page.goto('/pajak');for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)}
 await page.setViewportSize({width:320,height:900})
 await open(page,0);await page.locator('summary').filter({hasText:'Lihat seluruh tabel TER'}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320)
 await open(page,2);await fill(page,{value:'9999999999999.999999',freight:'9999999999999.999999',insurance:'9999999999999.999999',fx:'9999999999999.999999',dutyRate:'100',vatRate:'100',incomeRate:'100'});await submit(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320)
})
test('Batch19 hub search sitemap107 unknown route and staging boundaries',async({page,request,isMobile},info)=>{
 await page.setViewportSize({width:isMobile?375:1440,height:900});await page.goto('/pajak');await expect(page.getByRole('region',{name:'Kalkulator tersedia'}).getByRole('link')).toHaveCount(10);await page.screenshot({path:info.outputPath('pajak-sepuluh-alat.jpg'),quality:75,fullPage:true})
 for(const f of fixtures){await page.goto('/');await page.getByRole('searchbox').fill(f.title);await expect(page.getByRole('region',{name:'Hasil pencarian'}).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible()}
 const xml=await(await request.get('/sitemap.xml')).text();expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length + supplementalPaths.length);for(const f of fixtures)expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
 for(const slug of ['kalkulator-tidak-ada']){expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404);expect(xml).not.toContain(`/kalkulator/${slug}</loc>`);await page.getByRole('searchbox').fill(slug);await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0)}expect(await(await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('Batch19 legal methods dates limits full TER source tables and FAQs SSR without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage()
 for(const f of fixtures){await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`);await expect(page.getByRole('heading',{name:'Cara menghitung dan cakupan hukum',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Sumber primer dan tanggal berlaku',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Pertanyaan tentang pajak ini',exact:true})).toBeVisible();await expect(page.locator('article')).toContainText('2026-11-08');if(f.slug==='pph-21-bulanan'){await page.locator('summary').filter({hasText:'Lihat seluruh tabel TER'}).click();await expect(page.getByRole('table',{name:'Tabel TER kategori A',exact:true}).locator('tbody tr')).toHaveCount(44);await expect(page.locator('article')).toContainText('2024-01-01')}if(f.slug==='pbb-p2')await expect(page.locator('article')).toContainText('2024-05-30')}
 await context.close()
})
