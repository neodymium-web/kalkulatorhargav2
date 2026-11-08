'use client'
import { useId, useState } from 'react'
import { type SettlementResult } from '../../lib/platform-settlement/engine'
import { manualDisclaimer, platformEngine, platformTools, settlementFields, settlementPolicy, type PlatformSlug } from '../../lib/platform-settlement/tools'
import { cashText, formatEntry } from '../../lib/marketplace-economics/format'
import type { Rational } from '../../lib/utilities-materials/rational'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import styles from '../ui/calculator.module.css'
import local from './platform.module.css'
import table from '../ui/loan-schedule.module.css'
const exact = (v: Rational) => `${v.n.toString()}/${v.d.toString()} Rp`
export function PlatformForm({ slug }: { slug: PlatformSlug }) {
  const [result, setResult] = useState<SettlementResult>()
  const caption = useId(), hint = useId(), output = result?.success ? result : undefined, ledger = output?.ledger
  return <><p><strong>{manualDisclaimer}</strong></p><p>{platformTools[slug].context}</p>
    <div className={styles.grid}>
      <StructuredForm tool={settlementFields} errors={result?.success === false ? result.errors : undefined} onChange={() => setResult(undefined)} onResult={input => setResult(platformEngine(input))} />
      <div className={local.result}><ResultPanel result={output ? { label: ledger ? `Dana cair simulasi ${platformTools[slug].name} per pesanan` : 'Status simulasi', value: ledger ? cashText(ledger.payoutCash) : output.status } : undefined} details={output?.details.map(d => ({ label: d.label, value: formatEntry(d.value, d.kind) }))} assumptions={output ? `${settlementPolicy} ${ledger ? '' : 'Tidak ada angka dana cair. Lengkapi konfirmasi, pemetaan ongkir, jenis/basis/scope dan batas biaya. Retur, pajak terpisah, sengketa dan cap per unit tidak didukung.'}` : undefined} message={result?.success === false ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom dan konfirmasi kelengkapan untuk melihat hasil.'} /></div>
    </div>
    {ledger && <section className={table.schedule}><h2>Rekonsiliasi dana cair {platformTools[slug].name}</h2><p id={hint} className={table.hint}>Nilai n/d adalah pecahan eksak rupiah, bukan pembulatan invoice. Minimum dan maksimum hanya per pesanan. Geser tabel pada layar sempit.</p><div className={table.scroll} role="region" tabIndex={0} aria-labelledby={caption} aria-describedby={hint}><table><caption id={caption}>Rincian fee manual {platformTools[slug].name}</caption><thead><tr>{['Biaya', 'Basis / scope', 'Sebelum batas (eksak)', 'Minimum/order', 'Maksimum/order', 'Setelah batas (eksak)'].map(s => <th key={s} scope="col">{s}</th>)}</tr></thead><tbody>{ledger.fees.map(f => <tr key={f.label}><th scope="row">{f.label}</th><td>{f.basis}</td><td>{exact(f.raw)}</td><td>{f.minimum === undefined ? 'Tidak berlaku' : cashText(f.minimum)}</td><td>{f.cap === undefined ? 'Tidak berlaku' : cashText(f.cap)}</td><td>{exact(f.value)}</td></tr>)}</tbody></table></div>
      <dl className={local.ledger}>{[
        ['Penjualan neto', ledger.sales], ['Tambah penerimaan aktual', ledger.receipts], ['Kurangi fee', ledger.feeTotal], ['Kurangi ongkir seller', ledger.shipping], ['Kurangi biaya lain', ledger.other], ['Payout sebelum pembulatan', ledger.payout], ['Tambah adjustment pembulatan', ledger.adjustment],
      ].map(([label, value]) => <div key={String(label)}><dt>{String(label)}</dt><dd>{exact(value as Rational)}</dd></div>)}</dl><p><strong>Cash dana cair: {cashText(ledger.payoutCash)}. Cash setelah HPP: {cashText(ledger.profitCash)}.</strong></p><p>Diskon platform tampilan tidak dipotong dari penjualan seller. Kredit yang sudah tercatat jangan dimasukkan lagi. Tidak ada jaminan tanggal pencairan atau kecocokan invoice.</p></section>}
  </>
}
