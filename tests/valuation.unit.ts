import { describe, expect, it } from 'vitest'
import {
  calculatePresentValue,
  calculateNpv,
  calculateInflation,
  calculateAverageStock,
  calculateStockProfit,
  type ValuationResult,
} from '../lib/valuation/engines'
import { formatValuation } from '../lib/valuation/format'
import { listPublished, listCategory, sitemapPaths } from '../lib/registry'

function success(result: ValuationResult) {
  expect(result.success).toBe(true)
  if (!result.success) throw new Error(JSON.stringify(result.errors))
  return result
}
const flows = (amounts: readonly (string | bigint)[]) => amounts.map((amount) => ({ amount: String(amount) }))
const purchase = { price: '1000', lots: '2', fee: '1000' }
const sale = {
  buyPrice: '10',
  sellPrice: '12',
  lots: '2',
  sharesPerLot: '100',
  buyFee: '10',
  sellFee: '5',
  sellTax: '3',
}

describe('source-verified valuation examples', () => {
  it('present value discounts one annual payment with exact ratios', () => {
    expect(success(calculatePresentValue({ future: '1210', rate: '10', years: '2' })).values).toEqual({
      present: 100000n,
      future: 121000n,
      difference: 21000n,
    })
    expect(success(calculatePresentValue({ future: '100', rate: '10', years: '2' })).values).toEqual({
      present: 8264n,
      future: 10000n,
      difference: 1736n,
    })
    const tiny = success(calculatePresentValue({ future: '1', rate: '100', years: '100' }))
    expect(tiny.values.present).toBe(0n)
    expect(tiny.precision?.present).toBe('positive')
  })
  it('NPV sums signed discounted fractions before rounding', () => {
    const standard = success(calculateNpv({ rate: '10', cashflows: flows(['-1000', '600', '600']) }))
    expect(standard.values).toEqual({ npv: 4132n, initial: -100000n, nominal: 20000n })
    expect(standard.breakdown?.map((row) => row.present)).toEqual([-100000n, 54545n, 49587n])
    expect(standard.status).toBe('positive-npv')
    const fractions = success(
      calculateNpv({ rate: '100', cashflows: flows(['0', '0', '0', '1', '0', '0', '1']) }),
    )
    expect(fractions.values.npv).toBe(14n)
    expect(fractions.breakdown?.reduce((sum, row) => sum + row.present, 0n)).toBe(15n)
    const negativeTie = success(calculateNpv({ rate: '100', cashflows: flows(['-1', '0', '0', '7']) }))
    expect(negativeTie.values.npv).toBe(-13n)
    expect(negativeTie.status).toBe('negative-npv')
    expect(negativeTie.breakdown?.reduce((sum, row) => sum + row.present, 0n)).toBe(-12n)
  })
  it('inflation separates future basket price from fixed money purchasing power', () => {
    expect(success(calculateInflation({ price: '100', rate: '10', years: '2' })).values).toEqual({
      future: 12100n,
      purchasing: 8264n,
      increase: 2100n,
      loss: 1736n,
    })
    expect(success(calculateInflation({ price: '1', rate: '100', years: '3' })).values).toEqual({
      future: 800n,
      purchasing: 13n,
      increase: 700n,
      loss: 87n,
    })
  })
  it('stock average weights purchases and allocates fees only after summation', () => {
    expect(
      success(
        calculateAverageStock({
          sharesPerLot: '100',
          purchases: [purchase, { price: '2000', lots: '1', fee: '500' }],
        }),
      ).values,
    ).toEqual({
      average: 133833n,
      cost: 40150000n,
      gross: 40000000n,
      fees: 150000n,
      shares: 300n,
      lots: 3n,
      perLot: 13383333n,
    })
    expect(
      success(calculateAverageStock({ sharesPerLot: '3', purchases: [{ price: '0', lots: '1', fee: '1' }] }))
        .values,
    ).toMatchObject({ average: 33n, cost: 100n, shares: 3n, perLot: 100n })
    expect(
      success(
        calculateAverageStock({
          sharesPerLot: '1',
          purchases: [
            { price: '0,01', lots: '1', fee: '0' },
            { price: '0.02', lots: '1', fee: '0' },
          ],
        }),
      ).values,
    ).toMatchObject({ cost: 3n, shares: 2n, average: 2n })
  })
  it('stock profit reconciles same-share acquisition net sale and signed ROI', () => {
    expect(success(calculateStockProfit(sale)).values).toEqual({
      profit: 38200n,
      roi: 1900n,
      acquisition: 201000n,
      grossSale: 240000n,
      sellingCosts: 800n,
      netSale: 239200n,
      shares: 200n,
    })
    expect(
      success(
        calculateStockProfit({
          buyPrice: '100',
          sellPrice: '90',
          lots: '1',
          sharesPerLot: '1',
          buyFee: '5',
          sellFee: '2',
          sellTax: '1',
        }),
      ).values,
    ).toMatchObject({ acquisition: 10500n, netSale: 8700n, profit: -1800n, roi: -1714n })
    expect(
      success(
        calculateStockProfit({
          ...sale,
          buyPrice: '32',
          sellPrice: '31',
          lots: '1',
          sharesPerLot: '1',
          buyFee: '0',
          sellFee: '0',
          sellTax: '',
        }),
      ).values.roi,
    ).toBe(-313n)
  })
})

