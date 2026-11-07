import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; mode?: string; title: string; inputs: Record<string, string>; primary: string; detail: string; invalid: string; bad: string }
const price = { production: '100', hours: '2', hourly: '100', overhead: '50', usage: '50', deliverables: '1' }
const earnings = { eligibleViews: '10000', rpm: '100', sponsor: '200', affiliate: '30', gift: '20', incomeBasis: 'assumed' }
const account = { followers: '1000', views: '3000', videos: '3', likes: '100', comments: '20', saves: '10', shares: '5', basis: 'followers' }
const comparison = { basis: 'followers', followersA: '1000', viewsA: '1000', interactionsA: '100', videosA: '3', followersB: '2000', viewsB: '800', interactionsB: '100', videosB: '2' }
const fixtures: Fixture[] = [
  { slug: 'ctr', title: 'Kalkulator CTR', inputs: { clicks: '5', impressions: '100' }, primary: '5,00%', detail: '100', invalid: 'impressions', bad: '0' },
  { slug: 'estimasi-youtube', title: 'Kalkulator Estimasi Pendapatan YouTube', inputs: { views: '10000', rpm: '1500.25' }, primary: 'Rp15.002,50', detail: 'Rp1.500,25', invalid: 'rpm', bad: '1.001' },
  { slug: 'tiktok', mode: 'earnings', title: 'Kalkulator TikTok Kreator', inputs: earnings, primary: 'Rp1.250,00', detail: 'Rp1.000,00', invalid: 'rpm', bad: '-1' },
  { slug: 'tiktok', mode: 'account', title: 'Kalkulator TikTok Kreator', inputs: account, primary: '13,50%', detail: '1.000,00', invalid: 'videos', bad: '-1' },
  { slug: 'tiktok', mode: 'ratecard', title: 'Kalkulator TikTok Kreator', inputs: { ...price, lowMargin: '20', highMargin: '30', slots: '2' }, primary: 'Rp488', detail: 'Rp550', invalid: 'highMargin', bad: '10' },
  { slug: 'tiktok', mode: 'comparison', title: 'Kalkulator TikTok Kreator', inputs: comparison, primary: '−5,00 poin persentase', detail: '+66,67', invalid: 'followersA', bad: '-1' },
  { slug: 'tarif-endorsement', title: 'Kalkulator Tarif Endorsement', inputs: { ...price, margin: '20' }, primary: 'Rp488', detail: '20,09%', invalid: 'margin', bad: '100' },
  { slug: 'waktu-tonton', title: 'Kalkulator Waktu Tonton', inputs: { views: '1000', minutes: '1.5' }, primary: '25,00 jam', detail: '1.500,00 menit', invalid: 'minutes', bad: '0.00001' },
]
async function fill(page: Page, inputs: Record<string, string>) {
  for (const [name, value] of Object.entries(inputs)) {
    const field = page.locator(`[name="${name}"]`)
    if (name === 'basis' || name === 'incomeBasis') await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
const modeSelect = (page: Page) => page.getByLabel('Pilih modul TikTok Kreator', { exact: true })
async function open(page: Page, fixture: Fixture) {
  await page.goto(`/kalkulator/${fixture.slug}`)
  if (fixture.mode) await modeSelect(page).selectOption(fixture.mode)
  await fill(page, fixture.inputs)
}
for (const f of fixtures) test(`creator form SEO result invalid: ${f.slug}-${f.mode ?? 'main'}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`)
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Media Sosial' })).toHaveAttribute('href', '/media-sosial')
  if (f.mode) await modeSelect(page).selectOption(f.mode)
  await expect(result(page)).toContainText('Isi semua kolom')
  await submit(page); await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  await expect(page.locator(`[name="${Object.keys(f.inputs)[0]}"]`)).toBeFocused()
  await fill(page, f.inputs); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
  await expect(result(page).locator('dd').first()).toHaveText(f.primary); await expect(result(page)).toContainText(f.detail)
  if (f.mode === 'comparison') {
    const region = page.getByRole('region', { name: 'Perbandingan metrik manual A/B', exact: true })
    await region.focus(); await expect(region).toBeFocused(); await region.press('ArrowRight'); await region.evaluate(node => { node.scrollLeft = 0 })
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(6)
    await expect(page.getByRole('table').locator('tbody tr').first().locator('th,td')).toHaveText(['Pengikut', '1.000', '2.000', '+1.000'])
    await region.screenshot({ path: info.outputPath('tiktok-perbandingan-tabel.jpg'), quality: 75 })
  }
  const name = `${f.slug}-${f.mode ?? 'main'}`
  await page.screenshot({ path: info.outputPath(`${name}.jpg`), fullPage: true, quality: 75 })
  await result(page).screenshot({ path: info.outputPath(`${name}-hasil.jpg`), quality: 75 })
  await page.locator(`[name="${f.invalid}"]`).fill(f.bad)
  await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.getByRole('table')).toHaveCount(0)
  await submit(page)
  const invalid = page.locator(`[name="${f.invalid}"]`)
  await expect(invalid).toBeFocused(); await expect(invalid).toHaveAttribute('aria-invalid', 'true')
  expect((await invalid.getAttribute('aria-describedby'))!.split(' ').length).toBeGreaterThanOrEqual(2)
  await page.screenshot({ path: info.outputPath(`${name}-invalid.jpg`), fullPage: true, quality: 75 })
})
test('TikTok native mode selector keeps focus and clears previous module state', async ({ page }) => {
  await open(page, fixtures[2]); await submit(page); await expect(result(page)).toContainText('Rp1.250,00')
  const select = modeSelect(page); await select.focus(); await select.selectOption('account'); await expect(select).toBeFocused()
  await expect(result(page)).toContainText('Isi semua kolom'); await expect(page.locator('[name=followers]')).toHaveValue('')
  const panel = await select.getAttribute('aria-controls'); await expect(page.locator(`[id="${panel}"]`)).toBeVisible()
  await fill(page, account); await submit(page); await expect(result(page)).toContainText('13,50%')
  await select.focus(); await select.press('Tab'); await expect(page.locator('[name=followers]')).toBeFocused(); await page.locator('[name=followers]').press('Shift+Tab'); await expect(select).toBeFocused(); await select.selectOption('earnings'); await expect(select).toHaveValue('earnings')
  await expect(page.locator('[name=eligibleViews]')).toHaveValue(''); await expect(result(page)).toContainText('Isi semua kolom')
  for (const mode of ['ratecard', 'comparison', 'earnings']) { await select.selectOption(mode); await expect(select).toBeFocused(); await expect(result(page).locator('dd')).toHaveCount(0) }
})
test('CTR zero over100 tiny and YouTube zero half-sen tiny results', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[0])
  await fill(page, { clicks: '135', impressions: '100' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('135,00%'); await expect(result(page)).toContainText('Periksa kesamaan definisi')
  await result(page).screenshot({ path: info.outputPath('ctr-melebihi-impresi.jpg'), quality: 75 })
  await fill(page, { clicks: '1', impressions: '9999999999999' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,01%')
  await fill(page, { clicks: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,00%')
  await open(page, fixtures[1]); await fill(page, { views: '1', rpm: '5' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,01')
  await fill(page, { rpm: '0.01' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<Rp0,01')
  await result(page).screenshot({ path: info.outputPath('youtube-subpresisi.jpg'), quality: 75 })
  await fill(page, { rpm: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,00')
  await result(page).screenshot({ path: info.outputPath('youtube-rpm-nol.jpg'), quality: 75 })
})
test('TikTok income reconciles half-sen and disclosed realized versus modeled sources', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[2])
  await fill(page, { eligibleViews: '1', rpm: '5', sponsor: '0.01', affiliate: '0.02', gift: '0.03', incomeBasis: 'realized' }); await submit(page)
  await expect(result(page).locator('dd')).toHaveText(['Rp0,07', 'Rp0,01', 'Rp0,01', 'Rp0,02', 'Rp0,03']); await expect(result(page)).toContainText('realisasi neto yang Anda masukkan')
  await result(page).screenshot({ path: info.outputPath('tiktok-sumber-terpisah-pembulatan.jpg'), quality: 75 })
  await fill(page, { eligibleViews: '1', rpm: '0.01', sponsor: '0', affiliate: '0', gift: '0' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('<Rp0,01')
  await fill(page, { rpm: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,00')
})
test('TikTok account basis undefined and comparison unrounded signed differences', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[3]); await submit(page)
  await page.locator('[name=basis]').selectOption('views'); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('4,50%')
  await fill(page, { views: '0', videos: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Tidak terdefinisi (pembagi nol)'); await expect(result(page).locator('dd').nth(2)).toHaveText('Tidak terdefinisi (pembagi nol)')
  await result(page).screenshot({ path: info.outputPath('tiktok-akun-pembagi-nol.jpg'), quality: 75 })
  await modeSelect(page).selectOption('comparison'); await fill(page, { ...comparison, followersA: '32', followersB: '33', interactionsA: '1', interactionsB: '1' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('−0,09 poin persentase')
  await expect(page.getByRole('table').locator('tbody tr').nth(4).locator('td')).toHaveText(['3,13%', '3,03%', '−0,09 poin persentase'])
  await result(page).screenshot({ path: info.outputPath('tiktok-selisih-rasio-eksak.jpg'), quality: 75 })
  await fill(page, { followersA: '0', videosB: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Tidak terdefinisi (pembagi nol)'); await expect(page.getByRole('table')).toBeVisible()
})
test('quote margin rights pass-through zero and watch time ledger boundaries', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page, fixtures[6])
  await fill(page, { production: '0', hours: '0.01', hourly: '1', overhead: '0', usage: '0', margin: '0' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Rp1'); await expect(result(page)).toContainText('99,00%')
  await result(page).screenshot({ path: info.outputPath('endorsement-minimum-rupiah.jpg'), quality: 75 })
  await fill(page, { hours: '0', hourly: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0'); await expect(result(page)).toContainText('Tidak terdefinisi')
  await page.goto('/kalkulator/tiktok'); await modeSelect(page).selectOption('ratecard'); await fill(page, { ...price, lowMargin: '20', highMargin: '30', slots: '0' }); await submit(page)
  await expect(result(page)).toContainText('Rp488'); await expect(result(page).locator('dd').nth(4)).toHaveText('Rp0'); await expect(result(page).locator('dd').nth(5)).toHaveText('Rp0')
  await open(page, fixtures[7]); await fill(page, { views: '3', minutes: '0.1' }); await submit(page)
  await expect(result(page).locator('dd')).toHaveText(['0,01 jam', '0,30 menit'])
  await fill(page, { views: '1', minutes: '0.0001' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,01 jam (positif)')
  await result(page).screenshot({ path: info.outputPath('waktu-tonton-subpresisi.jpg'), quality: 75 })
  await fill(page, { views: '0' }); await submit(page); await expect(result(page).locator('dd')).toHaveText(['0,00 jam', '0,00 menit'])
})
test('creator catalog hub ten tools canonical search sitemap and staging protections', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); const response = await page.goto('/media-sosial'); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' }); await expect(listing.getByRole('link')).toHaveCount(10); await expect(listing.getByRole('button')).toHaveCount(0)
  await expect(listing.locator('a[href="/kalkulator/tiktok"]')).toHaveCount(1); await expect(listing.locator('a[href="/kalkulator/tiktok-shop"]')).toHaveCount(0)
  await page.screenshot({ path: info.outputPath('media-sosial-10-alat.jpg'), quality: 75, fullPage: true })
  for (const f of fixtures.filter(x => !x.mode || x.mode === 'earnings')) { await page.goto('/'); await page.getByRole('searchbox').fill(f.title); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible() }
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(77)
  for (const slug of ['ctr', 'estimasi-youtube', 'tiktok', 'tarif-endorsement', 'waktu-tonton']) expect(xml).toContain(`/kalkulator/${slug}</loc>`)
  for (const slug of ['tiktok-shop', 'estimasi-tiktok-kreator', 'shopee']) { expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`); await page.goto('/'); await page.getByRole('searchbox').fill(slug.replaceAll('-', ' ')); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0) }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('all creator modes forms table results and hub fit all design widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(120000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const f of fixtures) { await open(page, f); await submit(page); await expect(result(page).locator('dd').first()).toHaveText(f.primary); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true) }
    await page.goto('/media-sosial'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
})
test('creator maximum amounts and signed tiny comparison fit320', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 900 }); await open(page, fixtures[2]); await fill(page, { eligibleViews: '9999999999999', rpm: '9999999999999.99' }); await submit(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('tiktok-revenue-maksimum-320.jpg'), quality: 75 })
  await modeSelect(page).selectOption('comparison'); await fill(page, { ...comparison, followersA: '9999999999998', followersB: '9999999999999', interactionsA: '1', interactionsB: '1' }); await submit(page)
  await expect(result(page).locator('dd').first()).toContainText('negatif'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('tiktok-perbandingan-subpresisi-320.jpg'), quality: 75 })
  await page.goto('/kalkulator/tarif-endorsement'); await fill(page, { production: '9999999999999', hours: '999999.99', hourly: '9999999999999', overhead: '9999999999999', usage: '9999999999999', deliverables: '1000', margin: '99.9999' }); await submit(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('endorsement-maksimum-320.jpg'), quality: 75 })
})
test('all creator routes including four TikTok methodologies are server rendered', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    for (const slug of ['ctr', 'estimasi-youtube', 'tiktok', 'tarif-endorsement', 'waktu-tonton']) {
      await page.goto(`/kalkulator/${slug}`)
      for (const name of ['Cara menghitung', 'Contoh perhitungan', 'Presisi dan pembulatan', 'Sumber rumus', 'Pertanyaan tentang perhitungan ini']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
      expect(await page.locator('article a[href^="https://"]').count()).toBeGreaterThanOrEqual(1)
      if (slug === 'tiktok') for (const name of ['Modul: Simulasi pendapatan', 'Modul: Engagement dan metrik akun', 'Modul: Rentang penawaran sponsor', 'Modul: Perbandingan manual A/B']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    }
  } finally { await context.close() }
})
