'use client'

import { useId, useState, type FormEvent } from 'react'
import type { BusinessResult } from '../../lib/business/engines'
import { businessTools, type BusinessSlug } from '../../lib/business/tools'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Input } from '../ui/controls'
import styles from '../ui/calculator.module.css'

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const integer = new Intl.NumberFormat('id-ID')

function formatValue(value: bigint, unit: 'IDR' | '%' | 'unit') {
  if (unit === 'IDR') return currency.format(value)
  if (unit === 'unit') return `${integer.format(value)} unit`

  const magnitude = value < 0n ? -value : value
  const fraction = (magnitude % 100n).toString().padStart(2, '0').replace(/0+$/, '')
  return `${value < 0n ? '-' : ''}${integer.format(magnitude / 100n)}${fraction ? `,${fraction}` : ''}%`
}

const assumptions: Record<BusinessSlug, string> = {
  'harga-jual': 'Harga minimum dibulatkan ke atas ke rupiah utuh. Biaya mengikuti HPP yang Anda masukkan.',
  'margin-laba': 'Margin memakai harga jual sebagai pembagi. Hasil mengikuti biaya yang Anda masukkan.',
  markup: 'Markup memakai biaya sebagai pembagi. Selisih mengikuti harga dan biaya yang Anda masukkan.',
  bep: 'Harga jual dan biaya variabel per unit dianggap tetap. Biaya tetap berlaku untuk periode yang sama.',
  'target-laba': 'Target dinyatakan dalam unit terjual. Harga dan biaya per unit dianggap tetap dalam periode yang sama.',
}

export function BusinessForm({ slug }: { slug: BusinessSlug }) {
  const id = useId()
  const hintId = `${id}-hint`
  const tool = businessTools[slug]
  const [result, setResult] = useState<BusinessResult>()
  const errors = result?.success === false ? result.errors : undefined
  const fields = tool.inputFields.map(field => ({
    ...field,
    htmlId: `${id}-${field.id}`,
    fullLabel: `${field.label} (${field.unit === 'IDR' ? 'Rp' : field.unit})`,
  }))
  const invalidFields = errors ? fields.flatMap(field =>
    errors[field.id]?.length ? [{ id: field.htmlId, label: field.fullLabel }] : [],
  ) : undefined

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(tool.engine(Object.fromEntries(new FormData(event.currentTarget))))
  }

  const values = result?.success ? result.values : undefined
  const [primary, ...details] = values ? tool.outputFields.flatMap(field => {
    const value = values[field.id]
    return value === null ? [] : [{ label: field.label, value: formatValue(value, field.unit) }]
  }) : []
  const unreachable = values?.units === null
  const explanation = unreachable
    ? 'Target tidak dapat dicapai karena kontribusi per unit nol atau negatif. Naikkan harga jual atau kurangi biaya variabel.'
    : assumptions[slug]

  return <div className={styles.grid}>
    <CalculatorForm title="Data perhitungan" hint="Masukkan rupiah bulat hingga 13 digit tanpa pemisah."
      hintId={hintId} submitLabel="Hitung" invalidFields={invalidFields}
      onSubmit={submit} onChange={() => setResult(undefined)}>
      {fields.map(field => <Input key={field.id} id={field.htmlId} name={field.id} label={field.fullLabel}
        inputMode={field.unit === '%' ? 'decimal' : 'numeric'}
        hint={field.unit === '%' ? 'Masukkan 0 hingga kurang dari 100, dengan maksimal dua desimal. Contoh 25,5.' : undefined}
        aria-describedby={field.unit === 'IDR' ? hintId : undefined} error={errors?.[field.id]?.[0]} />)}
    </CalculatorForm>
    <ResultPanel result={primary} details={details} assumptions={primary ? explanation : undefined}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
