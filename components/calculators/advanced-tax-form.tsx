'use client'
import {useId,useState} from 'react'
import {advancedTools,type AdvancedSlug,type AdvancedTool} from '../../lib/tax-advanced/tools'
import {advancedSources,advancedSnapshot} from '../../lib/tax-advanced/sources'
import type {AdvancedResult} from '../../lib/tax-advanced/engines'
import {cashText,formatEntry} from '../../lib/marketplace-economics/format'
import {StructuredForm} from '../ui/structured-form'
import {ResultPanel} from '../ui/calculator'
import styles from '../ui/calculator.module.css'
import table from '../ui/loan-schedule.module.css'
import local from './advanced-tax.module.css'
export function AdvancedTaxForm({slug}:{slug:AdvancedSlug}){
 const tool:AdvancedTool=advancedTools[slug],caption=useId(),[result,setResult]=useState<AdvancedResult>()
 const output=result?.success?result:undefined,errors=result?.success===false?result.errors:undefined
 return <><div className={styles.grid}>
  <StructuredForm tool={tool} errors={errors} onResult={v=>setResult(tool.engine(v))} onChange={()=>setResult(undefined)}/>
  <div className={local.result}><ResultPanel result={output?{label:output.amount===undefined?'Status kelayakan / cakupan':output.title,value:output.amount===undefined?output.title:cashText(output.amount)}:undefined} details={output?.details.map(d=>({label:d.label,value:formatEntry(d.value,d.kind)}))} assumptions={output?`${output.context??''} Data/model ${advancedSnapshot.version}; diverifikasi ${advancedSnapshot.verifiedAt}. ${output.notes.join(' ')}`:undefined} message={errors?'Periksa kolom yang ditandai.':'Isi kolom dan konfirmasi cakupan untuk melihat estimasi atau status.'}/>
   {output&&<p className={styles.hint}>Status: {output.status==='manual'?'simulasi manual':output.status==='estimated'?'estimasi terbatas dengan fakta terkonfirmasi':'tanpa angka pajak, perlu pemeriksaan'}. {output.sources.map((s,i)=><span key={s}>{i>0&&'; '}<a href={advancedSources[s].url}>{advancedSources[s].title}</a></span>)}</p>}
   {slug==='pph-21-bulanan'&&<p className={styles.hint}>Untuk masa terakhir, lihat <a href="/kalkulator/pph-21-rekonsiliasi">rekonsiliasi PPh21 dan batas kelayakannya</a>.</p>}
  </div>
 </div>
 {output?.rows&&<section className={table.schedule}><p className={table.hint}>Rincian eksak sebelum pembulatan. Geser tabel dengan keyboard atau sentuhan pada layar sempit.</p><div className={table.scroll} role="region" aria-labelledby={caption} tabIndex={0}><table><caption id={caption}>{output.caption}</caption><thead><tr><th scope="col">{slug==='pajak-impor'?'Komponen':'Lapisan PKP'}</th>{output.rows[0].cells.map(c=><th scope="col" key={c.label}>{c.label}</th>)}</tr></thead><tbody>{output.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.cells.map(cell=><td key={cell.label}>{formatEntry(cell.value,cell.kind)}</td>)}</tr>)}</tbody></table></div></section>}
 </>
}
