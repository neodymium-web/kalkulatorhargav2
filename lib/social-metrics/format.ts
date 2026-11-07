import { rupiah } from '../finance/format'
import { formatValuation } from '../valuation/format'
const integer = new Intl.NumberFormat('id-ID')
export const acquisitionLabels = { sale: 'penjualan', lead: 'lead', signup: 'pendaftaran' } as const
export const basisLabels = { followers: 'Jumlah pengikut', reach: 'Reach (akun yang dijangkau)' } as const
export function formatSocial(value: bigint | null, unit: string, tiny?: 'positive' | 'negative') {
  if (value === null) return 'Tidak terdefinisi (pengikut awal nol)'
  if (unit === 'IDR-whole') return rupiah(value)
  if (unit === 'count' || unit === 'change') {
    const sign = value < 0n ? '−' : value > 0n && unit === 'change' ? '+' : ''
    return `${sign}${integer.format(value < 0n ? -value : value)}`
  }
  if (unit === 'growth' && tiny)
    return tiny === 'positive' ? 'Antara 0% dan +0,01% (positif)' : 'Antara −0,01% dan 0% (negatif)'
  const text = formatValuation(value, unit === 'growth' ? '%' : unit, tiny)
  return unit === 'growth' && value > 0n ? `+${text}` : text
}
