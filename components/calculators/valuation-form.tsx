'use client'
import { useState } from 'react'
import { valuationTools, type ValuationSlug, type ValuationTool } from '../../lib/valuation/tools'
import type { ValuationResult } from '../../lib/valuation/engines'
import { formatValuation } from '../../lib/valuation/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { CashFlowBreakdown } from '../ui/cash-flow-breakdown'
import layout from '../ui/calculator.module.css'

export function ValuationForm({ slug }: { slug: ValuationSlug }) {
  const tool: ValuationTool = valuationTools[slug]
  const [result, setResult] = useState<ValuationResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success
    ? tool.outputFields.map((field) => ({
        label: field.label,
        value: formatValuation(result.values[field.id], field.unit, result.precision?.[field.id]),
      }))
    : []
  const [primary, ...details] = outputs
  const assumptions = result?.success
    ? [
        result.status === 'positive-npv'
          ? 'NPV positif pada asumsi input; ini bukan jaminan laba aktual.'
          : result.status === 'negative-npv'
            ? 'NPV negatif pada asumsi input.'
            : result.status === 'zero-npv'
              ? 'Nilai kini masuk dan keluar seimbang pada diskonto asumsi.'
              : undefined,
        tool.rounding,
      ]
        .filter(Boolean)
        .join(' ')
    : undefined
  return (
    <>
      <div className={layout.grid}>
        <StructuredForm
          tool={tool}
          errors={errors}
          onResult={(input) => setResult(tool.engine(input))}
          onChange={() => setResult(undefined)}
        />
        <ResultPanel
          result={primary}
          details={details}
          assumptions={assumptions}
          message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'}
        />
      </div>
      {result?.success && result.breakdown && (
        <CashFlowBreakdown
          rows={result.breakdown}
          total={result.values.npv}
          nominal={result.values.nominal}
          precision={result.precision?.npv}
        />
      )}
    </>
  )
}
