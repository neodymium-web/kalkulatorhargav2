import type { Precision } from './engines'
const integer = new Intl.NumberFormat('id-ID')
export function formatValuation(value: bigint, unit = 'IDR-cents', precision?: Precision) {
  if (unit === 'shares' || unit === 'lots')
    return `${integer.format(value)} ${unit === 'shares' ? 'lembar' : 'lot'}`
  if (precision === 'positive') return unit === '%' ? '<0,01%' : '<Rp0,01'
  if (precision === 'negative')
    return unit === '%' ? 'Antara −0,01% dan 0% (negatif)' : 'Antara −Rp0,01 dan Rp0 (negatif)'
  const magnitude = value < 0n ? -value : value
  const number = `${integer.format(magnitude / 100n)},${(magnitude % 100n).toString().padStart(2, '0')}`
  return `${value < 0n ? '−' : ''}${unit === '%' ? '' : 'Rp'}${number}${unit === '%' ? '%' : ''}`
}
