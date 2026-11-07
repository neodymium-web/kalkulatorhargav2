import Link from 'next/link'
import { materialsTools, type MaterialsSlug } from '../../lib/utilities-materials/tools'
import { materialsSources } from '../../lib/utilities-materials/sources'
import styles from '../ui/layout.module.css'
import local from './materials-methodology.module.css'
export function MaterialsMethodology({ slug, formulaVersion }: { slug: MaterialsSlug; formulaVersion: string }) {
  const tool = materialsTools[slug]
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    <h3>Presisi dan pembulatan</h3><p>{tool.rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p className={local.assumptions}>{tool.assumptions}</p><p>{tool.hint}</p>
    <h3>Sumber rumus dan satuan</h3><ul>{tool.sources.map(id => <li key={id}><a href={materialsSources[id].url}>{materialsSources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026. Referensi menjelaskan satuan, energi, geometri atau konstanta matematika. Tarif progresif, daya sebar, ukuran kemasan dan cadangan adalah model/asumsi input pengguna, bukan tarif atau standar produk resmi.</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(materialsTools) as MaterialsSlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{materialsTools[s].title}</Link></span>)}.</p>
    <p>Untuk membandingkan kemasan produk, gunakan <Link href="/kalkulator/harga-per-satuan">Harga per Satuan</Link>. Seluruh alat tersedia di <Link href="/sehari-hari">kategori Sehari-hari</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
