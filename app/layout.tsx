import type { Metadata } from 'next'
import { SiteHeader } from '../components/site-header'
import { listCategoryHubs } from '../lib/registry'
import layout from '../components/ui/layout.module.css'
import styles from '../components/site-header.module.css'
import { canonicalOrigin, indexable } from '../lib/seo'
import './tokens.css'
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
        <SiteHeader hubs={listCategoryHubs()} />
        <main id="konten" tabIndex={-1}>{children}</main>
        <footer className={`${layout.container} ${styles.footer}`}>KalkulatorHarga</footer>
      </body>
    </html>
  )
}
