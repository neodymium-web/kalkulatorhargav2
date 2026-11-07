import { z } from 'zod'

const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
const signedMoney = z.string().trim().regex(/^-?\d{1,13}$/, 'Masukkan arus kas rupiah utuh hingga 13 digit.').transform(BigInt)
const quantity = z.string().trim().regex(/^\d{1,13}(?:[,.]\d{1,3})?$/, 'Masukkan angka nonnegatif hingga tiga desimal.')
  .transform(value => {
    const [whole, fraction = ''] = value.split(/[,.]/)
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'))
  })
const positiveQuantity = quantity.refine(value => value > 0n, 'Nilai harus lebih dari nol.')
const count = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan bilangan bulat hingga 13 digit.').transform(BigInt)

export const foodCostInput = z.object({
  servings: count.refine(value => value > 0n, 'Jumlah porsi harus lebih dari nol.'),
  ingredients: z.array(z.object({
    price: money,
    package: positiveQuantity,
    usage: quantity,
    unit: z.enum(['g', 'kg', 'ml', 'l', 'unit'], 'Pilih satuan yang tersedia.'),
  })).min(1, 'Tambahkan minimal satu bahan.').max(100, 'Maksimal 100 bahan.'),
})
export const projectQuoteInput = z.object({ hours: quantity, hourly: money, materials: money, overhead: money, profit: money })
export const eoqInput = z.object({
  demand: count,
  order: money,
  holding: money.refine(value => value > 0n, 'Biaya simpan harus lebih dari nol.'),
})
export const paybackInput = z.object({
  investment: money,
  period: z.enum(['bulan', 'tahun'], 'Pilih bulan atau tahun.'),
  flows: z.array(z.object({ amount: signedMoney })).min(1, 'Tambahkan minimal satu periode.').max(120, 'Maksimal 120 periode.'),
})
export const volumetricInput = z.object({
  length: positiveQuantity, width: positiveQuantity, height: positiveQuantity,
  divisor: positiveQuantity, actual: quantity,
})

type Output = { values: Record<string, bigint | null>; status?: 'degenerate' | 'unrecovered'; warning?: string; period?: string }
export type BatchFourResult = { success: true } & Output | { success: false; errors: Record<string, string[] | undefined> }

function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => Output) {
  return (input: unknown): BatchFourResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        const messages = errors[key] ?? []
        messages.push(issue.message)
        errors[key] = messages
      }
      return { success: false, errors }
    }
    return { success: true, ...engine(parsed.data) }
  }
}

const ceil = (numerator: bigint, denominator: bigint) => (numerator + denominator - 1n) / denominator
const round = (numerator: bigint, denominator: bigint) => (numerator + denominator / 2n) / denominator

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

export const calculateFoodCost = calculate(foodCostInput, ({ servings, ingredients }) => {
  let numerator = 0n
  let denominator = 1n
  for (const row of ingredients) {
    const next = numerator * row.package + row.price * row.usage * denominator
    const divisor = denominator * row.package
    const common = gcd(next, divisor)
    numerator = next / common
    denominator = divisor / common
  }
  return { values: { total: ceil(numerator, denominator), perServing: ceil(numerator, denominator * servings) } }
})

export const calculateProjectQuote = calculate(projectQuoteInput, ({ hours, hourly, materials, overhead, profit }) => {
  const labor = hours * hourly
  const cost = labor + (materials + overhead) * 1000n
  return { values: { quote: ceil(cost + profit * 1000n, 1000n), cost: ceil(cost, 1000n), labor: ceil(labor, 1000n) } }
})

// Returns floor(sqrt(n)) using only integer operations.
function integerSqrt(n: bigint) {
  if (n < 2n) return n
  let value = n
  let next = (value + 1n) / 2n
  while (next < value) {
    value = next
    next = (value + n / value) / 2n
  }
  return value
}

export const calculateEoq = calculate(eoqInput, ({ demand, order, holding }): Output => {
  if (demand === 0n || order === 0n) return { values: { quantity: 0n }, status: 'degenerate' }
  const twiceOrdering = 2n * demand * order
  const floor = integerSqrt(twiceOrdering / holding)
  const quantity = floor < 1n ? 1n : twiceOrdering <= holding * floor * (floor + 1n) ? floor : floor + 1n
  return { values: {
    quantity,
    ordering: round(demand * order, quantity),
    holding: round(holding * quantity, 2n),
  } }
})

export const calculatePayback = calculate(paybackInput, ({ investment, flows, period }) => {
  let cumulative = 0n
  let payback: bigint | null = investment === 0n ? 0n : null
  let fellBelow = false
  for (const [index, flow] of flows.entries()) {
    const before = cumulative
    cumulative += flow.amount
    if (payback === null && cumulative >= investment) {
      payback = round((BigInt(index) * flow.amount + investment - before) * 100n, flow.amount)
    }
    if (payback !== null && cumulative < investment) fellBelow = true
  }
  return {
    values: { payback, cumulative }, period,
    status: payback === null ? 'unrecovered' : undefined,
    warning: fellBelow ? 'Arus setelah pemulihan pertama menurunkan saldo kembali di bawah investasi.' : undefined,
  }
})

export const calculateVolumetric = calculate(volumetricInput, ({ length, width, height, divisor, actual }) => {
  const volume = length * width * height
  const actualMicro = actual * 1000n
  return { values: {
    volumetric: round(volume, divisor),
    comparison: volume > actualMicro * divisor ? round(volume, divisor) : actualMicro,
  } }
})
