import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; inputs: Record<string, string>; primary: string; invalid: string; bad: string }
const fixtures: Fixture[] = [
  { slug: 'selisih-tanggal', title: 'Kalkulator Selisih Tanggal', inputs: { start: '2024-02-28', end: '2024-03-01', mode: 'elapsed' }, primary: '2 hari', invalid: 'end', bad: '2024-02-27' },
  { slug: 'hari-kerja', title: 'Kalkulator Hari Kerja', inputs: { start: '2026-11-02', end: '2026-11-08', weekend: 'sat-sun' }, primary: '5 hari', invalid: 'end', bad: '2026-11-01' },
  { slug: 'usia', title: 'Kalkulator Usia', inputs: { birth: '2024-02-29', reference: '2025-02-28' }, primary: '1 tahun 0 bulan 0 hari', invalid: 'reference', bad: '2024-02-28' },
  { slug: 'durasi-kerja', title: 'Kalkulator Durasi Kerja', inputs: { start: '09:00', end: '17:30', endDay: 'same-day', break: '60' }, primary: '7 jam 30 menit', invalid: 'break', bad: '511' },
  { slug: 'konsumsi-bbm', title: 'Kalkulator Konsumsi BBM', inputs: { distance: '150', efficiency: '15', price: '10000' }, primary: '10,0000 L', invalid: 'efficiency', bad: '0' },
]
async function fill(page: Page, input: Record<string, string>) {
  for (const [name, value] of Object.entries(input)) {
    const field = page.locator(`[name="${name}"]`)
    if (['mode', 'weekend', 'endDay'].includes(name)) await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
async function open(page: Page, f: Fixture) { await page.goto(`/kalkulator/${f.slug}`); await fill(page, f.inputs) }
for (const f of fixtures) test(`calendar SEO result invalid ${f.slug}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Sehari-hari' })).toHaveAttribute('href', '/sehari-hari')
  await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  await expect(page.locator(`[name="${Object.keys(f.inputs)[0]}"]`)).toBeFocused()
  await fill(page, f.inputs); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter'); await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  await page.screenshot({ path: info.outputPath(`${f.slug}.jpg`), quality: 75, fullPage: true }); await result(page).screenshot({ path: info.outputPath(`${f.slug}-hasil.jpg`), quality: 75 })
  await fill(page, { [f.invalid]: f.bad }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page)
  const invalid = page.locator(`[name="${f.invalid}"]`); await expect(invalid).toBeFocused(); await expect(invalid).toHaveAttribute('aria-invalid', 'true')
  expect((await invalid.getAttribute('aria-describedby'))!.split(' ').length).toBeGreaterThanOrEqual(2)
  await page.screenshot({ path: info.outputPath(`${f.slug}-invalid.jpg`), quality: 75, fullPage: true })
})
test('calendar endpoints leap centuries year bounds and explicit age clamp', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[0]); await submit(page)
  await fill(page, { mode: 'inclusive' }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('3 hari')
  for (const [start, end, expected] of [['1900-02-28', '1900-03-01', '2 hari'], ['2000-02-28', '2000-03-01', '3 hari'], ['2026-11-07', '2026-11-07', '1 hari'], ['0001-01-01', '9999-12-31', '3.652.059 hari']]) { await fill(page, { start, end }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(expected) }
  await result(page).screenshot({ path: info.outputPath('tanggal-rentang-maksimum.jpg'), quality: 75 })
  await open(page, fixtures[2]); await fill(page, { reference: '2025-02-27' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 tahun 11 bulan 29 hari'); await expect(result(page)).toContainText('2025-01-29')
  await result(page).screenshot({ path: info.outputPath('usia-sebelum-anniversary.jpg'), quality: 75 })
  await fill(page, { birth: '2024-01-31', reference: '2024-03-30' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 tahun 1 bulan 30 hari')
  await fill(page, { reference: '2024-03-31' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 tahun 2 bulan 0 hari')
  await fill(page, { reference: '2024-01-31' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 tahun 0 bulan 0 hari')
})
test('holidays are optional deduplicated classified and never subtracted twice', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[1]); await expect(page.locator('fieldset')).toHaveCount(0); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('5 hari')
  const add = page.getByRole('button', { name: 'Tambah libur', exact: true })
  for (const [index, date] of ['2026-11-04', '2026-11-04', '2026-11-07', '2026-11-09'].entries()) { await add.press('Enter'); await expect(page.locator(`[name="holidays.${index}.date"]`)).toBeFocused(); await expect(result(page)).toContainText('Isi semua kolom'); await fill(page, { [`holidays.${index}.date`]: date }) }
  await submit(page); await expect(result(page).locator('dd')).toHaveText(['4 hari', '7 hari', '5 hari', '1 hari', '3', '1', '1', '1'])
  const table = page.getByRole('table'); await expect(table.locator('tbody tr')).toHaveCount(3)
  await expect(table.locator('tbody tr').nth(0).locator('th,td')).toHaveText(['2026-11-04', 'Rabu', 'Mengurangi hari terjadwal'])
  await expect(table.locator('tbody tr').nth(1).locator('th,td')).toHaveText(['2026-11-07', 'Sabtu', 'Diabaikan: sudah libur mingguan'])
  await expect(table.locator('tbody tr').nth(2).locator('th,td')).toHaveText(['2026-11-09', 'Senin', 'Diabaikan: di luar rentang'])
  const region = page.getByRole('region', { name: 'Pemeriksaan tanggal libur unik' }); await region.focus(); await region.press('ArrowRight'); await expect(region).toBeFocused(); await region.evaluate(n => { n.scrollLeft = 0 })
  await region.screenshot({ path: info.outputPath('hari-kerja-klasifikasi-tabel.jpg'), quality: 75 }); await page.screenshot({ path: info.outputPath('hari-kerja-dedupe.jpg'), quality: 75, fullPage: true })
  await fill(page, { 'holidays.0.date': '' }); await expect(table).toHaveCount(0); await submit(page); await expect(page.locator('[name="holidays.0.date"]')).toBeFocused(); await expect(page.locator('[name="holidays.0.date"]')).toHaveAttribute('aria-invalid', 'true')
  await page.screenshot({ path: info.outputPath('hari-kerja-libur-invalid.jpg'), quality: 75, fullPage: true })
  await fill(page, { 'holidays.0.date': '2026-11-04', weekend: 'all' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 hari')
  await fill(page, { weekend: 'none' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('5 hari')
  await fill(page, { weekend: 'fri-sat' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('4 hari')
})
test('holiday add delete keys focus empty-list recovery and 100 row bound', async ({ page }) => {
  test.setTimeout(90000); await open(page, fixtures[1]); const add = page.getByRole('button', { name: 'Tambah libur', exact: true })
  for (const [i, date] of ['2026-11-03', '2026-11-04', '2026-11-05'].entries()) { await add.press('Enter'); await fill(page, { [`holidays.${i}.date`]: date }) }
  const lastId = await page.locator('[name="holidays.2.date"]').getAttribute('id')
  await page.getByRole('button', { name: 'Hapus libur 1', exact: true }).press('Enter'); await expect(page.locator('[name="holidays.0.date"]')).toBeFocused(); await expect(page.locator('[name="holidays.0.date"]')).toHaveValue('2026-11-04')
  await expect(page.locator('[name="holidays.1.date"]')).toHaveAttribute('id', lastId!); await expect(page.locator('[name="holidays.1.date"]')).toHaveValue('2026-11-05')
  await submit(page); await expect(result(page).locator('dd').first()).toHaveText('3 hari')
  await page.getByRole('button', { name: 'Hapus libur 2', exact: true }).press('Enter'); await expect(page.locator('[name="holidays.0.date"]')).toBeFocused(); await expect(result(page)).toContainText('Isi semua kolom')
  await page.getByRole('button', { name: 'Hapus libur 1', exact: true }).press('Enter'); await expect(add).toBeFocused(); await expect(page.locator('fieldset')).toHaveCount(0)
  await submit(page); await expect(result(page).locator('dd').first()).toHaveText('5 hari')
  for (let i = 0; i < 100; i++) await add.click()
  await expect(page.locator('fieldset')).toHaveCount(100); await expect(add).toBeDisabled(); await expect(page.locator('[name="holidays.99.date"]')).toBeFocused()
})
test('shift rollover equal times one minute and break boundary are explicit', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[3]); await fill(page, { start: '22:00', end: '06:00', endDay: 'next-day', break: '30' }); await submit(page)
  await expect(result(page).locator('dd')).toHaveText(['7 jam 30 menit', '7,5000 jam', '480 menit', '30 menit'])
  await result(page).screenshot({ path: info.outputPath('shift-malam.jpg'), quality: 75 })
  await fill(page, { endDay: 'same-day' }); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(page.locator('[name=end]')).toBeFocused()
  await fill(page, { start: '09:00', end: '09:00', break: '0', endDay: 'same-day' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 jam 0 menit')
  await fill(page, { endDay: 'next-day' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('24 jam 0 menit')
  await fill(page, { start: '00:00', end: '00:01', endDay: 'same-day' }); await submit(page); await expect(result(page).locator('dd')).toHaveText(['0 jam 1 menit', '0,0167 jam', '1 menit', '0 menit'])
  await result(page).screenshot({ path: info.outputPath('shift-satu-menit.jpg'), quality: 75 })
  await fill(page, { break: '2' }); await submit(page); await expect(page.locator('[name=break]')).toBeFocused()
  await fill(page, { break: '1' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0 jam 0 menit')
})
test('fuel repeating fraction half-rupiah zero and tiny direction use original ratios', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[4]); await fill(page, { distance: '1', efficiency: '3', price: '10000' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('0,3333 L'); await expect(result(page)).toContainText('Rp3.333')
  await result(page).screenshot({ path: info.outputPath('bbm-pecahan-berulang.jpg'), quality: 75 })
  await fill(page, { efficiency: '2', price: '1' }); await submit(page); await expect(result(page)).toContainText('Rp1')
  await fill(page, { distance: '0.000001', efficiency: '9999999999999' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,0001 L (positif)'); await expect(result(page).locator('dd').nth(1)).toHaveText('Rp0 (estimasi positif <Rp0,50)')
  await result(page).screenshot({ path: info.outputPath('bbm-subpresisi.jpg'), quality: 75 })
  await fill(page, { distance: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,0000 L'); await expect(result(page).locator('dd').nth(1)).toHaveText('Rp0')
  await fill(page, { distance: '1', efficiency: '3', price: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,3333 L'); await expect(result(page).locator('dd').nth(1)).toHaveText('Rp0')
})
test('plain dates and shifts remain invariant in opposite timezone browser contexts', async ({ browser }) => {
  for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati', 'Asia/Jakarta']) {
    const context = await browser.newContext({ timezoneId }); const page = await context.newPage()
    await page.goto('http://127.0.0.1:3100/kalkulator/selisih-tanggal'); await fill(page, { start: '2024-03-09', end: '2024-03-11', mode: 'elapsed' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('2 hari')
    await fill(page, { start: '2024-11-02', end: '2024-11-04' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('2 hari')
    await page.goto('http://127.0.0.1:3100/kalkulator/usia'); await fill(page, fixtures[2].inputs); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(fixtures[2].primary)
    await page.goto('http://127.0.0.1:3100/kalkulator/durasi-kerja'); await fill(page, { start: '01:00', end: '04:00', endDay: 'same-day', break: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('3 jam 0 menit'); await context.close()
  }
})
test('twenty everyday tools hub search sitemap sources 404 and staging protections', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/sehari-hari')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(12); await listing.getByRole('button', { name: 'Muat lebih banyak' }).press('Enter'); await expect(listing.getByRole('link')).toHaveCount(20); await expect(listing.getByRole('button')).toHaveCount(0)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/sehari-hari'); await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')).toHaveCount(6)
  await page.screenshot({ path: info.outputPath('sehari-hari-20-alat.jpg'), quality: 75, fullPage: true })
  for (const f of fixtures) { await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible(); const r = await request.get(`/kalkulator/${f.slug}`); expect(r.headers()['x-robots-tag']).toBe('noindex, nofollow'); const html = await r.text(); expect(html).toContain('Presisi dan pembulatan'); expect(html).toContain('Sumber dan konvensi model') }
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(87)
  for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of ['ppn', 'shopee', 'tiktok-shop', 'pph-final-umkm', 'pph-21-bulanan']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`); await page.goto('/'); await page.getByRole('searchbox').fill(slug.replaceAll('-', ' ')); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('calendar forms holiday table and large fuel output fit all five widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(120000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const f of fixtures) {
      await open(page, f); if (f.slug === 'hari-kerja') { await page.getByRole('button', { name: 'Tambah libur', exact: true }).click(); await fill(page, { 'holidays.0.date': '2026-11-09' }) }
      await submit(page); await expect(result(page).locator('dd').first()).toHaveText(f.primary); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await page.goto('/sehari-hari'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 900 }); await open(page, fixtures[4]); await fill(page, { distance: '9999999999999', efficiency: '0.000001', price: '9999999999999' }); await submit(page)
  await expect(result(page)).toContainText('Rp99.999.999.999.980.000.000.000.001.000.000'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
test('all calendar methodology examples and source links render without JS', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const f of fixtures) { await page.goto(`http://127.0.0.1:3100/kalkulator/${f.slug}`); await expect(page.getByRole('heading', { name: f.title, exact: true })).toBeVisible(); await expect(page.locator('article')).toContainText('Contoh perhitungan'); await expect(page.locator('article')).toContainText('Presisi dan pembulatan'); await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0) }
  await context.close()
})
