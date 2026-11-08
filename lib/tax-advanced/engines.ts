import { z } from 'zod'
import { parseCivil, ordinal } from '../calendar-time/civil'
import { fraction as R, add, subtract as sub, multiply as mul, type Rational } from '../utilities-materials/rational'
import { cash, compare, type Entry } from '../marketplace-economics/engines'
import { terTables, ptkp, progressiveBrackets, type PtkpStatus, type TerCategory } from './rates'
import { advancedSnapshot, type AdvancedSource } from './sources'

const integer = () => z.string().trim().regex(/^\d{1,13}$/, { message: 'Isi integer rupiah nonnegatif hingga 13 digit tanpa pemisah.', abort: true }).transform(BigInt)
const decimal = () => z.string().trim().regex(/^\d{1,13}([.,]\d{1,6})?$/, { message: 'Isi angka nonnegatif, maksimal 13 digit utuh dan 6 desimal.', abort: true }).transform(v => { const [a,b='']=v.replace(',','.').split('.'); return R(BigInt(a+b.padEnd(6,'0')),1000000n) })
const missing = <T extends z.ZodType>(schema:T) => z.preprocess(v => typeof v === 'string' && v.trim()==='' ? undefined : v, schema.optional())
const money = () => missing(integer())
const rate = () => missing(decimal().refine(v=>compare(v,R(100n))<=0n,{message:'Persen maksimal 100.',abort:true}).transform(v=>mul(v,R(1n,100n))))
const choice = <T extends string>(values:readonly T[]) => z.preprocess(v=>v===''||v===undefined||v===null?'unknown':v,z.enum(values))
const date = z.string().refine(v=>parseCivil(v)!==null,{message:'Isi tanggal Gregorian valid YYYY-MM-DD.',abort:true})
const year = z.string().regex(/^\d{4}$/,{message:'Isi tahun empat digit.',abort:true})
const month = z.enum(['1','2','3','4','5','6','7','8','9','10','11','12'])
const statusPtkp = choice(['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3','other','unknown'])
const payrollFacts = {
  ptkp:statusPtkp,
  employment:choice(['full-year','partial-year','unknown']),
  employers:choice(['single','multiple','unknown']),
  relief:choice(['none','dtp','unknown']),
  classification:choice(['ordinary','special','unknown']),
  confirmation:choice(['confirmed','unknown']),
}
export const monthlyInput = z.object({year,month,finalMonth:month,...payrollFacts,gross:money()})
export const reconciliationInput = z.object({year,finalMonth:month,...payrollFacts,aggregate:choice(['complete','partial','unknown']),deductions:choice(['confirmed','unknown']),gross:money(),contributions:money(),zakat:money(),withheld:money()}).superRefine((v,ctx)=>{
  if(v.gross!==undefined&&v.contributions!==undefined&&v.zakat!==undefined&&compare(add(jobExpense(v.gross,12n),R(v.contributions+v.zakat)),R(v.gross))>0n)ctx.addIssue({code:'custom',path:['contributions'],message:'Biaya jabatan, iuran dan zakat tidak boleh melebihi bruto.'})
})
export const importInput = z.object({
  date, mode:choice(['manual','legal','unknown']), regime:choice(['regular','consignment','special','unknown']),
  incoterm:choice(['FOB','CFR','CIF','declared','unknown']), currency:choice(['USD','EUR','JPY','IDR','unknown']),
  hs:z.string().trim().regex(/^\d{8}$/,{message:'Isi kode HS 8 digit dari klasifikasi Anda, tanpa titik.',abort:true}),
  confirmation:choice(['confirmed','unknown']), reference:z.string().trim().max(200,'Referensi maksimal 200 karakter.').optional(),
  fxStart:date,fxEnd:date,fx:missing(decimal().refine(v=>v.n>0n,{message:'Kurs wajib positif.',abort:true})),
  value:missing(decimal()),freight:missing(decimal()),insurance:missing(decimal()),dutyRate:rate(),vatRate:rate(),vatFactor:rate(),incomeRate:rate(),
  vatBase:choice(['customs','plus-duty','unknown']),incomeBase:choice(['customs','plus-duty','unknown']),
}).superRefine((v,ctx)=>{
  const start=parseCivil(v.fxStart),end=parseCivil(v.fxEnd)
  if(start&&end&&(ordinal(end)-ordinal(start)>6n||v.fxEnd<v.fxStart))ctx.addIssue({code:'custom',path:['fxEnd'],message:'Masa KMK harus berurutan dan maksimal 7 hari inklusif.'})
  if(v.date<v.fxStart||v.date>v.fxEnd)ctx.addIssue({code:'custom',path:['date'],message:'Tanggal deklarasi harus berada dalam masa kurs KMK.'})
  if(v.currency==='IDR'&&v.fx&&compare(v.fx,R(1n))!==0n)ctx.addIssue({code:'custom',path:['fx'],message:'Untuk IDR, kurs wajib 1 IDR per IDR.'})
  if(['CFR','CIF','declared'].includes(v.incoterm)&&v.freight&&v.freight.n!==0n)ctx.addIssue({code:'custom',path:['freight'],message:'Freight sudah termasuk; isi 0 agar tidak dihitung dua kali.'})
  if(['CIF','declared'].includes(v.incoterm)&&v.insurance&&v.insurance.n!==0n)ctx.addIssue({code:'custom',path:['insurance'],message:'Asuransi sudah termasuk; isi 0 agar tidak dihitung dua kali.'})
})
const regionalFacts={region:choice(['DKI','other','unknown']),confirmation:choice(['confirmed','unknown'])}
export const bphtbInput=z.object({
  ...regionalFacts,date,acquisition:choice(['sale','auction','inheritance','testament','gift','other','unknown']),
  first:choice(['confirmed','not-first','unknown']),taxpayer:choice(['individual','body','unknown']),
  property:choice(['landed','apartment','nonresidential','unknown']),relation:choice(['direct-family','not-applicable','other','unknown']),
  facility:choice(['none-confirmed','special','unknown']),value:money(),njop:money(),
})
export const pbbInput=z.object({
  ...regionalFacts,year,use:choice(['residential','nonresidential','food','central','exempt','unknown']),
  allocation:choice(['this-object','other-object','unknown']),purpose:choice(['gross-only','payable','unknown']),
  land:money(),building:money(),
})
export type BreakdownRow={label:string;cells:Entry[]}
export type AdvancedOutput={status:'estimated'|'manual'|'unverified';title:string;amount?:bigint;details:Entry[];notes:string[];sources:AdvancedSource[];rows?:BreakdownRow[];caption?:string;context?:string}
export type AdvancedResult=({success:true}&AdvancedOutput)|{success:false;errors:Record<string,string[]>}
const e=(label:string,value:Rational,kind?:Entry['kind']):Entry=>({label,value,kind})
const disclaimer='Estimasi terbatas, bukan penetapan DJP/DJBC/Bapenda, SPT, PIB, SPPT atau nasihat hukum. Konfirmasi pengguna bukan verifikasi otoritas. Tidak tercakup bukan berarti bebas pajak.'
const rounding='Pecahan BigInt dipertahankan. Cash tampilan dibulatkan setengah menjauhi nol; ini konvensi model, bukan jaminan pembulatan resmi pelaporan atau pembayaran.'
function held(title:string,sources:AdvancedSource[]):AdvancedOutput{return{status:'unverified',title,details:[],sources,notes:['Tidak ada angka pajak atau ledger karena wilayah, masa, klasifikasi atau data belum terverifikasi.',disclaimer]}}
function calculate<T>(schema:z.ZodType<T>,fn:(v:T)=>AdvancedOutput){return(input:unknown):AdvancedResult=>{
  const p=schema.safeParse(input)
  if(!p.success){const errors:Record<string,string[]>={};for(const i of p.error.issues)(errors[i.path.join('.')]??=[]).push(i.message);return{success:false,errors}}
  return{success:true,...fn(p.data)}
}}
function payrollCovered(v:z.infer<typeof monthlyInput>|z.infer<typeof reconciliationInput>){return v.ptkp in ptkp&&v.employment==='full-year'&&v.employers==='single'&&v.relief==='none'&&v.classification==='ordinary'&&v.confirmation==='confirmed'&&v.finalMonth==='12'}
export function findTer(category:TerCategory,gross:bigint){return terTables[category].find(b=>gross>=b.lower&&(b.upper===null||gross<=b.upper))!}
export function jobExpense(gross:bigint,months:bigint){const computed=R(gross,20n),cap=R(months*500000n);return compare(computed,cap)>0n?cap:computed}
export function progressiveTax(pkp:bigint){
  let lower=0n,total=R(0n)
  const rows:BreakdownRow[]=progressiveBrackets.map(b=>{
    const top=b.upper===null||pkp<b.upper?pkp:b.upper,slice=top>lower?top-lower:0n,tax=R(slice*b.rate,100n)
    const label=`${lower===0n?'0':'> '+lower.toString()} s.d. ${b.upper===null?'tanpa batas':b.upper.toString()} rupiah`
    if(b.upper!==null)lower=b.upper
    total=add(total,tax)
    return{label,cells:[e('Irisan PKP',R(slice)),e('Tarif (%)',R(b.rate),'percent'),e('Pajak eksak',tax)]}
  })
  return{total,rows}
}
const payrollSources:AdvancedSource[]=['ter','terAnnex','payroll','ptkp','hpp','dtp']
export const calculateMonthly=calculate(monthlyInput,v=>{
  if(v.year<'2024'||v.year>'2026'||(v.year==='2026'&&BigInt(v.month)>11n))return held('Periode TER di luar snapshot terverifikasi',payrollSources)
  if(!payrollCovered(v))return held('Kelayakan payroll / masa akhir belum tercakup',payrollSources)
  if(v.month===v.finalMonth)return held('Masa terakhir: gunakan rekonsiliasi, bukan TER bulanan',payrollSources)
  if(v.gross===undefined)return held('Bruto bulanan belum lengkap',payrollSources)
  const [,category]=ptkp[v.ptkp as PtkpStatus],bracket=findTer(category,v.gross),tax=mul(R(v.gross),bracket.rate),amount=cash(tax)
  return{status:'estimated',title:'Estimasi potongan TER masa reguler (cash)',amount,details:[e('Bruto bulanan terklasifikasi',R(v.gross)),e('Batas bawah bracket inklusif',R(bracket.lower)),...(bracket.upper===null?[]:[e('Batas atas bracket inklusif',R(bracket.upper))]),e('Tarif TER (%)',mul(bracket.rate,R(100n)),'percent'),e('Pajak eksak',tax),e('Penyesuaian cash',sub(R(amount),tax))],context:`Kategori TER ${category}, status PTKP ${v.ptkp}. Bracket ${bracket.lower} sampai ${bracket.upper??'tanpa batas atas'} rupiah, kedua batas inklusif. PP58/2023 Lampiran ${category}; berlaku 2024-01-01.`,sources:payrollSources,notes:['Bruto termasuk seluruh kompensasi masa yang telah diklasifikasikan, termasuk THR/bonus dan komponen tunai kena pajak. Tidak mengurangi PTKP atau biaya jabatan lagi dari bruto TER. Hanya pegawai tetap swasta DN, subjektif penuh tahun dan satu pemberi kerja. Status PTKP awal tahun (termasuk ketentuan karyawati) serta NPWP/NIK valid harus diperiksa. DTP, natura dan pengecualian di luar cakupan.',rounding,disclaimer]}
})
export const calculateReconciliation=calculate(reconciliationInput,v=>{
  if(!['2024','2025'].includes(v.year))return held('Tahun rekonsiliasi belum terverifikasi / belum selesai',payrollSources)
  if(!payrollCovered(v)||v.aggregate!=='complete'||v.deductions!=='confirmed')return held('Payroll setahun / kelayakan pengurang belum terverifikasi',payrollSources)
  if(v.gross===undefined||v.contributions===undefined||v.zakat===undefined||v.withheld===undefined)return held('Agregat dan potongan aktual belum lengkap',payrollSources)
  const expense=jobExpense(v.gross,12n),net=sub(R(v.gross-v.contributions-v.zakat),expense),allowance=ptkp[v.ptkp as PtkpStatus][0],before=sub(net,R(allowance)),pkp=before.n>0n?(before.n/(before.d*1000n))*1000n:0n
  const {total,rows}=progressiveTax(pkp),difference=sub(total,R(v.withheld)),amount=cash(difference)
  return{status:'estimated',title:difference.n<0n?'Selisih negatif: kelebihan pemotongan untuk diproses':difference.n===0n?'Selisih rekonsiliasi nihil':'Estimasi selisih pemotongan masa Desember',amount,details:[e('Bruto setahun aktual',R(v.gross)),e('Biaya jabatan 5%, cap 6 juta setahun',expense),e('Iuran sah melalui pemberi kerja',R(v.contributions)),e('Zakat wajib sah melalui pemberi kerja',R(v.zakat)),e('Neto setahun',net),e('PTKP sesuai status awal tahun',R(allowance)),e('PKP setelah floor ribuan',R(pkp)),e('PPh setahun eksak',total),e('Pemotongan aktual Jan–Nov',R(v.withheld)),e('Selisih eksak masa terakhir',difference),e('Penyesuaian cash',sub(R(amount),difference))],rows,caption:'Rincian pajak progresif Pasal17',context:`Tahun ${v.year}, masa terakhir Desember; pegawai dan kewajiban subjektif penuh 12 bulan, satu pemberi kerja.`,sources:payrollSources,notes:['Agregat payroll harus lengkap dan telah dicocokkan, termasuk THR/bonus. Biaya jabatan 5% bruto maksimal Rp500.000 sebulan / Rp6.000.000 setahun; hanya model 12 bulan yang dicakup. Iuran dan zakat harus memenuhi PMK168 Pasal10, bukan semua potongan slip gaji. Tidak menghitung ulang potongan aktual memakai TER atau menguranginya dua kali.',difference.n<0n?'Kelebihan pemotongan bukan pajak terutang negatif atau janji refund otomatis. PMK168 Pasal21–22 mewajibkan pemotong memproses pengembalian beserta bukti paling lambat akhir bulan berikutnya setelah masa terakhir, kecuali DTP. Cocokkan dokumen dan prosedur pemberi kerja.':'Selisih adalah rekonsiliasi pemotongan pemberi kerja dalam cakupan, bukan hasil SPT seluruh sumber penghasilan.',rounding,disclaimer]}
})
export const calculateImport=calculate(importInput,v=>{
  const sources:AdvancedSource[]=['customs','customsFaq','customsFx','consignment']
  if(v.mode!=='manual'||v.regime!=='regular'||v.incoterm==='unknown'||v.currency==='unknown'||v.confirmation!=='confirmed'||v.date<'2023-01-01'||v.date>advancedSnapshot.supportedThrough||!v.reference?.trim()||v.vatBase==='unknown'||v.incomeBase==='unknown')return held('Perlu verifikasi klasifikasi / kurs; hanya simulasi manual reguler',sources)
  if(!v.fx||!v.value||!v.freight||!v.insurance||!v.dutyRate||!v.vatRate||!v.vatFactor||!v.incomeRate)return held('Nominal, kurs atau asumsi tarif manual belum lengkap',sources)
  const cif=v.incoterm==='FOB'?add(add(v.value,v.freight),v.insurance):v.incoterm==='CFR'?add(v.value,v.insurance):v.value
  const customs=mul(cif,v.fx),duty=mul(customs,v.dutyRate),withDuty=add(customs,duty),vatBase=v.vatBase==='plus-duty'?withDuty:customs,incomeBase=v.incomeBase==='plus-duty'?withDuty:customs,dpp=mul(vatBase,v.vatFactor),vat=mul(dpp,v.vatRate),income=mul(incomeBase,v.incomeRate)
  const rows:BreakdownRow[]=[['Bea masuk manual',customs,v.dutyRate,duty],['PPN impor manual',dpp,v.vatRate,vat],['PPh22 impor manual',incomeBase,v.incomeRate,income]].map(([label,base,rate,tax])=>({label:label as string,cells:[e('Dasar eksak',base as Rational),e('Tarif asumsi (%)',mul(rate as Rational,R(100n)),'percent'),e('Pungutan eksak',tax as Rational),e('Cash komponen',R(cash(tax as Rational)),'cash')]}))
  const exact=add(add(duty,vat),income),amount=cash(duty)+cash(vat)+cash(income)
  return{status:'manual',title:'Total cash SIMULASI MANUAL pungutan impor',amount,details:[e('Nilai pabean IDR eksak',customs),e('BM manual eksak',duty),e('Dasar PPN sebelum proporsi manual',vatBase),e('DPP PPN manual eksak',dpp),e('PPN manual eksak',vat),e('Dasar PPh22 manual',incomeBase),e('PPh22 manual eksak',income),e('Jumlah pungutan eksak',exact),e('Penyesuaian jumlah cash komponen',sub(R(amount),exact))],context:`SIMULASI MANUAL, bukan tarif hukum atau PIB. ${v.incoterm} ${v.currency}; CIF eksak ${cif.n}/${cif.d} ${v.currency}; kurs ${v.fx.n}/${v.fx.d} IDR per ${v.currency}; HS dinyatakan pengguna ${v.hs}; referensi ${v.reference}; masa kurs ${v.fxStart}–${v.fxEnd}.`,rows,caption:'Komponen simulasi manual impor',sources,notes:['Tidak ada tarif resmi otomatis, kurs live atau verifikasi HS oleh alat. Semua tarif, proporsi DPP dan basis dipilih pengguna; hasil tidak membuktikan kepatuhan hukum. BM memakai nilai pabean; PPN/PPh22 memakai basis manual yang dipilih, bukan otomatis semuanya CIF. Tidak mencakup konsinyasi/barang kiriman, fasilitas, cukai, PPnBM, antidumping atau preferensi. Periksa tambahan nilai pabean lain dan dokumen KMK.', 'CIF/manual CIF sudah mencakup freight/asuransi; CFR hanya menambah asuransi. Jumlah cash adalah penjumlahan cash setiap komponen, bukan round(total eksak).',rounding,disclaimer]}
})
export const calculateBphtb=calculate(bphtbInput,v=>{
  const sources:AdvancedSource[]=['regional','jakarta','acquisitionRelief','bphtb2026']
  if(v.region!=='DKI'||v.date<'2024-01-05'||v.date>'2024-12-31')return held('Perlu konfirmasi daerah / periode BPHTB',sources)
  if(v.confirmation!=='confirmed'||v.first!=='confirmed'||v.facility!=='none-confirmed'||!['sale','auction','inheritance','testament'].includes(v.acquisition)||v.taxpayer==='unknown'||v.property==='unknown'||v.value===undefined||v.njop===undefined)return held('Klasifikasi / perolehan pertama / fasilitas belum terverifikasi',sources)
  const family=['inheritance','testament'].includes(v.acquisition)
  if(family&&(v.taxpayer!=='individual'||v.relation!=='direct-family'))return held('Hubungan penerima waris / hibah wasiat belum terverifikasi',sources)
  const base=v.value>v.njop?v.value:v.njop
  if(v.taxpayer==='individual'&&v.property==='landed'&&base<=2000000000n&&v.acquisition!=='auction')return held('Potensi pembebasan rumah tapak pertama: perlu pemeriksaan Pergub23',sources)
  const allowance=family?1000000000n:250000000n,taxable=base>allowance?base-allowance:0n,tax=R(taxable,20n),amount=cash(tax)
  return{status:'estimated',title:'Estimasi dasar BPHTB sebelum fasilitas (bukan tagihan final)',amount,details:[e('Nilai perolehan sah input',R(v.value)),e('NJOP tahun perolehan',R(v.njop)),e('NPOP setelah floor NJOP',R(base)),e('NPOPTKP sesuai cakupan',R(allowance)),e('Dasar kena BPHTB',R(taxable)),e('Tarif (%)',R(5n),'percent'),e('BPHTB dasar eksak',tax),e('Penyesuaian cash',sub(R(amount),tax))],sources,notes:['Hanya DKI tahun2024, perolehan pertama terkonfirmasi dan kasus biasa tanpa fasilitas. Jual beli memakai harga transaksi, lelang harga dalam risalah; waris/hibah wasiat memakai nilai pasar sah dengan hubungan garis lurus satu derajat atau suami/istri. NJOP harus sesuai tahun perolehan. Tanggal saat terutang mengikuti PPJB/AJB, akta, pendaftaran peralihan waris atau penunjukan lelang menurut Pasal41.', 'Hasil sebelum fasilitas, bukan penetapan BPHTB final. Tidak meliputi PPh final penjual, jasa notaris/PPAT atau biaya lainnya. Tahun2025/2026 dan fasilitas khusus perlu regulasi serta penetapan tersendiri; tidak memakai preset2024.',rounding,disclaimer]}
})
export const calculatePbb=calculate(pbbInput,v=>{
  const sources:AdvancedSource[]=['regional','jakarta','assessment','relief2024','pbb2025','pbb2026']
  if(v.region!=='DKI'||v.year!=='2024')return held('Perlu konfirmasi daerah / tahun PBB-P2',sources)
  if(v.confirmation!=='confirmed'||!['residential','nonresidential','food'].includes(v.use)||v.allocation==='unknown'||v.purpose!=='gross-only'||v.land===undefined||v.building===undefined)return held('NJOP / klasifikasi / alokasi NJOPTKP belum terverifikasi',sources)
  const total=v.land+v.building,allowance=v.allocation==='this-object'?60000000n:0n,after=total>allowance?total-allowance:0n,factor=v.use==='residential'?R(2n,5n):R(3n,5n),rate=v.use==='food'?R(1n,400n):R(1n,200n),base=mul(R(after),factor),tax=mul(base,rate),amount=cash(tax)
  return{status:'estimated',title:'PBB-P2 bruto sebelum fasilitas (bukan tagihan SPPT)',amount,details:[e('NJOP bumi',R(v.land)),e('NJOP bangunan',R(v.building)),e('Jumlah NJOP',R(total)),e('NJOPTKP objek ini, satu kali per WP',R(allowance)),e('NJOP setelah pengurang dan floor nol',R(after)),e('Persentase penilaian (%)',mul(factor,R(100n)),'percent'),e('NJOP dasar perhitungan',base),e('Tarif PBB-P2 (%)',mul(rate,R(100n)),'percent'),e('PBB bruto eksak sebelum fasilitas',tax),e('Penyesuaian cash',sub(R(amount),tax))],sources,notes:['DKI tahun2024 saja, NJOP resmi sesuai kondisi1Januari dan klasifikasi objek telah dikonfirmasi. Hunian mengikuti data Bapenda; penggunaan komersial/dominan dan tanah kosong bukan otomatis hunian. Lahan pangan/ternak hanya bila klasifikasi resmi memenuhi cakupan PBB-P2, bukan PBB pusat perkebunan/perhutanan/pertambangan.', 'NJOPTKP hanya satu objek tiap WP per tahun, bukan per bidang bumi dan bangunan. Bila sudah dialokasikan pada objek lain, alat tidak menguranginya lagi.', 'Hasil bruto sebelum pembebasan/pengurangan/keringanan/sanksi, BUKAN pembayaran SPPT. Pergub16/2024 dapat membebaskan hunian tertentu; Rp880.000 contoh tidak berarti wajib dibayar. Tidak menghitung fasilitas, plafon kenaikan, NIK atau keputusan individual;2025/2026 ditahan.',rounding,disclaimer]}
})
