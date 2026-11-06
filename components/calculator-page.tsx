import Link from 'next/link'
import { Breadcrumb } from './breadcrumb'
import { calculators, type Calculator } from '../lib/registry'

export function CalculatorPage({ tool, children, methodology }: {
  tool: Calculator
  children: React.ReactNode
  methodology: React.ReactNode
}) {
  const related = calculators.filter(candidate => candidate.id !== tool.id && candidate.category.path === tool.category.path)
  return <div className="wrap page">
    <Breadcrumb category={tool.category} current={tool.name} />
    <h1>{tool.name}</h1>
    <p className="intro">{tool.description}</p>
    {children}
    <article className="methodology">{methodology}</article>
    {related.length > 0 && <section>
      <h2>Kalkulator terkait</h2>
      <ul>{related.map(candidate => <li key={candidate.id}><Link href={candidate.path}>{candidate.name}</Link></li>)}</ul>
    </section>}
  </div>
}