describe('NPV invariants and signed precision', () => {
  it('does not discount CF0 and supports a single current flow', () => {
    for (const rate of ['0', '10', '100'])
      expect(success(calculateNpv({ rate, cashflows: flows(['-100']) })).values.npv).toBe(-10000n)
    expect(success(calculateNpv({ rate: '0', cashflows: flows(['-100', '50', '-10']) })).values.npv).toBe(
      -6000n,
    )
    expect(success(calculateNpv({ rate: '100', cashflows: flows(['0']) })).status).toBe('zero-npv')
  })
  it('matches independent common-denominator sums and is symmetric under sign reversal', () => {
    const patterns = [
      [-100n, 60n, 60n],
      [20n, -5n, -30n, 10n],
      [0n, 1n, -1n, 7n],
      [9999999999999n, -9999999999999n, 1n],
    ]
    for (const amounts of patterns)
      for (const [rate, r] of [
        ['0', 0n],
        ['0.0001', 1n],
        ['10', 100000n],
        ['100', 1000000n],
      ] as const) {
        const n = BigInt(amounts.length - 1),
          q = 1000000n + r
        const denominator = q ** n
        const numerator = amounts.reduce(
          (sum, amount, index) => sum + amount * 1000000n ** BigInt(index) * q ** (n - BigInt(index)),
          0n,
        )
        const magnitude = numerator < 0n ? -numerator : numerator
        const expectedMagnitude = (2n * magnitude * 100n + denominator) / (2n * denominator)
        const expected = numerator < 0n ? -expectedMagnitude : expectedMagnitude
        const positive = success(calculateNpv({ rate, cashflows: flows(amounts) }))
        const opposite = success(calculateNpv({ rate, cashflows: flows(amounts.map((amount) => -amount)) }))
        expect(positive.values.npv).toBe(expected)
        expect(opposite.values.npv).toBe(-positive.values.npv)
        expect(positive.breakdown?.[0].present).toBe(amounts[0] * 100n)
      }
  })
  it('retains negative and positive tiny NPV at the 101-row bound', () => {
    const amounts = Array<bigint>(101).fill(0n)
    amounts[100] = -1n
    const negative = success(calculateNpv({ rate: '100', cashflows: flows(amounts) }))
    expect(negative.values.npv).toBe(0n)
    expect(negative.precision?.npv).toBe('negative')
    expect(negative.breakdown?.[100].precision).toBe('negative')
    expect(negative.status).toBe('negative-npv')
    amounts[100] = 1n
    expect(success(calculateNpv({ rate: '100', cashflows: flows(amounts) })).precision?.npv).toBe('positive')
    expect(calculateNpv({ rate: '1', cashflows: flows([...amounts, 1n]) }).success).toBe(false)
  })
})

