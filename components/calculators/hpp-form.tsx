'use client'

import { useState, type FormEvent } from 'react'
import { calculateHpp, costs } from '../../lib/hpp'

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const fields = [...costs, ['units', 'Jumlah unit']] as const

export function HppForm() {
  const [result, setResult] = useState<ReturnType<typeof calculateHpp>>()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(calculateHpp(Object.fromEntries(new FormData(event.currentTarget))))
  }
  return <div className="calculator">
    <form className="entry" onSubmit={submit} onChange={() => setResult(undefined)}>
      <h2>Biaya satu kali produksi</h2>
      <p id="input-hint">Masukkan rupiah bulat tanpa titik atau koma. Isi 0 jika biaya tidak ada.</p>
      {fields.map(([name, label]) => {
        const error = result?.success === false ? result.errors[name]?.[0] : undefined
        return <div className="field" key={name}>
          <label htmlFor={name}>{label}{name !== 'units' && ' (Rp)'}</label>
          <input id={name} name={name} inputMode="numeric" aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : name === 'units' ? undefined : 'input-hint'} />
          {error && <p className="error" id={`${name}-error`}>{error}</p>}
        </div>
      })}
      <button type="submit">Hitung HPP</button>
    </form>
    <section className="result" aria-labelledby="result-title">
      <h2 id="result-title">Hasil perhitungan</h2>
      <div aria-live="polite">
        {result?.success ? <dl>
          <dt>HPP per unit</dt><dd>{currency.format(result.perUnit)}</dd>
          <dt>Total biaya produksi</dt><dd>{currency.format(result.total)}</dd>
        </dl> : <p>{result ? 'Periksa kolom yang ditandai.' : 'Isi biaya dan jumlah unit untuk melihat hasil.'}</p>}
      </div>
    </section>
  </div>
}
