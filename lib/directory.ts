import { categories } from './categories'
import type { PublishedCalculator } from './registry'

export function directoryEntry(tool: PublishedCalculator) {
  return {
    id: tool.id,
    path: tool.path,
    name: tool.metadata.title,
    description: tool.metadata.description,
    keywords: tool.metadata.keywords,
    categories: [tool.primaryCategory, ...tool.secondaryCategories].map(id => categories[id].name),
  }
}

export type DirectoryEntry = ReturnType<typeof directoryEntry>

export function searchDirectory(tools: readonly DirectoryEntry[], query: string) {
  const terms = query.toLocaleLowerCase('id-ID').trim().split(/\s+/)
  return tools.filter(tool => {
    const haystack = [tool.name, tool.description, ...tool.categories, ...tool.keywords].join(' ').toLocaleLowerCase('id-ID')
    return terms.every(term => haystack.includes(term))
  })
}
