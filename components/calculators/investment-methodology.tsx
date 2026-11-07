import Link from 'next/link'
import { investmentTools, type InvestmentSlug } from '../../lib/investment/tools'
import { investmentSources } from '../../lib/investment/sources'
import styles from '../ui/layout.module.css'

export function InvestmentMethodology({
  slug,
  formulaVersion,
}: {
  slug: InvestmentSlug
  formulaVersion: string
}) {
  const tool = investmentTools[slug]
  return (
    <>
      <h2>Cara menghitung</h2>
      <p>{tool.formula}</p>
      <h3>Contoh perhitungan</h3>
      <p>{tool.example}</p>
      <h3>Presisi dan pembulatan</h3>
      <p>{tool.rounding}</p>
      <h3>Asumsi dan batas penggunaan</h3>
      <p>{tool.assumptions}</p>
      <p>
        Simulasi edukasi, bukan rekomendasi keuangan pribadi atau jaminan hasil. Seluruh tingkat dan potongan
        adalah input pengguna; tidak ada tarif bank atau pajak bawaan.
      </p>
      <h3>Sumber rumus</h3>
      <ul>
        {tool.sources.map((id) => (
          <li key={id}>
            <a href={investmentSources[id].url}>{investmentSources[id].title}</a>
          </li>
        ))}
      </ul>
      <p>
        Diperiksa 7 November 2026. Konvensi pembulatan aplikasi dapat berbeda dari pencatatan produk keuangan
        aktual.
      </p>
      <h3>Pertanyaan tentang perhitungan ini</h3>
      {tool.faq.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
      <p>
        Temukan alat bunga, cicilan, tabungan, dan investasi lain pada{' '}
        <Link href="/keuangan">kategori Keuangan</Link>.
      </p>
      <p className={styles.version}>Versi rumus {formulaVersion}</p>
    </>
  )
}
