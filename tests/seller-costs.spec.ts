import { expect, test } from '@playwright/test'
const scenarios = [
  {
    slug: 'promo-seller',
    inputs: { price: '100000', discount: '20000', share: '25' },
    result: 'Rp5.000,00',
    bad: 'discount',
    invalid: '100001',
  },
  {
    slug: 'subsidi-ongkir',
    inputs: { actual: '20000', buyer: '5000', credit: '10000' },
    result: 'Rp5.000,00',
    bad: 'credit',
    invalid: '16000',
  },
  {
    slug: 'biaya-kemasan',
    inputs: {
      shipments: '3',
      'materials.0.price': '1',
      'materials.0.quantity': '3',
      'materials.0.usage': '1',
      'materials.0.waste': '0',
    },
    result: 'Rp0,33',
    bad: 'materials.0.waste',
    invalid: '100',
  },
  {
    slug: 'biaya-retur',
    inputs: { gross: '50000', recovery: '20000', rate: '5', orders: '100' },
    result: 'Rp1.500,00',
    bad: 'recovery',
    invalid: '50001',
  },
  {
    slug: 'kerugian-cod',
    inputs: { attempts: '1', rate: '1', loss: '100' },
    result: 'Rp1,00',
    bad: 'rate',
    invalid: '101',
  },
]
for (const scenario of scenarios)
  test(`seller flow ${scenario.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://kalkulatorharga.com/kalkulator/${scenario.slug}`,
    )
    for (const [name, value] of Object.entries(scenario.inputs))
      await page.locator(`[name="${name}"]`).fill(value!)
    if (scenario.slug === 'biaya-kemasan') await page.locator('select').selectOption('pcs')
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    const live = page.getByRole('region', { name: 'Hasil perhitungan' }).locator('[aria-live="polite"]')
    await expect(live.locator('dd').first()).toHaveText(scenario.result)
    if (scenario.slug === 'kerugian-cod') await expect(live).toContainText('0,01 percobaan')
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 70 })
    const bad = page.locator(`[name="${scenario.bad}"]`)
    await bad.fill(scenario.invalid)
    await expect(live).toContainText('Isi semua kolom')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(bad).toBeFocused()
    await expect(bad).toHaveAttribute('aria-invalid', 'true')
  })
test('packaging rows preserve input and focus; exact batch total', async ({ page }, info) => {
  await page.goto('/kalkulator/biaya-kemasan')
  await page.locator('[name=shipments]').fill('3')
  for (let i = 0; i < 2; i++) {
    if (i) await page.getByRole('button', { name: 'Tambah bahan' }).click()
    const row = page.getByRole('group', { name: `Bahan ${i + 1}`, exact: true })
    if (i) await expect(row.locator('input').first()).toBeFocused()
    await row.locator('[name$=".price"]').fill('1')
    await row.locator('select').selectOption('pcs')
    await row.locator('[name$=".quantity"]').fill('3')
    await row.locator('[name$=".usage"]').fill('1')
    await row.locator('[name$=".waste"]').fill('0')
  }
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const live = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(live).toContainText('Rp0,67')
  await expect(live).toContainText('Rp2,00')
  await page.screenshot({ path: info.outputPath('kemasan-dua-bahan.jpg'), fullPage: true, quality: 70 })
  await page.getByRole('button', { name: 'Hapus bahan 1' }).click()
  await expect(page.locator('[name="materials.0.price"]')).toBeFocused()
  await expect(page.locator('[name="materials.0.quantity"]')).toHaveValue('3')
  await expect(page.getByRole('button', { name: 'Hapus bahan 1' })).toBeDisabled()
})
test('seller tools are discoverable and responsive', async ({ page, isMobile }) => {
  await page.goto('/marketplace')
  await expect(page.getByRole('region', { name: 'Kalkulator tersedia' }).getByRole('link')).toHaveCount(12)
  for (const { slug } of scenarios) {
    await page.goto('/')
    await page.getByRole('searchbox').fill(slug.replaceAll('-', ' '))
    await expect(
      page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`),
    ).toBeVisible()
  }
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440])
    for (const { slug } of scenarios) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/kalkulator/${slug}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
})
test('tiny positive ROAS margin remains distinguishable', async ({ page }) => {
  await page.goto('/kalkulator/roas-impas')
  await page.locator('[name=revenue]').fill('1000000')
  await page.locator('[name=variable]').fill('999999')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Hasil perhitungan' })).toContainText('<0,01%')
})
