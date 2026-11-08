import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {calculateMonthly as monthly,calculateReconciliation as annual,calculateImport as imports,calculateBphtb as bphtb,calculatePbb as pbb,progressiveTax,jobExpense,type AdvancedResult} from '../lib/tax-advanced/engines'
import {terTables,ptkp} from '../lib/tax-advanced/rates'
import {advancedSnapshot,advancedSources} from '../lib/tax-advanced/sources'
import {advancedTools} from '../lib/tax-advanced/tools'
import {listPublished,listCategory,listCategoryHubs,sitemapPaths,findPublished} from '../lib/registry'
import {monthlyFixture as m,annualFixture as a,importFixture as i,bphtbFixture as b,pbbFixture as p} from './tax-advanced-fixtures'
const max='9999999999999'
function ok(r:AdvancedResult){expect(r.success).toBe(true);if(!r.success)throw Error(JSON.stringify(r.errors));return r}
function held(r:AdvancedResult){const v=ok(r);expect(v.status).toBe('unverified');expect(v.amount).toBeUndefined();expect(v.rows).toBeUndefined();expect(v.details).toEqual([])}
function bad(r:AdvancedResult,key?:string){expect(r.success).toBe(false);if(!r.success&&key)expect(r.errors[key]).toBeDefined()}
function value(r:AdvancedResult,key:string){const e=ok(r).details.find(x=>x.label===key);if(!e)throw Error(key);return e.value}
function exact(v:{n:bigint;d:bigint},n:bigint,d=1n){expect(v.n*d).toBe(n*v.d)}
const doc=readFileSync('docs/BATCH_19_FORMULA_VERIFICATION.md','utf8')
const documented=Object.fromEntries((['A','B','C']as const).map(c=>[c,[...doc.split('### Kategori'+c)[1].split('\n##')[0].matchAll(/^\| (\d+) \| (\d+|∞) \| (\d+)\.(\d\d) \|$/gm)].map(([,lo,hi,whole,dp])=>({lo:BigInt(lo),hi:hi==='∞'?null:BigInt(hi),bp:BigInt(whole)*100n+BigInt(dp)}))]))
describe('Batch19 complete source tables',()=>{
 for(const [category,status,count]of [['A','TK/0',44],['B','TK/2',40],['C','K/3',41]]as const){
  it(`TER complete primary tables and every boundary ±one are exact (${category} structure)`,()=>{
   expect(documented[category]).toHaveLength(count);expect(terTables[category]).toHaveLength(count)
   expect(documented[category][0].lo).toBe(0n);expect(documented[category].at(-1)!.hi).toBeNull()
   for(let k=0;k<count;k++){const d=documented[category][k],actual=terTables[category][k];expect(actual.lower).toBe(d.lo);expect(actual.upper).toBe(d.hi);exact(actual.rate,d.bp,10000n);if(k)expect(d.lo).toBe(documented[category][k-1].hi!+1n)}
  })
  for(const row of documented[category])it(`TER ${category} source bracket ${row.lo}..${row.hi??'infinity'} checks boundaries ±Rp1`,()=>{
   const samples=new Set([row.lo,row.lo>0n?row.lo-1n:0n,row.lo+1n,...(row.hi===null?[BigInt(max)]:[row.hi-1n,row.hi,row.hi+1n])])
   for(const gross of samples){const expected=documented[category].find(x=>gross>=x.lo&&(x.hi===null||gross<=x.hi))!,r=monthly({...m,ptkp:status,gross:String(gross)});exact(value(r,'Tarif TER (%)'),expected.bp,100n);exact(value(r,'Pajak eksak'),gross*expected.bp,10000n);expect(ok(r).amount).toBe((gross*expected.bp*2n+10000n)/20000n)}
  })
 }
 it('maps all eight statuses to exact personal allowance and TER categories',()=>{
  const cases=[['TK/0',54000000n,'A',200000n],['TK/1',58500000n,'A',200000n],['TK/2',63000000n,'B',150000n],['TK/3',67500000n,'B',150000n],['K/0',58500000n,'A',200000n],['K/1',63000000n,'B',150000n],['K/2',67500000n,'B',150000n],['K/3',72000000n,'C',150000n]]as const
  for(const[status,allowance,category,amount]of cases){expect(ptkp[status]).toEqual([allowance,category]);const r=ok(monthly({...m,ptkp:status}));expect(r.amount).toBe(amount);expect(r.context).toContain(`Kategori TER ${category}`)}
 })
 it('monthly legal date transitions and final period refuse unsupported tax',()=>{
  for(const patch of[{year:'2023'},{year:'2027'},{year:'2026',month:'12'},{month:'12'},{month:'8',finalMonth:'8'},{finalMonth:'11'},{employment:'partial-year'},{employers:'multiple'},{relief:'dtp'},{classification:'special'},{ptkp:'other'},{ptkp:'unknown'},{confirmation:'unknown'}])held(monthly({...m,...patch}))
  for(const year of ['2024','2025','2026'])expect(ok(monthly({...m,year,month:'1'})).amount).toBe(200000n)
  for(const key of ['employment','employers','relief','classification','confirmation','ptkp'])for(const v of ['',undefined,null])held(monthly({...m,[key]:v}))
  for(const gross of ['',undefined])held(monthly({...m,gross}))
 })
 it('zero gross and sub-rupiah TER remain distinct from an unknown result',()=>{expect(ok(monthly({...m,gross:'0'})).amount).toBe(0n);exact(value(monthly({...m,ptkp:'TK/0',gross:'5400001'}),'Pajak eksak'),5400001n,400n);expect(ok(monthly({...m,ptkp:'TK/0',gross:'5400001'})).amount).toBe(13500n)})
})
describe('Batch19 annual reconciliation',()=>{
 it('annual reconciliation progressive layers and actual withholding reconcile',()=>{
  const r=ok(annual(a));expect(r.amount).toBe(515000n);exact(value(r,'PPh setahun eksak'),2715000n);exact(value(r,'PKP setelah floor ribuan'),54300000n);expect(r.rows).toHaveLength(5)
  let withheld=0n;for(const month of ['1','2','3','4','5','6','7','8','9','10','11'])withheld+=ok(monthly({...m,month})).amount!;expect(withheld).toBe(2200000n)
  expect(ok(annual({...a,withheld:String(withheld)})).amount!+withheld).toBe(2715000n)
 })
 it('nonuniform gross bonus independent example does not reuse monthly TER on December',()=>{
  const r=annual({...a,gross:'130000000'});exact(value(r,'PPh setahun eksak'),3645000n);expect(ok(r).amount).toBe(1445000n)
  const excessive=ok(annual({...a,gross:'130000000',withheld:'5000000'}));expect(excessive.amount).toBe(-1355000n);expect(excessive.title).toContain('kelebihan');expect(excessive.notes.join(' ')).toContain('bukan pajak terutang negatif')
  expect(ok(annual({...a,withheld:'2715000'})).amount).toBe(0n)
 })
 it('every progressive layer boundary and top end is exact and contiguous',()=>{
  const samples=[[0n,0n],[60000000n,3000000n],[250000000n,31500000n],[500000000n,94000000n],[5000000000n,1444000000n]]as const
  for(const[base,tax]of samples){exact(progressiveTax(base).total,tax);if(base>0n){const before=progressiveTax(base-1n).total,previousRate=base===60000000n?5n:base===250000000n?15n:base===500000000n?25n:30n;exact(before,tax*100n-previousRate,100n)}}
  for(const [base,tax,rate]of [[60000000n,3000000n,15n],[250000000n,31500000n,25n],[500000000n,94000000n,30n],[5000000000n,1444000000n,35n]]as const){exact(progressiveTax(base+1n).total,tax*100n+rate,100n);exact(progressiveTax(base+1000n).total,tax+10n*rate)}
 })
 it('PKP legally floors positive fractions to whole thousands without float',()=>{
  // At gross below the expense cap net=95%gross: independently chosen around PTKP.
  for(const[gross,pkp]of [['56842105',0n],['56843157',0n],['56843158',1000n]]as const)exact(value(annual({...a,ptkp:'TK/0',gross,contributions:'0',withheld:'0'}),'PKP setelah floor ribuan'),pkp)
  expect(ok(annual({...a,gross:'0',contributions:'0',withheld:'0'})).amount).toBe(0n)
 })
 it('job expense monthly and yearly caps are separately defined with rational precision',()=>{
  exact(jobExpense(0n,1n),0n);exact(jobExpense(9999999n,1n),9999999n,20n);exact(jobExpense(10000000n,1n),500000n);exact(jobExpense(10000001n,1n),500000n)
  exact(jobExpense(119999999n,12n),119999999n,20n);exact(jobExpense(120000000n,12n),6000000n);exact(jobExpense(BigInt(max),12n),6000000n)
 })
 it('eligible contributions and zakat subtract exactly once and reject impossible deductions',()=>{
  exact(value(annual({...a,zakat:'300000'}),'Neto setahun'),112500000n);bad(annual({...a,contributions:'120000001'}),'contributions');bad(annual({...a,gross:'0',contributions:'1'}),'contributions')
  for(const deductions of ['unknown','',undefined])held(annual({...a,deductions}))
 })
 it('partial year previous employer DTP incomplete and future year never receive figures',()=>{
  for(const patch of[{year:'2023'},{year:'2026'},{year:'2027'},{employment:'partial-year'},{employers:'multiple'},{finalMonth:'6'},{aggregate:'partial'},{aggregate:'unknown'},{relief:'dtp'},{ptkp:'other'},{classification:'special'},{confirmation:'unknown'}])held(annual({...a,...patch}))
  for(const key of['gross','contributions','zakat','withheld'])held(annual({...a,[key]:''}));expect(ok(annual({...a,year:'2025'})).amount).toBe(515000n)
 })
 it('maximum annual values and signed prior withholding preserve exact reconciliation',()=>{
  for(const gross of ['0','120000000',max])for(const withheld of ['0','2715000',max]){const r=annual({...a,gross,withheld,contributions:'0'}),delta=value(r,'Selisih eksak masa terakhir'),tax=value(r,'PPh setahun eksak');expect(delta.n*tax.d+BigInt(withheld)*delta.d*tax.d).toBe(tax.n*delta.d)}
 })
})
describe('Batch19 manual import',()=>{
 it('import manual CIF and declared bases conserve exact cash components',()=>{
  const r=ok(imports(i));expect(r.status).toBe('manual');expect(r.amount).toBe(519000n);exact(value(r,'Nilai pabean IDR eksak'),2000000n);exact(value(r,'BM manual eksak'),200000n);exact(value(r,'PPN manual eksak'),264000n);exact(value(r,'PPh22 manual eksak'),55000n);expect(r.context).toContain('SIMULASI MANUAL')
 })
 it('FOB CFR CIF and declared CIF never double count freight or insurance',()=>{
  for(const[incoterm,value,freight,insurance]of [['FOB','100','20','5'],['CFR','120','0','5'],['CIF','125','0','0'],['declared','125','0','0']])expect(ok(imports({...i,incoterm,value,freight,insurance})).amount).toBe(519000n)
  for(const incoterm of ['CFR','CIF','declared'])bad(imports({...i,incoterm}),'freight')
  bad(imports({...i,incoterm:'CIF',freight:'0'}),'insurance')
 })
 it('manual VAT and income bases are explicit and separate from CIF and each other',()=>{
  const r=imports({...i,vatBase:'customs',incomeBase:'plus-duty',vatFactor:'50'});exact(value(r,'PPN manual eksak'),120000n);exact(value(r,'PPh22 manual eksak'),55000n);expect(ok(r).amount).toBe(375000n)
  const s=imports({...i,vatBase:'plus-duty',incomeBase:'customs',vatFactor:'100'});exact(value(s,'PPh22 manual eksak'),50000n);expect(ok(s).amount).toBe(514000n)
 })
 it('zero cents tiny FX half-rupiah and component cash preserve rationals',()=>{
  const r=imports({...i,value:'0.000001',freight:'0',insurance:'0',fx:'0.5',dutyRate:'0',vatRate:'0',incomeRate:'0'});exact(value(r,'Nilai pabean IDR eksak'),1n,2000000n);expect(ok(r).amount).toBe(0n)
  const half=imports({...i,value:'1',freight:'0',insurance:'0',fx:'1',dutyRate:'50',vatBase:'customs',vatRate:'50',incomeRate:'0'});expect(ok(half).amount).toBe(2n);exact(value(half,'Jumlah pungutan eksak'),1n);exact(value(half,'Penyesuaian jumlah cash komponen'),1n)
  const cents=imports({...i,value:'100.01',freight:'0',insurance:'0',fx:'1',dutyRate:'0',vatRate:'0',incomeRate:'0'});exact(value(cents,'Nilai pabean IDR eksak'),10001n,100n);expect(ok(cents).context).toContain('10001/100 USD')
 })
 it('KMK date-only endpoints currency units and weekly span are enforced',()=>{
  for(const date of [i.fxStart,i.fxEnd])expect(ok(imports({...i,date})).amount).toBe(519000n)
  for(const date of ['2024-05-28','2024-06-05'])bad(imports({...i,date}),'date')
  bad(imports({...i,fxEnd:'2024-06-05'}),'fxEnd');bad(imports({...i,fxEnd:'2024-05-28'}),'fxEnd');bad(imports({...i,currency:'IDR'}),'fx');expect(ok(imports({...i,currency:'IDR',fx:'1'})).amount).toBe(33n)
  bad(imports({...i,fx:'0'}),'fx');bad(imports({...i,date:'2024-02-30'}),'date')
 })
 it('no legal automatic numbers for missing HS FX schemes references dates or classifications',()=>{
  for(const patch of[{mode:'legal'},{mode:'unknown'},{regime:'consignment'},{regime:'special'},{confirmation:'unknown'},{reference:''},{reference:undefined},{fx:''},{vatRate:''},{vatFactor:''},{incomeRate:''},{vatBase:'unknown'},{incomeBase:'unknown'},{currency:'unknown'},{value:''}])held(imports({...i,...patch}))
  bad(imports({...i,hs:''}),'hs');bad(imports({...i,hs:'8471.30'}),'hs');bad(imports({...i,fx:null}),'fx')
  held(imports({...i,date:'2026-11-09',fxStart:'2026-11-04',fxEnd:'2026-11-10'}));held(imports({...i,date:'2022-12-31',fxStart:'2022-12-28',fxEnd:'2023-01-03'}))
 })
 it('maximal FX value and rates remain exact beyond Number safe integers',()=>{
  const r=imports({...i,value:max+'.999999',freight:max+'.999999',insurance:max+'.999999',fx:max+'.999999',dutyRate:'100',vatRate:'100',incomeRate:'100'});const customs=value(r,'Nilai pabean IDR eksak');expect(customs.n/customs.d).toBeGreaterThan(9007199254740991n);exact(value(r,'Jumlah pungutan eksak'),customs.n*5n,customs.d)
 })
})
describe('Batch19 regional property',()=>{
 it('BPHTB region year first acquisition floor and family guards are explicit',()=>{
  expect(ok(bphtb(b)).amount).toBe(37500000n);exact(value(bphtb(b),'NPOP setelah floor NJOP'),1000000000n)
  expect(ok(bphtb({...b,value:'1200000000'})).amount).toBe(47500000n)
  expect(ok(bphtb({...b,acquisition:'auction'})).amount).toBe(37500000n)
  for(const acquisition of ['inheritance','testament']){const r=bphtb({...b,taxpayer:'individual',property:'apartment',relation:'direct-family',acquisition,value:'1200000000'});expect(ok(r).amount).toBe(10000000n);exact(value(r,'NPOPTKP sesuai cakupan'),1000000000n)}
 })
 it('BPHTB both allowance boundaries ±one retain legal base and cash distinction',()=>{
  for(const[allowance,patch]of [[250000000n,{}],[1000000000n,{taxpayer:'individual',property:'apartment',relation:'direct-family',acquisition:'inheritance'}]]as const)for(const delta of[-1n,0n,1n]){const r=bphtb({...b,...patch,value:String(allowance+delta),njop:'0'});exact(value(r,'BPHTB dasar eksak'),delta>0n?1n:0n,20n);expect(ok(r).amount).toBe(0n)}
  expect(ok(bphtb({...b,value:'0',njop:'0'})).amount).toBe(0n)
 })
 it('BPHTB needs affirmative first acquisition local date and no special facility',()=>{
  for(const patch of[{region:'other'},{region:'unknown'},{date:'2024-01-04'},{date:'2025-01-01'},{date:'2026-06-01'},{first:'unknown'},{first:'not-first'},{facility:'special'},{facility:'unknown'},{acquisition:'gift'},{acquisition:'other'},{taxpayer:'unknown'},{property:'unknown'},{confirmation:'unknown'},{value:''},{njop:''}])held(bphtb({...b,...patch}))
  for(const date of ['2024-01-05','2024-12-31'])expect(ok(bphtb({...b,date})).amount).toBe(37500000n)
 })
 it('BPHTB potential first landed-home exemption and unsupported inheritance fail closed',()=>{
  held(bphtb({...b,taxpayer:'individual',property:'landed'}));held(bphtb({...b,taxpayer:'individual',property:'apartment',acquisition:'inheritance',relation:'unknown'}));held(bphtb({...b,acquisition:'inheritance',relation:'direct-family'}))
  expect(ok(bphtb({...b,taxpayer:'individual',property:'landed',value:'2000000001'})).amount).toBe(87500000n)
 })
 it('PBB gross regional factor and single object allowance never imply SPPT',()=>{
  const r=ok(pbb(p));expect(r.amount).toBe(880000n);expect(r.title).toContain('bukan tagihan SPPT');expect(r.notes.join(' ')).toContain('BUKAN pembayaran SPPT')
  expect(ok(pbb({...p,use:'nonresidential'})).amount).toBe(1320000n);expect(ok(pbb({...p,use:'food'})).amount).toBe(660000n)
  expect(ok(pbb({...p,allocation:'other-object'})).amount).toBe(1000000n);exact(value(pbb({...p,allocation:'other-object'}),'NJOPTKP objek ini, satu kali per WP'),0n)
 })
 it('PBB combines land and building before one allowance with threshold±one zero floor',()=>{
  for(const total of[0n,59999999n,60000000n,60000001n]){const r=pbb({...p,land:String(total),building:'0'});exact(value(r,'PBB bruto eksak sebelum fasilitas'),total>60000000n?1n:0n,500n);expect(ok(r).amount).toBe(0n)}
  for(const[land,building]of[['500000000','0'],['0','500000000'],['300000000','200000000']])expect(ok(pbb({...p,land,building})).amount).toBe(880000n)
 })
 it('PBB unknown region year classification facility calculation and multiple-property allocation hold',()=>{
  for(const patch of[{region:'other'},{region:'unknown'},{year:'2023'},{year:'2025'},{year:'2026'},{year:'2027'},{use:'central'},{use:'exempt'},{use:'unknown'},{allocation:'unknown'},{purpose:'payable'},{purpose:'unknown'},{confirmation:'unknown'},{land:''},{building:''}])held(pbb({...p,...patch}))
 })
 it('regional maximum money and fractional half cash do not overflow',()=>{
  const r=bphtb({...b,value:max,njop:max});exact(value(r,'BPHTB dasar eksak'),BigInt(max)-250000000n,20n)
  const s=pbb({...p,land:max,building:max,allocation:'other-object',use:'food'});exact(value(s,'PBB bruto eksak sebelum fasilitas'),BigInt(max)*3n,1000n)
  expect(ok(bphtb({...b,value:'250000010',njop:'0'})).amount).toBe(1n)
 })
})
describe('Batch19 release and strict input',()=>{
 it('all five engines reject malformed null excessive negative and numeric values without throwing',()=>{
  const engines=[[monthly,m,'gross'],[annual,a,'gross'],[imports,i,'value'],[bphtb,b,'value'],[pbb,p,'land']]as const
  for(const [fn,fixture,key]of engines){for(const input of[null,undefined,[],1,'',{}])expect(()=>bad(fn(input))).not.toThrow();for(const v of[null,-1,'-1','NaN','Infinity','1e3','10000000000000'])bad(fn({...fixture,[key]:v}),key)}
  for(const amount of['1.1','1,000'])bad(monthly({...m,gross:amount}),'gross');for(const rate of['100.000001','-1','0.0000001',null])bad(imports({...i,dutyRate:rate}),'dutyRate')
 })
 it('sources distinguish effective date snapshot and scope without claiming later-year eligibility',()=>{
  expect(advancedSnapshot.verifiedAt).toBe('2026-11-08');expect(advancedSources.ter.effectiveFrom).toBe('2024-01-01');expect(advancedSources.assessment.effectiveFrom).toBe('2024-05-30');expect(advancedSources.bphtb2026.effectiveFrom).toBe('2026-05-13');expect(advancedSources.pbb2026.effectiveFrom).toBe('2026-04-01')
  for(const tool of Object.values(advancedTools)){expect(tool.sources.length).toBeGreaterThan(0);for(const s of tool.sources)expect(advancedSources[s].url).toMatch(/^https:\/\//)}
 })
 it('publishes exactly100 of100 unique inventory IDs ten tax tools six hubs and107URLs',()=>{
  expect(listPublished()).toHaveLength(100);expect(listCategory('pajak')).toHaveLength(10);expect(listCategoryHubs()).toHaveLength(6);expect(sitemapPaths()).toHaveLength(107)
  const inventory=readFileSync('docs/CALCULATOR_INVENTORY.md','utf8').split('\n').filter(l=>/^\| (production-cost|calc-)/.test(l));expect(inventory).toHaveLength(100);expect(new Set(inventory.map(l=>l.split('|')[1])).size).toBe(100);expect(inventory.filter(l=>l.includes('| published |'))).toHaveLength(100)
  for(const slug of Object.keys(advancedTools))expect(findPublished(slug)?.id).toBe(`calc-${slug}`);for(const slug of ['kalkulator-tidak-ada'])expect(findPublished(slug)).toBeUndefined()
 })
})
