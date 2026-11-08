import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import {test,expect} from '@playwright/test'
import {readFileSync,writeFileSync} from 'node:fs'
import {createServer} from 'node:http'
const catalogue=JSON.parse(readFileSync('docs/audit/catalogue.json','utf8'))
const {validate}=require('../scripts/migration/redirect-fixture.cjs')
const {readCsv}=require('../scripts/migration/csv.cjs')
test('SSR breadth-first traversal from root alone reaches all 107 original pages plus published inherited archives without sitemap or executing their JS',async({page,request},info)=>{
 const pending=['/'],seen=new Set<string>(),rows=[]
 while(pending.length){const path=pending.shift()!;if(seen.has(path))continue;seen.add(path)
 const response=await request.get(path,{maxRedirects:0});expect(response.status(),path).toBe(200);const html=await response.text()
 const r=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');return {title:d.title,h1:[...d.querySelectorAll('main h1')].map(n=>n.textContent),links:[...d.querySelectorAll('a[href]')].map(n=>n.getAttribute('href')!) }},html)
 expect(r.h1).toHaveLength(1);rows.push({path,status:response.status(),...r})
 for(const href of r.links)if(href.startsWith('/')&&!href.startsWith('//')){const target=href.split(/[?#]/)[0]||'/';expect([...catalogue.paths, ...legacyPaths, ...supplementalPaths],`${path}→${target}`).toContain(target);if(!seen.has(target))pending.push(target)}
 }
 expect([...seen].sort()).toEqual([...catalogue.paths, ...legacyPaths, ...supplementalPaths].sort());expect(seen.size).toBe(107 + legacyPaths.length + supplementalPaths.length)
 writeFileSync(info.outputPath('ssr-graph.json'),JSON.stringify({method:'BFS, root seed only, raw HTML parsed inertly; no sitemap seeds',rows},null,2))
})
test('security headers favicon robots and proposed legacy redirects remain safe',async({request})=>{
 for(const path of ['/','/kalkulator/food-cost','/favicon.ico','/robots.txt','/sitemap.xml']){
 const r=await request.get(path,{maxRedirects:0});expect(r.status()).toBe(200);const h=r.headers();expect(h['x-robots-tag']).toBe('noindex, nofollow');expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');expect(h['x-content-type-options']).toBe('nosniff');expect(h['content-security-policy-report-only']).toContain("object-src 'none'");expect(h['content-security-policy']).toBeUndefined()
 if(path==='/favicon.ico'){expect(h['content-type']).toMatch(/image\/(x-icon|vnd.microsoft.icon)/);const b=await r.body();expect([...b.subarray(0,4)]).toEqual([0,0,1,0])}
 if(path==='/robots.txt')expect(await r.text()).toContain('Disallow: /')
 if(path==='/sitemap.xml')expect([...(await r.text()).matchAll(/<loc>/g)]).toHaveLength(107 + legacyPaths.length + supplementalPaths.length)
 }
 for(const path of ['/kalkulator','/kalkulator/saham/average'])expect((await request.get(path,{maxRedirects:0})).status()).toBe(404)
})
test('complete category navigation works without JS and keeps keyboard disclosure and responsive targets',async({browser,isMobile},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:isMobile?375:1440,height:900}}),page=await context.newPage();await page.goto('http://127.0.0.1:3100/bisnis')
 const summary=page.locator('details summary');await summary.focus();await summary.press('Enter');await expect(page.locator('details')).toHaveAttribute('open','');const nav=page.getByRole('navigation',{name:'Daftar lengkap kalkulator Bisnis'});await expect(nav.getByRole('link')).toHaveCount(20)
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)}
  await page.setViewportSize({width:isMobile?375:1440,height:900});await nav.screenshot({path:info.outputPath('complete-index.jpg'),scale:'css'});await page.screenshot({path:info.outputPath('nojs-category.jpg'),fullPage:true,scale:'css'});await nav.getByRole('link',{name:catalogue.tools.find((t:{slug:string})=>t.slug==='food-cost').metadata.title,exact:true}).click();await expect(page).toHaveURL(/\/kalkulator\/food-cost$/);await expect(page.getByRole('button',{name:'Hitung',exact:true})).toBeDisabled();await context.close()
})
test('proposed redirects run only in isolated localhost fixture, one hop to an actual v2 page',async({request})=>{
 const proposals=readCsv('docs/audit/redirect-proposals.csv');expect(proposals.every((r:{approved_for_production:string})=>r.approved_for_production==='no')).toBe(true)
 const rules=validate(proposals.map((r:{source:string;destination:string;status:string})=>({source:r.source,destination:r.destination,status:Number(r.status)})),new Set(catalogue.paths))
 const server=createServer((req,res)=>{const rule=rules.find((r:{source:string})=>r.source===req.url);if(rule){res.writeHead(301,{Location:rule.destination});res.end()}else{res.writeHead(catalogue.paths.includes(req.url)?200:404);res.end('Isolated migration fixture; not a live redirect')}})
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address() as {port:number};const base=`http://127.0.0.1:${address.port}`
 try{for(const r of rules){expect((await request.get(r.destination)).status()).toBe(200);const first=await request.get(base+r.source,{maxRedirects:0});expect(first.status()).toBe(301);expect(first.headers().location).toBe(r.destination);const final=await request.get(base+first.headers().location,{maxRedirects:0});expect(final.status()).toBe(200);expect(final.headers().location).toBeUndefined()}}finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
})
