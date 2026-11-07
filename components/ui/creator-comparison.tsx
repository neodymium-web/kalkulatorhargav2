'use client'
import { useId } from 'react'
import type { CreatorOutput } from '../../lib/creator-analytics/engines'
import { formatCreator } from '../../lib/creator-analytics/format'
import styles from './loan-schedule.module.css'
const metrics = [
  ['followers', 'Pengikut', 'count', 'delta'], ['views', 'Tayangan konten', 'count', 'delta'],
  ['interactions', 'Total aksi', 'count', 'delta'], ['videos', 'Video', 'count', 'delta'],
  ['er', 'Engagement pada basis pilihan', '%', 'pp'], ['average', 'Rata-rata tayangan/video', 'decimal', 'delta-decimal'],
] as const
export function CreatorComparison({ result }: { result: CreatorOutput }) {
  const caption = useId(), hint = useId()
  return <section className={styles.schedule}>
    <p id={hint} className={styles.hint}>Selisih B−A, bukan ranking. Rasio dibulatkan sendiri dari input eksak. Pembagi nol membuat nilai terkait tidak terdefinisi. Geser tabel pada layar sempit.</p>
    <div className={styles.scroll} role="region" aria-labelledby={caption} aria-describedby={hint} tabIndex={0}>
      <table>
        <caption id={caption}>Perbandingan metrik manual A/B</caption>
        <thead><tr><th scope="col">Metrik</th><th scope="col">Akun A</th><th scope="col">Akun B</th><th scope="col">Selisih B−A</th></tr></thead>
        <tbody>{metrics.map(([key, label, unit, changeUnit]) => <tr key={key}>
          <th scope="row">{label}</th>
          {[['A', unit], ['B', unit], ['Change', changeUnit]].map(([suffix, format]) => <td key={suffix}>
            {formatCreator(result.values[key + suffix], format, result.precision[key + suffix])}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </section>
}
