import { supplementalPaths } from '../lib/supplemental/routes'
import { legacyPaths } from '../lib/legacy/routes'
import { test, expect, type Page } from '@playwright/test'
type Fixture = { slug: string; title: string; inputs: Record<string, string>; primary: string; detail: string; invalid: string; bad: string }
const fixtures: Fixture[] = [
  { slug: 'engagement-rate', title: 'Kalkulator Engagement Rate', inputs: { likes: '100', comments: '20', saves: '10', shares: '5', basis: 'followers', denominator: '1000' }, primary: '13,50%', detail: '135', invalid: 'denominator', bad: '0' },
  { slug: 'pertumbuhan-pengikut', title: 'Kalkulator Pertumbuhan Pengikut', inputs: { start: '1000', end: '1250' }, primary: '+25,00%', detail: '+250', invalid: 'start', bad: '-1' },
  { slug: 'cpm', title: 'Kalkulator CPM Iklan', inputs: { spend: '150000', impressions: '50000' }, primary: 'Rp3.000,00', detail: 'Rp150.000', invalid: 'impressions', bad: '0' },
  { slug: 'cpc', title: 'Kalkulator CPC Iklan', inputs: { spend: '100000', clicks: '250' }, primary: 'Rp400,00', detail: 'Rp100.000', invalid: 'clicks', bad: '0' },
  { slug: 'cpa', title: 'Kalkulator CPA Iklan', inputs: { spend: '500000', action: 'sale', acquisitions: '20' }, primary: 'Rp25.000,00', detail: 'Rp500.000', invalid: 'acquisitions', bad: '0' },
]
async function fill(page: Page, inputs: Record<string, string>) {
  for (const [name, value] of Object.entries(inputs)) {
    const field = page.locator(`[name="${name}"]`)
    if (name === 'basis' || name === 'action') await field.selectOption(value)
    else await field.fill(value)
  }
}
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan' })
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
for (const f of fixtures) test(`social metric form result validation and SEO: ${f.slug}`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${f.slug}`)
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${f.slug}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(f.title)
  await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Media Sosial' })).toHaveAttribute('href', '/media-sosial')
  await expect(result(page)).toContainText('Isi semua kolom')
  await submit(page)
  await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  await expect(page.locator(`[name="${Object.keys(f.inputs)[0]}"]`)).toBeFocused()
  await fill(page, f.inputs)
  await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
  await expect(result(page).locator('dd').first()).toHaveText(f.primary)
  await expect(result(page)).toContainText(f.detail)
  await expect(result(page).locator('[aria-live=polite]')).toHaveAttribute('aria-atomic', 'true')
  await page.screenshot({ path: info.outputPath(`${f.slug}.jpg`), fullPage: true, quality: 75 })
  await result(page).screenshot({ path: info.outputPath(`${f.slug}-hasil.jpg`), quality: 75 })
  await page.locator(`[name="${f.invalid}"]`).fill(f.bad)
  await expect(result(page)).toContainText('Isi semua kolom')
  await expect(result(page).locator('dd')).toHaveCount(0)
  await submit(page)
  const invalid = page.locator(`[name="${f.invalid}"]`)
  await expect(invalid).toBeFocused()
  await expect(invalid).toHaveAttribute('aria-invalid', 'true')
  const descriptions = (await invalid.getAttribute('aria-describedby'))!.split(' ')
  expect(descriptions.length).toBeGreaterThanOrEqual(2)
  await expect(page.locator(`[id="${descriptions.at(-1)}"]`)).toContainText(f.slug === 'pertumbuhan-pengikut' ? 'bilangan bulat' : 'lebih dari nol')
  await page.screenshot({ path: info.outputPath(`${f.slug}-invalid.jpg`), fullPage: true, quality: 75 })
})
test('engagement basis switch exact over100 warning zero and tiny states', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/engagement-rate'); await fill(page, fixtures[0].inputs); await submit(page)
  await page.locator('[name=basis]').selectOption('reach')
  await expect(result(page)).toContainText('Isi semua kolom')
  await page.locator('[name=denominator]').fill('100'); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('135,00%')
  await expect(result(page)).toContainText('Reach (akun yang dijangkau)')
  await expect(result(page)).toContainText('melebihi 100% sebelum pembulatan')
  await result(page).screenshot({ path: info.outputPath('engagement-di-atas-100.jpg'), quality: 75 })
  await fill(page, { likes: '9999999999999', comments: '0', saves: '0', shares: '0', denominator: '9999999999998' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('100,00%'); await expect(result(page)).toContainText('melebihi 100% sebelum pembulatan')
  await fill(page, { likes: '1', denominator: '32' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('3,13%')
  await fill(page, { denominator: '9999999999999' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<0,01%')
  await result(page).screenshot({ path: info.outputPath('engagement-subpresisi.jpg'), quality: 75 })
  await fill(page, { likes: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,00%')
  await result(page).screenshot({ path: info.outputPath('engagement-nol.jpg'), quality: 75 })
})
test('growth negative unchanged zero base and tiny signed percentage states', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/kalkulator/pertumbuhan-pengikut')
  await fill(page, { start: '1000', end: '800' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('−20,00%'); await expect(result(page)).toContainText('−200')
  await result(page).screenshot({ path: info.outputPath('pengikut-turun.jpg'), quality: 75 })
  await fill(page, { start: '32', end: '31' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−3,13%')
  await fill(page, { start: '0', end: '200' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Tidak terdefinisi (pengikut awal nol)'); await expect(result(page)).toContainText('+200')
  await result(page).screenshot({ path: info.outputPath('pengikut-basis-nol.jpg'), quality: 75 })
  await fill(page, { end: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Tidak terdefinisi (pengikut awal nol)')
  await fill(page, { start: '1000', end: '1000' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('0,00%')
  await result(page).screenshot({ path: info.outputPath('pengikut-tetap.jpg'), quality: 75 })
  await fill(page, { start: '9999999999999', end: '9999999999998' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Antara −0,01% dan 0% (negatif)'); await expect(result(page)).toContainText('−1')
  await result(page).screenshot({ path: info.outputPath('pengikut-negatif-subpresisi.jpg'), quality: 75 })
  await fill(page, { start: '9999999999998', end: '9999999999999' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Antara 0% dan +0,01% (positif)')
})
for (const [slug, count, divisor] of [['cpm', 'impressions', 1000], ['cpc', 'clicks', 1], ['cpa', 'acquisitions', 1]] as const)
  test(`paid cost rounding zero tiny and choice: ${slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto(`/kalkulator/${slug}`)
    if (slug === 'cpa') await fill(page, { action: 'lead' })
    await fill(page, { spend: '1', [count]: String(3 * divisor) }); await submit(page)
    await expect(result(page).locator('dd').first()).toHaveText('Rp0,33')
    if (slug === 'cpa') {
      await expect(result(page).locator('dt').first()).toHaveText('CPA per lead teratribusi')
      await page.locator('[name=action]').selectOption('signup'); await expect(result(page)).toContainText('Isi semua kolom'); await submit(page)
      await expect(result(page).locator('dt').first()).toHaveText('CPA per pendaftaran teratribusi')
    }
    await fill(page, { [count]: String(8 * divisor) }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,13')
    await result(page).screenshot({ path: info.outputPath(`${slug}-pembulatan.jpg`), quality: 75 })
    await fill(page, { [count]: String(200 * divisor) }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,01')
    await fill(page, { [count]: String(200 * divisor + 1) }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('<Rp0,01')
    await result(page).screenshot({ path: info.outputPath(`${slug}-subpresisi.jpg`), quality: 75 })
    await fill(page, { spend: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp0,00')
    await result(page).screenshot({ path: info.outputPath(`${slug}-nol-biaya.jpg`), quality: 75 })
    await fill(page, { [count]: '0' }); await submit(page)
    await expect(page.locator(`[name=${count}]`)).toBeFocused(); await expect(result(page).locator('dd')).toHaveCount(0)
  })
test('social hub navigation category search sitemap and unpublished protections', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Navigasi utama' })
  await expect(nav.getByRole('link', { name: 'Media Sosial', exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Kategori kalkulator' }).getByRole('link', { name: 'Media Sosial', exact: true }).click()
  await expect(page).toHaveURL('/media-sosial')
  await expect(nav.getByRole('link', { name: 'Media Sosial', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalkulator media sosial')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/media-sosial')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await expect(listing.getByRole('link')).toHaveCount(10); await expect(listing.getByRole('button', { name: 'Muat lebih banyak' })).toHaveCount(0)
  for (const f of fixtures) await expect(listing.locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible()
  await page.screenshot({ path: info.outputPath('media-sosial-hub.jpg'), fullPage: true, quality: 75 })
  const hubResponse = await request.get('/media-sosial'); expect(hubResponse.headers()['x-robots-tag']).toBe('noindex, nofollow')
  for (const query of ['media sosial', ...fixtures.map(f => f.title)]) {
    await page.goto('/'); await page.getByRole('searchbox').fill(query)
    if (query === 'media sosial') { await expect(page.getByRole('status')).toHaveText('10 kalkulator ditemukan'); await expect(page.getByRole('region', { name: 'Hasil pencarian' }).getByRole('link')).toHaveCount(10) }
    else { const f = fixtures.find(f => f.title === query)!; await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${f.slug}"]`)).toBeVisible() }
  }
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length + supplementalPaths.length)
  expect(xml).toContain('<loc>https://kalkulatorharga.com/media-sosial</loc>')
  for (const f of fixtures) expect(xml).toContain(`/kalkulator/${f.slug}</loc>`)
  for (const slug of ['kalkulator-tidak-ada']) {
    expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404); expect(xml).not.toContain(`/kalkulator/${slug}</loc>`)
    await page.goto('/'); await page.getByRole('searchbox').fill(slug.replaceAll('-', ' ')); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0)
  }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('five social forms results hub and navigation fit all design widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(90000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const f of fixtures) {
      await page.goto(`/kalkulator/${f.slug}`); await fill(page, f.inputs); await submit(page)
      await expect(result(page).locator('dd').first()).toHaveText(f.primary)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      const form = await page.getByRole('form').boundingBox(), panel = await result(page).boundingBox()
      expect(form && panel && (width < 768 ? panel.y > form.y : panel.x > form.x && panel.y === form.y)).toBe(true)
    }
    await page.goto('/media-sosial'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')).toHaveCount(7)
  }
})
test('maximum social values and negative subprecision fit 320px', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 900 }); await page.goto('/kalkulator/engagement-rate')
  await fill(page, { ...fixtures[0].inputs, likes: '9999999999999', comments: '9999999999999', saves: '9999999999999', shares: '9999999999999', denominator: '1' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('3.999.999.999.999.600,00%')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('engagement-maksimum-320.jpg'), quality: 75 })
  await page.goto('/kalkulator/cpm'); await fill(page, { spend: '9999999999999', impressions: '1' }); await submit(page)
  await expect(result(page).locator('dd').first()).toHaveText('Rp9.999.999.999.999.000,00')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('cpm-maksimum-320.jpg'), quality: 75 })
  await page.goto('/kalkulator/pertumbuhan-pengikut'); await fill(page, { start: '9999999999999', end: '9999999999998' }); await submit(page)
  await expect(result(page).locator('dd').first()).toContainText('negatif')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await result(page).screenshot({ path: info.outputPath('pengikut-subpresisi-320.jpg'), quality: 75 })
})
test('social methodology examples sources FAQs and hub are server rendered', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    for (const f of fixtures) {
      await page.goto(`/kalkulator/${f.slug}`)
      for (const name of ['Cara menghitung', 'Contoh perhitungan', 'Presisi dan pembulatan', 'Sumber rumus', 'Pertanyaan tentang perhitungan ini']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
      expect(await page.locator('article a[href^="https://"]').count()).toBeGreaterThanOrEqual(1)
      await expect(page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Media Sosial' })).toBeVisible()
    }
    await page.goto('/media-sosial'); await expect(page.getByRole('region', { name: 'Kalkulator tersedia' }).getByRole('link')).toHaveCount(10)
  } finally { await context.close() }
})
