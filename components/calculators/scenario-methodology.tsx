import Link from 'next/link'
import { scenarioTools, type ScenarioSlug } from '../../lib/loan-scenarios/tools'
import { scenarioSources } from '../../lib/loan-scenarios/sources'
import styles from '../ui/layout.module.css'
export function ScenarioMethodology({ slug, formulaVersion }: { slug: ScenarioSlug; formulaVersion: string }) {
  const tool = scenarioTools[slug]
  const related = (Object.keys(scenarioTools) as ScenarioSlug[]).filter(s => s !== slug && s !== 'kurs-mata-uang').slice(0, 3)
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p>
    <p>Simulasi edukasi dari input Anda, bukan rekomendasi keuangan, penawaran bank, persetujuan kredit, atau tarif langsung. Cocokkan ketentuan dengan kontrak Anda.</p>
    <h3>Sumber rumus</h3><ul>{tool.sources.map(id => <li key={id}><a href={scenarioSources[id].url}>{scenarioSources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Sumber edukasi luar negeri menjelaskan konsep, bukan aturan hukum Indonesia atau tarif produk.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {related.map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{scenarioTools[s].title}</Link></span>)}.</p>
    <p>Temukan alat bunga, tabungan, nilai kini dan saham pada <Link href="/keuangan">kategori Keuangan</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
