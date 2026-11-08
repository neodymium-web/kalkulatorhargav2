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
