import { Directory } from './directory'
import { directoryEntry } from '../lib/directory'
import styles from './ui/layout.module.css'
import { Breadcrumb } from './breadcrumb'
import { relatedCalculators, type PublishedCalculator } from '../lib/registry'
import { categories } from '../lib/categories'

export function CalculatorPage({ tool, children, methodology }: {
  tool: PublishedCalculator
  children: React.ReactNode
  methodology: React.ReactNode
}) {
  const related = relatedCalculators(tool)
  const category = categories[tool.primaryCategory]
  const breadcrumbCategory = category.hub ? { name: category.name, path: category.hub } : undefined
  return <div className={`${styles.container} ${styles.page}`}>
    <Breadcrumb category={breadcrumbCategory} current={tool.metadata.title} />
    <h1>{tool.metadata.title}</h1>
    <p className={styles.intro}>{tool.metadata.description}</p>
    {children}
    <article className={styles.methodology}>{methodology}</article>
    {related.length > 0 && <Directory heading="Kalkulator terkait" tools={related.map(directoryEntry)} />}
  </div>
}
