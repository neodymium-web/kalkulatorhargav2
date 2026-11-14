import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { legacyPages, legacyReference } from '../lib/legacy/registry'
import { calculatePlatformSettlement } from '../lib/platform-settlement/engine'
const { expectedArchive, verify, text, nodes } = require('../scripts/legacy/editorial-contract.cjs')
const ledger = JSON.parse(readFileSync('docs/audit/editorial61/changes.json', 'utf8'))
const { readCsv } = require('../scripts/migration/csv.cjs')

describe('22 editorial revisions, no owner publication approval', () => {
  it('replays every exact before/after from immutable source; other application files remain protected', () => {
    expect(verify().path).toBe('lib/legacy/pages.json')
    expect(ledger.pages).toHaveLength(22)
    const sources = JSON.parse(readFileSync('docs/audit/editorial61/sources.json', 'utf8')).sources
    for (const row of ledger.pages) for (const id of row.sourceRefs) expect(sources.some((s: { id: string }) => s.id === id)).toBe(true)
    for (const source of sources) for (const file of source.files ?? []) expect(createHash('sha256').update(readFileSync(file.path)).digest('hex')).toBe(file.sha256)
    const register = JSON.parse(readFileSync('docs/audit/migration-release/register.json', 'utf8'))
    expect(register.archives.every((r: { publicationStatus: string }) => r.publicationStatus === 'PENDING_OWNER_APPROVAL')).toBe(true)
    expect(ledger.pages.every((p: { ownerDecision: null; publicationStatus: string }) => p.ownerDecision === null && p.publicationStatus === 'PENDING_OWNER_APPROVAL')).toBe(true)
    for (const page of legacyPages) {
      const expected = expectedArchive(page.path)
      expect(page.approval).toBe('PENDING_OWNER_APPROVAL'); expect(page.publication).toBe('PENDING_OWNER_APPROVAL')
      expect(page.reviewNotice).toContain('NO-GO'); expect(page.contentText).toBe(expected.expectedText)
      expect(page.contentText).not.toContain('Semua angka di halaman ini memakai sumber dan tanggal verifikasi yang sama dengan kalkulator.')
    }
  })
  it('rejects owner approval or a changed before statement instead of relaxing the source test', () => {
    const bad = structuredClone(ledger); bad.pages[0].ownerDecision = 'APPROVE_REVISED'
    expect(() => expectedArchive(bad.pages[0].path, bad)).toThrow()
    const changed = structuredClone(ledger); changed.pages[0].changes[0].before = ['Not the original paragraph']
    expect(() => expectedArchive(changed.pages[0].path, changed)).toThrow('Before mismatch')
  })
  it('keeps all six unresolved reference targets nonclickable and benchmark unpublished', () => {
    const current = legacyPages.flatMap(p => nodes(p.tree).filter((n: { tag: string }) => n.tag === 'a').map((n: { attrs: { href: string } }) => ({ path: p.path, r: legacyReference(n.attrs.href, p.path) }))).filter(x => x.r.classification === 'unresolved-legacy-feature')
    const original = readCsv('docs/audit/legacy-link-dependencies.csv').filter((r: { classification: string }) => r.classification === 'unresolved-legacy-feature')
    expect(current.map(x => [x.path, x.r.original]).sort()).toEqual(original.map((r: { source_path: string; target: string }) => [r.source_path, r.target]).sort())
    expect(current).toHaveLength(6); expect(current.every(x => x.r.href === undefined && x.r.ownerApproval)).toBe(true)
  })
  it('removes false current username/privacy/preset promises rather than hiding them behind a disclaimer', () => {
    const all = legacyPages.map(p => p.contentText).join('\n')
    for (const claim of ['Username yang kamu ketik dikirim ke TikTok', 'server kami membaca halaman profil publik TikTok', 'rate normal/khusus yang terisi otomatis dari tabel resmi', 'Angka tarif endorse bersifat acuan pasar per tingkat pengikut', 'Di TikTok, versi per tayangan lebih jujur']) expect(all).not.toContain(claim)
    expect(legacyPages.find(p => p.path === '/kebijakan-editorial')!.contentText).toContain('retensi pada hosting/layanan operasional belum diverifikasi')
    const grid = legacyPages.find(p => p.path === '/biaya-admin-marketplace')!
    expect(nodes(grid.tree).filter((n: { tag: string }) => n.tag === 'caption').every((n: unknown) => text(n).startsWith('Snapshot klaim legacy'))).toBe(true)
  })
})

