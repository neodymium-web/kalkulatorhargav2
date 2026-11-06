import type { Metadata } from 'next'
import Link from 'next/link'
import { canonicalOrigin, indexable } from '../lib/seo'
import './style.css'

export const metadata: Metadata = {
  metadataBase: new URL(canonicalOrigin),
  title: { default: 'KalkulatorHarga', template: '%s | KalkulatorHarga' },
  robots: { index: indexable, follow: indexable },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#konten">Langsung ke konten</a>
        <header className="site-header"><nav className="wrap" aria-label="Navigasi utama">
          <Link href="/" className="brand">Kalkulator<span>Harga</span></Link>
          <Link href="/bisnis">Bisnis</Link>
        </nav></header>
        <main id="konten">{children}</main>
        <footer className="wrap site-footer">KalkulatorHarga</footer>
      </body>
    </html>
  )
}
