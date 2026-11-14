const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { readCsv } = require('./csv.cjs')
const { validate } = require('./redirect-fixture.cjs')
const { draft, trace } = require('../legacy/host-policy.cjs')

const directory = 'docs/audit/migration-release'
const hosts = ['kalkulatorharga.com', 'www.kalkulatorharga.com']
const gateIds = ['BENCHMARK', 'MANUAL-SCOPE', 'ARCHIVE-PROVENANCE', 'SEO-EXPORTS', 'BACKLINKS', 'HOST-POLICY', 'REDIRECTS', 'OPERATIONS', 'ROLLBACK-THRESHOLDS', 'PRODUCTION-INDEXING', 'EXECUTION-AUTHORIZATION']
const load = file => JSON.parse(fs.readFileSync(file, 'utf8'))
function assert(value, message) { if (!value) throw Error(message) }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
function applicationFiles(root = '.') {
  const result = []
  function visit(p) {
    if (!fs.existsSync(path.join(root, p))) return
    if (fs.statSync(path.join(root, p)).isDirectory()) {
      for (const child of fs.readdirSync(path.join(root, p)).sort()) visit(`${p}/${child}`)
    } else result.push(p)
  }
  for (const p of ['app', 'components', 'lib', 'public']) visit(p)
  for (const p of fs.readdirSync(root).filter(p => /^(next\.config\.|middleware\.|proxy\.|vercel\.json$|package(-lock)?\.json$|tsconfig\.json$)/.test(p))) visit(p)
  return result.sort().map(p => ({ path: p, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex') }))
}
function validateRegister(register) {
  const archives = load('lib/legacy/pages.json').map(p => p.path).sort()
  const refs = readCsv('docs/audit/legacy-link-dependencies.csv').filter(r => r.classification === 'unresolved-legacy-feature')
  assert(register.schemaVersion === 1 && register.baseline === 'b8dd6ee6fe9a45bca1b86e793a430ce25ca27844', 'Wrong register baseline/schema')
  assert(register.archives.length === 22 && same(register.archives.map(r => r.path).sort(), archives), 'Archive coverage mismatch')
  assert(register.references.length === 6 && same(register.references.map(r => [r.sourcePath, r.anchorText, r.target]), refs.map(r => [r.source_path, r.anchor_text, r.target])), 'Six reference instances must match source ledger')
  assert(same(register.gates.map(r => r.id).sort(), [...gateIds].sort()), 'Missing or duplicate release gate')
  const items = [...register.archives, ...register.references, ...register.gates]
  assert(new Set(items.map(r => r.id)).size === items.length, 'Duplicate decision ID')
  for (const item of items) {
    assert(item.status === 'UNKNOWN' && item.approval === null, `No owner approval supplied for ${item.id}; do not infer approval`)
    assert(item.ownerRole && item.requiredDecision, `Missing handoff for ${item.id}`)
  }
  assert(register.executionAuthorized === false, 'This task cannot authorize execution')
  assert(Object.values(register.seoData).filter(v => typeof v === 'string').every(v => v === 'UNKNOWN') && register.seoData.exports.length === 0, 'SEO exports not supplied')
  assert(register.host.currentCanonical === 'https://kalkulatorharga.com' && register.host.approvedPolicy === 'UNKNOWN', 'Host policy not approved')
  assert(register.benchmark.currentStatus === 404 && register.benchmark.published === false && register.benchmark.approvedRetirement === 'UNKNOWN' && register.benchmark.licensedReproducibleDataset === 'UNKNOWN', 'Benchmark must stay blocked, not approved retired')
  return items.map(r => r.id)
}
function mapping() {
  const rows = readCsv('docs/audit/cutover-url-map.csv')
  const targets = rows.map(r => r.v2_route)
  assert(rows.length === 131 && new Set(targets).size === 131, 'Expected 131 unique target URLs')
  for (const r of rows) assert(new URL(r.intended_canonical).href === `https://kalkulatorharga.com${r.v2_route}` && new URL(r.expected_production_url).href === new URL(r.intended_canonical).href, `Canonical mapping drift ${r.v2_route}`)
  const overlay = readCsv(`${directory}/legacy-seo-overlay.csv`)
  const inventory = readCsv('docs/audit/legacy-url-inventory.csv')
  const old = [...new Set(inventory.filter(r => r.final_status === '200' && !['/robots.txt', '/sitemap.xml'].includes(new URL(r.old_url).pathname)).map(r => new URL(r.old_url).pathname))].sort()
  assert(overlay.length === 32 && same(overlay.map(r => r.legacy_path).sort(), old), 'Legacy 32 URL coverage mismatch')
  assert(overlay.every(r => r.owner_approval === 'UNKNOWN' && r.priority_from_traffic === 'UNKNOWN'), 'Mapping is not an approval or traffic baseline')
  for (const r of overlay) assert(!r.v2_target || targets.includes(r.v2_target), `Unpublished map target ${r.legacy_path}`)
  const proposals = readCsv('docs/audit/redirect-proposals.csv')
  assert(proposals.length === 2 && proposals.every(r => r.approved_for_production === 'no'), 'No path redirect approved')
  const rules = validate(proposals.map(r => ({ source: r.source, destination: r.destination, status: Number(r.status) })), new Set(targets))
  for (const rule of rules) assert(overlay.some(r => r.legacy_path === rule.source && r.proposed_redirect_target === rule.destination && r.current_disposition === 'REDIRECT_PROPOSAL_ONLY'), 'Proposal/SEO overlay mismatch')
  const dispositions = { ARCHIVE_REVIEW: 22, BENCHMARK_BLOCKED_404: 1, MANUAL_SCOPE_REVIEW: 2, REDIRECT_PROPOSAL_ONLY: 2, PRESERVE_INTENT_REVIEW: 5 }
  const register = load(`${directory}/register.json`)
  for (const [label, count] of Object.entries(dispositions)) assert(overlay.filter(r => r.current_disposition === label).length === count, `Wrong disposition count ${label}`)
  for (const row of overlay) {
    const observed = inventory.find(r => new URL(r.old_url).pathname === row.legacy_path)
    assert(observed && observed.evidence_url === row.legacy_evidence_url && observed.evidence_time_utc === row.source_observed_at_utc, 'Source provenance mismatch')
    assert(row.v2_target === (targets.includes(row.legacy_path) ? row.legacy_path : ''), 'No false target equivalence')
    const archive = register.archives.find(r => r.path === row.legacy_path)
    const expectedId = archive ? archive.id : row.legacy_path === register.benchmark.path ? 'BENCHMARK' : ['/bandingkan', '/kalkulator/emas'].includes(row.legacy_path) ? 'MANUAL-SCOPE' : rules.some(r => r.source === row.legacy_path) ? 'REDIRECTS' : 'SEO-EXPORTS'
    assert(row.decision_id === expectedId, 'Decision ID mismatch')
  }
  assert(!targets.includes('/kalkulator/tiktok/benchmark'), 'Benchmark must not enter sitemap')
  return { targets, rules, legacyContentURLs: old.length }
}
// In-memory rehearsal only. No DNS, HTTP, Vercel client or mutation command is used.
function routeFixture(input, canonicalHost, targets, rules) {
  assert(hosts.includes(canonicalHost), 'Invalid fixture canonical host')
  const u = new URL(input)
  assert(u.protocol === 'https:' && hosts.includes(u.hostname) && !u.port && !u.username && !u.password && !u.hash, 'Invalid fixture URL; fragments are not HTTP inputs')
  if ([...u.searchParams.keys()].some(k => !['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(k))) return { status: 'UNKNOWN_QUERY_INTENT', location: null }
  const rule = rules.find(r => r.source === u.pathname)
  const destination = rule ? rule.destination : u.pathname
  if (!targets.includes(destination)) return { status: 404, location: null }
  if (rule || u.hostname !== canonicalHost) return { status: 301, location: `https://${canonicalHost}${destination}${u.search}` }
  return { status: 200, location: null }
}
function rollbackFixture(snapshot, candidate, failAfterHosts) {
  const state = structuredClone(snapshot)
  const touched = [], undo = []
  try {
    for (const host of hosts) {
      const previous = structuredClone(state.assignments[host])
      undo.push(() => { state.assignments[host] = previous })
      state.assignments[host] = structuredClone(candidate.assignments[host]); touched.push(host)
      if (touched.length === failAfterHosts) throw Error('Injected fixture failure')
    }
    assert(candidate.staging.sso === true && candidate.staging.noindex === true, 'Staging protection invariant failed')
    assert(new Set(Object.values(state.assignments).map(a => a.projectId)).size === 1, 'Partial assignment')
    const previousCanonical = state.canonical
    undo.push(() => { state.canonical = previousCanonical })
    state.canonical = candidate.canonical
    throw Error('Injected post-move validation failure')
  } catch (e) {
    for (const inverse of undo.reverse()) inverse()
    return { simulated: true, touched, failure: e.message, restoredExactly: same(state, snapshot), restored: state }
  }
}
function report() {
  const register = load(`${directory}/register.json`)
  const blocked = validateRegister(register)
  const baseline = load(`${directory}/application-baseline.json`)
  const expectedFiles = structuredClone(baseline.files)
  // Issue61 allows only source-replayed archive content; all other application files stay frozen.
  const editorial = require('../legacy/editorial-contract.cjs').verify()
  assert(expectedFiles.some(f => f.path === editorial.path), 'Archive file missing from baseline')
  expectedFiles.find(f => f.path === editorial.path).sha256 = editorial.sha256
  const additions=load('docs/audit/stock63-scope.json').files
  assert(same(additions.map(f=>f.path).sort(),['app/kalkulator/saham/average/page.tsx','components/stock-parity/form.tsx','lib/stock-parity/engine.ts','lib/stock-parity/fields.ts'].sort()),'Unexpected stock scope')
  expectedFiles.push(...additions)
  assert(baseline.baseline === register.baseline && same(applicationFiles(), expectedFiles.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)), 'Application/config drift outside reviewed editorial ledger')
  const map = mapping()
  const observation = load(`${directory}/domain-observation.json`)
  const snapshot = { assignments: Object.fromEntries(observation.legacy.map(a => [a.alias, { projectId: a.projectId, deploymentId: a.deployment.id, redirect: a.redirect, status: a.redirectStatusCode }])), canonical: register.host.currentCanonical, staging: { sso: true, noindex: true } }
  const rehearsals = hosts.map(host => {
    const candidate = structuredClone(snapshot)
    candidate.canonical = `https://${host}`
    for (const h of hosts) candidate.assignments[h] = { projectId: 'SIMULATED_V2', deploymentId: 'SIMULATED_CANDIDATE', redirect: h === host ? null : host, status: h === host ? null : 301 }
    const cases = [1, 2, 3].map(failAfter => rollbackFixture(snapshot, candidate, failAfter))
    assert(cases.every(c => c.restoredExactly), 'Fixture rollback mismatch')
    const routes = hosts.flatMap(inputHost => map.targets.map(p => {
      const r = routeFixture(`https://${inputHost}${p}`, host, map.targets, map.rules)
      assert(r.status === (inputHost === host ? 200 : 301), 'Host route mismatch')
      if (r.location) assert(routeFixture(r.location, host, map.targets, map.rules).status === 200, 'Redirect chain')
      return { inputHost, path: p, ...r }
    }))
    assert(trace(host, '/', draft(host)).length === 0, 'Canonical self redirect')
    return { hypotheticalCanonical: host, canonicalChangeAllowed: false, routeChecks: routes.length, rollbackCases: cases.map(({ restored, ...r }) => r) }
  })
  return { schemaVersion: 1, baseline: register.baseline, technicalConsistency: 'PASS', cutoverDecision: 'NO-GO', executionAuthorized: false, blockedDecisionRows: blocked, counts: { originalCalculators: 100, hubs: 6, archives: 22, supplementalManualTools: 2, sitemap: 131, legacyContentURLs: map.legacyContentURLs, unresolvedReferenceInstances: 6, pathProposals: 2 }, rehearsals, evidenceLimits: ['Synthetic local models, not a platform rollback drill', 'No complete SEO exports or archive-publication/cutover approval; Issue60 product/manual and future-www planning choices are recorded separately', 'Historical domain observation must be reverified on execution day', 'No change to canonical, production, DNS, aliases, staging SSO or indexing'] }
}
module.exports = { applicationFiles, validateRegister, mapping, routeFixture, rollbackFixture, report }
if (require.main === module) {
  try {
    const args = process.argv.slice(2)
    assert(args.every(a => a === '--require-cutover'), 'Only read-only reporting is supported; no apply mode')
    console.log(JSON.stringify(report(), null, 2))
    if (args.includes('--require-cutover')) process.exitCode = 2
  } catch (e) { console.error(e.message); process.exitCode = 1 }
}
