import {it,expect,describe} from 'vitest'
import {readFileSync} from 'node:fs'
import {calculateVat as vat,calculatePph23 as pph,calculateRent as rent,calculateGrossUp as gross,calculateUmkm as umkm,type TaxResult} from '../lib/tax/engines'
import {fraction as R,add,subtract,multiply} from '../lib/utilities-materials/rational'
import {taxSources,taxSnapshot} from '../lib/tax/sources'
import {taxTools} from '../lib/tax/tools'
import {listPublished,listCategory,listCategoryHubs,sitemapPaths,findPublished} from '../lib/registry'
const vatBase={date:'2026-05-01',treatment:'general',confirmation:'confirmed',mode:'exclusive',amount:'100000'}
const pphBase={date:'2026-05-01',type:'services',recipient:'domestic-body',identity:'npwp',confirmation:'confirmed',mode:'exclusive',amount:'10000000',vat:'0'}
const rentBase={date:'2026-05-01',type:'land-building',role:'withholder',confirmation:'confirmed',vatStatus:'none',rent:'100000000',service:'0',maintenance:'0',other:'0'}
const months=(v:Record<number,string>={})=>Array.from({length:12},(_,i)=>({turnover:v[i+1]??'0'}))
const umkmBase={year:'2026',month:'5',registration:'2026-04-22',taxpayer:'individual',income:'business',eligibility:'confirmed',aggregation:'confirmed',wpTurnoverScope:'all-businesses',priorRelatedTurnover:'0',currentRelatedTurnover:'530000000',history:'clean',months:months({4:'480000000',5:'50000000'})}
function ok(r:TaxResult){expect(r.success).toBe(true);if(!r.success)throw Error(JSON.stringify(r.errors));return r}
function amount(r:TaxResult){return ok(r).amount}
function entry(r:TaxResult,label:string){const e=ok(r).details.find(e=>e.label===label);if(!e)throw Error(label);return e.value}
function held(r:TaxResult){const v=ok(r);expect(v.amount).toBeUndefined();expect(v.rows).toBeUndefined();expect(v.details).toEqual([]);expect(['unsupported','unverified']).toContain(v.status)}
function bad(r:TaxResult,field?:string){expect(r.success).toBe(false);if(!r.success&&field)expect(r.errors[field]).toBeDefined()}
const equal=(v:{n:bigint;d:bigint},n:bigint,d=1n)=>expect(v.n*d).toBe(n*v.d)
describe('Batch18 source anchored tax',()=>{
 it('VAT separates commercial price legal DPP and date transitions',()=>{const r=vat(vatBase);expect(amount(r)).toBe(11000n);equal(entry(r,'DPP untuk menghitung PPN eksak'),275000n,3n);equal(entry(r,'Harga komersial sebelum PPN eksak'),100000n);expect(amount(vat({...vatBase,treatment:'luxury-other'}))).toBe(12000n);expect(amount(vat({...vatBase,treatment:'luxury-retail',date:'2025-01-31'}))).toBe(11000n);expect(amount(vat({...vatBase,treatment:'luxury-retail',date:'2025-02-01'}))).toBe(12000n)})
 it('VAT inclusive exact invoice conserves cash and fractional bases',()=>{const r=vat({...vatBase,mode:'inclusive',amount:'111000'});expect(amount(r)).toBe(11000n);equal(entry(r,'Harga komersial sebelum PPN eksak'),100000n);const tiny=vat({...vatBase,mode:'inclusive',amount:'1'});equal(entry(tiny,'PPN eksak'),11n,111n);expect(amount(tiny)).toBe(0n);equal(entry(tiny,'Harga komersial cash rekonsiliasi'),1n)})
 it('VAT manual requires explicit rates and permits defined zero',()=>{bad(vat({...vatBase,treatment:'manual'}),'manualRate');bad(vat({...vatBase,treatment:'manual',manualRate:'12'}),'manualBase');const r=vat({...vatBase,treatment:'manual',manualRate:'50',manualBase:'1',amount:'1'});equal(entry(r,'PPN eksak'),1n,200n);expect(ok(r).status).toBe('manual');expect(amount(vat({...vatBase,treatment:'manual',manualRate:'0',manualBase:'100'}))).toBe(0n)})
 it('VAT unknown special exemption and dates fail closed rather than zero',()=>{for(const treatment of ['special','nonvat','unknown'])held(vat({...vatBase,treatment}));for(const date of ['2023-12-31','2026-11-09'])held(vat({...vatBase,date}));for(const confirmation of ['unknown','excluded'])held(vat({...vatBase,confirmation}));expect(amount(vat({...vatBase,date:'2025-01-01'}))).toBe(11000n);equal(entry(vat({...vatBase,date:'2024-12-31'}),'DPP untuk menghitung PPN eksak'),100000n);held(vat({...vatBase,date:'2024-12-31',treatment:'luxury-other'}));expect(amount(vat({...vatBase,date:taxSnapshot.supportedThrough}))).toBe(11000n)})
 it('VAT forward exact and invoice cash invariants cover amounts modes and classes',()=>{for(const amount of ['0','1','5','9999999999999'])for(const mode of ['exclusive','inclusive'])for(const treatment of ['general','luxury-other']){const r=vat({...vatBase,amount,mode,treatment}),h=entry(r,'Harga komersial sebelum PPN eksak'),tax=entry(r,'PPN eksak');if(mode==='inclusive')equal(add(h,tax),BigInt(amount));equal(add(tax,entry(r,'Penyesuaian pembulatan PPN')),ok(r).amount!);equal(add(entry(r,'Harga komersial cash rekonsiliasi'),R(ok(r).amount!)),entry(r,'Total termasuk PPN cash').n)}})
 it('PPh23 class identity VAT basis and eligibility are explicit',()=>{expect(amount(pph(pphBase))).toBe(200000n);expect(amount(pph({...pphBase,type:'royalty'}))).toBe(1500000n);expect(amount(pph({...pphBase,identity:'none'}))).toBe(400000n);expect(amount(pph({...pphBase,type:'royalty',identity:'none'}))).toBe(3000000n)})
 it('PPh23 inclusive and exclusive separately invoiced VAT reconcile identically',()=>{for(const mode of ['exclusive','inclusive']){const r=pph({...pphBase,mode,amount:mode==='inclusive'?'11100000':'10000000',vat:'1100000'});expect(amount(r)).toBe(200000n);equal(entry(r,'Dana dibayar kepada penerima (invoice − potongan cash)'),10900000n);equal(entry(r,'Dasar bruto tidak termasuk PPN'),10000000n)}})
 it('PPh23 half rupiah zero and maximal amounts do not lose precision',()=>{expect(amount(pph({...pphBase,amount:'25'}))).toBe(1n);expect(amount(pph({...pphBase,amount:'0'}))).toBe(0n);equal(entry(pph({...pphBase,amount:'9999999999999'}),'PPh 23 eksak'),9999999999999n,50n)})
 it('PPh23 unsupported recipients objects identity and exceptions never show payable',()=>{for(const patch of [{recipient:'other'},{recipient:'unknown'},{type:'other'},{identity:'unknown'},{confirmation:'excluded'},{confirmation:'unknown'},{date:'2024-12-31'},{date:'2026-11-09'}])held(pph({...pphBase,...patch}));bad(pph({...pphBase,mode:'inclusive',amount:'1',vat:'2'}),'vat')})
 it('PPh23 withholding exact and cash invoice ledger conserve at rate boundaries',()=>{for(const type of ['services','royalty'])for(const identity of ['npwp','none'])for(const amount of ['0','1','25','9999999999999']){const r=pph({...pphBase,type,identity,amount,vat:'1'});equal(add(entry(r,'Dana dibayar kepada penerima (invoice − potongan cash)'),R(ok(r).amount!)),BigInt(amount)+1n);equal(add(entry(r,'PPh 23 eksak'),entry(r,'Penyesuaian pembulatan')),ok(r).amount!)}})
 it('rental tax includes related charges and separates payer roles',()=>{expect(amount(rent(rentBase))).toBe(10000000n);expect(amount(rent({...rentBase,rent:'90000000',service:'5000000',maintenance:'3000000',other:'2000000'}))).toBe(10000000n);const r=rent({...rentBase,role:'self'});equal(entry(r,'Kas diterima sebelum setor sendiri'),100000000n);equal(entry(r,'Kas setelah alokasi PPh (model)'),90000000n)})
 it('rental zero and half ties retain correct cash role',()=>{expect(amount(rent({...rentBase,rent:'0'}))).toBe(0n);const r=rent({...rentBase,rent:'5'});expect(amount(r)).toBe(1n);equal(entry(r,'Kas diserahkan penyewa pemotong'),4n);equal(entry(rent({...rentBase,rent:'5',role:'self'}),'Kas diterima sebelum setor sendiri'),5n)})
 it('rental unsupported hotel BGS VAT uncertain role and exceptions have no figures',()=>{for(const patch of [{type:'lodging'},{type:'other'},{role:'unknown'},{confirmation:'unknown'},{confirmation:'excluded'},{vatStatus:'unresolved'},{date:'2024-12-31'}])held(rent({...rentBase,...patch}))})
 it('rental sum split invariance and maximum remain exact',()=>{for(const n of ['0','5','9999999999999']){const r=rent({...rentBase,rent:n,service:n,maintenance:n,other:n});equal(entry(r,'Jumlah bruto seluruh komponen'),4n*BigInt(n));equal(entry(r,'Pajak eksak 10%'),4n*BigInt(n),10n)}})
 it('manual gross up verifies exact forward and previous integer minimality',()=>{expect(amount(gross({target:'9000000',rate:'10',fixed:'0'}))).toBe(10000000n);const r=gross({target:'1000000',rate:'15',fixed:'0'});expect(amount(r)).toBe(1176471n);equal(entry(r,'Neto kandidat sebelum pembulatan (memenuhi)'),20000007n,20n);equal(entry(r,'Neto bruto satu rupiah lebih rendah (gagal)'),1999999n,2n)})
 it('gross up zero fixed additions near100 and cash counterexample use exact ceiling',()=>{expect(amount(gross({target:'0',rate:'0',fixed:'0'}))).toBe(0n);expect(amount(gross({target:'0',rate:'0',fixed:'7'}))).toBe(7n);expect(amount(gross({target:'1',rate:'50',fixed:'0'}))).toBe(2n);expect(amount(gross({target:'9999999999999',rate:'99.999999',fixed:'9999999999999'}))).toBe(1999999999999800000000n);bad(gross({target:'1',rate:'100',fixed:'0'}),'rate')})
 it('gross up minimality property holds at every documented rate bound',()=>{for(const rate of ['0','0.000001','2','15','50','99.999999'])for(const target of ['0','1','5','9999999999999'])for(const fixed of ['0','7']){const r=gross({target,rate,fixed});const n=entry(r,'Neto kandidat sebelum pembulatan (memenuhi)');expect(n.n).toBeGreaterThanOrEqual(BigInt(target)*n.d);if(ok(r).amount!>0n){const p=entry(r,'Neto bruto satu rupiah lebih rendah (gagal)');expect(p.n).toBeLessThan(BigInt(target)*p.d)}}})
 it('UMKM eligibility and cumulative fiscal ledger guard legal boundaries',()=>{const r=umkm(umkmBase);expect(amount(r)).toBe(150000n);expect(ok(r).rows).toHaveLength(5);expect(ok(r).rows![4].taxable).toBe(30000000n);expect(ok(r).totals!.turnover).toBe(530000000n);expect(amount(umkm({...umkmBase,currentRelatedTurnover:'450000000',months:months({4:'400000000',5:'50000000'})}))).toBe(0n)})
 it('UMKM corporations get no individual500million exemption',()=>{for(const taxpayer of ['single-company','cooperative']){const r=umkm({...umkmBase,taxpayer});expect(amount(r)).toBe(250000n);expect(ok(r).totals!.taxable).toBe(530000000n);equal(entry(r,'Bagian omzet tidak dikenai (OP saja)'),0n)}})
 it('UMKM annual threshold±one is not deducted anew each month',()=>{for(const [before,current,expected]of [[499999999n,1n,0n],[500000000n,1n,1n],[499999999n,2n,1n]]){const r=umkm({...umkmBase,currentRelatedTurnover:String(before+current),months:months({4:String(before),5:String(current)})});expect(ok(r).rows![4].taxable).toBe(expected)}})
 it('UMKM monthly ties conserve cash totals rather than round aggregate',()=>{const r=umkm({...umkmBase,month:'6',currentRelatedTurnover:'500000200',months:months({4:'500000000',5:'100',6:'100'})});expect(ok(r).totals!.taxCash).toBe(2n);equal(ok(r).totals!.tax,1n);expect(ok(r).rows!.map(x=>x.taxCash)).toEqual([0n,0n,0n,0n,1n,1n])})
 it('UMKM registration legal cutoff old transitional and future never invent eligibility',()=>{for(const registration of ['2018-06-20','2026-04-21','2026-12-01'])held(umkm({...umkmBase,registration,months:registration>'2026-11-08'?months():umkmBase.months}));expect(amount(umkm({...umkmBase,registration:'2026-04-22'}))).toBe(150000n)})
 it('UMKM categories professions normal election aggregation and history gate all results',()=>{for(const patch of [{taxpayer:'other'},{income:'excluded'},{income:'unknown'},{eligibility:'unknown'},{eligibility:'excluded'},{aggregation:'unknown'},{history:'left'},{history:'unknown'}])held(umkm({...umkmBase,...patch}))})
 it('UMKM prior and current combined threshold equality and crossing are guarded',()=>{expect(amount(umkm({...umkmBase,priorRelatedTurnover:'4800000000'}))).toBe(150000n);held(umkm({...umkmBase,priorRelatedTurnover:'4800000001'}));held(umkm({...umkmBase,currentRelatedTurnover:'4800000001'}));expect(amount(umkm({...umkmBase,currentRelatedTurnover:'4800000000'}))).toBe(150000n);held(umkm({...umkmBase,currentRelatedTurnover:'4800000001',months:months({4:'4800000000',5:'1'})}))})
 it('UMKM fixed fiscal months reject future nonzero pre-registration and inadequate aggregation',()=>{bad(umkm({...umkmBase,months:months({6:'1'})}),'months.5.turnover');bad(umkm({...umkmBase,months:months({3:'1'})}),'months.2.turnover');bad(umkm({...umkmBase,currentRelatedTurnover:'1'}),'currentRelatedTurnover');for(const size of [0,11,13])bad(umkm({...umkmBase,months:Array.from({length:size},()=>({turnover:'0'}))}))})
 it('UMKM unsupported years periods are status rather than prior regime reuse',()=>{for(const year of ['2025','2027'])held(umkm({...umkmBase,year}));for(const month of ['1','2','3','4','12'])held(umkm({...umkmBase,month,months:months()}));bad(umkm({...umkmBase,month:'13'}),'month')})
 it('UMKM cumulative invariants and monthly taxable telescoping hold for both WP types',()=>{for(const taxpayer of ['individual','single-company','cooperative'])for(const values of [{4:'500000000',5:'1',6:'99'},{4:'1',5:'1',6:'1'},{4:'0',5:'4800000000',6:'0'}]){const ms=months(values),total=ms.reduce((s,x)=>s+BigInt(x.turnover),0n),r=ok(umkm({...umkmBase,taxpayer,month:'6',months:ms,currentRelatedTurnover:String(total)}));const allowance=taxpayer==='individual'?500000000n:0n;expect(r.totals!.taxable).toBe(total>allowance?total-allowance:0n);expect(r.rows!.reduce((s,x)=>s+x.taxCash,0n)).toBe(r.totals!.taxCash);equal(r.rows!.reduce((s,x)=>add(s,x.tax),R(0n)),r.totals!.tax.n,r.totals!.tax.d)}})
 it('date validation is calendar-only and rejects leap errors missing and numeric inputs',()=>{for(const date of ['2026-02-29','2025-13-01','2025-01-32','0000-01-01','2026-5-1','',null,1]){bad(vat({...vatBase,date}),'date');bad(pph({...pphBase,date}),'date');bad(rent({...rentBase,date}),'date')}expect(amount(vat({...vatBase,date:'2024-02-29'}))).toBe(11000n)})
 it('strict money percent and unknown enums reject malformed and excessive input',()=>{for(const amount of ['',null,1,'-1','NaN','Infinity','1e3','1.0','1,000','10000000000000']){bad(vat({...vatBase,amount}),'amount');bad(pph({...pphBase,amount}),'amount');bad(gross({target:amount,rate:'0',fixed:'0'}),'target')}for(const rate of ['-1','100.000001','0.0000001',null,NaN])bad(gross({target:'1',rate,fixed:'0'}),'rate');bad(vat({...vatBase,treatment:'anything'}));bad(umkm({...umkmBase,taxpayer:'company'}))})
 it('all engines reject null array numeric missing required payload without throwing',()=>{for(const fn of [vat,pph,rent,gross,umkm])for(const value of [null,undefined,[],1,'',{}])expect(()=>bad(fn(value))).not.toThrow()})
 it('five sources and snapshots expose legal dates separate from application cutoff',()=>{expect(taxSources.pp20.effectiveFrom).toBe('2026-04-22');expect(taxSources.rent.effectiveFrom).toBe('2018-01-02');expect(taxSources.vat.effectiveFrom).toBe('2025-01-01');expect(taxSnapshot.version).toBe('1.1.0');expect(taxSources.pp20.effectiveUntil).toBeNull();expect(ok(umkm(umkmBase)).law).toContain('2026-04-22')})
 it('publishes100 tools six hubs ten taxes107URLs and100unique inventory IDs',()=>{expect(listPublished()).toHaveLength(100);expect(listCategory('pajak')).toHaveLength(10);expect(listCategoryHubs()).toHaveLength(6);expect(sitemapPaths()).toHaveLength(107);for(const slug of Object.keys(taxTools))expect(findPublished(slug)?.id).toBe(`calc-${slug}`);for(const slug of ['kalkulator-tidak-ada'])expect(findPublished(slug)).toBeUndefined();const rows=readFileSync('docs/CALCULATOR_INVENTORY.md','utf8').split('\n').filter(l=>/^\| (production-cost|calc-)/.test(l));expect(rows).toHaveLength(100);expect(new Set(rows.map(l=>l.split('|')[1])).size).toBe(100);expect(rows.filter(l=>l.includes('| published |'))).toHaveLength(100)})
})

