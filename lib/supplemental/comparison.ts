import { z } from 'zod'
import { calculatePlatformSettlement, type SettlementLedger } from '../platform-settlement/engine'
import { fraction as R, type Rational } from '../utilities-materials/rational'
import { compare } from '../marketplace-economics/engines'
export const platforms=['shopee','tokopedia','tiktok-shop','lazada'] as const
export type ComparisonPlatform=typeof platforms[number]
export const platformNames:Record<ComparisonPlatform,string>={shopee:'Shopee',tokopedia:'Tokopedia','tiktok-shop':'TikTok Shop',lazada:'Lazada'}
const taxInput=z.object({taxScope:z.enum(['none','receipt','unknown','unsupported']),taxAmount:z.string().trim().regex(/^\d{1,13}$/,'Isi nominal pemotongan integer, termasuk0 jika tidak berlaku.').transform(BigInt),taxEvidence:z.preprocess(v=>v===null||v===undefined?'':v,z.string().trim().max(160))}).superRefine((v,ctx)=>{
 if(v.taxScope==='none'&&v.taxAmount!==0n)ctx.addIssue({code:'custom',path:['taxAmount'],message:'Tidak berlaku harus nominal0; pilih bukti terkonfirmasi jika ada pemotongan.'})
 if(v.taxScope==='receipt'&&!v.taxEvidence)ctx.addIssue({code:'custom',path:['taxEvidence'],message:'Isi catatan bukti nominal pemotongan, tanpa data pribadi.'})
})
export type ScenarioResult={success:false;errors:Record<string,string[]>}|{success:true;status:string;ledger?:SettlementLedger;tax?:Rational;otherBeforeTax?:Rational;basket?:{quantity:string;cost:string}}
export function calculateManualScenario(input:unknown):ScenarioResult{
 const value=(input&&typeof input==='object'?input:{})as Record<string,unknown>,tax=taxInput.safeParse(value)
 if(!tax.success){const errors:Record<string,string[]>={};for(const e of tax.error.issues)(errors[e.path.join('.')]??=[]).push(e.message);return{success:false,errors}}
 if(!['none','receipt'].includes(tax.data.taxScope))return{success:true,status:'UNKNOWN: cakupan atau nominal pajak belum terpetakan; tidak ada angka hasil'}
 const original=calculatePlatformSettlement(value)
 if(!original.success)return original
 if(!original.ledger)return{success:true,status:original.status}
 const other=BigInt(String(value.other).trim()),combined=other+tax.data.taxAmount
 if(combined>9999999999999n)return{success:false,errors:{taxAmount:['Jumlah biaya lain dan pemotongan melebihi batas13digit.']}}
 const result=calculatePlatformSettlement({...value,other:combined.toString()})
 if(!result.success||!result.ledger)return result
 return{success:true,status:'Simulasi manual, nominal pemotongan berasal dari bukti pengguna; bukan perhitungan hukum pajak',ledger:result.ledger,tax:R(tax.data.taxAmount),otherBeforeTax:R(other),basket:{quantity:BigInt(String(value.quantity)).toString(),cost:BigInt(String(value.cost)).toString()}}
}
export type ComparisonResult={status:string;complete:false}|{status:string;complete:true;rows:{platform:ComparisonPlatform;ledger:SettlementLedger;best:boolean}[]}
export function compareScenarios(inputs:Partial<Record<ComparisonPlatform,unknown>>):ComparisonResult{
 const rows=platforms.map(platform=>({platform,result:calculateManualScenario(inputs[platform])}))
 if(rows.some(r=>!r.result.success||!r.result.ledger))return{complete:false,status:'UNKNOWN: lengkapi dan hitung keempat kanal; tidak ada ranking atau angka perbandingan'}
 const ready=rows.map(r=>({platform:r.platform,result:r.result as Extract<ScenarioResult,{success:true}>}))
 if(ready.some(r=>r.result.basket!.quantity!==ready[0].result.basket!.quantity||r.result.basket!.cost!==ready[0].result.basket!.cost))return{complete:false,status:'Skenario belum sebanding: samakan jumlah unit dan HPP per unit sebelum memberi ranking'}
 const best=ready.reduce((a,b)=>compare(a.result.ledger!.profit,b.result.ledger!.profit)>=0n?a:b)
 return{complete:true,status:'Perbandingan skenario manual lengkap; terbaik menurut hasil setelah HPP eksak, bukan rekomendasi platform',rows:ready.map(r=>({platform:r.platform,ledger:r.result.ledger!,best:compare(r.result.ledger!.profit,best.result.ledger!.profit)===0n}))}
}
