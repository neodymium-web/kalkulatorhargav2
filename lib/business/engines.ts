import { z } from 'zod'

const percentScale = 10_000n
const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah bulat hingga 13 digit tanpa pemisah.')
  .transform(value => BigInt(value))
const positiveMoney = (message: string) => money.refine(value => value > 0n, message)
const targetMargin = z.string().trim()
  .regex(/^\d{1,3}(?:[,.]\d{1,2})?$/, 'Masukkan persen dengan maksimal dua angka desimal.')
  .transform(value => {
    const [whole, fraction = ''] = value.split(/[,.]/)
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  })
  .refine(value => value < percentScale, 'Margin target harus kurang dari 100%.')

export const sellingPriceInput = z.object({ cost: money, margin: targetMargin })
export const grossMarginInput = z.object({
  price: positiveMoney('Harga jual harus lebih dari nol untuk menghitung margin.'),
  cost: money,
})
export const markupInput = z.object({
  price: money,
  cost: positiveMoney('Biaya per unit harus lebih dari nol untuk menghitung markup.'),
})
export const breakEvenInput = z.object({ fixed: money, price: money, variable: money })
export const profitTargetInput = breakEvenInput.extend({ target: money })

export type BusinessResult =
  | { success: false; errors: Record<string, string[] | undefined> }
  | { success: true; values: Record<string, bigint | null> }

function withInput<T>(schema: z.ZodType<T>, calculate: (input: T) => Record<string, bigint | null>) {
  return (input: unknown): BusinessResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) return { success: false, errors: z.flattenError(parsed.error).fieldErrors }
    return { success: true, values: calculate(parsed.data) }
  }
}

// For a nonnegative numerator and positive denominator, retain the exact threshold.
function divideUp(numerator: bigint, denominator: bigint) {
  return (numerator + denominator - 1n) / denominator
}

// Round to hundredths of a percent, with ties away from zero.
function roundedPercent(numerator: bigint, denominator: bigint) {
  const magnitude = (numerator < 0n ? -numerator : numerator) * percentScale
  const rounded = (magnitude + denominator / 2n) / denominator
  return numerator < 0n ? -rounded : rounded
}

export const calculateSellingPrice = withInput(sellingPriceInput, ({ cost, margin }) => ({
  // A zero selling price cannot have a defined gross margin.
  minimum: cost === 0n ? 1n : divideUp(cost * percentScale, percentScale - margin),
}))

export const calculateGrossMargin = withInput(grossMarginInput, ({ price, cost }) => ({
  profit: price - cost,
  percent: roundedPercent(price - cost, price),
}))

export const calculateMarkup = withInput(markupInput, ({ price, cost }) => ({
  difference: price - cost,
  percent: roundedPercent(price - cost, cost),
}))

function unitTarget(required: bigint, contribution: bigint) {
  return { contribution, units: required === 0n ? 0n : contribution > 0n ? divideUp(required, contribution) : null }
}

export const calculateBreakEven = withInput(breakEvenInput, ({ fixed, price, variable }) =>
  unitTarget(fixed, price - variable),
)

export const calculateProfitTarget = withInput(profitTargetInput, ({ fixed, price, variable, target }) =>
  unitTarget(fixed + target, price - variable),
)
