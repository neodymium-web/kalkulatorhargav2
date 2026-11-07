'use client'

import { useState } from 'react'
import { batchFourTools, type BatchSlug, type BatchTool } from '../../lib/batch-four/tools'
import type { BatchFourResult } from '../../lib/batch-four/engines'
import { ResultPanel } from '../ui/calculator'
import { StructuredForm } from '../ui/structured-form'
import layout from '../ui/calculator.module.css'

const integer = new Intl.NumberFormat('id-ID')
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function format(value: bigint, unit?: string, period?: string) {
  if (unit === 'IDR') return currency.format(value)
  if (unit === 'unit') return `${integer.format(value)} unit`
  const digits = unit === 'kg' ? 6 : 2
  const scale = 10n ** BigInt(digits)
  const fraction = (value % scale).toString().padStart(digits, '0').replace(/0+$/, '')
  const number = integer.format(value / scale) + (fraction ? `,${fraction}` : '')
  return `${number} ${unit === 'periode' ? period : unit}`
}

export function BatchFourForm({ slug }: { slug: BatchSlug }) {
  const tool: BatchTool = batchFourTools[slug]
  const [result, setResult] = useState<BatchFourResult>()
  const errors = result?.success === false ? result.errors : undefined
  const values = result?.success ? result.values : undefined
  const outputs = values ? tool.outputFields.flatMap(field => {
    const value = values[field.id]
    if (value === undefined) return []
    return [{ label: field.label, value: value === null ? 'Belum kembali dalam horizon yang diisi' : format(value, field.unit, result?.success ? result.period : undefined) }]
  }) : []
  const degenerate = result?.success && result.status === 'degenerate'
  const [primary, ...details] = degenerate
    ? [{ label: 'Hasil model EOQ', value: 'Kasus degenerat: optimum kontinu nol' }]
    : outputs
  const assumptions = result?.success
    ? [result.warning, degenerate ? 'Permintaan atau biaya pesan nol. Model ini tidak memberikan ukuran pesanan fisik.' : tool.assumptions].filter(Boolean).join(' ')
    : undefined

  return <div className={layout.grid}>
    <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
    <ResultPanel result={primary} details={details} assumptions={assumptions}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
