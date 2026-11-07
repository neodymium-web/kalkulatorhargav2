'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { batchFourTools, type BatchField, type BatchSlug, type BatchTool } from '../../lib/batch-four/tools'
import type { BatchFourResult } from '../../lib/batch-four/engines'
import { CalculatorForm, ResultPanel } from '../ui/calculator'
import { Button, Input, Select } from '../ui/controls'
import layout from '../ui/calculator.module.css'
import styles from './batch-four-form.module.css'

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

type Control = BatchField & { name: string; htmlId: string }

function Field({ field, error, hintId }: { field: Control; error?: string; hintId: string }) {
  const props = {
    id: field.htmlId, name: field.name,
    label: field.unit === 'IDR' ? `${field.label} (Rp)` : field.label,
    'aria-describedby': hintId, error,
  }
  return field.options ? <Select {...props} defaultValue="">
    <option value="" disabled>Pilih {field.label.toLocaleLowerCase('id')}</option>
    {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </Select> : <Input {...props} inputMode={field.signed ? 'text' : field.type === 'decimal' ? 'decimal' : 'numeric'} />
}

export function BatchFourForm({ slug }: { slug: BatchSlug }) {
  const tool: BatchTool = batchFourTools[slug]
  const id = useId()
  const hintId = `${id}-hint`
  const [result, setResult] = useState<BatchFourResult>()
  const [rows, setRows] = useState([0])
  const nextRowId = useRef(1)
  const focusTarget = useRef<string | null>(null)
  const errors = result?.success === false ? result.errors : undefined
  const controls = tool.inputFields.map(field => ({ ...field, summaryLabel: field.label, name: field.id, htmlId: `${id}-${field.id}` }))
  const rowControls = rows.map((rowId, index) => (tool.rowFields ?? []).map(field => ({
    ...field, summaryLabel: `${field.label}, ${tool.rows === 'ingredients' ? 'bahan' : 'periode'} ${index + 1}`,
    name: `${tool.rows}.${index}.${field.id}`, htmlId: `${id}-row-${rowId}-${field.id}`,
  })))
  const invalidFields = errors ? [...controls, ...rowControls.flat()].flatMap(field =>
    errors[field.name]?.length ? [{ id: field.htmlId, label: field.summaryLabel }] : [],
  ) : undefined
  const isFood = tool.rows === 'ingredients'
  const rowName = isFood ? 'bahan' : 'periode'
  const rowLimit = isFood ? 100 : 120
  const addId = `${id}-add`

  useEffect(() => {
    if (!focusTarget.current) return
    document.getElementById(focusTarget.current)?.focus()
    focusTarget.current = null
  }, [rows])

  function addRow() {
    const rowId = nextRowId.current++
    focusTarget.current = `${id}-row-${rowId}-${tool.rowFields![0].id}`
    setResult(undefined)
    setRows([...rows, rowId])
  }

  function removeRow(index: number) {
    const remaining = rows.filter((_, rowIndex) => rowIndex !== index)
    const next = remaining[Math.min(index, remaining.length - 1)]
    focusTarget.current = next === undefined ? addId : `${id}-row-${next}-${tool.rowFields![0].id}`
    setResult(undefined)
    setRows(remaining)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input: Record<string, unknown> = Object.fromEntries(controls.map(field => [field.id, data.get(field.name)]))
    if (tool.rows) {
      input[tool.rows] = rowControls.map(fields => Object.fromEntries(fields.map(field => [field.id, data.get(field.name)])))
    }
    setResult(tool.engine(input))
  }

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
    <CalculatorForm title="Data perhitungan" hint={tool.hint} hintId={hintId} submitLabel="Hitung"
      invalidFields={invalidFields} onSubmit={submit} onChange={() => setResult(undefined)}>
      {controls.map(field => <Field key={field.id} field={field} error={errors?.[field.name]?.[0]} hintId={hintId} />)}
      {tool.rows && <>
        {rowControls.map((fields, index) => <fieldset key={rows[index]} className={styles.row}>
          <legend>{isFood ? 'Bahan' : 'Periode'} {index + 1}</legend>
          <div className={styles.rowFields}>
            {fields.map(field => <Field key={field.id} field={field} error={errors?.[field.name]?.[0]} hintId={hintId} />)}
          </div>
          <Button className={styles.remove} variant="text" disabled={rows.length === 1} onClick={() => removeRow(index)}>
            Hapus {rowName} {index + 1}
          </Button>
        </fieldset>)}
        <Button id={addId} variant="secondary" disabled={rows.length >= rowLimit} onClick={addRow}>Tambah {rowName}</Button>
        <p className={styles.hint}>Maksimal {rowLimit} {rowName}.</p>
      </>}
    </CalculatorForm>
    <ResultPanel result={primary} details={details} assumptions={assumptions}
      message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
  </div>
}
