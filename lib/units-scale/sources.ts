export const unitsSources = {
  si: { title: 'NIST: definisi satuan dasar meter, kilogram dan second', url: 'https://www.nist.gov/si-redefinition/definitions-si-base-units' },
  prefixes: { title: 'NIST: prefiks SI', url: 'https://www.nist.gov/pml/owm/metric-si-prefixes' },
  international: { title: 'NIST SP811 Appendix B: international yard dan foot', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors' },
  handbook: { title: 'NIST Handbook44–2026 Appendix C: panjang dan massa, international serta avoirdupois', url: 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c' },
  pound: { title: 'NIST SP811 footnote22: pound avoirdupois eksak', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes' },
  temperature: { title: 'NIST: konversi suhu eksak Celsius/Fahrenheit/Kelvin', url: 'https://www.nist.gov/pml/owm/si-units-temperature' },
  absolute: { title: 'NIST Kelvin Introduction: nol mutlak', url: 'https://www.nist.gov/si-redefinition/kelvin-introduction' },
  time: { title: 'NIST SP330 §4: menit dan jam', url: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-4' },
} as const
export type UnitsSourceId = keyof typeof unitsSources
