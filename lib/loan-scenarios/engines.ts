import { z } from 'zod'
import Decimal from 'decimal.js'
import { calculateAnnuity, type LoanRow } from '../finance/engines'

const D = Decimal.clone({ precision: 80, rounding: Decimal.ROUND_HALF_UP })
const SCALE = 1_000_000n
const MONTH = SCALE * 12n
const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
const positive = money.refine(v => v > 0n, 'Nominal harus lebih dari nol.')
const rate = z.string().trim().regex(/^\d{1,3}([.,]\d{1,4})?$/, 'Masukkan persen 0–100, maksimal empat desimal.').transform(v => {
  const [a, b = ''] = v.replace(',', '.').split('.')
  return BigInt(a) * 10000n + BigInt(b.padEnd(4, '0'))
}).refine(v => v <= SCALE, 'Bunga nominal harus antara 0 dan 100%.')
const count = z.string().trim().regex(/^\d{1,3}$/, 'Masukkan jumlah bulan utuh.').transform(Number)
const months = count.refine(v => v >= 1 && v <= 600, 'Tenor harus 1–600 bulan.')

export function dateDay(value: string): number | undefined {
  if (!/^(19|20|21)\d{2}-\d{2}-\d{2}$/.test(value)) return undefined
  const stamp = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value) return undefined
  return stamp / 86_400_000
}
const date = z.string().trim().refine(v => dateDay(v) !== undefined, 'Masukkan tanggal kalender valid (1900–2199).')
export const effectiveLoanInput = z.object({
  proceeds: positive, disbursed: date,
  repayments: z.array(z.object({ amount: positive, date })).min(1, 'Tambahkan satu pembayaran.').max(100, 'Maksimal 100 pembayaran.'),
}).superRefine((v, ctx) => {
  const start = dateDay(v.disbursed)
  v.repayments.forEach((r, i) => {
    const end = dateDay(r.date)
    if (start !== undefined && end !== undefined && (end <= start || end - start > 36525))
      ctx.addIssue({ code: 'custom', path: ['repayments', i, 'date'], message: 'Pembayaran harus setelah pencairan, maksimal 36.525 hari kemudian.' })
  })
})
export const mortgageInput = z.object({ price: money, down: money, months, fixedRate: rate,
  fixedMonths: count.refine(v => v <= 600, 'Maksimal 600 bulan fixed.'), nextRate: rate, fees: money,
}).superRefine((v, ctx) => {
  if (v.down > v.price) ctx.addIssue({ code: 'custom', path: ['down'], message: 'DP tidak boleh melebihi harga rumah.' })
  if (v.fixedMonths > v.months) ctx.addIssue({ code: 'custom', path: ['fixedMonths'], message: 'Fase fixed tidak boleh melebihi tenor.' })
})
export const earlyPayoffInput = z.object({ principal: positive, months, rate, extra: money, eventMonth: months, penalty: money })
export const refinanceInput = z.object({ principal: positive, months, oldRate: rate, newRate: rate, newMonths: months, cost: money })
const decimal = (digits: number) => z.string().trim().regex(new RegExp(`^\\d{1,13}([.,]\\d{1,${digits}})?$`), `Maksimal 13 digit bulat dan ${digits} desimal.`).transform(v => {
  const [a, b = ''] = v.replace(',', '.').split('.')
  return BigInt(a) * 10n ** BigInt(digits) + BigInt(b.padEnd(digits, '0'))
})
// Direction-specific schemas keep IDR whole and USD cents at the input boundary.
export const exchangeInput = z.discriminatedUnion('direction', [
  z.object({ direction: z.literal('usd-idr'), amount: decimal(2), rate: decimal(6).refine(v => v > 0n, 'Kurs harus lebih dari nol.'), fee: money }),
  z.object({ direction: z.literal('idr-usd'), amount: money, rate: decimal(6).refine(v => v > 0n, 'Kurs harus lebih dari nol.'), fee: decimal(2) }),
])
export type ScenarioRow = LoanRow & { ordinary: bigint; extra: bigint; fee: bigint }
export type ComparisonRow = { month: number; old: bigint; next: bigint; cumulative: bigint }
export type DatedRow = { date: string; days: number; amount: bigint }
export type ScenarioOutput = {
  values: Record<string, bigint>
  schedules?: { title: string; rows: ScenarioRow[] }[]
  comparison?: ComparisonRow[]
  dated?: DatedRow[]
  firstCrossing?: number | null
  permanentCrossing?: number | null
  notes?: string[]
  unit?: 'IDR' | 'USD'
  tiny?: 'positive' | 'negative'
  certificate?: { annualFactor: string; dailyDiscount: string; residual: string; iterations: number }
}
export type ScenarioResult = ({ success: true } & ScenarioOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => ScenarioOutput | { errors: Record<string, string[]> }) {
  return (input: unknown): ScenarioResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    const out = engine(parsed.data)
    return 'errors' in out ? { success: false, errors: out.errors } : { success: true, ...out }
  }
}
const fail = (field: string, message: string) => ({ errors: { [field]: [message] } })
const round = (a: bigint, b: bigint) => (2n * a + b) / (2n * b)
const sum = (rows: readonly ScenarioRow[], key: keyof Pick<ScenarioRow, 'payment' | 'interest' | 'extra' | 'fee'>) => rows.reduce((a, r) => a + r[key], 0n)
const lastMonth = (rows: readonly ScenarioRow[]) => rows.findLast(r => r.payment > 0n)?.month ?? 0
function annuity(principal: bigint, rate: bigint, months: number) {
  const result = calculateAnnuity({ principal: String(principal), rate: `${rate / 10000n}.${String(rate % 10000n).padStart(4, '0')}`, months: String(months) })
  if (!result.success || !result.schedule) throw new Error('Invalid internal amortization input')
  return { standard: result.values.standard, notes: result.notes ?? [], rows: result.schedule.map(r => ({ ...r, ordinary: r.payment, extra: 0n, fee: 0n })) }
}
function scheduleNotes(rows: readonly ScenarioRow[], standard: bigint) {
  return rows.some(r => r.ordinary > standard)
    ? ['Pembayaran penutup lebih besar dari acuan akibat pembulatan bunga bulanan. Gunakan total jadwal, bukan acuan dikali tenor.'] : []
}

