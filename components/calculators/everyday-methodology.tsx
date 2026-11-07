import Link from 'next/link'
import { everydayTools, percentModes, type EverydaySlug } from '../../lib/everyday/tools'
import { everydaySources } from '../../lib/everyday/sources'
import styles from '../ui/layout.module.css'
export function EverydayMethodology({ slug, formulaVersion }: { slug: EverydaySlug; formulaVersion: string }) {
  const tool = everydayTools[slug]
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    {slug === 'persen' && Object.entries(percentModes).map(([id, mode]) => <section key={id}>
      <h3>Mode: {mode.title}</h3><p>{mode.formula}</p><p>{mode.example}</p><p>{mode.hint}</p>
    </section>)}
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p><p>{tool.hint}</p>
    <p>Semua data dimasukkan manual. Input kosong, nonfinite, eksponen, negatif di luar cakupan dan angka di atas batas ditolak. Tidak ada tarif pajak, promo toko atau asumsi konversi densitas otomatis.</p>
    <h3>Sumber rumus</h3><ul>{tool.sources.map(id => <li key={id}><a href={everydaySources[id].url}>{everydaySources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Referensi matematika dan satuan menjelaskan model, bukan kebijakan merchant atau aturan pajak.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(everydayTools) as EverydaySlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{everydayTools[s].title}</Link></span>)}.</p>
    {slug === 'perubahan-persen' && <p>Untuk dua snapshot jumlah pengikut integer, gunakan <Link href="/kalkulator/pertumbuhan-pengikut">Pertumbuhan Pengikut</Link>.</p>}
    <p>Lihat seluruh alat pada <Link href="/sehari-hari">kategori Sehari-hari</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
