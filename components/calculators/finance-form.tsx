'use client'

import { useState } from 'react'
import { financeTools, type FinanceSlug, type FinanceTool } from '../../lib/finance/tools'
import type { FinanceResult } from '../../lib/finance/engines'
import { formatFinance } from '../../lib/finance/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import { LoanSchedule } from '../ui/loan-schedule'
import layout from '../ui/calculator.module.css'

export function FinanceForm({ slug }: { slug: FinanceSlug }) {
  const tool: FinanceTool = financeTools[slug]
  const [result, setResult] = useState<FinanceResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success
    ? tool.outputFields.map((field) => ({
        label: field.label,
        value: formatFinance(result.values[field.id], field.unit, result.tiny?.includes(field.id)),
      }))
    : []
  const [primary, ...details] = outputs
  const assumptions = result?.success
    ? [
        result.status === 'shortfall'
          ? 'Cicilan melebihi pendapatan bersih. Sisa pendapatan negatif sebelum biaya hidup.'
          : undefined,
        result.status === 'zero-principal' ? 'Pokok nol: tidak ada kewajiban pembayaran.' : undefined,
        ...(result.notes ?? []),
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
      {result?.success && result.schedule && (
        <LoanSchedule rows={result.schedule} total={result.values.total} interest={result.values.interest} />
      )}
    </>
  )
}
