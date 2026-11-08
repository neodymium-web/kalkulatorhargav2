import fs from 'node:fs'
import os from 'node:os'
import { spawn, execFileSync } from 'node:child_process'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { launch } from 'chrome-launcher'
import { chromium } from 'playwright'
const origin='http://127.0.0.1:3100'
const routes=['/','/bisnis','/marketplace','/keuangan','/pajak','/media-sosial','/sehari-hari','/kalkulator/kpr','/kalkulator/pph-21-bulanan','/kalkulator/tiktok','/kalkulator/food-cost']
const output=process.env.AUDIT_LAB_OUTPUT||'test-results/audit-lab'
fs.mkdirSync(output,{recursive:true})
let server,chrome
try {
  try { await fetch(origin) } catch {
    server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{stdio:['ignore',fs.openSync(`${output}/server.log`,'w'),fs.openSync(`${output}/server-error.log`,'w')]})
    let ready=false
    for(let i=0;i<120;i++){try{if((await fetch(origin)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}
    if(!ready)throw Error('Local production server did not become ready')
  }
  chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']})
  const results=[]
  for(const formFactor of ['mobile','desktop'])for(const route of routes){
    const name=`${formFactor}-${route==='/'?'home':route.slice(1).replaceAll('/','-')}`
    const r=await lighthouse(origin+route,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},formFactor==='desktop'?desktopConfig:undefined)
    if(!r)throw Error(`Missing report ${name}`)
    fs.writeFileSync(`${output}/${name}.json`,r.report)
    const l=r.lhr,a=l.audits
    const result={route,formFactor,fetchTime:l.fetchTime,finalUrl:l.finalDisplayedUrl,lighthouseVersion:l.lighthouseVersion,userAgent:l.userAgent,environment:l.environment,settings:l.configSettings,scores:Object.fromEntries(Object.entries(l.categories).map(([k,v])=>[k,v.score])),lcpMs:a['largest-contentful-paint'].numericValue,cls:a['cumulative-layout-shift'].numericValue,tbtMs:a['total-blocking-time'].numericValue,fcpMs:a['first-contentful-paint'].numericValue,speedIndexMs:a['speed-index'].numericValue,bytes:a['total-byte-weight'].numericValue,domNodes:a['dom-size']?.numericValue,warnings:l.runWarnings,failedAudits:Object.entries(a).filter(([,v])=>v.score!==null&&v.score<1&&v.scoreDisplayMode!=='notApplicable').map(([id,v])=>({id,score:v.score,title:v.title,displayValue:v.displayValue}))}
    results.push(result);fs.writeFileSync(`${output}/summary.json`,JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD']).toString().trim(),node:process.version,os:os.platform(),arch:os.arch(),cpu:os.cpus()[0]?.model,runs:results},null,2)+'\n');console.log(JSON.stringify({route,formFactor,lcpMs:result.lcpMs,cls:result.cls,tbtMs:result.tbtMs,scores:result.scores}))
  }
} finally {if(chrome)await chrome.kill();if(server)server.kill('SIGTERM')}
