import { expect, test, type Page } from '@playwright/test'
type Scenario = {
  slug: string
  title: string
  inputs: Record<string, string>
  rows?: Record<string, string>[]
  root?: string
  add?: string
  primary: string
  detail: string
  invalid: string
  bad: string
}
const scenarios: Scenario[] = [
  {
    slug: 'nilai-kini',
    title: 'Kalkulator Nilai Kini',
    inputs: { future: '1210', rate: '10', years: '2' },
    primary: 'Rp1.000,00',
    detail: 'Rp210,00',
    invalid: 'rate',
    bad: '-100',
  },
  {
    slug: 'npv',
    title: 'Kalkulator NPV',
    inputs: { rate: '10' },
    root: 'cashflows',
    add: 'Tambah tahun',
    rows: [{ amount: '-1000' }, { amount: '600' }, { amount: '600' }],
    primary: 'Rp41,32',
    detail: '−Rp1.000,00',
    invalid: 'cashflows.1.amount',
    bad: '1.5',
  },
  {
    slug: 'inflasi',
    title: 'Kalkulator Inflasi',
    inputs: { price: '100', rate: '10', years: '2' },
    primary: 'Rp121,00',
    detail: 'Rp82,64',
    invalid: 'rate',
    bad: '-1',
  },
  {
    slug: 'rata-rata-beli-saham',
    title: 'Kalkulator Rata-rata Beli Saham',
    inputs: { sharesPerLot: '100' },
    root: 'purchases',
    add: 'Tambah transaksi',
    rows: [
      { price: '1000', lots: '2', fee: '1000' },
      { price: '2000', lots: '1', fee: '500' },
    ],
    primary: 'Rp1.338,33',
    detail: 'Rp401.500,00',
    invalid: 'purchases.1.lots',
    bad: '0',
  },
  {
    slug: 'untung-rugi-saham',
    title: 'Kalkulator Untung Rugi Saham',
    inputs: {
      buyPrice: '10',
      sellPrice: '12',
      lots: '2',
      sharesPerLot: '100',
      buyFee: '10',
      sellFee: '5',
      sellTax: '3',
    },
    primary: 'Rp382,00',
    detail: '19,00%',
    invalid: 'sellTax',
    bad: '3000',
  },
]
async function fill(page: Page, scenario: Scenario) {
  for (const [name, value] of Object.entries(scenario.inputs))
    await page.locator(`[name="${name}"]`).fill(value)
  for (const [index, row] of (scenario.rows ?? []).entries()) {
    if (index) await page.getByRole('button', { name: scenario.add!, exact: true }).click()
    for (const [name, value] of Object.entries(row))
      await page.locator(`[name="${scenario.root}.${index}.${name}"]`).fill(value)
  }
}
const calculate = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
for (const scenario of scenarios)
  test(`valuation result and invalid focus: ${scenario.slug}`, async ({ page, isMobile }, info) => {
    await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(scenario.title)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://kalkulatorharga.com/kalkulator/${scenario.slug}`,
    )
    await fill(page, scenario)
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    const result = page.getByRole('region', { name: 'Hasil perhitungan' })
    await expect(result.locator('dd').first()).toHaveText(scenario.primary)
    await expect(result).toContainText(scenario.detail)
    if (scenario.slug === 'npv') {
      const summary = page.getByText('Lihat rincian nilai kini 3 arus kas', { exact: true })
      await summary.focus()
      await summary.press('Enter')
      const table = page.getByRole('table', { name: 'Rincian arus kas dan nilai kini' })
      await expect(table.locator('tbody tr').first().locator('th,td')).toHaveText([
        '0 (hari ini)',
        '−Rp1.000,00',
        '−Rp1.000,00',
      ])
      await expect(table.locator('tfoot th, tfoot td')).toHaveText(['Total', 'Rp200,00', 'Rp41,32'])
      await page.locator('details').screenshot({ path: info.outputPath('npv-rincian.jpg'), quality: 75 })
    }
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 75 })
    await result.screenshot({ path: info.outputPath(`${scenario.slug}-hasil.jpg`), quality: 75 })
    const invalid = page.locator(`[name="${scenario.invalid}"]`)
    await invalid.fill(scenario.bad)
    await expect(result).toContainText('Isi semua kolom')
    await expect(page.getByRole('table', { name: 'Rincian arus kas dan nilai kini' })).toHaveCount(0)
    await calculate(page)
    await expect(invalid).toBeFocused()
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
    await page.screenshot({
      path: info.outputPath(`${scenario.slug}-invalid.jpg`),
      fullPage: true,
      quality: 70,
    })
  })
