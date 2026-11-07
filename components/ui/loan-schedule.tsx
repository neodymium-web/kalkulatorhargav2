'use client'

import { useId } from 'react'
import type { LoanRow } from '../../lib/finance/engines'
import { rupiah } from '../../lib/finance/format'
import styles from './loan-schedule.module.css'

export function LoanSchedule({
  rows,
  total,
  interest,
}: {
  rows: readonly LoanRow[]
  total: bigint
  interest: bigint
}) {
  const hintId = useId()
  const captionId = useId()
  return (
    <details className={styles.schedule}>
      <summary>Lihat jadwal {rows.length} bulan</summary>
      <p id={hintId} className={styles.hint}>
        Semua angka dalam rupiah utuh. Pada layar sempit, geser tabel untuk melihat seluruh kolom. Baris
        setelah pelunasan anuitas bernilai nol.
      </p>
      <div
        className={styles.scroll}
        role="region"
        aria-labelledby={captionId}
        aria-describedby={hintId}
        tabIndex={0}
      >
        <table>
          <caption id={captionId}>Jadwal cicilan dan sisa pokok</caption>
          <thead>
            <tr>
              <th scope="col">Bulan</th>
              <th scope="col">Pembayaran</th>
              <th scope="col">Pokok</th>
              <th scope="col">Bunga</th>
              <th scope="col">Sisa pokok</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td>{rupiah(row.payment)}</td>
                <td>{rupiah(row.principal)}</td>
                <td>{rupiah(row.interest)}</td>
                <td>{rupiah(row.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td>{rupiah(total)}</td>
              <td>{rupiah(total - interest)}</td>
              <td>{rupiah(interest)}</td>
              <td>{rupiah(rows[rows.length - 1].balance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  )
}