describe('valuation and stock accounting boundaries', () => {
  it('supports zero periods, zero rates and zero amounts without zero division', () => {
    for (const rate of ['0', '10', '100']) {
      expect(success(calculatePresentValue({ future: '100', rate, years: '0' })).values.present).toBe(10000n)
      expect(success(calculateInflation({ price: '100', rate, years: '0' })).values).toEqual({
        future: 10000n,
        purchasing: 10000n,
        increase: 0n,
        loss: 0n,
      })
      expect(success(calculatePresentValue({ future: '0', rate, years: '100' })).values.present).toBe(0n)
      expect(success(calculateInflation({ price: '0', rate, years: '100' })).values.future).toBe(0n)
    }
    expect(
      success(calculatePresentValue({ future: '9999999999999', rate: '0', years: '100' })).values.present,
    ).toBe(999999999999900n)
  })
  it('preserves inflation decomposition and PV ordering on valid high inputs', () => {
    for (const price of ['1', '100', '9999999999999'])
      for (const rate of ['0', '0.0001', '10', '100'])
        for (const years of ['0', '1', '3', '10']) {
          const values = success(calculateInflation({ price, rate, years })).values
          expect(values.future).toBeGreaterThanOrEqual(BigInt(price) * 100n)
          expect(values.purchasing).toBeLessThanOrEqual(BigInt(price) * 100n)
          expect(values.future - values.increase).toBe(BigInt(price) * 100n)
          expect(values.purchasing + values.loss).toBe(BigInt(price) * 100n)
          expect(success(calculatePresentValue({ future: price, rate, years })).values.present).toBe(
            values.purchasing,
          )
        }
    expect(calculateInflation({ price: '9999999999999', rate: '100', years: '100' })).toMatchObject({
      success: false,
      errors: { years: expect.any(Array) },
    })
    const tiny = success(calculateInflation({ price: '1', rate: '0.0001', years: '1' }))
    expect(tiny.precision).toMatchObject({ increase: 'positive', loss: 'positive' })
  })
  it('keeps stock cost totals invariant under row order and quantity weighting', () => {
    const purchases = [
      purchase,
      { price: '2000.25', lots: '3', fee: '7' },
      { price: '0.01', lots: '1', fee: '0' },
    ]
    for (const size of ['1', '3', '100', '9999999999999']) {
      const values = success(calculateAverageStock({ sharesPerLot: size, purchases })).values
      expect(values).toEqual(
        success(calculateAverageStock({ sharesPerLot: size, purchases: [...purchases].reverse() })).values,
      )
      expect(values.shares).toBe(6n * BigInt(size))
      expect(values.cost).toBe(values.gross + values.fees)
      expect(values.fees).toBe(100700n)
    }
    const large = success(
      calculateAverageStock({
        sharesPerLot: '9999999999999',
        purchases: [{ price: '9999999999999.99', lots: '9999999999999', fee: '9999999999999' }],
      }),
    ).values
    expect(large.gross).toBe(999999999999999n * 9999999999999n ** 2n)
    expect(large.cost - large.gross).toBe(999999999999900n)
    expect(
      success(calculateAverageStock({ sharesPerLot: '1', purchases: Array(100).fill(purchase) })).values.lots,
    ).toBe(200n)
  })
  it('keeps diagnostic average values small-positive instead of false zero', () => {
    const result = success(
      calculateAverageStock({
        sharesPerLot: '9999999999999',
        purchases: [{ price: '0', lots: '9999999999999', fee: '1' }],
      }),
    )
    expect(result.values.average).toBe(0n)
    expect(result.precision).toMatchObject({ average: 'positive', perLot: 'positive' })
  })
  it('reconciles acquisition, sale costs and profits for matching shares', () => {
    for (const lots of ['1', '3', '9999999999999'])
      for (const size of ['1', '100', '9999999999999'])
        for (const sellPrice of ['0', '5.25', '10', '100']) {
          const values = success(
            calculateStockProfit({
              buyPrice: '10',
              sellPrice,
              lots,
              sharesPerLot: size,
              buyFee: '3',
              sellFee: '0',
              sellTax: '0',
            }),
          ).values
          expect(values.shares).toBe(BigInt(lots) * BigInt(size))
          expect(values.acquisition).toBe(values.shares * 1000n + 300n)
          expect(values.netSale).toBe(values.grossSale - values.sellingCosts)
          expect(values.profit).toBe(values.netSale - values.acquisition)
          expect(values.roi).toBeGreaterThanOrEqual(-10000n)
        }
  })
  it('supports zero profit, total loss and exact fractional share prices', () => {
    const base = {
      ...sale,
      lots: '1',
      sharesPerLot: '1',
      buyPrice: '100',
      sellPrice: '105',
      buyFee: '5',
      sellFee: '0',
      sellTax: '0',
    }
    expect(success(calculateStockProfit(base)).values.profit).toBe(0n)
    expect(success(calculateStockProfit({ ...base, sellPrice: '0' })).values.roi).toBe(-10000n)
    expect(
      success(calculateStockProfit({ ...base, buyPrice: '0,01', sellPrice: '0.02', lots: '3', buyFee: '0' }))
        .values,
    ).toMatchObject({ acquisition: 3n, grossSale: 6n, netSale: 6n, profit: 3n, roi: 10000n })
    expect(
      success(
        calculateStockProfit({ ...base, buyPrice: '9999999999999', sellPrice: '9999999999998', buyFee: '0' }),
      ).precision?.roi,
    ).toBe('negative')
  })
  it('rejects zero acquisition and costs exceeding sale value on the responsible field', () => {
    expect(calculateStockProfit({ ...sale, buyPrice: '0', buyFee: '0' })).toMatchObject({
      success: false,
      errors: { buyPrice: expect.any(Array) },
    })
    expect(calculateStockProfit({ ...sale, sellFee: '2401' })).toMatchObject({
      success: false,
      errors: { sellFee: expect.any(Array) },
    })
    expect(calculateStockProfit({ ...sale, sellFee: '1', sellTax: '2400' })).toMatchObject({
      success: false,
      errors: { sellTax: expect.any(Array) },
    })
    expect(success(calculateStockProfit({ ...sale, sellTax: '' })).values.sellingCosts).toBe(500n)
    expect(calculateStockProfit({ ...sale, sellTax: null }).success).toBe(false)
  })
  it('formats negative money, ratios and sub-cent direction reliably', () => {
    expect(formatValuation(-13n)).toBe('−Rp0,13')
    expect(formatValuation(-313n, '%')).toBe('−3,13%')
    expect(formatValuation(0n, 'IDR-cents', 'negative')).toBe('Antara −Rp0,01 dan Rp0 (negatif)')
    expect(formatValuation(0n, 'IDR-cents', 'positive')).toBe('<Rp0,01')
    expect(formatValuation(300n, 'shares')).toBe('300 lembar')
  })
})

