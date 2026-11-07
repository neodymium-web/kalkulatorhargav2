import { z } from 'zod'

const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
const count = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan bilangan bulat nonnegatif hingga 13 digit.').transform(BigInt)

export const roasInput = z.object({
  revenue: money,
  spend: money.refine(value => value > 0n, 'Biaya iklan harus lebih dari nol agar ROAS terdefinisi.'),
})
export const breakEvenRoasInput = z.object({
  revenue: money.refine(value => value > 0n, 'Pendapatan harus lebih dari nol untuk model ROAS impas.'),
  variable: money,
})
export const acosInput = z.object({ spend: money, revenue: money })
export const conversionInput = z.object({
  visits: count.refine(value => value > 0n, 'Total kunjungan harus lebih dari nol.'),
  purchasing: count,
}).refine(({ visits, purchasing }) => purchasing <= visits, {
  path: ['purchasing'], message: 'Kunjungan yang membeli tidak boleh melebihi total kunjungan.',
})
export const aovInput = z.object({
  revenue: money,
  orders: count.refine(value => value > 0n, 'Jumlah pesanan harus lebih dari nol.'),
})

type Output = { values: Record<string, bigint | null>; status?: 'no-finite-roas' | 'undefined-acos' }
export type MetricResult = { success: true } & Output | { success: false; errors: Record<string, string[] | undefined> }

function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => Output) {
  return (input: unknown): MetricResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) return { success: false, errors: z.flattenError(parsed.error).fieldErrors }
    return { success: true, ...engine(parsed.data) }
  }
}

// Round exact ratios to the closest display increment, with ties away from zero.
function round(numerator: bigint, denominator: bigint) {
  const magnitude = numerator < 0n ? -numerator : numerator
  const result = (magnitude + denominator / 2n) / denominator
  return numerator < 0n ? -result : result
}

export const calculateRoas = calculate(roasInput, ({ revenue, spend }) => ({
  values: { roas: round(revenue * 100n, spend) },
}))

export const calculateBreakEvenRoas = calculate(breakEvenRoasInput, ({ revenue, variable }) => {
  const contribution = revenue - variable
  return {
    values: {
      threshold: contribution > 0n ? (revenue * 100n + contribution - 1n) / contribution : null,
      contribution,
      margin: round(contribution * 10000n, revenue),
    },
    status: contribution > 0n ? undefined : 'no-finite-roas',
  }
})

export const calculateAcos = calculate(acosInput, ({ spend, revenue }) => ({
  values: { acos: revenue === 0n ? null : round(spend * 10000n, revenue) },
  status: revenue === 0n ? 'undefined-acos' : undefined,
}))

export const calculateConversion = calculate(conversionInput, ({ visits, purchasing }) => ({
  values: { conversion: round(purchasing * 10000n, visits) },
}))

export const calculateAov = calculate(aovInput, ({ revenue, orders }) => ({
  values: { aov: round(revenue * 100n, orders) },
}))
