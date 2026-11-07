export const valuationSources = {
  time: {
    title: 'OpenStax: Time Value of Money',
    url: 'https://openstax.org/books/principles-finance/pages/7-3-methods-for-solving-time-value-of-money-problems',
  },
  npv: {
    title: 'OpenStax: Net Present Value Method',
    url: 'https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method',
  },
  inflation: {
    title: 'Bank Indonesia: Pengertian inflasi',
    url: 'https://www.bi.go.id/id/fungsi-utama/moneter/inflasi/Default.aspx',
  },
  weighted: {
    title: 'OpenStax: Weighted Mean',
    url: 'https://openstax.org/books/principles-finance-2e/pages/13-1-measures-of-center',
  },
  stocks: {
    title: 'Investor.gov / SEC: Stocks and Fees',
    url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks',
  },
  statement: {
    title: 'Investor.gov / SEC: Brokerage Statement and Cost Basis',
    url: 'https://www.investor.gov/better-understanding-your-brokerage-account-statement',
  },
} as const
export type ValuationSourceId = keyof typeof valuationSources
