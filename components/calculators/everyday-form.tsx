'use client'
import { useId, useState } from 'react'
import { everydayTools, percentModes, type EverydaySlug, type EverydayTool } from '../../lib/everyday/tools'
import type { EverydayResult } from '../../lib/everyday/engines'
import { formatEveryday } from '../../lib/everyday/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { Select } from '../ui/controls'
import { EverydayTables } from '../ui/everyday-tables'
import layout from '../ui/calculator.module.css'
import sections from '../ui/layout.module.css'
function InteractiveEveryday({ tool }: { tool: EverydayTool }) {
  const [result, setResult] = useState<EverydayResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success ? tool.outputFields.map(f => ({
    label: result.comparisonUnit && (f.id === 'minimum' || f.id === 'maximum') ? `${f.label} per ${result.comparisonUnit}` : f.label,
    value: formatEveryday(result.values[f.id], f.unit, result.precision[f.id]),
  })) : []
  if (result?.success && result.winners) outputs.unshift({ label: 'Kemasan termurah secara eksak', value: result.winners.map(i => `Kemasan ${i + 1}`).join(', ') })
  const [primary, ...details] = outputs
  return <>
    <div className={layout.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={details} assumptions={result?.success ? result.notes?.join(' ') : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {result?.success && <EverydayTables result={result} />}
  </>
}
export function EverydayForm({ slug }: { slug: EverydaySlug }) {
  const [mode, setMode] = useState<'portion' | 'ratio'>('portion')
  const id = useId()
  if (slug !== 'persen') return <InteractiveEveryday tool={everydayTools[slug]} />
  return <>
    <section className={`${layout.panel} ${sections.section}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Dua cara menghitung persen</h2>
      <p id={`${id}-hint`} className={layout.hint}>Pilih operasi. Mengganti mode menghapus input dan hasil mode sebelumnya.</p>
      <Select id={`${id}-mode`} label="Mode kalkulator persen" value={mode} aria-describedby={`${id}-hint`} aria-controls={`${id}-panel`}
        onChange={e => setMode(e.target.value as 'portion' | 'ratio')}>
        <option value="portion">X% dari N</option><option value="ratio">A berapa persen dari B</option>
      </Select>
    </section>
    <section id={`${id}-panel`} aria-labelledby={`${id}-active`}>
      <h2 id={`${id}-active`}>{percentModes[mode].title}</h2><p className={layout.hint}>{percentModes[mode].description}</p>
      <InteractiveEveryday key={mode} tool={percentModes[mode]} />
    </section>
  </>
}
