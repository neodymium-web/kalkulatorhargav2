import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { categories } from '../lib/categories'
import { directoryEntry, searchDirectory } from '../lib/directory'
import {
  definitions, findPublished, listCategory, listPublished, relatedCalculators, sitemapPaths,
  type CalculatorDefinition,
} from '../lib/registry'
import { calculatorMetadata } from '../lib/seo'

const inventory = readFileSync(new URL('../docs/CALCULATOR_INVENTORY.md', import.meta.url), 'utf8')
  .split('\n')
  .filter(line => /^\| (production-cost|calc-)/.test(line))
  .map(line => line.split('|').slice(1, -1).map(column => column.trim()))

const hpp = listPublished()[0]
const draft: CalculatorDefinition = {
  ...hpp,
  id: 'calc-tiktok',
  slug: 'tiktok-shop',
  path: '/kalkulator/tiktok-shop',
  primaryCategory: 'marketplace',
  secondaryCategories: ['bisnis'],
  status: 'draft',
  implementation: undefined,
}
const idea: CalculatorDefinition = {
  ...draft, id: 'calc-shopee', slug: 'shopee', path: '/kalkulator/shopee', status: 'idea',
}
const records = [hpp, draft, idea]

describe('calculator inventory', () => {
  it('contains 100 complete entries with unique identifiers and canonical paths', () => {
    expect(inventory).toHaveLength(100)
    for (const index of [0, 1, 2]) {
      expect(new Set(inventory.map(row => row[index])).size).toBe(100)
    }
    for (const row of inventory) {
      expect(row).toHaveLength(12)
      expect(row.every(Boolean)).toBe(true)
      expect(row[1]).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(row[2]).toBe(`/kalkulator/${row[1]}`)
      expect(Object.hasOwn(categories, row[4])).toBe(true)
    }
  })

  it('reserves the existing TikTok canonicals for distinct creator and seller intents', () => {
    const creator = inventory.find(row => row[0] === 'calc-estimasi-tiktok-kreator')
    const seller = inventory.find(row => row[0] === 'calc-tiktok')
    expect(creator?.slice(1, 5)).toEqual([
      'tiktok', '/kalkulator/tiktok', expect.stringMatching(/penghasilan.*engagement.*endorse/), 'media-sosial',
    ])
    expect(seller?.slice(1, 5)).toEqual([
      'tiktok-shop', '/kalkulator/tiktok-shop', expect.stringMatching(/TikTok Shop.*dana cair.*penjual/), 'marketplace',
    ])
    expect(creator?.[9]).toBe('published')
    expect(seller?.[9]).toBe('published')
    expect(inventory.some(row => row[1] === 'estimasi-tiktok-kreator')).toBe(false)
  })

  it('keeps the registry aligned with the proposed canonical and status', () => {
    for (const tool of definitions) {
      const row = inventory.find(row => row[0] === tool.id)
      expect(row?.slice(1, 3)).toEqual([tool.slug, tool.path])
      expect(row?.[4]).toBe(tool.primaryCategory)
      expect(row?.[9]).toBe(tool.status)
    }
    expect(inventory.filter(row => row[9] === 'published').map(row => row[0]).sort())
      .toEqual(listPublished().map(tool => tool.id).sort())
  })
})

describe('public calculator registry', () => {
  it('omits drafts and ideas from lookup, categories, related tools and sitemap', () => {
    expect(findPublished('hpp', records)).toBe(hpp)
    expect(findPublished(draft.slug, records)).toBeUndefined()
    expect(findPublished(idea.slug, records)).toBeUndefined()
    expect(listCategory('bisnis', records)).toEqual([hpp])
    expect(listCategory('marketplace', records)).toEqual([])
    expect(relatedCalculators(hpp, records)).toEqual([])
    expect(sitemapPaths(records)).toEqual(['/', '/bisnis', '/kalkulator/hpp'])
  })

  it('lists published tools in secondary categories and uses those categories for related tools', () => {
    const related = { ...draft, status: 'published' as const, implementation: hpp.implementation }
    const records = [hpp, related]
    expect(listCategory('bisnis', records)).toEqual(records)
    expect(listCategory('marketplace', records)).toEqual([related])
    expect(relatedCalculators(hpp, records)).toEqual([related])
  })

  it('finds HPP for title, keyword, category and multiword searches', () => {
    const entries = listPublished(records).map(directoryEntry)
    for (const query of [' HPP ', 'modal', 'bisnis', 'biaya produksi', '']) {
      expect(searchDirectory(entries, query).map(tool => tool.id)).toEqual([hpp.id])
    }
    expect(searchDirectory(entries, 'tiktok')).toEqual([])
  })

  it('has unique localized metadata, unique routes and valid categories', () => {
    for (const value of [
      definitions.map(tool => tool.id),
      definitions.map(tool => tool.slug),
      definitions.map(tool => tool.path),
      listPublished().map(tool => tool.metadata.title.trim().toLocaleLowerCase('id-ID')),
      listPublished().map(tool => tool.metadata.description.trim().toLocaleLowerCase('id-ID')),
    ]) expect(new Set(value).size).toBe(value.length)

    for (const tool of definitions) {
      const categoryIds = [tool.primaryCategory, ...tool.secondaryCategories]
      expect(categoryIds.every(id => Object.hasOwn(categories, id))).toBe(true)
      expect(new Set(categoryIds).size).toBe(categoryIds.length)
    }
    for (const tool of listPublished()) {
      expect(tool.metadata.locale).toBe('id-ID')
      expect(tool.metadata.title.trim()).not.toBe('')
      expect(tool.metadata.description.trim()).not.toBe('')
      expect(tool.metadata.keywords.length).toBeGreaterThan(0)
      expect(calculatorMetadata(tool)).toMatchObject({
        title: tool.metadata.title,
        description: tool.metadata.description,
        alternates: { canonical: tool.path },
      })
    }
  })

  it('exposes the working HPP engine and ordered test references', () => {
    expect(hpp.path).toBe('/kalkulator/hpp')
    expect(hpp.implementation.engine({ materials: '120000', labor: '60000', overhead: '20000', units: '50' }))
      .toEqual({ success: true, total: 200000n, perUnit: 4000n })
    expect(hpp.implementation.testCases[0].name).toBe('calculates the documented production batch')
  })
})
