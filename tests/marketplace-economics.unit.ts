import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { calculateSettlement as settlement, calculateListing as listing, calculateComparison as comparison, calculateBundle as bundle, calculateStock as stock, cash, compare, forwardListing, type EconomicsResult } from '../lib/marketplace-economics/engines'
import { fraction as R, add, subtract, multiply } from '../lib/utilities-materials/rational'
import { formatEntry, cashText } from '../lib/marketplace-economics/format'
import { economicsTools } from '../lib/marketplace-economics/tools'
import { listPublished, listCategory, listCategoryHubs, sitemapPaths, findPublished } from '../lib/registry'
const sale = { price: '100000', quantity: '2', discount: '10000', cost: '60000', rate: '5', fixed: '2000', other: '1000', shipping: '3000', basis: 'net' }
const inverse = { target: '90000', discountRate: '10', feeRate: '5', fixed: '5000' }
const channel = (label: string, rate = '5', fixed = '2000', basis = 'net') => ({ label, rate, fixed, basis, other: '0' })
const channels = { price: '100000', quantity: '1', discount: '0', cost: '60000', channels: [channel('A'), channel('B', '8', '0')] }
const pack = { price: '100000', discount: '10000', rate: '5', fixed: '2000', items: [{ label: 'A', cost: '20000', quantity: '2' }, { label: 'B', cost: '30000', quantity: '1' }] }
function ok(result: EconomicsResult) { expect(result.success).toBe(true); if (!result.success) throw new Error(JSON.stringify(result.errors)); return result }
function value(result: EconomicsResult) { const r = ok(result); if ('status' in r.primary) throw new Error('status'); return r.primary.value }
function entry(result: EconomicsResult, label: string) { const r = ok(result).details.find(e => e.label === label); if (!r) throw new Error(label); return r.value }
function bad(result: EconomicsResult, field?: string) { expect(result.success).toBe(false); if (!result.success && field) expect(result.errors[field]).toBeDefined() }
const equal = (a: { n: bigint; d: bigint }, n: bigint, d = 1n) => expect(a.n * d).toBe(n * a.d)
describe('manual marketplace economics', () => {
  it('settlement reconciles independent net and gross basis fixtures', () => {
    const net = settlement(sale), gross = settlement({ ...sale, basis: 'gross' })
    equal(value(net), 174500n); equal(entry(net, 'Komisi eksak'), 9500n); equal(entry(net, 'Hasil setelah HPP (cash, bukan laba bersih)'), 54500n)
    equal(value(gross), 174000n); equal(entry(gross, 'Komisi eksak'), 10000n); equal(entry(gross, 'Hasil setelah HPP (cash, bukan laba bersih)'), 54000n)
  })
  it('settlement preserves signed half ties and cash profit follows payout ledger', () => {
    const input = { ...sale, price: '1', quantity: '1', discount: '0', cost: '1', rate: '50', fixed: '1', other: '0', shipping: '0' }
    equal(value(settlement(input)), -1n); equal(entry(settlement(input), 'Hasil setelah HPP (cash, bukan laba bersih)'), -2n)
    equal(value(settlement({ ...input, rate: '49.999999' })), 0n)
    const positive = settlement({ ...input, fixed: '0' }); equal(value(positive), 1n); equal(entry(positive, 'Hasil setelah HPP (cash, bukan laba bersih)'), 0n); equal(entry(positive, 'Hasil setelah HPP sebelum pembulatan'), -1n, 2n)
  })
  it('settlement zero fees full discount and 100 percent retain losses', () => {
    equal(value(settlement({ ...sale, rate: '0', fixed: '0', other: '', shipping: '', discount: '0' })), 200000n)
    equal(value(settlement({ ...sale, rate: '100', discount: '200000', basis: 'gross' })), -206000n)
    equal(value(settlement({ ...sale, rate: '100', discount: '200000', basis: 'net' })), -6000n)
  })
  it('settlement ledger conservation and signed rounding adjustment hold over rate grid', () => {
    for (const rate of ['0', '0.000001', '49.999999', '50', '99.999999', '100']) for (const basis of ['gross', 'net']) for (const price of ['1', '100000', '9999999999999']) {
      const r = settlement({ ...sale, price, discount: '1', rate, basis })
      const gross = entry(r, 'Bruto harga × jumlah'), net = entry(r, 'Penjualan setelah diskon'), fees = entry(r, 'Total biaya eksak'), payout = entry(r, 'Payout sebelum pembulatan')
      equal(subtract(gross, R(1n)), net.n, net.d); equal(add(payout, fees), net.n, net.d)
      equal(add(payout, entry(r, 'Penyesuaian pembulatan payout')), value(r).n, value(r).d)
      const error = subtract(value(r), payout); expect((error.n < 0n ? -error.n : error.n) * 2n).toBeLessThanOrEqual(error.d)
    }
  })
  it('signed cash rounding has odd symmetry ties and exact sub-half behavior', () => {
    for (let n = 0n; n < 100n; n++) for (const d of [1n, 2n, 3n, 100000000n]) expect(cash(R(-n, d))).toBe(-cash(R(n, d)))
    expect(cash(R(-1n, 2n))).toBe(-1n); expect(cash(R(-49999999n, 100000000n))).toBe(0n)
  })
  it('listing inversion verifies exact target and previous integer minimality', () => {
    const r = listing(inverse); equal(value(r), 111112n); equal(entry(r, 'Harga teoretis eksak'), 1000000n, 9n)
    equal(entry(r, 'Payout kandidat sebelum pembulatan (memenuhi target)'), 2250019n, 25n)
    equal(entry(r, 'Payout harga satu rupiah lebih rendah (tidak memenuhi)'), 17999981n, 200n)
  })
  it('listing policy intentionally differs from rounded payout minimality', () => {
    const r = listing({ target: '1', fixed: '0', discountRate: '0', feeRate: '50' }); equal(value(r), 2n)
    equal(entry(r, 'Payout harga satu rupiah lebih rendah (tidak memenuhi)'), 1n, 2n); expect(cash(R(1n, 2n))).toBe(1n)
  })
  it('listing zero target and zero rates permit zero and identity', () => {
    equal(value(listing({ target: '0', fixed: '0', discountRate: '99.999999', feeRate: '99.999999' })), 0n)
    equal(value(listing({ target: '12', fixed: '5', discountRate: '0', feeRate: '0' })), 17n)
  })
  it('listing maximum tiny denominator remains exact beyond safe integer', () => {
    const r = listing({ target: '9999999999999', fixed: '9999999999999', discountRate: '99.999999', feeRate: '99.999999' })
    equal(value(r), 199999999999980000000000000000n)
  })
  it('listing forward minimality property covers fractional rates and thresholds', () => {
    for (const d of ['0', '0.000001', '10', '50', '99.999999']) for (const f of ['0', '0.000001', '5', '99.999999']) for (const target of ['0', '1', '99', '9999999999999']) {
      const r = listing({ target, fixed: '7', discountRate: d, feeRate: f }), L = value(r).n
      const rate = (s: string) => { const [a, b = ''] = s.split('.'); return R(BigInt(a) * 1000000n + BigInt(b.padEnd(6, '0')), 100000000n) }
      const payout = forwardListing(L, rate(d), rate(f), 7n), previous = forwardListing(L - 1n, rate(d), rate(f), 7n)
      expect(compare(payout, R(BigInt(target)))).toBeGreaterThanOrEqual(0n); expect(compare(previous, R(BigInt(target)))).toBeLessThan(0n)
    }
  })
  it('comparison ranks exact profits with deterministic ties and basis', () => {
    const r = ok(comparison(channels)); expect(r.channels!.map(c => c.profitCash)).toEqual([33000n, 32000n]); expect(r.channels!.map(c => c.best)).toEqual([true, false])
    const tie = ok(comparison({ ...channels, channels: [...channels.channels, channel('C')] })).channels!
    expect(tie.map(c => [c.id, c.label, c.best])).toEqual([[0, 'A', true], [1, 'B', false], [2, 'C', true]])
    const bases = ok(comparison({ price: '100', quantity: '1', discount: '20', cost: '60', channels: [channel('A', '25', '0', 'gross'), channel('B', '25', '0', 'net')] })).channels!
    expect(bases.map(c => c.profitCash)).toEqual([-5n, 0n])
  })
  it('comparison ranks unrounded amounts even when displayed cash is tied', () => {
    const r = ok(comparison({ price: '1', quantity: '1', discount: '0', cost: '0', channels: [channel('A', '0.000002', '0'), channel('B', '0.000001', '0')] })).channels!
    expect(r.map(c => c.payoutCash)).toEqual([1n, 1n]); expect(r.map(c => c.best)).toEqual([false, true])
  })
  it('comparison rejects blank duplicate casefold and overlong labels but safely preserves text', () => {
    for (const label of ['', '  ', 'a', 'A', 'x'.repeat(61)]) bad(comparison({ ...channels, channels: [channel('A'), channel(label)] }), 'channels.1.label')
    expect(ok(comparison({ ...channels, channels: [channel('<script>alert(1)</script>'), channel('B')] })).channels![0].label).toContain('<script>')
  })
  it('comparison enforces two to five channels and max scale cash', () => {
    for (const n of [0, 1, 6]) bad(comparison({ ...channels, channels: Array.from({ length: n }, (_, i) => channel(String(i))) }))
    const r = ok(comparison({ ...channels, price: '9999999999999', quantity: '10000', channels: Array.from({ length: 5 }, (_, i) => channel(String(i), '0', '0')) })); expect(r.channels).toHaveLength(5); equal(value(r), 99999999399990000n)
  })
  it('bundle contribution respects independent fixtures and split reorder invariance', () => {
    equal(value(bundle(pack)), 13500n); equal(entry(bundle(pack), 'HPP seluruh isi paket'), 70000n); equal(entry(bundle(pack), 'Margin kontribusi terhadap penjualan setelah diskon'), 15n)
    const split = [{ label: 'A', cost: '20000', quantity: '1' }, { label: 'A', cost: '20000', quantity: '1' }, pack.items[1]]
    for (const items of [split, [...split].reverse(), [...pack.items].reverse()]) equal(value(bundle({ ...pack, items })), 13500n)
  })
  it('bundle losses signed fee ties zero selling price and undefined margin remain clear', () => {
    const r = bundle({ price: '1', discount: '0', rate: '50', fixed: '1', items: [{ label: 'A', cost: '1', quantity: '1' }] }); equal(value(r), -2n); equal(entry(r, 'Kontribusi sebelum pembulatan'), -3n, 2n)
    const zero = ok(bundle({ ...pack, price: '0', discount: '0', rate: '0', fixed: '0', items: [{ label: 'Gratis', cost: '0', quantity: '1' }] })); equal(value(zero), 0n); expect(zero.details.some(d => d.kind === 'percent')).toBe(false); expect(zero.notes.join(' ')).toContain('Margin tidak terdefinisi')
  })
  it('bundle ledger conservation holds without rounding fractional fees early', () => {
    for (const rate of ['0', '0.000001', '33.333333', '100']) { const r = bundle({ ...pack, price: '100001', rate }); const sale = entry(r, 'Penjualan setelah diskon'), costs = add(entry(r, 'HPP seluruh isi paket'), entry(r, 'Total biaya transaksi eksak')); equal(add(entry(r, 'Kontribusi sebelum pembulatan'), costs), sale.n, sale.d) }
  })
  it('bundle bounds twenty rows large sums and invalid quantity are enforced', () => {
    const items = Array.from({ length: 20 }, () => ({ label: 'A', cost: '9999999999999', quantity: '10000' })); equal(value(bundle({ price: '0', discount: '0', rate: '100', fixed: '0', items })), -1999999999999800000n)
    for (const n of [0, 21]) bad(bundle({ ...pack, items: items.slice(0, n).concat(n === 21 ? [items[0]] : []) }))
    for (const quantity of ['0', '1.5', '10001', '-1']) bad(bundle({ ...pack, items: [{ ...items[0], quantity }] }), 'items.0.quantity')
  })
  it('stock cover distinguishes finite zero demand and indeterminate states', () => {
    equal(value(stock({ stock: '120', daily: '8' })), 15n); equal(value(stock({ stock: '10', daily: '3' })), 10n, 3n); equal(entry(stock({ stock: '10', daily: '3' }), 'Hari penuh yang tercakup (floor)'), 3n)
    equal(value(stock({ stock: '0', daily: '5' })), 0n)
    expect(ok(stock({ stock: '120', daily: '0' })).primary).toHaveProperty('status', 'Tidak terhingga / tidak dapat diperkirakan karena penjualan rata-rata nol')
    expect(ok(stock({ stock: '0', daily: '0' })).primary).toHaveProperty('status', 'Tidak terdefinisi: stok dan penjualan rata-rata sama-sama nol')
  })
  it('stock decimal days tiny maximum and floor use original fraction', () => {
    equal(value(stock({ stock: '9999999999999', daily: '0.000001' })), 9999999999999000000n)
    const r = stock({ stock: '1', daily: '9999999999999.999999' }); expect(formatEntry(value(r), 'days')).toContain('<0,000001 hari (positif)')
    equal(entry(stock({ stock: '1', daily: '1.000001' }), 'Hari penuh yang tercakup (floor)'), 0n)
  })
  it('stock scale invariance and floor inequalities hold', () => {
    for (let i = 0n; i < 30n; i++) for (const d of [1n, 3n, 7n]) { const r = stock({ stock: String(i), daily: String(d) }), scaled = stock({ stock: String(i * 7n), daily: String(d * 7n) }); equal(value(r), value(scaled).n, value(scaled).d); const floor = entry(r, 'Hari penuh yang tercakup (floor)').n; expect(floor * d).toBeLessThanOrEqual(i); expect((floor + 1n) * d).toBeGreaterThan(i) }
  })
  it('all schemas reject malformed financial strings and quantities', () => {
    for (const x of [null, 1, '', '-1', 'NaN', 'Infinity', '1e3', '1_000', '1.0', '10000000000000']) { bad(settlement({ ...sale, price: x }), 'price'); bad(listing({ ...inverse, target: x }), 'target'); bad(stock({ stock: x, daily: '1' }), 'stock') }
    for (const x of ['-1', '100.000001', '1.0000001', 'NaN', '', null, 5]) { bad(settlement({ ...sale, rate: x }), 'rate'); bad(bundle({ ...pack, rate: x }), 'rate') }
    for (const x of ['100', '100.000001', '-1']) { bad(listing({ ...inverse, discountRate: x }), 'discountRate'); bad(listing({ ...inverse, feeRate: x }), 'feeRate') }
    for (const quantity of ['0', '10001', '1.1', null, 1]) bad(settlement({ ...sale, quantity }), 'quantity')
  })
  it('cross field discounts enum row payload and signed daily guards reject invalid input', () => {
    bad(settlement({ ...sale, discount: '200001' }), 'discount'); bad(settlement({ ...sale, basis: 'unknown' }), 'basis'); bad(bundle({ ...pack, discount: '100001' }), 'discount'); bad(comparison({ ...channels, discount: '100001' }), 'discount')
    for (const daily of ['-1', '0.0000001', '10000000000000', null, 1]) bad(stock({ stock: '1', daily }), 'daily')
    for (const fn of [settlement, listing, comparison, bundle, stock]) for (const input of [null, [], '', 1, undefined]) bad(fn(input))
  })
  it('optional order fees empty and absent mean zero not unknown defaults', () => {
    const { other, shipping, ...v } = sale; void other; void shipping; equal(value(settlement(v)), 178500n); equal(value(settlement({ ...v, other: '', shipping: '' })), 178500n)
  })
  it('formatting keeps exact nonterminating fractions signed money and zeros', () => {
    expect(cashText(-1n)).toBe('−Rp 1'); expect(cashText(0n)).toBe('Rp 0'); expect(formatEntry(R(-1n, 2n))).toBe('−Rp 0,5'); expect(formatEntry(R(1n, 100000000n))).toBe('Rp 0,00000001'); expect(formatEntry(R(1n, 3n))).toContain('1/3 rupiah'); expect(formatEntry(R(-1n, 100000000n), 'percent')).toContain('(negatif)')
  })
  it('publishes exactly five inventory IDs with 86 tools 16 marketplace and 92 sitemap URLs', () => {
    expect(listPublished()).toHaveLength(100); expect(listCategory('marketplace')).toHaveLength(20); expect(listCategory('sehari-hari')).toHaveLength(20); expect(listCategoryHubs()).toHaveLength(6); expect(sitemapPaths()).toHaveLength(107)
    const rows = readFileSync('docs/CALCULATOR_INVENTORY.md', 'utf8').split('\n').filter(l => l.startsWith('| calc-') || l.startsWith('| production-cost ')); expect(rows).toHaveLength(100); expect(new Set(rows.map(r => r.split('|')[1].trim())).size).toBe(100)
    expect(rows.filter(r => r.includes('| published |'))).toHaveLength(100)
    for (const slug of Object.keys(economicsTools)) expect(findPublished(slug)?.id).toBe(`calc-${slug}`)
    for (const slug of ['kalkulator-tidak-ada']) expect(findPublished(slug)).toBeUndefined()
  })
})
