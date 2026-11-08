'use client'
import {useId,useState,type FormEvent} from 'react'
import {CalculatorForm,ResultPanel} from '../ui/calculator'
import {Input,Select} from '../ui/controls'
import {goldFields} from '../../lib/supplemental/tools'
import {calculateGold,type GoldResult} from '../../lib/supplemental/gold'
import {cashText,formatEntry} from '../../lib/marketplace-economics/format'
import {formatUnits,formatExact} from '../../lib/units-scale/format'
import {quantizeSigned} from '../../lib/units-scale/engines'
import type{Rational}from '../../lib/utilities-materials/rational'
import styles from '../ui/calculator.module.css'
import table from '../ui/loan-schedule.module.css'
function grams(v:Rational){const n=quantizeSigned(v,6);return `${formatUnits(n,6,'g',v.n!==0n&&n===0n?'positive':undefined)} (eksak ${formatExact(v,'g')})`}
export function GoldForm(){
 const id=useId(),hint=`${id}-hint`,caption=`${id}-ledger`,[mode,setMode]=useState(''),[purityMode,setPurityMode]=useState(''),[result,setResult]=useState<GoldResult>()
 const fields=goldFields.inputFields.filter(f=>f.id!=='spread'||mode==='spread').filter(f=>f.id!=='buybackPrice'||mode==='direct')
 const errors=result?.success===false?result.errors:undefined,output=result?.success?result:undefined,ledger=output?.ledger
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setResult(calculateGold(Object.fromEntries(new FormData(event.currentTarget))))}
 const invalid=errors?fields.flatMap(f=>errors[f.id]?.length?[{id:`${id}-${f.id}`,label:f.label}]:[]):undefined
 return <><div className={styles.grid}>
 <CalculatorForm title="Data emas dan quote manual" hint={goldFields.hint} hintId={hint} submitLabel="Hitung emas" invalidFields={invalid} onSubmit={submit} onChange={()=>setResult(undefined)}>
 {fields.map(f=>{const props={id:`${id}-${f.id}`,name:f.id,label:f.label+(f.unit==='IDR'?' (Rp)':''),'aria-describedby':hint,error:errors?.[f.id]?.[0]};return f.options?<Select {...props} key={f.id} defaultValue="" onChange={e=>{if(f.id==='buybackMode')setMode(e.target.value);if(f.id==='purityMode')setPurityMode(e.target.value)}}><option value="" disabled>Pilih {f.label.toLocaleLowerCase('id')}</option>{f.options.map(o=><option value={o.value} key={o.value}>{o.label}</option>)}</Select>:<Input {...props} key={f.id==='purity'?`${f.id}-${purityMode}`:f.id} type={f.type==='date'?'date':'text'} inputMode={f.type==='text'||f.type==='date'?undefined:f.type==='decimal'?'decimal':'numeric'} />})}
 </CalculatorForm>
 <ResultPanel result={output?{label:ledger?'Penerimaan buyback manual setelah biaya (cash)':'Status quote',value:ledger?cashText(ledger.payoutCash):output.status}:undefined} details={ledger?[{label:'Modal pembelian (cash)',value:cashText(ledger.capitalCash)},{label:'Selisih penerimaan dan modal (cash)',value:cashText(ledger.differenceCash)},{label:'Berat emas murni teoretis',value:grams(ledger.fine)},{label:'Usia quote terhadap tanggal simulasi',value:`${ledger.age} hari`}]:[]} assumptions={ledger?'Simulasi nilai logam, bukan harga real-time, assay, penawaran dealer atau perhitungan pajak. Quote per gram murni tidak sama dengan harga per gram perhiasan. Selisih cash berasal dari dua arus kas yang masing-masing dibulatkan sekali.':output?'Tidak ada nominal saat quote/sumber/tanggal/biaya belum lengkap atau stale.':undefined} message={errors?'Periksa kolom yang ditandai.':'Isi data dan sumber quote Anda; tidak ada harga atau tarif bawaan.'}/>
 </div>
 {ledger&&<section className={table.schedule}><h2>Rekonsiliasi emas manual</h2><div className={table.scroll} role="region" tabIndex={0} aria-labelledby={caption}><table><caption id={caption}>Nilai eksak sebelum pembulatan, satuan dan arus kas</caption><thead><tr><th scope="col">Komponen</th><th scope="col">Nilai</th></tr></thead><tbody>{[
 ['Berat bruto',grams(ledger.gross)],['Berat nonemas',grams(ledger.nonGold)],['Berat neto alloy',grams(ledger.net)],['Kadar rasional',`${ledger.purity.n}/${ledger.purity.d}`],['Fineness teoretis per1000',formatExact(ledger.fineness,'‰')],['Berat murni',grams(ledger.fine)],['Quote beli per gram murni',formatEntry(ledger.price)],['Nilai logam sebelum biaya',formatEntry(ledger.buyValue)],['Biaya beli',formatEntry(ledger.buyCosts)],['Modal eksak',formatEntry(ledger.capital)],['Adjustment modal',formatEntry(ledger.capitalAdjustment)],['Modal cash',cashText(ledger.capitalCash)],['Quote buyback per gram murni',formatEntry(ledger.buybackPrice)],['Buyback bruto',formatEntry(ledger.buybackGross)],['Biaya jual dan pemotongan manual',formatEntry(ledger.sellCosts)],['Penerimaan eksak',formatEntry(ledger.payout)],['Adjustment penerimaan',formatEntry(ledger.payoutAdjustment)],['Penerimaan cash',cashText(ledger.payoutCash)],['Selisih eksak',formatEntry(ledger.difference)],['Selisih cash yang direkonsiliasi',cashText(ledger.differenceCash)],
 ].map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div><p>{mode==='spread'?(ledger.minimumQuote!==undefined?`Quote baru minimum rupiah per gram murni untuk menutup modal eksak pada spread tetap: ${cashText(ledger.minimumQuote)}. Ini batas model, bukan ramalan harga.`:'Spread100%: tidak ada quote finite yang menutup modal melalui model spread tetap.'):'Quote buyback langsung tidak digunakan untuk meramalkan spread atau titik impas masa depan.'}</p></section>}
 </>
}
