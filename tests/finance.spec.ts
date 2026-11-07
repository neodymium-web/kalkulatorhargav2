import { expect, test } from '@playwright/test'

const scenarios = [
  {
    slug: 'bunga-sederhana',
    title: 'Kalkulator Bunga Sederhana',
    inputs: { principal: '1000000', rate: '6', months: '18' },
    primary: 'Rp90.000',
    detail: 'Rp1.090.000',
    invalid: 'rate',
    invalidValue: '100.0001',
  },
  {
    slug: 'bunga-majemuk',
    title: 'Kalkulator Bunga Majemuk',
    inputs: { principal: '1000000', rate: '12', periods: '2' },
    primary: 'Rp1.020.100',
    detail: '12,6825%',
    invalid: 'periods',
    invalidValue: '1201',
    frequency: '12',
  },
  {
    slug: 'cicilan-anuitas',
    title: 'Kalkulator Cicilan Anuitas',
    inputs: { principal: '1000', rate: '12', months: '3' },
    primary: 'Rp341',
    detail: 'Rp338',
    invalid: 'months',
    invalidValue: '0',
    schedule: ['3', 'Rp338', 'Rp335', 'Rp3', 'Rp0'],
    totals: ['Total', 'Rp1.020', 'Rp1.000', 'Rp20', 'Rp0'],
  },
  {
    slug: 'cicilan-flat',
    title: 'Kalkulator Cicilan Flat',
    inputs: { principal: '1000', rate: '12', months: '3' },
    primary: 'Rp343',
    detail: 'Rp344',
    invalid: 'months',
    invalidValue: '0',
    schedule: ['3', 'Rp344', 'Rp334', 'Rp10', 'Rp0'],
    totals: ['Total', 'Rp1.030', 'Rp1.000', 'Rp30', 'Rp0'],
  },
  {
    slug: 'rasio-cicilan',
    title: 'Kalkulator Rasio Cicilan',
    inputs: { income: '5000000', debt: '1500000' },
    primary: '30,00%',
    detail: 'Rp3.500.000',
    invalid: 'income',
    invalidValue: '0',
  },
]

for (const scenario of scenarios) {
  test(`finance calculation and accessible validation: ${scenario.slug}`, async ({
    page,
    isMobile,
  }, info) => {
    await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
    const response = await page.goto(`/kalkulator/${scenario.slug}`)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(scenario.title)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://kalkulatorharga.com/kalkulator/${scenario.slug}`,
    )
    await expect(
      page.getByRole('navigation', { name: 'Jejak navigasi' }).getByRole('link', { name: 'Keuangan' }),
    ).toBeVisible()
    for (const [name, value] of Object.entries(scenario.inputs))
      await page.locator(`[name="${name}"]`).fill(value!)
    if (scenario.frequency) await page.getByRole('combobox').selectOption(scenario.frequency)
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    const results = page.getByRole('region', { name: 'Hasil perhitungan' })
    const live = results.locator('[aria-live="polite"]')
    await expect(live.locator('dd').first()).toHaveText(scenario.primary)
    await expect(live).toContainText(scenario.detail)
    if (scenario.schedule) {
      const summary = page.getByText('Lihat jadwal 3 bulan', { exact: true })
      await summary.focus()
      await summary.press('Enter')
      const table = page.getByRole('table', { name: 'Jadwal cicilan dan sisa pokok' })
      await expect(table).toBeVisible()
      await expect(table.locator('tbody tr').last().locator('th,td')).toHaveText(scenario.schedule)
      await expect(table.locator('tfoot th, tfoot td')).toHaveText(scenario.totals!)
      await expect(page.getByRole('region', { name: 'Jadwal cicilan dan sisa pokok' })).toHaveAttribute(
        'tabindex',
        '0',
      )
      await page.locator('details').screenshot({ path: info.outputPath(`${scenario.slug}-jadwal.jpg`), quality: 75 })
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(isMobile ? 375 : 1440)
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 75 })
    await results.screenshot({ path: info.outputPath(`${scenario.slug}-hasil.jpg`), quality: 75 })
    if (isMobile && scenario.schedule) {
      await page.getByRole('region', { name: 'Jadwal cicilan dan sisa pokok' }).evaluate((element) => {
        element.scrollLeft = element.scrollWidth
      })
      await page.screenshot({
        path: info.outputPath(`${scenario.slug}-saldo-akhir.jpg`),
        fullPage: true,
        quality: 75,
      })
    }
    const invalid = page.locator(`[name="${scenario.invalid}"]`)
    await invalid.fill(scenario.invalidValue)
    await expect(live).toContainText('Isi semua kolom')
    await expect(page.getByRole('table')).toHaveCount(0)
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(invalid).toBeFocused()
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
    await expect(live).toContainText('Periksa kolom')
  })
}

