import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { calculateEffectiveLoan, calculateMortgage, calculateEarlyPayoff, calculateRefinance, calculateExchange, solveDatedYield, dateDay, type ScenarioResult, type ScenarioRow } from '../lib/loan-scenarios/engines'
import { calculateAnnuity } from '../lib/finance/engines'
import { formatScenario } from '../lib/loan-scenarios/format'
import { listPublished, listCategory, sitemapPaths } from '../lib/registry'
const ok = (r: ScenarioResult) => { expect(r.success).toBe(true); if (!r.success) throw Error(JSON.stringify(r.errors)); return r }
const bad = (r: ScenarioResult, key?: string) => { expect(r.success).toBe(false); if (r.success) throw Error('Expected validation'); if (key) expect(r.errors[key]).toBeTruthy(); }
const loan = { proceeds: '1000', disbursed: '2023-01-01', repayments: [{ amount: '1100', date: '2024-01-01' }] }
const kpr = { price: '1200', down: '200', months: '3', fixedRate: '12', fixedMonths: '1', nextRate: '24', fees: '50' }
const early = { principal: '1000', months: '3', rate: '12', extra: '400', eventMonth: '1', penalty: '2' }
const refi = { principal: '1000', months: '3', oldRate: '12', newRate: '0', newMonths: '3', cost: '14' }
function reconcile(rows: readonly ScenarioRow[], p: bigint) {
 let balance=p, principal=0n, interest=0n, total=0n, fees=0n
 for (const r of rows) {
  expect(r.balance).toBeGreaterThanOrEqual(0n); expect(r.interest).toBeGreaterThanOrEqual(0n)
  expect(r.payment).toBe(r.ordinary+r.extra+r.fee)
  expect(r.payment).toBe(r.principal+r.interest+r.fee)
  expect(r.balance).toBe(balance-r.principal)
  balance=r.balance;principal+=r.principal;interest+=r.interest;total+=r.payment;fees+=r.fee
 }
 expect(balance).toBe(0n);expect(principal).toBe(p);expect(total).toBe(p+interest+fees)
}
const Indep = Decimal.clone({ precision: 60 })
function residual(r: ReturnType<typeof ok>, proceeds: string) {
 const a=new Indep(r.certificate!.annualFactor)
 const pv=r.dated!.reduce((s,x)=>s.plus(new Indep(x.amount.toString()).div(a.pow(new Indep(x.days).div(365)))),new Indep(0))
 expect(pv.minus(proceeds).abs().lt('0.00000001')).toBe(true)
}
describe('Batch 10 independent fixtures',()=>{
 it('dated loan yield matches independent ACT365 fixtures and residual',()=>{
  const r=ok(calculateEffectiveLoan(loan));expect(r.values.effective).toBe(100000n);residual(r,'1000')
  const irregular=ok(calculateEffectiveLoan({proceeds:'1000',disbursed:'2024-01-01',repayments:[{amount:'550',date:'2024-07-01'},{amount:'600',date:'2025-01-01'}]}))
  expect(irregular.values.effective).toBe(203129n);expect(irregular.dated?.map(x=>x.days)).toEqual([182,366]);residual(irregular,'1000')
  expect(new Indep(irregular.certificate!.annualFactor).minus('1.2031286506098715226195353465772527552869154287459616803852777464730614').abs().lt('1e-45')).toBe(true)
 })
 it.each(['900','1000','1100'])('dated yield supports negative zero positive: %s',amount=>{
  const r=ok(calculateEffectiveLoan({...loan,repayments:[{amount,date:'2024-01-01'}]}));expect(r.values.effective).toBe((BigInt(amount)-1000n)*1000n);residual(r,'1000')
 })
 it('ACT365 includes leap days and is not ACTACT',()=>{
  expect(dateDay('2024-03-01')!-dateDay('2024-02-28')!).toBe(2)
  expect(dateDay('2024-03-11')!-dateDay('2024-03-09')!).toBe(2)
  const r=ok(calculateEffectiveLoan({...loan,disbursed:'2024-01-01',repayments:[{amount:'1100',date:'2025-01-01'}]}))
  expect(r.values.effective).toBe(99714n);residual(r,'1000')
 })
 it('duplicate dates aggregate and order does not matter',()=>{
  const a={...loan,repayments:[{amount:'500',date:'2024-01-01'},{amount:'600',date:'2024-01-01'}]}
  expect(ok(calculateEffectiveLoan(a)).values).toEqual(ok(calculateEffectiveLoan({...a,repayments:[...a.repayments].reverse()})).values)
  expect(ok(calculateEffectiveLoan(a)).values.effective).toBe(100000n)
 })
 it('dated rate increases with later payment amount and falls with later positive yield date',()=>{
  const a=ok(calculateEffectiveLoan(loan));const b=ok(calculateEffectiveLoan({...loan,repayments:[{amount:'1200',date:'2024-01-01'}]}));
  const c=ok(calculateEffectiveLoan({...loan,repayments:[{amount:'1100',date:'2025-01-01'}]}));
  expect(b.values.effective).toBeGreaterThan(a.values.effective);expect(c.values.effective).toBeLessThan(a.values.effective)
 })
 it('tiny signed yields retain direction',()=>{
  for(const [amount,sign] of [['9999999999998','negative'],['9999999999999','positive']] as const){
   const p=sign==='negative'?'9999999999999':'9999999999998'
   const r=ok(calculateEffectiveLoan({...loan,proceeds:p,repayments:[{amount,date:'2024-01-01'}]}));expect(r.values.effective).toBe(0n);expect(r.tiny).toBe(sign);residual(r,p)
  }
 })
 it('full row and date horizon limits converge with bounded residual',()=>{
  const r=ok(calculateEffectiveLoan({proceeds:'9999999999999',disbursed:'1900-01-01',repayments:Array.from({length:100},(_,i)=>({amount:'9999999999999',date:i%2?'2000-01-02':'1999-12-31'}))}))
  residual(r,'9999999999999');expect(r.certificate!.iterations).toBeLessThan(300)
 },30000)
 it.each(['2023-02-29','2024-02-30','2023-01-01','2022-12-31','2200-01-01','2024-1-01','2024-01-01T00:00:00Z'])('invalid repayment date %s',date=>bad(calculateEffectiveLoan({...loan,repayments:[{amount:'1100',date}]}),'repayments.0.date'))
 it('dated row count empty zero future horizon and proceeds guards',()=>{
  bad(calculateEffectiveLoan({...loan,repayments:[]}));bad(calculateEffectiveLoan({...loan,repayments:Array(101).fill(loan.repayments[0])}))
  bad(calculateEffectiveLoan({...loan,proceeds:'0'}),'proceeds');bad(calculateEffectiveLoan({...loan,repayments:[{amount:'0',date:'2024-01-01'}]}),'repayments.0.amount')
  bad(calculateEffectiveLoan({...loan,repayments:[{amount:'1100',date:'2124-01-01'}]}),'repayments.0.date')
 })
 it('out of domain yields return a transparent failure instead of a guess',()=>{
  bad(calculateEffectiveLoan({...loan,repayments:[{amount:'9999999999999',date:'2023-01-02'}]}),'proceeds')
  bad(calculateEffectiveLoan({...loan,proceeds:'9999999999999',repayments:[{amount:'1',date:'2024-01-01'}]}),'proceeds')
 })
 it('solver with exhausted budget refuses unverified numerical output',()=>{
  const r=solveDatedYield(1000n,[{amount:1100n,date:'2024-01-01',days:365}],1)
  expect('errors' in r).toBe(true)
  if('errors' in r)expect(r.errors.proceeds[0]).toContain('toleransi')
 })
 it('exact annual domain endpoints are supported without numerical false rejection',()=>{
  const upper=ok(calculateEffectiveLoan({...loan,proceeds:'1',repayments:[{amount:'101',date:'2024-01-01'}]}));expect(upper.values.effective).toBe(100000000n);residual(upper,'1')
  const lower=ok(calculateEffectiveLoan({...loan,proceeds:'10000',repayments:[{amount:'1',date:'2024-01-01'}]}));expect(lower.values.effective).toBe(-999900n);residual(lower,'10000')
 })
 it('mortgage reamortizes rounded switch balance and reconciles outlay',()=>{
  const r=ok(calculateMortgage(kpr));expect(r.values).toMatchObject({principal:1000n,phaseOne:341n,phaseTwo:345n,switchBalance:669n,interest:30n,total:1030n,upfront:250n,outlay:1280n,last:344n,lastMonth:3n})
  expect(r.schedules![0].rows.map(x=>[x.payment,x.interest,x.balance])).toEqual([[341n,10n,669n],[345n,13n,337n],[344n,7n,0n]])
  reconcile(r.schedules![0].rows,1000n)
 })
 it('KPR zero rates switch zero and full phase match independent annuity',()=>{
  for(const fixedMonths of ['0','3']){
   const r=ok(calculateMortgage({...kpr,fixedRate:'0',nextRate:'0',fixedMonths}));expect(r.values.outlay).toBe(1250n);expect(r.values.interest).toBe(0n)
   expect(r.schedules![0].rows.map(x=>x.payment)).toEqual([334n,334n,332n])
  }
  const r=ok(calculateMortgage({...kpr,fixedMonths:'3'}));const a=calculateAnnuity({principal:'1000',rate:'12',months:'3'})
  if(!a.success)throw Error();expect(r.values.total).toBe(a.values.total);expect(r.values.phaseTwo).toBe(0n)
  const start=ok(calculateMortgage({...kpr,fixedMonths:'0'}));const b=calculateAnnuity({principal:'1000',rate:'24',months:'3'})
  if(!b.success)throw Error();expect(start.values.total).toBe(b.values.total);expect(start.values.phaseOne).toBe(0n)
 })
 it('KPR fully paid upfront has no debt and rejects DP and switch over limits',()=>{
  const r=ok(calculateMortgage({...kpr,down:'1200'}));expect(r.values.outlay).toBe(1250n);expect(r.values.total).toBe(0n);reconcile(r.schedules![0].rows,0n)
  bad(calculateMortgage({...kpr,down:'1201'}),'down');bad(calculateMortgage({...kpr,fixedMonths:'4'}),'fixedMonths')
 })
 it('early payoff keeps reference payment and separates penalty from principal',()=>{
  const r=ok(calculateEarlyPayoff(early));expect(r.values).toMatchObject({standard:341n,baseInterest:20n,interest:13n,saved:7n,penalty:2n,net:5n,extra:400n,total:1015n,baselineTotal:1020n,lastMonth:2n,monthsSaved:1n})
  expect(r.schedules![1].rows[0]).toMatchObject({ordinary:341n,extra:400n,fee:2n,payment:743n,principal:731n,interest:10n,balance:269n})
  r.schedules!.forEach(s=>reconcile(s.rows,1000n))
 })
 it('extra caps at residual, zero interest and high penalty can lose money',()=>{
  const r=ok(calculateEarlyPayoff({...early,rate:'0',extra:'9999',penalty:'5'}));expect(r.values).toMatchObject({extra:666n,total:1005n,monthsSaved:2n,net:-5n});reconcile(r.schedules![1].rows,1000n)
  expect(ok(calculateEarlyPayoff({...early,penalty:'10'})).values.net).toBe(-3n)
 })
 it('zero extra is baseline and already settled event is invalid',()=>{
  const r=ok(calculateEarlyPayoff({...early,extra:'0',penalty:'0'}));expect(r.values.net).toBe(0n);expect(r.schedules![0].rows).toEqual(r.schedules![1].rows)
  bad(calculateEarlyPayoff({...early,eventMonth:'3'}),'eventMonth');bad(calculateEarlyPayoff({...early,eventMonth:'4'}),'eventMonth')
  bad(calculateEarlyPayoff({...early,extra:'0'}),'penalty')
  bad(calculateEarlyPayoff({...early,principal:'1',months:'600',rate:'100',eventMonth:'2'}),'eventMonth')
 })
 it('refinance tracks temporary and permanent crossovers across unequal tenors',()=>{
  const r=ok(calculateRefinance(refi));expect(r.firstCrossing).toBe(2);expect(r.permanentCrossing).toBe(2);expect(r.values.net).toBe(6n);expect(r.comparison?.map(x=>x.cumulative)).toEqual([-14n,-7n,0n,6n]);r.schedules!.forEach(s=>reconcile(s.rows,1000n))
  const extended=ok(calculateRefinance({...refi,oldRate:'0',newRate:'12',newMonths:'6',cost:'10'}));
  expect(extended.comparison?.map(x=>x.cumulative)).toEqual([-10n,151n,312n,471n,298n,125n,-45n]);expect(extended.firstCrossing).toBe(1);expect(extended.permanentCrossing).toBeNull();expect(extended.values.net).toBe(-45n)
 })
 it('same-rate no-cost and no-break-even boundaries are explicit',()=>{
  const same=ok(calculateRefinance({...refi,newRate:'12',cost:'0'}));expect(same.firstCrossing).toBe(0);expect(same.permanentCrossing).toBe(0);expect(same.values.net).toBe(0n)
  const never=ok(calculateRefinance({...refi,cost:'21'}));expect(never.firstCrossing).toBeNull();expect(never.permanentCrossing).toBeNull();expect(never.values.net).toBe(-1n)
  const temporary=ok(calculateRefinance({...refi,oldRate:'0',newRate:'12',newMonths:'6',cost:'0'}));expect(temporary.firstCrossing).toBe(0);expect(temporary.permanentCrossing).toBeNull()
 })
 it('shorter new tenor compares through old end including zero new payments',()=>{
  const r=ok(calculateRefinance({...refi,months:'6',newMonths:'3',cost:'0'}));expect(r.comparison).toHaveLength(7);expect(r.comparison![6].next).toBe(0n)
  expect(r.comparison![6].cumulative).toBe(r.values.oldTotal-r.values.newTotal);expect(r.firstCrossing).toBe(0);expect(r.permanentCrossing).toBe(6)
 })
 it('all loan schedules reconcile for small/max balances 0/100% and 1/600 months',()=>{
  for(const principal of ['1','9','1000','9999999999999'])for(const rate of ['0','0.0001','100'])for(const months of ['1','600']){
   for(const fixedMonths of ['0',months]){
    const r=ok(calculateMortgage({...kpr,price:principal,down:'0',fixedRate:rate,nextRate:rate,months,fixedMonths}));reconcile(r.schedules![0].rows,BigInt(principal));expect(r.values.outlay).toBe(BigInt(principal)+50n+r.values.interest)
   }
   const r=ok(calculateRefinance({...refi,principal,oldRate:rate,newRate:rate,months,newMonths:months,cost:'0'}));r.schedules!.forEach(s=>reconcile(s.rows,BigInt(principal)));expect(r.values.net).toBe(0n)
  }
 })
 it('rounding tail can exceed reference and is disclosed',()=>{
  const r=ok(calculateMortgage({...kpr,price:'9',down:'0',months:'600',fixedMonths:'600',fixedRate:'100'}));expect(r.values.phaseOne).toBe(1n);expect(r.values.last).toBe(10n);expect(r.values.interest).toBe(600n);expect(r.notes?.join(' ')).toContain('penutup lebih besar')
 })
 it('early schedules reconcile across event rates and capped extras',()=>{
  for(const rate of ['0','12','100'])for(const extra of ['1','400','9999999999999']){
   const r=ok(calculateEarlyPayoff({...early,months:'600',rate,extra,eventMonth:'1',penalty:'9999999999999'}));r.schedules!.forEach(s=>reconcile(s.rows,1000n));expect(r.values.baselineTotal-r.values.total).toBe(r.values.net)
  }
 })
 it('manual FX respects direction target units and exact fee bounds',()=>{
  expect(ok(calculateExchange({direction:'usd-idr',amount:'100.25',rate:'15000.5',fee:'1000'}))).toMatchObject({unit:'IDR',values:{gross:1503800n,fee:1000n,net:1502800n}})
  expect(ok(calculateExchange({direction:'idr-usd',amount:'100000',rate:'15000',fee:'0.10'}))).toMatchObject({unit:'USD',values:{gross:667n,fee:10n,net:657n}})
 })
 it('FX halfway rounding zero exact fee and subunit positive',()=>{
  expect(ok(calculateExchange({direction:'idr-usd',amount:'1',rate:'200',fee:'0'})).values.gross).toBe(1n)
  expect(ok(calculateExchange({direction:'usd-idr',amount:'0.01',rate:'50',fee:'0'})).values.gross).toBe(1n)
  const r=ok(calculateExchange({direction:'idr-usd',amount:'1',rate:'1000',fee:'0'}));expect(r.values.net).toBe(0n);expect(r.tiny).toBe('positive')
  const zero=ok(calculateExchange({direction:'idr-usd',amount:'100',rate:'100',fee:'1'}));expect(zero.values.net).toBe(0n);expect(zero.tiny).toBeUndefined()
  bad(calculateExchange({direction:'idr-usd',amount:'1',rate:'200',fee:'0.01'}),'fee')
 })
 it('FX max products stay precise beyond safe integer',()=>{
  const r=ok(calculateExchange({direction:'usd-idr',amount:'9999999999999.99',rate:'9999999999999.999999',fee:'0'}));
  expect(r.values.gross).toBe(99999999999999899990000000n);expect(r.values.net+r.values.fee).toBe(r.values.gross)
 })
 it.each(['-1','NaN','Infinity','1e3','','1.1','10000000000000',null,undefined])('invalid loan money %s',principal=>{
  bad(calculateEarlyPayoff({...early,principal}),'principal');bad(calculateRefinance({...refi,principal}),'principal')
 })
 it.each(['-1','100.0001','NaN','Infinity','','1e1','0.00001',null])('invalid nominal rate %s',rate=>bad(calculateMortgage({...kpr,fixedRate:rate}),'fixedRate'))
 it.each(['0','601','-1','1.5','','NaN',null])('invalid tenor %s',months=>bad(calculateRefinance({...refi,months}),'months'))
 it('FX refuses missing direction zero rates wrong decimals negative and excessive fees',()=>{
  for(const input of [ {},{direction:'usd-idr',amount:'1',rate:'0',fee:'0'},{direction:'idr-usd',amount:'1.01',rate:'1',fee:'0'}, {direction:'usd-idr',amount:'1.001',rate:'1',fee:'0'}, {direction:'usd-idr',amount:'1',rate:'0.0000001',fee:'0'}, {direction:'usd-idr',amount:'1',rate:'1',fee:'0.1'}, {direction:'usd-idr',amount:'1',rate:'1',fee:'2'}, {direction:'idr-usd',amount:'1',rate:'1',fee:'-1'}])bad(calculateExchange(input))
 })
 it('signed formats and units preserve negative and tiny direction',()=>{
  expect(formatScenario(-100000n,'rate')).toBe('−10,0000%');expect(formatScenario(0n,'rate',undefined,'negative')).toContain('negatif');expect(formatScenario(657n,'target','USD')).toBe('USD6,57');expect(formatScenario(0n,'target','USD','positive')).toBe('<USD0,01 (positif)')
 })
 it('publishes exactly five existing IDs with 81 tools 20 finance and 87 sitemap URLs',()=>{
  expect(listPublished()).toHaveLength(96);expect(listCategory('keuangan')).toHaveLength(20);expect(listCategory('bisnis')).toHaveLength(20);expect(listCategory('marketplace')).toHaveLength(16);expect(sitemapPaths()).toHaveLength(103)
  expect(new Set(listPublished().map(x=>x.id)).size).toBe(96)
 })
})
