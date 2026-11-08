import { notFound } from 'next/navigation'
import { findLegacy, legacyPages } from '../../lib/legacy/registry'
import { LegacyPageView, legacyMetadata } from '../../components/legacy-page'

type Props = { params: Promise<{ legacy: string[] }> }
export const dynamicParams = false
export function generateStaticParams() { return legacyPages.map(page => ({ legacy: page.path.slice(1).split('/') })) }
async function getPage(params: Props['params']) {
  const page = findLegacy('/' + (await params).legacy.join('/'))
  if (!page) notFound()
  return page
}
export async function generateMetadata({ params }: Props) { return legacyMetadata(await getPage(params)) }
export default async function LegacyRoute({ params }: Props) { return <LegacyPageView page={await getPage(params)} /> }
