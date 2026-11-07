import { z } from 'zod'
import { fraction, add, subtract, multiply, divide, round, type Rational } from '../utilities-materials/rational'
import { lengthUnits, massUnits, speedUnits, temperatureUnits, convertRatio, type TemperatureUnit } from './units'
const SIX = 1000000n
function fixed(signed = false, whole = 13) {
  return z.string().trim().regex(new RegExp(`^${signed ? '-?' : ''}\\d{1,${whole}}([.,]\\d{1,6})?$`), { message: `Isi angka ${signed ? 'bertanda' : 'nonnegatif'} hingga ${whole} digit bulat dan 6 desimal, tanpa pemisah ribuan.`, abort: true }).transform(v => {
    const negative = v.startsWith('-'), [a, b = ''] = (negative ? v.slice(1) : v).replace(',', '.').split('.')
    const n = BigInt(a) * SIX + BigInt(b.padEnd(6, '0')); return negative ? -n : n
  })
}
const lengthUnit = z.enum(['um', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'], { error: 'Pilih satuan panjang yang tersedia.' })
const planUnit = z.enum(['mm', 'cm', 'm', 'km'], { error: 'Pilih satuan denah mm, cm, m atau km.' })
const massUnit = z.enum(['ug', 'mg', 'g', 'kg', 't', 'oz', 'lb'], { error: 'Pilih satuan massa yang tersedia.' })
const temperatureUnit = z.enum(['C', 'F', 'K'], { error: 'Pilih skala suhu C, F atau K.' })
export const scaleInput = z.object({ value: fixed(), from: planUnit, to: planUnit,
  scale: z.string().trim().regex(/^\d{1,10}$/, { message: 'Isi N integer 1–1000000000 untuk skala 1:N.', abort: true }).transform(BigInt).refine(n => n >= 1n && n <= 1000000000n, { message: 'N harus 1–1000000000.', abort: true }),
  mode: z.enum(['drawing-real', 'real-drawing'], { error: 'Pilih arah gambar ke nyata atau nyata ke gambar.' }),
})
export const lengthInput = z.object({ value: fixed(), from: lengthUnit, to: lengthUnit })
export const massInput = z.object({ value: fixed(), from: massUnit, to: massUnit })
export const temperatureInput = z.object({ value: fixed(true), from: temperatureUnit, to: temperatureUnit }).superRefine((v, ctx) => {
  const minimum = { C: -273150000n, F: -459670000n, K: 0n }[v.from]
  if (v.value < minimum) ctx.addIssue({ code: 'custom', path: ['value'], message: `Suhu ${v.from} tidak boleh di bawah nol mutlak (${v.from === 'C' ? '−273,15 °C' : v.from === 'F' ? '−459,67 °F' : '0 K'}).` })
})
const wholeTime = (digits: number) => z.string().trim().regex(new RegExp(`^\\d{1,${digits}}$`), { message: 'Isi bilangan bulat nonnegatif tanpa pemisah.', abort: true }).transform(BigInt)
export const speedInput = z.object({ distance: fixed(), distanceUnit: z.enum(['m', 'km', 'mi'], { error: 'Pilih satuan jarak m, km atau mi.' }),
  hours: wholeTime(9), minutes: wholeTime(2).refine(n => n < 60n, { message: 'Menit harus 0–59.', abort: true }),
  seconds: fixed(false, 2).refine(n => n < 60n * SIX, { message: 'Detik harus 0–59,999999.', abort: true }),
  to: z.enum(['km/h', 'm/s', 'mph'], { error: 'Pilih satuan hasil kecepatan.' }),
}).refine(v => v.hours * 3600n * SIX + v.minutes * 60n * SIX + v.seconds > 0n, { path: ['seconds'], message: 'Durasi total harus lebih dari nol. Isi jam, menit atau detik positif.' })
export type TinySign = 'positive' | 'negative'
export type UnitsOutput = {
  converted: bigint; digits: 6 | 9; unit: string; tiny?: TinySign
  exact: Rational; base: Rational; baseValue: bigint; baseUnit: string; baseTiny?: TinySign
  label: string; notes: string[]; scale?: bigint; elapsed?: bigint
}
export type UnitsResult = ({ success: true } & UnitsOutput) | { success: false; errors: Record<string, string[]> }
export function quantizeSigned(value: Rational, digits: number) {
  const magnitude = round({ n: value.n < 0n ? -value.n : value.n, d: value.d }, 10n ** BigInt(digits))
  return value.n < 0n ? -magnitude : magnitude
}
function tiny(value: Rational, displayed: bigint): TinySign | undefined { return value.n !== 0n && displayed === 0n ? value.n < 0n ? 'negative' : 'positive' : undefined }
function output(exact: Rational, unit: string, base: Rational, baseUnit: string, label: string, notes: string[], digits: 6 | 9 = 6): UnitsOutput {
  const converted = quantizeSigned(exact, digits), baseValue = quantizeSigned(base, digits)
  return { exact, unit, base, baseUnit, label, notes, digits, converted, baseValue, tiny: tiny(exact, converted), baseTiny: tiny(base, baseValue) }
}
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => UnitsOutput) {
  return (input: unknown): UnitsResult => {
    const p = schema.safeParse(input)
    if (!p.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of p.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    return { success: true, ...engine(p.data) }
  }
}
const roundtripNote = 'Pecahan eksak ditampilkan sebelum pembulatan. Hasil desimal terbatas tidak dijanjikan lossless jika disalin menjadi input konversi berikutnya.'
export const calculateScale = calculate(scaleInput, v => {
  const inputMeters = multiply(fraction(v.value, SIX), lengthUnits[v.from].factor)
  const base = v.mode === 'drawing-real' ? multiply(inputMeters, fraction(v.scale)) : divide(inputMeters, fraction(v.scale))
  return { ...output(divide(base, lengthUnits[v.to].factor), lengthUnits[v.to].symbol, base, 'm', v.mode === 'drawing-real' ? 'Jarak sebenarnya' : 'Jarak pada denah', [
    'Skala 1:N adalah rasio panjang, bukan luas atau volume. Ukuran fisik cetakan/render harus mengikuti skala tersebut; tidak ada koreksi pembesaran atau proyeksi peta.', roundtripNote,
  ]), scale: v.scale }
})
export const calculateLength = calculate(lengthInput, v => {
  const value = fraction(v.value, SIX), base = multiply(value, lengthUnits[v.from].factor)
  return output(convertRatio(value, lengthUnits[v.from], lengthUnits[v.to]), lengthUnits[v.to].symbol, base, 'm', 'Panjang dalam satuan tujuan', [
    'Panjang fisik nonnegatif. Inch, foot, yard dan mile adalah international; tidak memakai survey foot atau nautical mile. Faktor konversi eksak tidak menambah ketelitian pengukuran.', roundtripNote,
  ])
})
export const calculateMass = calculate(massInput, v => {
  const value = fraction(v.value, SIX), base = multiply(value, massUnits[v.from].factor)
  return output(convertRatio(value, massUnits[v.from], massUnits[v.to]), massUnits[v.to].symbol, base, 'kg', 'Massa dalam satuan tujuan', [
    'Berat sehari-hari di sini berarti massa, bukan gaya gravitasi/newton. Ton adalah ton metrik; oz/lb adalah avoirdupois, bukan troy atau fluid ounce. Tidak memakai massa jenis atau volume.', roundtripNote,
  ], 9)
})
export function toKelvin(value: Rational, from: TemperatureUnit) {
  return from === 'K' ? value : from === 'C' ? add(value, fraction(27315n, 100n)) : multiply(add(value, fraction(45967n, 100n)), fraction(5n, 9n))
}
export function fromKelvin(value: Rational, to: TemperatureUnit) {
  return to === 'K' ? value : to === 'C' ? subtract(value, fraction(27315n, 100n)) : subtract(multiply(value, fraction(9n, 5n)), fraction(45967n, 100n))
}
export const calculateTemperature = calculate(temperatureInput, v => {
  const base = toKelvin(fraction(v.value, SIX), v.from)
  return output(fromKelvin(base, v.to), temperatureUnits[v.to].symbol, base, 'K', 'Suhu absolut dalam skala tujuan', [
    'Input diperiksa terhadap nol mutlak sebelum pembulatan: C ≥ −273,15; F ≥ −459,67; K ≥ 0. Celsius/Fahrenheit negatif yang sah tetap diterima. Ini suhu absolut, bukan selisih suhu.',
    'Transformasi memakai faktor dan offset rasional eksak. Enam desimal dibulatkan setengah menjauh dari nol; nilai negatif sangat kecil tetap mempertahankan arah.', roundtripNote,
  ])
})
export const calculateSpeed = calculate(speedInput, v => {
  const meters = multiply(fraction(v.distance, SIX), lengthUnits[v.distanceUnit].factor)
  const elapsed = (v.hours * 3600n + v.minutes * 60n) * SIX + v.seconds, base = divide(meters, fraction(elapsed, SIX))
  return { ...output(divide(base, speedUnits[v.to].factor), speedUnits[v.to].symbol, base, 'm/s', 'Kelajuan rata-rata', [
    'Kelajuan skalar = total jarak ÷ total durasi elapsed. Waktu berhenti termasuk dalam durasi yang dimasukkan. Jam boleh lebih dari 24; tidak ada Date, timestamp atau zona waktu.',
    'Bukan kecepatan sesaat, vektor perpindahan, ETA, rute atau rekomendasi berkendara. mph memakai international mile.', roundtripNote,
  ]), elapsed }
})
