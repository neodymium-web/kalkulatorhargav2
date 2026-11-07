export const calendarSources = {
  leap: { title: 'US Naval Observatory: aturan tahun kabisat Gregorian', url: 'https://aa.usno.navy.mil/faq/leap_years' },
  calendar: { title: 'Richards, Calendars §15.4.2: Gregorian dan anchor hari Senin (PDF halaman 15)', url: 'https://aa.usno.navy.mil/downloads/c15_usb_online.pdf' },
  representation: { title: 'RFC 3339 §5.6–5.7: representasi tanggal dan batas jam/menit', url: 'https://www.rfc-editor.org/rfc/rfc3339.html' },
  units: { title: 'NIST SP330 §4: satuan menit, jam dan liter', url: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-4' },
} as const
export type CalendarSourceId = keyof typeof calendarSources
