import Link from 'next/link'
import { sellerTools, type SellerSlug } from '../../lib/seller-costs/tools'
import styles from '../ui/layout.module.css'
export function SellerMethodology({ slug, formulaVersion }: { slug: SellerSlug; formulaVersion: string }) {
  const tool = sellerTools[slug]
  return (
    <>
      <h2>Cara menghitung</h2>
      <p>{tool.formula}</p>
      <h3>Contoh perhitungan</h3>
      <p>{tool.example}</p>
      <h3>Asumsi dan batas penggunaan</h3>
      <p>{tool.assumptions}</p>
      <p>{tool.limits}</p>
      <p>
        Uang ditampilkan hingga dua desimal rupiah; nilai positif yang lebih kecil ditandai kurang dari
        Rp0,01. Probabilitas hingga dua desimal persen. Semua hasil dihitung dengan pecahan eksak, lalu
        dibulatkan half-up pada tahap akhir.
      </p>
      <h3>Sumber metodologi</h3>
      <p>
        <a href="https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation">
          OpenStax: nilai harapan
        </a>
        ,{' '}
        <a href="https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/yield-testing/">
          BCcampus: yield dan biaya
        </a>
        , dan{' '}
        <a href="https://seller-br.tiktok.com/university/essay?knowledge_id=2569565069149953&lang=en">
          TikTok Shop Brazil: konsep pendanaan bersama
        </a>
        . Diverifikasi 7 November 2026. Syarat kampanye regional perlu dikonfirmasi sendiri.
      </p>
      <p>
        Lihat kalkulator lain di <Link href="/marketplace">kategori Marketplace</Link>.
      </p>
      <p className={styles.version}>Versi rumus {formulaVersion}</p>
    </>
  )
}
