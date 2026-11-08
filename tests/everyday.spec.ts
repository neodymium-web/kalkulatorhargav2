import { legacyPaths } from '../lib/legacy/routes'
import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; inputs: Record<string, string>; primary: string; invalid: string; bad: string; mode?: string; add?: string }
const fixtures: Fixture[] = [
  { slug: 'diskon', title: 'Kalkulator Diskon Bertahap', inputs: { original: '100000', 'discounts.0.rate': '10', 'discounts.1.rate': '20' }, primary: 'Rp72.000', invalid: 'discounts.1.rate', bad: '100.0001', add: 'Tambah tahap' },
  { slug: 'harga-per-satuan', title: 'Kalkulator Harga per Satuan', inputs: { 'packages.0.price': '12000', 'packages.0.quantity': '500', 'packages.0.unit': 'g', 'packages.1.price': '22000', 'packages.1.quantity': '1', 'packages.1.unit': 'kg' }, primary: 'Kemasan 2', invalid: 'packages.1.quantity', bad: '0' },
  { slug: 'bagi-tagihan', title: 'Kalkulator Bagi Tagihan', inputs: { service: '3', tax: '4', mode: 'proportional', 'people.0.subtotal': '10000', 'people.1.subtotal': '20000', 'people.2.subtotal': '30000' }, primary: 'Rp60.007', invalid: 'people.2.subtotal', bad: '-1', add: 'Tambah orang' },
  { slug: 'persen', title: 'Kalkulator Persen', inputs: { value: '200', percent: '15' }, primary: '30,0000', invalid: 'percent', bad: '1e3' },
  { slug: 'persen', title: 'Kalkulator Persen', mode: 'ratio', inputs: { part: '3', whole: '8' }, primary: '37,5000%', invalid: 'whole', bad: '0' },
  { slug: 'perubahan-persen', title: 'Kalkulator Perubahan Persen', inputs: { previous: '100', current: '125' }, primary: '+25,0000%', invalid: 'previous', bad: '-1' },
]
async function fill(page: Page, inputs: Record<string, string>) {
  for (const [name, value] of Object.entries(inputs)) {
    const field = page.locator(`[name="${name}"]`)
    if (name.endsWith('.unit') || name === 'mode') await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
const modeSelect = (page: Page) => page.getByLabel('Mode kalkulator persen', { exact: true })
async function open(page: Page, f: Fixture) {
  await page.goto(`/kalkulator/${f.slug}`)
  if (f.mode) await modeSelect(page).selectOption(f.mode)
  if (f.add) await page.getByRole('button', { name: f.add, exact: true }).click()
  await fill(page, f.inputs)
}
for (const f of fixtures) test(`everyday SEO result invalid ${f.slug}-${f.mode ?? 'main'}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`)
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Sehari-hari' })).toHaveAttribute('href', '/sehari-hari')
  if (f.mode) await modeSelect(page).selectOption(f.mode)
  if (f.add) await page.getByRole('button', { name: f.add, exact: true }).click()
  await expect(result(page)).toContainText('Isi semua kolom')
  await submit(page); await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  await expect(page.locator(`[name="${Object.keys(f.inputs)[0]}"]`)).toBeFocused()
  await fill(page, f.inputs); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
  await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  if (f.slug === 'diskon') await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('th,td')).toHaveText(['Tahap 2', '20,0000%', '0,720000', 'Rp72.000,00'])
  if (f.slug === 'harga-per-satuan') await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('th,td')).toHaveText(['Kemasan 2', 'Rp22.000', '1 kg', 'Rp22.000,00', '8,33%', 'Ya'])
  if (f.slug === 'bagi-tagihan') {
    await expect(page.getByRole('table').locator('tbody tr').locator('td').nth(1)).toHaveCount(1)
    await expect(page.getByRole('table').locator('tbody tr').nth(0).locator('th,td')).toHaveText(['Orang 1', 'Rp10.000', 'Rp1', 'Rp10.001'])
    await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('th,td')).toHaveText(['Orang 2', 'Rp20.000', 'Rp2', 'Rp20.002'])
    await expect(page.getByRole('table').locator('tbody tr').nth(2).locator('th,td')).toHaveText(['Orang 3', 'Rp30.000', 'Rp4', 'Rp30.004'])
    await expect(page.getByRole('table').locator('tfoot th,tfoot td')).toHaveText(['Total', 'Rp60.000', 'Rp7', 'Rp60.007'])
  }
  if (await page.getByRole('table').count()) {
    const region = page.getByRole('table').locator('..'); await region.focus(); await expect(region).toBeFocused(); await region.press('ArrowRight'); await region.evaluate(node => { node.scrollLeft = 0 })
    await region.screenshot({ path: info.outputPath(`${f.slug}-table.jpg`), quality: 75 })
  }
  await page.screenshot({ path: info.outputPath(`${f.slug}-${f.mode ?? 'main'}.jpg`), fullPage: true, quality: 75 })
  await result(page).screenshot({ path: info.outputPath(`${f.slug}-${f.mode ?? 'main'}-hasil.jpg`), quality: 75 })
  await page.locator(`[name="${f.invalid}"]`).fill(f.bad); await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.getByRole('table')).toHaveCount(0)
  await submit(page); const invalid = page.locator(`[name="${f.invalid}"]`)
  await expect(invalid).toBeFocused(); await expect(invalid).toHaveAttribute('aria-invalid', 'true')
  expect((await invalid.getAttribute('aria-describedby'))!.split(' ').length).toBeGreaterThanOrEqual(2)
  await page.screenshot({ path: info.outputPath(`${f.slug}-${f.mode ?? 'main'}-invalid.jpg`), fullPage: true, quality: 75 })
})
test('dynamic rows retain values stable keys focus minimum and maximum', async ({ page }) => {
  test.setTimeout(90000)
  for (const [fixture, row, label, field, limit, minimum] of [[fixtures[0], 'discounts', 'tahap', 'rate', 20, 1], [fixtures[1], 'packages', 'kemasan', 'price', 10, 2], [fixtures[2], 'people', 'orang', 'subtotal', 20, 2]] as const) {
    await page.goto(`/kalkulator/${fixture.slug}`)
    const add = page.getByRole('button', { name: `Tambah ${label}`, exact: true })
    await expect(page.getByRole('button', { name: `Hapus ${label} 1`, exact: true })).toBeDisabled()
    await page.locator(`[name="${row}.0.${field}"]`).fill('11')
    await add.press('Enter'); await expect(page.locator(`[name="${row}.${minimum}.${field}"]`)).toBeFocused()
    await page.locator(`[name="${row}.${minimum}.${field}"]`).fill('77')
    const stable = await page.locator(`[name="${row}.${minimum}.${field}"]`).getAttribute('id')
    await page.getByRole('button', { name: `Hapus ${label} 1`, exact: true }).press('Enter')
    await expect(page.locator(`[name="${row}.${minimum - 1}.${field}"]`)).toHaveValue('77')
    await expect(page.locator(`[name="${row}.${minimum - 1}.${field}"]`)).toHaveAttribute('id', stable!)
    await expect(page.locator(`[name="${row}.0.${field}"]`)).toBeFocused()
    for (let i = minimum; i < limit; i++) await add.click()
    await expect(page.locator('fieldset')).toHaveCount(limit); await expect(add).toBeDisabled()
  }
})
test('discount rounds cash once and distinguishes model saving from cash saving', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/kalkulator/diskon')
  await fill(page, { original: '1', 'discounts.0.rate': '50' }); await submit(page)
  await expect(result(page).locator('dd')).toHaveText(['Rp1', 'Rp0', 'Rp1', '50,00%', '0,00%'])
  await page.getByRole('button', { name: 'Tambah tahap', exact: true }).click(); await fill(page, { 'discounts.1.rate': '50' }); await submit(page)
  await expect(result(page).locator('dd')).toHaveText(['Rp0', 'Rp1', 'Rp1', '75,00%', '100,00%'])
  await page.screenshot({ path: info.outputPath('diskon-round-once.jpg'), fullPage: true, quality: 75 })
  await fill(page, { original: '0' }); await submit(page); await expect(result(page).locator('dd').last()).toHaveText('Tidak terdefinisi (basis nol)')
})
test('package volume exact ties near ties zero prices and incompatible units', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[1])
  await fill(page, { 'packages.0.price': '5000', 'packages.0.quantity': '250', 'packages.0.unit': 'mL', 'packages.1.price': '8000', 'packages.1.quantity': '500', 'packages.1.unit': 'mL' }); await submit(page)
  await expect(result(page)).toContainText('Rp16.000,00'); await expect(result(page)).toContainText('20,00%')
  await fill(page, { 'packages.0.price': '1', 'packages.0.quantity': '1000', 'packages.0.unit': 'pcs', 'packages.1.price': '1', 'packages.1.quantity': '1001', 'packages.1.unit': 'pcs' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Kemasan 2'); await expect(result(page)).toContainText('<Rp0,01'); await expect(result(page)).toContainText('0,10%')
  await result(page).screenshot({ path: info.outputPath('unit-price-near-tie.jpg'), quality: 75 })
  await fill(page, { 'packages.1.quantity': '1000' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Kemasan 1, Kemasan 2')
  await fill(page, { 'packages.0.price': '0', 'packages.1.price': '0' }); await submit(page); await expect(result(page)).toContainText('Tidak terdefinisi (basis nol)')
  await fill(page, { 'packages.1.unit': 'kg' }); await submit(page); await expect(page.locator('[name="packages.1.unit"]')).toBeFocused(); await expect(page.locator('[name="packages.1.unit"]')).toHaveAttribute('aria-invalid', 'true')
})
test('bill equal shares charges only and zero proportional guard reconcile rupiah', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/kalkulator/bagi-tagihan')
  await fill(page, { service: '1', tax: '0', mode: 'equal', 'people.0.subtotal': '0', 'people.1.subtotal': '0' }); await submit(page)
  await expect(page.getByRole('table').locator('tbody tr').first().locator('th,td')).toHaveText(['Orang 1', 'Rp0', 'Rp1', 'Rp1'])
  await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('th,td')).toHaveText(['Orang 2', 'Rp0', 'Rp0', 'Rp0'])
  await result(page).screenshot({ path: info.outputPath('bill-largest-remainder-tie.jpg'), quality: 75 })
  await fill(page, { mode: 'proportional' }); await submit(page); await expect(page.locator('[name=mode]')).toBeFocused(); await expect(page.locator('[name=mode]')).toHaveAttribute('aria-invalid', 'true')
  await fill(page, { service: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0')
  await fill(page, { service: '10', mode: 'equal', 'people.0.subtotal': '100', 'people.1.subtotal': '200' }); await submit(page)
  await expect(page.getByRole('table').locator('tbody tr').first().locator('th,td')).toHaveText(['Orang 1', 'Rp100', 'Rp5', 'Rp105'])
  await expect(page.getByRole('table').locator('tfoot th,tfoot td')).toHaveText(['Total', 'Rp300', 'Rp10', 'Rp310'])
})
test('percent mode keyboard focus resets and signed tiny and zero basis output', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[3]); await submit(page)
  const select = modeSelect(page); await select.focus(); await select.selectOption('ratio'); await expect(select).toBeFocused(); await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.locator('[name=part]')).toHaveValue('')
  await select.press('Tab'); await expect(page.locator('[name=part]')).toBeFocused(); await page.locator('[name=part]').press('Shift+Tab'); await expect(select).toBeFocused()
  await fill(page, { part: '-3', whole: '-8' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('37,5000%')
  await select.selectOption('portion'); await expect(page.locator('[name=value]')).toHaveValue(''); await fill(page, { value: '-0.01', percent: '0.5' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−0,0001')
  await page.goto('/kalkulator/perubahan-persen'); await fill(page, { previous: '9999999999999.000001', current: '9999999999999' }); await submit(page)
  await expect(result(page)).toContainText('−0,000001'); await expect(result(page).locator('dd').first()).toHaveText('Antara −0,0001% dan 0% (negatif)')
  await result(page).screenshot({ path: info.outputPath('percent-change-negative-tiny.jpg'), quality: 75 })
  await fill(page, { previous: '0', current: '25' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Tidak terdefinisi (basis nol)'); await expect(result(page)).toContainText('+25')
  await result(page).screenshot({ path: info.outputPath('percent-change-zero-baseline.jpg'), quality: 75 })
})
test('everyday hub search sitemap SSR sources and staging protections', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); const response = await page.goto('/sehari-hari'); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(12); await listing.getByRole('button', { name: 'Muat lebih banyak' }).press('Enter'); await expect(listing.getByRole('link')).toHaveCount(20)
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')).toHaveCount(7)
  await page.screenshot({ path: info.outputPath('sehari-hari-hub.jpg'), fullPage: true, quality: 75 })
  for (const f of fixtures.filter(x => !x.mode)) {
    await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible()
    const html = await (await request.get(`/kalkulator/${f.slug}`)).text(); expect(html).toContain(`<title>${f.title} | KalkulatorHarga</title>`); expect(html).toContain('Sumber rumus'); expect(html).toContain('Presisi dan pembulatan')
  }
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length); expect(xml).toContain('/sehari-hari</loc>')
  for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of ['kalkulator-tidak-ada']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('everyday forms tables and hub fit five widths and large result', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(120000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const f of fixtures) { await open(page, f); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(f.primary); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true) }
    await page.goto('/sehari-hari'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 900 }); await open(page, fixtures[1]); await fill(page, { 'packages.0.price': '9999999999999', 'packages.0.quantity': '0.001', 'packages.0.unit': 'mg', 'packages.1.price': '9999999999998', 'packages.1.quantity': '0.001', 'packages.1.unit': 'mg' }); await submit(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
test('all everyday methodologies and sources render without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const f of fixtures.filter(x => !x.mode)) { await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { name: f.title, exact: true })).toBeVisible(); await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0); await expect(page.locator('article')).toContainText('Presisi dan pembulatan') }
  await context.close()
})
