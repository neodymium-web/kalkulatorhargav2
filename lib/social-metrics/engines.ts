import { z } from 'zod'

const count = z.string().trim()
  .regex(/^\d{1,13}$/, 'Masukkan bilangan bulat nonnegatif hingga 13 digit, tanpa pemisah ribuan.')
  .transform(BigInt)
const positive = count.refine(v => v > 0n, 'Pembagi harus lebih dari nol agar hasil terdefinisi.')
const money = z.string().trim()
  .regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit, tanpa pemisah ribuan.')
  .transform(BigInt)
export const engagementInput = z.object({
  likes: count, comments: count, saves: count, shares: count,
  basis: z.enum(['followers', 'reach'], { error: 'Pilih basis pengikut atau reach.' }),
  denominator: positive,
})
export const followerGrowthInput = z.object({ start: count, end: count })
export const cpmInput = z.object({ spend: money, impressions: positive })
export const cpcInput = z.object({ spend: money, clicks: positive })
export const cpaInput = z.object({
  spend: money,
  action: z.enum(['sale', 'lead', 'signup'], { error: 'Pilih definisi hasil teratribusi.' }),
  acquisitions: positive,
})
export type Acquisition = 'sale' | 'lead' | 'signup'
export type SocialOutput = {
  values: Record<string, bigint | null>
  tiny?: 'positive' | 'negative'
  basis?: 'followers' | 'reach'
  action?: Acquisition
  overBasis?: boolean
}
export type SocialResult = ({ success: true } & SocialOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => SocialOutput) {
  return (input: unknown): SocialResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    return { success: true, ...engine(parsed.data) }
  }
}
// Quantize the final exact ratio only; retain the sign of nonzero subprecision values.
function ratio(numerator: bigint, denominator: bigint) {
  const magnitude = numerator < 0n ? -numerator : numerator
  const rounded = (2n * magnitude + denominator) / (2n * denominator)
  return {
    value: numerator < 0n ? -rounded : rounded,
    tiny: rounded === 0n && numerator !== 0n ? numerator < 0n ? 'negative' as const : 'positive' as const : undefined,
  }
}
export const calculateEngagement = calculate(engagementInput, ({ likes, comments, saves, shares, basis, denominator }) => {
  const interactions = likes + comments + saves + shares
  const result = ratio(interactions * 10000n, denominator)
  return { values: { rate: result.value, interactions, denominator }, tiny: result.tiny, basis, overBasis: interactions > denominator }
})
export const calculateFollowerGrowth = calculate(followerGrowthInput, ({ start, end }) => {
  const change = end - start
  const result = start > 0n ? ratio(change * 10000n, start) : undefined
  return { values: { rate: result?.value ?? null, change, start, end }, tiny: result?.tiny }
})
function cost(spend: bigint, events: bigint, multiplier = 1n): SocialOutput {
  const result = ratio(spend * multiplier * 100n, events)
  return { values: { cost: result.value, spend, events }, tiny: result.tiny }
}
export const calculateCpm = calculate(cpmInput, ({ spend, impressions }) => cost(spend, impressions, 1000n))
export const calculateCpc = calculate(cpcInput, ({ spend, clicks }) => cost(spend, clicks))
export const calculateCpa = calculate(cpaInput, ({ spend, acquisitions, action }) => ({ ...cost(spend, acquisitions), action }))
