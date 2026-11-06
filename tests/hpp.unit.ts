import { describe, expect, it } from 'vitest'
import { calculateHpp } from '../lib/hpp'

const sample = { materials: '120000', labor: '60000', overhead: '20000', units: '50' }

describe('calculateHpp', () => {
  it('calculates the documented production batch', () => {
    expect(calculateHpp(sample)).toEqual({ success: true, total: 200000n, perUnit: 4000n })
  })

  it.each([['1', '2', 1n], ['1', '3', 0n], ['2', '3', 1n], ['0', '1', 0n]])(
    'rounds %s rupiah across %s units', (materials, units, perUnit) => {
      expect(calculateHpp({ materials, units, labor: '0', overhead: '0' })).toMatchObject({ success: true, perUnit })
    },
  )

  it('preserves precision for the maximum supported costs', () => {
    const max = '9999999999999'
    expect(calculateHpp({ materials: max, labor: max, overhead: max, units: '1' }))
      .toEqual({ success: true, total: 29999999999997n, perUnit: 29999999999997n })
  })

  it.each(['0', '', '-1', '1.5', '1e3', 'NaN', 'Infinity', '10000000000000', null, Infinity, undefined])(
    'rejects invalid unit count %s', units => {
      expect(calculateHpp({ ...sample, units })).toMatchObject({ success: false, errors: { units: expect.any(Array) } })
    },
  )

  it.each(['', '-1', '1.000', '0.5', '1e6', '10000000000000', null, Infinity])(
    'rejects invalid cost %s', materials => {
      expect(calculateHpp({ ...sample, materials })).toMatchObject({ success: false, errors: { materials: expect.any(Array) } })
    },
  )
})
