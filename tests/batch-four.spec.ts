import { expect, test, type Page } from '@playwright/test'

const slugs = ['food-cost', 'harga-borongan', 'eoq', 'payback-period', 'berat-volumetrik']

async function fillIngredient(page: Page, index: number, price: string, pack: string, usage: string, unit: string) {
  const row = page.getByRole('group', { name: `Bahan ${index}`, exact: true })
  await row.getByLabel('Harga kemasan (Rp)', { exact: true }).fill(price)
  await row.getByLabel('Satuan bersama', { exact: true }).selectOption(unit)
  await row.getByLabel('Isi kemasan', { exact: true }).fill(pack)
  await row.getByLabel('Pemakaian resep', { exact: true }).fill(usage)
}

test('costs a multi-ingredient recipe and keeps row values after deletion', async ({ page, isMobile }, info) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
  await page.goto('/kalkulator/food-cost')
  await page.getByLabel('Jumlah porsi', { exact: true }).fill('4')
  await fillIngredient(page, 1, '20000', '1000', '250', 'g')
  await page.getByRole('button', { name: 'Tambah bahan', exact: true }).click()
  const row2 = page.getByRole('group', { name: 'Bahan 2', exact: true })
  await expect(row2.getByLabel('Harga kemasan (Rp)', { exact: true })).toBeFocused()
  await fillIngredient(page, 2, '12000', '0', '2', 'unit')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(row2.getByLabel('Isi kemasan', { exact: true })).toBeFocused()
  await expect(page.getByRole('form').getByRole('alert')).toContainText('Isi kemasan')
  await row2.getByLabel('Isi kemasan', { exact: true }).fill('6')
  await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
  const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
  await expect(live.locator('dl > div').first().locator('dd')).toHaveText(/^Rp\s*2\.250$/)
  await expect(live).toContainText(/Rp\s*9\.000/)
  await page.screenshot({ path: info.outputPath('food-cost.jpg'), fullPage: true, quality: 70 })
  await page.getByRole('button', { name: 'Hapus bahan 1', exact: true }).click()
  const survivor = page.getByRole('group', { name: 'Bahan 1', exact: true })
  await expect(survivor.getByLabel('Harga kemasan (Rp)', { exact: true })).toHaveValue('12000')
  await expect(survivor.getByLabel('Isi kemasan', { exact: true })).toHaveValue('6')
  await expect(survivor.getByLabel('Harga kemasan (Rp)', { exact: true })).toBeFocused()
  await expect(live).toContainText('Isi semua kolom')
})

test('calculates payback over editable signed cash-flow periods', async ({ page, isMobile }, info) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
  await page.goto('/kalkulator/payback-period')
  await page.getByLabel('Investasi awal (Rp)', { exact: true }).fill('100')
  await page.getByLabel('Satuan periode', { exact: true }).selectOption('tahun')
  const flows = ['30', '-10', '50', '60']
  for (const [index, amount] of flows.entries()) {
    if (index > 0) await page.getByRole('button', { name: 'Tambah periode', exact: true }).click()
    await page.getByRole('group', { name: `Periode ${index + 1}`, exact: true }).getByLabel('Arus kas bersih (Rp)', { exact: true }).fill(amount)
  }
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
  await expect(live.locator('dl > div').first().locator('dd')).toHaveText('3,5 tahun')
  await page.screenshot({ path: info.outputPath('payback-period.jpg'), fullPage: true, quality: 70 })
  const last = page.getByRole('group', { name: 'Periode 4', exact: true }).getByLabel('Arus kas bersih (Rp)', { exact: true })
  await last.fill('0')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(live.locator('dl > div').first().locator('dd')).toHaveText('Belum kembali dalam horizon yang diisi')
  await last.fill('NaN')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(last).toBeFocused()
  await expect(last).toHaveAttribute('aria-invalid', 'true')
  await last.fill('60')
  await page.getByRole('button', { name: 'Hapus periode 1', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Periode 1', exact: true }).getByLabel('Arus kas bersih (Rp)', { exact: true })).toHaveValue('-10')
})

const examples = [
  {
    slug: 'harga-borongan',
    inputs: { 'Jam kerja proyek': '2,5', 'Biaya tenaga kerja per jam (Rp)': '40000', 'Material proyek (Rp)': '30000', 'Overhead proyek (Rp)': '10000', 'Target laba tetap (Rp)': '25000' },
    result: /^Rp\s*165\.000$/,
    invalidLabel: 'Jam kerja proyek', invalid: '-1',
  },
  {
    slug: 'eoq',
    inputs: { 'Permintaan tahunan (unit)': '1000', 'Biaya per pesanan (Rp)': '100', 'Biaya simpan per unit per tahun (Rp)': '20' },
    result: '100 unit',
    invalidLabel: 'Biaya simpan per unit per tahun (Rp)', invalid: '0',
  },
  {
    slug: 'berat-volumetrik',
    inputs: { 'Panjang (cm)': '40', 'Lebar (cm)': '30', 'Tinggi (cm)': '20', 'Divisor kurir (cm³/kg)': '6000', 'Berat aktual (kg)': '3' },
    result: '4 kg',
    invalidLabel: 'Divisor kurir (cm³/kg)', invalid: '0',
  },
]

for (const example of examples) {
  test(`calculates and validates ${example.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
    await page.goto(`/kalkulator/${example.slug}`)
    for (const [label, value] of Object.entries(example.inputs)) await page.getByLabel(label, { exact: true }).fill(value)
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
    await expect(live.locator('dl > div').first().locator('dd')).toHaveText(example.result)
    await page.screenshot({ path: info.outputPath(`${example.slug}.jpg`), fullPage: true, quality: 70 })
    const invalid = page.getByLabel(example.invalidLabel, { exact: true })
    await invalid.fill(example.invalid)
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(invalid).toBeFocused()
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    if (example.slug === 'eoq') {
      await invalid.fill('20')
      await page.getByLabel('Permintaan tahunan (unit)', { exact: true }).fill('0')
      await page.getByRole('button', { name: 'Hitung', exact: true }).click()
      await expect(live.locator('dl > div').first().locator('dd')).toHaveText('Kasus degenerat: optimum kontinu nol')
    }
  })
}

test('serves the Marketplace hub and published batch with canonical and staging protection', async ({ page, request, isMobile }, info) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
  const response = await page.goto('/marketplace')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/marketplace')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalkulator marketplace')
  await expect(page.getByRole('region', { name: 'Kalkulator tersedia' }).getByRole('link')).toHaveCount(11)
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Marketplace' })).toBeVisible()
  await page.screenshot({ path: info.outputPath('marketplace.jpg'), fullPage: true, quality: 70 })
  const sitemap = await request.get('/sitemap.xml')
  const xml = await sitemap.text()
  expect(xml.match(/<loc>/g)).toHaveLength(50)
  expect(xml).toContain('<loc>https://kalkulatorharga.com/marketplace</loc>')
  for (const slug of slugs) expect(xml).toContain(`<loc>https://kalkulatorharga.com/kalkulator/${slug}</loc>`)
  for (const slug of ['tiktok', 'tiktok-shop', 'shopee']) expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404)
  await page.goto('/')
  for (const slug of slugs) {
    await page.getByRole('searchbox').fill(slug.replaceAll('-', ' '))
    await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  }
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const path of ['/marketplace', ...slugs.map(slug => `/kalkulator/${slug}`)]) {
      const response = await page.goto(path)
      expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
})
