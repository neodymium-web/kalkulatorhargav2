import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; input: Record<string, string>; primary: string; invalid: string; bad: string; first: string; name?: string }
const fixtures: Fixture[] = [
  { slug: 'skala-denah', name: 'gambar-nyata', title: 'Kalkulator Skala Denah', input: { mode: 'drawing-real', value: '1', scale: '100', from: 'cm', to: 'm' }, primary: '1,000000 m', invalid: 'scale', bad: '0', first: 'mode' },
  { slug: 'skala-denah', name: 'nyata-gambar', title: 'Kalkulator Skala Denah', input: { mode: 'real-drawing', value: '2.5', scale: '50', from: 'm', to: 'cm' }, primary: '5,000000 cm', invalid: 'scale', bad: '1.5', first: 'mode' },
  { slug: 'konversi-panjang', title: 'Kalkulator Konversi Panjang', input: { value: '25.4', from: 'mm', to: 'in' }, primary: '1,000000 in', invalid: 'value', bad: '-1', first: 'value' },
  { slug: 'konversi-berat', title: 'Kalkulator Konversi Berat', input: { value: '1', from: 'oz', to: 'g' }, primary: '28,349523125 g', invalid: 'value', bad: '-1', first: 'value' },
  { slug: 'konversi-suhu', title: 'Kalkulator Konversi Suhu', input: { value: '0', from: 'C', to: 'F' }, primary: '32,000000 °F', invalid: 'value', bad: '-273.150001', first: 'value' },
  { slug: 'kecepatan-rata-rata', title: 'Kalkulator Kecepatan Rata-rata', input: { distance: '150', distanceUnit: 'km', hours: '2', minutes: '30', seconds: '0', to: 'km/h' }, primary: '60,000000 km/h', invalid: 'minutes', bad: '60', first: 'distance' },
]
async function fill(page: Page, input: Record<string, string>) {
  for (const [name, value] of Object.entries(input)) {
    const field = page.locator(`[name="${name}"]`)
    if (['mode', 'from', 'to', 'distanceUnit'].includes(name)) await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
const swap = (page: Page) => page.getByRole('button', { name: 'Tukar satuan (nilai tetap)', exact: true })
async function open(page: Page, f: Fixture) { await page.goto(`/kalkulator/${f.slug}`); await fill(page, f.input) }
for (const f of fixtures) test(`unit converter SEO result invalid ${f.slug}-${f.name ?? 'main'}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title); await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Sehari-hari' })).toHaveAttribute('href', '/sehari-hari')
  if (f.slug !== 'kecepatan-rata-rata') await expect(swap(page)).toBeDisabled()
  await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.getByRole('form').getByRole('alert')).toBeVisible(); await expect(page.locator(`[name="${f.first}"]`)).toBeFocused()
  await fill(page, f.input); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter'); await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  await expect(result(page)).toContainText('Nilai eksak dalam satuan tujuan')
  const name = `${f.slug}-${f.name ?? 'main'}`; await page.screenshot({ path: info.outputPath(`${name}.jpg`), quality: 75, fullPage: true }); await result(page).screenshot({ path: info.outputPath(`${name}-hasil.jpg`), quality: 75 })
  await fill(page, { [f.invalid]: f.bad }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page)
  const invalid = page.locator(`[name="${f.invalid}"]`); await expect(invalid).toBeFocused(); await expect(invalid).toHaveAttribute('aria-invalid', 'true'); expect((await invalid.getAttribute('aria-describedby'))!.split(' ').length).toBeGreaterThanOrEqual(2)
  await page.screenshot({ path: info.outputPath(`${name}-invalid.jpg`), quality: 75, fullPage: true })
})
test('plan mode resets fields focus and results while both linear directions stay functional', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[0]); await submit(page)
  const mode = page.locator('[name=mode]'); await mode.focus(); await mode.selectOption('real-drawing'); await expect(mode).toBeFocused(); await expect(result(page)).toContainText('Isi semua kolom')
  for (const name of ['value', 'scale', 'from', 'to']) await expect(page.locator(`[name=${name}]`)).toHaveValue('')
  await mode.press('Tab'); await expect(page.locator('[name=value]')).toBeFocused(); await page.locator('[name=value]').press('Shift+Tab'); await expect(mode).toBeFocused()
  await fill(page, { value: '2.5', scale: '50', from: 'm', to: 'cm' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('5,000000 cm')
  await fill(page, { value: '1.000001', scale: '2', from: 'm', to: 'm' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,500001 m'); await expect(result(page)).toContainText('1000001/2000000 m')
  await result(page).screenshot({ path: info.outputPath('skala-half-tie-pecahan-asli.jpg'), quality: 75 })
  await fill(page, { value: '0.000001', scale: '1000000000', from: 'mm', to: 'km' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,000001 km (positif)')
  await result(page).screenshot({ path: info.outputPath('skala-subpresisi.jpg'), quality: 75 })
  await fill(page, { value: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,000000 km')
})
test('unit swap preserves numeric input clears stale output and never reuses rounded results', async ({ page }) => {
  await open(page, fixtures[2]); await fill(page, { value: '1', from: 'km', to: 'm' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('1.000,000000 m')
  await swap(page).press('Enter'); await expect(swap(page)).toBeFocused(); await expect(page.locator('[name=value]')).toHaveValue('1'); await expect(page.locator('[name=from]')).toHaveValue('m'); await expect(page.locator('[name=to]')).toHaveValue('km'); await expect(result(page)).toContainText('Isi semua kolom')
  await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,001000 km')
  await fill(page, { value: '1000' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('1,000000 km')
  await open(page, fixtures[3]); await fill(page, { from: 'lb', to: 'g' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('453,592370000 g')
  await swap(page).press('Enter'); await expect(page.locator('[name=value]')).toHaveValue('1'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,002204623 lb avdp'); await expect(result(page)).toContainText('100000/45359237 lb avdp')
})
test('length and mass official units repeating fractions zero and tiny values', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[2]); await expect(page.locator('[name=from] option')).toHaveCount(10)
  for (const [value, from, to, expected] of [['3', 'ft', 'm', '0,914400 m'], ['1', 'mi', 'km', '1,609344 km'], ['0.001', 'mm', 'um', '1,000000 µm'], ['1', 'm', 'in', '39,370079 in']]) { await fill(page, { value, from, to }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(expected) }
  await expect(result(page)).toContainText('5000/127 in'); await result(page).screenshot({ path: info.outputPath('panjang-pecahan-berulang.jpg'), quality: 75 })
  await fill(page, { value: '0.000001', from: 'um', to: 'km' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,000001 km (positif)')
  await open(page, fixtures[3]); await expect(page.locator('[name=from] option')).toHaveCount(8)
  await fill(page, { value: '16', from: 'oz', to: 'lb' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('1,000000000 lb avdp')
  await fill(page, { value: '0.000001', from: 'ug', to: 't' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,000000001 t (positif)'); await result(page).screenshot({ path: info.outputPath('massa-subpresisi.jpg'), quality: 75 })
  await fill(page, { value: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,000000000 t')
})
test('temperature absolute zero is checked on original input and signed near-zero survives display', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[4])
  for (const [value, from, to, expected] of [['-40', 'C', 'F', '−40,000000 °F'], ['98.6', 'F', 'C', '37,000000 °C'], ['-273.15', 'C', 'K', '0,000000 K'], ['-459.67', 'F', 'K', '0,000000 K'], ['-459.669999', 'F', 'K', '0,000001 K']]) { await fill(page, { value, from, to }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(expected) }
  await result(page).screenshot({ path: info.outputPath('suhu-dekat-nol-mutlak.jpg'), quality: 75 })
  for (const [value, from] of [['-273.150001', 'C'], ['-459.670001', 'F'], ['-0.000001', 'K']]) { await fill(page, { value, from, to: 'K' }); await submit(page); await expect(page.locator('[name=value]')).toBeFocused(); await expect(page.locator('[name=value]')).toHaveAttribute('aria-invalid', 'true'); await expect(result(page)).toContainText('Periksa kolom') }
  await page.screenshot({ path: info.outputPath('suhu-bawah-nol-mutlak.jpg'), quality: 75, fullPage: true })
  await fill(page, { value: '-17.777778', from: 'C', to: 'F' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Antara −0,000001 °F dan 0 °F (negatif)'); await expect(result(page)).toContainText('−1/2500000 °F')
  await result(page).screenshot({ path: info.outputPath('suhu-negatif-subpresisi.jpg'), quality: 75 })
  await fill(page, { value: '-273.15', from: 'C', to: 'K' }); await submit(page); await swap(page).press('Enter'); await expect(page.locator('[name=value]')).toHaveValue('-273.15'); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.locator('[name=value]')).toBeFocused()
  await fill(page, { value: '-0.000000' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−273,150000 °C')
})
test('average speed duration components output changes long trips and zero guards', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[5]); await fill(page, { distance: '100', distanceUnit: 'm', hours: '0', minutes: '0', seconds: '9.58', to: 'm/s' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('10,438413 m/s'); await expect(result(page)).toContainText('5000/479 m/s'); await result(page).screenshot({ path: info.outputPath('kelajuan-detik-pecahan.jpg'), quality: 75 })
  await fill(page, { to: 'km/h' }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(result(page)).toContainText('18000/479 km/h')
  await fill(page, { distance: '150', distanceUnit: 'km', hours: '90', minutes: '0', seconds: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('1,666667 km/h'); await expect(result(page)).toContainText('324.000,000000 s')
  await result(page).screenshot({ path: info.outputPath('kelajuan-lebih-24-jam.jpg'), quality: 75 })
  await fill(page, { hours: '0' }); await submit(page); await expect(page.locator('[name=seconds]')).toBeFocused(); await expect(page.locator('[name=seconds]')).toHaveAttribute('aria-invalid', 'true')
  await fill(page, { seconds: '1', distance: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,000000 km/h')
  await fill(page, { distance: '0.000001', distanceUnit: 'm', hours: '999999999', minutes: '59', seconds: '59.999999', to: 'm/s' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,000001 m/s (positif)'); await result(page).screenshot({ path: info.outputPath('kelajuan-subpresisi.jpg'), quality: 75 })
})
test('twenty everyday tools pagination keyboard search canonical sitemap and staging protection', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); const response = await page.goto('/sehari-hari'); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/sehari-hari')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(12); await listing.getByRole('button', { name: 'Muat lebih banyak' }).press('Enter'); await expect(listing.getByRole('link')).toHaveCount(20); await expect(listing.getByRole('link').nth(12)).toBeFocused(); await expect(listing.getByRole('button')).toHaveCount(0)
  await page.screenshot({ path: info.outputPath('sehari-hari-20-alat.jpg'), quality: 75, fullPage: true })
  for (const f of fixtures.filter(f => f.name !== 'nyata-gambar')) { await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible() }
  await page.getByRole('searchbox').fill('sehari-hari'); await expect(page.getByRole('status')).toHaveText('20 kalkulator ditemukan'); const search = page.getByRole('region', { name: 'Hasil pencarian' }); await search.getByRole('button', { name: 'Muat lebih banyak' }).click(); await expect(search.getByRole('link')).toHaveCount(20)
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(103); for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of [ 'shopee', 'tiktok-shop']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /'); await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')).toHaveCount(7)
})
test('all six conversion flows exact fractions and large numbers fit five widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(120000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 }); for (const f of fixtures) { await open(page, f); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(f.primary); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true) }
    await page.goto('/sehari-hari'); await page.getByRole('button', { name: 'Muat lebih banyak' }).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 900 })
  for (const [f, input] of [[fixtures[0], { value: '9999999999999.999999', scale: '1000000000', from: 'km', to: 'mm' }], [fixtures[3], { value: '9999999999999.999999', from: 't', to: 'ug' }], [fixtures[4], { value: '-17.777778', from: 'C', to: 'F' }], [fixtures[5], { distance: '9999999999999.999999', distanceUnit: 'km', hours: '0', minutes: '0', seconds: '0.000001', to: 'm/s' }]] as [Fixture, Record<string, string>][]) { await open(page, f); await fill(page, input); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true) }
})
test('all unit methodology examples sources and FAQ render without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const f of fixtures.filter(f => f.name !== 'nyata-gambar')) { await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { name: f.title, exact: true })).toBeVisible(); await expect(page.locator('article')).toContainText('Contoh perhitungan'); await expect(page.locator('article')).toContainText('Presisi dan pembulatan'); await expect(page.locator('article')).toContainText('Pertanyaan tentang perhitungan ini'); await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0) }
  await context.close()
})
