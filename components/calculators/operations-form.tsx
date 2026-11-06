'use client'

import { useId, useState, type FormEvent } from 'react'
import type { OperationResult } from '../../lib/operations/engines'
import { operationTools, type OperationSlug, type OperationTool } from '../../lib/operations/tools'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Input } from '../ui/controls'
import styles from '../ui/calculator.module.css'

const integer = new Intl.NumberFormat('id-ID')
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function format(value: bigint, unit?: string, selectedUnit?: string) {
  if (unit === 'IDR') return rupiah.format(value)
  const digits = unit === '%' ? 2 : 3
  const scale = 10n ** BigInt(digits)
  const fraction = (value % scale).toString().padStart(digits, '0').replace(/0+$/, '')
  const number = integer.format(value / scale) + (fraction ? `,${fraction}` : '')
  return unit === '%' ? `${number}%` : `${number} ${selectedUnit}`
}

export function OperationsForm({ slug }: { slug: OperationSlug }) {
  const id = useId()
  const hintId = `${id}-hint`
  const tool: OperationTool = operationTools[slug]
  const [result, setResult] = useState<OperationResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = tool.inputFields.map(field => ({
    ...field,
    htmlId: `${id}-${field.id}`,
    fullLabel: field.unit === 'IDR' ? `${field.label} (Rp)` : field.label,
  }))
  const invalidFields = errors ? fields.flatMap(field =>
    errors[field.id]?.length ? [{ id: field.htmlId, label: field.fullLabel }] : [],
  ) : undefined

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(tool.engine(Object.fromEntries(new FormData(event.currentTarget))))
  }

  const [primary, ...details] = result?.success ? tool.outputFields.map(field => ({
    label: field.label, value: format(result.values[field.id], field.unit, result.unit),
  })) : []
  const assumptions = result?.success ? [result.warning, tool.assumption].filter(Boolean).join(' ') : undefined

  return <div className={styles.grid}>
    <CalculatorForm title="Data perhitungan" hint={tool.hint} hintId={hintId} submitLabel="Hitung"
      invalidFields={invalidFields} onSubmit={submit} onChange={() => setResult(undefined)}>
      {fields.map(field => <Input key={field.id} id={field.htmlId} name={field.id} label={field.fullLabel}
        type={field.type === 'date' ? 'date' : 'text'}
        inputMode={slug === 'arus-kas' && field.id === 'opening' ? 'text'
          : field.type === 'decimal' ? 'decimal' : field.type === 'integer' ? 'numeric' : undefined}
        aria-describedby={hintId} error={errors?.[field.id]?.[0]} />)}
    </CalculatorForm>
    <ResultPanel result={primary} details={details} assumptions={assumptions}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
