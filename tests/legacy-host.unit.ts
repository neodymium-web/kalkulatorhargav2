import {it,expect} from 'vitest'
const {draft,trace}=require('../scripts/legacy/host-policy.cjs')
it('tests both draft host policies without activating any redirect',()=>{
 for(const host of ['kalkulatorharga.com','www.kalkulatorharga.com']){
  const rules=draft(host);expect(rules[0].approved).toBe(false)
  const source=host==='kalkulatorharga.com'?'www.kalkulatorharga.com':'kalkulatorharga.com'
  expect(trace(source,'/blog/fee-shopee-2026?example=1',rules)).toEqual([{host,path:'/blog/fee-shopee-2026?example=1',status:301}])
  expect(trace(host,'/',rules)).toEqual([])
 }
 expect(()=>trace('kalkulatorharga.com','/',[{from:'kalkulatorharga.com',to:'www.kalkulatorharga.com',status:308},...draft('kalkulatorharga.com')])).toThrow('Host redirect loop')
})
