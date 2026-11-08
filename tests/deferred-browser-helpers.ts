import type{Locator}from'@playwright/test'
export const goldFixture={gross:'12',nonGold:'2',purityMode:'karat',purity:'18',price:'1000000',buybackMode:'spread',spread:'10',buyCosts:'20000',sellCosts:'30000',source:'Oracle sintetis, bukan harga pasar',quoteDate:'2026-11-08',asOf:'2026-11-08',maxAge:'0',quoteStatus:'confirmed',costStatus:'complete'}
export const scenarioFixture={price:'100000',quantity:'1',discount:'0',cost:'60000',buyerShipping:'0',shippingFlow:'excluded',shipping:'0',reimbursement:'0',receipts:'0',other:'0',coverage:'ordinary',confirmation:'complete',taxScope:'none',taxAmount:'0',taxEvidence:''}
export const comparisonPlatforms=['Shopee','Tokopedia','TikTok Shop','Lazada']
export async function fillFields(form:Locator,input:Record<string,string>){for(const[name,value]of Object.entries(input)){const field=form.locator(`[name="${name}"]`);if(await field.evaluate(el=>el.tagName==='SELECT'))await field.selectOption(value);else await field.fill(value)}}
export async function addManualFees(form:Locator){
 const rows=[{label:'Admin manual',type:'percent',basis:'gross',rate:'9.25',minimumMode:'none',capMode:'none'},{label:'Proses',type:'fixed',amount:'1250',scope:'order',minimumMode:'none',capMode:'none'}]
 for(let i=0;i<rows.length;i++){await form.getByRole('button',{name:'Tambah biaya',exact:true}).click();await fillFields(form,Object.fromEntries(Object.entries(rows[i]).map(([k,v])=>[`fees.${i}.${k}`,v])) as Record<string,string>)}
}
