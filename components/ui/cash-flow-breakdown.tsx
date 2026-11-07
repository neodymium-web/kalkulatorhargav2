'use client'
import { useId } from 'react'
import type { CashFlowRow, Precision } from '../../lib/valuation/engines'
import { formatValuation } from '../../lib/valuation/format'
import styles from './loan-schedule.module.css'

export function CashFlowBreakdown({
  rows,
  total,
  nominal,
  precision,
}: {
  rows: readonly CashFlowRow[]
  total: bigint
  nominal: bigint
  precision?: Precision
}) {
  const id = useId(),
    hint = useId()
  return (
    <details className={styles.schedule}>
      <summary>Lihat rincian nilai kini {rows.length} arus kas</summary>
      <p id={hint} className={styles.hint}>
        Tahun 0 adalah hari ini. PV baris dibulatkan untuk tampilan; total NPV dihitung dari pecahan asli,
        sehingga jumlah angka tampilan bisa berbeda. Geser tabel pada layar sempit.
      </p>
      <div className={styles.scroll} role="region" aria-labelledby={id} aria-describedby={hint} tabIndex={0}>
        <table>
          <caption id={id}>Rincian arus kas dan nilai kini</caption>
          <thead>
            <tr>
              <th scope="col">Tahun</th>
              <th scope="col">Arus kas neto</th>
              <th scope="col">PV baris (dibulatkan)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period}>
                <th scope="row">{row.period === 0 ? '0 (hari ini)' : row.period}</th>
                <td>{formatValuation(row.flow * 100n)}</td>
                <td>{formatValuation(row.present, 'IDR-cents', row.precision)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td>{formatValuation(nominal)}</td>
              <td>{formatValuation(total, 'IDR-cents', precision)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  )
}
