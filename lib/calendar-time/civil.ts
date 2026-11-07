export type CivilDate = { year: bigint; month: bigint; day: bigint }
export const weekdayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const
const monthDays = [31n, 28n, 31n, 30n, 31n, 30n, 31n, 31n, 30n, 31n, 30n, 31n]
export function isLeap(year: bigint) {
  return year % 4n === 0n && (year % 100n !== 0n || year % 400n === 0n)
}
export function daysInMonth(year: bigint, month: bigint) {
  return month === 2n && isLeap(year) ? 29n : monthDays[Number(month - 1n)]
}
export function parseCivil(value: string): CivilDate | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(BigInt)
  if (year < 1n || year > 9999n || month < 1n || month > 12n || day < 1n || day > daysInMonth(year, month)) return null
  return { year, month, day }
}
export function ordinal(date: CivilDate) {
  const y = date.year - 1n
  let days = 365n * y + y / 4n - y / 100n + y / 400n + date.day - 1n
  for (let m = 1n; m < date.month; m++) days += daysInMonth(date.year, m)
  return days
}
export function weekday(date: CivilDate) { return Number(ordinal(date) % 7n) }
export function addMonthsClamped(date: CivilDate, months: bigint): CivilDate {
  const index = (date.year - 1n) * 12n + date.month - 1n + months
  const year = index / 12n + 1n, month = index % 12n + 1n
  const limit = daysInMonth(year, month)
  return { year, month, day: date.day > limit ? limit : date.day }
}
export function civilString(date: CivilDate) {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}
