import { z } from 'zod'

const SCALE = 1_000_000n
const MAX_FUTURE = 999_999_999_999_999_999n
const money = z
  .string()
  .trim()
  .regex(/^\d{1,13}$/, 'Masukkan rupiah bulat nonnegatif hingga 13 digit.')
  .transform(BigInt)
const signedMoney = z
  .string()
  .trim()
  .regex(/^-?\d{1,13}$/, 'Masukkan rupiah bulat hingga 13 digit; arus keluar memakai minus.')
  .transform(BigInt)
const quantity = money.refine((value) => value > 0n, 'Jumlah harus berupa bilangan bulat positif.')
const price = z
  .string()
  .trim()
  .regex(/^\d{1,13}([.,]\d{1,2})?$/, 'Masukkan harga nonnegatif hingga dua desimal rupiah.')
  .transform((value) => {
    const [whole, fraction = ''] = value.replace(',', '.').split('.')
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  })
const rate = z
  .string()
  .trim()
  .regex(/^\d{1,3}([.,]\d{1,4})?$/, 'Masukkan persen tahunan dengan maksimal empat desimal.')
  .transform((value) => {
    const [whole, fraction = ''] = value.replace(',', '.').split('.')
    return BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'))
  })
  .refine((value) => value <= SCALE, 'Tingkat tahunan harus antara 0 dan 100%.')
const years = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, 'Masukkan tahun utuh.')
  .transform(Number)
  .refine((value) => value <= 100, 'Maksimal 100 tahun; nol tahun diperbolehkan.')
const blankAsZero = (value: unknown) =>
  value === undefined || (typeof value === 'string' && !value.trim()) ? '0' : value

export const presentValueInput = z.object({ future: money, rate, years })
export const npvInput = z.object({
  rate,
  cashflows: z
    .array(z.object({ amount: signedMoney }))
    .min(1, 'Isi minimal arus kas tahun 0.')
    .max(101, 'Maksimal 101 baris, tahun 0 sampai 100.'),
})
export const inflationInput = z.object({ price: money, rate, years })
export const averageStockInput = z.object({
  sharesPerLot: quantity,
  purchases: z
    .array(z.object({ price, lots: quantity, fee: money }))
    .min(1, 'Isi minimal satu transaksi.')
    .max(100, 'Maksimal 100 transaksi.'),
})
export const stockProfitInput = z.object({
  buyPrice: price,
  sellPrice: price,
  lots: quantity,
  sharesPerLot: quantity,
  buyFee: money,
  sellFee: money,
  sellTax: z.preprocess(blankAsZero, money),
})

export type Precision = 'positive' | 'negative'
export type CashFlowRow = { period: number; flow: bigint; present: bigint; precision?: Precision }
type Output = {
  values: Record<string, bigint>
  precision?: Record<string, Precision>
  breakdown?: CashFlowRow[]
  status?: 'positive-npv' | 'negative-npv' | 'zero-npv'
}
export type ValuationResult =
  ({ success: true } & Output) | { success: false; errors: Record<string, string[]> }
