import { rupiah } from '../finance/format'
import type { PrecisionHint } from './engines'

const integer = new Intl.NumberFormat('id-ID')
export function formatInvestment(value: bigint | null, unit: string, precision?: PrecisionHint) {
  if (value === null) return 'Tidak terdefinisi (pengeluaran nol)'
  const digits = unit === 'rate' ? 4 : 2
  const suffix = unit === 'months' ? ' bulan' : '%'
  const increment = digits === 4 ? '0,0001' : '0,01'
  if (unit === 'IDR') return rupiah(value)
  if (unit === 'IDR-cents' && precision === 'positive') return '<Rp0,01'
  if (precision === 'above-minus-100') return '>−100,0000%'
  if (precision === 'positive' && unit !== 'IDR-cents') return `<${increment}${suffix}`
  if (precision === 'negative') return `Antara −${increment}% dan 0% (negatif)`
  const scale = 10n ** BigInt(digits)
  const magnitude = value < 0n ? -value : value
  const number = `${integer.format(magnitude / scale)},${(magnitude % scale).toString().padStart(digits, '0')}`
  return unit === 'IDR-cents'
    ? `${value < 0n ? '−' : ''}Rp${number}`
    : `${value < 0n ? '−' : ''}${number}${suffix}`
}
