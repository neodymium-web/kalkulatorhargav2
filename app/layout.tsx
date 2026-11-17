import type { Metadata } from 'next'
import { SiteHeader } from '../components/site-header'
import { SiteFooter } from '../components/site-footer'
import { listCategoryHubs } from '../lib/registry'
import { canonicalOrigin, indexable } from '../lib/seo'
import './tokens.css'
import './style.css'

export const metadata: Metadata = {
  metadataBase: new URL(canonicalOrigin),
  title: { default: 'KalkulatorHarga', template: '%s | KalkulatorHarga' },
  robots: { index: indexable, follow: indexable },
  verification: { google: 'lqcG_PxTdOtaVfKB2Ny9eBJO1oZJNAmpOI3IXFqiBko' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SiteHeader hubs={listCategoryHubs()} />
        <main id="konten" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
