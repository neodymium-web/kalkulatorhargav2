import {useId}from'react'
import type{ScenarioResult}from'../../lib/supplemental/comparison'
import{formatEntry,cashText}from'../../lib/marketplace-economics/format'
import{add,subtract}from'../../lib/utilities-materials/rational'
import table from'../ui/loan-schedule.module.css'
export function SettlementBreakdown({result,label}:{result:Extract<ScenarioResult,{success:true}>;label:string}){
 const id=useId(),v=result.ledger;if(!v)return null
 return <section className={table.schedule}><h3>Ledger {label}</h3><div className={table.scroll} role="region" tabIndex={0} aria-labelledby={id}><table><caption id={id}>Rekonsiliasi {label}: pecahan eksak, biaya dan dana cair</caption><thead><tr><th scope="col">Komponen</th><th scope="col">Basis atau scope</th><th scope="col">Sebelum batas</th><th scope="col">Sesudah batas / nilai</th></tr></thead><tbody>
 {v.fees.map(f=><tr key={f.label}><th scope="row">{f.label}</th><td>{f.basis}; min {f.minimum===undefined?'tidak berlaku':cashText(f.minimum)}; cap {f.cap===undefined?'tidak berlaku':cashText(f.cap)}</td><td>{formatEntry(f.raw)}</td><td>{formatEntry(f.value)}</td></tr>)}
 {[
 ['Bruto',v.gross],['Diskon seller',subtract(v.gross,v.sales)],['Penjualan neto',v.sales],['Penerimaan aktual tambahan',v.receipts],['Total fee',v.feeTotal],['Ongkir seller',v.shipping],['Biaya lain sebelum pemotongan',result.otherBeforeTax!],['Pemotongan manual dari bukti',result.tax!],['Total biaya lain + pemotongan (tidak ganda)',add(result.otherBeforeTax!,result.tax!)],['Payout eksak',v.payout],['Adjustment payout',v.adjustment],['HPP',v.cost],['Hasil setelah HPP eksak',v.profit],
 ].map(([name,value])=><tr key={String(name)}><th scope="row">{String(name)}</th><td colSpan={2}>Rupiah eksak</td><td>{formatEntry(value as typeof v.gross)}</td></tr>)}
 </tbody><tfoot><tr><th scope="row" colSpan={3}>Dana cair cash</th><td>{cashText(v.payoutCash)}</td></tr><tr><th scope="row" colSpan={3}>Setelah HPP cash, bukan laba bersih</th><td>{cashText(v.profitCash)}</td></tr></tfoot></table></div></section>
}
