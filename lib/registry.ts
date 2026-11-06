export const business = { name: 'Bisnis', path: '/bisnis' }

export const calculators = [{
  id: 'production-cost',
  slug: 'hpp',
  path: '/kalkulator/hpp',
  category: business,
  name: 'Kalkulator HPP',
  description: 'Hitung total biaya produksi dan harga pokok produksi per unit.',
  keywords: ['harga pokok produksi', 'modal', 'biaya produksi'],
  status: 'published',
}] as const

export type Calculator = typeof calculators[number]
