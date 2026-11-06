import type { MetadataRoute } from 'next'
import { canonicalOrigin, indexable } from '../lib/seo'

export default function robots(): MetadataRoute.Robots {
  return indexable
    ? { rules: { userAgent: '*', allow: '/' }, sitemap: `${canonicalOrigin}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } }
}
