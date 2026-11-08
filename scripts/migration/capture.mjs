import fs from 'node:fs'
import {spawn} from 'node:child_process'
import {chromium} from 'playwright'
const phase=process.env.AUDIT_PHASE||'candidate',out=process.env.AUDIT_OUTPUT||`test-results/cutover-visual/${phase}`
fs.mkdirSync(out,{recursive:true})
if(fs.existsSync('docs/audit/cutover/visual-baseline'))fs.cpSync('docs/audit/cutover/visual-baseline','test-results/cutover-visual/baseline',{recursive:true})
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{stdio:'ignore'})
let browser
try{
 let ready=false;for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:3100')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}if(!ready)throw Error('server not ready')
 browser=await chromium.launch()
 for(const width of [375,1440]){
 for(const path of ['/','/bisnis','/marketplace','/keuangan','/pajak','/media-sosial','/sehari-hari','/kalkulator/food-cost','/kalkulator/hpp','/kalkulator/pph-final-umkm']){
 const page=await browser.newPage({viewport:{width,height:900}})
 await page.goto('http://127.0.0.1:3100'+path);await page.locator('main h1').waitFor({state:'visible'});await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))})
 await page.screenshot({path:`${out}/${width}-${path==='/'?'home':path.slice(1).replaceAll('/','-')}.jpg`,fullPage:true,scale:'css',quality:75});await page.close()
 }
 }
}finally{if(browser)await browser.close();server.kill('SIGTERM')}
