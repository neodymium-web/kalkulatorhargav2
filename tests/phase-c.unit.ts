import { test, expect } from 'vitest'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'

const baseline = '141659c52af8533df7df9514ef73a99b23fd1642'
const previous = (path: string) => execFileSync('git', ['show', `${baseline}:${path}`]).toString()

test('Phase C preserves every approved existing token value', () => {
  const tokens = (text: string) => Object.fromEntries([...text.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]]))
  const original = tokens(previous('app/tokens.css'))
  const current = tokens(fs.readFileSync('app/tokens.css', 'utf8'))
  for (const [name, value] of Object.entries(original)) expect(current[name], name).toBe(value)
})

test('footer refinement leaves layout SEO metadata unchanged', () => {
  function metadata(source: string) {
    const file = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const statement of file.statements) {
      if (ts.isVariableStatement(statement)) for (const item of statement.declarationList.declarations) {
        if (item.name.getText(file) === 'metadata') return item.initializer?.getText(file)
      }
    }
    throw Error('Missing layout metadata')
  }
  expect(metadata(fs.readFileSync('app/layout.tsx', 'utf8'))).toBe(metadata(previous('app/layout.tsx')))
})
