'use client'

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from './controls'
import styles from './calculator.module.css'

type InvalidField = { id: string; label: string }

export function CalculatorForm({ title, hint, hintId, submitLabel, invalidFields, children, ...props }:
  Pick<ComponentProps<'form'>, 'onSubmit' | 'onChange'> & {
    title: string
    hint: string
    hintId: string
    submitLabel: string
    invalidFields?: readonly InvalidField[]
    children: ReactNode
  }) {
  const titleId = useId()
  const form = useRef<HTMLFormElement>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    const first = invalidFields?.[0]
    if (!first) return
    const input = form.current?.elements.namedItem(first.id)
    if (input instanceof HTMLElement) input.focus()
  }, [invalidFields])

  const controls = <>
    <div className={styles.fields}>{children}</div>
    <Button className={styles.submit} type="submit">{submitLabel}</Button>
  </>

  return <form {...props} ref={form} aria-labelledby={titleId} className={styles.panel}>
    <h2 id={titleId}>{title}</h2>
    {invalidFields && invalidFields.length > 0 && <div className={styles.summary} role="alert">
      <strong>Periksa {invalidFields.length} kolom berikut.</strong>
      <ul role="list">{invalidFields.map(field => <li key={field.id}><a href={`#${field.id}`}>{field.label}</a></li>)}</ul>
    </div>}
    <p className={styles.hint} id={hintId}>{hint}</p>
    <noscript><p className={styles.message}>Aktifkan JavaScript untuk menghitung. Formulir dinonaktifkan agar data perhitungan tidak dikirim melalui URL.</p></noscript>
    {hydrated ? controls : <fieldset disabled aria-labelledby={titleId} className={styles.formControls}>{controls}</fieldset>}
  </form>
}

type Result = { label: string; value: string }

export function ResultPanel({ result, details = [], assumptions, message, heading = 'Hasil perhitungan' }: {
  result?: Result
  heading?: string
  details?: readonly Result[]
  assumptions?: string
  message?: string
}) {
  const titleId = useId()
  return <section className={`${styles.panel} ${styles.result}`} aria-labelledby={titleId}>
    <h2 id={titleId}>{heading}</h2>
    <div aria-live="polite" aria-atomic="true">
      {result ? <>
        <dl>
          <div className={styles.primary}><dt>{result.label}</dt><dd>{result.value}</dd></div>
          {details.map(detail => <div key={detail.label} className={styles.secondary}>
            <dt>{detail.label}</dt><dd>{detail.value}</dd>
          </div>)}
        </dl>
        {assumptions && <p className={styles.assumptions}>{assumptions}</p>}
      </> : <p className={styles.message}>{message}</p>}
    </div>
  </section>
}
