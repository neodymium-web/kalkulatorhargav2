import { expect, it } from 'vitest'
import { calculateTurnover, calculateReorder, calculateRunway, calculateServiceCost, calculateFreelance } from '../lib/stock-services/engines'

const period = { start: '2026-04-01', end: '2026-04-30' }
const month = '2026-04'

it('turnover uses exact average and inclusive calendar days', () => {
  const input = { ...period, cogs: '90000', opening: '20000', closing: '40000' }
  expect(calculateTurnover(input)).toMatchObject({ values: { turnover: 300n, days: 1000n, average: 3000000n } })
  expect(calculateTurnover({ ...input, cogs: '0' })).toMatchObject({ values: { turnover: 0n, days: null }, status: 'no-cogs' })
  expect(calculateTurnover({ ...input, opening: '0', closing: '0' }).success).toBe(false)
  expect(calculateTurnover({ ...period, cogs: '1', opening: '1', closing: '2' }))
    .toMatchObject({ values: { turnover: 67n, days: 4500n, average: 150n } })
  expect(calculateTurnover({ ...input, end: period.start })).toMatchObject({ values: { days: 33n } })
  expect(calculateTurnover({ ...input, end: '2026-03-31' }).success).toBe(false)
  expect(calculateTurnover({ ...input, end: '2026-02-30' }).success).toBe(false)
})

it('reorder rounds exact scaled demand up to physical units', () => {
  expect(calculateReorder({ demand: '2,5', lead: '3.25', safety: '1,1' })).toMatchObject({ values: { reorder: 10n } })
  expect(calculateReorder({ demand: '2', lead: '3', safety: '1' })).toMatchObject({ values: { reorder: 7n } })
  expect(calculateReorder({ demand: '2', lead: '0', safety: '1.001' })).toMatchObject({ values: { reorder: 2n } })
  expect(calculateReorder({ demand: '0', lead: '0', safety: '0' })).toMatchObject({ values: { reorder: 0n } })
})

it('runway floors months and makes no-burn an explicit state', () => {
  const input = { month, cash: '100000', outflow: '40000', inflow: '10000' }
  expect(calculateRunway(input)).toMatchObject({ values: { months: 333n, burn: 30000n } })
  expect(calculateRunway({ ...input, cash: '0' })).toMatchObject({ values: { months: 0n } })
  expect(calculateRunway({ ...input, inflow: '40000' })).toMatchObject({ status: 'no-burn', values: { months: null, burn: 0n } })
  expect(calculateRunway({ ...input, inflow: '50000' })).toMatchObject({ status: 'no-burn', values: { months: null, burn: -10000n } })
  expect(calculateRunway({ ...input, cash: '-1' }).success).toBe(false)
  expect(calculateRunway({ ...input, month: '2026-13' }).success).toBe(false)
})

it('service cost rounds up without changing the exact monthly total', () => {
  const input = { month, fixed: '100001', variable: '2000', transactions: '3' }
  expect(calculateServiceCost(input)).toMatchObject({ values: { cost: 35334n, allocation: 33334n, total: 106001n } })
  expect(calculateServiceCost({ ...input, fixed: '0', variable: '0' })).toMatchObject({ values: { cost: 0n, allocation: 0n, total: 0n } })
  for (const transactions of ['0', '1,5', '-1']) expect(calculateServiceCost({ ...input, transactions }).success).toBe(false)
})

it('freelance rounds the required rate up using exact billable hours', () => {
  const input = { earnings: '120000000', expenses: '12000001', hours: '1000,5' }
  expect(calculateFreelance(input)).toMatchObject({ values: { hourly: 131935n, requirement: 132000001n } })
  expect(131934n * 10005n).toBeLessThan(132000001n * 10n)
  expect(131935n * 10005n).toBeGreaterThanOrEqual(132000001n * 10n)
  expect(calculateFreelance({ earnings: '0', expenses: '0', hours: '0.001' })).toMatchObject({ values: { hourly: 0n } })
  expect(calculateFreelance({ ...input, hours: '0' }).success).toBe(false)
})

it('preserves large inputs without numeric overflow or intermediate rounding', () => {
  const maximum = '9999999999999'
  expect(calculateFreelance({ earnings: maximum, expenses: maximum, hours: '0.001' }))
    .toMatchObject({ values: { hourly: 19999999999998000n } })
  expect(calculateServiceCost({ month, fixed: maximum, variable: maximum, transactions: maximum }))
    .toMatchObject({ values: { cost: 10000000000000n, total: 99999999999990000000000000n } })
  expect(calculateReorder({ demand: maximum, lead: maximum, safety: '0' }))
    .toMatchObject({ values: { reorder: 99999999999980000000000001n } })
})

it('rejects blank, negative, nonnumeric, oversized, and over-precise inputs', () => {
  for (const [engine, key, input] of [
    [calculateTurnover, 'cogs', { ...period, opening: '1', closing: '1' }],
    [calculateReorder, 'demand', { lead: '1', safety: '0' }],
    [calculateRunway, 'cash', { month, outflow: '1', inflow: '0' }],
    [calculateServiceCost, 'fixed', { month, variable: '1', transactions: '1' }],
    [calculateFreelance, 'earnings', { expenses: '0', hours: '1' }],
  ] as const) {
    for (const value of ['', '-1', 'NaN', 'Infinity', '1e2', '10000000000000', null, undefined]) {
      expect(engine({ ...input, [key]: value }).success).toBe(false)
    }
  }
  expect(calculateReorder({ demand: '1.0001', lead: '1', safety: '0' }).success).toBe(false)
  expect(calculateFreelance({ earnings: '1', expenses: '0', hours: '1.0001' }).success).toBe(false)
})
