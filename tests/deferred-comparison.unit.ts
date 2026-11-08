import{it,expect}from'vitest'
import{calculateManualScenario,compareScenarios,platforms}from'../lib/supplemental/comparison'
import{fraction as R,add,subtract}from'../lib/utilities-materials/rational'
const percent=(rate='9.25')=>({label:'Admin manual',type:'percent',basis:'gross',rate,minimumMode:'none',capMode:'none'})
const fixed=(label='Proses',amount='1250')=>({label,type:'fixed',amount,scope:'order',minimumMode:'none',capMode:'none'})
const input={price:'100000',quantity:'1',discount:'0',cost:'60000',buyerShipping:'0',shipping:'0',reimbursement:'0',receipts:'0',other:'0',shippingFlow:'excluded',coverage:'ordinary',confirmation:'complete',fees:[percent(),fixed()],taxScope:'none',taxAmount:'0',taxEvidence:''}
function complete(patch:Record<string,unknown>={}){const r=calculateManualScenario({...input,...patch});expect(r.success).toBe(true);if(!r.success||!r.ledger)throw Error('Expected ledger');return r}
it('missing8000 is never inferred as official fee',()=>{expect(complete().ledger!.payoutCash).toBe(89500n);expect(complete({other:'8000'}).ledger!.payoutCash).toBe(81500n)})
it('shipping discount confirmed withholding and all fee cash flows reconcile',()=>{
 const r=complete({price:'100000',quantity:'2',discount:'10000',buyerShipping:'5000',shippingFlow:'credited',shipping:'8000',fees:[{...percent('10'),basis:'net'},fixed()],taxScope:'receipt',taxAmount:'750',taxEvidence:'Bukti sintetis',other:'500'}),l=r.ledger!
 expect(l.payoutCash).toBe(165500n);expect(l.profitCash).toBe(45500n);expect(r.tax).toEqual(R(750n));expect(r.otherBeforeTax).toEqual(R(500n))
 expect(subtract(subtract(subtract(add(l.sales,l.receipts),l.feeTotal),l.shipping),add(r.otherBeforeTax!,r.tax!))).toEqual(l.payout)
 expect(add(l.payout,l.adjustment)).toEqual(R(l.payoutCash));expect(l.profitCash+l.cost.n).toBe(l.payoutCash)
})
it('unknown taxes/coverage/fee basis/caps never create a nominal',()=>{
 for(const patch of [{taxScope:'unknown'},{taxScope:'unsupported'},{confirmation:'unknown'},{shippingFlow:'unknown'},{coverage:'unsupported'},{fees:[{...percent(),basis:'unknown'}]},{fees:[{...fixed(),capMode:'unknown'}]}]){const r=calculateManualScenario({...input,...patch});expect(r.success).toBe(true);expect('ledger'in r&&r.ledger).toBeFalsy()}
})
it('empty amounts, inconsistent tax state, double-bound overflow and missing evidence are invalid',()=>{
 for(const patch of [{price:''},{taxAmount:''},{taxAmount:'1'},{taxScope:'receipt',taxAmount:'750',taxEvidence:''},{taxScope:'receipt',taxEvidence:'test',taxAmount:'9999999999999',other:'1'}])expect(calculateManualScenario({...input,...patch}).success).toBe(false)
})
it('fee minimum cap and custom basis reuse existing core without early rounding',()=>{
 const r=complete({price:'1',cost:'0',fees:[percent('50'),{...percent('50'),label:'B'},{...percent('50'),label:'C'}]});expect(r.ledger!.feeTotal).toEqual(R(3n,2n));expect(r.ledger!.payoutCash).toBe(-1n)
 expect(complete({fees:[{...percent('10'),basis:'custom',custom:'50000',minimumMode:'enabled',minimum:'1000',capMode:'enabled',cap:'2000'}]}).ledger!.feeTotal).toEqual(R(2000n))
})
it('comparison is incomplete until all four known channels share quantity/HPP',()=>{
 expect(compareScenarios({}).complete).toBe(false)
 const all=Object.fromEntries(platforms.map(p=>[p,input]));expect(compareScenarios(all).complete).toBe(true)
 expect(compareScenarios({...all,lazada:{...input,quantity:'2'}}).complete).toBe(false);expect(compareScenarios({...all,lazada:{...input,cost:'1'}}).complete).toBe(false)
 expect(compareScenarios({...all,lazada:{...input,taxScope:'unknown'}}).complete).toBe(false)
})
it('exact ranking differentiates cash ties and retains every true tie',()=>{
 const all=Object.fromEntries(platforms.map((p,i)=>[p,{...input,price:'100',cost:'0',fees:[percent(i===0?'0.51':'0.60')]}]));const r=compareScenarios(all);expect(r.complete).toBe(true);if(!r.complete)throw Error('Expected complete')
 expect(r.rows.every(r=>r.ledger.payoutCash===99n)).toBe(true);expect(r.rows.filter(r=>r.best).map(r=>r.platform)).toEqual(['shopee'])
 const ties=compareScenarios(Object.fromEntries(platforms.map(p=>[p,input])));expect(ties.complete&&ties.rows.every(r=>r.best)).toBe(true)
})
