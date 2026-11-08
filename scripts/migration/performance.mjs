import fs from 'node:fs'
import os from 'node:os'
import {spawn,execFileSync} from 'node:child_process'
import {launch} from 'chrome-launcher'
import {chromium} from 'playwright'
import lighthouse from 'lighthouse'
const phase=process.env.AUDIT_PHASE||'candidate',output=process.env.AUDIT_OUTPUT||`test-results/cutover-lab/${phase}`,origin='http://127.0.0.1:3100'
fs.mkdirSync(output,{recursive:true})
let chrome,server
try{
 try{if((await fetch(origin)).ok)throw Error('Port3100 already serves a process; stop it before comparable measurement')}catch(e){if(e.message.startsWith('Port3100'))throw e}
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{stdio:['ignore',fs.openSync(output+'/server.log','w'),fs.openSync(output+'/server-error.log','w')]})
 let ready=false;for(let i=0;i<120;i++){try{if((await fetch(origin)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}if(!ready)throw Error('Server did not become ready')
 const summary={phase,commit:execFileSync('git',['rev-parse','HEAD']).toString().trim(),node:process.version,os:os.platform(),cpu:os.cpus()[0].model,protocol:'fresh Chrome process per measurement; default Lighthouse mobile simulated throttling; only recorder errors may be retried (max3), valid slow runs are retained',invalidAttempts:[],runs:[]}
 for(let repeat=1;repeat<=3;repeat++)for(const route of ['/','/kalkulator/food-cost']){
  let r
  for(let attempt=1;attempt<=3;attempt++){
   chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']})
   r=await lighthouse(origin+route,{port:chrome.port,logLevel:'error',output:'json',onlyCategories:['performance']});if(!r)throw Error('Missing Lighthouse report')
   await chrome.kill();chrome=undefined
   if(!r.lhr.runtimeError)break
   fs.writeFileSync(`${output}/invalid-${repeat}-${route==='/'?'home':'food-cost'}-${attempt}.json`,r.report);summary.invalidAttempts.push({route,repeat,attempt,code:r.lhr.runtimeError.code});fs.writeFileSync(output+'/summary.json',JSON.stringify(summary,null,2)+'\n')
   if(r.lhr.runtimeError.code!=='NO_NAVSTART')throw Error(`Invalid lab run: ${r.lhr.runtimeError.code}`)
  }
  fs.writeFileSync(`${output}/${repeat}-${route==='/'?'home':'food-cost'}.json`,r.report)
  if(r.lhr.runtimeError)throw Error(`Invalid lab run: ${r.lhr.runtimeError.code}; preserve raw evidence and rerun the whole phase`)
  const a=r.lhr.audits,result={route,repeat,fetchTime:r.lhr.fetchTime,lighthouseVersion:r.lhr.lighthouseVersion,settings:r.lhr.configSettings,environment:r.lhr.environment,lcpMs:a['largest-contentful-paint'].numericValue,cls:a['cumulative-layout-shift'].numericValue,tbtMs:a['total-blocking-time'].numericValue,bytes:a['total-byte-weight'].numericValue,performance:r.lhr.categories.performance.score,unusedJs:a['unused-javascript'].details?.overallSavingsBytes,mainThreadMs:a['mainthread-work-breakdown'].numericValue}
  summary.runs.push(result);fs.writeFileSync(output+'/summary.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({phase,route,repeat,lcpMs:result.lcpMs,tbtMs:result.tbtMs,bytes:result.bytes}))
 }
}finally{if(chrome)await chrome.kill();if(server)server.kill('SIGTERM')}
