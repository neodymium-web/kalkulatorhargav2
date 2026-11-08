import type { MetadataRoute } from 'next'
import { sitemapPaths } from '../lib/registry'
import { legacyPaths } from '../lib/legacy/routes'
import { canonicalOrigin } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return [...sitemapPaths(), ...legacyPaths].map(path => ({
    url: new URL(path, canonicalOrigin).href,
  }))
}
