import type { MetadataRoute } from 'next'
import { sitemapPaths } from '../lib/registry'
import { canonicalOrigin } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().map(path => ({
    url: new URL(path, canonicalOrigin).href,
  }))
}