test('NPV rows start at zero and retain values and focus when deleted', async ({ page }) => {
  await page.goto('/kalkulator/npv')
  await page.locator('[name=rate]').fill('0')
  await expect(page.getByRole('group', { name: 'Tahun 0', exact: true })).toBeVisible()
  await page.locator('[name="cashflows.0.amount"]').fill('-100')
  for (const [index, amount] of ['50', '-10'].entries()) {
    await page.getByRole('button', { name: 'Tambah tahun' }).click()
    await expect(page.locator(`[name="cashflows.${index + 1}.amount"]`)).toBeFocused()
    await page.locator(`[name="cashflows.${index + 1}.amount"]`).fill(amount)
  }
  await calculate(page)
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('−Rp60,00')
  await page.getByRole('button', { name: 'Hapus tahun 0', exact: true }).click()
  await expect(page.locator('[name="cashflows.0.amount"]')).toBeFocused()
  await expect(page.locator('[name="cashflows.0.amount"]')).toHaveValue('50')
  await expect(page.locator('[name="cashflows.1.amount"]')).toHaveValue('-10')
  await expect(result).toContainText('Isi semua kolom')
  await calculate(page)
  await expect(result.locator('dd').first()).toHaveText('Rp40,00')
  await page.getByRole('button', { name: 'Hapus tahun 1', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Hapus tahun 0', exact: true })).toBeDisabled()
  await expect(page.getByRole('form').getByText('Maksimal 101 baris (tahun 0–100).', { exact: true })).toBeVisible()
})
test('purchase rows retain transaction values and focus when deleted', async ({ page }) => {
  await page.goto('/kalkulator/rata-rata-beli-saham')
  await page.locator('[name=sharesPerLot]').fill('100')
  for (const [key, value] of Object.entries({ price: '1000', lots: '2', fee: '1000' }))
    await page.locator(`[name="purchases.0.${key}"]`).fill(value)
  await page.getByRole('button', { name: 'Tambah transaksi' }).click()
  await expect(page.locator('[name="purchases.1.price"]')).toBeFocused()
  for (const [key, value] of Object.entries({ price: '2000', lots: '1', fee: '500' }))
    await page.locator(`[name="purchases.1.${key}"]`).fill(value)
  await calculate(page)
  await page.getByRole('button', { name: 'Hapus transaksi 1', exact: true }).click()
  await expect(page.locator('[name="purchases.0.price"]')).toBeFocused()
  for (const [key, value] of Object.entries({ price: '2000', lots: '1', fee: '500' }))
    await expect(page.locator(`[name="purchases.0.${key}"]`)).toHaveValue(value)
  await calculate(page)
  await expect(page.getByRole('region', { name: 'Hasil perhitungan' }).locator('dd').first()).toHaveText(
    'Rp2.005,00',
  )
  await expect(page.getByRole('button', { name: 'Hapus transaksi 1', exact: true })).toBeDisabled()
  await expect(page.getByRole('form').getByText('Maksimal 100 transaksi.', { exact: true })).toBeVisible()
})
test('NPV negative ties and tiny signs match its decomposition footer', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/npv')
  await fill(page, {
    ...scenarios[1],
    inputs: { rate: '100' },
    rows: [{ amount: '-1' }, { amount: '0' }, { amount: '0' }, { amount: '7' }],
  })
  await calculate(page)
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('−Rp0,13')
  await page.getByText('Lihat rincian nilai kini 4 arus kas', { exact: true }).click()
  await expect(
    page.getByRole('table', { name: 'Rincian arus kas dan nilai kini' }).locator('tfoot td').last(),
  ).toHaveText('−Rp0,13')
  await result.screenshot({ path: info.outputPath('npv-tie-negatif.jpg'), quality: 75 })
  for (let index = 0; index <= 8; index++) {
    if (index >= 4) await page.getByRole('button', { name: 'Tambah tahun' }).click()
    await page.locator(`[name="cashflows.${index}.amount"]`).fill(index === 8 ? '-1' : '0')
  }
  await calculate(page)
  await expect(result.locator('dd').first()).toHaveText('Antara −Rp0,01 dan Rp0 (negatif)')
  await page.getByText('Lihat rincian nilai kini 9 arus kas', { exact: true }).click()
  await expect(
    page.getByRole('table', { name: 'Rincian arus kas dan nilai kini' }).locator('tfoot td').last(),
  ).toHaveText('Antara −Rp0,01 dan Rp0 (negatif)')
  await result.screenshot({ path: info.outputPath('npv-negatif-subpresisi.jpg'), quality: 75 })
})
test('tiny PV and inflation interpretations remain distinct at boundaries', async ({
  page,
  isMobile,
}, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/nilai-kini')
  await fill(page, { ...scenarios[0], inputs: { future: '1', rate: '100', years: '100' } })
  await calculate(page)
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('<Rp0,01')
  await result.screenshot({ path: info.outputPath('nilai-kini-subpresisi.jpg'), quality: 75 })
  await page.goto('/kalkulator/inflasi')
  await fill(page, { ...scenarios[2], inputs: { price: '1', rate: '100', years: '3' } })
  await calculate(page)
  await expect(result.locator('dd')).toHaveText(['Rp8,00', 'Rp0,13', 'Rp7,00', 'Rp0,87'])
  await result.screenshot({ path: info.outputPath('inflasi-tie-daya-beli.jpg'), quality: 75 })
  await page.locator('[name=years]').fill('0')
  await calculate(page)
  await expect(result.locator('dd')).toHaveText(['Rp1,00', 'Rp1,00', 'Rp0,00', 'Rp0,00'])
  await page.locator('[name=price]').fill('9999999999999')
  await page.locator('[name=years]').fill('100')
  await calculate(page)
  await expect(page.locator('[name=years]')).toBeFocused()
})
test('stock losses optional tax and invalid net sale are explicit', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/untung-rugi-saham')
  await fill(page, {
    ...scenarios[4],
    inputs: {
      buyPrice: '100',
      sellPrice: '90',
      lots: '1',
      sharesPerLot: '1',
      buyFee: '5',
      sellFee: '2',
      sellTax: '1',
    },
  })
  await calculate(page)
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('−Rp18,00')
  await expect(result).toContainText('−17,14%')
  await result.screenshot({ path: info.outputPath('saham-rugi.jpg'), quality: 75 })
  await page.locator('[name=sellFee]').fill('91')
  await calculate(page)
  await expect(page.locator('[name=sellFee]')).toBeFocused()
  for (const [key, value] of Object.entries({
    buyPrice: '0,01',
    sellPrice: '0.02',
    lots: '3',
    buyFee: '0',
    sellFee: '0',
    sellTax: '',
  }))
    await page.locator(`[name="${key}"]`).fill(value)
  await calculate(page)
  await expect(result.locator('dd').first()).toHaveText('Rp0,03')
  await result.screenshot({ path: info.outputPath('saham-harga-pecahan.jpg'), quality: 75 })
})
test('finance pagination exposes all fifteen tools and protects SEO boundaries', async ({
  page,
  request,
  isMobile,
}, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto('/keuangan')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await expect(listing.getByRole('link')).toHaveCount(12)
  await listing.getByRole('button', { name: 'Muat lebih banyak' }).click()
  await expect(listing.getByRole('link')).toHaveCount(15)
  await expect(listing.locator('a[href="/kalkulator/inflasi"]')).toBeFocused()
  for (const { slug } of scenarios)
    await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  await page.screenshot({
    path: info.outputPath('keuangan-lima-belas-kalkulator.jpg'),
    fullPage: true,
    quality: 75,
  })
  for (const { slug, title } of scenarios) {
    await page.goto('/')
    await page.getByRole('searchbox').fill(title)
    await expect(
      page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`),
    ).toBeVisible()
  }
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml.match(/<loc>/g)).toHaveLength(50)
  for (const { slug } of scenarios) expect(xml).toContain(`/kalkulator/${slug}</loc>`)
  for (const slug of ['kpr', 'bunga-efektif-pinjaman', 'tiktok', 'tiktok-shop', 'shopee']) {
    expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404)
    expect(xml).not.toContain(`/kalkulator/${slug}</loc>`)
    await page.goto('/')
    await page.getByRole('searchbox').fill(slug.replaceAll('-', ' '))
    await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0)
  }
})
test('valuation forms results and cash flow tables fit all design widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(90000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const scenario of scenarios) {
      await page.goto(`/kalkulator/${scenario.slug}`)
      await fill(page, scenario)
      await calculate(page)
      if (scenario.slug === 'npv')
        await page.getByText('Lihat rincian nilai kini 3 arus kas', { exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    await page.goto('/keuangan')
    await page.getByRole('button', { name: 'Muat lebih banyak' }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})
test('valuation sources FAQ and example table are server rendered', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    for (const { slug } of scenarios) {
      await page.goto(`/kalkulator/${slug}`)
      await expect(page.getByRole('heading', { name: 'Sumber rumus', exact: true })).toBeVisible()
      await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'Pertanyaan tentang perhitungan ini' })).toBeVisible()
      if (slug === 'npv')
        await expect(page.getByRole('table', { name: 'Contoh arus kas tahunan, diskonto 10%' })).toBeVisible()
    }
  } finally {
    await context.close()
  }
})
