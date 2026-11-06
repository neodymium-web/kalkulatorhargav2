import type { Metadata } from 'next'
import type { PublishedCalculator } from './registry'

export const canonicalOrigin = 'https://kalkulatorharga.com'
export const indexable = process.env.SITE_INDEXABLE === 'true' && !['preview', 'development'].includes(process.env.VERCEL_ENV ?? '')

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path } }
}

export function calculatorMetadata(tool: PublishedCalculator): Metadata {
  const { title, description, keywords } = tool.metadata
  return { ...pageMetadata(title, description, tool.path), keywords: [...keywords] }
}
