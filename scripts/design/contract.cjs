const fs = require('node:fs')
const crypto = require('node:crypto')
const { execFileSync } = require('node:child_process')
const baseline = '141659c52af8533df7df9514ef73a99b23fd1642'
const allowed = [
  'app/layout.tsx', 'app/tokens.css', 'components/breadcrumb.module.css',
  'components/calculator-page.tsx', 'components/category-page.tsx',
  'components/directory.module.css', 'components/directory.tsx',
  'components/site-footer.tsx', 'components/site-header.module.css',
  'components/ui/calculator.module.css', 'components/ui/controls.module.css',
  'components/ui/layout.module.css', 'components/ui/loan-schedule.module.css',
  'components/ui/structured-form.module.css',
  'components/ui/table-scroll.ts', 'components/ui/loan-schedule.tsx',
  'components/ui/scenario-tables.tsx', 'components/ui/everyday-tables.tsx',
  'components/ui/materials-breakdown.tsx', 'components/ui/cash-flow-breakdown.tsx',
  'components/ui/holiday-breakdown.tsx', 'components/ui/creator-comparison.tsx',
]
const hash = content => crypto.createHash('sha256').update(content).digest('hex')
const previous = path => execFileSync('git', ['show', `${baseline}:${path}`])

// Preserve the historical migration manifest; apply this separately reviewed UI delta afterwards.
exports.previousContent = path => allowed.includes(path) ? previous(path) : fs.readFileSync(path)
exports.project = files => {
  const manifest = JSON.parse(fs.readFileSync('docs/design-phase-c/application-changes.json'))
  if (manifest.baseline !== baseline || JSON.stringify(manifest.files.map(f => f.path).sort()) !== JSON.stringify([...allowed].sort())) throw Error('Unexpected Phase C scope')
  const expected = structuredClone(files)
  for (const file of manifest.files) {
    const old = expected.find(f => f.path === file.path)
    if (old && old.sha256 !== hash(previous(file.path))) throw Error(`Phase C baseline drift ${file.path}`)
    if (hash(fs.readFileSync(file.path)) !== file.sha256) throw Error(`Phase C hash drift ${file.path}`)
    if (old) old.sha256 = file.sha256
    else expected.push(file)
  }
  return expected
}
