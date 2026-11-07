import { z } from 'zod'

const whole = z
  .string()
  .trim()
  .regex(/^\d{1,13}$/, 'Masukkan bilangan bulat nonnegatif hingga 13 digit.')
  .transform(BigInt)
const positive = whole.refine((v) => v > 0n, 'Harus lebih dari nol.')
const percent = z
  .string()
  .trim()
  .regex(/^\d{1,3}([.,]\d{1,2})?$/, 'Masukkan persentase dengan maksimal dua desimal.')
  .transform((v) => {
    const [a, b = ''] = v.replace(',', '.').split('.')
    return BigInt(a) * 100n + BigInt(b.padEnd(2, '0'))
  })
  .refine((v) => v <= 10000n, 'Persentase harus antara 0 dan 100%.')
const quantity = z
  .string()
  .trim()
  .regex(/^\d{1,13}([.,]\d{1,3})?$/, 'Masukkan kuantitas nonnegatif hingga tiga desimal.')
  .transform((v) => {
    const [a, b = ''] = v.replace(',', '.').split('.')
    return BigInt(a) * 1000n + BigInt(b.padEnd(3, '0'))
  })
export type SellerResult =
  | { success: true; values: Record<string, bigint>; tiny?: string[] }
  | { success: false; errors: Record<string, string[]> }
function run<T>(
  schema: z.ZodType<T>,
  compute: (v: T) => Omit<Extract<SellerResult, { success: true }>, 'success'>,
) {
  return (input: unknown): SellerResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    return { success: true, ...compute(parsed.data) }
  }
}
const round = (n: bigint, d: bigint) => (2n * n + d) / (2n * d)
export const calculatePromo = run(
  z
    .object({ price: whole, discount: whole, share: percent })
    .refine((v) => v.discount <= v.price, {
      path: ['discount'],
      message: 'Diskon tidak boleh melebihi harga awal.',
    }),
  (v) => {
    const burden = round(v.discount * v.share * 100n, 10000n)
    return {
      values: {
        burden,
        platform: v.discount * 100n - burden,
        buyer: (v.price - v.discount) * 100n,
        proceeds: v.price * 100n - burden,
      },
      tiny: [
        ...(v.discount * v.share > 0n && burden === 0n ? ['burden'] : []),
        ...(v.discount * (10000n - v.share) > 0n && v.discount * 100n === burden ? ['platform'] : []),
        ...(v.price * 10000n > v.discount * v.share && v.price * 100n === burden ? ['proceeds'] : []),
      ],
    }
  },
)
export const calculateShipping = run(
  z
    .object({ actual: whole, buyer: whole, credit: whole })
    .refine((v) => v.buyer + v.credit <= v.actual, {
      path: ['credit'],
      message: 'Pembayaran pembeli dan subsidi melebihi ongkir aktual. Periksa cakupan biayanya.',
    }),
  (v) => ({
    values: {
      seller: (v.actual - v.buyer - v.credit) * 100n,
      actual: v.actual * 100n,
      buyer: v.buyer * 100n,
      credit: v.credit * 100n,
    },
  }),
)
const material = z.object({
  price: whole,
  quantity: quantity.refine((v) => v > 0n, 'Kuantitas pembelian harus positif.'),
  usage: quantity,
  waste: percent.refine((v) => v < 10000n, 'Waste harus kurang dari 100%.'),
  unit: z.enum(['pcs', 'm', 'cm', 'g', 'kg', 'ml', 'l'], {
    error: 'Pilih satuan yang sama untuk pembelian dan penggunaan.',
  }),
})
function gcd(a: bigint, b: bigint): bigint {
  return b === 0n ? a : gcd(b, a % b)
}
export const calculatePackaging = run(
  z.object({ shipments: positive, materials: z.array(material).min(1).max(100) }),
  (v) => {
    let numerator = 0n,
      denominator = 1n
    for (const row of v.materials) {
      const n = row.price * row.usage * 10000n,
        d = row.quantity * (10000n - row.waste)
      numerator = numerator * d + n * denominator
      denominator *= d
      const divisor = gcd(numerator, denominator)
      numerator /= divisor
      denominator /= divisor
    }
    const per = round(numerator * 100n, denominator),
      total = round(numerator * v.shipments * 100n, denominator)
    return {
      values: { per, total },
      tiny: numerator > 0n ? [...(per === 0n ? ['per'] : []), ...(total === 0n ? ['total'] : [])] : [],
    }
  },
)
export const calculateReturns = run(
  z
    .object({ gross: whole, recovery: whole, rate: percent, orders: positive })
    .refine((v) => v.recovery <= v.gross, {
      path: ['recovery'],
      message: 'Pemulihan tidak boleh melebihi kerugian bruto.',
    }),
  (v) => {
    const net = v.gross - v.recovery,
      per = round(net * v.rate * 100n, 10000n),
      total = round(net * v.rate * v.orders * 100n, 10000n)
    return {
      values: { per, net: net * 100n, total },
      tiny: net * v.rate > 0n ? [...(per === 0n ? ['per'] : []), ...(total === 0n ? ['total'] : [])] : [],
    }
  },
)
export const calculateCod = run(z.object({ attempts: whole, rate: percent, loss: whole }), (v) => {
  const total = round(v.attempts * v.rate * v.loss * 100n, 10000n),
    per = round(v.rate * v.loss * 100n, 10000n)
  return {
    values: { total, failures: v.attempts * v.rate, per },
    tiny:
      v.rate * v.loss > 0n
        ? [...(per === 0n ? ['per'] : []), ...(v.attempts > 0n && total === 0n ? ['total'] : [])]
        : [],
  }
})