// Validated dates/amounts enter this solver; the iteration budget is injectable for convergence tests.
export function solveDatedYield(proceeds: bigint, dated: readonly DatedRow[], maxIterations = 300): ScenarioOutput | { errors: Record<string, string[]> } {
  const p = new D(proceeds.toString())
  const total = dated.reduce((s, r) => s + r.amount, 0n)
  const pv = (x: Decimal) => dated.reduce((s, r) => s.add(new D(r.amount.toString()).mul(x.pow(r.days))), new D(0))
  let lo = new D('0.95'), hi = new D('1.05'), x = new D(1), iterations = 0
  if (pv(lo).gt(p) || pv(hi).lt(p)) return fail('proceeds', 'Akar tingkat efektif berada di luar batas pencarian. Periksa nominal dan tanggal pembayaran.')
  if (total !== proceeds) {
    for (; iterations < maxIterations; iterations++) {
      x = lo.add(hi).div(2)
      const value = pv(x)
      if (value.gt(p)) hi = x
      else lo = x
      if (hi.sub(lo).lte('1e-60') && value.sub(p).abs().lte('1e-8')) break
    }
  }
  let annualFactor = x.pow(-365)
  let annual = annualFactor.sub(1)
  // Snap only at the numerical guard scale, far below the input/display precision.
  for (const bound of ['-0.9999', '100']) {
    if (annual.sub(bound).abs().lt('1e-50')) { annual = new D(bound); annualFactor = annual.add(1) }
  }
  // Re-evaluate with the annual factor (fractional exponent), independently of polynomial PV.
  const residual = dated.reduce((s, r) => s.add(new D(r.amount.toString()).div(annualFactor.pow(new D(r.days).div(365)))), new D(0)).sub(p).abs()
  if (iterations >= maxIterations || residual.gt('1e-8')) return fail('proceeds', 'Perhitungan belum memenuhi toleransi residu Rp0,00000001. Hasil ditahan; ubah skenario.')
  if (annual.lt('-0.9999') || annual.gt(100)) return fail('proceeds', 'Tingkat efektif di luar batas model −99,99% hingga 10.000% per tahun. Hasil ditahan.')
  const effective = BigInt(annual.mul(1000000).toFixed(0))
  return { values: { effective, proceeds, total, difference: total - proceeds }, dated: [...dated],
    tiny: effective === 0n && !annual.isZero() ? annual.isPositive() ? 'positive' : 'negative' : undefined,
    certificate: { annualFactor: annualFactor.toString(), dailyDiscount: x.toString(), residual: residual.toString(), iterations },
    notes: ['ACT/365 fixed. Residu PV internal ≤Rp0,00000001; tingkat tampilan empat desimal dibulatkan dan tidak dipakai menguji residu. Ini yield arus kas peminjam, bukan APR/EIR wajib regulator.'],
  }
}

