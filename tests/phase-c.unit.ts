import { test, expect } from 'vitest'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'
import { scrollTableByKey } from '../components/ui/table-scroll'
import type { KeyboardEvent } from 'react'

const baseline = '141659c52af8533df7df9514ef73a99b23fd1642'
const previous = (path: string) => execFileSync('git', ['show', `${baseline}:${path}`]).toString()

test('Phase C preserves every approved existing token value', () => {
  const tokens = (text: string) => Object.fromEntries([...text.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]]))
  const original = tokens(previous('app/tokens.css'))
  const current = tokens(fs.readFileSync('app/tokens.css', 'utf8'))
  for (const [name, value] of Object.entries(original)) expect(current[name], name).toBe(value)
})

test('layout preserves SEO metadata except the owner-requested Google verification', () => {
  function metadata(source: string) {
    const file = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const statement of file.statements) {
      if (ts.isVariableStatement(statement)) for (const item of statement.declarationList.declarations) {
        if (item.name.getText(file) === 'metadata') return item.initializer?.getText(file)
      }
    }
    throw Error('Missing layout metadata')
  }
  const current = fs.readFileSync('app/layout.tsx', 'utf8')
  const verification = "  verification: { google: 'lqcG_PxTdOtaVfKB2Ny9eBJO1oZJNAmpOI3IXFqiBko' },\n"
  expect(current.split(verification)).toHaveLength(2)
  expect(metadata(current.replace(verification, ''))).toBe(metadata(previous('app/layout.tsx')))
})

test('table keyboard fallback scrolls only the focused overflowing region without modifiers', () => {
  const region = { scrollLeft: 0, scrollWidth: 640, clientWidth: 280 }
  let prevented = 0
  const event = { currentTarget: region, target: region, key: 'ArrowRight', preventDefault: () => { prevented++ } }
  scrollTableByKey(event as unknown as KeyboardEvent<HTMLDivElement>)
  expect(region.scrollLeft).toBe(48)
  scrollTableByKey({ ...event, key: 'ArrowLeft' } as unknown as KeyboardEvent<HTMLDivElement>)
  expect(region.scrollLeft).toBe(0)
  for (const change of [{ key: 'ArrowDown' }, { target: {} }, { altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
    scrollTableByKey({ ...event, ...change } as unknown as KeyboardEvent<HTMLDivElement>)
  }
  region.clientWidth = 640
  scrollTableByKey(event as unknown as KeyboardEvent<HTMLDivElement>)
  expect(prevented).toBe(2)
  expect(region.scrollLeft).toBe(0)
})
