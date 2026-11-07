'use client'
import { useId } from 'react'
import type { ScenarioRow, ComparisonRow, DatedRow } from '../../lib/loan-scenarios/engines'
import { rupiah } from '../../lib/finance/format'
import styles from './loan-schedule.module.css'

type Cell = string | number
function DetailTable({ title, hint, columns, rows, footer }: {
  title: string; hint: string; columns: readonly string[]; rows: readonly Cell[][]; footer?: readonly Cell[]
}) {
  const caption = useId(), description = useId()
  return <details className={styles.schedule}>
    <summary>{title}</summary>
    <p id={description} className={styles.hint}>{hint} Geser tabel pada layar sempit.</p>
    <div className={styles.scroll} role="region" aria-labelledby={caption} aria-describedby={description} tabIndex={0}>
      <table>
        <caption id={caption}>{title}</caption>
        <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
        {footer && <tfoot><tr>{footer.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr></tfoot>}
      </table>
    </div>
  </details>
}
export function ScenarioSchedule({ title, rows }: { title: string; rows: readonly ScenarioRow[] }) {
  const total = (key: 'ordinary' | 'extra' | 'fee' | 'payment' | 'principal' | 'interest') => rupiah(rows.reduce((s, r) => s + r[key], 0n))
  return <DetailTable title={`Jadwal ${title} (${rows.length} bulan)`}
    hint="Rupiah utuh. Kas keluar = cicilan biasa + tambahan pokok + penalti; pokok dibayar sudah termasuk tambahan. Penalti tidak mengurangi saldo. Baris setelah lunas nol."
    columns={['Bulan', 'Cicilan biasa', 'Tambahan pokok', 'Penalti', 'Kas keluar', 'Pokok dibayar', 'Bunga', 'Sisa pokok']}
    rows={rows.map(r => [r.month, rupiah(r.ordinary), rupiah(r.extra), rupiah(r.fee), rupiah(r.payment), rupiah(r.principal), rupiah(r.interest), rupiah(r.balance)])}
    footer={['Total', total('ordinary'), total('extra'), total('fee'), total('payment'), total('principal'), total('interest'), rupiah(rows[rows.length - 1].balance)]} />
}
export function RefinanceComparison({ rows }: { rows: readonly ComparisonRow[] }) {
  return <DetailTable title="Perbandingan kas kumulatif refinancing"
    hint="Kumulatif = kas lama dikurangi kas baru dan biaya pindah. Biaya masuk sekali di bulan 0. Tanpa diskonto; nilai positif belum tentu bertahan sampai akhir."
    columns={['Bulan', 'Kas lama', 'Kas baru (termasuk biaya bulan 0)', 'Selisih kumulatif']}
    rows={rows.map(r => [r.month, rupiah(r.old), rupiah(r.next), rupiah(r.cumulative)])} />
}
export function DatedPayments({ rows }: { rows: readonly DatedRow[] }) {
  return <DetailTable title={`Rincian ${rows.length} pembayaran bertanggal`}
    hint="Tanggal diurutkan, nominal adalah arus keluar peminjam. Hari kalender aktual dibagi 365 untuk waktu tahunan."
    columns={['Tanggal (YYYY-MM-DD)', 'Hari sejak cair', 'Pembayaran keluar']}
    rows={rows.map(r => [r.date, r.days, rupiah(r.amount)])} />
}
