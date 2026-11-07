export type Rational = { n: bigint; d: bigint }
function gcd(a: bigint, b: bigint) {
  if (a < 0n) a = -a
  while (b) { const r = a % b; a = b; b = r }
  return a
}
export function fraction(n: bigint, d = 1n): Rational {
  if (d <= 0n) throw new Error('Positive denominator required')
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}
export const add = (a: Rational, b: Rational) => fraction(a.n * b.d + b.n * a.d, a.d * b.d)
export const subtract = (a: Rational, b: Rational) => fraction(a.n * b.d - b.n * a.d, a.d * b.d)
export const multiply = (a: Rational, b: Rational) => fraction(a.n * b.n, a.d * b.d)
export const divide = (a: Rational, b: Rational) => fraction(a.n * b.d, a.d * b.n)
export const round = (a: Rational, scale = 1n) => (2n * a.n * scale + a.d) / (2n * a.d)
export const ceiling = (a: Rational) => a.n / a.d + (a.n % a.d > 0n ? 1n : 0n)
