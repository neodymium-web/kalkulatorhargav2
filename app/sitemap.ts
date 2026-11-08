import type { MetadataRoute } from 'next'
import { publishedPaths } from '../lib/published-paths'
import { canonicalOrigin } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedPaths().map(path => ({
    url: new URL(path, canonicalOrigin).href,
  }))
}
