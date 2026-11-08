const fs = require('node:fs')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const ledgerPath = 'docs/audit/editorial61/changes.json'
const sourcePath = 'docs/audit/legacy55/source-pages.json'
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const text = n => typeof n === 'string' ? n : n.children.map(text).join('')
const normalize = s => s.replace(/\s+/g, ' ').trim()
function nodes(n) { return typeof n === 'string' ? [] : [n, ...n.children.flatMap(nodes)] }
function expectedArchive(path, ledger = read(ledgerPath), sources = read(sourcePath)) {
  assert.equal(ledger.baseline, '2f3f1b8ec18e8e555c0193faa1e282bd175614e4')
  assert.equal(ledger.status, 'PENDING_OWNER_APPROVAL'); assert.equal(ledger.cutover, 'NO-GO')
  const row = ledger.pages.find(r => r.path === path), source = sources.find(r => r.path === path)
  assert.ok(row && source, 'Missing per-URL source/change ledger')
  assert.equal(row.publicationStatus, 'PENDING_OWNER_APPROVAL'); assert.equal(row.ownerDecision, null); assert.equal(row.ownerReviewer, null)
  const tree = structuredClone(source.tree)
  for (const change of row.changes) {
    let n = tree
    for (const position of change.position.split('.').map(Number)) n = n.children[position]
    assert.equal(n.tag, change.tag); assert.deepEqual(n.children, change.before, `Before mismatch ${path}:${change.position}`)
    assert.equal(text(n), change.beforeText); assert.equal(change.after.map(text).join(''), change.afterText)
    n.children = structuredClone(change.after)
  }
  assert.equal(normalize(text(tree)), row.expectedText, `Final text mismatch ${path}`)
  const fields = Object.fromEntries(row.fields.map(f => {
    assert.ok(['description', 'publication', 'approval', 'reviewNotice'].includes(f.field), 'Editorial metadata allowlist only')
    return [f.field, f.after]
  }))
  assert.equal(fields.approval, 'PENDING_OWNER_APPROVAL'); assert.equal(fields.publication, 'PENDING_OWNER_APPROVAL')
  assert.ok(fields.reviewNotice.includes('PENDING_OWNER_APPROVAL') && fields.reviewNotice.includes('NO-GO'))
  return { tree, expectedText: row.expectedText, fields, row, source }
}
function verify() {
  const ledger = read(ledgerPath), sources = read(sourcePath), pages = read('lib/legacy/pages.json')
  assert.equal(hash(sourcePath), ledger.sourceSnapshotSha256, 'Original source evidence must remain immutable')
  assert.equal(ledger.pages.length, 22); assert.equal(pages.length, 22)
  assert.equal(new Set(ledger.pages.map(r => r.path)).size, 22)
  assert.deepEqual(ledger.pages.map(r => r.path), pages.map(r => r.path))
  for (const page of pages) {
    const expected = expectedArchive(page.path, ledger, sources), { source, fields } = expected
    assert.deepEqual(page.tree, expected.tree); assert.equal(page.contentText, expected.expectedText)
    for (const key of ['path', 'url', 'title', 'h1', 'canonical', 'dates', 'observedAtUtc', 'sha256', 'textSha256']) assert.deepEqual(page[key], source[key], `Immutable provenance/SEO field ${key}`)
    assert.equal(page.description, fields.description ?? source.description)
    for (const [key, value] of Object.entries(fields)) assert.deepEqual(page[key], value)
    const dates = n => nodes(n).filter(n => n.tag === 'time')
    assert.deepEqual(dates(page.tree), dates(source.tree), 'Original dates must survive as labeled history')
    assert.deepEqual(Object.keys(page).sort(), ['path','url','title','h1','description','canonical','dates','observedAtUtc','sha256','textSha256','tree','contentText','kind','publication','approval','reviewNotice'].sort())
    const kind = page.path.startsWith('/blog/') ? 'blog' : page.path === '/blog' ? 'index' : ['/redaksi','/kebijakan-editorial','/disclaimer'].includes(page.path) ? 'policy' : 'guide'
    assert.equal(page.kind, kind)
  }
  return { path: 'lib/legacy/pages.json', sha256: hash('lib/legacy/pages.json') }
}
module.exports = { expectedArchive, verify, text, nodes }
