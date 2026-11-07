export const investmentSources = {
  savings: {
    title: 'OpenStax: Methods of Savings',
    url: 'https://openstax.org/books/contemporary-mathematics/pages/6-6-methods-of-savings',
  },
  simple: {
    title: 'OpenStax: Simple Interest',
    url: 'https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest',
  },
  geometric: {
    title: 'OpenStax: Geometric Mean',
    url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/2-5-geometric-mean',
  },
  emergency: {
    title: 'CFPB: Building an Emergency Fund',
    url: 'https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/',
  },
  ojk: {
    title: 'OJK: Buku 2 Perbankan, halaman 109–110',
    url: 'https://sikapiuangmu.ojk.go.id/FrontEnd/LiterasiPerguruanTinggi/assets/pdf/Buku%202%20-%20Perbankan.pdf#page=109',
  },
  deposit: {
    title: 'BCA: Rumus dan basis waktu bunga deposito',
    url: 'https://www.bca.co.id/id/informasi/edukatips/2024/07/02/06/10/cara-hitung-bunga-deposito-ini-rumus-yang-perlu-diketahui',
  },
  returns: {
    title: 'FINRA: Return and Rate of Return',
    url: 'https://syndication.finra.org/content/key-concepts-return-and-rate-return',
  },
} as const
export type InvestmentSourceId = keyof typeof investmentSources
