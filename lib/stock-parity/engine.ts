import { z } from 'zod'
import { fraction as R, add, subtract as sub, multiply as mul, divide as div, ceiling, type Rational } from '../utilities-materials/rational'
const number = (digits = 13, decimals = 6) => z.string().trim().regex(new RegExp(`^\\d{1,${digits}}(?:[.,]\\d{1,${decimals}})?$`), { message: 'Isi angka nonnegatif tanpa pemisah ribuan, maksimal6desimal.', abort: true }).transform(s => { const [a,b=''] = s.replace(',','.').split('.'); return R(BigInt(a+b),10n**BigInt(b.length)) })
const integer = z.string().trim().regex(/^\d{1,13}$/, {message:'Isi bilangan bulat nonnegatif hingga13digit.',abort:true}).transform(BigInt)
const rate = number(3).refine(v => v.n < 100n*v.d, 'Persen harus kurang dari100.').transform(v=>div(v,R(100n)))
const positive = number().refine(v=>v.n>0n,'Harus positif.')
const optional = <T extends z.ZodType>(schema:T) => z.preprocess(v=>v===''||v===null?undefined:v,schema.optional())
const row = z.object({ price:positive,lots:integer.refine(v=>v>0n&&v<=1000000000n,'Lot1–1miliar.'),rate,fee:number() })
export const stockInput = z.object({ mode:z.enum(['gross','inclusive']), openingShares:integer,openingPrice:number(),openingFee:number(), rows:z.array(row).max(100), sellMode:z.enum(['inclusive','separate']),sellRate:rate,sellFixed:number(),taxRate:rate,taxFixed:number(),saleShares:integer.refine(v=>v>0n,'Jumlah jual harus positif.'),salePrice:positive,target:optional(positive),targetPrice:optional(positive),targetRate:optional(rate),targetFixed:optional(number()),targetFeeModel:z.enum(['affine','unsupported']), previousClose:optional(positive),gridOrigin:optional(number()),gridMinimum:optional(positive),gridMaximum:optional(positive),gridContext:z.enum(['hypothetical','unknown']) }).superRefine((v,c)=>{
 const err=(key:string,message:string)=>c.addIssue({code:'custom',path:[key],message})
 if(v.mode==='inclusive'&&v.openingFee.n!==0n)err('openingFee','Rata-rata broker sudah termasuk biaya; biaya tambahan harus0, jangan ganda.')
 if(v.openingShares>0n&&v.openingPrice.n===0n)err('openingPrice','Harga posisi awal harus positif bila ada saham.')
 if(v.openingShares===0n&&(v.openingPrice.n||v.openingFee.n))err('openingPrice','Posisi kosong harus memakai harga dan biaya0.')
 const total=v.openingShares+v.rows.reduce((a,r)=>a+r.lots*100n,0n)
 if(total===0n)err('openingShares','Harus ada saham.')
 if(v.saleShares>total)err('saleShares','Jumlah jual melebihi posisi.')
 if(v.sellMode==='inclusive'&&(v.taxRate.n||v.taxFixed.n))err('taxRate','Fee inklusif sudah mencakup pajak; pajak terpisah harus0.')
 const rates=add(v.sellRate,v.taxRate);if(rates.n>=rates.d)err('sellRate','Total tarif jual/pajak harus kurang dari100%.')
 if(v.targetFeeModel==='affine')for(const key of ['target','targetPrice','targetRate','targetFixed'] as const)if(v[key]===undefined)err(key,'Isi input solver affine.')
 if(v.gridContext==='hypothetical')for(const key of ['previousClose','gridOrigin','gridMinimum','gridMaximum'] as const)if(v[key]===undefined)err(key,'Isi acuan dan batas grid hipotetis.')
 if(v.mode==='gross'&&v.openingShares>0n&&compare(v.openingFee,mul(v.openingPrice,R(v.openingShares)))>0n)err('openingFee','Biaya beli melebihi bruto; verifikasi data, tidak dihitung definitif.')
 v.rows.forEach((r,i)=>{const gross=mul(r.price,R(r.lots*100n));if(compare(add(mul(gross,r.rate),r.fee),gross)>0n)err(`rows.${i}.fee`,'Total biaya beli melebihi bruto; verifikasi data.')})
 if(v.gridMinimum&&v.gridMaximum&&compare(v.gridMinimum,v.gridMaximum)>0n)err('gridMaximum','Batas atas harus≥batas bawah.')
})
export const compare=(a:Rational,b:Rational)=>a.n*b.d-b.n*a.d
export function tickFromAnchor(p:Rational):bigint { for(const [limit,tick] of [[200n,1n],[500n,2n],[2000n,5n],[5000n,10n]] as const)if(compare(p,R(limit))<0n)return tick;return 25n }
export function display(v:Rational,places=6):string {const scale=10n**BigInt(places),a=v.n<0n?-v.n:v.n,q=(2n*a*scale+v.d)/(2n*v.d);return `${v.n<0n?'-':''}${q/scale}${places?','+(q%scale).toString().padStart(places,'0'):''}`}
export function solveLots(C:Rational,N:bigint,T:Rational,P:Rational,r:Rational,f:Rational){
 if(compare(C,mul(T,R(N)))<=0n)return{status:'Target sudah tercapai',lots:0n}
 const perLot=mul(sub(T,mul(P,add(R(1n),r))),R(100n))
 if(perLot.n<=0n)return{status:perLot.n===0n?'Tidak tercapai dalam jumlah lot berhingga (asimptotik)':'Tidak mungkin: biaya beli per saham di atas target'}
 const lots=ceiling(div(add(sub(C,mul(T,R(N))),f),perLot))
 if(lots>1000000000n)return{status:'Di luar batas solver1miliar lot; tidak memberikan jumlah definitif'}
 const average=(k:bigint)=>div(add(C,add(mul(mul(P,R(k*100n)),add(R(1n),r)),f)),R(N+k*100n))
 if(compare(average(lots),T)>0n||(lots>1n&&compare(average(lots-1n),T)<=0n))throw Error('Minimality proof failed')
 return {status:'Jumlah lot minimum terbukti pada model affine',lots,average:average(lots)}
}
export function calculateStock(input:unknown){
 const parsed=stockInput.safeParse(input)
 if(!parsed.success){const errors:Record<string,string[]>={};for(const e of parsed.error.issues)(errors[e.path.join('.')]??=[]).push(e.message);return{success:false as const,errors}}
 const v=parsed.data
 let capital=add(mul(v.openingPrice,R(v.openingShares)),v.openingFee),shares=v.openingShares,buyFees=v.openingFee
 for(const r of v.rows){const gross=mul(r.price,R(r.lots*100n)),fees=add(mul(gross,r.rate),r.fee);capital=add(capital,add(gross,fees));buyFees=add(buyFees,fees);shares+=r.lots*100n}
 const allocated=mul(capital,R(v.saleShares,shares)),fixed=add(v.sellFixed,v.taxFixed),keep=sub(R(1n),add(v.sellRate,v.taxRate))
 const net=(price:Rational)=>sub(mul(mul(price,R(v.saleShares)),keep),fixed)
 const payout=net(v.salePrice)
 if(payout.n<0n)return{success:false as const,errors:{salePrice:['Biaya melebihi bruto penjualan; neto negatif tidak dianggap0.']}}
 const theoretical=div(add(allocated,fixed),mul(R(v.saleShares),keep)),profit=sub(payout,allocated),roi=capital.n===0n?undefined:mul(div(profit,allocated),R(100n))
 const tick=v.previousClose?tickFromAnchor(v.previousClose):undefined
 let grid:{status:string;price?:Rational;net?:Rational;predecessorNet?:Rational}={status:'BLOCKER: grid asal, batas instrumen dan kelayakan order BEI belum diverifikasi; tidak ada harga tersertifikasi'}
 if(v.gridContext==='hypothetical'){
  const lower=compare(theoretical,v.gridMinimum!)>0n?theoretical:v.gridMinimum!
  const count=ceiling(div(sub(lower,v.gridOrigin!),R(tick!)))
  const candidate=add(v.gridOrigin!,R(count*tick!))
  if(compare(candidate,v.gridMaximum!)<=0n&&candidate.n>0n){const prev=sub(candidate,R(tick!));grid={status:'SIMULASI grid manual; bukan harga tersertifikasi BEI atau jaminan order terisi',price:candidate,net:net(candidate),predecessorNet:compare(prev,v.gridMinimum!)>=0n?net(prev):undefined}}
  else grid={status:'Tidak ada kandidat dalam batas grid hipotetis yang diisi'}
 }
 const solver=v.target&&compare(capital,mul(v.target,R(shares)))<=0n?{status:'Target sudah tercapai',lots:0n}:v.targetFeeModel==='affine'?solveLots(capital,shares,v.target!,v.targetPrice!,v.targetRate!,v.targetFixed!):{status:'Tidak didukung: fee capped/nonlinear memerlukan bukti minimalitas tersendiri; tidak menebak jumlah lot'}
 return{success:true as const,capital,shares,buyFees,average:div(capital,R(shares)),allocated,payout,profit,roi,theoretical,grid,solver,tick}
}
