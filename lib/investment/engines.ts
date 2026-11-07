import { z } from 'zod'

const SCALE = 1_000_000n
const MONTHLY = SCALE * 12n
const MAX_PROJECTION = 999_999_999_999_999_999n

const money = z
  .string()
  .trim()
  .regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.')
  .transform(BigInt)
const positiveMoney = money.refine((value) => value > 0n, 'Modal awal harus lebih dari nol.')
const percentage = z
  .string()
  .trim()
  .regex(/^\d{1,3}([.,]\d{1,4})?$/, 'Masukkan persen dengan maksimal empat desimal.')
  .transform((value) => {
    const [whole, fraction = ''] = value.replace(',', '.').split('.')
    return BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, '0'))
  })
  .refine((value) => value <= SCALE, 'Persentase harus antara 0 dan 100%.')
const duration = z
  .string()
  .trim()
  .regex(/^\d{1,4}$/, 'Masukkan jumlah bulan/tahun berupa bilangan bulat.')
  .transform(Number)
const months = duration.refine((value) => value >= 1 && value <= 1200, 'Durasi harus 1–1.200 bulan utuh.')
const savingsMonths = duration.refine((value) => value >= 1 && value <= 600, 'Durasi harus 1–600 bulan utuh.')
const years = duration.refine((value) => value >= 1 && value <= 100, 'Masukkan 1–100 tahun selesai.')
const blankAsZero = (value: unknown) =>
  value === undefined || (typeof value === 'string' && !value.trim()) ? '0' : value

export const savingsInput = z.object({
  initial: money,
  target: money,
  rate: percentage,
  months: savingsMonths,
})
export const emergencyInput = z.object({ expenses: money, months, available: money })
export const depositInput = z.object({
  principal: money,
  rate: percentage,
  months,
  tax: z.preprocess(blankAsZero, percentage),
  fees: z.preprocess(blankAsZero, money),
})
export const roiInput = z.object({ initial: positiveMoney, ending: money, costs: money })
export const cagrInput = z.object({ initial: positiveMoney, ending: money, years })

export type PrecisionHint = 'positive' | 'negative' | 'above-minus-100'
type Output = {
  values: Record<string, bigint | null>
  precision?: Record<string, PrecisionHint>
  notes?: string[]
  status?: 'no-deposits' | 'covered' | 'negative-return'
}
export type InvestmentResult =
  ({ success: true } & Output) | { success: false; errors: Record<string, string[]> }

function calculate<T>(
  schema: z.ZodType<T>,
  compute: (value: T) => Output | { errors: Record<string, string[]> },
) {
  return (input: unknown): InvestmentResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    const output = compute(parsed.data)
    return 'errors' in output ? { success: false, errors: output.errors } : { success: true, ...output }
  }
}

function round(numerator: bigint, denominator: bigint) {
  const magnitude = numerator < 0n ? -numerator : numerator
  const rounded = (2n * magnitude + denominator) / (2n * denominator)
  return numerator < 0n ? -rounded : rounded
}
const ceil = (numerator: bigint, denominator: bigint) => (numerator + denominator - 1n) / denominator

export const calculateSavingsGoal = calculate(savingsInput, ({ initial, target, rate, months }) => {
  const n = BigInt(months)
  const growth = (MONTHLY + rate) ** n
  const divisor = MONTHLY ** n
  const gap = target * divisor - initial * growth
  const payment =
    gap <= 0n ? 0n : rate === 0n ? ceil(target - initial, n) : ceil(gap * rate, MONTHLY * (growth - divisor))
  const totalDeposits = payment * n
  const finalNumerator =
    rate === 0n ? initial + totalDeposits : initial * growth * rate + payment * MONTHLY * (growth - divisor)
  const finalDenominator = rate === 0n ? 1n : rate * divisor
  if (finalNumerator > MAX_PROJECTION * finalDenominator) {
    return {
      errors: {
        months: [
          'Proyeksi eksak melampaui batas model Rp999.999.999.999.999.999. Kurangi durasi, tingkat, atau saldo.',
        ],
      },
    }
  }
  const future = round(finalNumerator * 100n, finalDenominator)
  const startingGrowthNumerator = initial * (growth - divisor)
  const startingGrowth = round(startingGrowthNumerator * 100n, divisor)
  const allGrowthNumerator = finalNumerator - (initial + totalDeposits) * finalDenominator
  const surplusNumerator = finalNumerator - target * finalDenominator
  const allGrowth = future - (initial + totalDeposits) * 100n
  const surplus = future - target * 100n
  const precision: Record<string, PrecisionHint> = {}
  for (const [key, numerator, value] of [
    ['startingGrowth', startingGrowthNumerator, startingGrowth],
    ['allGrowth', allGrowthNumerator, allGrowth],
    ['surplus', surplusNumerator, surplus],
  ] as const)
    if (numerator > 0n && value === 0n) precision[key] = 'positive'
  return {
    values: {
      payment: payment * 100n,
      deposits: totalDeposits * 100n,
      startingGrowth,
      allGrowth,
      future,
      surplus,
    },
    precision,
    status: payment === 0n ? 'no-deposits' : undefined,
  }
})

