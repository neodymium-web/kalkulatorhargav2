import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { findPublished, listPublished } from '../lib/registry'
type Check = { path: string; kind: string; expected?: string | boolean }
type Vector = { slug: string; id: string; input: unknown; checks: Check[]; edgeInput: unknown; edgeChecks: Check[] }
const cases: Vector[] = JSON.parse(readFileSync('docs/audit/oracles.json', 'utf8')).cases
function at(object: unknown, path: string): unknown { return path.split('.').reduce<unknown>((o, k) => o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined, object) }
function verify(result: unknown, checks: Check[]) {
  for (const c of checks) {
    const actual = at(result, c.path)
    if (c.kind === 'absent') expect(actual, c.path).toBeUndefined()
    else if (c.kind === 'literal') expect(actual, c.path).toBe(c.expected)
    else if (c.kind === 'rational') { const v = actual as { n: bigint; d: bigint }; const [n, d = '1'] = String(c.expected).split('/'); expect(v.n * BigInt(d), c.path).toBe(BigInt(n) * v.d) }
    else expect(String(actual), c.path).toBe(c.expected)
  }
}
it('audit vectors cover exactly the 100 published IDs without importing legacy fixture expectations', () => { expect(cases).toHaveLength(100); expect(new Set(cases.map(c => c.id)).size).toBe(100); expect(cases.map(c => c.id).sort()).toEqual(listPublished().map(t => t.id).sort()) })
for (const c of cases) describe(`independent audit ${c.id}`, () => {
  const tool = findPublished(c.slug)!
  it('matches Python Fraction/Decimal baseline', () => { const r = tool.implementation.engine(c.input); expect(r.success).toBe(true); verify(r, c.checks) })
  it('rejects boundary input or holds unknown facts without invented amount', () => { verify(tool.implementation.engine(c.edgeInput), c.edgeChecks) })
  it('does not throw on empty null array or prototype-shaped untrusted input', () => { for (const v of [null, {}, [], { __proto__: { price: '1', success: true } }, JSON.parse('{"__proto__":{"polluted":true}}')]) expect(() => tool.implementation.engine(v)).not.toThrow(); expect(({} as Record<string, unknown>).polluted).toBeUndefined() })
})
const stress: { slug: string; input: unknown; checks: Check[]; note: string }[] = JSON.parse(readFileSync('docs/audit/stress-oracles.json','utf8'))
for (const [index, v] of stress.entries()) it(`independent stress ${index} ${v.slug}: ${v.note}`, () => { const r = findPublished(v.slug)!.implementation.engine(v.input); expect(r.success).toBe(true); verify(r, v.checks) })
