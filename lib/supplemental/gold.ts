import { z } from 'zod'
import { fraction as R, add, subtract as sub, multiply as mul, divide as div, ceiling, type Rational } from '../utilities-materials/rational'
import { cash } from '../marketplace-economics/engines'
import { parseCivil, ordinal } from '../calendar-time/civil'
const S = 1000000n
const decimal = z.string().trim().regex(/^\d{1,13}([.,]\d{1,6})?$/, {message:'Isi angka nonnegatif, maksimal13digit bulat dan6desimal.',abort:true}).transform(v=>{const [a,b='']=v.replace(',','.').split('.');return BigInt(a)*S+BigInt(b.padEnd(6,'0'))})
const money = z.string().trim().regex(/^\d{1,13}$/, {message:'Isi rupiah integer nonnegatif hingga13digit; tulis0 jika memang nol.',abort:true}).transform(BigInt)
const optional = <T extends z.ZodType>(schema:T)=>z.preprocess(v=>v===null||v===undefined||v===''?undefined:v,schema.optional())
const date = z.string().refine(v=>parseCivil(v)!==null,{message:'Isi tanggal valid YYYY-MM-DD, tahun 0001–9999.',abort:true}).transform(v=>parseCivil(v)!)
export const goldInput=z.object({
  gross:decimal, nonGold:decimal, purityMode:z.enum(['karat','fineness'],{error:'Pilih dasar kadar.'}),purity:decimal,
  price:optional(money.refine(v=>v>0n,'Quote beli harus lebih dari0.')),
  buybackMode:z.enum(['spread','direct'],{error:'Pilih dasar buyback.'}),spread:optional(decimal.refine(v=>v<=100n*S,'Spread maksimal100%.')),buybackPrice:optional(money.refine(v=>v>0n,'Quote buyback langsung harus lebih dari0.')),
  buyCosts:money,sellCosts:money,source:optional(z.string().trim().min(1).max(160)),quoteDate:optional(date),asOf:optional(date),
  maxAge:optional(z.string().trim().regex(/^\d{1,4}$/).transform(BigInt).refine(v=>v<=3650n,'Toleransi maksimal3650hari.')),
  quoteStatus:z.enum(['confirmed','unknown'],{error:'Pilih status quote.'}),costStatus:z.enum(['complete','unknown'],{error:'Pilih status biaya.'}),
}).superRefine((v,ctx)=>{
  if(v.gross<=v.nonGold)ctx.addIssue({code:'custom',path:['nonGold'],message:'Berat nonemas harus lebih kecil dari bruto; berat neto wajib positif.'})
  if(v.purity<=0n||v.purity>(v.purityMode==='karat'?24n:1000n)*S)ctx.addIssue({code:'custom',path:['purity'],message:v.purityMode==='karat'?'Karat harus >0 sampai24.':'Fineness harus >0 sampai1000‰.'})
  if(v.quoteDate&&v.asOf&&ordinal(v.quoteDate)>ordinal(v.asOf))ctx.addIssue({code:'custom',path:['asOf'],message:'Tanggal simulasi tidak boleh sebelum tanggal quote.'})
})
export type GoldLedger={gross:Rational;nonGold:Rational;net:Rational;purity:Rational;fineness:Rational;fine:Rational;price:Rational;buyValue:Rational;buybackPrice:Rational;buybackGross:Rational;buyCosts:Rational;sellCosts:Rational;capital:Rational;payout:Rational;difference:Rational;capitalCash:bigint;payoutCash:bigint;differenceCash:bigint;capitalAdjustment:Rational;payoutAdjustment:Rational;minimumQuote?:bigint;age:bigint}
export type GoldResult={success:false;errors:Record<string,string[]>}|{success:true;status:string;ledger?:GoldLedger}
export function calculateGold(input:unknown):GoldResult{
 let value:unknown=input
 if(input&&typeof input==='object'){const copy={...input as Record<string,unknown>};if(copy.buybackMode==='spread')delete copy.buybackPrice;if(copy.buybackMode==='direct')delete copy.spread;value=copy}
 const p=goldInput.safeParse(value)
 if(!p.success){const errors:Record<string,string[]>={};for(const e of p.error.issues)(errors[e.path.join('.')]??=[]).push(e.message);return{success:false,errors}}
 const v=p.data
 if(v.price===undefined||!v.source||!v.quoteDate||!v.asOf||v.maxAge===undefined||v.quoteStatus!=='confirmed'||v.costStatus!=='complete'||(v.buybackMode==='spread'?v.spread===undefined:v.buybackPrice===undefined))return{success:true,status:'Belum dapat dihitung: quote, sumber, tanggal atau biaya belum dikonfirmasi lengkap'}
 const age=ordinal(v.asOf)-ordinal(v.quoteDate)
 if(age>v.maxAge)return{success:true,status:'Quote kedaluwarsa menurut toleransi usia yang Anda pilih; perbarui data sebelum menghitung'}
 const gross=R(v.gross,S),nonGold=R(v.nonGold,S),net=sub(gross,nonGold),purity=R(v.purity,(v.purityMode==='karat'?24n:1000n)*S),fine=mul(net,purity),price=R(v.price),buyValue=mul(fine,price)
 const spread=v.buybackMode==='spread'?R(v.spread!,100n*S):undefined
 const buybackPrice=spread?mul(price,sub(R(1n),spread)):R(v.buybackPrice!),buybackGross=mul(fine,buybackPrice),buyCosts=R(v.buyCosts),sellCosts=R(v.sellCosts),capital=add(buyValue,buyCosts),payout=sub(buybackGross,sellCosts),difference=sub(payout,capital)
 const capitalCash=cash(capital),payoutCash=cash(payout),differenceCash=payoutCash-capitalCash
 const minimumQuote=spread&&spread.n<spread.d?ceiling(div(add(capital,sellCosts),mul(fine,sub(R(1n),spread)))):undefined
 return{success:true,status:'Simulasi harga manual lengkap; bukan harga pasar atau penawaran dealer',ledger:{gross,nonGold,net,purity,fineness:mul(purity,R(1000n)),fine,price,buyValue,buybackPrice,buybackGross,buyCosts,sellCosts,capital,payout,difference,capitalCash,payoutCash,differenceCash,capitalAdjustment:sub(R(capitalCash),capital),payoutAdjustment:sub(R(payoutCash),payout),minimumQuote,age}}
}
