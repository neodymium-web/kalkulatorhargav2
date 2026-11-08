import{test,expect}from'@playwright/test'
import{readFileSync,writeFileSync}from'node:fs'
import{publishedPaths}from'../lib/published-paths'
import{legacyPaths}from'../lib/legacy/routes'
const absolute=/^https?:\/\/(www\.)?kalkulatorharga\.com(?:[/:?#]|$)/i
test('cutover model leaves no absolute same-domain anchor, self-source link or unsupported local target',async({page,request},info)=>{
 const paths=publishedPaths(),queue=['/'],seen=new Set<string>(),report=[],violations:unknown[]=[]
 const allowed=new Set(paths)
 while(queue.length){const path=queue.shift()!;if(seen.has(path))continue;seen.add(path);const response=await request.get(path,{maxRedirects:0});expect(response.status(),path).toBe(200)
 const html=await response.text()
 const data=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');return{anchors:[...d.querySelectorAll('a[href]')].map(a=>({text:a.textContent,href:a.getAttribute('href')!})),references:[...d.querySelectorAll('[data-legacy-source] small[data-legacy-annotation]')].map(n=>n.textContent)}},html)
 for(const a of data.anchors){
  if(absolute.test(a.href))violations.push({path,href:a.href,reason:'absolute same-host anchor'})
  if(a.href.startsWith('/')&&!a.href.startsWith('//')){
   const u=new URL(a.href,'https://kalkulatorharga.com')
   if(u.search||!allowed.has(u.pathname))violations.push({path,href:a.href,reason:'unsupported target/query'})
   for(const host of ['kalkulatorharga.com','www.kalkulatorharga.com'])if(new URL(a.href,'https://'+host).pathname!==u.pathname)violations.push({path,href:a.href,reason:'host-dependent path'})
   if(!seen.has(u.pathname))queue.push(u.pathname)
  }
 }
 if((legacyPaths as readonly string[]).includes(path)&&(data.anchors.some(a=>a.text?.includes('Lihat halaman sumber legacy'))||!html.includes('Alamat sumber historis:')))violations.push({path,reason:'source provenance/self-link'})
 report.push({path,...data})
 }
 expect(violations).toEqual([])
 expect([...seen].sort()).toEqual([...paths].sort());expect(seen.size).toBe(131)
 writeFileSync(info.outputPath('modeled-cutover-links.json'),JSON.stringify({seed:'/',paths:seen.size,absoluteSameDomainAnchors:0,rows:report},null,2))
})
test('unresolved legacy benchmark and unsupported presets are visible nonclick archival references without JS',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();await page.goto('http://127.0.0.1:3100/kalkulator/tiktok/panduan')
 await expect(page.locator('[data-legacy-source]')).toContainText('Referensi arsip nonklik: https://www.kalkulatorharga.com/kalkulator/tiktok/benchmark')
 await expect(page.locator('a[href*="/kalkulator/tiktok/benchmark"]')).toHaveCount(0);await expect(page.locator('a[href="/kalkulator/tiktok"]').first()).toBeVisible()
 await expect(page.getByRole('complementary',{name:'Status review arsip'})).toContainText('bukan arsip permanen')
 await page.goto('http://127.0.0.1:3100/blog');await expect(page.locator('[data-legacy-source]')).toContainText('Alamat asal masih dapat disalin');await context.close()
})
