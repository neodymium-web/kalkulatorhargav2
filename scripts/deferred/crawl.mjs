import fs from 'node:fs'
import {spawn,execFileSync} from 'node:child_process'
import {chromium} from 'playwright'
const phase=process.env.AUDIT_PHASE||'candidate',out=process.env.AUDIT_OUTPUT||`test-results/deferred57/${phase}`
fs.mkdirSync(out,{recursive:true})
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{stdio:'ignore'})
let browser
try{
 let ready=false
 for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:3100')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}
 if(!ready)throw Error('Production server not ready')
 browser=await chromium.launch();const page=await browser.newPage();const pending=['/'],seen=new Set(),rows=[]
 while(pending.length){
  const path=pending.shift();if(seen.has(path))continue;seen.add(path)
  const response=await fetch('http://127.0.0.1:3100'+path,{redirect:'manual'}),html=await response.text()
  if(response.status!==200)throw Error(`Broken local path ${path}: ${response.status}`)
  const row=await page.evaluate(({html,path})=>{const d=new DOMParser().parseFromString(html,'text/html');return {path,title:d.title,h1:[...d.querySelectorAll('main h1')].map(n=>n.textContent),anchors:[...d.querySelectorAll('a[href]')].map(a=>({text:a.textContent,href:a.getAttribute('href')}))}},{html,path})
  rows.push({...row,status:response.status})
  for(const {href}of row.anchors)if(href.startsWith('/')&&!href.startsWith('//')){const next=href.split(/[?#]/)[0]||'/';if(!seen.has(next))pending.push(next)}
 }
 fs.writeFileSync(out+'/ssr-links.json',JSON.stringify({phase,commit:execFileSync('git',['rev-parse','HEAD']).toString().trim(),observedAtUtc:new Date().toISOString(),workingTreeDirty:execFileSync('git',['status','--porcelain']).toString().trim().length>0,method:'BFS root seed only; raw production HTML; no page JavaScript/sitemap seed',rows},null,2)+'\n');console.log('Reached',rows.length,'routes; anchors',rows.reduce((n,r)=>n+r.anchors.length,0))
}finally{if(browser)await browser.close();server.kill('SIGTERM')}
