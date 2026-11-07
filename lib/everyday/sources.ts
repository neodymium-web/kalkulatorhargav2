export const everydaySources = {
  percent: { title: 'OpenStax: persen dan perubahan persen', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' },
  discount: { title: 'OpenStax: aplikasi diskon', url: 'https://openstax.org/books/prealgebra-2e/pages/6-3-solve-sales-tax-commission-and-discount-applications' },
  prefixes: { title: 'NIST: SI metric prefixes', url: 'https://www.nist.gov/pml/owm/metric-si-prefixes' },
  liter: { title: 'NIST SP811: unit di luar SI', url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si' },
  allocation: { title: 'Kenyon & Lippman, Math in Society: Hamilton, halaman 75–76', url: 'https://www.opentextbookstore.com/mathinsociety/2.5/Apportionment.pdf' },
} as const
export type EverydaySourceId = keyof typeof everydaySources
