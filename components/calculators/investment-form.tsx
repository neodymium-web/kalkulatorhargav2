'use client'

import { useState } from 'react'
import { investmentTools, type InvestmentSlug, type InvestmentTool } from '../../lib/investment/tools'
import type { InvestmentResult } from '../../lib/investment/engines'
import { formatInvestment } from '../../lib/investment/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import layout from '../ui/calculator.module.css'

export function InvestmentForm({ slug }: { slug: InvestmentSlug }) {
  const tool: InvestmentTool = investmentTools[slug]
  const [result, setResult] = useState<InvestmentResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success
    ? tool.outputFields.map((field) => ({
        label: field.label,
        value: formatInvestment(result.values[field.id], field.unit, result.precision?.[field.id]),
      }))
    : []
  const [primary, ...details] = outputs
  const assumptions = result?.success
    ? [
        result.status === 'no-deposits'
          ? 'Tanpa setoran baru, saldo awal yang diproyeksikan sudah memenuhi target pada akhir durasi dalam model.'
          : undefined,
        result.status === 'covered'
          ? 'Dana tersedia sudah memenuhi target cadangan pilihan Anda; kelebihan ditampilkan sebagai surplus.'
          : undefined,
        result.status === 'negative-return'
          ? 'Hasil bersih negatif: terdapat kerugian setelah biaya yang dimasukkan.'
          : undefined,
        ...(result.notes ?? []),
        tool.rounding,
      ]
        .filter(Boolean)
        .join(' ')
    : undefined
  return (
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
  )
}
