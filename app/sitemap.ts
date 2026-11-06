import type { MetadataRoute } from 'next'
import { business, calculators } from '../lib/registry'
import { canonicalOrigin } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', business.path, ...calculators.map(tool => tool.path)].map(path => ({
    url: new URL(path, canonicalOrigin).href,
  }))
}