test('compound period dropdown changes duration and clears stale results', async ({ page }) => {
  await page.goto('/kalkulator/bunga-majemuk')
  await page.locator('[name=principal]').fill('1000000')
  await page.locator('[name=rate]').fill('8')
  await page.locator('[name=periods]').fill('4')
  const frequency = page.getByRole('combobox', { name: 'Frekuensi kapitalisasi' })
  await frequency.selectOption('4')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const live = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(live).toContainText('Rp1.082.432')
  await expect(live).toContainText('12 bulan')
  await frequency.selectOption('2')
  await expect(live).toContainText('Isi semua kolom')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(live).toContainText('24 bulan')
  await frequency.selectOption('1')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(live).toContainText('48 bulan')
  await frequency.selectOption('12')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(live).toContainText('4 bulan')
  await page.locator('[name=principal]').fill('9999999999999')
  await page.locator('[name=rate]').fill('100')
  await page.locator('[name=periods]').fill('17')
  await frequency.selectOption('1')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(page.locator('[name=periods]')).toBeFocused()
  await expect(page.getByText(/Saldo eksak melampaui batas/)).toBeVisible()
})

test('discloses subrupiah gains and exact debt shortfall despite rounded ratio', async ({ page }) => {
  await page.goto('/kalkulator/bunga-majemuk')
  await page.locator('[name=principal]').fill('1')
  await page.locator('[name=rate]').fill('0,0001')
  await page.locator('[name=periods]').fill('1')
  await page.getByRole('combobox').selectOption('12')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const live = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(live).toContainText('<0,0001%')
  await expect(live).toContainText('Bunga sebelum pembulatan masih positif')
  await page.goto('/kalkulator/rasio-cicilan')
  await page.locator('[name=income]').fill('9999999999998')
  await page.locator('[name=debt]').fill('9999999999999')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(live).toContainText('100,00%')
  await expect(live).toContainText('−Rp1')
  await expect(live).toContainText('Cicilan melebihi pendapatan bersih')
})

test('loan zero interest and zero principal retain consistent schedules', async ({ page }) => {
  for (const slug of ['cicilan-anuitas', 'cicilan-flat']) {
    await page.goto(`/kalkulator/${slug}`)
    await page.locator('[name=principal]').fill('1000')
    await page.locator('[name=rate]').fill('0')
    await page.locator('[name=months]').fill('3')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await page.getByText('Lihat jadwal 3 bulan', { exact: true }).click()
    const table = page.getByRole('table')
    await expect(table.locator('tfoot th, tfoot td')).toHaveText([
      'Total',
      'Rp1.000',
      'Rp1.000',
      'Rp0',
      'Rp0',
    ])
    await page.locator('[name=principal]').fill('0')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(page.getByRole('region', { name: 'Hasil perhitungan' })).toContainText(
      'Pokok nol: tidak ada kewajiban pembayaran.',
    )
    await page.getByText('Lihat jadwal 3 bulan', { exact: true }).click()
    await expect(table.locator('tfoot th, tfoot td')).toHaveText(['Total', 'Rp0', 'Rp0', 'Rp0', 'Rp0'])
  }
})

test('finance hub, navigation, search, sitemap and unpublished boundaries', async ({
  page,
  request,
  isMobile,
}, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto('/keuangan')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://kalkulatorharga.com/keuangan',
  )
  await expect(
    page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Keuangan' }),
  ).toHaveAttribute('aria-current', 'page')
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await expect(listing.getByRole('link')).toHaveCount(12)
  await listing.getByRole('button', { name: 'Muat lebih banyak' }).click()
  await expect(listing.getByRole('link')).toHaveCount(20)
  for (const { slug } of scenarios)
    await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  await page.screenshot({ path: info.outputPath('keuangan.jpg'), fullPage: true, quality: 75 })
  for (const { title, slug } of scenarios) {
    await page.goto('/')
    await page.getByRole('searchbox').fill(title)
    await expect(
      page.getByRole('region', { name: 'Hasil pencarian' }).locator(`a[href="/kalkulator/${slug}"]`),
    ).toBeVisible()
  }
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml.match(/<loc>/g)).toHaveLength(72)
  expect(xml).toContain('<loc>https://kalkulatorharga.com/keuangan</loc>')
  for (const { slug } of scenarios)
    expect(xml).toContain(`<loc>https://kalkulatorharga.com/kalkulator/${slug}</loc>`)
  for (const slug of ['tiktok-shop', 'shopee']) {
    expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404)
    expect(xml).not.toContain(`/kalkulator/${slug}</loc>`)
  }
})

test('finance results and expanded schedules fit all design widths', async ({ page, isMobile }) => {
  if (isMobile) return
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const scenario of scenarios) {
      await page.goto(`/kalkulator/${scenario.slug}`)
      for (const [name, value] of Object.entries(scenario.inputs))
        await page.locator(`[name="${name}"]`).fill(value!)
      if (scenario.frequency) await page.getByRole('combobox').selectOption(scenario.frequency)
      await page.getByRole('button', { name: 'Hitung', exact: true }).click()
      if (scenario.schedule) await page.getByText('Lihat jadwal 3 bulan', { exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    await page.goto('/keuangan')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})

test('finance methodology and sources are available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    for (const { slug } of scenarios) {
      await page.goto(`/kalkulator/${slug}`)
      await expect(page.getByRole('heading', { name: 'Sumber rumus', exact: true })).toBeVisible()
      await expect(page.locator('article a[href^="https://"]')).not.toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'Pertanyaan tentang perhitungan ini' })).toBeVisible()
    }
  } finally {
    await context.close()
  }
})