export const calculateEmergencyFund = calculate(emergencyInput, ({ expenses, months, available }) => {
  const target = expenses * BigInt(months)
  const gap = target > available ? target - available : 0n
  const surplus = available > target ? available - target : 0n
  const coverage = expenses === 0n ? null : round(available * 100n, expenses)
  const precision: Record<string, PrecisionHint> = {}
  if (available > 0n && coverage === 0n) precision.coverage = 'positive'
  return {
    values: { target, gap, surplus, coverage },
    status: gap === 0n ? 'covered' : undefined,
    precision,
    notes:
      expenses === 0n
        ? ['Pengeluaran wajib nol: cakupan bulan tidak terdefinisi karena pembaginya nol.']
        : [],
  }
})

export const calculateDeposit = calculate(depositInput, ({ principal, rate, months, tax, fees }) => {
  const grossNumerator = principal * rate * BigInt(months)
  const gross = round(grossNumerator, MONTHLY)
  const withholding = round(gross * tax, SCALE)
  const net = gross - withholding - fees
  const maturity = principal + net
  if (maturity < 0n)
    return {
      errors: {
        fees: [
          'Biaya melebihi pokok dan bunga setelah potongan. Saldo jatuh tempo negatif tidak didukung model ini.',
        ],
      },
    }
  return {
    values: { maturity, gross, withholding, fees, net },
    status: net < 0n ? 'negative-return' : undefined,
    notes:
      grossNumerator > 0n && gross === 0n
        ? ['Bunga bruto eksak masih positif tetapi membulat menjadi Rp0 pada ledger rupiah.']
        : [],
  }
})

export const calculateInvestmentRoi = calculate(roiInput, ({ initial, ending, costs }) => {
  const gain = ending - initial - costs
  const roi = round(gain * 10_000n, initial)
  const precision: Record<string, PrecisionHint> = {}
  if (gain !== 0n && roi === 0n) precision.roi = gain < 0n ? 'negative' : 'positive'
  return {
    values: { gain, roi },
    status: gain < 0n ? 'negative-return' : undefined,
    precision,
  }
})

export const calculateCagr = calculate(cagrInput, ({ initial, ending, years }) => {
  if (ending === 0n) return { values: { cagr: -SCALE } }
  const y = BigInt(years)
  const target = ending * SCALE ** y
  let low = 0n
  let high = ending >= initial ? (ending * SCALE) / initial + 1n : SCALE
  while (high - low > 1n) {
    const midpoint = (low + high) / 2n
    if (initial * midpoint ** y <= target) low = midpoint
    else high = midpoint
  }
  const threshold = initial * (2n * low + 1n) ** y
  const twiceScaledTarget = ending * (2n * SCALE) ** y
  // At an exact midpoint, rounding a negative rate away from zero chooses the lower growth factor.
  const up = ending >= initial ? twiceScaledTarget >= threshold : twiceScaledTarget > threshold
  const cagr = low + (up ? 1n : 0n) - SCALE
  const precision: Record<string, PrecisionHint> = {}
  if (cagr === 0n && ending !== initial) precision.cagr = ending < initial ? 'negative' : 'positive'
  if (cagr === -SCALE) precision.cagr = 'above-minus-100'
  return { values: { cagr }, precision }
})
