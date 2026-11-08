import { Breadcrumb } from './breadcrumb'
import { Directory } from './directory'
import { listCategory } from '../lib/registry'
import { categories, type CategoryId } from '../lib/categories'
import { directoryEntry } from '../lib/directory'
import styles from './ui/layout.module.css'
import directoryStyles from './directory.module.css'
import Link from 'next/link'

export function CategoryPage({ categoryId, title, description }: { categoryId: CategoryId; title: string; description: string }) {
  const tools = listCategory(categoryId)
  return <div className={`${styles.container} ${styles.page}`}>
    <Breadcrumb current={categories[categoryId].name} />
    <h1>{title}</h1>
    <p className={styles.intro}>{description}</p>
    <div className={styles.section}><Directory tools={tools.map(directoryEntry)} /></div>
    <details className={directoryStyles.completeIndex}>
      <summary>Daftar lengkap {tools.length} kalkulator {categories[categoryId].name}</summary>
      <nav aria-label={`Daftar lengkap kalkulator ${categories[categoryId].name}`}>
        <ul>{tools.map(tool => <li key={tool.id}><Link href={tool.path} prefetch={false}>{tool.metadata.title}</Link></li>)}</ul>
      </nav>
    </details>
  </div>
}
