import { z } from 'zod'

export const costs = [
  ['materials', 'Bahan baku'],
  ['labor', 'Tenaga kerja langsung'],
  ['overhead', 'Overhead produksi'],
] as const

const rupiah = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan 0 hingga 13 digit rupiah tanpa pemisah.')
const units = z.string().trim().regex(/^\d{1,13}$/, { message: 'Masukkan jumlah unit bulat hingga 13 digit.', abort: true })
  .refine(value => BigInt(value || '0') > 0n, { message: 'Jumlah unit harus lebih dari nol.', abort: true })

export const hppInput = z.object({ materials: rupiah, labor: rupiah, overhead: rupiah, units })
export const formulaVersion = '1.0.0'

export function calculateHpp(input: unknown) {
  const result = hppInput.safeParse(input)
  if (!result.success) return { success: false as const, errors: result.error.flatten().fieldErrors }

  const total = BigInt(result.data.materials) + BigInt(result.data.labor) + BigInt(result.data.overhead)
  const quantity = BigInt(result.data.units)
  const perUnit = (total + quantity / 2n) / quantity
  return { success: true as const, total, perUnit }
}