export const calculateEffectiveLoan = calculate(effectiveLoanInput, ({ proceeds, disbursed, repayments }) => {
  const start = dateDay(disbursed)!
  const dated = repayments.map(r => ({ date: r.date, days: dateDay(r.date)! - start, amount: r.amount })).sort((a, b) => a.days - b.days)
  return solveDatedYield(proceeds, dated)
})

export const calculateMortgage = calculate(mortgageInput, ({ price, down, months, fixedRate, fixedMonths, nextRate, fees }) => {
  const principal = price - down
  const fixed = annuity(principal, fixedRate, months)
  const first = fixed.rows.slice(0, fixedMonths)
  const switchBalance = fixedMonths === 0 ? principal : first[first.length - 1].balance
  const next = fixedMonths === months ? undefined : annuity(switchBalance, nextRate, months - fixedMonths)
  const rows = [...first, ...(next?.rows.map(r => ({ ...r, month: r.month + fixedMonths })) ?? [])]
  const total = sum(rows, 'payment'), interest = sum(rows, 'interest')
  return { values: { principal, phaseOne: fixedMonths ? fixed.standard : 0n, phaseTwo: next?.standard ?? 0n, switchBalance, interest, total,
    upfront: down + fees, outlay: down + fees + total, last: rows.findLast(r => r.payment > 0n)?.payment ?? 0n, lastMonth: BigInt(lastMonth(rows)) },
    schedules: [{ title: 'KPR dua fase', rows }],
    notes: [
      'Fase kedua adalah asumsi tingkat nominal tahunan tetap untuk sisa tenor, bukan ramalan floating rate bank. Biaya awal dibayar tunai. Acuan fase yang tidak ada bernilai Rp0.',
      ...scheduleNotes(first, fixed.standard), ...(next ? scheduleNotes(next.rows, next.standard) : []),
      ...(principal > 0n && interest === 0n && ((fixedMonths > 0 && fixedRate > 0n) || (fixedMonths < months && nextRate > 0n)) ? ['Bunga jadwal menjadi Rp0 karena pembulatan rupiah; tingkat input tetap mengikuti skenario.'] : []),
    ],
  }
})

