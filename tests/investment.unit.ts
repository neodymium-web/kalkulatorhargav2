import { describe, expect, it } from 'vitest'
import {
  calculateSavingsGoal,
  calculateEmergencyFund,
  calculateDeposit,
  calculateInvestmentRoi,
  calculateCagr,
  type InvestmentResult,
} from '../lib/investment/engines'
import { formatInvestment } from '../lib/investment/format'
import { listPublished, listCategory, sitemapPaths } from '../lib/registry'

function success(result: InvestmentResult) {
  expect(result.success).toBe(true)
  if (!result.success) throw new Error(JSON.stringify(result.errors))
  return result
}
function value(result: InvestmentResult, key: string) {
  const found = success(result).values[key]
  expect(typeof found).toBe('bigint')
  return found as bigint
}

describe('independent investment examples', () => {
  it('savings goal returns the exact minimum end-of-month payment', () => {
    expect(
      success(calculateSavingsGoal({ initial: '0', target: '1200', rate: '0', months: '12' })).values,
    ).toEqual({
      payment: 10000n,
      deposits: 120000n,
      startingGrowth: 0n,
      allGrowth: 0n,
      future: 120000n,
      surplus: 0n,
    })
    expect(
      success(calculateSavingsGoal({ initial: '1000', target: '1000', rate: '0', months: '12' })),
    ).toMatchObject({ status: 'no-deposits', values: { payment: 0n, future: 100000n } })
    expect(
      success(calculateSavingsGoal({ initial: '1000', target: '5000', rate: '12', months: '2' })).values,
    ).toEqual({
      payment: 198100n,
      deposits: 396200n,
      startingGrowth: 2010n,
      allGrowth: 3991n,
      future: 500191n,
      surplus: 191n,
    })
  })

  it('emergency reserve separates shortfall and surplus', () => {
    expect(
      success(calculateEmergencyFund({ expenses: '2000000', months: '6', available: '3000000' })).values,
    ).toEqual({ target: 12000000n, gap: 9000000n, surplus: 0n, coverage: 150n })
    expect(success(calculateEmergencyFund({ expenses: '100', months: '3', available: '350' }))).toMatchObject(
      { status: 'covered', values: { target: 300n, gap: 0n, surplus: 50n, coverage: 350n } },
    )
    expect(success(calculateEmergencyFund({ expenses: '0', months: '3', available: '50' })).values).toEqual({
      target: 0n,
      gap: 0n,
      surplus: 50n,
      coverage: null,
    })
  })

  it('deposit reconciles rounded gross interest withholding and maturity', () => {
    expect(
      success(calculateDeposit({ principal: '1200000', rate: '6', months: '6', tax: '20', fees: '0' }))
        .values,
    ).toEqual({ maturity: 1228800n, gross: 36000n, withholding: 7200n, fees: 0n, net: 28800n })
    expect(
      success(calculateDeposit({ principal: '100', rate: '6', months: '1', tax: '50', fees: '0' })).values,
    ).toEqual({ maturity: 100n, gross: 1n, withholding: 1n, fees: 0n, net: 0n })
    expect(
      success(calculateDeposit({ principal: '100', rate: '0', months: '1', tax: '0', fees: '5' })),
    ).toMatchObject({
      status: 'negative-return',
      values: { maturity: 95n, gross: 0n, withholding: 0n, fees: 5n, net: -5n },
    })
    expect(calculateDeposit({ principal: '100', rate: '0', months: '1', fees: '101' })).toMatchObject({
      success: false,
      errors: { fees: expect.any(Array) },
    })
  })

  it('holding period ROI supports signed net gains and fee accounting', () => {
    expect(success(calculateInvestmentRoi({ initial: '100', ending: '90', costs: '5' })).values).toEqual({
      gain: -15n,
      roi: -1500n,
    })
    expect(success(calculateInvestmentRoi({ initial: '100', ending: '120', costs: '5' })).values).toEqual({
      gain: 15n,
      roi: 1500n,
    })
    expect(success(calculateInvestmentRoi({ initial: '100', ending: '0', costs: '5' })).values).toEqual({
      gain: -105n,
      roi: -10500n,
    })
    expect(success(calculateInvestmentRoi({ initial: '32', ending: '33', costs: '0' })).values.roi).toBe(313n)
    expect(success(calculateInvestmentRoi({ initial: '32', ending: '31', costs: '0' })).values.roi).toBe(
      -313n,
    )
    expect(success(calculateInvestmentRoi({ initial: '100', ending: '100', costs: '0' })).values).toEqual({
      gain: 0n,
      roi: 0n,
    })
  })

  it('CAGR rounds exact positive and negative root thresholds correctly', () => {
    for (const [ending, expected] of [
      ['121', 100000n],
      ['81', -100000n],
      ['0', -1000000n],
      ['100', 0n],
    ] as const)
      expect(value(calculateCagr({ initial: '100', ending, years: '2' }), 'cagr')).toBe(expected)
    expect(value(calculateCagr({ initial: '1000', ending: '1331', years: '3' }), 'cagr')).toBe(100000n)
    expect(value(calculateCagr({ initial: '100', ending: '200', years: '3' }), 'cagr')).toBe(259921n)
    expect(value(calculateCagr({ initial: '100', ending: '50', years: '3' }), 'cagr')).toBe(-206299n)
    for (const [ending, expected, hint] of [
      ['4000004000001', 1n, undefined],
      ['4000004000000', 0n, 'positive'],
      ['4000004000002', 1n, undefined],
      ['3999996000001', -1n, undefined],
      ['3999996000002', 0n, 'negative'],
      ['3999996000000', -1n, undefined],
    ] as const) {
      const result = success(calculateCagr({ initial: '4000000000000', ending, years: '2' }))
      expect(result.values.cagr).toBe(expected)
      expect(result.precision?.cagr).toBe(hint)
    }
  })
})

