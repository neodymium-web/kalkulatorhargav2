import Link from 'next/link'
import { economicsTools, economicsRounding, type EconomicsSlug } from '../../lib/marketplace-economics/tools'
import { economicsSources } from '../../lib/marketplace-economics/sources'
import styles from '../ui/layout.module.css'
export function EconomicsMethodology({ slug, formulaVersion }: { slug: EconomicsSlug; formulaVersion: string }) {
  const tool = economicsTools[slug]
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p><h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{economicsRounding}</p><h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p><p>{tool.hint}</p>
    <h3>Sumber konsep dan verifikasi</h3><ul>{tool.sources.map(s => <li key={s}><a href={economicsSources[s].url}>{economicsSources[s].title}</a></li>)}</ul><p>Diperiksa 7 November 2026. Referensi mendukung konsep biaya dan stok, bukan tarif marketplace. Settlement, basis biaya dan kebijakan pembulatan adalah model eksplisit aplikasi; semua tarif berasal dari input pengguna.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(economicsTools) as EconomicsSlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{economicsTools[s].title}</Link></span>)} di <Link href="/marketplace">kategori Marketplace</Link>.</p><p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
