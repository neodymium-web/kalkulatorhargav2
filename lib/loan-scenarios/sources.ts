export const scenarioSources = {
  xirr: { title: 'Microsoft: XIRR dan basis hari 365', url: 'https://support.microsoft.com/en-us/excel/functions/xirr-function' },
  loans: { title: 'OpenStax: The Basics of Loans', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans' },
  phases: { title: 'CFPB: fixed dan adjustable rate', url: 'https://www.consumerfinance.gov/owning-a-home/explore/understand-the-different-kinds-of-loans-available/' },
  penalty: { title: 'CFPB: prepayment penalty', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/' },
  refinance: { title: 'Federal Reserve: Mortgage Refinancings', url: 'https://www.federalreserve.gov/pubs/refinancings/default.htm' },
  fx: { title: 'ECB: kuotasi kurs dan batas referensi', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html' },
  currency: { title: 'SIX: standar mata uang', url: 'https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html' },
} as const
export type ScenarioSourceId = keyof typeof scenarioSources