function calculate<T>(
  schema: z.ZodType<T>,
  compute: (value: T) => Output | { errors: Record<string, string[]> },
) {
  return (input: unknown): ValuationResult => {
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
function round(n: bigint, d: bigint) {
  const magnitude = n < 0n ? -n : n
  const result = (2n * magnitude + d) / (2n * d)
  return n < 0n ? -result : result
}
function tiny(n: bigint, rounded: bigint): Precision | undefined {
  return n !== 0n && rounded === 0n ? (n < 0n ? 'negative' : 'positive') : undefined
}
function gcd(a: bigint, b: bigint): bigint {
  return b === 0n ? a : gcd(b, a % b)
}
function fraction(n: bigint, d: bigint) {
  const divisor = gcd(n < 0n ? -n : n, d)
  return { n: n / divisor, d: d / divisor }
}

export const calculatePresentValue = calculate(presentValueInput, ({ future, rate, years }) => {
  const growth = (SCALE + rate) ** BigInt(years),
    divisor = SCALE ** BigInt(years)
  const n = future * divisor
  const present = round(n * 100n, growth)
  const difference = future * 100n - present
  const precision: Record<string, Precision> = {}
  if (tiny(n, present)) precision.present = 'positive'
  if (tiny(future * (growth - divisor), difference)) precision.difference = 'positive'
  return { values: { present, future: future * 100n, difference }, precision }
})

export const calculateNpv = calculate(npvInput, ({ rate, cashflows }) => {
  let total = { n: 0n, d: 1n },
    power = 1n,
    nominalPower = 1n,
    nominal = 0n
  const breakdown: CashFlowRow[] = []
  for (const [period, flow] of cashflows.entries()) {
    const discounted = fraction(flow.amount * nominalPower, power)
    total = fraction(total.n * discounted.d + discounted.n * total.d, total.d * discounted.d)
    const present = round(discounted.n * 100n, discounted.d)
    breakdown.push({ period, flow: flow.amount, present, precision: tiny(discounted.n, present) })
    nominal += flow.amount
    power *= SCALE + rate
    nominalPower *= SCALE
  }
  const npv = round(total.n * 100n, total.d)
  const precision: Record<string, Precision> = {}
  const hint = tiny(total.n, npv)
  if (hint) precision.npv = hint
  return {
    values: { npv, initial: cashflows[0].amount * 100n, nominal: nominal * 100n },
    precision,
    breakdown,
    status: total.n > 0n ? 'positive-npv' : total.n < 0n ? 'negative-npv' : 'zero-npv',
  }
})

export const calculateInflation = calculate(inflationInput, ({ price, rate, years }) => {
  const growth = (SCALE + rate) ** BigInt(years),
    divisor = SCALE ** BigInt(years)
  if (price * growth > MAX_FUTURE * divisor)
    return {
      errors: {
        years: [
          'Harga masa depan eksak melampaui batas model Rp999.999.999.999.999.999. Kurangi tahun, tingkat, atau harga.',
        ],
      },
    }
  const future = round(price * growth * 100n, divisor)
  const purchasing = round(price * divisor * 100n, growth)
  const increase = future - price * 100n,
    loss = price * 100n - purchasing
  const precision: Record<string, Precision> = {}
  for (const [key, n, value] of [
    ['purchasing', price * divisor, purchasing],
    ['increase', price * (growth - divisor), increase],
    ['loss', price * (growth - divisor), loss],
  ] as const)
    if (tiny(n, value)) precision[key] = 'positive'
  return { values: { future, purchasing, increase, loss }, precision }
})

export const calculateAverageStock = calculate(averageStockInput, ({ sharesPerLot, purchases }) => {
  let shares = 0n,
    lots = 0n,
    gross = 0n,
    fees = 0n
  for (const row of purchases) {
    const units = row.lots * sharesPerLot
    shares += units
    lots += row.lots
    gross += row.price * units
    fees += row.fee * 100n
  }
  const cost = gross + fees
  const average = round(cost, shares),
    perLot = round(cost * sharesPerLot, shares)
  const precision: Record<string, Precision> = {}
  if (tiny(cost, average)) precision.average = 'positive'
  if (tiny(cost, perLot)) precision.perLot = 'positive'
  return { values: { average, cost, gross, fees, shares, lots, perLot }, precision }
})

export const calculateStockProfit = calculate(
  stockProfitInput,
  ({
    buyPrice,
    sellPrice,
    lots,
    sharesPerLot,
    buyFee,
    sellFee,
    sellTax,
  }): Output | { errors: Record<string, string[]> } => {
    const shares = lots * sharesPerLot
    const acquisition = shares * buyPrice + buyFee * 100n
    if (acquisition === 0n)
      return {
        errors: {
          buyPrice: ['Biaya perolehan harus positif agar ROI terdefinisi. Periksa harga dan biaya beli.'],
        },
      }
    const grossSale = shares * sellPrice
    if (sellFee * 100n > grossSale)
      return { errors: { sellFee: ['Biaya jual melebihi nilai jual bruto untuk saham yang dijual.'] } }
    const sellingCosts = (sellFee + sellTax) * 100n
    if (sellingCosts > grossSale)
      return {
        errors: {
          sellTax: [
            'Biaya dan pajak jual melebihi nilai jual bruto. Hasil jual bersih negatif tidak didukung.',
          ],
        },
      }
    const netSale = grossSale - sellingCosts
    const profit = netSale - acquisition
    const roi = round(profit * 10000n, acquisition)
    const precision: Record<string, Precision> = {}
    const hint = tiny(profit, roi)
    if (hint) precision.roi = hint
    return { values: { profit, roi, acquisition, grossSale, sellingCosts, netSale, shares }, precision }
  },
)
