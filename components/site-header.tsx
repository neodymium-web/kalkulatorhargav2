'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import layout from './ui/layout.module.css'
import styles from './site-header.module.css'

export function SiteHeader({ hubs }: { hubs: readonly { name: string; path: string }[] }) {
  const pathname = usePathname()
  return <>
    <a className={styles.skip} href="#konten">Langsung ke konten</a>
    <header className={styles.header}>
      <nav className={`${layout.container} ${styles.nav}`} aria-label="Navigasi utama">
        <Link href="/" prefetch={false} className={styles.brand} aria-current={pathname === '/' ? 'page' : undefined}>
          <i className={styles.mark} aria-hidden="true" />Kalkulator<span>Harga</span>
        </Link>
        <div className={styles.links}>
          {hubs.map(hub => <Link key={hub.path} href={hub.path} prefetch={false} aria-current={pathname === hub.path ? 'page' : undefined}>
            {hub.name}
          </Link>)}
        </div>
      </nav>
    </header>
  </>
}
