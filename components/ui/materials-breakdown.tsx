'use client'
import { useId } from 'react'
import type { MaterialsOutput } from '../../lib/utilities-materials/engines'
import { formatMaterials as f } from '../../lib/utilities-materials/format'
import styles from './loan-schedule.module.css'
function Breakdown({ title, hint, columns, rows, footer }: { title: string; hint: string; columns: readonly string[]; rows: readonly string[][]; footer: readonly string[] }) {
  const caption = useId(), description = useId()
  return <section className={styles.schedule}>
    <p className={styles.hint} id={description}>{hint} Geser tabel pada layar sempit.</p>
    <div className={styles.scroll} role="region" aria-labelledby={caption} aria-describedby={description} tabIndex={0}>
      <table><caption id={caption}>{title}</caption>
        <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
        <tfoot><tr>{footer.map((c, i) => i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>)}</tr></tfoot>
      </table>
    </div>
  </section>
}
export function MaterialsBreakdown({ result }: { result: MaterialsOutput }) {
  if (result.tiers) return <Breakdown title="Alokasi volume dan biaya blok air"
    hint="Batas kumulatif, bukan lebar blok. Biaya blok hingga 10 desimal rupiah ditampilkan eksak, tidak dibulatkan ke rupiah. Footer adalah biaya variabel, belum biaya tetap."
    columns={['Blok', 'Batas sebelumnya', 'Batas atas kumulatif', 'Tarif', 'Volume ditagih', 'Biaya eksak']}
    rows={result.tiers.map((r, i) => [`Blok ${i + 1}`, f(r.lower, 'volume6'), r.upper === null ? 'Tanpa batas' : f(r.upper, 'volume6'), f(r.rate, 'rate4'), f(r.volume, 'volume6'), f(r.cost, 'money10')])}
    footer={['Total', '', '', '', f(result.values.usage, 'volume6'), f(result.values.variable, 'money10')]} />
  if (result.elements) return <Breakdown title="Volume dasar per elemen beton"
    hint="Volume baris sudah mencakup jumlah elemen serupa, belum cadangan. Baris dan total tampil empat desimal; total memakai pecahan asli, sehingga jumlah tampilan baris dapat berbeda."
    columns={['Elemen', 'Bentuk', 'Jumlah elemen serupa', 'Volume dasar']}
    rows={result.elements.map((r, i) => [`Elemen ${i + 1}`, r.shape === 'prism' ? 'Balok' : 'Silinder (π pendekatan)', f(r.count, 'integer'), f(r.volume, 'volume', r.tiny)])}
    footer={['Total dasar', '', '', f(result.values.base, 'volume', result.tiny.base)]} />
  return null
}
