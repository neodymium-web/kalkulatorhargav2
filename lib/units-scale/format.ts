import type { Rational } from '../utilities-materials/rational'
import type { TinySign } from './engines'
const integer = new Intl.NumberFormat('id-ID')
export function formatUnits(value: bigint, digits: number, unit: string, tiny?: TinySign) {
  const step = `0,${'0'.repeat(digits - 1)}1 ${unit}`
  if (tiny === 'positive') return `<${step} (positif)`
  if (tiny === 'negative') return `Antara −${step} dan 0 ${unit} (negatif)`
  const magnitude = value < 0n ? -value : value, scale = 10n ** BigInt(digits)
  return `${value < 0n ? '−' : ''}${integer.format(magnitude / scale)},${(magnitude % scale).toString().padStart(digits, '0')} ${unit}`
}
export function formatExact(value: Rational, unit: string) {
  return `${value.n.toString().replace(/^-/, '−')}${value.d === 1n ? '' : '/' + value.d} ${unit}`
}
