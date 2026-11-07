'use client'
import { useState } from 'react'
import { scenarioTools, type ScenarioSlug, type ScenarioTool } from '../../lib/loan-scenarios/tools'
import type { ScenarioResult } from '../../lib/loan-scenarios/engines'
import { formatScenario } from '../../lib/loan-scenarios/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { ScenarioSchedule, RefinanceComparison, DatedPayments } from '../ui/scenario-tables'
import layout from '../ui/calculator.module.css'
export function ScenarioForm({ slug }: { slug: ScenarioSlug }) {
  const tool: ScenarioTool = scenarioTools[slug]
  const [result, setResult] = useState<ScenarioResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success ? tool.outputFields.map(f => ({ label: f.label,
    value: formatScenario(result.values[f.id], f.unit, result.unit, f.id === 'effective' || f.id === 'net' && result.unit ? result.tiny : undefined),
  })) : []
  if (result?.success && result.comparison) {
    outputs.unshift({ label: 'Impas pertama (bisa sementara)', value: result.firstCrossing === null ? 'Tidak tercapai' : `Bulan ${result.firstCrossing}` })
    outputs.unshift({ label: 'Impas permanen sampai kedua pinjaman lunas', value: result.permanentCrossing === null ? 'Tidak tercapai pada skenario ini' : `Bulan ${result.permanentCrossing}` })
  }
  const [primary, ...details] = outputs
  return <>
    <div className={layout.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={details} assumptions={result?.success ? result.notes?.join(' ') : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {result?.success && <>
      {result.dated && <DatedPayments rows={result.dated} />}
      {result.comparison && <RefinanceComparison rows={result.comparison} />}
      {result.schedules?.map(s => <ScenarioSchedule key={s.title} title={s.title} rows={s.rows} />)}
    </>}
  </>
}
