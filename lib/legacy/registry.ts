import source from './pages.json'
import { legacyPaths } from './routes'

export type LegacyNode = string | { tag: string; attrs: Record<string, string | undefined>; children: LegacyNode[] }
export type LegacyPage = Omit<typeof source[number], 'tree'> & { tree: LegacyNode }
export const legacyPages: readonly LegacyPage[] = source
export function findLegacy(path: string) { return legacyPages.find(page => page.path === path) }

export function legacyLink(href: string): string | undefined {
  try {
    const url = new URL(href, 'https://www.kalkulatorharga.com')
    if (!['https:', 'http:'].includes(url.protocol)) return undefined
    if (['kalkulatorharga.com', 'www.kalkulatorharga.com'].includes(url.hostname) && (legacyPaths as readonly string[]).includes(url.pathname)) {
      return url.pathname + url.search + url.hash
    }
    // Keep legacy feature links on their source site; no implied parity or live redirects.
    return url.href
  } catch { return undefined }
}
