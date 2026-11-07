import { cash, type Rational, type Entry } from './engines'
import { quantizeSigned } from '../units-scale/engines'
import { formatUnits, formatExact } from '../units-scale/format'
export function cashText(n: bigint) { return `${n < 0n ? '−' : ''}Rp ${new Intl.NumberFormat('id-ID').format(n < 0n ? -n : n)}` }
export function formatEntry(value: Rational, kind?: Entry['kind']): string {
  if (kind === 'cash') return cashText(cash(value))
  if (kind === 'integer') return new Intl.NumberFormat('id-ID').format(value.n / value.d)
  if (kind === 'days' || kind === 'percent') {
    const n = quantizeSigned(value, 6), tiny = value.n !== 0n && n === 0n ? value.n < 0n ? 'negative' : 'positive' : undefined
    return `${formatUnits(n, 6, kind === 'days' ? 'hari' : '%', tiny)} (eksak ${formatExact(value, kind === 'days' ? 'hari' : '%')})`
  }
  if (100000000n % value.d !== 0n) return `${formatExact(value, 'rupiah')} (pecahan eksak)`
  const negative = value.n < 0n, ticks = (negative ? -value.n : value.n) * (100000000n / value.d), digits = (ticks % 100000000n).toString().padStart(8, '0').replace(/0+$/, '')
  return `${negative ? '−' : ''}Rp ${new Intl.NumberFormat('id-ID').format(ticks / 100000000n)}${digits ? ',' + digits : ''}`
}