export const calculateEarlyPayoff = calculate(earlyPayoffInput, ({ principal, months, rate, extra, eventMonth, penalty }) => {
  if (eventMonth > months) return fail('eventMonth', 'Bulan tambahan tidak boleh melewati tenor.')
  if (extra === 0n && penalty > 0n) return fail('penalty', 'Penalti hanya boleh positif jika ada tambahan pokok.')
  const base = annuity(principal, rate, months)
  if (extra > 0n && base.rows[eventMonth - 1].balance === 0n) return fail('eventMonth', 'Pilih bulan sebelum saldo lunas setelah cicilan biasa.')
  let balance = principal
  const rows: ScenarioRow[] = []
  for (let month = 1; month <= months; month++) {
    const interest = round(balance * rate, MONTH)
    const due = balance + interest
    const ordinary = month === months || base.standard > due ? due : base.standard
    const ordinaryPrincipal = ordinary - interest
    balance -= ordinaryPrincipal
    const added = month === eventMonth ? (extra < balance ? extra : balance) : 0n
    balance -= added
    const fee = month === eventMonth && added > 0n ? penalty : 0n
    rows.push({ month, ordinary, extra: added, fee, payment: ordinary + added + fee, principal: ordinaryPrincipal + added, interest, balance })
  }
  const baseInterest = sum(base.rows, 'interest'), interest = sum(rows, 'interest'), paidPenalty = sum(rows, 'fee')
  return { values: { standard: base.standard, baseInterest, interest, saved: baseInterest - interest, penalty: paidPenalty,
    net: baseInterest - interest - paidPenalty, extra: sum(rows, 'extra'), total: sum(rows, 'payment'), baselineTotal: sum(base.rows, 'payment'),
    lastMonth: BigInt(lastMonth(rows)), monthsSaved: BigInt(lastMonth(base.rows) - lastMonth(rows)) },
    schedules: [{ title: 'Tanpa tambahan', rows: base.rows }, { title: 'Dengan tambahan dan penalti', rows }],
    notes: ['Acuan cicilan dipertahankan. Tambahan sekali sesudah cicilan biasa di bulan pilihan, dibatasi sisa pokok. Penalti nominal dibayar sekali dan tidak mengurangi pokok. Hemat neto dapat negatif.', ...scheduleNotes(rows, base.standard)],
  }
})

export const calculateRefinance = calculate(refinanceInput, ({ principal, months, oldRate, newRate, newMonths, cost }) => {
  const old = annuity(principal, oldRate, months), next = annuity(principal, newRate, newMonths)
  const horizon = Math.max(months, newMonths)
  let cumulative = -cost
  const comparison: ComparisonRow[] = [{ month: 0, old: 0n, next: cost, cumulative }]
  for (let month = 1; month <= horizon; month++) {
    const a = old.rows[month - 1]?.payment ?? 0n, b = next.rows[month - 1]?.payment ?? 0n
    cumulative += a - b
    comparison.push({ month, old: a, next: b, cumulative })
  }
  const firstCrossing = comparison.find(r => r.cumulative >= 0n)?.month ?? null
  let permanentCrossing: number | null = null
  for (let i = comparison.length - 1; i >= 0 && comparison[i].cumulative >= 0n; i--) permanentCrossing = i
  return { values: { oldStandard: old.standard, newStandard: next.standard, oldInterest: sum(old.rows, 'interest'), newInterest: sum(next.rows, 'interest'),
    cost, oldTotal: sum(old.rows, 'payment'), newTotal: sum(next.rows, 'payment') + cost, net: cumulative, horizon: BigInt(horizon) },
    comparison, firstCrossing, permanentCrossing,
    schedules: [{ title: 'Pinjaman lama', rows: old.rows }, { title: 'Pinjaman baru', rows: next.rows }],
    notes: ['Biaya pindah dibayar tunai di bulan 0. Impas memakai kumulatif kas tanpa diskonto sampai kedua pinjaman selesai, dengan pembayaran nol setelah lunas. Crossing sementara dapat hilang; angsuran lebih kecil tidak selalu menghemat biaya seumur pinjaman.', ...old.notes, ...next.notes],
  }
})

export const calculateExchange = calculate(exchangeInput, ({ direction, amount, rate, fee }) => {
  const usdOut = direction === 'idr-usd'
  const numerator = usdOut ? amount * 100n * 1000000n : amount * rate
  const denominator = usdOut ? rate : 100n * 1000000n
  if (fee * denominator > numerator) return fail('fee', 'Biaya tidak boleh melebihi hasil konversi eksak sebelum pembulatan.')
  const gross = round(numerator, denominator), net = gross - fee
  return { values: { gross, fee, net }, unit: usdOut ? 'USD' : 'IDR',
    tiny: net === 0n && numerator - fee * denominator > 0n ? 'positive' : undefined,
    notes: [`Kurs manual 1 USD = X IDR. Biaya dalam mata uang keluaran. Gross dibulatkan ke ${usdOut ? 'dua desimal USD' : 'rupiah utuh'}, lalu biaya dikurangi agar rincian cocok. ${net === 0n ? 'Nominal diterima tampil nol; periksa biaya dan presisi unit.' : ''} Tidak ada kurs langsung atau jaminan nilai transaksi bank.`],
  }
})