describe('independent BigInt editorial oracles, no new calculator engine', () => {
  it('reconciles all-in buy costs, exact break-even and adjacent Rp10 price examples', () => {
    const initial = 4500000n, grossBuy = 500n * 4200n, costsBuy = 26000n, shares = 1500n
    const capital = initial + grossBuy + costsBuy
    expect(grossBuy + costsBuy).toBe(2126000n); expect(capital).toBe(6626000n)
    expect(grossBuy * 15n / 10000n).toBe(3150n) // A different hypothetical0.15% fee, not the26,000 cost fixture.
    const priceNumerator = capital * 400n, priceDenominator = shares * 399n
    const integerPrice = (priceNumerator + priceDenominator - 1n) / priceDenominator
    const priceOnTick = (integerPrice + 9n) / 10n * 10n
    expect(priceOnTick).toBe(4430n)
    const netCents = (p: bigint) => p * shares * 399n / 4n
    expect(netCents(4430n)).toBe(662838750n); expect(netCents(4420n)).toBe(661342500n)
    expect(netCents(priceOnTick)).toBeGreaterThanOrEqual(capital * 100n)
    expect(netCents(priceOnTick - 10n)).toBeLessThan(capital * 100n)
    const article = expectedArchive('/blog/kalkulator-average-down-saham-harga-rata-rata').expectedText
    for (const value of ['Rp2.126.000', 'Rp26.000', 'Rp4.428,404344', 'Rp4.430', 'Rp6.628.387,50', 'Rp12.575']) expect(article).toContain(value)
    expect(article).toContain('bukan fee resmi Stockbit')
  })
  it('solves the stated uncapped profit/margin examples and checks the capped branch without an application solver', () => {
    const fixed = 105000n, target = 20000n
    const p = ((fixed + target) * 10n + 8n) / 9n
    expect(p).toBe(138889n)
    expect(p * 9n - fixed * 10n).toBeGreaterThanOrEqual(target * 10n)
    expect((p - 1n) * 9n - fixed * 10n).toBeLessThan(target * 10n)
    expect(fixed * 10n / 7n).toBe(150000n)
    const capped = fixed + target + 10000n
    expect(capped).toBe(135000n); expect(capped / 10n).toBeGreaterThan(10000n)
    expect(capped - 10000n - fixed).toBe(target); expect(capped - 1n - 10000n - fixed).toBeLessThan(target)
    const article = expectedArchive('/blog/harga-jual-minimum-marketplace').expectedText
    for (const value of ['Rp138.889', 'Rp150.000', 'Rp135.000', 'bukan solver baru']) expect(article).toContain(value)
  })
  it('checks the published rounding example against the unchanged settlement engine', () => {
    const result = calculatePlatformSettlement({ price: '1', quantity: '1', discount: '0', cost: '0', buyerShipping: '0', shipping: '0', reimbursement: '0', receipts: '0', other: '0', shippingFlow: 'excluded', coverage: 'ordinary', confirmation: 'complete', fees: ['a','b','c'].map(label => ({ label, type: 'percent', basis: 'gross', rate: '50', minimumMode: 'none', capMode: 'none', scope: 'order' })) })
    expect(result.success).toBe(true); if (!result.success || !result.ledger) throw Error('Missing ledger')
    expect(result.ledger.feeTotal.n * 2n).toBe(result.ledger.feeTotal.d * 3n)
    expect(result.ledger.payout.n * 2n).toBe(-result.ledger.payout.d)
    expect(result.ledger.payoutCash).toBe(-1n)
    expect(expectedArchive('/blog/cek-dana-cair-shopee').expectedText).toContain('menjumlah fee tanpa membulatkan tiap komponen')
  })
})
