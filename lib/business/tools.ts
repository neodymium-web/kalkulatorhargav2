import {
  calculateBreakEven, calculateGrossMargin, calculateMarkup, calculateProfitTarget, calculateSellingPrice,
} from './engines'

const cost = { id: 'cost', label: 'Biaya per unit', type: 'integer', unit: 'IDR' } as const
const price = { id: 'price', label: 'Harga jual per unit', type: 'integer', unit: 'IDR' } as const
const volumeFields = [
  { id: 'fixed', label: 'Biaya tetap', type: 'integer', unit: 'IDR' },
  price,
  { id: 'variable', label: 'Biaya variabel per unit', type: 'integer', unit: 'IDR' },
] as const
const contribution = { id: 'contribution', label: 'Kontribusi per unit', type: 'integer', unit: 'IDR' } as const

export const businessTools = {
  'harga-jual': {
    title: 'Kalkulator Harga Jual',
    description: 'Hitung harga jual minimum dari HPP per unit dan target margin kotor atas penjualan.',
    keywords: ['harga jual minimum', 'harga jual dari HPP', 'target margin kotor'],
    inputFields: [
      { ...cost, label: 'HPP per unit' },
      { id: 'margin', label: 'Target margin kotor', type: 'decimal', unit: '%' },
    ],
    outputFields: [{ id: 'minimum', label: 'Harga jual minimum per unit', type: 'integer', unit: 'IDR' }],
    engine: calculateSellingPrice,
    formulaVersion: '1.0.0',
    testCases: ['harga jual uses gross margin and rounds up to meet the threshold', 'harga jual supports exact, zero-cost and large thresholds', 'harga jual rejects invalid percentages'],
  },
  'margin-laba': {
    title: 'Kalkulator Margin Laba Kotor',
    description: 'Hitung laba kotor per unit dan persentase margin berdasarkan harga jual aktual.',
    keywords: ['margin laba', 'margin kotor', 'gross profit margin'],
    inputFields: [price, cost],
    outputFields: [
      { id: 'percent', label: 'Margin laba kotor', type: 'decimal', unit: '%' },
      { id: 'profit', label: 'Laba kotor per unit', type: 'integer', unit: 'IDR' },
    ],
    engine: calculateGrossMargin,
    formulaVersion: '1.0.0',
    testCases: ['margin and markup use different denominators', 'margin reports losses and rejects a zero selling price', 'percentages round to two places without floating-point conversion'],
  },
  markup: {
    title: 'Kalkulator Markup',
    description: 'Hitung selisih harga dan biaya per unit serta persentase markup terhadap biaya.',
    keywords: ['markup harga jual', 'persentase markup', 'kenaikan atas biaya'],
    inputFields: [price, cost],
    outputFields: [
      { id: 'percent', label: 'Markup terhadap biaya', type: 'decimal', unit: '%' },
      { id: 'difference', label: 'Selisih harga dan biaya per unit', type: 'integer', unit: 'IDR' },
    ],
    engine: calculateMarkup,
    formulaVersion: '1.0.0',
    testCases: ['margin and markup use different denominators', 'markup accepts a zero price but rejects a zero cost', 'percentages round to two places without floating-point conversion'],
  },
  bep: {
    title: 'Kalkulator BEP Unit',
    description: 'Hitung kontribusi per unit dan jumlah penjualan minimum agar biaya tetap tertutup.',
    keywords: ['bep', 'break even point', 'titik impas penjualan'],
    inputFields: volumeFields,
    outputFields: [{ id: 'units', label: 'Unit minimum untuk impas', type: 'integer', unit: 'unit' }, contribution],
    engine: calculateBreakEven,
    formulaVersion: '1.0.0',
    testCases: ['BEP rounds fractional units up and preserves exact division', 'BEP handles zero fixed costs and nonpositive contribution', 'volume targets preserve large values'],
  },
  'target-laba': {
    title: 'Kalkulator Target Laba',
    description: 'Hitung jumlah unit yang perlu dijual untuk mencapai target laba setelah menutup biaya tetap.',
    keywords: ['target laba', 'unit penjualan', 'volume penjualan target'],
    inputFields: [...volumeFields, { id: 'target', label: 'Target laba setelah biaya tetap', type: 'integer', unit: 'IDR' }],
    outputFields: [{ id: 'units', label: 'Unit minimum untuk target laba', type: 'integer', unit: 'unit' }, contribution],
    engine: calculateProfitTarget,
    formulaVersion: '1.0.0',
    testCases: ['target laba rounds up and reduces to BEP when target is zero', 'target laba handles zero requirement and unreachable targets', 'volume targets preserve large values'],
  },
} as const

export type BusinessSlug = keyof typeof businessTools
