'use client'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { BatchField } from '../../lib/batch-four/tools'
import { CalculatorForm } from './calculator'
import { Button, Input, Select } from './controls'
import styles from './structured-form.module.css'
export type StructuredTool = {
  inputFields: readonly BatchField[]
  rowFields?: readonly BatchField[]
  rows?: string
  rowConfig?: { name: string; label: string; startIndex?: number; max: number; limitLabel?: string }
  hint: string
}
type Control = BatchField & { name: string; htmlId: string }

function Field({ field, error, hintId }: { field: Control; error?: string; hintId: string }) {
  const props = {
    id: field.htmlId,
    name: field.name,
    label: field.unit === 'IDR' ? `${field.label} (Rp)` : field.label,
    'aria-describedby': hintId,
    error,
  }
  return field.options ? (
    <Select {...props} defaultValue="">
      <option value="" disabled>
        Pilih {field.label.toLocaleLowerCase('id')}
      </option>
      {field.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  ) : (
    <Input {...props} inputMode={field.signed ? 'text' : field.type === 'decimal' ? 'decimal' : 'numeric'} />
  )
}

export function StructuredForm({
  tool,
  errors,
  onResult,
  onChange,
}: {
  tool: StructuredTool
  errors?: Record<string, string[] | undefined>
  onResult: (input: unknown) => void
  onChange: () => void
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const [rows, setRows] = useState([0])
  const nextRowId = useRef(1)
  const focusTarget = useRef<string | null>(null)
  const isFood = tool.rows !== 'flows'
  const rowName = tool.rowConfig?.name ?? (isFood ? 'bahan' : 'periode')
  const rowLabel = tool.rowConfig?.label ?? (isFood ? 'Bahan' : 'Periode')
  const rowStart = tool.rowConfig?.startIndex ?? 1
  const rowLimit = tool.rowConfig?.max ?? (isFood ? 100 : 120)
  const controls = tool.inputFields.map((field) => ({
    ...field,
    summaryLabel: field.label,
    name: field.id,
    htmlId: `${id}-${field.id}`,
  }))
  const rowControls = rows.map((rowId, index) =>
    (tool.rowFields ?? []).map((field) => ({
      ...field,
      summaryLabel: `${field.label}, ${rowName} ${index + rowStart}`,
      name: `${tool.rows}.${index}.${field.id}`,
      htmlId: `${id}-row-${rowId}-${field.id}`,
    })),
  )
  const invalidFields = errors
    ? [...controls, ...rowControls.flat()].flatMap((field) =>
        errors[field.name]?.length ? [{ id: field.htmlId, label: field.summaryLabel }] : [],
      )
    : undefined
  const addId = `${id}-add`

  useEffect(() => {
    if (!focusTarget.current) return
    document.getElementById(focusTarget.current)?.focus()
    focusTarget.current = null
  }, [rows])

  function addRow() {
    const rowId = nextRowId.current++
    focusTarget.current = `${id}-row-${rowId}-${tool.rowFields![0].id}`
    onChange()
    setRows([...rows, rowId])
  }

  function removeRow(index: number) {
    const remaining = rows.filter((_, rowIndex) => rowIndex !== index)
    const next = remaining[Math.min(index, remaining.length - 1)]
    focusTarget.current = next === undefined ? addId : `${id}-row-${next}-${tool.rowFields![0].id}`
    onChange()
    setRows(remaining)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input: Record<string, unknown> = Object.fromEntries(
      controls.map((field) => [field.id, data.get(field.name)]),
    )
    if (tool.rows) {
      input[tool.rows] = rowControls.map((fields) =>
        Object.fromEntries(fields.map((field) => [field.id, data.get(field.name)])),
      )
    }
    onResult(input)
  }

  return (
    <CalculatorForm
      title="Data perhitungan"
      hint={tool.hint}
      hintId={hintId}
      submitLabel="Hitung"
      invalidFields={invalidFields}
      onSubmit={submit}
      onChange={() => onChange()}
    >
      {controls.map((field) => (
        <Field key={field.id} field={field} error={errors?.[field.name]?.[0]} hintId={hintId} />
      ))}
      {tool.rows && (
        <>
          {rowControls.map((fields, index) => (
            <fieldset key={rows[index]} className={styles.row}>
              <legend>
                {rowLabel} {index + rowStart}
              </legend>
              <div className={styles.rowFields}>
                {fields.map((field) => (
                  <Field key={field.id} field={field} error={errors?.[field.name]?.[0]} hintId={hintId} />
                ))}
              </div>
              <Button
                className={styles.remove}
                variant="text"
                disabled={rows.length === 1}
                onClick={() => removeRow(index)}
              >
                Hapus {rowName} {index + rowStart}
              </Button>
            </fieldset>
          ))}
          <Button id={addId} variant="secondary" disabled={rows.length >= rowLimit} onClick={addRow}>
            Tambah {rowName}
          </Button>
          <p className={styles.hint}>
            Maksimal {rowLimit} {tool.rowConfig?.limitLabel ?? rowName}.
          </p>
        </>
      )}
    </CalculatorForm>
  )
}
