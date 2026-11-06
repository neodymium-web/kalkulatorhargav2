import { notFound } from 'next/navigation'
import { CalculatorPage } from '../../../components/calculator-page'
import { views } from '../../../components/calculators/views'
import { findPublished, listPublished } from '../../../lib/registry'
import { calculatorMetadata } from '../../../lib/seo'

type RouteProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return listPublished().map(({ slug }) => ({ slug }))
}

function getCalculator(slug: string) {
  const tool = findPublished(slug)
  if (!tool) notFound()
  const view = views[slug]
  if (!view) throw new Error(`Missing view for published calculator: ${slug}`)
  return { tool, view }
}

export async function generateMetadata({ params }: RouteProps) {
  const { tool } = getCalculator((await params).slug)
  return calculatorMetadata(tool)
}

export default async function CalculatorRoute({ params }: RouteProps) {
  const { tool, view: { Form, Methodology } } = getCalculator((await params).slug)
  return <CalculatorPage tool={tool} methodology={<Methodology formulaVersion={tool.implementation.formulaVersion} />}>
    <Form />
  </CalculatorPage>
}
