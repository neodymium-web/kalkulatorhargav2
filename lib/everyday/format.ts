import { formatValuation } from '../valuation/format'
import { rupiah } from '../finance/format'
import type { Precision } from './engines'
const integer = new Intl.NumberFormat('id-ID')
export function formatEveryday(value: bigint | null, unit: string, tiny?: Precision) {
  if (value === null) return 'Tidak terdefinisi (basis nol)'
  if (unit === 'IDR') return rupiah(value)
  if (unit === 'cents') return formatValuation(value, 'IDR-cents', tiny)
  if (unit === 'pct2') return formatValuation(value, '%', tiny)
  const digits = unit === 'factor' || unit.endsWith('number6') ? 6 : unit === 'quantity3' ? 3 : 4
  const signed = unit.startsWith('signed-')
  const percent = unit === 'pct4' || unit === 'signed-pct4'
  const suffix = percent ? '%' : ''
  const increment = `0,${'0'.repeat(digits - 1)}1${suffix}`
  if (tiny) return tiny === 'positive'
    ? signed ? `Antara 0${suffix} dan +${increment} (positif)` : `<${increment} (positif)`
    : `Antara −${increment} dan 0${suffix} (negatif)`
  const scale = 10n ** BigInt(digits), n = value < 0n ? -value : value
  let fraction = String(n % scale).padStart(digits, '0')
  if (unit.endsWith('number6') || unit === 'quantity3') fraction = fraction.replace(/0+$/, '')
  return `${value < 0n ? '−' : signed && value > 0n ? '+' : ''}${integer.format(n / scale)}${fraction ? ',' + fraction : ''}${suffix}`
}
