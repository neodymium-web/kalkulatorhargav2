const fs = require('node:fs')
const { serialize } = require('./runtime.cjs')
const { findPublished } = require('../../lib/registry.ts')
const cases = JSON.parse(fs.readFileSync('docs/audit/oracles.json', 'utf8')).cases
const results = cases.map(c => ({ slug: c.slug, baseline: findPublished(c.slug).implementation.engine(c.input), edge: findPublished(c.slug).implementation.engine(c.edgeInput) }))
fs.writeFileSync('/tmp/issue51-engine-results.json', serialize(results))
for (const r of results) console.log(r.slug, r.baseline.success ? 'parsed' : JSON.stringify(r.baseline.errors))
