import { formatValuation } from '../valuation/format'
import { rupiah } from '../finance/format'
import type { Precision } from './engines'
const integer = new Intl.NumberFormat('id-ID')
export function formatCreator(value: bigint | null, unit: string, tiny?: Precision) {
  if (value === null) return 'Tidak terdefinisi (pembagi nol)'
  if (unit === 'IDR') return rupiah(value)
  if (unit === 'cents') return formatValuation(value, 'IDR-cents', tiny)
  if (unit === '%') return formatValuation(value, '%', tiny)
  const signed = unit === 'delta' || unit === 'pp' || unit === 'delta-decimal'
  const suffix = unit === 'pp' ? ' poin persentase' : unit === 'hours' ? ' jam' : unit === 'minutes' ? ' menit' : ''
  if (tiny) return tiny === 'positive'
    ? signed ? `Antara 0 dan +0,01${suffix} (positif)` : `<0,01${suffix} (positif)`
    : `Antara −0,01 dan 0${suffix} (negatif)`
  const n = value < 0n ? -value : value
  const sign = value < 0n ? '−' : signed && value > 0n ? '+' : ''
  if (unit === 'count' || unit === 'delta') return `${sign}${integer.format(n)}`
  return `${sign}${integer.format(n / 100n)},${String(n % 100n).padStart(2, '0')}${suffix}`
}
