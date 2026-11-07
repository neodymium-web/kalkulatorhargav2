export const financeSources = {
  simple: {
    title: 'OpenStax: Simple Interest',
    url: 'https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest',
  },
  compound: {
    title: 'OpenStax: Compound Interest',
    url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest',
  },
  loans: {
    title: 'OpenStax: The Basics of Loans',
    url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans',
  },
  ojk: {
    title: 'OJK: Buku 2 Perbankan, halaman 46–47',
    url: 'https://sikapiuangmu.ojk.go.id/FrontEnd/LiterasiPerguruanTinggi/assets/pdf/Buku%202%20-%20Perbankan.pdf#page=46',
  },
  ratio: {
    title: 'CFPB: Debt-to-income ratio (basis kotor)',
    url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/',
  },
  disposable: {
    title: 'Federal Reserve: Household Debt Service Ratios',
    url: 'https://www.federalreserve.gov/releases/DSR/about.htm',
  },
  apr: {
    title: 'CFPB: Interest rate dan APR',
    url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/',
  },
} as const
export type FinanceSourceId = keyof typeof financeSources
