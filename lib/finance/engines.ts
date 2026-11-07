import { z } from 'zod'

const RATE_SCALE = 1_000_000n
const MONTHLY_DENOMINATOR = 12n * RATE_SCALE
const MAX_FUTURE_VALUE = 999_999_999_999_999_999n

const money = z
  .string()
  .trim()
  .regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.')
  .transform(BigInt)
const annualRate = z
  .string()
  .trim()
  .regex(/^\d{1,3}([.,]\d{1,4})?$/, 'Masukkan persen tahunan dengan maksimal empat desimal.')
  .transform((value) => {
    const [whole, fraction = ''] = value.replace(',', '.').split('.')
    return BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, '0'))
  })
  .refine((value) => value <= RATE_SCALE, 'Bunga tahunan harus antara 0 dan 100%.')
const periods = z
  .string()
  .trim()
  .regex(/^\d{1,4}$/, 'Masukkan jumlah periode berupa bilangan bulat.')
  .transform(Number)
  .refine((value) => value <= 1200, 'Maksimal 1.200 periode.')
const months = periods.refine((value) => value >= 1 && value <= 600, 'Tenor harus 1–600 bulan utuh.')

export const simpleInterestInput = z.object({ principal: money, rate: annualRate, months: periods })
export const compoundInterestInput = z.object({
  principal: money,
  rate: annualRate,
  periods,
  frequency: z.enum(['1', '2', '4', '12'], { error: 'Pilih frekuensi kapitalisasi.' }).transform(BigInt),
})
export const loanInput = z.object({ principal: money, rate: annualRate, months })
export const debtRatioInput = z.object({
  income: money.refine((value) => value > 0n, 'Pendapatan bersih harus lebih dari nol.'),
  debt: money,
})

export type LoanRow = { month: number; payment: bigint; principal: bigint; interest: bigint; balance: bigint }
type Output = {
  values: Record<string, bigint>
  schedule?: LoanRow[]
  notes?: string[]
  tiny?: string[]
  status?: 'shortfall' | 'zero-principal'
}
export type FinanceResult =
  ({ success: true } & Output) | { success: false; errors: Record<string, string[]> }
type Calculation = Output | { errors: Record<string, string[]> }

function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => Calculation) {
  return (input: unknown): FinanceResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    const output = engine(parsed.data)
    return 'errors' in output ? { success: false, errors: output.errors } : { success: true, ...output }
  }
}

const round = (numerator: bigint, denominator: bigint) => (2n * numerator + denominator) / (2n * denominator)
const ceil = (numerator: bigint, denominator: bigint) => (numerator + denominator - 1n) / denominator
const subRupiah =
  'Bunga sebelum pembulatan masih positif, tetapi hasil rupiah membulat menjadi Rp0. Ini efek pembulatan, bukan tingkat bunga nol.'

export const calculateSimpleInterest = calculate(simpleInterestInput, ({ principal, rate, months }) => {
  const numerator = principal * rate * BigInt(months)
  const interest = round(numerator, MONTHLY_DENOMINATOR)
  return {
    values: { interest, future: principal + interest },
    notes: numerator > 0n && interest === 0n ? [subRupiah] : [],
  }
})

export const calculateCompoundInterest = calculate(
  compoundInterestInput,
  ({ principal, rate, periods, frequency }) => {
    const denominator = RATE_SCALE * frequency
    const base = denominator + rate
    const power = base ** BigInt(periods)
    const divisor = denominator ** BigInt(periods)
    if (principal * power > MAX_FUTURE_VALUE * divisor) {
      return {
        errors: {
          periods: [
            'Saldo eksak melampaui batas model Rp999.999.999.999.999.999. Kurangi periode, bunga, atau pokok.',
          ],
        },
      }
    }
    const gainNumerator = principal * (power - divisor)
    const interest = round(gainNumerator, divisor)
    const periodic = round(rate, frequency)
    const annualDivisor = denominator ** frequency
    const effective = round((base ** frequency - annualDivisor) * RATE_SCALE, annualDivisor)
    return {
      values: {
        future: principal + interest,
        interest,
        periodic,
        effective,
        duration: (BigInt(periods) * 12n) / frequency,
      },
      notes: gainNumerator > 0n && interest === 0n ? [subRupiah] : [],
      tiny: rate > 0n && periodic === 0n ? ['periodic'] : [],
    }
  },
)

function scheduleTotals(schedule: LoanRow[], principal: bigint) {
  const total = schedule.reduce((sum, row) => sum + row.payment, 0n)
  const interest = schedule.reduce((sum, row) => sum + row.interest, 0n)
  let last = 0n,
    lastMonth = 0n
  for (const row of schedule)
    if (row.payment > 0n) {
      last = row.payment
      lastMonth = BigInt(row.month)
    }
  return {
    values: { total, interest, first: schedule[0].payment, last, lastMonth },
    schedule,
    status: principal === 0n ? ('zero-principal' as const) : undefined,
  }
}

export const calculateAnnuity = calculate(loanInput, ({ principal, rate, months }) => {
  const n = BigInt(months)
  const q = MONTHLY_DENOMINATOR + rate
  const growth = q ** n
  const standard =
    rate === 0n
      ? ceil(principal, n)
      : ceil(principal * rate * growth, MONTHLY_DENOMINATOR * (growth - MONTHLY_DENOMINATOR ** n))
  let balance = principal
  const schedule: LoanRow[] = []
  for (let month = 1; month <= months; month++) {
    const interest = round(balance * rate, MONTHLY_DENOMINATOR)
    const due = balance + interest
    const payment = month === months || standard > due ? due : standard
    const paidPrincipal = payment - interest
    balance -= paidPrincipal
    schedule.push({ month, payment, principal: paidPrincipal, interest, balance })
  }
  const totals = scheduleTotals(schedule, principal)
  return {
    ...totals,
    values: { ...totals.values, standard },
    notes: [
      ...(principal > 0n && rate > 0n && totals.values.interest === 0n ? [subRupiah] : []),
      ...(totals.values.last > standard
        ? [
            'Pembayaran penutup lebih besar dari acuan akibat pembulatan bunga bulanan. Periksa jadwal dan total pembayaran.',
          ]
        : []),
    ],
  }
})

export const calculateFlatLoan = calculate(loanInput, ({ principal, rate, months }) => {
  let previousPrincipal = 0n,
    previousInterest = 0n
  const schedule: LoanRow[] = []
  for (let month = 1; month <= months; month++) {
    const cumulativePrincipal = (principal * BigInt(month)) / BigInt(months)
    const cumulativeInterest = round(principal * rate * BigInt(month), MONTHLY_DENOMINATOR)
    const paidPrincipal = cumulativePrincipal - previousPrincipal
    const interest = cumulativeInterest - previousInterest
    schedule.push({
      month,
      payment: paidPrincipal + interest,
      principal: paidPrincipal,
      interest,
      balance: principal - cumulativePrincipal,
    })
    previousPrincipal = cumulativePrincipal
    previousInterest = cumulativeInterest
  }
  const totals = scheduleTotals(schedule, principal)
  return { ...totals, notes: principal > 0n && rate > 0n && totals.values.interest === 0n ? [subRupiah] : [] }
})

export const calculateDebtRatio = calculate(debtRatioInput, ({ income, debt }) => {
  const ratio = round(debt * 10_000n, income)
  return {
    values: { ratio, remaining: income - debt },
    status: debt > income ? 'shortfall' : undefined,
    tiny: debt > 0n && ratio === 0n ? ['ratio'] : [],
  }
})
