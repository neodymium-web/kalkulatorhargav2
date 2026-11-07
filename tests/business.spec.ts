import { expect, test } from '@playwright/test'

const volume = {
  'Biaya tetap (Rp)': '1000001',
  'Harga jual per unit (Rp)': '50000',
  'Biaya variabel per unit (Rp)': '30000',
}

const scenarios = [
  {
    slug: 'harga-jual', title: 'Kalkulator Harga Jual',
    inputs: { 'HPP per unit (Rp)': '10000', 'Target margin kotor (%)': '25' },
    expected: /^Rp\s*13\.334$/, invalidLabel: 'Target margin kotor (%)', invalid: '100',
    error: 'Margin target harus kurang dari 100%.',
  },
  {
    slug: 'margin-laba', title: 'Kalkulator Margin Laba Kotor',
    inputs: { 'Harga jual per unit (Rp)': '120000', 'Biaya per unit (Rp)': '150000' },
    expected: '-25%', invalidLabel: 'Harga jual per unit (Rp)', invalid: '0',
    error: 'Harga jual harus lebih dari nol untuk menghitung margin.',
  },
  {
    slug: 'markup', title: 'Kalkulator Markup',
    inputs: { 'Harga jual per unit (Rp)': '120000', 'Biaya per unit (Rp)': '90000' },
    expected: '33,33%', invalidLabel: 'Biaya per unit (Rp)', invalid: '0',
    error: 'Biaya per unit harus lebih dari nol untuk menghitung markup.',
  },
  {
    slug: 'bep', title: 'Kalkulator BEP Unit', inputs: volume, expected: '51 unit',
    invalidLabel: 'Biaya variabel per unit (Rp)', invalid: '50000',
    noSolution: /^Rp\s*0$/,
  },
  {
    slug: 'target-laba', title: 'Kalkulator Target Laba',
    inputs: { ...volume, 'Biaya tetap (Rp)': '1000000', 'Target laba setelah biaya tetap (Rp)': '500001' },
    expected: '76 unit', invalidLabel: 'Biaya variabel per unit (Rp)', invalid: '50001',
    noSolution: /^-Rp\s*1$/,
  },
]

for (const scenario of scenarios) {
  test(`calculates and handles invalid or unreachable inputs for ${scenario.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize(isMobile ? { width: 375, height: 820 } : { width: 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${scenario.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: scenario.title })).toBeVisible()
    const results = page.getByRole('region', { name: 'Hasil perhitungan' })
    await expect(results).toContainText('Isi semua kolom untuk melihat hasil.')
    for (const [label, value] of Object.entries(scenario.inputs)) {
      await page.getByLabel(label, { exact: true }).fill(value)
    }
    const field = page.getByLabel(scenario.invalidLabel, { exact: true })
    await field.press('Enter')
    await expect(results.getByText(scenario.expected, { exact: true })).toBeVisible()
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 70 })
    await field.fill(scenario.invalid)
    await expect(results).toContainText('Isi semua kolom untuk melihat hasil.')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    if (scenario.error) {
      await expect(field).toBeFocused()
      await expect(field).toHaveAccessibleDescription(new RegExp(scenario.error.replace(/\.$/, '')))
      await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
    } else {
      const announcement = results.locator('[aria-live="polite"]')
      const answers = announcement.locator('dl > div')
      await expect(answers).toHaveCount(2)
      await expect(answers.nth(0).locator('dd')).toHaveText('Target tidak dapat dicapai')
      await expect(answers.nth(1).locator('dt')).toHaveText('Kontribusi per unit')
      await expect(answers.nth(1).locator('dd')).toHaveText(scenario.noSolution!)
      await page.screenshot({ path: info.outputPath(`${scenario.slug}-tidak-tercapai.jpg`), fullPage: true, quality: 70 })
      await expect(results.getByText(scenario.expected, { exact: true })).toHaveCount(0)
    }
  })
}

test('lists and finds published business calculators and reflows at each design width', async ({ page, isMobile }) => {
  const slugs = ['hpp', ...scenarios.map(tool => tool.slug), 'harga-pokok-penjualan', 'yield-bahan',
    'penyusutan-garis-lurus', 'arus-kas', 'utilisasi-kapasitas']
  for (const path of ['/', '/bisnis']) {
    await page.goto(path)
    const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
    if (path === '/bisnis') await listing.getByRole('button', { name: 'Muat lebih banyak' }).click()
    await expect(listing.getByRole('link')).toHaveCount(path === '/' ? 12 : 20)
    for (const slug of slugs) await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  }
  await page.goto('/')
  const search = page.getByRole('searchbox')
  for (const tool of scenarios) {
    await search.fill(tool.title)
    await expect(page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${tool.slug}"]`)).toBeVisible()
  }
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const tool of scenarios) {
      await page.goto(`/kalkulator/${tool.slug}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  }
})
