import { z } from 'zod'
const RATE = 1000000n
const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
function decimal(digits: number, wholeDigits = 13, signed = false) {
  return z.string().trim().regex(new RegExp(`^${signed ? '-?' : ''}\\d{1,${wholeDigits}}([.,]\\d{1,${digits}})?$`), `Masukkan ${signed ? 'angka bertanda' : 'angka nonnegatif'}, maksimal ${wholeDigits} digit bulat dan ${digits} desimal.`).transform(v => {
    const negative = v.startsWith('-')
    const [a, b = ''] = (negative ? v.slice(1) : v).replace(',', '.').split('.')
    const n = BigInt(a) * 10n ** BigInt(digits) + BigInt(b.padEnd(digits, '0'))
    return negative ? -n : n
  })
}
const discountRate = decimal(4, 3).refine(v => v <= RATE, 'Diskon harus 0–100%.')
export const discountInput = z.object({ original: money, discounts: z.array(z.object({ rate: discountRate })).min(1, 'Isi satu tahap diskon.').max(20, 'Maksimal 20 tahap.') })
export const units = {
  mg: { family: 'mass', common: 'kg', denominator: 1000000n },
  g: { family: 'mass', common: 'kg', denominator: 1000n },
  kg: { family: 'mass', common: 'kg', denominator: 1n },
  mL: { family: 'volume', common: 'L', denominator: 1000n },
  L: { family: 'volume', common: 'L', denominator: 1n },
  pcs: { family: 'count', common: 'pcs', denominator: 1n },
} as const
export type Unit = keyof typeof units
export const unitPriceInput = z.object({ packages: z.array(z.object({ price: money, quantity: decimal(3).refine(v => v > 0n, 'Ukuran harus lebih dari nol.'),
  unit: z.enum(['mg', 'g', 'kg', 'mL', 'L', 'pcs'], { error: 'Pilih satuan kemasan.' }),
})).min(2, 'Minimal dua kemasan.').max(10, 'Maksimal sepuluh kemasan.') }).superRefine((v, ctx) => {
  const family = v.packages[0] && units[v.packages[0].unit].family
  v.packages.forEach((p, i) => { if (units[p.unit].family !== family) ctx.addIssue({ code: 'custom', path: ['packages', i, 'unit'], message: 'Semua kemasan harus satu keluarga massa, volume, atau pcs. Tidak ada konversi densitas.' }) })
})
export const billInput = z.object({ service: money, tax: money,
  mode: z.enum(['equal', 'proportional'], { error: 'Pilih alokasi rata atau proporsional.' }),
  people: z.array(z.object({ subtotal: money })).min(2, 'Minimal dua orang.').max(20, 'Maksimal 20 orang.'),
})
export const portionInput = z.object({ value: decimal(6, 13, true), percent: decimal(4, 9, true) })
export const ratioInput = z.object({ part: decimal(6, 13, true), whole: decimal(6, 13, true).refine(v => v !== 0n, 'Basis pembagi tidak boleh nol.') })
export const percentChangeInput = z.object({ previous: decimal(6), current: decimal(6) })
export type Precision = 'positive' | 'negative'
export type DiscountStage = { rate: bigint; factor: bigint; model: bigint }
export type PackageRow = { price: bigint; quantity: bigint; unit: Unit; unitPrice: bigint; saving: bigint | null; cheapest: boolean }
export type PersonRow = { subtotal: bigint; extra: bigint; total: bigint }
export type EverydayOutput = {
  values: Record<string, bigint | null>
  precision: Record<string, Precision>
  notes?: string[]
  stages?: DiscountStage[]
  packages?: PackageRow[]
  people?: PersonRow[]
  comparisonUnit?: 'kg' | 'L' | 'pcs'
  winners?: number[]
  roundedTie?: boolean
}
export type EverydayResult = ({ success: true } & EverydayOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => EverydayOutput | { errors: Record<string, string[]> }) {
  return (input: unknown): EverydayResult => {
    const p = schema.safeParse(input)
    if (!p.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of p.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    const result = engine(p.data)
    return 'errors' in result ? { success: false, errors: result.errors } : { success: true, ...result }
  }
}
function round(n: bigint, d: bigint) {
  if (d < 0n) { n = -n; d = -d }
  const magnitude = n < 0n ? -n : n
  const q = (2n * magnitude + d) / (2n * d)
  return n < 0n ? -q : q
}
function output() {
  const values: Record<string, bigint | null> = {}, precision: Record<string, Precision> = {}
  const ratio = (key: string, n: bigint, d: bigint) => {
    if (!d) { values[key] = null; return null }
    const value = round(n, d); values[key] = value
    if (value === 0n && n !== 0n) precision[key] = (n < 0n) !== (d < 0n) ? 'negative' : 'positive'
    return value
  }
  return { values, precision, ratio, data: { values, precision } }
}
export const calculateDiscount = calculate(discountInput, ({ original, discounts }) => {
  const out = output(); let numerator = 1n, denominator = 1n
  const stages = discounts.map((stage, i) => {
    numerator *= RATE - stage.rate; denominator *= RATE
    return { rate: stage.rate, factor: out.ratio(`stages.${i}.factor`, numerator * 1000000n, denominator)!, model: out.ratio(`stages.${i}.model`, original * numerator * 100n, denominator)! }
  })
  const final = round(original * numerator, denominator), saved = original - final
  out.ratio('modelPercent', (denominator - numerator) * 10000n, denominator)
  out.ratio('cashPercent', saved * 10000n, original)
  return { ...out.data, values: { final, saved, original, modelPercent: out.values.modelPercent, cashPercent: out.values.cashPercent }, stages,
    notes: ['Harga cash dibulatkan sekali ke rupiah setelah semua faktor diskon. Penghematan kas = harga awal − cash. Potongan model dari faktor dapat berbeda dari potongan kas setelah pembulatan; harga awal nol membuat potongan kas tidak terdefinisi. Rincian tahap hanya tampilan, tidak dipakai menghitung tahap berikutnya.'] }
})
type Fraction = { n: bigint; d: bigint }
const compare = (a: Fraction, b: Fraction) => a.n * b.d < b.n * a.d ? -1 : a.n * b.d > b.n * a.d ? 1 : 0
export const calculateUnitPrice = calculate(unitPriceInput, ({ packages }) => {
  const out = output()
  const fractions = packages.map(p => ({ n: p.price * 1000n * units[p.unit].denominator, d: p.quantity }))
  let minimum = fractions[0], maximum = fractions[0]
  for (const f of fractions) { if (compare(f, minimum) < 0) minimum = f; if (compare(f, maximum) > 0) maximum = f }
  const winners: number[] = []
  const rows = packages.map((p, i) => {
    const f = fractions[i], cheapest = compare(f, minimum) === 0
    if (cheapest) winners.push(i)
    const unitPrice = out.ratio(`packages.${i}.unitPrice`, f.n * 100n, f.d)!
    const saving = out.ratio(`packages.${i}.saving`, (maximum.n * f.d - f.n * maximum.d) * 10000n, maximum.n * f.d)
    return { ...p, unitPrice, saving, cheapest }
  })
  const roundedTie = rows.some((r, i) => rows.some((other, j) => i !== j && r.unitPrice === other.unitPrice && compare(fractions[i], fractions[j]) !== 0))
  out.ratio('minimum', minimum.n * 100n, minimum.d); out.ratio('maximum', maximum.n * 100n, maximum.d)
  out.ratio('saving', (maximum.n * minimum.d - minimum.n * maximum.d) * 10000n, maximum.n * minimum.d)
  return { ...out.data, values: { minimum: out.values.minimum, maximum: out.values.maximum, saving: out.values.saving }, packages: rows, winners, roundedTie, comparisonUnit: units[packages[0].unit].common,
    notes: [
      `Harga setara per ${units[packages[0].unit].common}. Semua pemenang biaya satuan eksak ditampilkan; bukan penilaian kualitas atau kebutuhan.`,
      'Penghematan relatif memakai harga satuan tertinggi sebagai basis. Jika semua harga nol, persentasenya tidak terdefinisi.',
      ...(roundedTie ? ['Ada harga tampilan sama tetapi rasio eksak berbeda. Pilihan termurah tetap memakai pecahan sebelum pembulatan.'] : []),
    ] }
})
export const calculateBill = calculate(billInput, ({ service, tax, mode, people }) => {
  const shared = service + tax, subtotal = people.reduce((s, p) => s + p.subtotal, 0n)
  if (mode === 'proportional' && subtotal === 0n && shared > 0n) return { errors: { mode: ['Alokasi proporsional membutuhkan subtotal positif jika biaya bersama lebih dari nol.'] } }
  const denominator = mode === 'equal' ? BigInt(people.length) : subtotal
  const quotas = people.map((p, index) => {
    const n = shared * (mode === 'equal' ? 1n : p.subtotal)
    return { index, floor: denominator ? n / denominator : 0n, remainder: denominator ? n % denominator : 0n }
  })
  let remainder = shared - quotas.reduce((s, q) => s + q.floor, 0n)
  const extras = quotas.map(q => q.floor)
  for (const q of [...quotas].sort((a, b) => a.remainder > b.remainder ? -1 : a.remainder < b.remainder ? 1 : a.index - b.index)) {
    if (remainder === 0n) break
    extras[q.index] += 1n; remainder -= 1n
  }
  const rows = people.map((p, i) => ({ subtotal: p.subtotal, extra: extras[i], total: p.subtotal + extras[i] }))
  const allocated = rows.reduce((s, r) => s + r.total, 0n)
  return { values: { grand: subtotal + shared, subtotal, shared, service, tax, allocated, difference: subtotal + shared - allocated }, precision: {}, people: rows,
    notes: [`Mode ${mode === 'equal' ? 'rata' : 'proporsional'} hanya membagi biaya bersama. Setiap orang tetap membayar subtotal itemnya sendiri.`,
      'Satu baris adalah subtotal seluruh item orang tersebut, bukan daftar atau item berbagi. Service/pajak nominal digabung sekali. Sisa rupiah memakai largest remainder dengan tie urutan Orang 1, 2, dan seterusnya. Mengubah urutan saat seri dapat memindahkan alokasi sisa Rp1.'] }
})
export const calculatePortion = calculate(portionInput, ({ value, percent }) => {
  const out = output(); out.ratio('result', value * percent, 100000000n)
  return { ...out.data, notes: ['Mode X% dari N: hasil empat desimal dari pecahan eksak, tanpa batas 100% untuk persen umum. Tanda negatif mengikuti perkalian biasa.'] }
})
export const calculateRatioPercent = calculate(ratioInput, ({ part, whole }) => {
  const out = output(); out.ratio('result', part * 1000000n, whole)
  return { ...out.data, notes: ['Mode A berapa persen dari B: basis boleh negatif tetapi tidak nol. Tanda mengikuti pembagian biasa; ini bukan perubahan finansial dari basis negatif.'] }
})
const percentModeInput = z.object({ mode: z.enum(['portion', 'ratio'], { error: 'Pilih mode persen.' }) })
export function calculatePercent(input: unknown): EverydayResult {
  const p = percentModeInput.safeParse(input)
  if (!p.success) return { success: false, errors: { mode: ['Pilih mode persen yang tersedia.'] } }
  return (p.data.mode === 'portion' ? calculatePortion : calculateRatioPercent)(input)
}
export const calculatePercentChange = calculate(percentChangeInput, ({ previous, current }) => {
  const out = output(); const change = current - previous
  out.ratio('percent', change * 1000000n, previous)
  return { ...out.data, values: { ...out.values, change, previous, current }, notes: ['Nilai awal/akhir nonnegatif, hingga enam desimal. Delta eksak; persentase empat desimal terhadap awal. Awal nol membuat persen tidak terdefinisi tetapi delta dan nilai akhir tetap tersedia.'] }
})
