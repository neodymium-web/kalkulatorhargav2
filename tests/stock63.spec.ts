import {test,expect} from '@playwright/test'
import {stock63Fixture} from './stock63-fixture'
test('integrated legacy path, exact fixture, rows and stale result clear',async({page},info)=>{
 await page.goto('/kalkulator/saham/average');await expect(page.locator('h1')).toHaveText('Average saham, impas dan target lot')
 for(const [key,value]of Object.entries(stock63Fixture)){const f=page.locator(`[name="${key}"]`);if(await f.evaluate(n=>n.tagName)==='SELECT')await f.selectOption(value);else await f.fill(value)}
 await page.getByRole('button',{name:'Tambah rows',exact:true}).click()
 for(const [name,value]of Object.entries({price:'4200',lots:'5',rate:'0',fee:'26000'}))await page.locator(`[name="rows.0.${name}"]`).fill(value)
 await page.getByRole('button',{name:'Hitung',exact:true}).click();const result=page.getByRole('region',{name:'Hasil perhitungan',exact:true})
 await expect(result).toContainText('4428,404344');await expect(result).toContainText('6628387,500000');await expect(result).toContainText('bukan harga tersertifikasi')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(await page.evaluate(()=>innerWidth))
 await page.screenshot({path:info.outputPath('stock-parity.jpg'),fullPage:true,scale:'css',quality:70})
 await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});expect(await page.evaluate(async()=>{const a=(window as any).axe;return (await a.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations})).toEqual([])
 await page.locator('[name="openingFee"]').fill('1');await expect(result).not.toContainText('4428,404344')
 await page.locator('[name="mode"]').selectOption('inclusive');await page.getByRole('button',{name:'Hitung',exact:true}).click();await expect(page.locator('[name="openingFee"]')).toBeFocused()
})
test('SSR noJS, noindex canonical and sitemap131 remain unchanged',async({browser,request})=>{
 const c=await browser.newContext({javaScriptEnabled:false}),p=await c.newPage();const response=await p.goto('http://127.0.0.1:3100/kalkulator/saham/average');expect(response?.status()).toBe(200);expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');await expect(p.locator('link[rel=canonical]')).toHaveAttribute('href','https://kalkulatorharga.com/kalkulator/saham/average');await expect(p.getByRole('button',{name:'Hitung',exact:true})).toBeDisabled();expect((await (await request.get('/sitemap.xml')).text()).match(/<loc>/g)).toHaveLength(131);await c.close()
})
