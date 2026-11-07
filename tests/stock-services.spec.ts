import { expect, test } from '@playwright/test'

const month = '2026-04'
const scenarios = [
  {
    slug: 'perputaran-persediaan', title: 'Kalkulator Perputaran Persediaan',
    inputs: { 'Tanggal awal': '2026-04-01', 'Tanggal akhir': '2026-04-30', 'Harga pokok penjualan (Rp)': '90000', 'Persediaan awal (Rp)': '20000', 'Persediaan akhir (Rp)': '40000' },
    expected: '3 kali', detail: '10 hari', invalidLabel: 'Persediaan awal (Rp)', invalid: '-1',
    specialLabel: 'Harga pokok penjualan (Rp)', special: '0', specialResult: '0 kali',
    specialDetail: 'Tidak terdefinisi saat harga pokok penjualan nol',
  },
  {
    slug: 'reorder-point', title: 'Kalkulator Reorder Point',
    inputs: { 'Permintaan rata-rata (unit/hari)': '2,5', 'Lead time (hari)': '3,25', 'Stok aman (unit)': '1.1' },
    expected: '10 unit', invalidLabel: 'Lead time (hari)', invalid: '-1',
  },
  {
    slug: 'runway-kas', title: 'Kalkulator Runway Kas',
    inputs: { 'Bulan acuan': month, 'Kas tersedia saat awal proyeksi (Rp)': '100000', 'Kas keluar per bulan (Rp)': '40000', 'Kas masuk per bulan (Rp)': '10000' },
    expected: '3,33 bulan', invalidLabel: 'Kas tersedia saat awal proyeksi (Rp)', invalid: '-1',
    specialLabel: 'Kas masuk per bulan (Rp)', special: '40000', specialResult: 'Tidak ada burn bersih',
    specialDetail: 'Tidak terbatas dalam model konstan',
  },
  {
    slug: 'biaya-layanan', title: 'Kalkulator Biaya Layanan',
    inputs: { 'Bulan acuan': month, 'Biaya tetap bulanan (Rp)': '100001', 'Transaksi tertagih per bulan': '3', 'Biaya variabel per transaksi (Rp)': '2000' },
    expected: /^Rp\s*35\.334$/, detail: /^Rp\s*106\.001$/, invalidLabel: 'Transaksi tertagih per bulan', invalid: '0',
  },
  {
    slug: 'tarif-freelance', title: 'Kalkulator Tarif Freelance',
    inputs: { 'Target penghasilan pemilik per tahun sebelum pajak (Rp)': '120000000', 'Biaya operasi tahunan (Rp)': '12000001', 'Jam tertagih per tahun': '1000,5' },
    expected: /^Rp\s*131\.935$/, invalidLabel: 'Jam tertagih per tahun', invalid: '0',
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
    for (const [label, value] of Object.entries(scenario.inputs)) await page.getByLabel(label, { exact: true }).fill(value)
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    await expect(live.locator('dl > div').first().locator('dd')).toHaveText(scenario.expected)
    if (scenario.detail) await expect(live.getByText(scenario.detail, { exact: true })).toBeVisible()
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 70 })

    if (scenario.specialLabel) {
      await page.getByLabel(scenario.specialLabel, { exact: true }).fill(scenario.special!)
      await page.getByRole('button', { name: 'Hitung', exact: true }).click()
      await expect(live.locator('dl > div').first().locator('dd')).toHaveText(scenario.specialResult!)
      await expect(live).toContainText(scenario.specialDetail!)
    }
    const field = page.getByLabel(scenario.invalidLabel, { exact: true })
    await field.fill(scenario.invalid)
    await expect(live).toContainText('Isi semua kolom')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(field).toBeFocused()
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
  })
}

test('discovers the batch and reflows five design widths', async ({ page, isMobile }) => {
  await page.goto('/')
  for (const { title, slug } of scenarios) {
    await page.getByRole('searchbox').fill(title)
    await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  }
  await page.goto('/bisnis')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await listing.getByRole('button', { name: 'Muat lebih banyak' }).click()
  await expect(listing.getByRole('link')).toHaveCount(20)
  for (const { slug } of scenarios) await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const { slug } of scenarios) {
      await page.goto(`/kalkulator/${slug}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
})

test('chooses yield units from a native accessible dropdown', async ({ page }) => {
  await page.goto('/kalkulator/yield-bahan')
  const unit = page.getByRole('combobox', { name: 'Satuan berat' })
  await expect(unit).toHaveAttribute('name', 'unit')
  await unit.focus()
  await unit.selectOption('kg')
  await expect(unit).toHaveValue('kg')
  await page.getByLabel('Berat kotor', { exact: true }).fill('2')
  await page.getByLabel('Berat bersih', { exact: true }).fill('1')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(page.getByText('1 kg', { exact: true })).toBeVisible()
  await unit.selectOption('g')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(page.getByText('1 g', { exact: true })).toBeVisible()
})
