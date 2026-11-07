import Link from 'next/link'
import { financeTools, type FinanceSlug } from '../../lib/finance/tools'
import { financeSources } from '../../lib/finance/sources'
import styles from '../ui/layout.module.css'

export function FinanceMethodology({ slug, formulaVersion }: { slug: FinanceSlug; formulaVersion: string }) {
  const tool = financeTools[slug]
  return (
    <>
      <h2>Cara menghitung</h2>
      <p>{tool.formula}</p>
      <h3>Contoh perhitungan</h3>
      <p>{tool.example}</p>
      <h3>Pembulatan dan jadwal</h3>
      <p>{tool.rounding}</p>
      <h3>Asumsi dan batas penggunaan</h3>
      <p>{tool.assumptions}</p>
      <p>
        Simulasi edukasi ini bukan penawaran atau rekomendasi keuangan pribadi. Gunakan ketentuan dan data
        produk Anda untuk keputusan aktual.
      </p>
      <h3>Sumber rumus</h3>
      <ul>
        {tool.sources.map((id) => (
          <li key={id}>
            <a href={financeSources[id].url}>{financeSources[id].title}</a>
          </li>
        ))}
      </ul>
      <p>
        Sumber diperiksa 7 November 2026. Kebijakan pembulatan rupiah di atas adalah konvensi simulasi
        aplikasi, bukan ketentuan wajib semua bank.
      </p>
      <h3>Pertanyaan tentang perhitungan ini</h3>
      {tool.faq.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
      <p>
        Bandingkan dasar bunga pada <Link href="/kalkulator/cicilan-anuitas">Cicilan Anuitas</Link> dan{' '}
        <Link href="/kalkulator/cicilan-flat">Cicilan Flat</Link>, atau temukan alat lain di{' '}
        <Link href="/keuangan">kategori Keuangan</Link>.
      </p>
      <p className={styles.version}>Versi rumus {formulaVersion}</p>
    </>
  )
}
