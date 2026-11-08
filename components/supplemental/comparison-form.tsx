'use client'
import{useId,useState}from'react'
import{StructuredForm}from'../ui/structured-form'
import{ResultPanel}from'../ui/calculator'
import{calculateManualScenario,compareScenarios,platforms,platformNames,type ComparisonPlatform,type ScenarioResult}from'../../lib/supplemental/comparison'
import{comparisonFields}from'../../lib/supplemental/tools'
import{cashText,formatEntry}from'../../lib/marketplace-economics/format'
import{SettlementBreakdown}from'./settlement-ledger'
import table from'../ui/loan-schedule.module.css'
import styles from'./supplemental.module.css'
function Scenario({platform,onValidated,onInvalidate}:{platform:ComparisonPlatform;onValidated:(input:unknown)=>void;onInvalidate:()=>void}){
 const[result,setResult]=useState<ScenarioResult>(),out=result?.success?result:undefined
 return <section aria-label={`Skenario ${platformNames[platform]}`} className={styles.scenario}><h2>{platformNames[platform]}: data manual</h2>
 <StructuredForm title={`Skenario ${platformNames[platform]}`} tool={comparisonFields} errors={result?.success===false?result.errors:undefined} onChange={()=>{setResult(undefined);onInvalidate()}} onResult={input=>{const r=calculateManualScenario(input);setResult(r);if(r.success&&r.ledger)onValidated(input);else onInvalidate()}}/>
 <ResultPanel result={out?{label:out.ledger?'Dana cair cash skenario manual':'Status kanal',value:out.ledger?cashText(out.ledger.payoutCash):out.status}:undefined} message={result?.success===false?'Periksa kolom yang ditandai.':'Belum dihitung; data kosong atau tidak diketahui bukan biaya0.'}/>
 {out?.ledger&&<SettlementBreakdown result={out} label={platformNames[platform]}/>}
 </section>
}
export function ComparisonForm(){
 const[inputs,setInputs]=useState<Partial<Record<ComparisonPlatform,unknown>>>({}),result=compareScenarios(inputs),id=useId()
 return <><section className={styles.comparison} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>Perbandingan empat kanal</h2><p role="status">{result.status}</p>
 {result.complete&&<div className={table.scroll} role="region" tabIndex={0} aria-labelledby={`${id}-caption`}><table><caption id={`${id}-caption`}>Hasil manual per pesanan untuk basket jumlah dan HPP yang sama</caption><thead><tr>{['Kanal','Payout eksak','Cash dana cair','Hasil setelah HPP eksak','Hasil setelah HPP cash','Ranking eksak'].map(x=><th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{result.rows.map(r=><tr key={r.platform}><th scope="row">{platformNames[r.platform]}</th><td>{formatEntry(r.ledger.payout)}</td><td>{cashText(r.ledger.payoutCash)}</td><td>{formatEntry(r.ledger.profit)}</td><td>{cashText(r.ledger.profitCash)}</td><td>{r.best?'Terbaik / seri eksak':'Di bawah terbaik'}</td></tr>)}</tbody></table></div>}
 </section>
 <p>Isi dan hitung keempat kanal secara terpisah. Tidak ada tarif resmi, nilai default atau data toko yang diambil otomatis. Perubahan satu input membatalkan ranking sampai skenario itu dihitung lengkap kembali. “Terbaik” membandingkan skenario Anda, bukan merekomendasikan marketplace.</p>
 {platforms.map(platform=><Scenario key={platform} platform={platform} onInvalidate={()=>setInputs(previous=>{const copy={...previous};delete copy[platform];return copy})} onValidated={input=>setInputs(previous=>({...previous,[platform]:input}))}/>)}
 </>
}
