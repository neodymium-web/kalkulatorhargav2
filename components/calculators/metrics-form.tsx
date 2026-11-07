'use client'

import { useId, useState, type FormEvent } from 'react'
import type { MetricResult } from '../../lib/marketplace-metrics/engines'
import { metricTools, type MetricSlug, type MetricTool } from '../../lib/marketplace-metrics/tools'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Input } from '../ui/controls'
import styles from '../ui/calculator.module.css'

const integer = new Intl.NumberFormat('id-ID')
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function format(value: bigint, unit: 'IDR-whole' | 'IDR' | '%' | 'x') {
  if (unit === 'IDR-whole') return currency.format(value)
  const magnitude = value < 0n ? -value : value
  const number = `${value < 0n ? '-' : ''}${integer.format(magnitude / 100n)},${(magnitude % 100n).toString().padStart(2, '0')}`
  return unit === 'IDR' ? `Rp ${number}` : `${number}${unit}`
}

export function MetricsForm({ slug }: { slug: MetricSlug }) {
  const id = useId()
  const hintId = `${id}-hint`
  const tool: MetricTool = metricTools[slug]
  const [result, setResult] = useState<MetricResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = tool.inputFields.map(field => ({
    ...field, htmlId: `${id}-${field.id}`, fullLabel: field.unit === 'IDR' ? `${field.label} (Rp)` : field.label,
  }))
  const invalidFields = errors ? fields.flatMap(field =>
    errors[field.id]?.length ? [{ id: field.htmlId, label: field.fullLabel }] : [],
  ) : undefined

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(tool.engine(Object.fromEntries(new FormData(event.currentTarget))))
  }

  const [primary, ...details] = result?.success ? tool.outputFields.map(field => ({
    label: field.label,
    value: result.values[field.id] === null
      ? result.status === 'no-finite-roas' ? 'Tidak ada ROAS impas berhingga' : 'ACOS tidak terdefinisi'
      : field.id === 'margin' && result.values.contribution! > 0n && result.values.margin === 0n ? '<0,01%' : format(result.values[field.id]!, field.unit),
  })) : []
  const explanation = result?.success && result.status === 'no-finite-roas'
    ? 'Kontribusi sebelum iklan nol atau negatif. Perbaiki harga atau biaya variabel agar margin kontribusi positif.'
    : result?.success && result.status === 'undefined-acos'
      ? 'Pendapatan teratribusi nol, sehingga persentase biaya iklan tidak dapat dihitung.'
      : tool.assumptions

  return <div className={styles.grid}>
    <CalculatorForm title="Data perhitungan" hint={tool.hint} hintId={hintId} submitLabel="Hitung"
      invalidFields={invalidFields} onSubmit={submit} onChange={() => setResult(undefined)}>
      {fields.map(field => <Input key={field.id} id={field.htmlId} name={field.id} label={field.fullLabel}
        inputMode="numeric" aria-describedby={hintId} error={errors?.[field.id]?.[0]} />)}
    </CalculatorForm>
    <ResultPanel result={primary} details={details} assumptions={primary ? explanation : undefined}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
