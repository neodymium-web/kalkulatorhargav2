import { Breadcrumb } from './breadcrumb'
import { Directory } from './directory'
import { listCategory } from '../lib/registry'
import { categories, type CategoryId } from '../lib/categories'
import { directoryEntry } from '../lib/directory'
import styles from './ui/layout.module.css'

export function CategoryPage({ categoryId, title, description }: { categoryId: CategoryId; title: string; description: string }) {
  return <div className={`${styles.container} ${styles.page}`}>
    <Breadcrumb current={categories[categoryId].name} />
    <h1>{title}</h1>
    <p className={styles.intro}>{description}</p>
    <div className={styles.section}><Directory tools={listCategory(categoryId).map(directoryEntry)} /></div>
  </div>
}
