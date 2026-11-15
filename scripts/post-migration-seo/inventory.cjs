const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const productionOrigin = 'https://www.kalkulatorharga.com'
const criticalPaths = ['/kalkulator/tiktok', '/kalkulator/emas', '/kalkulator/saham/average', '/kalkulator/tiktok/benchmark', '/kalkulator/hpp', '/kalkulator/shopee', '/kalkulator/tiktok-shop']
function inventory(source) {
  if (!source) {
    require('../audit/runtime.cjs')
    const { listPublished, sitemapPaths } = require('../../lib/registry.ts')
    source = { tools: listPublished(), registryPaths: sitemapPaths(), published: require('../../lib/published-paths.ts').publishedPaths(), ...require('../../lib/legacy/routes.ts'), ...require('../../lib/legacy/registry.ts'), ...require('../../lib/supplemental/routes.ts'), ...require('../../lib/migration/routes.ts') }
  }
  const { tools, published: canonical, registryPaths, legacyPaths, legacyPages, migrationPaths, supplementalPaths } = source
  if (tools.length !== 100 || new Set(tools.map(t => t.id)).size !== 100) throw Error('Calculator inventory drift')
  if (new Set(canonical).size !== canonical.length) throw Error('Duplicate published path')
  if (JSON.stringify([...legacyPaths].sort()) !== JSON.stringify(legacyPages.map(p => p.path).sort())) throw Error('Legacy route/record drift')
  const rows = canonical.map(p => {
    const archive = legacyPages.find(a => a.path === p)
    // Publication evidence, not HTTP 200, determines legacy eligibility.
    const approved = archive?.publication === 'APPROVED' && archive?.approval === 'APPROVED'
    return {
      path: p, canonicalPath: p, status: 200,
      family: tools.some(t => t.path === p) ? 'calculator' : archive ? 'legacy' : migrationPaths.includes(p) ? 'migration-tool' : supplementalPaths.includes(p) ? 'supplemental-tool' : 'home-or-hub',
      publication: archive ? archive.publication : 'published',
      indexPolicy: archive && !approved ? 'noindex' : 'indexable',
      sitemap: !archive || approved,
    }
  })
  rows.push({ path: '/kalkulator', canonicalPath: '/', status: 200, family: 'directory-alias', publication: 'retained', indexPolicy: 'canonicalized', sitemap: false })
  const staticPaths = []
  function visit(directory, segments = []) {
    if (fs.existsSync(path.join(directory, 'page.tsx'))) staticPaths.push('/' + segments.join('/'))
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory() && !entry.name.startsWith('[')) visit(path.join(directory, entry.name), [...segments, entry.name])
  }
  visit('app')
  for (const p of staticPaths) if (!rows.some(r => r.path === p)) throw Error('Unclassified static route: ' + p)
  for (const p of registryPaths) if (!rows.some(r => r.path === p)) throw Error('Missing registry route: ' + p)
  return { schemaVersion: 1, sourceSHA: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(), productionOrigin, criticalPaths, sources: ['lib/registry.ts', 'lib/published-paths.ts', 'lib/migration/routes.ts', 'lib/supplemental/routes.ts', 'lib/legacy/routes.ts', 'lib/legacy/registry.ts', 'app/**/page.tsx'], rows }
}
module.exports = { inventory, criticalPaths, productionOrigin }
if (require.main === module) {
  const output = process.argv[2] || 'test-results/post-migration-seo/inventory.json'
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const result = inventory()
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ output, total: result.rows.length, sitemap: result.rows.filter(r => r.sitemap).length, pendingLegacy: result.rows.filter(r => r.family === 'legacy' && r.indexPolicy === 'noindex').length }))
}
