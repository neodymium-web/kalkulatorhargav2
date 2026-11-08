import{it,expect}from'vitest'
import{calculateGold}from'../lib/supplemental/gold'
import{fraction as R,add,multiply,subtract}from'../lib/utilities-materials/rational'
import{compare}from'../lib/marketplace-economics/engines'
const input={gross:'12',nonGold:'2',purityMode:'karat',purity:'18',price:'1000000',buybackMode:'spread',spread:'10',buyCosts:'20000',sellCosts:'30000',source:'Oracle sintetis, bukan harga pasar',quoteDate:'2026-11-08',asOf:'2026-11-08',maxAge:'0',quoteStatus:'confirmed',costStatus:'complete'}
function ledger(patch:Record<string,unknown>={}){const r=calculateGold({...input,...patch});expect(r.success).toBe(true);if(!r.success||!r.ledger)throw Error('Expected complete ledger');return r.ledger}
it('independent 12g/18K oracle and minimum quote use exact fractions',()=>{
 const l=ledger();expect(l.net).toEqual(R(10n));expect(l.fine).toEqual(R(15n,2n));expect(l.buyValue).toEqual(R(7500000n));expect(l.capitalCash).toBe(7520000n);expect(l.payoutCash).toBe(6720000n);expect(l.differenceCash).toBe(-800000n);expect(l.minimumQuote).toBe(1118519n)
 const payout=(p:bigint)=>subtract(multiply(l.fine,multiply(R(p),R(9n,10n))),R(30000n))
 expect(compare(payout(l.minimumQuote!),l.capital)).toBeGreaterThanOrEqual(0n);expect(compare(payout(l.minimumQuote!-1n),l.capital)).toBeLessThan(0n)
})
it('18K equals750per-mille while14K never silently becomes585',()=>{
 expect(ledger().fine).toEqual(ledger({purityMode:'fineness',purity:'750'}).fine)
 const l=ledger({gross:'1',nonGold:'0',purity:'14',price:'1',buyCosts:'0',sellCosts:'0'});expect(l.buyValue).toEqual(R(7n,12n));expect(l.purity).not.toEqual(R(585n,1000n))
 expect(ledger({gross:'1',nonGold:'0',purityMode:'fineness',purity:'999.9'}).fine).toEqual(R(9999n,10000n))
})
it('cash difference reconciles rounded flows rather than separately rounded loss',()=>{
 const l=ledger({gross:'1.5',nonGold:'0',purity:'24',price:'1',buyCosts:'0',sellCosts:'0'});expect(l.capital).toEqual(R(3n,2n));expect(l.payout).toEqual(R(27n,20n));expect(l.difference).toEqual(R(-3n,20n));expect(l.capitalCash).toBe(2n);expect(l.payoutCash).toBe(1n);expect(l.differenceCash).toBe(-1n)
 expect(add(l.capital,l.capitalAdjustment)).toEqual(R(l.capitalCash));expect(add(l.payout,l.payoutAdjustment)).toEqual(R(l.payoutCash))
})
it('direct buyback avoids rounded spread and ignores inactive spread',()=>{
 const l=ledger({gross:'1',nonGold:'0',purity:'24',price:'2540000',buybackMode:'direct',buybackPrice:'2335000',spread:'invalid inactive',buyCosts:'0',sellCosts:'0'});expect(l.payoutCash).toBe(2335000n);expect(l.minimumQuote).toBeUndefined()
 expect(ledger({gross:'1',nonGold:'0',purity:'24',price:'2540000',spread:'8.1',buyCosts:'0',sellCosts:'0'}).payoutCash).toBe(2334260n)
})
it('100percent spread has no finite break-even and keeps signed net payout',()=>{
 const l=ledger({spread:'100',sellCosts:'1'});expect(l.payout).toEqual(R(-1n));expect(l.payoutCash).toBe(-1n);expect(l.minimumQuote).toBeUndefined()
})
for(const patch of [{gross:'0',nonGold:'0'},{nonGold:'12'},{nonGold:'13'},{gross:'-1'},{purity:'0'},{purity:'24.000001'},{purityMode:'fineness',purity:'1000.000001'},{price:'0'},{buybackMode:'direct',buybackPrice:'0'},{price:'10000000000000'},{gross:'1e3'},{gross:'0.0000001'},{spread:'100.000001'},{buyCosts:''},{sellCosts:'-1'},{quoteDate:'2025-02-29'},{asOf:'2026-11-07'}])it(`invalid gold ${JSON.stringify(patch)}`,()=>{expect(calculateGold({...input,...patch}).success).toBe(false)})
for(const patch of [{quoteStatus:'unknown'},{costStatus:'unknown'},{price:''},{source:''},{quoteDate:''},{maxAge:''},{asOf:'2026-11-09',maxAge:'0'}])it(`unknown/stale gold ${JSON.stringify(patch)}`,()=>{const r=calculateGold({...input,...patch});expect(r.success).toBe(true);expect('ledger'in r&&r.ledger).toBeFalsy()})
it('date-only leap age and maximum inputs remain exact beyond Number range',()=>{
 expect(ledger({quoteDate:'2024-02-29',asOf:'2024-03-01',maxAge:'1'}).age).toBe(1n)
 const l=ledger({gross:'9999999999999.999999',nonGold:'0',purity:'24',price:'9999999999999',buyCosts:'9999999999999',sellCosts:'9999999999999',quoteDate:'9999-12-31',asOf:'9999-12-31'});expect(l.capital.n).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER));expect(add(l.payout,l.payoutAdjustment)).toEqual(R(l.payoutCash));expect(l.differenceCash).toBe(l.payoutCash-l.capitalCash)
})
