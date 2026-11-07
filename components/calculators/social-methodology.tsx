import Link from 'next/link'
import { socialTools, type SocialSlug } from '../../lib/social-metrics/tools'
import { socialSources } from '../../lib/social-metrics/sources'
import styles from '../ui/layout.module.css'
export function SocialMethodology({ slug, formulaVersion }: { slug: SocialSlug; formulaVersion: string }) {
  const tool = socialTools[slug]
  const related = (Object.keys(socialTools) as SocialSlug[]).filter(s => s !== slug)
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p>
    <p>Data dimasukkan manual, tanpa koneksi akun, tarif platform, prediksi atau benchmark otomatis. Samakan definisi data sebelum membandingkan hasil.</p>
    <h3>Sumber rumus</h3><ul>{tool.sources.map(id => <li key={id}><a href={socialSources[id].url}>{socialSources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Definisi metrik dan atribusi dapat berbeda antarplatform.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {related.map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{socialTools[s].title}</Link></span>)}.</p>
    <p>Lihat seluruh alat interaksi dan iklan pada <Link href="/media-sosial">kategori Media Sosial</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
