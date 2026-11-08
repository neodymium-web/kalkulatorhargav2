import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const { validateRegister, mapping, routeFixture, rollbackFixture, report } = require('../scripts/migration/release-gates.cjs')
const { trace, draft } = require('../scripts/legacy/host-policy.cjs')
const register = JSON.parse(readFileSync('docs/audit/migration-release/register.json', 'utf8'))
const hosts = ['kalkulatorharga.com', 'www.kalkulatorharga.com']

describe('migration release evidence fails closed', () => {
  it('covers 22 archives, six reference instances and eleven decision groups without granting approval', () => {
    expect(validateRegister(register)).toHaveLength(39)
    const result = report()
    expect(result.technicalConsistency).toBe('PASS')
    expect(result.cutoverDecision).toBe('NO-GO')
    expect(result.executionAuthorized).toBe(false)
    expect(result.counts).toEqual({ originalCalculators: 100, hubs: 6, archives: 22, supplementalManualTools: 2, sitemap: 131, legacyContentURLs: 32, unresolvedReferenceInstances: 6, pathProposals: 2 })
    expect(result.rehearsals.map((r: { routeChecks: number }) => r.routeChecks)).toEqual([262, 262])
  })
  it.each(['archive', 'reference', 'gate', 'approval', 'seo', 'benchmark', 'host', 'authorization'])('rejects missing or fabricated evidence: %s', kind => {
    const copy = structuredClone(register)
    if (kind === 'archive') copy.archives.pop()
    if (kind === 'reference') copy.references[0].target = 'https://unverified.test/'
    if (kind === 'gate') copy.gates.pop()
    if (kind === 'approval') { copy.archives[0].status = 'APPROVED'; copy.archives[0].approval = 'Invented owner' }
    if (kind === 'seo') copy.seoData.gsc = 'VERIFIED'
    if (kind === 'benchmark') copy.benchmark.approvedRetirement = 'APPROVED'
    if (kind === 'host') copy.host.approvedPolicy = 'apex'
    if (kind === 'authorization') copy.executionAuthorized = true
    expect(() => validateRegister(copy)).toThrow()
  })
  it('returns expected nonzero NO-GO and rejects mutation flags', () => {
    const blocked = spawnSync(process.execPath, ['scripts/migration/release-gates.cjs', '--require-cutover'], { encoding: 'utf8' })
    expect(blocked.status).toBe(2); expect(JSON.parse(blocked.stdout).cutoverDecision).toBe('NO-GO')
    const apply = spawnSync(process.execPath, ['scripts/migration/release-gates.cjs', '--apply'], { encoding: 'utf8' })
    expect(apply.status).toBe(1); expect(apply.stderr).toContain('no apply mode')
  })
})
describe('hypothetical host/path routing, never active routing', () => {
  const { targets, rules } = mapping()
  for (const canonical of hosts) it(`combines both host and proposed path in one hop to ${canonical}`, () => {
    for (const inputHost of hosts) for (const rule of rules) {
      const first = routeFixture(`https://${inputHost}${rule.source}?utm_source=dry-run`, canonical, targets, rules)
      expect(first).toEqual({ status: 301, location: `https://${canonical}${rule.destination}?utm_source=dry-run` })
      expect(routeFixture(first.location, canonical, targets, rules)).toEqual({ status: 200, location: null })
    }
    expect(routeFixture(`https://${canonical}/kalkulator/tiktok/benchmark`, canonical, targets, rules)).toEqual({ status: 404, location: null })
    expect(routeFixture(`https://${canonical}/unmapped-legacy`, canonical, targets, rules)).toEqual({ status: 404, location: null })
    expect(routeFixture(`https://${canonical}/?platform=shopee`, canonical, targets, rules)).toEqual({ status: 'UNKNOWN_QUERY_INTENT', location: null })
  })
  it('rejects the opposed live/draft host rules and unsafe origins', () => {
    expect(() => trace(hosts[0], '/', [{ from: hosts[0], to: hosts[1], status: 308 }, ...draft(hosts[0])])).toThrow('loop')
    for (const input of ['https://untrusted.test/', 'http://kalkulatorharga.com/', 'https://kalkulatorharga.com:8443/', 'https://user:secret@kalkulatorharga.com/', 'https://kalkulatorharga.com/#preset']) expect(() => routeFixture(input, hosts[0], targets, rules)).toThrow()
  })
})
describe('inverse-journal recovery, not a live Vercel rollback', () => {
  const snapshot = { assignments: Object.fromEntries(hosts.map(host => [host, { projectId: 'LEGACY_FIXTURE', deploymentId: 'LEGACY_SHA_FIXTURE', redirect: host === hosts[0] ? hosts[1] : null, status: host === hosts[0] ? 308 : null }])), canonical: 'https://kalkulatorharga.com', staging: { sso: true, noindex: true } }
  const candidate = { assignments: Object.fromEntries(hosts.map(host => [host, { projectId: 'V2_FIXTURE', deploymentId: 'V2_SHA_FIXTURE', redirect: host === hosts[1] ? hosts[0] : null, status: host === hosts[1] ? 301 : null }])), canonical: 'https://www.kalkulatorharga.com', staging: { sso: true, noindex: true } }
  it.each([1, 2, 3])('restores both assignments, redirect, canonical and staging after failure stage %i', stage => {
    const original = structuredClone(snapshot)
    const result = rollbackFixture(snapshot, candidate, stage)
    expect(result.touched).toHaveLength(Math.min(stage, 2)); expect(result.restored).toEqual(original)
    expect(result.restoredExactly).toBe(true); expect(snapshot).toEqual(original)
    expect(result.failure).toBe(stage < 3 ? 'Injected fixture failure' : 'Injected post-move validation failure')
  })
  it('rejects staging exposure and partial host plans before accepting a simulated move', () => {
    expect(rollbackFixture(snapshot, { ...candidate, staging: { sso: false, noindex: false } }, 3).failure).toContain('protection')
    const partial = structuredClone(candidate); partial.assignments[hosts[1]].projectId = 'OTHER_PROJECT'
    const result = rollbackFixture(snapshot, partial, 3)
    expect(result.failure).toBe('Partial assignment'); expect(result.restored).toEqual(snapshot)
  })
})