describe('minimum contributions and ledger invariants', () => {
  it('proves savings payment minimal with a separate month-by-month rational recurrence', () => {
    const rates = [
      { text: '0', numerator: 0n, denominator: 1n },
      { text: '12', numerator: 1n, denominator: 100n },
      { text: '0.0001', numerator: 1n, denominator: 12000000n },
      { text: '100', numerator: 1n, denominator: 12n },
    ]
    for (const initial of [0n, 1000n, 1000000n])
      for (const target of [0n, 1200n, 5000000n]) {
        for (const months of [1, 2, 12, 120])
          for (const rate of rates) {
            const result = success(
              calculateSavingsGoal({
                initial: String(initial),
                target: String(target),
                rate: rate.text,
                months: String(months),
              }),
            )
            const paymentCents = result.values.payment!
            expect(paymentCents! % 100n).toBe(0n)
            const payment = paymentCents! / 100n
            function project(amount: bigint) {
              let numerator = initial,
                denominator = 1n
              for (let month = 0; month < months; month++) {
                numerator =
                  numerator * (rate.denominator + rate.numerator) + amount * denominator * rate.denominator
                denominator *= rate.denominator
              }
              return { numerator, denominator }
            }
            const achieved = project(payment)
            expect(achieved.numerator).toBeGreaterThanOrEqual(target * achieved.denominator)
            if (payment > 0n) {
              const smaller = project(payment - 1n)
              expect(smaller.numerator).toBeLessThan(target * smaller.denominator)
            }
            expect(result.values.future).toBe(
              (initial + payment * BigInt(months)) * 100n + result.values.allGrowth!,
            )
            expect(result.values.surplus).toBe(result.values.future! - target * 100n)
            expect(result.values.allGrowth!).toBeGreaterThanOrEqual(result.values.startingGrowth!)
          }
      }
  })

  it('reconciles deposit amounts at zero and high principal, interest, withholding, and fees', () => {
    for (const principal of ['0', '1', '100', '1200000', '9999999999999'])
      for (const rate of ['0', '0.0001', '6', '100']) {
        for (const months of ['1', '6', '1200'])
          for (const tax of ['0', '20', '50', '100'])
            for (const fees of ['0', principal]) {
              const values = success(calculateDeposit({ principal, rate, months, tax, fees })).values
              expect(values.withholding!).toBeLessThanOrEqual(values.gross!)
              expect(values.net).toBe(values.gross! - values.withholding! - values.fees!)
              expect(values.maturity).toBe(BigInt(principal) + values.net!)
              expect(values.maturity!).toBeGreaterThanOrEqual(0n)
            }
      }
  })

  it('bounds CAGR display by independent rational half-increment comparisons', () => {
    const scale = 1000000n
    for (const initial of [1n, 2n, 100n, 9999999999999n])
      for (const ending of [1n, 2n, 100n, 9999999999999n]) {
        for (const years of [1n, 2n, 3n, 100n]) {
          const rate = value(
            calculateCagr({ initial: String(initial), ending: String(ending), years: String(years) }),
            'cagr',
          )
          expect(rate).toBeGreaterThanOrEqual(-scale)
          const growth = rate + scale
          const lower = growth === 0n ? 0n : initial * (2n * growth - 1n) ** years
          const upper = initial * (2n * growth + 1n) ** years
          const target = ending * (2n * scale) ** years
          if (ending >= initial) {
            expect(target).toBeGreaterThanOrEqual(lower)
            expect(target).toBeLessThan(upper)
          } else {
            expect(target).toBeGreaterThan(lower)
            expect(target).toBeLessThanOrEqual(upper)
          }
        }
      }
  })
})

