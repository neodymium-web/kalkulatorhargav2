import { expect, it } from 'vitest'
import { calculateEoq, calculateFoodCost, calculatePayback, calculateProjectQuote, calculateVolumetric } from '../lib/batch-four/engines'

const ingredient = { price: '20000', package: '1000', usage: '250', unit: 'g' }
const flow = (amount: string) => ({ amount })

it('food cost sums multiple rational ingredient costs before rounding', () => {
  expect(calculateFoodCost({ servings: '4', ingredients: [ingredient, { price: '12000', package: '6', usage: '2', unit: 'unit' }] }))
    .toMatchObject({ values: { total: 9000n, perServing: 2250n } })
  expect(calculateFoodCost({ servings: '2', ingredients: Array(2).fill({ price: '1', package: '3', usage: '1', unit: 'unit' }) }))
    .toMatchObject({ values: { total: 1n, perServing: 1n } })
  expect(calculateFoodCost({ servings: '1', ingredients: [{ ...ingredient, usage: '0' }] }))
    .toMatchObject({ values: { total: 0n, perServing: 0n } })
  expect(calculateFoodCost({ servings: '1', ingredients: [{ ...ingredient, usage: '2000' }] }))
    .toMatchObject({ values: { total: 40000n } })
})

it('food cost reports row errors and rejects invalid portions, quantities, and units', () => {
  expect(calculateFoodCost({ servings: '0', ingredients: [ingredient] }).success).toBe(false)
  expect(calculateFoodCost({ servings: '1', ingredients: [] }).success).toBe(false)
  expect(calculateFoodCost({ servings: '1', ingredients: Array(101).fill(ingredient) }).success).toBe(false)
  expect(calculateFoodCost({ servings: '1', ingredients: [ingredient, { ...ingredient, package: '0' }] }))
    .toMatchObject({ success: false, errors: { 'ingredients.1.package': expect.any(Array) } })
  expect(calculateFoodCost({ servings: '1', ingredients: [{ ...ingredient, unit: 'lb' }] }).success).toBe(false)
})

it('project quote uses fixed profit and rounds up only final costs', () => {
  expect(calculateProjectQuote({ hours: '2,5', hourly: '40000', materials: '30000', overhead: '10000', profit: '25000' }))
    .toMatchObject({ values: { quote: 165000n, cost: 140000n, labor: 100000n } })
  expect(calculateProjectQuote({ hours: '0.001', hourly: '1', materials: '0', overhead: '0', profit: '0' }))
    .toMatchObject({ values: { quote: 1n, cost: 1n, labor: 1n } })
  expect(calculateProjectQuote({ hours: '0', hourly: '0', materials: '0', overhead: '0', profit: '0' }))
    .toMatchObject({ values: { quote: 0n } })
})

it('EOQ chooses the exact integer cost minimum around the square root', () => {
  expect(calculateEoq({ demand: '1000', order: '100', holding: '20' }))
    .toMatchObject({ values: { quantity: 100n, ordering: 1000n, holding: 1000n } })
  expect(calculateEoq({ demand: '10', order: '1', holding: '3' }))
    .toMatchObject({ values: { quantity: 3n, ordering: 3n, holding: 5n } })
  expect(calculateEoq({ demand: '6', order: '1', holding: '2' })).toMatchObject({ values: { quantity: 2n } })
  expect(calculateEoq({ demand: '7', order: '1', holding: '2' })).toMatchObject({ values: { quantity: 3n } })
  expect(calculateEoq({ demand: '1', order: '1', holding: '100' })).toMatchObject({ values: { quantity: 1n } })
})

it('EOQ preserves huge square thresholds and explains degenerate cases', () => {
  for (const demand of ['999999999999', '1000000000000', '1000000000001']) {
    expect(calculateEoq({ demand, order: '1', holding: '2' })).toMatchObject({ values: { quantity: 1000000n } })
  }
  const n = 9999999999999n
  // 2 D S / H is exactly n².
  expect(calculateEoq({ demand: n.toString(), order: n.toString(), holding: '2' }))
    .toMatchObject({ values: { quantity: n } })
  expect(calculateEoq({ demand: '0', order: '1', holding: '1' })).toMatchObject({ status: 'degenerate', values: { quantity: 0n } })
  expect(calculateEoq({ demand: '1', order: '0', holding: '1' })).toMatchObject({ status: 'degenerate' })
  expect(calculateEoq({ demand: '1', order: '1', holding: '0' }).success).toBe(false)
})

