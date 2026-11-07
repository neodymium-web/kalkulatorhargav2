'use client'
import { useId } from 'react'
import type { EverydayOutput } from '../../lib/everyday/engines'
import { formatEveryday } from '../../lib/everyday/format'
import styles from './loan-schedule.module.css'
function DataTable({ title, hint, columns, rows, footer }: { title: string; hint: string; columns: readonly string[]; rows: readonly string[][]; footer?: readonly string[] }) {
  const caption = useId(), description = useId()
  return <section className={styles.schedule}>
    <p className={styles.hint} id={description}>{hint} Geser tabel pada layar sempit.</p>
    <div className={styles.scroll} role="region" aria-labelledby={caption} aria-describedby={description} tabIndex={0}>
      <table><caption id={caption}>{title}</caption>
        <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
        {footer && <tfoot><tr>{footer.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr></tfoot>}
      </table>
    </div>
  </section>
}
export function EverydayTables({ result }: { result: EverydayOutput }) {
  const f = (value: bigint | null, unit: string, key = '') => formatEveryday(value, unit, result.precision[key])
  if (result.stages) return <DataTable title="Rincian diskon berurutan"
    hint="Faktor kumulatif enam desimal dan harga model dua desimal hanya untuk dibaca. Cash final dibulatkan sekali sesudah semua tahap, bukan dari harga model tampilan."
    columns={['Tahap', 'Diskon tahap', 'Faktor sisa kumulatif', 'Harga model setelah tahap']}
    rows={result.stages.map((r, i) => [`Tahap ${i + 1}`, f(r.rate, 'pct4'), f(r.factor, 'factor', `stages.${i}.factor`), f(r.model, 'cents', `stages.${i}.model`)])} />
  if (result.packages) return <DataTable title={`Perbandingan kemasan per ${result.comparisonUnit}`}
    hint="Kemasan termurah dan penghematan relatif memakai rasio eksak, bukan harga tampilan. Referensi penghematan adalah harga satuan tertinggi. Tidak menilai kualitas."
    columns={['Kemasan', 'Harga kemasan', 'Ukuran asli', `Harga per ${result.comparisonUnit}`, 'Hemat terhadap tertinggi', 'Minimum eksak']}
    rows={result.packages.map((r, i) => [`Kemasan ${i + 1}`, f(r.price, 'IDR'), `${f(r.quantity, 'quantity3')} ${r.unit}`, f(r.unitPrice, 'cents', `packages.${i}.unitPrice`), f(r.saving, 'pct2', `packages.${i}.saving`), r.cheapest ? 'Ya' : 'Tidak'])} />
  if (result.people) return <DataTable title="Rekonsiliasi tagihan per orang"
    hint="Subtotal item tetap milik orang tersebut. Biaya bersama service/pajak dialokasikan sekali; sisa rupiah mengikuti pecahan terbesar, tie urutan orang."
    columns={['Orang', 'Subtotal item', 'Alokasi biaya bersama', 'Bagian akhir']}
    rows={result.people.map((r, i) => [`Orang ${i + 1}`, f(r.subtotal, 'IDR'), f(r.extra, 'IDR'), f(r.total, 'IDR')])}
    footer={['Total', f(result.values.subtotal, 'IDR'), f(result.values.shared, 'IDR'), f(result.values.allocated, 'IDR')]} />
  return null
}
