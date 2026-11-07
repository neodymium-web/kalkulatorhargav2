import { rupiah } from '../finance/format'
const integer = new Intl.NumberFormat('id-ID')
export function formatCalendar(value: bigint, unit: string, tiny = false) {
  if (unit === 'IDR' || unit === 'IDR-per-L') return `${rupiah(value)}${tiny ? ' (estimasi positif <Rp0,50)' : ''}${unit === 'IDR-per-L' ? '/L' : ''}`
  if (unit === 'duration') return `${integer.format(value / 60n)} jam ${integer.format(value % 60n)} menit`
  const suffix = ({ days: ' hari', weeks: ' minggu', minutes: ' menit', liters: ' L', 'decimal-hours': ' jam', km: ' km', 'km/L': ' km/L' } as Record<string, string>)[unit] ?? ''
  if (unit === 'liters' || unit === 'decimal-hours' || unit === 'km' || unit === 'km/L') {
    const digits = unit === 'km' || unit === 'km/L' ? 6 : 4
    if (tiny) return `<0,0001${suffix} (positif)`
    const scale = 10n ** BigInt(digits)
    const fraction = (value % scale).toString().padStart(digits, '0')
    return `${integer.format(value / scale)},${fraction}${suffix}`
  }
  return `${integer.format(value)}${suffix}`
}
