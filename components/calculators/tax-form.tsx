'use client'
import {useId,useState} from 'react'
import {taxTools,type TaxSlug,type TaxTool} from '../../lib/tax/tools'
import {taxSnapshot,taxSources} from '../../lib/tax/sources'
import type {TaxResult} from '../../lib/tax/engines'
import {formatEntry,cashText} from '../../lib/marketplace-economics/format'
import {fraction as R} from '../../lib/utilities-materials/rational'
import {StructuredForm} from '../ui/structured-form'
import {ResultPanel} from '../ui/calculator'
import styles from '../ui/calculator.module.css'
import table from '../ui/loan-schedule.module.css'
export function TaxForm({slug}:{slug:TaxSlug}){
 const tool:TaxTool=taxTools[slug],caption=useId(),hint=useId(),[result,setResult]=useState<TaxResult>()
 const output=result?.success?result:undefined,errors=result?.success===false?result.errors:undefined
 return <><div className={styles.grid}>
  <StructuredForm tool={tool} errors={errors} onResult={v=>setResult(tool.engine(v))} onChange={()=>setResult(undefined)}/>
  <div><ResultPanel result={output?{label:output.amount===undefined?'Status kelayakan / cakupan':output.title,value:output.amount===undefined?output.title:cashText(output.amount)}:undefined} details={output?.details.map(d=>({label:d.label,value:formatEntry(d.value,d.kind)}))} assumptions={output?`${output.law}. Data/model ${taxSnapshot.version}; diverifikasi ${taxSnapshot.verifiedAt}. ${output.notes.join(' ')}`:undefined} message={errors?'Periksa kolom yang ditandai.':'Isi semua kolom dan konfirmasi cakupan untuk melihat hasil.'}/>
  {output&&<p className={styles.hint}>Status: {output.status==='manual'?'simulasi manual':output.status==='estimated'?'estimasi dengan fakta terkonfirmasi pengguna':'tanpa angka pajak, perlu pemeriksaan'}. {output.sources.map((s,i)=><span key={s}>{i>0&&'; '}<a href={taxSources[s].url}>{taxSources[s].title}</a></span>)}</p>}</div>
 </div>{output?.rows&&output.totals&&<section className={table.schedule}><p id={hint} className={table.hint}>Ledger Januari sampai masa dipilih. Cash dibulatkan perbulan; footer adalah jumlah cash bulanan, bukan pembulatan ulang totaleksak. Geser tabel pada layar sempit.</p><div className={table.scroll} role="region" tabIndex={0} aria-labelledby={caption} aria-describedby={hint}><table><caption id={caption}>Ledger omzet dan PPh final UMKM per masa</caption><thead><tr>{['Bulan','Omzet','Kumulatif','Bagian kena','Pajak eksak','Penyesuaian cash','Pajak cash'].map(t=><th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{output.rows.map(r=><tr key={r.month}><th scope="row">{r.month}</th><td>{cashText(r.turnover)}</td><td>{cashText(r.cumulative)}</td><td>{cashText(r.taxable)}</td><td>{formatEntry(r.tax)}</td><td>{formatEntry(R(r.taxCash*r.tax.d-r.tax.n,r.tax.d))}</td><td>{cashText(r.taxCash)}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total s.d. masa</th><td>{cashText(output.totals.turnover)}</td><td>{cashText(output.totals.turnover)}</td><td>{cashText(output.totals.taxable)}</td><td>{formatEntry(output.totals.tax)}</td><td>{formatEntry(R(output.totals.taxCash*output.totals.tax.d-output.totals.tax.n,output.totals.tax.d))}</td><td>{cashText(output.totals.taxCash)}</td></tr></tfoot></table></div></section>}</>
}
