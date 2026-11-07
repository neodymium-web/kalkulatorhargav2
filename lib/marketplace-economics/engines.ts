import { z } from 'zod'
import { fraction as R, add, subtract as sub, multiply as mul, divide as div, ceiling, round, type Rational } from '../utilities-materials/rational'
export type { Rational }
const S = 1000000n, P = 100000000n
const integer = (digits = 13) => z.string().trim().regex(new RegExp(`^\\d{1,${digits}}$`), { message: `Isi integer nonnegatif hingga ${digits} digit, tanpa pemisah.`, abort: true }).transform(BigInt)
const money = () => integer()
const optionalMoney = () => z.preprocess(v => v === '' || v === undefined ? '0' : v, money())
const decimal = () => z.string().trim().regex(/^\d{1,13}([.,]\d{1,6})?$/, { message: 'Isi angka nonnegatif hingga 13 digit bulat dan 6 desimal, tanpa pemisah ribuan.', abort: true }).transform(v => { const [a, b = ''] = v.replace(',', '.').split('.'); return BigInt(a) * S + BigInt(b.padEnd(6, '0')) })
const rate = (strict = false) => decimal().refine(v => strict ? v < 100n * S : v <= 100n * S, { message: strict ? 'Persen harus 0 sampai kurang dari 100.' : 'Persen harus 0–100.', abort: true }).transform(v => R(v, P))
const quantity = () => integer(5).refine(v => v >= 1n && v <= 10000n, { message: 'Jumlah harus integer 1–10000.', abort: true })
const label = () => z.string().trim().min(1, 'Isi nama.').max(60, 'Nama maksimal 60 karakter.')
const basis = z.enum(['gross', 'net'], { error: 'Pilih basis bruto atau setelah diskon.' })
const common = { price: money(), quantity: quantity(), discount: money(), cost: money() }
const fees = { rate: rate(), fixed: money(), other: optionalMoney(), basis }
export const settlementInput = z.object({ ...common, ...fees, shipping: optionalMoney() }).refine(v => v.discount <= v.price * v.quantity, { path: ['discount'], message: 'Diskon pesanan tidak boleh melebihi nilai bruto.' })
export const listingInput = z.object({ target: money(), discountRate: rate(true), feeRate: rate(true), fixed: money() })
export const comparisonInput = z.object({ ...common, channels: z.array(z.object({ label: label(), ...fees })).min(2).max(5) }).superRefine((v, ctx) => {
  if (v.discount > v.price * v.quantity) ctx.addIssue({ code: 'custom', path: ['discount'], message: 'Diskon pesanan melebihi nilai bruto.' })
  const seen = new Set<string>(); v.channels.forEach((c, i) => { const key = c.label.toLocaleLowerCase('id'); if (seen.has(key)) ctx.addIssue({ code: 'custom', path: ['channels', i, 'label'], message: 'Nama kanal harus unik (huruf besar/kecil diabaikan).' }); seen.add(key) })
})
export const bundleInput = z.object({ price: money(), discount: money(), rate: rate(), fixed: money(), items: z.array(z.object({ label: label(), cost: money(), quantity: quantity() })).min(1).max(20) }).refine(v => v.discount <= v.price, { path: ['discount'], message: 'Diskon pesanan tidak boleh melebihi harga bundel.' })
export const stockInput = z.object({ stock: integer(), daily: decimal() })
export const cash = (a: Rational) => a.n < 0n ? -round(R(-a.n, a.d)) : round(a)
export const compare = (a: Rational, b: Rational) => a.n * b.d - b.n * a.d
export type Entry = { label: string; value: Rational; kind?: 'integer' | 'days' | 'percent' | 'cash' }
export type Channel = { id: number; label: string; basis: 'gross' | 'net'; commission: Rational; fees: Rational; payout: Rational; profit: Rational; payoutCash: bigint; profitCash: bigint; best: boolean }
export type EconomicsOutput = { primary: { label: string; value: Rational; kind: 'cash' | 'integer' | 'days' } | { label: string; status: string }; details: Entry[]; notes: string[]; channels?: Channel[]; items?: { id: number; label: string; cost: bigint; quantity: bigint; total: bigint }[] }
export type EconomicsResult = ({ success: true } & EconomicsOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => EconomicsOutput) {
  return (input: unknown): EconomicsResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) { const errors: Record<string, string[]> = {}; for (const e of parsed.error.issues) (errors[e.path.join('.')] ??= []).push(e.message); return { success: false, errors } }
    return { success: true, ...engine(parsed.data) }
  }
}
const e = (label: string, value: Rational, kind?: Entry['kind']): Entry => ({ label, value, kind })
export const policy = 'Skenario manual, bukan tarif atau invoice resmi marketplace. Biaya persen tetap pecahan eksak. Payout/kontribusi dibulatkan sekali ke rupiah, setengah menjauhi nol. Hasil setelah HPP cash berasal dari payout cash dikurangi HPP integer. Sewa, gaji, pajak dan overhead lain belum tercakup.'
export function settlement(v: { price: bigint; quantity: bigint; discount: bigint; cost: bigint; rate: Rational; fixed: bigint; other: bigint; shipping: bigint; basis: 'gross' | 'net' }) {
  const gross = R(v.price * v.quantity), discount = R(v.discount), sales = sub(gross, discount), base = v.basis === 'gross' ? gross : sales
  const commission = mul(base, v.rate), fees = add(commission, R(v.fixed + v.other + v.shipping)), payout = sub(sales, fees), cogs = R(v.cost * v.quantity), profit = sub(payout, cogs)
  const payoutCash = cash(payout), profitCash = payoutCash - cogs.n
  return { gross, sales, base, commission, fees, payout, cogs, profit, payoutCash, profitCash }
}
export const calculateSettlement = calculate(settlementInput, v => {
  const s = settlement(v)
  return { primary: { label: 'Dana bersih pesanan (cash simulasi)', value: R(s.payoutCash), kind: 'cash' }, details: [
    e('Hasil setelah HPP (cash, bukan laba bersih)', R(s.profitCash), 'cash'), e('Bruto harga × jumlah', s.gross), e('Diskon seller per pesanan', R(v.discount)), e('Penjualan setelah diskon', s.sales), e(`Basis komisi: ${v.basis === 'gross' ? 'bruto' : 'setelah diskon'}`, s.base), e('Komisi eksak', s.commission), e('Biaya tetap pesanan', R(v.fixed)), e('Biaya lain pesanan', R(v.other)), e('Ongkir seller pesanan', R(v.shipping)), e('Total biaya eksak', s.fees), e('Payout sebelum pembulatan', s.payout), e('Penyesuaian pembulatan payout', sub(R(s.payoutCash), s.payout)), e('HPP seluruh unit', s.cogs), e('Hasil setelah HPP sebelum pembulatan', s.profit),
  ], notes: ['Simulasi komisi berdasarkan input kontrak Anda; bukan kalkulator tarif resmi Blibli.', policy] }
})
export function forwardListing(listing: bigint, discount: Rational, fee: Rational, fixed: bigint) { return sub(mul(mul(R(listing), sub(R(1n), discount)), sub(R(1n), fee)), R(fixed)) }
export const calculateListing = calculate(listingInput, v => {
  const factor = mul(sub(R(1n), v.discountRate), sub(R(1n), v.feeRate)), theoretical = div(R(v.target + v.fixed), factor), listing = ceiling(theoretical)
  const payout = forwardListing(listing, v.discountRate, v.feeRate, v.fixed), previous = listing > 0n ? forwardListing(listing - 1n, v.discountRate, v.feeRate, v.fixed) : undefined
  if (compare(payout, R(v.target)) < 0n || (previous && compare(previous, R(v.target)) >= 0n)) throw new Error('Listing minimum invariant failed')
  const paid = mul(R(listing), sub(R(1n), v.discountRate)), fee = mul(paid, v.feeRate)
  return { primary: { label: 'Harga listing minimum (rupiah utuh)', value: R(listing), kind: 'cash' }, details: [e('Target payout sebelum pembulatan', R(v.target)), e('Harga teoretis eksak', theoretical), e('Diskon dari listing', sub(R(listing), paid)), e('Penjualan setelah diskon', paid), e('Fee persen dari penjualan setelah diskon', fee), e('Biaya tetap pesanan', R(v.fixed)), e('Payout kandidat sebelum pembulatan (memenuhi target)', payout), e('Payout kandidat cash (informasi)', R(cash(payout)), 'cash'), ...(previous ? [e('Payout harga satu rupiah lebih rendah (tidak memenuhi)', previous)] : [])], notes: ['Target dijamin terhadap payout SEBELUM pembulatan, bukan payout cash. Harga minimum dapat lebih tinggi daripada minimum berdasarkan cash yang dibulatkan. Harga nol sah jika target dan biaya tetap nol. Diskon dan fee masing-masing wajib kurang dari 100%.', policy] }
})
export const calculateComparison = calculate(comparisonInput, v => {
  const channels: Channel[] = v.channels.map((c, id) => { const s = settlement({ ...v, ...c, shipping: 0n }); return { id, label: c.label, basis: c.basis, commission: s.commission, fees: s.fees, payout: s.payout, profit: s.profit, payoutCash: s.payoutCash, profitCash: s.profitCash, best: false } })
  const best = channels.reduce((a, b) => compare(a.profit, b.profit) >= 0n ? a : b); channels.forEach(c => { c.best = compare(c.profit, best.profit) === 0n })
  return { primary: { label: 'Hasil setelah HPP terbaik (cash simulasi)', value: R(best.profitCash), kind: 'cash' }, details: [e('Bruto bersama', R(v.price * v.quantity)), e('Diskon seller bersama per pesanan', R(v.discount)), e('Penjualan setelah diskon bersama', R(v.price * v.quantity - v.discount)), e('HPP bersama seluruh unit', R(v.cost * v.quantity))], channels, notes: ['Terbaik menurut hasil setelah HPP SEBELUM pembulatan; semua seri ditandai. Urutan tabel tetap urutan input. HPP sama membuat ranking payout setara. Cash sama belum tentu seri. Biaya lain mencakup ongkir jika diperlukan; nama kanal wajib unik.', policy] }
})
export const calculateBundle = calculate(bundleInput, v => {
  const items = v.items.map((i, id) => ({ ...i, id, total: i.cost * i.quantity })), cogs = R(items.reduce((sum, i) => sum + i.total, 0n)), sales = R(v.price - v.discount), commission = mul(sales, v.rate), fees = add(commission, R(v.fixed)), contribution = sub(sub(sales, cogs), fees)
  return { primary: { label: 'Kontribusi bundel (cash simulasi)', value: R(cash(contribution)), kind: 'cash' }, details: [e('Harga paket satu pesanan', R(v.price)), e('Diskon seller per pesanan', R(v.discount)), e('Penjualan setelah diskon', sales), e('HPP seluruh isi paket', cogs), e('Fee persen eksak', commission), e('Kemasan/fulfillment tetap pesanan', R(v.fixed)), e('Total biaya transaksi eksak', fees), e('Kontribusi sebelum pembulatan', contribution), e('Penyesuaian pembulatan kontribusi', sub(R(cash(contribution)), contribution)), ...(sales.n > 0n ? [e('Margin kontribusi terhadap penjualan setelah diskon', mul(div(contribution, sales), R(100n)), 'percent')] : [])], items, notes: ['Kontribusi skenario setelah HPP dan biaya yang dimasukkan, bukan laba bersih. Jika HPP mengandung biaya tetap, ini bukan klasifikasi variable-cost murni. Diskon dikurangi sekali. Label produk duplikat sah; setiap baris tetap dihitung.', ...(sales.n === 0n ? ['Margin tidak terdefinisi karena penjualan setelah diskon nol.'] : []), policy] }
})
export const calculateStock = calculate(stockInput, v => {
  const details = [e('Stok siap jual', R(v.stock), 'integer')]
  if (v.daily === 0n) return { primary: { label: 'Status cakupan stok', status: v.stock === 0n ? 'Tidak terdefinisi: stok dan penjualan rata-rata sama-sama nol' : 'Tidak terhingga / tidak dapat diperkirakan karena penjualan rata-rata nol' }, details, notes: ['Tidak ada estimasi finite saat permintaan nol. Stok nol dengan permintaan nol adalah kondisi tidak terdefinisi, bukan 0 hari atau infinity. Model permintaan konstan, bukan forecast atau jaminan.'] }
  const cover = div(R(v.stock), R(v.daily, S))
  return { primary: { label: 'Cakupan stok pada laju konstan', value: cover, kind: 'days' }, details: [...details, e('Hari penuh yang tercakup (floor)', R(cover.n / cover.d), 'integer')], notes: ['Cakupan = stok siap jual ÷ rata-rata unit terjual per hari. Hari penuh memakai floor dari pecahan asli, bukan ceiling atau hasil desimal. Rata-rata adalah asumsi pengguna; bukan forecast time-series, tanggal restock atau jaminan kehabisan.'] }
})
