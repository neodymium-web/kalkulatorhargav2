import Link from 'next/link'
import { calendarTools, type CalendarSlug } from '../../lib/calendar-time/tools'
import { calendarSources } from '../../lib/calendar-time/sources'
import styles from '../ui/layout.module.css'
export function CalendarMethodology({ slug, formulaVersion }: { slug: CalendarSlug; formulaVersion: string }) {
  const tool = calendarTools[slug]
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p><p>{tool.hint}</p>
    <h3>Sumber dan konvensi model</h3><ul>{tool.sources.map(id => <li key={id}><a href={calendarSources[id].url}>{calendarSources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Sumber menjelaskan kalender, representasi tanggal atau satuan. Aturan inklusif, pola kerja, clamp anniversary dan akhir shift adalah konvensi aplikasi yang dijelaskan di atas; bukan ketentuan hukum atau tarif resmi.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(calendarTools) as CalendarSlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{calendarTools[s].title}</Link></span>)}.</p>
    <p>Untuk membandingkan perubahan angka, gunakan <Link href="/kalkulator/perubahan-persen">Perubahan Persen</Link>. Seluruh alat tersedia pada <Link href="/sehari-hari">kategori Sehari-hari</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
