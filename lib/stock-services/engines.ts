import { z } from 'zod'

const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
const quantity = z.string().trim().regex(/^\d{1,13}(?:[,.]\d{1,3})?$/, 'Masukkan angka nonnegatif hingga tiga desimal.')
  .transform(value => {
    const [whole, fraction = ''] = value.split(/[,.]/)
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'))
  })
const period = z.object({ start: z.iso.date('Masukkan tanggal awal yang valid.'), end: z.iso.date('Masukkan tanggal akhir yang valid.') })
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Pilih bulan acuan yang valid.')

export const turnoverInput = period.extend({ cogs: money, opening: money, closing: money })
  .refine(({ start, end }) => end >= start, { path: ['end'], message: 'Tanggal akhir harus sama dengan atau setelah tanggal awal.' })
  .refine(({ opening, closing }) => opening + closing > 0n, { path: ['closing'], message: 'Rata-rata persediaan harus lebih dari nol.' })

export const reorderInput = z.object({ demand: quantity, lead: quantity, safety: quantity })
export const runwayInput = z.object({ month, cash: money, outflow: money, inflow: money })
export const serviceCostInput = z.object({
  month, fixed: money, variable: money,
  transactions: z.string().trim().regex(/^\d{1,13}$/, 'Masukkan transaksi tertagih dalam bilangan bulat.')
    .transform(BigInt).refine(value => value > 0n, 'Transaksi tertagih harus lebih dari nol.'),
})
export const freelanceInput = z.object({
  earnings: money, expenses: money,
  hours: quantity.refine(value => value > 0n, 'Jam tertagih harus lebih dari nol.'),
})

type Values = Record<string, bigint | null>
type Output = { values: Values; status?: 'no-burn' | 'no-cogs' }
export type StockServiceResult = { success: true } & Output | { success: false; errors: Record<string, string[] | undefined> }

function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => Output) {
  return (input: unknown): StockServiceResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) return { success: false, errors: z.flattenError(parsed.error).fieldErrors }
    return { success: true, ...engine(parsed.data) }
  }
}

function round(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / 2n) / denominator
}

function ceil(numerator: bigint, denominator: bigint) {
  return (numerator + denominator - 1n) / denominator
}

export const calculateTurnover = calculate(turnoverInput, ({ start, end, cogs, opening, closing }) => {
  const sum = opening + closing
  const days = BigInt((Date.parse(end) - Date.parse(start)) / 86400000 + 1)
  return {
    values: {
      turnover: round(cogs * 200n, sum),
      days: cogs === 0n ? null : round(days * sum * 100n, cogs * 2n),
      average: sum * 50n,
    },
    status: cogs === 0n ? 'no-cogs' : undefined,
  }
})

export const calculateReorder = calculate(reorderInput, ({ demand, lead, safety }) => ({
  values: { reorder: ceil(demand * lead + safety * 1000n, 1000000n) },
}))

export const calculateRunway = calculate(runwayInput, ({ cash, outflow, inflow }) => {
  const burn = outflow - inflow
  return { values: { months: burn > 0n ? cash * 100n / burn : null, burn }, status: burn <= 0n ? 'no-burn' : undefined }
})

export const calculateServiceCost = calculate(serviceCostInput, ({ fixed, variable, transactions }) => ({
  values: { cost: ceil(fixed, transactions) + variable, allocation: ceil(fixed, transactions), total: fixed + variable * transactions },
}))

export const calculateFreelance = calculate(freelanceInput, ({ earnings, expenses, hours }) => ({
  values: { hourly: ceil((earnings + expenses) * 1000n, hours), requirement: earnings + expenses },
}))