describe('precision and bounds', () => {
  it('discloses small positive savings gains and exact surplus without early rounding', () => {
    const result = success(calculateSavingsGoal({ initial: '1', target: '2', rate: '0,0001', months: '1' }))
    expect(result.values).toMatchObject({ payment: 100n, deposits: 100n, future: 200n, surplus: 0n })
    expect(result.precision).toEqual({
      startingGrowth: 'positive',
      allGrowth: 'positive',
      surplus: 'positive',
    })
  })
  it('handles zero target, grown initial balance, and bounded high projections', () => {
    expect(
      value(calculateSavingsGoal({ initial: '1000', target: '0', rate: '12', months: '12' }), 'payment'),
    ).toBe(0n)
    expect(
      success(calculateSavingsGoal({ initial: '1000', target: '1100', rate: '12', months: '12' })).status,
    ).toBe('no-deposits')
    expect(
      value(
        calculateSavingsGoal({ initial: '0', target: '9999999999999', rate: '0', months: '1' }),
        'payment',
      ),
    ).toBe(999999999999900n)
    expect(
      calculateSavingsGoal({ initial: '9999999999999', target: '1', rate: '100', months: '600' }),
    ).toMatchObject({ success: false, errors: { months: expect.any(Array) } })
  })
  it('keeps emergency amounts exact, coverage undefined at zero, and small coverage positive', () => {
    expect(
      success(calculateEmergencyFund({ expenses: '0', months: '1', available: '0' })).values.coverage,
    ).toBeNull()
    expect(
      success(calculateEmergencyFund({ expenses: '9999999999999', months: '1200', available: '1' })),
    ).toMatchObject({
      values: { target: 11999999999998800n, gap: 11999999999998799n, surplus: 0n, coverage: 0n },
      precision: { coverage: 'positive' },
    })
  })
  it('treats optional deposit inputs as zero only when blank or omitted', () => {
    expect(success(calculateDeposit({ principal: '100', rate: '0', months: '1' })).values).toMatchObject({
      withholding: 0n,
      fees: 0n,
      maturity: 100n,
    })
    expect(
      success(calculateDeposit({ principal: '100', rate: '0', months: '1', tax: ' ', fees: '' })).values,
    ).toMatchObject({ withholding: 0n, fees: 0n })
    expect(calculateDeposit({ principal: '100', rate: '0', months: '1', tax: null, fees: '0' }).success).toBe(
      false,
    )
    expect(
      success(calculateDeposit({ principal: '1', rate: '0.0001', months: '1' })).notes?.join(' '),
    ).toContain('masih positif')
  })
  it('preserves tiny negative ROI and positive-end CAGR near total loss', () => {
    const roi = success(
      calculateInvestmentRoi({ initial: '9999999999999', ending: '9999999999998', costs: '0' }),
    )
    expect(roi.values).toEqual({ gain: -1n, roi: 0n })
    expect(roi.precision?.roi).toBe('negative')
    const cagr = success(calculateCagr({ initial: '9999999999999', ending: '1', years: '1' }))
    expect(cagr.values.cagr).toBe(-1000000n)
    expect(cagr.precision?.cagr).toBe('above-minus-100')
    expect(
      success(calculateCagr({ initial: '9999999999999', ending: '0', years: '100' })).precision,
    ).toBeUndefined()
  })
  it('formats signed fractions and near-zero outcomes without a false zero', () => {
    expect(formatInvestment(-313n, '%')).toBe('−3,13%')
    expect(formatInvestment(-1n, 'rate')).toBe('−0,0001%')
    expect(formatInvestment(0n, 'rate', 'negative')).toBe('Antara −0,0001% dan 0% (negatif)')
    expect(formatInvestment(0n, '%', 'positive')).toBe('<0,01%')
    expect(formatInvestment(-1000000n, 'rate', 'above-minus-100')).toBe('>−100,0000%')
    expect(formatInvestment(0n, 'IDR-cents', 'positive')).toBe('<Rp0,01')
    expect(formatInvestment(null, 'months')).toContain('Tidak terdefinisi')
    expect(formatInvestment(-5n, 'IDR')).toBe('−Rp5')
  })
  it('supports extreme mathematically valid CAGR without Number currency conversion', () => {
    expect(value(calculateCagr({ initial: '1', ending: '9999999999999', years: '1' }), 'cagr')).toBe(
      9999999999998000000n,
    )
  })
})

