import Link from 'next/link'
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
  return <div className="wrap page">
    <Breadcrumb category={breadcrumbCategory} current={tool.metadata.title} />
    <h1>{tool.metadata.title}</h1>
    <p className="intro">{tool.metadata.description}</p>
    {children}
    <article className="methodology">{methodology}</article>
    {related.length > 0 && <section>
      <h2>Kalkulator terkait</h2>
      <ul>{related.map(candidate => <li key={candidate.id}><Link href={candidate.path}>{candidate.metadata.title}</Link></li>)}</ul>
    </section>}
  </div>
}
