import Link from 'next/link'
import styles from './breadcrumb.module.css'

export function Breadcrumb({ category, current }: {
  category?: { name: string; path: string }
  current: string
}) {
  const divider = <span aria-hidden="true" className={styles.divider}>/</span>
  return <nav aria-label="Jejak navigasi">
    <ol className={styles.items}>
      <li><Link href="/">Beranda</Link></li>
      {category && <li>{divider}<Link href={category.path}>{category.name}</Link></li>}
      <li>{divider}<span aria-current="page">{current}</span></li>
    </ol>
  </nav>
}
