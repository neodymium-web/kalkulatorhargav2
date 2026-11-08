import { z } from 'zod'
import { fraction as R, add, subtract as sub, multiply as mul, divide, type Rational } from '../utilities-materials/rational'
import { cash, compare, type Entry } from '../marketplace-economics/engines'
const money = () => z.string().trim().regex(/^\d{1,13}$/, { message: 'Isi rupiah integer nonnegatif hingga 13 digit tanpa pemisah.', abort: true }).transform(BigInt)
const quantity = z.string().trim().regex(/^\d{1,5}$/, { abort: true }).transform(BigInt).refine(v => v >= 1n && v <= 10000n, 'Jumlah harus 1–10000.')
const rate = z.string().trim().regex(/^\d{1,3}([.,]\d{1,6})?$/, { message: 'Isi persen 0–100, maksimal 6 desimal.', abort: true }).transform(v => { const [a, b = ''] = v.replace(',', '.').split('.'); return BigInt(a) * 1000000n + BigInt(b.padEnd(6, '0')) }).refine(v => v <= 100000000n, 'Persen maksimal 100.').transform(v => R(v, 100000000n))
const choice = <T extends readonly [string, ...string[]]>(values: T) => z.preprocess(v => v === null || v === undefined || v === '' ? 'unknown' : v, z.enum(values))
const bound = choice(['none', 'enabled', 'unknown'])
export const feeSchema = z.object({
  label: z.string().trim().min(1, 'Isi nama biaya.').max(60, 'Maksimal 60 karakter.'),
  type: choice(['percent', 'fixed', 'unknown']), basis: choice(['gross', 'net', 'custom', 'unknown']),
  rate: rate.optional(), custom: money().optional(), amount: money().optional(), scope: choice(['order', 'unit', 'unknown']),
  minimumMode: bound, capMode: bound, minimum: money().optional(), cap: money().optional(),
}).superRefine((v, ctx) => {
  const required = (key: 'rate' | 'custom' | 'amount' | 'minimum' | 'cap') => { if (v[key] === undefined) ctx.addIssue({ code: 'custom', path: [key], message: 'Isi nilai yang berlaku, termasuk 0 bila memang nol.' }) }
  if (v.type === 'percent') { required('rate'); if (v.basis === 'custom') required('custom') }
  if (v.type === 'fixed') required('amount')
  if (v.minimumMode === 'enabled') required('minimum')
  if (v.capMode === 'enabled') required('cap')
  if (v.minimumMode === 'enabled' && v.capMode === 'enabled' && v.minimum !== undefined && v.cap !== undefined && v.minimum > v.cap) ctx.addIssue({ code: 'custom', path: ['cap'], message: 'Maksimum tidak boleh lebih kecil dari minimum.' })
})
export const settlementSchema = z.object({
  price: money(), quantity, discount: money(), cost: money(), buyerShipping: money(), shipping: money(), reimbursement: money(), receipts: money(), other: money(),
  shippingFlow: choice(['excluded', 'credited', 'unknown']), coverage: choice(['ordinary', 'unsupported', 'unknown']), confirmation: choice(['complete', 'unknown']),
  fees: z.array(feeSchema).max(12, 'Maksimal 12 biaya.'),
}).superRefine((v, ctx) => {
  if (v.discount > v.price * v.quantity) ctx.addIssue({ code: 'custom', path: ['discount'], message: 'Diskon seller per pesanan melebihi bruto.' })
  const seen = new Set<string>(); v.fees.forEach((f, i) => { const label = f.label.normalize('NFKC').toLocaleLowerCase('id'); if (seen.has(label)) ctx.addIssue({ code: 'custom', path: ['fees', i, 'label'], message: 'Nama biaya harus unik.' }); seen.add(label) })
})
export type FeeLine = { label: string; basis: string; raw: Rational; minimum: bigint | undefined; cap: bigint | undefined; value: Rational }
export type SettlementLedger = { gross: Rational; sales: Rational; receipts: Rational; fees: FeeLine[]; feeTotal: Rational; shipping: Rational; other: Rational; payout: Rational; payoutCash: bigint; adjustment: Rational; cost: Rational; profit: Rational; profitCash: bigint }
export type SettlementResult = { success: false; errors: Record<string, string[]> } | { success: true; status: string; details: Entry[]; ledger?: SettlementLedger }
export function calculatePlatformSettlement(input: unknown): SettlementResult {
  const p = settlementSchema.safeParse(input)
  if (!p.success) { const errors: Record<string, string[]> = {}; for (const i of p.error.issues) (errors[i.path.join('.')] ??= []).push(i.message); return { success: false, errors } }
  const v = p.data
  const unknownFee = v.fees.some(f => f.type === 'unknown' || (f.type === 'percent' && f.basis === 'unknown') || (f.type === 'fixed' && f.scope === 'unknown') || f.minimumMode === 'unknown' || f.capMode === 'unknown')
  if (v.confirmation !== 'complete' || v.coverage !== 'ordinary' || v.shippingFlow === 'unknown' || unknownFee) return { success: true, status: 'Belum dapat dihitung: data atau cakupan belum lengkap', details: [] }
  const gross = R(v.price * v.quantity), sales = sub(gross, R(v.discount))
  const fees = v.fees.map((f): FeeLine => {
    const base = f.basis === 'gross' ? gross : f.basis === 'net' ? sales : R(f.custom ?? 0n)
    const raw = f.type === 'percent' ? mul(base, f.rate!) : R(f.amount! * (f.scope === 'unit' ? v.quantity : 1n))
    const minimum = f.minimumMode === 'enabled' ? f.minimum : undefined, cap = f.capMode === 'enabled' ? f.cap : undefined
    let value = raw
    if (minimum !== undefined && compare(value, R(minimum)) < 0n) value = R(minimum)
    if (cap !== undefined && compare(value, R(cap)) > 0n) value = R(cap)
    return { label: f.label, basis: f.type === 'fixed' ? `Tetap per ${f.scope === 'unit' ? 'unit × jumlah' : 'pesanan'}` : `${f.basis === 'gross' ? 'Bruto' : f.basis === 'net' ? 'Setelah diskon seller' : 'Custom'}: ${base.n}/${base.d} Rp`, raw, minimum, cap, value }
  })
  const feeTotal = fees.reduce((sum, f) => add(sum, f.value), R(0n)), receipts = R((v.shippingFlow === 'credited' ? v.buyerShipping : 0n) + v.reimbursement + v.receipts)
  const payout = sub(sub(sub(add(sales, receipts), feeTotal), R(v.shipping)), R(v.other)), payoutCash = cash(payout), cost = R(v.cost * v.quantity), profit = sub(payout, cost), profitCash = payoutCash - cost.n, adjustment = sub(R(payoutCash), payout)
  const ledger: SettlementLedger = { gross, sales, receipts, fees, feeTotal, shipping: R(v.shipping), other: R(v.other), payout, payoutCash, adjustment, cost, profit, profitCash }
  const e = (label: string, value: Rational, kind?: Entry['kind']): Entry => ({ label, value, kind })
  return { success: true, status: 'Simulasi manual lengkap', ledger, details: [
    e('Hasil setelah HPP (cash; bukan laba bersih)', R(profitCash), 'cash'), e('Bruto harga × jumlah', gross), e('Diskon seller per pesanan', R(v.discount)), e('Penjualan setelah diskon seller', sales),
    e('Ongkir buyer yang dikreditkan ke seller', R(v.shippingFlow === 'credited' ? v.buyerShipping : 0n)), e('Reimbursement logistik aktual', R(v.reimbursement)), e('Penerimaan aktual lain', R(v.receipts)), e('Total penerimaan tambahan', receipts), e('Total fee eksak', feeTotal), e('Ongkir yang dibayar seller', R(v.shipping)), e('Penyesuaian biaya lain', R(v.other)), e('Payout eksak sebelum pembulatan', payout), e('Penyesuaian pembulatan payout', adjustment), e('HPP seluruh unit', cost), e('Hasil setelah HPP eksak', profit), ...(sales.n > 0n ? [e('Margin setelah HPP terhadap penjualan neto', mul(divide(profit, sales), R(100n)), 'percent')] : []),
  ] }
}