it('payback handles uneven signed flows and first recovery', () => {
  expect(calculatePayback({ investment: '100', period: 'tahun', flows: ['30', '-10', '50', '60'].map(flow) }))
    .toMatchObject({ values: { payback: 350n, cumulative: 130n }, period: 'tahun' })
  expect(calculatePayback({ investment: '100', period: 'bulan', flows: ['120', '-100'].map(flow) }))
    .toMatchObject({ values: { payback: 83n, cumulative: 20n }, warning: expect.any(String) })
  expect(calculatePayback({ investment: '100', period: 'tahun', flows: ['20', '-10'].map(flow) }))
    .toMatchObject({ status: 'unrecovered', values: { payback: null, cumulative: 10n } })
  expect(calculatePayback({ investment: '0', period: 'bulan', flows: [flow('0')] }))
    .toMatchObject({ values: { payback: 0n } })
  expect(calculatePayback({ investment: '100', period: 'tahun', flows: ['0', '100'].map(flow) }))
    .toMatchObject({ values: { payback: 200n } })
})

it('payback validates each period and the finite horizon', () => {
  expect(calculatePayback({ investment: '1', period: 'tahun', flows: [] }).success).toBe(false)
  expect(calculatePayback({ investment: '1', period: 'minggu', flows: [flow('1')] }).success).toBe(false)
  expect(calculatePayback({ investment: '1', period: 'tahun', flows: [flow('1'), flow('NaN')] }))
    .toMatchObject({ success: false, errors: { 'flows.1.amount': expect.any(Array) } })
  expect(calculatePayback({ investment: '1', period: 'tahun', flows: Array(121).fill(flow('1')) }).success).toBe(false)
})

it('volumetric weight compares exact fractions before display rounding', () => {
  expect(calculateVolumetric({ length: '40', width: '30', height: '20', divisor: '6000', actual: '3' }))
    .toMatchObject({ values: { volumetric: 4000000n, comparison: 4000000n } })
  expect(calculateVolumetric({ length: '10', width: '10', height: '10', divisor: '6000', actual: '0,2' }))
    .toMatchObject({ values: { volumetric: 166667n, comparison: 200000n } })
  expect(calculateVolumetric({ length: '1', width: '1', height: '1', divisor: '1', actual: '1' }))
    .toMatchObject({ values: { volumetric: 1000000n, comparison: 1000000n } })
  expect(calculateVolumetric({ length: '0.001', width: '0.001', height: '0.001', divisor: '0.001', actual: '0' }))
    .toMatchObject({ values: { volumetric: 1n, comparison: 1n } })
})

it('rejects negative, empty, nonnumeric, oversized, over-precise, and zero-denominator inputs', () => {
  for (const value of ['', '-1', '1e3', 'NaN', null, Infinity, '10000000000000', '1.0001']) {
    expect(calculateVolumetric({ length: value, width: '1', height: '1', divisor: '1', actual: '0' }).success).toBe(false)
  }
  expect(calculateVolumetric({ length: '1', width: '1', height: '1', divisor: '0', actual: '0' }).success).toBe(false)
  expect(calculateFoodCost(null).success).toBe(false)
  expect(calculateEoq({ demand: '1.5', order: '1', holding: '1' }).success).toBe(false)
})

it('retains large rational money and volume values without Number coercion', () => {
  const max = '9999999999999'
  expect(calculateProjectQuote({ hours: max, hourly: max, materials: '0', overhead: '0', profit: '0' }))
    .toMatchObject({ values: { quote: 99999999999980000000000001n } })
  expect(calculateFoodCost({ servings: '1', ingredients: [{ price: max, package: '0.001', usage: max, unit: 'kg' }] }))
    .toMatchObject({ values: { total: 99999999999980000000000001000n } })
  expect(calculateVolumetric({ length: max, width: max, height: max, divisor: '0.001', actual: '0' }))
    .toMatchObject({ values: { volumetric: 9999999999999n ** 3n * 1000000000n } })
})
