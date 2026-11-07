'use client'
import { useId, useState } from 'react'
import { creatorTools, creatorModes, type CreatorSlug, type CreatorTool } from '../../lib/creator-analytics/tools'
import type { CreatorResult, CreatorMode } from '../../lib/creator-analytics/engines'
import { formatCreator } from '../../lib/creator-analytics/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { Select } from '../ui/controls'
import { CreatorComparison } from '../ui/creator-comparison'
import layout from '../ui/calculator.module.css'
import sections from '../ui/layout.module.css'
function InteractiveCreator({ tool }: { tool: CreatorTool }) {
  const [result, setResult] = useState<CreatorResult>()
  const errors = result?.success === false ? result.errors : undefined
  const [primary, ...details] = result?.success ? tool.outputFields.map(f => ({
    label: f.label, value: formatCreator(result.values[f.id], f.unit, result.precision[f.id]),
  })) : []
  return <>
    <div className={layout.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={details} assumptions={result?.success ? result.notes?.join(' ') : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {result?.success && result.comparison && <CreatorComparison result={result} />}
  </>
}
function TiktokSuite() {
  const [mode, setMode] = useState<CreatorMode>('earnings')
  const id = useId()
  return <>
    <section className={`${layout.panel} ${sections.section}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Empat modul TikTok Kreator</h2>
      <p id={`${id}-hint`} className={layout.hint}>Pilih satu modul. Setiap modul bekerja mandiri; mengganti modul menghapus input dan hasil sebelumnya. Semua data diisi manual.</p>
      <Select id={`${id}-mode`} label="Pilih modul TikTok Kreator" value={mode} aria-describedby={`${id}-hint`} aria-controls={`${id}-panel`}
        onChange={event => setMode(event.target.value as CreatorMode)}>
        {(Object.keys(creatorModes) as CreatorMode[]).map(key => <option key={key} value={key}>{creatorModes[key].title}</option>)}
      </Select>
    </section>
    <section id={`${id}-panel`} aria-labelledby={`${id}-mode-title`}>
      <h2 id={`${id}-mode-title`}>{creatorModes[mode].title}</h2>
      <p className={layout.hint}>{creatorModes[mode].description}</p>
      <InteractiveCreator key={mode} tool={creatorModes[mode]} />
    </section>
  </>
}
export function CreatorForm({ slug }: { slug: CreatorSlug }) {
  return slug === 'tiktok' ? <TiktokSuite /> : <InteractiveCreator tool={creatorTools[slug]} />
}