describe('validation and catalogue', () => {
  for (const invalid of ['', '-1', '-100', '100.0001', 'NaN', 'Infinity', '1e2', '0.00001'])
    it(`rejects unsupported annual rate ${invalid}`, () => {
      expect(calculatePresentValue({ future: '100', rate: invalid, years: '1' }).success).toBe(false)
      expect(calculateInflation({ price: '100', rate: invalid, years: '1' }).success).toBe(false)
      expect(calculateNpv({ rate: invalid, cashflows: flows(['1']) }).success).toBe(false)
    })
  for (const invalid of ['', '-1', '1.5', '101', '1e2', 'NaN'])
    it(`rejects invalid annual duration ${invalid}`, () => {
      expect(calculatePresentValue({ future: '100', rate: '10', years: invalid }).success).toBe(false)
      expect(calculateInflation({ price: '100', rate: '10', years: invalid }).success).toBe(false)
    })
  for (const invalid of ['', '0', '-1', '1.5', '1e2', '10000000000000'])
    it(`rejects invalid share quantity ${invalid}`, () => {
      expect(calculateAverageStock({ sharesPerLot: invalid, purchases: [purchase] }).success).toBe(false)
      expect(
        calculateAverageStock({ sharesPerLot: '100', purchases: [{ ...purchase, lots: invalid }] }).success,
      ).toBe(false)
      expect(calculateStockProfit({ ...sale, lots: invalid }).success).toBe(false)
    })
  for (const invalid of ['', '-1', '0.001', 'NaN', 'Infinity', '1e2', '10000000000000'])
    it(`rejects invalid stock price ${invalid}`, () => {
      expect(
        calculateAverageStock({ sharesPerLot: '100', purchases: [{ ...purchase, price: invalid }] }).success,
      ).toBe(false)
      expect(calculateStockProfit({ ...sale, buyPrice: invalid }).success).toBe(false)
      expect(calculateStockProfit({ ...sale, sellPrice: invalid }).success).toBe(false)
    })
  it('rejects malformed arrays, signed-flow mistakes, excessive money and invalid fees', () => {
    for (const cashflows of [
      [],
      Array(102).fill({ amount: '1' }),
      [{ amount: '1.5' }],
      [{ amount: '+1' }],
      [{ amount: '-10000000000000' }],
      [{ amount: null }],
    ])
      expect(calculateNpv({ rate: '0', cashflows }).success).toBe(false)
    for (const purchases of [
      [],
      Array(101).fill(purchase),
      [{ ...purchase, fee: '-1' }],
      [{ ...purchase, fee: '0.1' }],
    ])
      expect(calculateAverageStock({ sharesPerLot: '100', purchases }).success).toBe(false)
    expect(calculatePresentValue({ future: '-1', rate: '1', years: '1' }).success).toBe(false)
    expect(calculatePresentValue({ future: '10000000000000', rate: '1', years: '1' }).success).toBe(false)
    for (const engine of [
      calculatePresentValue,
      calculateNpv,
      calculateInflation,
      calculateAverageStock,
      calculateStockProfit,
    ])
      for (const input of [null, undefined, {}, { future: 100, rate: 1, years: 2 }])
        expect(engine(input).success).toBe(false)
  })
  it('publishes exactly five new utilities without expanding the canonical inventory', () => {
    expect(listPublished()).toHaveLength(81)
    expect(listCategory('keuangan')).toHaveLength(20)
    expect(
      listCategory('keuangan')
        .slice(10, 15)
        .map((tool) => tool.slug),
    ).toEqual(['nilai-kini', 'npv', 'inflasi', 'rata-rata-beli-saham', 'untung-rugi-saham'])
    expect(listCategory('bisnis')).toHaveLength(20)
    expect(listCategory('marketplace')).toHaveLength(11)
    expect(sitemapPaths()).toHaveLength(87)
  })
})
