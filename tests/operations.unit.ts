import { expect, it } from 'vitest'
import {
  calculateCashFlow, calculateCogs, calculateDepreciation, calculateUtilization, calculateYield,
} from '../lib/operations/engines'

const period = { start: '2026-10-01', end: '2026-10-31' }

it('calculates merchandising COGS and checks available inventory', () => {
  const input = { ...period, opening: '125000', purchases: '84000', closing: '59000' }
  expect(calculateCogs(input)).toMatchObject({ values: { cogs: 150000n, available: 209000n } })
  expect(calculateCogs({ ...input, closing: '209000' })).toMatchObject({ values: { cogs: 0n } })
  expect(calculateCogs({ ...input, closing: '209001' })).toMatchObject({ success: false, errors: { closing: expect.any(Array) } })
  expect(calculateCogs({ ...input, opening: '9999999999999', purchases: '9999999999999', closing: '0' }))
    .toMatchObject({ values: { cogs: 19999999999998n } })
})

it('calculates yield and exact loss in the selected weight unit', () => {
  expect(calculateYield({ gross: '2,4', net: '1.75', unit: 'kg' }))
    .toMatchObject({ unit: 'kg', values: { yield: 7292n, loss: 650n, lossPercent: 2708n } })
  expect(calculateYield({ gross: '1', net: '0', unit: 'g' }))
    .toMatchObject({ values: { yield: 0n, loss: 1000n, lossPercent: 10000n } })
  expect(calculateYield({ gross: '32', net: '1', unit: 'g' }))
    .toMatchObject({ values: { yield: 313n, lossPercent: 9688n } })
  for (const input of [{ gross: '0', net: '0', unit: 'g' }, { gross: '1', net: '2', unit: 'kg' },
    { gross: '1', net: '0', unit: 'lb' }, { gross: '1.0001', net: '0', unit: 'g' }]) {
    expect(calculateYield(input).success).toBe(false)
  }
})

it('rounds annual book depreciation to whole rupiah', () => {
  const input = { cost: '100007', residual: '10000', years: '4' }
  expect(calculateDepreciation(input)).toMatchObject({ values: { annual: 22502n, base: 90007n } })
  expect(calculateDepreciation({ ...input, residual: input.cost })).toMatchObject({ values: { annual: 0n } })
  expect(calculateDepreciation({ ...input, cost: '1', residual: '0', years: '2' })).toMatchObject({ values: { annual: 1n } })
  for (const invalid of [{ residual: '100008' }, { years: '0' }, { years: '1,5' }]) {
    expect(calculateDepreciation({ ...input, ...invalid }).success).toBe(false)
  }
})

it('preserves signed cash balances and warns on a deficit', () => {
  expect(calculateCashFlow({ ...period, opening: '35000', receipts: '48000', payments: '91000' }))
    .toMatchObject({ values: { net: -43000n, closing: -8000n }, warning: expect.stringContaining('negatif') })
  expect(calculateCashFlow({ ...period, opening: '-2', receipts: '0', payments: '0' }))
    .toMatchObject({ values: { net: 0n, closing: -2n } })
  expect(calculateCashFlow({ ...period, opening: '9999999999999', receipts: '9999999999999', payments: '0' }))
    .toMatchObject({ values: { closing: 19999999999998n }, warning: undefined })
  expect(calculateCashFlow({ ...period, opening: '0', receipts: '-1', payments: '0' }).success).toBe(false)
})

it('rounds utilization and detects overrun before rounding', () => {
  const input = { ...period, actual: '98,5', capacity: '80', unit: 'kg' }
  expect(calculateUtilization(input)).toMatchObject({ values: { utilization: 12313n }, warning: expect.stringContaining('melampaui') })
  expect(calculateUtilization({ ...input, actual: '80.001' }))
    .toMatchObject({ values: { utilization: 10000n }, warning: expect.stringContaining('melampaui') })
  expect(calculateUtilization({ ...input, actual: '0' })).toMatchObject({ values: { utilization: 0n }, warning: undefined })
  expect(calculateUtilization({ ...input, capacity: '0' }).success).toBe(false)
  expect(calculateUtilization({ ...input, actual: '9999999999999.999', capacity: '0.001' }))
    .toMatchObject({ values: { utilization: 99999999999999990000n } })
})

it('requires valid dates in chronological order for each period calculator', () => {
  for (const [engine, input] of [
    [calculateCogs, { opening: '1', purchases: '0', closing: '0' }],
    [calculateCashFlow, { opening: '0', receipts: '1', payments: '0' }],
    [calculateUtilization, { actual: '1', capacity: '1', unit: 'unit' }],
  ] as const) {
    expect(engine({ ...input, start: '2026-10-03', end: '2026-10-02' }))
      .toMatchObject({ success: false, errors: { end: expect.any(Array) } })
    expect(engine({ ...input, ...period, end: '2026-02-30' }).success).toBe(false)
    expect(engine({ ...input, ...period, end: '' }).success).toBe(false)
    expect(engine({ ...input, ...period, end: period.start }).success).toBe(true)
  }
})

it('rejects malformed inputs without attempting BigInt conversion', () => {
  for (const opening of ['', 'NaN', '1e2', '10000000000000', null, Infinity]) {
    expect(calculateCogs({ ...period, opening, purchases: '0', closing: '0' }).success).toBe(false)
  }
  expect(calculateYield(null).success).toBe(false)
})
