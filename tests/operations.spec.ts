import { expect, test } from '@playwright/test'

const period = { 'Tanggal awal': '2026-10-01', 'Tanggal akhir': '2026-10-31' }
const scenarios = [
  {
    slug: 'harga-pokok-penjualan', title: 'Kalkulator Harga Pokok Penjualan',
    inputs: { ...period, 'Persediaan awal (Rp)': '125000', 'Pembelian bersih (Rp)': '84000', 'Persediaan akhir (Rp)': '59000' },
    expected: /^Rp\s*150\.000$/, invalidLabel: 'Persediaan akhir (Rp)', invalid: '209001',
    error: 'Persediaan akhir tidak boleh melebihi barang tersedia.',
  },
  {
    slug: 'yield-bahan', title: 'Kalkulator Yield Bahan',
    inputs: { 'Satuan berat': 'kg', 'Berat kotor': '2,4', 'Berat bersih': '1.75' },
    expected: '72,92%', detail: '0,65 kg', invalidLabel: 'Berat bersih', invalid: '2.5',
    error: 'Berat bersih tidak boleh melebihi berat kotor.',
  },
  {
    slug: 'penyusutan-garis-lurus', title: 'Kalkulator Penyusutan Garis Lurus',
    inputs: { 'Biaya perolehan (Rp)': '100007', 'Nilai residu (Rp)': '10000', 'Umur manfaat (tahun)': '4' },
    expected: /^Rp\s*22\.502$/, invalidLabel: 'Umur manfaat (tahun)', invalid: '0',
    error: 'Umur manfaat harus lebih dari nol tahun.',
  },
  {
    slug: 'arus-kas', title: 'Kalkulator Arus Kas',
    inputs: { ...period, 'Saldo awal (Rp)': '35000', 'Kas masuk (Rp)': '48000', 'Kas keluar (Rp)': '91000' },
    expected: /^-Rp\s*8\.000$/, warning: 'saldo akhir negatif', invalidLabel: 'Tanggal akhir', invalid: '2026-09-30',
    error: 'Tanggal akhir harus sama dengan atau setelah tanggal awal.',
  },
  {
    slug: 'utilisasi-kapasitas', title: 'Kalkulator Utilisasi Kapasitas',
    inputs: { ...period, 'Satuan produksi': 'kg', 'Produksi aktual': '98,5', 'Kapasitas acuan': '80' },
    expected: '123,13%', warning: 'melampaui kapasitas acuan', invalidLabel: 'Kapasitas acuan', invalid: '0',
    error: 'Kapasitas acuan harus lebih dari nol.',
  },
]

for (const scenario of scenarios) {
  test(`calculates and validates ${scenario.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${scenario.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: scenario.title })).toBeVisible()
    const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
    await expect(live).toContainText('Isi semua kolom')
    for (const [label, value] of Object.entries(scenario.inputs)) {
      const field = page.getByLabel(label, { exact: true })
      if (label === 'Satuan berat') await field.selectOption(value)
      else await field.fill(value)
    }
    const field = page.getByLabel(scenario.invalidLabel, { exact: true })
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    await expect(live.getByText(scenario.expected, { exact: true })).toBeVisible()
    if (scenario.detail) await expect(live.getByText(scenario.detail)).toBeVisible()
    if (scenario.warning) await expect(live).toContainText(scenario.warning)
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 70 })

    await field.fill(scenario.invalid)
    await expect(live).toContainText('Isi semua kolom')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(field).toBeFocused()
    await expect(field).toHaveAccessibleDescription(new RegExp(scenario.error.slice(0, -1)))
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
    await expect(live).toContainText('Periksa kolom yang ditandai.')
  })
}

test('finds the operations batch and verifies all five layout widths', async ({ page, isMobile }) => {
  await page.goto('/')
  for (const { slug, title } of scenarios) {
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
