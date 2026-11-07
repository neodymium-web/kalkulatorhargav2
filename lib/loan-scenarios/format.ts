import { rupiah } from '../finance/format'
const integer = new Intl.NumberFormat('id-ID')
export function formatScenario(value: bigint, unit: string, target?: 'IDR' | 'USD', tiny?: 'positive' | 'negative') {
  if (unit === 'rate') {
    if (tiny) return tiny === 'positive' ? '<0,0001% (positif)' : 'Antara −0,0001% dan 0% (negatif)'
    const n = value < 0n ? -value : value
    return `${value < 0n ? '−' : ''}${integer.format(n / 10000n)},${String(n % 10000n).padStart(4, '0')}%`
  }
  if (unit === 'bulan') return `${integer.format(value)} bulan`
  if (unit === 'target' && target === 'USD') {
    if (tiny) return '<USD0,01 (positif)'
    return `USD${integer.format(value / 100n)},${String(value % 100n).padStart(2, '0')}`
  }
  if (tiny) return '<Rp1 (positif)'
  return rupiah(value)
}
