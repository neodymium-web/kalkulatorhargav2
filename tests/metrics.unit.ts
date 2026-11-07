import { expect, it } from 'vitest'
import { calculateAcos, calculateAov, calculateBreakEvenRoas, calculateConversion, calculateRoas } from '../lib/marketplace-metrics/engines'

it('ROAS uses attributed revenue and rejects zero spend', () => {
  expect(calculateRoas({ revenue: '400000', spend: '100000' })).toMatchObject({ values: { roas: 400n } })
  expect(calculateRoas({ revenue: '1', spend: '32' })).toMatchObject({ values: { roas: 3n } })
  expect(calculateRoas({ revenue: '1', spend: '8' })).toMatchObject({ values: { roas: 13n } })
  expect(calculateRoas({ revenue: '0', spend: '1' })).toMatchObject({ values: { roas: 0n } })
  for (const revenue of ['0', '1']) {
    expect(calculateRoas({ revenue, spend: '0' })).toMatchObject({ success: false, errors: { spend: expect.any(Array) } })
  }
})

it('break-even ROAS ceilings the exact contribution threshold', () => {
  expect(calculateBreakEvenRoas({ revenue: '100000', variable: '60000' }))
    .toMatchObject({ values: { threshold: 250n, contribution: 40000n, margin: 4000n } })
  expect(calculateBreakEvenRoas({ revenue: '100000', variable: '70000' }))
    .toMatchObject({ values: { threshold: 334n, contribution: 30000n, margin: 3000n } })
  expect(calculateBreakEvenRoas({ revenue: '10001', variable: '6001' }))
    .toMatchObject({ values: { threshold: 251n } })
  expect(333n * 30000n).toBeLessThan(100000n * 100n)
  expect(334n * 30000n).toBeGreaterThanOrEqual(100000n * 100n)
  expect(calculateBreakEvenRoas({ revenue: '1', variable: '0' })).toMatchObject({ values: { threshold: 100n, margin: 10000n } })
})

it('break-even ROAS makes nonpositive contribution an explicit result', () => {
  expect(calculateBreakEvenRoas({ revenue: '100', variable: '100' }))
    .toMatchObject({ status: 'no-finite-roas', values: { threshold: null, contribution: 0n, margin: 0n } })
  expect(calculateBreakEvenRoas({ revenue: '100', variable: '150' }))
    .toMatchObject({ status: 'no-finite-roas', values: { threshold: null, contribution: -50n, margin: -5000n } })
  expect(calculateBreakEvenRoas({ revenue: '0', variable: '0' }).success).toBe(false)
})

it('ACOS treats zero revenue as undefined and zero spend as zero', () => {
  expect(calculateAcos({ spend: '100000', revenue: '400000' })).toMatchObject({ values: { acos: 2500n } })
  expect(calculateAcos({ spend: '1', revenue: '3' })).toMatchObject({ values: { acos: 3333n } })
  expect(calculateAcos({ spend: '0', revenue: '1' })).toMatchObject({ values: { acos: 0n } })
  expect(calculateAcos({ spend: '3', revenue: '1' })).toMatchObject({ values: { acos: 30000n } })
  for (const spend of ['0', '1']) {
    expect(calculateAcos({ spend, revenue: '0' })).toMatchObject({ status: 'undefined-acos', values: { acos: null } })
  }
})

it('ROAS and ACOS independently round reciprocal exact ratios', () => {
  // Exact ROAS 2/3 has reciprocal ACOS 150%. Using displayed 0.67 would give a different ACOS.
  expect(calculateRoas({ revenue: '2', spend: '3' })).toMatchObject({ values: { roas: 67n } })
  expect(calculateAcos({ revenue: '2', spend: '3' })).toMatchObject({ values: { acos: 15000n } })
  expect(calculateRoas({ revenue: '400', spend: '100' })).toMatchObject({ values: { roas: 400n } })
  expect(calculateAcos({ revenue: '400', spend: '100' })).toMatchObject({ values: { acos: 2500n } })
})

it('conversion uses purchasing visits with 0 and 100 percent boundaries', () => {
  expect(calculateConversion({ visits: '200', purchasing: '7' })).toMatchObject({ values: { conversion: 350n } })
  expect(calculateConversion({ visits: '32', purchasing: '1' })).toMatchObject({ values: { conversion: 313n } })
  expect(calculateConversion({ visits: '32', purchasing: '0' })).toMatchObject({ values: { conversion: 0n } })
  expect(calculateConversion({ visits: '32', purchasing: '32' })).toMatchObject({ values: { conversion: 10000n } })
  expect(calculateConversion({ visits: '0', purchasing: '0' }).success).toBe(false)
  expect(calculateConversion({ visits: '32', purchasing: '33' }))
    .toMatchObject({ success: false, errors: { purchasing: expect.any(Array) } })
  expect(calculateConversion({ visits: '32.5', purchasing: '1' }).success).toBe(false)
})

it('AOV rounds matched order cohort revenue to exact cents', () => {
  expect(calculateAov({ revenue: '100000', orders: '3' })).toMatchObject({ values: { aov: 3333333n } })
  expect(calculateAov({ revenue: '1', orders: '8' })).toMatchObject({ values: { aov: 13n } })
  expect(calculateAov({ revenue: '0', orders: '3' })).toMatchObject({ values: { aov: 0n } })
  expect(calculateAov({ revenue: '1', orders: '0' })).toMatchObject({ success: false, errors: { orders: expect.any(Array) } })
})

it('keeps huge ratios and money exact without Number conversion', () => {
  const maximum = '9999999999999'
  expect(calculateRoas({ revenue: maximum, spend: '1' })).toMatchObject({ values: { roas: 999999999999900n } })
  expect(calculateAcos({ revenue: '1', spend: maximum })).toMatchObject({ values: { acos: 99999999999990000n } })
  expect(calculateBreakEvenRoas({ revenue: maximum, variable: '9999999999998' }))
    .toMatchObject({ values: { threshold: 999999999999900n, contribution: 1n, margin: 0n } })
  expect(calculateAov({ revenue: maximum, orders: '1' })).toMatchObject({ values: { aov: 999999999999900n } })
  expect(calculateConversion({ visits: maximum, purchasing: maximum })).toMatchObject({ values: { conversion: 10000n } })
})

it.each([
  [calculateRoas, 'revenue', { spend: '1' }],
  [calculateBreakEvenRoas, 'variable', { revenue: '1' }],
  [calculateAcos, 'spend', { revenue: '1' }],
  [calculateConversion, 'purchasing', { visits: '1' }],
  [calculateAov, 'orders', { revenue: '1' }],
] as const)('rejects malformed inputs for %s', (engine, key, input) => {
  for (const value of ['', '-1', '1,5', '1.5', '1e3', 'NaN', 'Infinity', '10000000000000', null, undefined]) {
    expect(engine({ ...input, [key]: value })).toMatchObject({ success: false, errors: { [key]: expect.any(Array) } })
  }
})