describe('validation and publication', () => {
  for (const invalid of ['', '-1', 'NaN', 'Infinity', '1e2', '1.5', '1,000', '10000000000000'])
    it(`rejects malformed money ${invalid}`, () => {
      expect(calculateSavingsGoal({ initial: invalid, target: '1', rate: '0', months: '1' }).success).toBe(
        false,
      )
      expect(calculateEmergencyFund({ expenses: invalid, available: '0', months: '1' }).success).toBe(false)
      expect(calculateDeposit({ principal: invalid, rate: '0', months: '1' }).success).toBe(false)
      expect(calculateInvestmentRoi({ initial: '1', ending: invalid, costs: '0' }).success).toBe(false)
      expect(calculateCagr({ initial: '1', ending: invalid, years: '1' }).success).toBe(false)
    })
  for (const invalid of ['', '-1', '100.0001', 'NaN', 'Infinity', '1e2', '0.00001'])
    it(`rejects invalid rate ${invalid}`, () => {
      expect(calculateSavingsGoal({ initial: '1', target: '2', rate: invalid, months: '1' }).success).toBe(
        false,
      )
      expect(calculateDeposit({ principal: '1', rate: invalid, months: '1' }).success).toBe(false)
      if (invalid !== '')
        expect(calculateDeposit({ principal: '1', rate: '1', months: '1', tax: invalid }).success).toBe(false)
    })
  for (const invalid of ['0', '-1', '1.5', '', 'NaN', '1201'])
    it(`rejects invalid month duration ${invalid}`, () => {
      expect(calculateSavingsGoal({ initial: '1', target: '2', rate: '0', months: invalid }).success).toBe(
        false,
      )
      expect(calculateEmergencyFund({ expenses: '1', available: '0', months: invalid }).success).toBe(false)
      expect(calculateDeposit({ principal: '1', rate: '0', months: invalid }).success).toBe(false)
    })
  for (const invalid of ['0', '-1', '1.5', '', 'NaN', '101'])
    it(`rejects invalid CAGR duration ${invalid}`, () => {
      expect(calculateCagr({ initial: '1', ending: '1', years: invalid }).success).toBe(false)
    })
  it('rejects zero ROI/CAGR capital, excessive savings duration, invalid fees, and malformed payloads', () => {
    expect(calculateInvestmentRoi({ initial: '0', ending: '1', costs: '0' }).success).toBe(false)
    expect(calculateCagr({ initial: '0', ending: '1', years: '1' }).success).toBe(false)
    expect(calculateSavingsGoal({ initial: '1', target: '2', rate: '0', months: '601' }).success).toBe(false)
    expect(calculateDeposit({ principal: '1', rate: '0', months: '1', fees: '-1' }).success).toBe(false)
    expect(calculateInvestmentRoi({ initial: '1', ending: '1', costs: '-1' }).success).toBe(false)
    for (const engine of [
      calculateSavingsGoal,
      calculateEmergencyFund,
      calculateDeposit,
      calculateInvestmentRoi,
      calculateCagr,
    ])
      for (const input of [null, undefined, {}, { initial: 1, ending: 2, years: 1 }])
        expect(engine(input).success).toBe(false)
  })
  it('publishes exactly the additional five investment tools while retaining all earlier tools', () => {
    expect(listPublished()).toHaveLength(86)
    expect(listCategory('keuangan')).toHaveLength(20)
    expect(
      listCategory('keuangan')
        .slice(5, 10)
        .map((tool) => tool.slug),
    ).toEqual(['target-tabungan', 'dana-darurat', 'deposito', 'imbal-hasil-investasi', 'cagr'])
    expect(listCategory('bisnis')).toHaveLength(20)
    expect(listCategory('marketplace')).toHaveLength(16)
    expect(sitemapPaths()).toHaveLength(92)
  })
})
