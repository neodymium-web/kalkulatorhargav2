import {it,expect} from 'vitest'
import {classifyLegacyLink} from '../lib/legacy/links'
const paths=['/','/blog','/blog/a','/kalkulator/tiktok']
it('maps implemented same-host routes locally on both hosts, preserving no unsupported parameters',()=>{
 for(const host of ['kalkulatorharga.com','www.kalkulatorharga.com'])expect(classifyLegacyLink(`https://${host}/blog/a`,'/blog',paths)).toMatchObject({kind:'local',href:'/blog/a'})
 expect(classifyLegacyLink('/kalkulator/tiktok','/blog',paths)).toMatchObject({kind:'local',href:'/kalkulator/tiktok',scopeChanged:true})
})
it('makes same-host source/preset/unknown/fragment references nonclickable instead of dangling or looping',()=>{
 for(const href of ['https://www.kalkulatorharga.com/blog','/?marketplace=shopee','/kalkulator/tiktok?tab=lookup','/kalkulator/emas','/kalkulator/tiktok/benchmark','/blog/a#old-heading','https://www.kalkulatorharga.com:444/blog/a']){
  const r=classifyLegacyLink(href,'/blog',paths);expect(r.kind).toBe('reference');expect(r.href).toBeUndefined();expect(r.ownerApproval).toBe(true)
 }
})
it('keeps genuine external references and rejects executable URL schemes',()=>{
 expect(classifyLegacyLink('https://www.gold.org/about-gold/about-gold-jewellery','/blog',paths)).toMatchObject({kind:'external',classification:'external-reference'})
 for(const href of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd'])expect(classifyLegacyLink(href,'/blog',paths).href).toBeUndefined()
})

import{readFileSync}from'node:fs'
import{publishedPaths}from'../lib/published-paths'
import{supplementalPaths}from'../lib/supplemental/routes'
import{supplementalTools}from'../lib/supplemental/registry'
import{listPublished}from'../lib/registry'
const{readCsv}=require('../scripts/migration/csv.cjs')
it('matches62 observed baseline dependencies and never treats proposed owner actions as approved',()=>{
 const graph=JSON.parse(readFileSync('docs/audit/deferred57/baseline/ssr-links.json','utf8')),csv=readCsv('docs/audit/legacy-link-dependencies.csv')
 const observed=graph.rows.flatMap((r:{path:string;anchors:{href:string;text:string}[]})=>r.anchors.filter(a=>/^https?:\/\/(www\.)?kalkulatorharga\.com(?:[/:?#]|$)/i.test(a.href)).map(a=>({source:r.path,target:a.href,text:a.text})))
 expect(observed).toHaveLength(62);expect(csv.map((r:{source_path:string;target:string;anchor_text:string})=>({source:r.source_path,target:r.target,text:r.anchor_text}))).toEqual(observed)
 expect(csv.filter((r:{classification:string})=>r.classification==='self-source')).toHaveLength(22)
 expect(csv.filter((r:{classification:string})=>r.classification==='unresolved-legacy-feature')).toHaveLength(6)
 expect(csv.filter((r:{owner_approval_needed:string})=>r.owner_approval_needed==='YES').every((r:{owner_status:string;proposed_target:string})=>r.owner_status==='PENDING'&&r.proposed_target==='')).toBe(true)
})
it('preserves129 old map records and adds only2 supplemental tools outside100IDs',()=>{
 const before=readCsv('docs/audit/deferred57/cutover-map-before.csv'),after=readCsv('docs/audit/cutover-url-map.csv')
 expect(before).toHaveLength(129);expect(after.slice(0,129)).toEqual(before);expect(after).toHaveLength(131);expect(after.map((r:{v2_route:string})=>r.v2_route).sort()).toEqual(publishedPaths().sort())
 expect(listPublished()).toHaveLength(100);expect(supplementalTools).toHaveLength(2);expect(supplementalTools.map(t=>t.path)).toEqual([...supplementalPaths]);expect(supplementalTools.every(t=>!listPublished().some(c=>c.id===String(t.id)))).toBe(true)
 const parity=readCsv('docs/audit/legacy-content-parity.csv');expect(parity).toHaveLength(25);expect(parity.filter((r:{outcome:string})=>r.outcome==='IMPLEMENTED_REVIEW_NEEDED')).toHaveLength(22);expect(parity.filter((r:{outcome:string})=>r.outcome==='IMPLEMENTED_BOUNDED_MANUAL_REVIEW_NEEDED')).toHaveLength(2);expect(parity.filter((r:{outcome:string})=>r.outcome==='BLOCKED')).toHaveLength(1)
})
