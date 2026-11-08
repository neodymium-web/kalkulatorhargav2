import source from './pages.json'
import { publishedPaths } from '../published-paths'
import { supplementalPaths } from '../supplemental/routes'
import { classifyLegacyLink } from './links'

export type LegacyNode = string | { tag: string; attrs: Record<string, string | undefined>; children: LegacyNode[] }
export type LegacyPage = Omit<typeof source[number], 'tree'> & { tree: LegacyNode }
export const legacyPages: readonly LegacyPage[] = source
export function findLegacy(path: string) { return legacyPages.find(page => page.path === path) }

export function legacyReference(href: string, sourcePath: string) {
  return classifyLegacyLink(href, sourcePath, publishedPaths(), supplementalPaths)
}
export function legacyLink(href: string, sourcePath = '/blog') { return legacyReference(href, sourcePath).href }
