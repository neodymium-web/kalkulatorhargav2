const integer = new Intl.NumberFormat('id-ID')
export const rupiah = (value: bigint) =>
  `${value < 0n ? '−' : ''}Rp${integer.format(value < 0n ? -value : value)}`

export function formatFinance(value: bigint, unit: string, tiny = false) {
  if (unit === 'IDR') return rupiah(value)
  if (unit === 'bulan') return `${integer.format(value)} bulan`
  const digits = unit === 'rate' ? 4 : 2
  if (tiny) return digits === 4 ? '<0,0001%' : '<0,01%'
  const scale = 10n ** BigInt(digits)
  return `${integer.format(value / scale)},${(value % scale).toString().padStart(digits, '0')}%`
}
