import { legacyPaths } from '../lib/legacy/routes'
import {it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {listPublished} from '../lib/registry'
const {fingerprint}=require('../scripts/migration/copy-fingerprint.cjs')
const {validate}=require('../scripts/migration/redirect-fixture.cjs')
const {readCsv}=require('../scripts/migration/csv.cjs')
const catalogue=JSON.parse(readFileSync('docs/audit/catalogue.json','utf8'))
const copies=JSON.parse(readFileSync('docs/audit/cutover/copy-fingerprints.json','utf8'))
for(const row of copies)it(`copy-only whitespace preserves code, numbers and legal qualifiers: ${row.file}`,()=>expect(fingerprint(readFileSync(row.file,'utf8'))).toBe(row.baseline))
it('preserves all 100 IDs, calculator titles and routes',()=>{const tools=listPublished();expect(tools).toHaveLength(100);for(const t of tools){const old=catalogue.tools.find((r:{id:string})=>r.id===t.id);expect(t.path).toBe(old.path);expect(t.metadata.title).toBe(old.metadata.title)}})
it('allows only validated one-hop review fixtures',()=>{
 const targets=new Set(['/','/kalkulator/rata-rata-beli-saham']);expect(validate([{source:'/kalkulator',destination:'/',status:301}],targets)).toHaveLength(1)
 for(const rules of [[{source:'/',destination:'/',status:301}],[{source:'/a',destination:'/b',status:301},{source:'/b',destination:'/',status:301}],[{source:'/a',destination:'/missing',status:301}],[{source:'/a',destination:'https://other.test',status:301}],[{source:'/a',destination:'/',status:302}]])expect(()=>validate(rules,targets)).toThrow()
})
it('keeps the original brand favicon as a multi-size ICO',()=>{const b=readFileSync('app/favicon.ico');expect([...b.subarray(0,4)]).toEqual([0,0,1,0]);expect(b.readUInt16LE(4)).toBe(3)})
it('approved metadata changes add whitespace only',()=>{const changes=JSON.parse(readFileSync('docs/audit/cutover/metadata-copy-changes.json','utf8'));expect(changes).toHaveLength(7);for(const x of changes)expect(x.after.replace(/\s/g,'')).toBe(x.before.replace(/\s/g,''))})
it('maps exactly 107 unique v2 URLs and preserves distinct TikTok search intent',()=>{
 const rows=readCsv('docs/audit/cutover-url-map.csv');expect(rows).toHaveLength(107 + legacyPaths.length);expect(rows.slice(0,107).map((r:{v2_route:string})=>r.v2_route).sort()).toEqual([...catalogue.paths].sort())
 for(const path of ['/kalkulator/tiktok','/kalkulator/tiktok-shop']){const r=rows.find((r:{v2_route:string})=>r.v2_route===path);expect(r.action).toBe('preserve');expect(r.legacy_equivalent).toBe('https://www.kalkulatorharga.com'+path)}
 const legacy=readCsv('docs/audit/legacy-url-inventory.csv');expect(legacy).toHaveLength(37);expect(legacy.filter((r:{mapping_decision:string})=>r.mapping_decision==='manual-review')).toHaveLength(25);expect(legacy.every((r:{evidence_time_utc:string})=>r.evidence_time_utc.includes('2026-11-08'))).toBe(true)
})
