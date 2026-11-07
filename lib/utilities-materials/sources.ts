export const materialsSources = {
  energy: { title: 'US EIA: daya watt dan energi Wh/kWh', url: 'https://www.eia.gov/energyexplained/electricity/measuring-electricity.php' },
  units: { title: 'NIST: prefiks SI kilo dan centi', url: 'https://www.nist.gov/pml/owm/metric-si-prefixes' },
  geometry: { title: 'OpenStax: luas persegi panjang, balok dan silinder', url: 'https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas' },
  pi: { title: 'Wolfram Functions: nilai desimal π', url: 'https://functions.wolfram.com/Constants/Pi/03/0001/' },
} as const
export type MaterialsSourceId = keyof typeof materialsSources
