'use client'

import { useId, useState, type FormEvent } from 'react'
import type { StockServiceResult } from '../../lib/stock-services/engines'
import { stockServiceTools, type StockServiceSlug, type StockServiceTool } from '../../lib/stock-services/tools'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Input } from '../ui/controls'
import styles from '../ui/calculator.module.css'

const integer = new Intl.NumberFormat('id-ID')
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function format(value: bigint, unit?: string) {
  if (unit === 'IDR') return currency.format(value)
  if (unit === 'unit') return `${integer.format(value)} unit`
  const fraction = (value % 100n).toString().padStart(2, '0').replace(/0+$/, '')
  const number = integer.format(value / 100n) + (fraction ? `,${fraction}` : '')
  return unit === 'IDR-decimal' ? `Rp ${number}` : `${number} ${unit}`
}

export function StockServicesForm({ slug }: { slug: StockServiceSlug }) {
  const id = useId()
  const hintId = `${id}-hint`
  const tool: StockServiceTool = stockServiceTools[slug]
  const [result, setResult] = useState<StockServiceResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = tool.inputFields.map(field => ({
    ...field, htmlId: `${id}-${field.id}`,
    fullLabel: field.unit === 'IDR' ? `${field.label} (Rp)` : field.label,
  }))
  const invalidFields = errors ? fields.flatMap(field =>
    errors[field.id]?.length ? [{ id: field.htmlId, label: field.fullLabel }] : [],
  ) : undefined

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(tool.engine(Object.fromEntries(new FormData(event.currentTarget))))
  }

  const outputs = result?.success ? tool.outputFields.map(field => ({
    label: field.label,
    value: result.values[field.id] === null
      ? field.id === 'months' ? 'Tidak ada burn bersih' : 'Tidak terdefinisi saat harga pokok penjualan nol'
      : format(result.values[field.id]!, field.unit),
  })) : []
  const [primary, ...details] = outputs
  const explanation = result?.success && result.status === 'no-burn'
    ? 'Tidak terbatas dalam model konstan. Keberlanjutan usaha bergantung pada arus kas dan kewajiban yang sebenarnya.'
    : tool.assumption

  return <div className={styles.grid}>
    <CalculatorForm title="Data perhitungan" hint={tool.hint} hintId={hintId} submitLabel="Hitung"
      invalidFields={invalidFields} onSubmit={submit} onChange={() => setResult(undefined)}>
      {fields.map(field => <Input key={field.id} id={field.htmlId} name={field.id} label={field.fullLabel}
        type={field.control === 'month' ? 'month' : field.type === 'date' ? 'date' : 'text'}
        inputMode={field.type === 'decimal' ? 'decimal' : field.type === 'integer' ? 'numeric' : undefined}
        aria-describedby={hintId} error={errors?.[field.id]?.[0]} />)}
    </CalculatorForm>
    <ResultPanel result={primary} details={details} assumptions={primary ? explanation : undefined}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
