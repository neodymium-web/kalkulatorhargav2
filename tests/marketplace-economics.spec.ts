import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import { test, expect, type Page } from '@playwright/test'
const fixtures = [
  { slug: 'blibli', title: 'Kalkulator Blibli: Simulasi Komisi Manual', input: { price: '100000', quantity: '2', discount: '10000', cost: '60000', rate: '5', fixed: '2000', other: '1000', basis: 'net', shipping: '3000' }, primary: 'Rp 174.500', invalid: 'discount', bad: '200001', first: 'price' },
  { slug: 'harga-jual-marketplace', title: 'Kalkulator Harga Jual Marketplace', input: { target: '90000', discountRate: '10', feeRate: '5', fixed: '5000' }, primary: 'Rp 111.112', invalid: 'feeRate', bad: '100', first: 'target' },
  { slug: 'banding-biaya-marketplace', title: 'Kalkulator Banding Biaya Marketplace', input: { price: '100000', quantity: '1', discount: '0', cost: '60000', 'channels.0.label': 'A', 'channels.0.rate': '5', 'channels.0.fixed': '2000', 'channels.0.other': '0', 'channels.0.basis': 'net', 'channels.1.label': 'B', 'channels.1.rate': '8', 'channels.1.fixed': '0', 'channels.1.other': '0', 'channels.1.basis': 'net' }, primary: 'Rp 33.000', invalid: 'channels.1.label', bad: 'a', first: 'price' },
  { slug: 'bundel-produk', title: 'Kalkulator Bundel Produk', input: { price: '100000', discount: '10000', rate: '5', fixed: '2000', 'items.0.label': 'A', 'items.0.cost': '20000', 'items.0.quantity': '2' }, primary: 'Rp 43.500', invalid: 'items.0.quantity', bad: '0', first: 'price' },
  { slug: 'stok-cover', title: 'Kalkulator Stok Cover', input: { stock: '120', daily: '8' }, primary: '15,000000 hari (eksak 15 hari)', invalid: 'stock', bad: '1.5', first: 'stock' },
]
async function fill(page: Page, input: Record<string, string | undefined>) { for (const [name, value] of Object.entries(input)) { if (value === undefined) continue; const f = page.locator(`[name="${name}"]`); if (name.endsWith('basis')) await f.selectOption(value); else await f.fill(value) } }
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
async function open(page: Page, index: number) { await page.goto(`/kalkulator/${fixtures[index].slug}`); await fill(page, fixtures[index].input) }
for (const f of fixtures) test(`marketplace manual result invalid SEO ${f.slug}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); const response = await page.goto(`/kalkulator/${f.slug}`)
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow'); await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Marketplace' })).toHaveAttribute('href', '/marketplace')
  await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.locator(`[name="${f.first}"]`)).toBeFocused(); await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  await fill(page, f.input); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter'); await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  await page.screenshot({ path: info.outputPath(`${f.slug}.jpg`), fullPage: true, quality: 75 }); await result(page).screenshot({ path: info.outputPath(`${f.slug}-hasil.jpg`), quality: 75 })
  await fill(page, { [f.invalid]: f.bad }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); const bad = page.locator(`[name="${f.invalid}"]`); await expect(bad).toBeFocused(); await expect(bad).toHaveAttribute('aria-invalid', 'true'); await expect(bad).toHaveAttribute('aria-describedby', /error/)
  await page.screenshot({ path: info.outputPath(`${f.slug}-invalid.jpg`), fullPage: true, quality: 75 })
})
test('settlement basis changes negative payouts signed ties and fractional ledger', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 0); await fill(page, { basis: 'gross' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 174.000')
  await fill(page, { price: '1', quantity: '1', discount: '0', cost: '1', rate: '50', fixed: '1', other: '', shipping: '', basis: 'net' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('−Rp 1'); await expect(result(page)).toContainText('−Rp 0,5'); await expect(result(page)).toContainText('−Rp 2'); await expect(result(page)).toContainText('bukan kalkulator tarif resmi Blibli')
  await result(page).screenshot({ path: info.outputPath('settlement-negatif-setengah-rupiah.jpg'), quality: 75 }); await fill(page, { rate: '49.999999' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 0'); await expect(result(page)).toContainText('−Rp 0,49999999')
  await fill(page, { rate: '100', discount: '1', basis: 'gross' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−Rp 2')
})
test('listing exact threshold differs from rounded cash zero target tiny denominator', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 1); await submit(page); await expect(result(page)).toContainText('Rp 90.000,76'); await expect(result(page)).toContainText('Rp 89.999,905')
  await fill(page, { target: '1', fixed: '0', discountRate: '0', feeRate: '50' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 2'); await expect(result(page)).toContainText('Rp 0,5'); await expect(result(page)).toContainText('SEBELUM pembulatan')
  await result(page).screenshot({ path: info.outputPath('listing-kebijakan-target-eksak.jpg'), quality: 75 }); await fill(page, { target: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 0'); await expect(result(page)).not.toContainText('Payout harga satu rupiah lebih rendah')
  await fill(page, { target: '9999999999999', fixed: '9999999999999', discountRate: '99.999999', feeRate: '99.999999' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 199.999.999.999.980.000.000.000.000.000'); await result(page).screenshot({ path: info.outputPath('listing-maksimum.jpg'), quality: 75 })
})
test('comparison rows two to five preserve IDs focus ties and escaped names', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 2); await submit(page)
  const table = page.getByRole('table', { name: 'Perbandingan kanal manual per pesanan' }); await expect(table.locator('tbody tr').first()).toContainText('Terbaik'); await expect(table.locator('tbody tr').nth(1)).toContainText('Lebih rendah')
  await expect(page.getByRole('button', { name: 'Hapus kanal 1', exact: true })).toBeDisabled(); const id = await page.locator('[name="channels.1.label"]').getAttribute('id')
  for (let i = 2; i < 5; i++) { await page.getByRole('button', { name: 'Tambah kanal', exact: true }).press('Enter'); await expect(page.locator(`[name="channels.${i}.label"]`)).toBeFocused(); await expect(table).toHaveCount(0); await fill(page, { [`channels.${i}.label`]: i === 2 ? '<img src=x onerror=alert(1)>' : `Kanal ${i}`, [`channels.${i}.rate`]: '5', [`channels.${i}.fixed`]: '2000', [`channels.${i}.other`]: '0', [`channels.${i}.basis`]: 'net' }) }
  await expect(page.getByRole('button', { name: 'Tambah kanal', exact: true })).toBeDisabled(); await submit(page); await expect(table.locator('tbody tr')).toHaveCount(5); await expect(table.getByText('Terbaik (seri)', { exact: true })).toHaveCount(4); await expect(table.locator('img')).toHaveCount(0); await table.screenshot({ path: info.outputPath('kanal-lima-seri.jpg'), quality: 75 })
  await page.getByRole('button', { name: 'Hapus kanal 1', exact: true }).press('Enter'); await expect(page.locator('[name="channels.0.label"]')).toBeFocused(); await expect(page.locator('[name="channels.0.label"]')).toHaveValue('B'); await expect(page.locator('[name="channels.0.label"]')).toHaveAttribute('id', id!); await expect(table).toHaveCount(0); await submit(page); await expect(table.locator('tbody tr')).toHaveCount(4)
  await fill(page, { 'channels.1.label': 'b' }); await submit(page); await expect(page.locator('[name="channels.1.label"]')).toBeFocused()
})
test('comparison exact ranking and commission basis with discount', async ({ page }) => {
  await open(page, 2); await fill(page, { price: '100', discount: '20', cost: '60', 'channels.0.rate': '25', 'channels.0.fixed': '0', 'channels.0.basis': 'gross', 'channels.1.rate': '25', 'channels.1.fixed': '0', 'channels.1.basis': 'net' }); await submit(page)
  const table = page.getByRole('table'); await expect(table.locator('tbody tr').nth(0)).toContainText('−Rp 5'); await expect(table.locator('tbody tr').nth(1)).toContainText('Terbaik')
  await fill(page, { price: '1', discount: '0', cost: '0', 'channels.0.rate': '0.000002', 'channels.0.basis': 'net', 'channels.1.rate': '0.000001' }); await submit(page); await expect(table.locator('tbody tr').nth(0)).toContainText('Lebih rendah'); await expect(table.locator('tbody tr').nth(1)).toContainText('Terbaik')
})
test('bundle two product fixture and one to twenty rows keyboard preservation', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 3); await expect(page.getByRole('button', { name: 'Hapus produk 1', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Tambah produk', exact: true }).press('Enter'); await expect(page.locator('[name="items.1.label"]')).toBeFocused(); await fill(page, { 'items.1.label': 'B', 'items.1.cost': '30000', 'items.1.quantity': '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 13.500'); await expect(result(page)).toContainText('15,000000 %'); await page.getByRole('table').screenshot({ path: info.outputPath('bundel-dua-produk.jpg'), quality: 75 })
  const id = await page.locator('[name="items.1.label"]').getAttribute('id')
  for (let i = 2; i < 20; i++) { await page.getByRole('button', { name: 'Tambah produk', exact: true }).click(); await expect(page.locator(`[name="items.${i}.label"]`)).toBeFocused(); await fill(page, { [`items.${i}.label`]: 'B', [`items.${i}.cost`]: '0', [`items.${i}.quantity`]: '1' }) }
  await expect(page.getByRole('button', { name: 'Tambah produk', exact: true })).toBeDisabled(); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 13.500'); await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(20)
  await page.getByRole('button', { name: 'Hapus produk 1', exact: true }).press('Enter'); await expect(page.locator('[name="items.0.label"]')).toBeFocused(); await expect(page.locator('[name="items.0.label"]')).toHaveAttribute('id', id!); await expect(page.locator('[name="items.0.cost"]')).toHaveValue('30000'); await expect(page.getByRole('table')).toHaveCount(0)
})
test('bundle negative fractional fee zero price and undefined margin', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 3); await fill(page, { price: '1', discount: '0', rate: '50', fixed: '1', 'items.0.cost': '1', 'items.0.quantity': '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−Rp 2'); await expect(result(page)).toContainText('−Rp 1,5'); await result(page).screenshot({ path: info.outputPath('bundel-rugi-pecahan.jpg'), quality: 75 })
  await fill(page, { price: '0', rate: '0', fixed: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−Rp 1'); await expect(result(page)).toContainText('Margin tidak terdefinisi')
})
test('stock finite floor zero demand indeterminate tiny and maximum states', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, 4)
  for (const [s, d, main] of [['10', '3', '3,333333 hari (eksak 10/3 hari)'], ['0', '5', '0,000000 hari (eksak 0 hari)'], ['120', '0', 'Tidak terhingga / tidak dapat diperkirakan karena penjualan rata-rata nol'], ['0', '0', 'Tidak terdefinisi: stok dan penjualan rata-rata sama-sama nol']]) { await fill(page, { stock: s, daily: d }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(main); await result(page).screenshot({ path: info.outputPath(`stok-${s}-${d}.jpg`), quality: 75 }) }
  await fill(page, { stock: '1', daily: '9999999999999.999999' }); await submit(page); await expect(result(page).locator('dd').first()).toContainText('<0,000001 hari (positif)'); await result(page).screenshot({ path: info.outputPath('stok-subpresisi.jpg'), quality: 75 })
  await fill(page, { stock: '9999999999999', daily: '0.000001' }); await submit(page); await expect(result(page).locator('dd').first()).toContainText('9.999.999.999.999.000.000,000000 hari')
})
test('marketplace twenty pagination search sitemap and unknown routes', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/marketplace'); const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(12); await page.getByRole('button', { name: 'Muat lebih banyak', exact: true }).press('Enter'); await expect(listing.getByRole('link')).toHaveCount(20); await expect(listing.getByRole('link').nth(12)).toBeFocused(); await page.screenshot({ path: info.outputPath('marketplace-20-alat.jpg'), fullPage: true, quality: 75 })
  for (const f of fixtures) { await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible() }
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length + supplementalPaths.length); for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of ['kalkulator-tidak-ada']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`); await page.getByRole('searchbox').fill(slug); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('marketplace forms tables maximum values and labels fit five widths', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) for (let i = 0; i < fixtures.length; i++) { await page.setViewportSize({ width, height: 900 }); await open(page, i); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width) }
  await page.setViewportSize({ width: 320, height: 900 }); await open(page, 1); await fill(page, { target: '9999999999999', fixed: '9999999999999', discountRate: '99.999999', feeRate: '99.999999' }); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await open(page, 2); await fill(page, { price: '9999999999999', quantity: '10000', cost: '9999999999999', 'channels.0.label': 'A'.repeat(60), 'channels.1.label': 'B'.repeat(60) }); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await open(page, 4); await fill(page, { stock: '0', daily: '0' }); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})
test('all marketplace methodologies sources FAQ render without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const f of fixtures) { await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { name: 'Cara menghitung', exact: true })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Sumber konsep dan verifikasi', exact: true })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Pertanyaan tentang perhitungan ini', exact: true })).toBeVisible(); await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0) }
  await context.close()
})
