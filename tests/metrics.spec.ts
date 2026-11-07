import { expect, test } from '@playwright/test'

const scenarios = [
  {
    slug: 'roas', title: 'Kalkulator ROAS',
    inputs: { 'Pendapatan teratribusi (Rp)': '400000', 'Biaya iklan (Rp)': '100000' },
    result: '4,00x', invalidLabel: 'Biaya iklan (Rp)', invalid: '0',
  },
  {
    slug: 'roas-impas', title: 'Kalkulator ROAS Impas',
    inputs: { 'Pendapatan teratribusi (Rp)': '100000', 'Biaya variabel sebelum iklan (Rp)': '70000' },
    result: '3,34x', invalidLabel: 'Pendapatan teratribusi (Rp)', invalid: '0',
    specialLabel: 'Biaya variabel sebelum iklan (Rp)', special: '100000', specialResult: 'Tidak ada ROAS impas berhingga',
  },
  {
    slug: 'acos', title: 'Kalkulator ACOS',
    inputs: { 'Biaya iklan (Rp)': '100000', 'Pendapatan teratribusi (Rp)': '400000' },
    result: '25,00%', invalidLabel: 'Biaya iklan (Rp)', invalid: '-1',
    specialLabel: 'Pendapatan teratribusi (Rp)', special: '0', specialResult: 'ACOS tidak terdefinisi',
  },
  {
    slug: 'konversi-toko', title: 'Kalkulator Konversi Toko',
    inputs: { 'Total kunjungan': '200', 'Kunjungan yang menghasilkan pembelian': '7' },
    result: '3,50%', invalidLabel: 'Kunjungan yang menghasilkan pembelian', invalid: '201',
  },
  {
    slug: 'nilai-pesanan-rata-rata', title: 'Kalkulator Nilai Pesanan Rata-rata',
    inputs: { 'Pendapatan produk setelah diskon saat pemesanan (Rp)': '100000', 'Jumlah pesanan berbayar selesai': '3' },
    result: 'Rp 33.333,33', invalidLabel: 'Jumlah pesanan berbayar selesai', invalid: '0',
  },
]

for (const scenario of scenarios) {
  test(`calculates and validates ${scenario.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.getByRole('heading', { level: 1, name: scenario.title })).toBeVisible()
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${scenario.slug}`)
    const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
    for (const [label, value] of Object.entries(scenario.inputs)) await page.getByLabel(label, { exact: true }).fill(value)
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    await expect(live.locator('dl > div').first().locator('dd')).toHaveText(scenario.result)
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 70 })
    if (scenario.specialLabel) {
      await page.getByLabel(scenario.specialLabel, { exact: true }).fill(scenario.special!)
      await page.getByRole('button', { name: 'Hitung', exact: true }).click()
      await expect(live.locator('dl > div').first().locator('dd')).toHaveText(scenario.specialResult!)
      await page.screenshot({ path: info.outputPath(`${scenario.slug}-khusus.jpg`), fullPage: true, quality: 70 })
    }
    const invalid = page.getByLabel(scenario.invalidLabel, { exact: true })
    await invalid.fill(scenario.invalid)
    await expect(live).toContainText('Isi semua kolom')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(invalid).toBeFocused()
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  })
}

test('lists only published Marketplace tools and searches the metrics across responsive widths', async ({ page, isMobile }, info) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
  await page.goto('/marketplace')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await expect(listing.getByRole('link')).toHaveCount(12)
  for (const { slug } of scenarios) await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  await page.screenshot({ path: info.outputPath('marketplace.jpg'), fullPage: true, quality: 70 })
  await page.goto('/')
  for (const { title, slug } of scenarios) {
    await page.getByRole('searchbox').fill(title)
    await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  }
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const { slug } of scenarios) {
      await page.goto(`/kalkulator/${slug}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
})
