import { fraction, multiply, divide, type Rational } from '../utilities-materials/rational'
export type UnitDefinition = { label: string; symbol: string; factor: Rational }
const unit = (label: string, symbol: string, n: bigint, d = 1n): UnitDefinition => ({ label, symbol, factor: fraction(n, d) })
export const lengthUnits = {
  um: unit('Mikrometer (µm)', 'µm', 1n, 1000000n),
  mm: unit('Milimeter (mm)', 'mm', 1n, 1000n),
  cm: unit('Sentimeter (cm)', 'cm', 1n, 100n),
  m: unit('Meter (m)', 'm', 1n),
  km: unit('Kilometer (km)', 'km', 1000n),
  in: unit('Inch international (in)', 'in', 127n, 5000n),
  ft: unit('Foot international (ft)', 'ft', 381n, 1250n),
  yd: unit('Yard international (yd)', 'yd', 1143n, 1250n),
  mi: unit('Mile international (mi)', 'mi', 201168n, 125n),
} as const
export const massUnits = {
  ug: unit('Mikrogram (µg)', 'µg', 1n, 1000000000n),
  mg: unit('Miligram (mg)', 'mg', 1n, 1000000n),
  g: unit('Gram (g)', 'g', 1n, 1000n),
  kg: unit('Kilogram (kg)', 'kg', 1n),
  t: unit('Ton metrik / tonne (t)', 't', 1000n),
  oz: unit('Ounce avoirdupois (oz)', 'oz avdp', 45359237n, 1600000000n),
  lb: unit('Pound avoirdupois (lb)', 'lb avdp', 45359237n, 100000000n),
} as const
export const speedUnits = {
  'km/h': unit('Kilometer per jam (km/h)', 'km/h', 5n, 18n),
  'm/s': unit('Meter per detik (m/s)', 'm/s', 1n),
  mph: unit('Mile international per jam (mph)', 'mph', 1397n, 3125n),
} as const
export type TemperatureUnit = 'C' | 'F' | 'K'
export const temperatureUnits = { C: { label: 'Celsius (°C)', symbol: '°C' }, F: { label: 'Fahrenheit (°F)', symbol: '°F' }, K: { label: 'Kelvin (K)', symbol: 'K' } } as const
export function convertRatio(value: Rational, from: UnitDefinition, to: UnitDefinition) {
  return divide(multiply(value, from.factor), to.factor)
}
