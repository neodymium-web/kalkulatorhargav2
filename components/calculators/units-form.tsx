'use client'
import { useId, useState, type FormEvent } from 'react'
import { unitsTools, type UnitsSlug, type UnitsTool } from '../../lib/units-scale/tools'
import type { UnitsResult } from '../../lib/units-scale/engines'
import { formatExact, formatUnits } from '../../lib/units-scale/format'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Button, Input, Select } from '../ui/controls'
import styles from '../ui/calculator.module.css'
export function UnitsForm({ slug }: { slug: UnitsSlug }) {
  const tool: UnitsTool = unitsTools[slug]
  const id = useId(), hint = `${id}-hint`
  const [input, setInput] = useState<Record<string, string>>({})
  const [result, setResult] = useState<UnitsResult>()
  const errors = result?.success === false ? result.errors : undefined
  const invalidFields = errors ? tool.inputFields.filter(f => errors[f.id]?.length).map(f => ({ id: `${id}-${f.id}`, label: f.label })) : undefined
  function edit(field: string, value: string) {
    setResult(undefined)
    setInput(previous => field === 'mode' ? { mode: value } : { ...previous, [field]: value })
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setResult(tool.engine(input)) }
  const details = result?.success ? [
    { label: 'Nilai eksak dalam satuan tujuan', value: formatExact(result.exact, result.unit) },
    { label: `Basis ${result.baseUnit}`, value: formatUnits(result.baseValue, result.digits, result.baseUnit, result.baseTiny) },
    ...(result.scale !== undefined ? [{ label: 'Rasio panjang gambar : nyata', value: `1:${result.scale}` }] : []),
    ...(result.elapsed !== undefined ? [{ label: 'Durasi elapsed dalam detik', value: formatUnits(result.elapsed, 6, 's') }] : []),
  ] : []
  const canSwap = slug !== 'kecepatan-rata-rata'
  return <div className={styles.grid}>
    <CalculatorForm title="Data perhitungan" hint={tool.hint} hintId={hint} submitLabel="Hitung" invalidFields={invalidFields} onSubmit={submit}>
      {tool.inputFields.map(field => {
        const props = { id: `${id}-${field.id}`, name: field.id, label: field.label, 'aria-describedby': hint, error: errors?.[field.id]?.[0], value: input[field.id] ?? '', onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => edit(field.id, event.target.value) }
        return field.options ? <Select key={field.id} {...props}>
          <option value="" disabled>Pilih {field.label.toLocaleLowerCase('id')}</option>
          {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select> : <Input key={field.id} {...props} type="text" inputMode={field.signed ? 'text' : field.type === 'integer' ? 'numeric' : 'decimal'} />
      })}
      {canSwap && <><Button variant="secondary" disabled={!input.from || !input.to} onClick={() => {
        setResult(undefined); setInput(previous => ({ ...previous, from: previous.to, to: previous.from }))
      }}>Tukar satuan (nilai tetap)</Button><p className={styles.hint}>Pilih satuan asal dan tujuan untuk menukar keduanya. Angka input tetap; hasil tampilan tidak disalin ke input.</p></>}
    </CalculatorForm>
    <ResultPanel result={result?.success ? { label: result.label, value: formatUnits(result.converted, result.digits, result.unit, result.tiny) } : undefined}
      details={details} assumptions={result?.success ? result.notes.join(' ') : undefined} message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