describe('PR46 independent taxpayer turnover bases',()=>{
 it('combines all same-WP businesses before applying the annual allowance once',()=>{
  // Business B April200m + business A May400m belong to the same WP.
  const r=ok(umkm({...umkmBase,months:months({4:'200000000',5:'400000000'}),currentRelatedTurnover:'800000000'}))
  expect(r.amount).toBe(500000n);expect(r.totals!.turnover).toBe(600000000n);expect(r.rows![4].taxable).toBe(100000000n)
  equal(entry(r,'Omzet gabungan pihak terkait (uji kelayakan saja)'),800000000n)
 })
 it('different-WP aggregation affects eligibility only and never consumes this WP allowance',()=>{
  for(const currentRelatedTurnover of ['600000000','800000000','4800000000']){
   const r=umkm({...umkmBase,months:months({4:'200000000',5:'200000000'}),currentRelatedTurnover})
   expect(amount(r)).toBe(0n);expect(ok(r).totals!.taxable).toBe(0n)
  }
  held(umkm({...umkmBase,currentRelatedTurnover:'4800000001'}))
 })
 it('partial or unconfirmed same-WP business coverage never produces tax or a ledger',()=>{
  for(const wpTurnoverScope of ['partial','unknown','',undefined])held(umkm({...umkmBase,wpTurnoverScope}))
  held(umkm({...umkmBase,wpTurnoverScope:'partial',months:months({5:'400000000'}),currentRelatedTurnover:'600000000'}))
 })
 it('missing monthly or eligibility data is a status, not a zero-tax assumption',()=>{
  for(const key of ['priorRelatedTurnover','currentRelatedTurnover','eligibility','aggregation','income','history'])for(const value of ['',undefined])held(umkm({...umkmBase,[key]:value}))
  for(const index of [0,3,4,11])for(const turnover of ['',undefined]){const ms=months({4:'480000000',5:'50000000'}) as {turnover:string|undefined}[];ms[index]={turnover};held(umkm({...umkmBase,months:ms}))}
 })
 it('legacy ambiguous aggregation payload cannot silently regain a payable',()=>{
  const {wpTurnoverScope,priorRelatedTurnover,currentRelatedTurnover,...legacy}=umkmBase
  held(umkm({...legacy,prior:priorRelatedTurnover,currentAggregate:currentRelatedTurnover}))
 })
 it('complete zero and allowance±one distinguish exact tax from rounded cash',()=>{
  for(const total of [0n,499999999n,500000000n,500000001n]){
   const r=ok(umkm({...umkmBase,months:months({5:String(total)}),currentRelatedTurnover:'600000000'}))
   expect(r.totals!.taxable).toBe(total>500000000n?1n:0n);equal(r.totals!.tax,total>500000000n?1n:0n,200n);expect(r.amount).toBe(0n)
  }
 })
 it('partial registration-month scope and old taxpayer guards remain fail closed',()=>{
  held(umkm({...umkmBase,registration:'2026-05-15',months:months({5:'600000000'}),currentRelatedTurnover:'600000000',wpTurnoverScope:'partial'}))
  expect(amount(umkm({...umkmBase,registration:'2026-05-15',months:months({5:'600000000'}),currentRelatedTurnover:'600000000'}))).toBe(500000n)
  held(umkm({...umkmBase,registration:'2026-04-21',months:months({5:'600000000'}),currentRelatedTurnover:'600000000'}))
 })
 it('malformed optional turnover is rejected rather than treated as missing',()=>{
  for(const value of [null,-1,'-1','1.5','10000000000000']){bad(umkm({...umkmBase,currentRelatedTurnover:value}),'currentRelatedTurnover');bad(umkm({...umkmBase,months:months().map((m,i)=>i===4?{turnover:value}:m)}),'months.4.turnover')}
 })
})
