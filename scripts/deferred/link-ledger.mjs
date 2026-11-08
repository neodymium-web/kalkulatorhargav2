import fs from 'node:fs'
import {classifyLegacyLink} from '../../lib/legacy/links.ts'
const baseline=JSON.parse(fs.readFileSync('docs/audit/deferred57/baseline/ssr-links.json'))
const additional=['/kalkulator/emas','/bandingkan']
const published=JSON.parse(fs.readFileSync('docs/audit/catalogue.json')).paths.concat(JSON.parse(fs.readFileSync('lib/legacy/pages.json')).map(p=>p.path),additional)
const rows=[]
for(const page of baseline.rows)for(const a of page.anchors){
 if(!/^https?:\/\/(www\.)?kalkulatorharga\.com(?:[/:?#]|$)/i.test(a.href))continue
 const r=classifyLegacyLink(a.href,page.path,published,additional)
 rows.push({source_path:page.path,anchor_text:a.text,target:a.href,classification:r.classification,rationale:r.reason,action:r.href?'LOCAL_V2_URL':'NONCLICKABLE_ARCHIVAL_REFERENCE',proposed_target:r.href||'',scope_acceptance_needed:r.scopeChanged?'Manual v2 differs from legacy; owner acceptance before cutover':'Not asserted by this link classification',owner_approval_needed:r.ownerApproval?'YES':'NO',owner_status:r.ownerApproval?'PENDING':'Not a cutover approval',phase:'Actual baseline SSR; proposed remediation'})
}
const q=s=>'"'+String(s).replaceAll('"','""')+'"'
fs.writeFileSync('docs/audit/legacy-link-dependencies.csv',[Object.keys(rows[0]).map(q).join(','),...rows.map(r=>Object.values(r).map(q).join(','))].join('\n')+'\n')
console.log('Actual baseline absolute same-host anchors',rows.length,JSON.stringify(rows.reduce((n,r)=>(n[r.classification]=(n[r.classification]||0)+1,n),{})))
