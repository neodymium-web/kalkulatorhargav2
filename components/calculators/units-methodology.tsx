import Link from 'next/link'
import { unitsTools, type UnitsSlug } from '../../lib/units-scale/tools'
import { unitsSources } from '../../lib/units-scale/sources'
import styles from '../ui/layout.module.css'
export function UnitsMethodology({ slug, formulaVersion }: { slug: UnitsSlug; formulaVersion: string }) {
  const tool = unitsTools[slug]
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p><p>{tool.hint}</p>
    <h3>Sumber definisi satuan</h3><ul>{tool.sources.map(source => <li key={source}><a href={unitsSources[source].url}>{unitsSources[source].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Faktor dan offset mengikuti definisi satuan yang dirujuk. Presisi tampilan dan batas input adalah kebijakan aplikasi, bukan ketelitian pengukuran.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(unitsTools) as UnitsSlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{unitsTools[s].title}</Link></span>)}.</p>
    <p>Untuk estimasi perjalanan, gunakan <Link href="/kalkulator/konsumsi-bbm">Konsumsi BBM</Link>. Seluruh alat tersedia di <Link href="/sehari-hari">kategori Sehari-hari</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
