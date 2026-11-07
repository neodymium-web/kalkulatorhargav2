import { describe, expect, it } from 'vitest'
import {
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateAnnuity,
  calculateFlatLoan,
  calculateDebtRatio,
  type FinanceResult,
} from '../lib/finance/engines'
import { listCategory, listPublished, sitemapPaths } from '../lib/registry'

function success(result: FinanceResult) {
  expect(result.success).toBe(true)
  if (!result.success) throw new Error(JSON.stringify(result.errors))
  return result
}

describe('source-verified finance examples', () => {
  it('simple interest uses annual rate and integer months', () => {
    expect(
      success(calculateSimpleInterest({ principal: '1000000', rate: '6', months: '18' })).values,
    ).toEqual({ interest: 90000n, future: 1090000n })
    expect(success(calculateSimpleInterest({ principal: '100', rate: '6', months: '1' })).values).toEqual({
      interest: 1n,
      future: 101n,
    })
    const tiny = success(calculateSimpleInterest({ principal: '1', rate: '6', months: '1' }))
    expect(tiny.values).toEqual({ interest: 0n, future: 1n })
    expect(tiny.notes?.join(' ')).toContain('masih positif')
  })

  it('compound interest uses exact integer powers and aligned periods', () => {
    expect(
      success(calculateCompoundInterest({ principal: '1000000', rate: '12', frequency: '12', periods: '2' }))
        .values,
    ).toEqual({ future: 1020100n, interest: 20100n, periodic: 10000n, effective: 126825n, duration: 2n })
    expect(
      success(calculateCompoundInterest({ principal: '100', rate: '10', frequency: '1', periods: '2' }))
        .values,
    ).toMatchObject({ future: 121n, interest: 21n, duration: 24n })
    expect(
      success(calculateCompoundInterest({ principal: '1000000', rate: '8', frequency: '4', periods: '4' }))
        .values,
    ).toMatchObject({
      future: 1082432n,
      interest: 82432n,
      duration: 12n,
      periodic: 20000n,
      effective: 82432n,
    })
  })

  it('annuity reconciles the independently worked three-month schedule', () => {
    const result = success(calculateAnnuity({ principal: '1000', rate: '12', months: '3' }))
    expect(result.values).toEqual({
      standard: 341n,
      first: 341n,
      last: 338n,
      lastMonth: 3n,
      total: 1020n,
      interest: 20n,
    })
    expect(result.schedule).toEqual([
      { month: 1, payment: 341n, principal: 331n, interest: 10n, balance: 669n },
      { month: 2, payment: 341n, principal: 334n, interest: 7n, balance: 335n },
      { month: 3, payment: 338n, principal: 335n, interest: 3n, balance: 0n },
    ])
    expect(result.values.total).not.toBe(result.values.standard * 3n)
  })

  it('flat loan allocates cumulative fractions without inflating interest', () => {
    const result = success(calculateFlatLoan({ principal: '1000', rate: '12', months: '3' }))
    expect(result.values).toEqual({ first: 343n, last: 344n, lastMonth: 3n, total: 1030n, interest: 30n })
    expect(result.schedule).toEqual([
      { month: 1, payment: 343n, principal: 333n, interest: 10n, balance: 667n },
      { month: 2, payment: 343n, principal: 333n, interest: 10n, balance: 334n },
      { month: 3, payment: 344n, principal: 334n, interest: 10n, balance: 0n },
    ])
    const fractional = success(calculateFlatLoan({ principal: '100', rate: '6', months: '3' }))
    expect(fractional.schedule?.map((row) => row.payment)).toEqual([34n, 33n, 35n])
    expect(fractional.schedule?.map((row) => row.interest)).toEqual([1n, 0n, 1n])
    expect(fractional.values).toMatchObject({ interest: 2n, total: 102n, last: 35n })
  })

  it('debt ratio uses net income and exact shortfall status', () => {
    expect(success(calculateDebtRatio({ income: '5000000', debt: '1500000' })).values).toEqual({
      ratio: 3000n,
      remaining: 3500000n,
    })
    expect(success(calculateDebtRatio({ income: '3', debt: '4' }))).toMatchObject({
      values: { ratio: 13333n, remaining: -1n },
      status: 'shortfall',
    })
    expect(success(calculateDebtRatio({ income: '32', debt: '1' })).values.ratio).toBe(313n)
    expect(success(calculateDebtRatio({ income: '9999999999998', debt: '9999999999999' }))).toMatchObject({
      values: { ratio: 10000n, remaining: -1n },
      status: 'shortfall',
    })
    expect(success(calculateDebtRatio({ income: '9999999999999', debt: '1' })).tiny).toContain('ratio')
    expect(calculateDebtRatio({ income: '0', debt: '1' }).success).toBe(false)
  })
})

