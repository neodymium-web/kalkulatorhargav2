import { releaseConfiguration } from '../lib/migration/release'
import { legacyPaths } from '../lib/legacy/routes'
import type { MetadataRoute } from 'next'
import { publishedPaths } from '../lib/published-paths'
import { canonicalOrigin } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedPaths().filter(path => releaseConfiguration(process.env).includePendingArchives || !(legacyPaths as readonly string[]).includes(path)).map(path => ({
    url: new URL(path, canonicalOrigin).href,
  }))
}
