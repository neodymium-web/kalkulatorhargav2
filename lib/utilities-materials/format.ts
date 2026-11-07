import { rupiah } from '../finance/format'
const integer = new Intl.NumberFormat('id-ID')
function fixed(value: bigint, digits: number, trim = false) {
  const scale = 10n ** BigInt(digits)
  let fraction = (value % scale).toString().padStart(digits, '0')
  if (trim) fraction = fraction.replace(/0+$/, '')
  return `${integer.format(value / scale)}${fraction ? ',' + fraction : ''}`
}
export function formatMaterials(value: bigint, unit: string, tiny = false) {
  if (unit === 'cash') return `${rupiah(value)}${tiny ? ' (nilai positif <Rp0,50 sebelum pembulatan)' : ''}`
  if (unit === 'money10') return `Rp${fixed(value, 10, true)}`
  if (unit === 'rate4') return `Rp${fixed(value, 4, true)}/m³`
  const suffix = ({ kWh: ' kWh', liters: ' L', liters6: ' L', area: ' m²', area6: ' m²', volume: ' m³', volume6: ' m³', quota: ' ubin', packages: ' kemasan', tiles: ' ubin', boxes: ' dus' } as Record<string, string>)[unit] ?? ''
  if (['kWh', 'liters', 'liters6', 'area', 'area6', 'volume', 'volume6', 'quota'].includes(unit)) {
    const digits = unit.endsWith('6') ? 6 : 4
    if (tiny) return `<0,${'0'.repeat(digits - 1)}1${suffix} (positif)`
    return `${fixed(value, digits, unit === 'volume6')}${suffix}`
  }
  return `${integer.format(value)}${suffix}`
}
