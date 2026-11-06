import type { Metadata } from 'next'

export const canonicalOrigin = 'https://kalkulatorharga.com'
export const indexable = process.env.SITE_INDEXABLE === 'true' && !['preview', 'development'].includes(process.env.VERCEL_ENV ?? '')

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path } }
}
