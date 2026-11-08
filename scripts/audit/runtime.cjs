const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename)
const serialize = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)
module.exports = { serialize }
if (require.main === module) {
  const { listPublished, listCategoryHubs, sitemapPaths } = require('../../lib/registry.ts')
  const tools = listPublished().map(t => ({ id: t.id, slug: t.slug, path: t.path, category: t.primaryCategory, metadata: t.metadata, fields: t.inputFields, sources: t.officialSources, formulaVersion: t.implementation.formulaVersion, existingTests: t.implementation.testCases }))
  fs.writeFileSync('docs/audit/catalogue.json', serialize({ baseline: 'f865ee826c4965b1557c20b46c802f3e54138efc', tools, hubs: listCategoryHubs(), paths: sitemapPaths() }) + '\n')
}
