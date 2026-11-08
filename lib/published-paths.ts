import { sitemapPaths } from './registry'
import { legacyPaths } from './legacy/routes'
import { supplementalPaths } from './supplemental/routes'
export function publishedPaths() { return [...sitemapPaths(), ...legacyPaths, ...supplementalPaths] }
