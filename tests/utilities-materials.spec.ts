import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; input: Record<string, string>; primary: string; invalid: string; bad: string; first: string; add?: string }
const fixtures: Fixture[] = [
  { slug: 'biaya-listrik', title: 'Kalkulator Biaya Listrik', input: { power: '300', hours: '8', days: '30', quantity: '1', tariff: '1700' }, primary: 'Rp122.400', invalid: 'hours', bad: '24.000001', first: 'power' },
  { slug: 'biaya-air', title: 'Kalkulator Biaya Air Progresif', input: { usage: '18', fixed: '10000', 'tiers.0.limit': 'bounded', 'tiers.0.upper': '10', 'tiers.0.rate': '3000', 'tiers.1.limit': 'bounded', 'tiers.1.upper': '20', 'tiers.1.rate': '5000', 'tiers.2.limit': 'unbounded', 'tiers.2.rate': '7000' }, primary: 'Rp80.000', invalid: 'tiers.1.upper', bad: '10', first: 'usage', add: 'Tambah blok' },
  { slug: 'kebutuhan-cat', title: 'Kalkulator Kebutuhan Cat', input: { gross: '40', openings: '5', coats: '2', coverage: '10', reserve: '10', package: '5' }, primary: '2 kemasan', invalid: 'openings', bad: '40.000001', first: 'gross' },
  { slug: 'kebutuhan-keramik', title: 'Kalkulator Kebutuhan Keramik', input: { area: '12', length: '40', width: '40', perBox: '6', reserve: '10' }, primary: '14 dus', invalid: 'width', bad: '0', first: 'area' },
  { slug: 'volume-beton', title: 'Kalkulator Volume Beton', input: { reserve: '10', 'elements.0.shape': 'prism', 'elements.0.length': '2', 'elements.0.width': '3', 'elements.0.height': '0.1', 'elements.0.count': '2', 'elements.1.shape': 'prism', 'elements.1.length': '1', 'elements.1.width': '1', 'elements.1.height': '1', 'elements.1.count': '1' }, primary: '2,4200 m³', invalid: 'elements.0.height', bad: '0', first: 'elements.0.shape', add: 'Tambah elemen' },
]
async function fill(page: Page, input: Record<string, string>) {
  for (const [name, value] of Object.entries(input)) {
    const field = page.locator(`[name="${name}"]`)
    if (name.endsWith('.limit') || name.endsWith('.shape')) await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
async function open(page: Page, f: Fixture) { await page.goto(`/kalkulator/${f.slug}`); if (f.add) await page.getByRole('button', { name: f.add, exact: true }).click(); await fill(page, f.input) }
for (const f of fixtures) test(`materials SEO result invalid ${f.slug}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title); await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Sehari-hari' })).toHaveAttribute('href', '/sehari-hari')
  if (f.add) await page.getByRole('button', { name: f.add, exact: true }).click()
  await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.getByRole('form').getByRole('alert')).toBeVisible(); await expect(page.locator(`[name="${f.first}"]`)).toBeFocused()
  await fill(page, f.input); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter'); await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  if (f.slug === 'biaya-air') { await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(3); await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('th,td')).toHaveText(['Blok 2', '10 m³', '20 m³', 'Rp5.000/m³', '8 m³', 'Rp40.000']); await expect(page.getByRole('table').locator('tfoot th,tfoot td')).toHaveText(['Total', '', '', '', '18 m³', 'Rp70.000']) }
  if (f.slug === 'volume-beton') await expect(page.getByRole('table').locator('tbody tr').first().locator('th,td')).toHaveText(['Elemen 1', 'Balok', '2', '1,2000 m³'])
  if (await page.getByRole('table').count()) { const region = page.getByRole('table').locator('..'); await region.focus(); await region.press('ArrowRight'); await expect(region).toBeFocused(); await region.evaluate(n => { n.scrollLeft = 0 }); await region.screenshot({ path: info.outputPath(`${f.slug}-tabel.jpg`), quality: 75 }) }
  await page.screenshot({ path: info.outputPath(`${f.slug}.jpg`), quality: 75, fullPage: true }); await result(page).screenshot({ path: info.outputPath(`${f.slug}-hasil.jpg`), quality: 75 })
  await fill(page, { [f.invalid]: f.bad }); await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.getByRole('table')).toHaveCount(0); await submit(page)
  const invalid = page.locator(`[name="${f.invalid}"]`); await expect(invalid).toBeFocused(); await expect(invalid).toHaveAttribute('aria-invalid', 'true'); expect((await invalid.getAttribute('aria-describedby'))!.split(' ').length).toBeGreaterThanOrEqual(2)
  await page.screenshot({ path: info.outputPath(`${f.slug}-invalid.jpg`), quality: 75, fullPage: true })
})
test('water progressive boundaries finite coverage final-unbounded controls and exact subrupiah ledger', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[1]); await fill(page, { usage: '25' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp125.000')
  await fill(page, { usage: '10.001' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp40.005'); await expect(page.getByRole('table').locator('tbody tr').nth(1).locator('td').nth(3)).toHaveText('0,001 m³')
  await fill(page, { usage: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp10.000')
  await page.getByRole('button', { name: 'Hapus blok 3', exact: true }).press('Enter'); await expect(page.locator('[name="tiers.1.limit"]')).toBeFocused(); await fill(page, { usage: '20.000001' }); await submit(page); await expect(page.locator('[name=usage]')).toBeFocused(); await expect(page.locator('[name=usage]')).toHaveAttribute('aria-invalid', 'true')
  await fill(page, { 'tiers.1.limit': 'unbounded' }); await expect(page.locator('[name="tiers.1.upper"]')).toHaveCount(0); await expect(page.locator('[name="tiers.1.rate"]')).toHaveValue('5000'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp90.000')
  await fill(page, { 'tiers.0.limit': 'unbounded' }); await submit(page); await expect(page.locator('[name="tiers.0.limit"]')).toBeFocused()
  await fill(page, { 'tiers.0.limit': 'bounded' }); await expect(page.locator('[name="tiers.0.upper"]')).toHaveValue('')
  await fill(page, { usage: '2', fixed: '', 'tiers.0.upper': '1', 'tiers.0.rate': '0.5', 'tiers.1.rate': '0.5' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Rp1'); await expect(page.getByRole('table').locator('tbody tr').first().locator('td').last()).toHaveText('Rp0,5'); await expect(page.getByRole('table').locator('tfoot td').last()).toHaveText('Rp1')
  await page.screenshot({ path: info.outputPath('air-biaya-blok-eksak.jpg'), quality: 75, fullPage: true })
  await fill(page, { usage: '0.000001', 'tiers.0.rate': '0.0001' }); await submit(page); await expect(result(page).locator('dd').first()).toContainText('Rp0 (nilai positif <Rp0,50'); await expect(result(page)).toContainText('Rp0,0000000001')
  await result(page).screenshot({ path: info.outputPath('air-subrupiah.jpg'), quality: 75 })
})
test('dynamic water and concrete rows retain conditional choices values keys focus and bounds', async ({ page }) => {
  test.setTimeout(90000)
  for (const [f, prefix, rowName, selector, option, field, limit, min] of [[fixtures[1], 'tiers', 'blok', 'limit', 'bounded', 'rate', 8, 2], [fixtures[4], 'elements', 'elemen', 'shape', 'cylinder', 'height', 20, 1]] as const) {
    await page.goto(`/kalkulator/${f.slug}`); const add = page.getByRole('button', { name: `Tambah ${rowName}`, exact: true })
    await expect(page.getByRole('button', { name: `Hapus ${rowName} 1`, exact: true })).toBeDisabled(); await add.press('Enter'); await expect(page.locator(`[name="${prefix}.${min}.${selector}"]`)).toBeFocused()
    await fill(page, { [`${prefix}.${min}.${selector}`]: option, [`${prefix}.${min}.${field}`]: '77' })
    const id = await page.locator(`[name="${prefix}.${min}.${field}"]`).getAttribute('id')
    await page.getByRole('button', { name: `Hapus ${rowName} 1`, exact: true }).press('Enter'); await expect(page.locator(`[name="${prefix}.0.${selector}"]`)).toBeFocused()
    await expect(page.locator(`[name="${prefix}.${min - 1}.${field}"]`)).toHaveAttribute('id', id!); await expect(page.locator(`[name="${prefix}.${min - 1}.${field}"]`)).toHaveValue('77'); await expect(page.locator(`[name="${prefix}.${min - 1}.${selector}"]`)).toHaveValue(option)
    for (let n = min; n < limit; n++) await add.click()
    await expect(page.locator('fieldset')).toHaveCount(limit); await expect(add).toBeDisabled()
    if (prefix === 'tiers') {
      await fill(page, { usage: '10', fixed: '0' })
      for (let i = 0; i < limit; i++) await fill(page, i === limit - 1 ? { [`tiers.${i}.limit`]: 'unbounded', [`tiers.${i}.rate`]: '1' } : { [`tiers.${i}.limit`]: 'bounded', [`tiers.${i}.upper`]: String(i + 1), [`tiers.${i}.rate`]: '1' })
      await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp10'); await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(8)
    } else {
      await fill(page, { reserve: '0' })
      for (let i = 0; i < limit; i++) await fill(page, { [`elements.${i}.shape`]: 'cylinder', [`elements.${i}.diameter`]: '1', [`elements.${i}.height`]: '1', [`elements.${i}.count`]: '1' })
      await submit(page); await expect(result(page).locator('dd').first()).toHaveText('15,7080 m³'); await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(20)
    }
    await page.getByRole('button', { name: `Hapus ${rowName} ${limit}`, exact: true }).press('Enter'); await expect(add).toBeEnabled(); await expect(result(page)).toContainText('Isi semua kolom')
  }
})
test('paint and ceramic ceilings use hidden exact values zero and nonsquare dimensions', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[2]); await fill(page, { gross: '10.000001', openings: '0', coats: '1', coverage: '1', reserve: '', package: '5' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('3 kemasan'); await expect(result(page)).toContainText('10,0000 L'); await expect(result(page)).toContainText('15,000000 L')
  await result(page).screenshot({ path: info.outputPath('cat-ceiling-sebelum-pembulatan.jpg'), quality: 75 })
  await fill(page, { openings: '10.000001' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 kemasan')
  await open(page, fixtures[3]); await fill(page, { area: '3', length: '30', width: '50', reserve: '', perBox: '7' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('3 dus'); await expect(result(page)).toContainText('20 ubin'); await expect(result(page)).toContainText('21 ubin'); await expect(result(page)).toContainText('3,1500 m²')
  await fill(page, { area: '1.000001', length: '100', width: '100', perBox: '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('2 dus'); await expect(result(page)).toContainText('2 ubin')
  await result(page).screenshot({ path: info.outputPath('keramik-ceiling-batas-dus.jpg'), quality: 75 })
  await fill(page, { area: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 dus')
})
test('concrete shape switch clears inactive dimensions keeps common values and uses rational pi', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/kalkulator/volume-beton')
  await fill(page, { reserve: '', 'elements.0.shape': 'prism', 'elements.0.length': '2', 'elements.0.width': '3', 'elements.0.height': '1', 'elements.0.count': '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('6,0000 m³')
  const shape = page.locator('[name="elements.0.shape"]'); await shape.focus(); await shape.selectOption('cylinder'); await expect(shape).toBeFocused(); await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.locator('[name="elements.0.length"]')).toHaveCount(0); await expect(page.locator('[name="elements.0.width"]')).toHaveCount(0); await expect(page.locator('[name="elements.0.height"]')).toHaveValue('1'); await expect(page.locator('[name="elements.0.count"]')).toHaveValue('1')
  await shape.press('Tab'); await expect(page.locator('[name="elements.0.diameter"]')).toBeFocused(); await page.locator('[name="elements.0.diameter"]').press('Shift+Tab'); await expect(shape).toBeFocused()
  await submit(page); await expect(page.locator('[name="elements.0.diameter"]')).toBeFocused(); await fill(page, { 'elements.0.diameter': '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,7854 m³'); await expect(result(page)).toContainText('bukan π eksak')
  await page.screenshot({ path: info.outputPath('beton-silinder-pi.jpg'), quality: 75, fullPage: true })
  await shape.selectOption('prism'); await expect(page.locator('[name="elements.0.length"]')).toHaveValue(''); await expect(page.locator('[name="elements.0.diameter"]')).toHaveCount(0); await expect(page.locator('[name="elements.0.height"]')).toHaveValue('1')
  await fill(page, { 'elements.0.length': '0.000001', 'elements.0.width': '0.000001', 'elements.0.height': '0.000001' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,0001 m³ (positif)')
  await result(page).screenshot({ path: info.outputPath('beton-volume-positif-kecil.jpg'), quality: 75 })
})
test('electricity unit scale fractional hours half-up zero and tiny states', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[0]); await fill(page, { power: '100', hours: '0.5', days: '1', tariff: '1700.0001' }); await submit(page); await expect(result(page).locator('dd')).toHaveText(['Rp85', '0,0500 kWh'])
  await fill(page, { power: '1', hours: '1', tariff: '1' }); await submit(page); await expect(result(page).locator('dd').nth(1)).toHaveText('0,0010 kWh')
  await fill(page, { hours: '0.000001' }); await submit(page); await expect(result(page).locator('dd').nth(1)).toHaveText('<0,0001 kWh (positif)'); await expect(result(page).locator('dd').first()).toContainText('nilai positif <Rp0,50')
  await result(page).screenshot({ path: info.outputPath('listrik-energi-subpresisi.jpg'), quality: 75 })
  await fill(page, { power: '500', hours: '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp1')
  await fill(page, { power: '0' }); await submit(page); await expect(result(page).locator('dd')).toHaveText(['Rp0', '0,0000 kWh'])
})
test('twenty-tool hub load more keyboard search SEO sitemap and staging protections', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/sehari-hari')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(12); await listing.getByRole('button', { name: 'Muat lebih banyak' }).press('Enter'); await expect(listing.getByRole('link')).toHaveCount(20); await expect(listing.getByRole('link').nth(12)).toBeFocused(); await expect(listing.getByRole('button')).toHaveCount(0)
  await page.screenshot({ path: info.outputPath('sehari-hari-20-alat.jpg'), quality: 75, fullPage: true })
  for (const f of fixtures) { await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible(); const r = await request.get(`/kalkulator/${f.slug}`); expect(r.headers()['x-robots-tag']).toBe('noindex, nofollow') }
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')).toHaveCount(7)
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length + supplementalPaths.length); for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of ['kalkulator-tidak-ada']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`); await page.goto('/'); await page.getByRole('searchbox').fill(slug.replaceAll('-', ' ')); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('all materials forms tables hub and large results fit five responsive widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(120000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 }); for (const f of fixtures) { await open(page, f); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(f.primary); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true) }
    await page.goto('/sehari-hari'); await page.getByRole('button', { name: 'Muat lebih banyak' }).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 900 }); await open(page, fixtures[0]); await fill(page, { power: '999999.999999', hours: '24', days: '366', quantity: '10000', tariff: '9999999999999.9999' }); await submit(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await open(page, fixtures[2]); await fill(page, { gross: '999999.999999', openings: '0', coats: '100', coverage: '0.000001', reserve: '100', package: '0.000001' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('199.999.999.999.800.000.000 kemasan'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
test('all materials methodology examples and sources render without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const f of fixtures) { await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { name: f.title, exact: true })).toBeVisible(); await expect(page.locator('article')).toContainText('Presisi dan pembulatan'); await expect(page.locator('article')).toContainText('Contoh perhitungan'); await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0) }
  await context.close()
})
