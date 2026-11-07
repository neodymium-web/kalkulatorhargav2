'use client'
import { useId } from 'react'
import type { HolidayRow } from '../../lib/calendar-time/engines'
import { weekdayNames } from '../../lib/calendar-time/civil'
import styles from './loan-schedule.module.css'
const statuses = { working: 'Mengurangi hari terjadwal', weekend: 'Diabaikan: sudah libur mingguan', outside: 'Diabaikan: di luar rentang' }
export function HolidayBreakdown({ rows }: { rows: readonly HolidayRow[] }) {
  const caption = useId(), hint = useId()
  if (!rows.length) return null
  return <section className={styles.schedule}>
    <p className={styles.hint} id={hint}>Setiap tanggal unik tampil sekali, mengikuti urutan pertama kali dimasukkan. Duplikat tidak dikurangi lagi. Geser tabel pada layar sempit.</p>
    <div className={styles.scroll} role="region" aria-labelledby={caption} aria-describedby={hint} tabIndex={0}>
      <table>
        <caption id={caption}>Pemeriksaan tanggal libur unik</caption>
        <thead><tr><th scope="col">Tanggal kalender</th><th scope="col">Hari</th><th scope="col">Perlakuan dalam hitungan</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.date}><th scope="row">{row.date}</th><td>{weekdayNames[row.weekday]}</td><td>{statuses[row.status]}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
}
