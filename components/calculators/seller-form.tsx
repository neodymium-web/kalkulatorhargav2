'use client'
import { useState } from 'react'
import { sellerTools, type SellerSlug, type SellerTool } from '../../lib/seller-costs/tools'
import type { SellerResult } from '../../lib/seller-costs/engines'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import layout from '../ui/calculator.module.css'
const integer = new Intl.NumberFormat('id-ID')
function format(value: bigint, unit: string, tiny: boolean) {
  if (unit === 'attempts') {
    const fraction = (value % 10000n).toString().padStart(4, '0').replace(/0+$/, '')
    return `${integer.format(value / 10000n)}${fraction ? ',' + fraction : ''} percobaan`
  }
  return tiny ? '<Rp0,01' : `Rp${integer.format(value / 100n)},${(value % 100n).toString().padStart(2, '0')}`
}
export function SellerForm({ slug }: { slug: SellerSlug }) {
  const tool: SellerTool = sellerTools[slug]
  const [result, setResult] = useState<SellerResult>()
  const errors = result?.success === false ? result.errors : undefined
  const outputs = result?.success
    ? tool.outputFields.map((field) => ({
        label: field.label,
        value: format(result.values[field.id], field.unit, result.tiny?.includes(field.id) ?? false),
      }))
    : []
  const [primary, ...details] = outputs
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
        assumptions={result?.success ? tool.assumptions : undefined}
        message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'}
      />
    </div>
  )
}