describe('schedule and precision boundaries', () => {
  it('discloses a larger closing payment caused by whole-rupiah interest rounding', () => {
    const result = success(calculateAnnuity({ principal: '9', rate: '100', months: '600' }))
    expect(result.values).toMatchObject({ standard: 1n, first: 1n, last: 10n, lastMonth: 600n, interest: 600n, total: 609n })
    expect(result.schedule?.[0]).toEqual({ month: 1, payment: 1n, interest: 1n, principal: 0n, balance: 9n })
    expect(result.notes?.join(' ')).toContain('Pembayaran penutup lebih besar dari acuan')
  })
  for (const [name, engine] of [
    ['annuity', calculateAnnuity],
    ['flat', calculateFlatLoan],
  ] as const) {
    it(`${name} reconciles every row across small and large principals, rates, and tenures`, () => {
      for (const principal of ['0', '1', '1000', '10000000', '9999999999999']) {
        for (const rate of ['0', '0.0001', '6', '12', '100']) {
          for (const months of ['1', '3', '12', '600']) {
            const result = success(engine({ principal, rate, months }))
            const rows = result.schedule!
            expect(rows).toHaveLength(Number(months))
            let outstanding = BigInt(principal),
              paidPrincipal = 0n,
              paidInterest = 0n,
              paidTotal = 0n
            for (const row of rows) {
              expect(row.principal).toBeGreaterThanOrEqual(0n)
              expect(row.interest).toBeGreaterThanOrEqual(0n)
              expect(row.payment).toBe(row.principal + row.interest)
              expect(row.balance).toBe(outstanding - row.principal)
              expect(row.balance).toBeGreaterThanOrEqual(0n)
              outstanding = row.balance
              paidPrincipal += row.principal
              paidInterest += row.interest
              paidTotal += row.payment
            }
            expect(outstanding).toBe(0n)
            expect(paidPrincipal).toBe(BigInt(principal))
            expect(paidTotal).toBe(BigInt(principal) + paidInterest)
            expect(result.values.total).toBe(paidTotal)
            expect(result.values.interest).toBe(paidInterest)
            const last = rows.filter((row) => row.payment > 0n).at(-1)
            expect(result.values.last).toBe(last?.payment ?? 0n)
            expect(result.values.lastMonth).toBe(BigInt(last?.month ?? 0))
          }
        }
      }
    })

    it(`${name} supports zero principal without claiming a payment`, () => {
      const result = success(engine({ principal: '0', rate: '12', months: '600' }))
      expect(result.status).toBe('zero-principal')
      expect(result.values).toMatchObject({ first: 0n, last: 0n, total: 0n, interest: 0n, lastMonth: 0n })
    })

    it(`${name} discloses positive subrupiah interest`, () => {
      const result = success(engine({ principal: '1', rate: '0.0001', months: '1' }))
      expect(result.values.interest).toBe(0n)
      expect(result.notes?.join(' ')).toContain('masih positif')
    })
  }

  it('zero interest does not create a fictitious interest or multiply a rounded installment', () => {
    const annuity = success(calculateAnnuity({ principal: '1000', rate: '0', months: '3' }))
    expect(annuity.schedule?.map((row) => row.payment)).toEqual([334n, 334n, 332n])
    expect(annuity.values).toMatchObject({ standard: 334n, total: 1000n, interest: 0n, last: 332n })
    expect(
      success(calculateFlatLoan({ principal: '1000', rate: '0', months: '3' })).schedule?.map(
        (row) => row.payment,
      ),
    ).toEqual([333n, 333n, 334n])
  })

  it('annuity caps payment at the remaining debt and keeps paid-off rows zero', () => {
    const result = success(calculateAnnuity({ principal: '1', rate: '100', months: '600' }))
    expect(result.values).toMatchObject({ standard: 1n, last: 1n, lastMonth: 1n, total: 1n, interest: 0n })
    expect(
      result.schedule
        ?.slice(1)
        .every((row) => row.payment === 0n && row.balance === 0n && row.interest === 0n),
    ).toBe(true)
  })

  it('compound zero periods, rate, and principal retain the expected balance', () => {
    expect(
      success(
        calculateCompoundInterest({
          principal: '9999999999999',
          rate: '0',
          frequency: '12',
          periods: '1200',
        }),
      ).values,
    ).toMatchObject({ future: 9999999999999n, interest: 0n })
    expect(
      success(
        calculateCompoundInterest({ principal: '9999999999999', rate: '100', frequency: '1', periods: '0' }),
      ).values.future,
    ).toBe(9999999999999n)
    expect(
      success(calculateCompoundInterest({ principal: '0', rate: '100', frequency: '1', periods: '1200' }))
        .values.future,
    ).toBe(0n)
  })

  it('compound bounds large powers, rejects overflow, and discloses tiny positive gains', () => {
    expect(
      success(
        calculateCompoundInterest({ principal: '9999999999999', rate: '100', frequency: '1', periods: '16' }),
      ).values.future,
    ).toBe(655359999999934464n)
    expect(
      calculateCompoundInterest({ principal: '9999999999999', rate: '100', frequency: '1', periods: '17' }),
    ).toMatchObject({ success: false, errors: { periods: expect.any(Array) } })
    const result = success(
      calculateCompoundInterest({ principal: '1', rate: '0,0001', frequency: '12', periods: '1' }),
    )
    expect(result.values).toMatchObject({ future: 1n, interest: 0n, periodic: 0n, effective: 1n })
    expect(result.tiny).toContain('periodic')
    expect(result.notes?.join(' ')).toContain('masih positif')
  })

  it('simple interest keeps maximum inputs exact and accepts zero duration', () => {
    expect(
      success(calculateSimpleInterest({ principal: '9999999999999', rate: '100', months: '1200' })).values,
    ).toEqual({ interest: 999999999999900n, future: 1009999999999899n })
    expect(success(calculateSimpleInterest({ principal: '999', rate: '100', months: '0' })).values).toEqual({
      interest: 0n,
      future: 999n,
    })
  })

  it('ratios support zero commitments and exact 100 percent', () => {
    expect(success(calculateDebtRatio({ income: '3', debt: '0' })).values).toEqual({
      ratio: 0n,
      remaining: 3n,
    })
    const equal = success(calculateDebtRatio({ income: '3', debt: '3' }))
    expect(equal.values).toEqual({ ratio: 10000n, remaining: 0n })
    expect(equal.status).toBeUndefined()
  })
})

