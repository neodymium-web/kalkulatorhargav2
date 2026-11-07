import Link from 'next/link'
import { valuationTools, type ValuationSlug } from '../../lib/valuation/tools'
import { valuationSources } from '../../lib/valuation/sources'
import styles from '../ui/layout.module.css'
import table from '../ui/loan-schedule.module.css'

export function ValuationMethodology({
  slug,
  formulaVersion,
}: {
  slug: ValuationSlug
  formulaVersion: string
}) {
  const tool = valuationTools[slug]
  const related = (
    slug === 'rata-rata-beli-saham' || slug === 'untung-rugi-saham'
      ? ['rata-rata-beli-saham', 'untung-rugi-saham']
      : ['nilai-kini', 'npv', 'inflasi']
  ).filter((value) => value !== slug) as ValuationSlug[]
  return (
    <>
      <h2>Cara menghitung</h2>
      <p>{tool.formula}</p>
      <h3>Contoh perhitungan</h3>
      <p>{tool.example}</p>
      {slug === 'npv' && (
        <div
          className={`${table.schedule} ${table.scroll}`}
          role="region"
          aria-label="Tabel contoh arus kas NPV"
          tabIndex={0}
        >
          <table>
            <caption>Contoh arus kas tahunan, diskonto 10%</caption>
            <thead>
              <tr>
                <th scope="col">Tahun</th>
                <th scope="col">CF neto</th>
                <th scope="col">PV tampilan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">0, hari ini</th>
                <td>−Rp1.000,00</td>
                <td>−Rp1.000,00</td>
              </tr>
              <tr>
                <th scope="row">1</th>
                <td>Rp600,00</td>
                <td>Rp545,45</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Rp600,00</td>
                <td>Rp495,87</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <h3>Presisi dan pembulatan</h3>
      <p>{tool.rounding}</p>
      <h3>Asumsi dan batas penggunaan</h3>
      <p>{tool.assumptions}</p>
      <p>
        Simulasi edukasi, bukan rekomendasi keuangan atau jaminan hasil. Tidak ada data harga, tingkat resmi,
        aturan lot, maupun tarif pajak/broker yang diisi otomatis.
      </p>
      <h3>Sumber rumus</h3>
      <ul>
        {tool.sources.map((id) => (
          <li key={id}>
            <a href={valuationSources[id].url}>{valuationSources[id].title}</a>
          </li>
        ))}
      </ul>
      <p>
        Diperiksa 7 November 2026. Referensi regulator luar negeri menjelaskan konsep, bukan ketentuan pajak
        Indonesia.
      </p>
      <h3>Pertanyaan tentang perhitungan ini</h3>
      {tool.faq.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
      <p>
        Gunakan juga{' '}
        {related.map((value, index) => (
          <span key={value}>
            {index > 0 && ', '}
            <Link href={`/kalkulator/${value}`}>{valuationTools[value].title}</Link>
          </span>
        ))}
        .
      </p>
      <p>
        Temukan alat valuasi, bunga, tabungan, dan investasi lain pada{' '}
        <Link href="/keuangan">kategori Keuangan</Link>.
      </p>
      <p className={styles.version}>Versi rumus {formulaVersion}</p>
    </>
  )
}
