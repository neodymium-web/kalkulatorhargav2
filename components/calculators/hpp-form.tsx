'use client'

import { useId, useState, type FormEvent } from 'react'
import { calculateHpp, costs } from '../../lib/hpp'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Input } from '../ui/controls'
import styles from '../ui/calculator.module.css'

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const fields = [...costs, ['units', 'Jumlah unit']] as const

export function HppForm() {
  const id = useId()
  const hintId = `${id}-hint`
  const [result, setResult] = useState<ReturnType<typeof calculateHpp>>()
  const errors = result?.success === false ? result.errors : undefined
  const invalidFields = errors ? fields.flatMap(([name, label]) =>
    errors[name]?.length ? [{ id: `${id}-${name}`, label }] : [],
  ) : undefined

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(calculateHpp(Object.fromEntries(new FormData(event.currentTarget))))
  }

  return <div className={styles.grid}>
    <CalculatorForm title="Biaya satu kali produksi"
      hint="Masukkan rupiah bulat tanpa titik atau koma. Isi 0 jika biaya tidak ada."
      hintId={hintId} submitLabel="Hitung HPP" invalidFields={invalidFields}
      onSubmit={submit} onChange={() => setResult(undefined)}>
      {fields.map(([name, label]) => <Input key={name} id={`${id}-${name}`} name={name}
        label={name === 'units' ? label : `${label} (Rp)`} inputMode="numeric"
        aria-describedby={name === 'units' ? undefined : hintId} error={errors?.[name]?.[0]} />)}
    </CalculatorForm>
    {result?.success ? <ResultPanel
      result={{ label: 'HPP per unit', value: currency.format(result.perUnit) }}
      details={[{ label: 'Total biaya produksi', value: currency.format(result.total) }]}
      assumptions="Perhitungan memakai satu batch dengan unit sejenis. HPP per unit dibulatkan ke rupiah terdekat."
    /> : <ResultPanel message={result ? 'Periksa kolom yang ditandai.' : 'Isi biaya dan jumlah unit untuk melihat hasil.'} />}
  </div>
}