describe('finance validation and publication', () => {
  for (const invalid of ['', '-1', 'NaN', 'Infinity', '1e2', '1.23456', '100.0001']) {
    it(`rejects invalid annual rate ${invalid}`, () => {
      for (const engine of [calculateSimpleInterest, calculateAnnuity, calculateFlatLoan])
        expect(engine({ principal: '100', rate: invalid, months: '12' }).success).toBe(false)
      expect(
        calculateCompoundInterest({ principal: '100', rate: invalid, frequency: '12', periods: '12' })
          .success,
      ).toBe(false)
    })
  }
  for (const invalid of ['', '-1', '1.5', '1e2', '1,000', '10000000000000']) {
    it(`rejects invalid principal ${invalid}`, () => {
      expect(calculateSimpleInterest({ principal: invalid, rate: '6', months: '1' }).success).toBe(false)
      expect(calculateAnnuity({ principal: invalid, rate: '6', months: '1' }).success).toBe(false)
      expect(calculateFlatLoan({ principal: invalid, rate: '6', months: '1' }).success).toBe(false)
      expect(
        calculateCompoundInterest({ principal: invalid, rate: '6', frequency: '12', periods: '1' }).success,
      ).toBe(false)
    })
  }
  for (const invalid of ['0', '601', '-1', '2.5', '', 'NaN'])
    it(`rejects invalid loan tenure ${invalid}`, () => {
      for (const engine of [calculateAnnuity, calculateFlatLoan])
        expect(engine({ principal: '1', rate: '1', months: invalid }).success).toBe(false)
    })
  for (const invalid of ['1201', '-1', '1.5', '1e3', ''])
    it(`rejects invalid compound period ${invalid}`, () => {
      expect(
        calculateCompoundInterest({ principal: '1', rate: '1', frequency: '12', periods: invalid }).success,
      ).toBe(false)
      expect(calculateSimpleInterest({ principal: '1', rate: '1', months: invalid }).success).toBe(false)
    })
  for (const invalid of ['', '3', '365', null])
    it(`rejects unsupported frequency ${invalid}`, () => {
      expect(
        calculateCompoundInterest({ principal: '1', rate: '1', frequency: invalid, periods: '1' }).success,
      ).toBe(false)
    })
  it('rejects malformed payloads and negative commitments', () => {
    for (const engine of [
      calculateSimpleInterest,
      calculateCompoundInterest,
      calculateAnnuity,
      calculateFlatLoan,
      calculateDebtRatio,
    ]) {
      for (const input of [null, undefined, {}, { principal: 100, rate: 1, months: 3 }])
        expect(engine(input).success).toBe(false)
    }
    expect(calculateDebtRatio({ income: '100', debt: '-1' }).success).toBe(false)
  })
  it('retains the first finance batch in the expanded published hub', () => {
    expect(listPublished()).toHaveLength(86)
    expect(listCategory('keuangan')).toHaveLength(20)
    expect(listCategory('keuangan').slice(0, 5).map((tool) => tool.slug)).toEqual([
      'bunga-sederhana',
      'bunga-majemuk',
      'cicilan-anuitas',
      'cicilan-flat',
      'rasio-cicilan',
    ])
    expect(listCategory('bisnis')).toHaveLength(20)
    expect(listCategory('marketplace')).toHaveLength(16)
    expect(sitemapPaths()).toHaveLength(92)
    expect(sitemapPaths()).toContain('/keuangan')
    expect(sitemapPaths()).toContain('/kalkulator/kpr')
  })
})
