import { z } from 'zod'

const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.')
  .transform(BigInt)
const balance = z.string().trim().regex(/^-?\d{1,13}$/, 'Masukkan saldo rupiah utuh hingga 13 digit.')
  .transform(BigInt)
const quantity = z.string().trim().regex(/^\d{1,13}(?:[,.]\d{1,3})?$/, 'Masukkan angka nonnegatif hingga tiga desimal.')
  .transform(value => {
    const [whole, fraction = ''] = value.split(/[,.]/)
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'))
  })
const date = z.iso.date('Masukkan tanggal yang valid.')
const period = z.object({ start: date, end: date })
const ordered = ({ start, end }: z.infer<typeof period>) => end >= start
const periodError = { path: ['end'], message: 'Tanggal akhir harus sama dengan atau setelah tanggal awal.' }

export const cogsInput = period.extend({ opening: money, purchases: money, closing: money })
  .refine(ordered, periodError)
  .refine(({ opening, purchases, closing }) => closing <= opening + purchases, {
    path: ['closing'], message: 'Persediaan akhir tidak boleh melebihi barang tersedia.',
  })

export const yieldInput = z.object({
  gross: quantity.refine(value => value > 0n, 'Berat kotor harus lebih dari nol.'),
  net: quantity,
  unit: z.string().trim().toLowerCase().pipe(z.enum(['g', 'kg'], 'Gunakan g atau kg.')),
}).refine(({ gross, net }) => net <= gross, { path: ['net'], message: 'Berat bersih tidak boleh melebihi berat kotor.' })

export const depreciationInput = z.object({
  cost: money, residual: money,
  years: z.string().trim().regex(/^\d{1,13}$/, 'Masukkan umur manfaat dalam tahun utuh.')
    .transform(BigInt).refine(value => value > 0n, 'Umur manfaat harus lebih dari nol tahun.'),
}).refine(({ cost, residual }) => residual <= cost, { path: ['residual'], message: 'Nilai residu tidak boleh melebihi biaya perolehan.' })

export const cashFlowInput = period.extend({ opening: balance, receipts: money, payments: money }).refine(ordered, periodError)

export const utilizationInput = period.extend({
  actual: quantity,
  capacity: quantity.refine(value => value > 0n, 'Kapasitas acuan harus lebih dari nol.'),
  unit: z.string().trim().min(1, 'Masukkan satuan produksi.').max(24, 'Gunakan satuan hingga 24 karakter.'),
}).refine(ordered, periodError)

type Output = { values: Record<string, bigint>; unit?: string; warning?: string }
export type OperationResult = { success: true } & Output | { success: false; errors: Record<string, string[] | undefined> }

function withInput<T>(schema: z.ZodType<T>, compute: (input: T) => Output) {
  return (input: unknown): OperationResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) return { success: false, errors: z.flattenError(parsed.error).fieldErrors }
    return { success: true, ...compute(parsed.data) }
  }
}

function round(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / 2n) / denominator
}

export const calculateCogs = withInput(cogsInput, ({ opening, purchases, closing }) => ({
  values: { cogs: opening + purchases - closing, available: opening + purchases },
}))

export const calculateYield = withInput(yieldInput, ({ gross, net, unit }) => {
  const loss = gross - net
  return { unit, values: { yield: round(net * 10000n, gross), loss, lossPercent: round(loss * 10000n, gross) } }
})

export const calculateDepreciation = withInput(depreciationInput, ({ cost, residual, years }) => ({
  values: { annual: round(cost - residual, years), base: cost - residual },
}))

export const calculateCashFlow = withInput(cashFlowInput, ({ opening, receipts, payments }) => {
  const net = receipts - payments
  const closing = opening + net
  return { values: { closing, net }, warning: closing < 0n ? 'Peringatan: saldo akhir negatif.' : undefined }
})

export const calculateUtilization = withInput(utilizationInput, ({ actual, capacity }) => ({
  values: { utilization: round(actual * 10000n, capacity) },
  warning: actual > capacity ? 'Produksi melampaui kapasitas acuan.' : undefined,
}))
