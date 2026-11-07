'use client'
import { useId, useState } from 'react'
import { economicsTools, type EconomicsSlug, type EconomicsTool } from '../../lib/marketplace-economics/tools'
import type { EconomicsResult } from '../../lib/marketplace-economics/engines'
import { formatEntry, cashText } from '../../lib/marketplace-economics/format'
import { StructuredForm } from '../ui/structured-form'
import { ResultPanel } from '../ui/calculator'
import styles from '../ui/calculator.module.css'
import table from '../ui/loan-schedule.module.css'
export function EconomicsForm({ slug }: { slug: EconomicsSlug }) {
  const tool: EconomicsTool = economicsTools[slug], caption = useId(), hint = useId()
  const [result, setResult] = useState<EconomicsResult>()
  const errors = result?.success === false ? result.errors : undefined
  const output = result?.success ? result : undefined
  const primary = output ? { label: output.primary.label, value: 'status' in output.primary ? output.primary.status : formatEntry(output.primary.value, output.primary.kind) } : undefined
  return <>
    <div className={styles.grid}>
      <StructuredForm tool={tool} errors={errors} onResult={input => setResult(tool.engine(input))} onChange={() => setResult(undefined)} />
      <ResultPanel result={primary} details={output?.details.map(d => ({ label: d.label, value: formatEntry(d.value, d.kind) }))} assumptions={output?.notes.join(' ')} message={errors ? 'Periksa kolom yang ditandai.' : 'Isi semua kolom untuk melihat hasil.'} />
    </div>
    {output?.channels && <section className={table.schedule}>
      <p className={table.hint} id={hint}>Urutan input tetap. Terbaik menurut hasil setelah HPP eksak sebelum pembulatan; semua seri ditandai. HPP bersama membuat ranking payout setara. Cash sama belum tentu seri. Geser tabel pada layar sempit. Payout cash dibulatkan sekali; hasil cash dikurangi HPP integer.</p>
      <div className={table.scroll} role="region" aria-labelledby={caption} aria-describedby={hint} tabIndex={0}><table>
        <caption id={caption}>Perbandingan kanal manual per pesanan</caption><thead><tr>{['Kanal', 'Basis', 'Komisi eksak', 'Total biaya eksak', 'Payout eksak', 'Hasil setelah HPP eksak', 'Payout cash', 'Hasil setelah HPP cash', 'Status'].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead>
        <tbody>{output.channels.map(c => <tr key={c.id}><th scope="row">{c.label}</th><td>{c.basis === 'gross' ? 'Bruto' : 'Setelah diskon'}</td><td>{formatEntry(c.commission)}</td><td>{formatEntry(c.fees)}</td><td>{formatEntry(c.payout)}</td><td>{formatEntry(c.profit)}</td><td>{cashText(c.payoutCash)}</td><td>{cashText(c.profitCash)}</td><td>{c.best ? output.channels!.filter(x => x.best).length > 1 ? 'Terbaik (seri)' : 'Terbaik' : 'Lebih rendah'}</td></tr>)}</tbody>
      </table></div>
    </section>}
    {output?.items && <section className={table.schedule}>
      <p className={table.hint} id={hint}>HPP integer seluruh isi. Label duplikat tetap dihitung; diskon dan fulfillment hanya pada tingkat pesanan. Geser tabel pada layar sempit.</p>
      <div className={table.scroll} role="region" aria-labelledby={caption} aria-describedby={hint} tabIndex={0}><table><caption id={caption}>HPP isi bundel per pesanan</caption><thead><tr><th scope="col">Produk</th><th scope="col">HPP unit</th><th scope="col">Jumlah</th><th scope="col">Total HPP</th></tr></thead><tbody>{output.items.map(i => <tr key={i.id}><th scope="row">{i.label}</th><td>{cashText(i.cost)}</td><td>{i.quantity.toString()}</td><td>{cashText(i.total)}</td></tr>)}</tbody></table></div>
    </section>}
  </>
}
