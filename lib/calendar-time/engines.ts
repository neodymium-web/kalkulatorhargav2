import { z } from 'zod'
import { addMonthsClamped, civilString, ordinal, parseCivil, weekday, type CivilDate } from './civil'

export const civilInput = z.string().refine(v => parseCivil(v) !== null, { message: 'Isi tanggal kalender valid YYYY-MM-DD, tahun 0001–9999.', abort: true }).transform(v => parseCivil(v)!)
const range = z.object({ start: civilInput, end: civilInput }).refine(v => ordinal(v.end) >= ordinal(v.start), { path: ['end'], message: 'Tanggal akhir tidak boleh sebelum tanggal awal.' })
export const dateDifferenceInput = range.safeExtend({ mode: z.enum(['elapsed', 'inclusive'], { error: 'Pilih aturan hitung tanggal.' }) })
export const weekendPatterns = {
  'sat-sun': [5, 6], 'fri-sat': [4, 5], sun: [6], none: [], all: [0, 1, 2, 3, 4, 5, 6],
} as const
export const workdaysInput = range.safeExtend({
  weekend: z.enum(['sat-sun', 'fri-sat', 'sun', 'none', 'all'], { error: 'Pilih pola hari libur mingguan.' }),
  holidays: z.array(z.object({ date: civilInput })).max(100, 'Maksimal 100 tanggal libur.'),
})
export const ageInput = z.object({ birth: civilInput, reference: civilInput }).refine(v => ordinal(v.reference) >= ordinal(v.birth), { path: ['reference'], message: 'Tanggal acuan tidak boleh sebelum tanggal lahir.' })
export const timeInput = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Isi waktu 24 jam HH:mm, 00:00–23:59.').transform(v => {
  const [h, m] = v.split(':').map(BigInt); return h * 60n + m
})
const breakInput = z.string().regex(/^\d{1,4}$/, 'Isi jeda menit utuh 0–2879.').transform(BigInt).refine(v => v <= 2879n, 'Jeda maksimal 2879 menit.')
export const shiftInput = z.object({ start: timeInput, end: timeInput, endDay: z.enum(['same-day', 'next-day'], { error: 'Pilih hari berakhir shift.' }), break: breakInput })
function fixed6(positive = false) {
  return z.string().trim().regex(/^\d{1,13}([.,]\d{1,6})?$/, 'Isi angka nonnegatif hingga 13 digit bulat dan 6 desimal, tanpa pemisah ribuan.').transform(v => {
    const [a, b = ''] = v.replace(',', '.').split('.'); return BigInt(a) * 1000000n + BigInt(b.padEnd(6, '0'))
  }).refine(v => !positive || v > 0n, 'Efisiensi km/L harus lebih dari nol.')
}
export const fuelInput = z.object({ distance: fixed6(), efficiency: fixed6(true), price: z.string().trim().regex(/^\d{1,13}$/, 'Isi harga Rp/L rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt) })
export type HolidayRow = { date: string; weekday: number; status: 'working' | 'weekend' | 'outside' }
export type CalendarOutput = {
  values: Record<string, bigint>
  tiny?: Record<string, true>
  notes: string[]
  holidays?: HolidayRow[]
  anniversary?: string
}
export type CalendarResult = ({ success: true } & CalendarOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (input: T) => CalendarOutput | { errors: Record<string, string[]> }) {
  return (input: unknown): CalendarResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    const output = engine(parsed.data)
    return 'errors' in output ? { success: false, errors: output.errors } : { success: true, ...output }
  }
}
export const calculateDateDifference = calculate(dateDifferenceInput, ({ start, end, mode }) => {
  const elapsed = ordinal(end) - ordinal(start), days = elapsed + (mode === 'inclusive' ? 1n : 0n)
  return { values: { days, elapsed, weeks: days / 7n, remainder: days % 7n }, notes: [
    mode === 'inclusive' ? 'Kedua tanggal dihitung. Tanggal sama menghasilkan 1 hari.' : 'Awal tidak dihitung, akhir dihitung. Tanggal sama menghasilkan 0 hari.',
    'Minggu penuh dan sisa menguraikan jumlah hari menurut mode. Kalender Gregorian proleptik; tanpa waktu, zona waktu atau DST.',
  ] }
})
export const calculateWorkdays = calculate(workdaysInput, ({ start, end, weekend, holidays }) => {
  const first = ordinal(start), last = ordinal(end), total = last - first + 1n
  const off: readonly number[] = weekendPatterns[weekend]
  let scheduled = total / 7n * BigInt(7 - off.length)
  for (let i = 0n; i < total % 7n; i++) if (!off.includes(Number((first + i) % 7n))) scheduled++
  const distinct = new Map<string, CivilDate>()
  for (const h of holidays) distinct.set(civilString(h.date), h.date)
  let qualifying = 0n, weekendHolidays = 0n, outside = 0n
  const rows: HolidayRow[] = []
  for (const [date, civil] of distinct) {
    const day = ordinal(civil), wd = weekday(civil)
    const status = day < first || day > last ? 'outside' : off.includes(wd) ? 'weekend' : 'working'
    if (status === 'outside') outside++
    else if (status === 'weekend') weekendHolidays++
    else qualifying++
    rows.push({ date, weekday: wd, status })
  }
  return { values: { workdays: scheduled - qualifying, total, scheduled, qualifying, unique: BigInt(distinct.size), duplicates: BigInt(holidays.length - distinct.size), weekendHolidays, outside }, holidays: rows,
    notes: ['Rentang inklusif. Pola mingguan mengikuti pilihan Anda, bukan ketentuan kerja resmi. Libur eksplisit dideduplikasi; hanya tanggal dalam rentang yang tadinya hari kerja mengurangi hasil.',
      'Tanggal di luar rentang dan pada hari libur mingguan dihitung terpisah. Tidak ada data hari libur nasional atau cuti bersama otomatis.'] }
})
export const calculateAge = calculate(ageInput, ({ birth, reference }) => {
  let months = (reference.year - birth.year) * 12n + reference.month - birth.month
  if (ordinal(addMonthsClamped(birth, months)) > ordinal(reference)) months--
  const anniversary = addMonthsClamped(birth, months)
  return { values: { years: months / 12n, months: months % 12n, days: ordinal(reference) - ordinal(anniversary), totalMonths: months, totalDays: ordinal(reference) - ordinal(birth) }, anniversary: civilString(anniversary),
    notes: [`Anniversary bulan penuh terakhir: ${civilString(anniversary)}. Hari setelah anniversary dihitung eksak.`,
      'Bulan penuh dihitung dari tanggal lahir asli dengan clamp akhir bulan. Lahir 29 Februari mencapai anniversary pada 28 Februari di tahun biasa. Ini konvensi kalender, bukan penetapan usia hukum.'] }
})
const halfUp = (n: bigint, d: bigint) => (2n * n + d) / (2n * d)
export const calculateShift = calculate(shiftInput, ({ start, end, endDay, break: pause }): CalendarOutput | { errors: Record<string, string[]> } => {
  const gross = end + (endDay === 'next-day' ? 1440n : 0n) - start
  if (gross < 0n) return { errors: { end: ['Selesai sebelum mulai pada hari yang sama. Pilih hari berikutnya bila sesuai shift.'] } }
  if (pause > gross) return { errors: { break: ['Jeda tidak boleh melebihi durasi kotor shift.'] } }
  const net = gross - pause
  return { values: { net, decimalHours: halfUp(net * 10000n, 60n), gross, break: pause }, notes: [
    `Akhir ${endDay === 'same-day' ? 'pada hari yang sama' : 'pada hari berikutnya'} dipilih eksplisit. Satu pergantian tanggal mengizinkan hingga 47 jam 59 menit.`,
    'Jam dinding dan jeda menit, bukan durasi realtime pada transisi DST. Tidak menghitung upah, lembur atau hak ketenagakerjaan. Jam desimal dibulatkan sekali ke empat desimal.',
  ] }
})
export const calculateFuel = calculate(fuelInput, ({ distance, efficiency, price }) => {
  const liters = halfUp(distance * 10000n, efficiency), cost = halfUp(distance * price, efficiency)
  return { values: { liters, cost, distance, efficiency, price }, tiny: { ...(distance > 0n && liters === 0n ? { liters: true as const } : {}), ...(distance * price > 0n && cost === 0n ? { cost: true as const } : {}) },
    notes: ['Jarak total dan efisiensi km/L adalah asumsi Anda. Estimasi liter empat desimal dan biaya rupiah utuh dibulatkan setengah ke atas langsung dari pecahan eksak; biaya tidak dihitung dari liter tampilan.',
      'Harga Rp/L diisi manual, bukan tarif terkini. Kondisi kendaraan, beban, lalu lintas, pembelian pompa dan tol dapat membuat biaya aktual berbeda. Tidak ada integrasi peta atau penggandaan pulang-pergi.'] }
})
