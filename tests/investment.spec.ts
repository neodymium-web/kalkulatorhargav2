import { expect, test } from '@playwright/test'

const scenarios = [
  {
    slug: 'target-tabungan',
    title: 'Kalkulator Target Tabungan',
    inputs: { initial: '1000', target: '5000', rate: '12', months: '2' },
    primary: 'Rp1.981,00',
    detail: 'Rp5.001,91',
    invalid: 'months',
    bad: '0',
  },
  {
    slug: 'dana-darurat',
    title: 'Kalkulator Dana Darurat',
    inputs: { expenses: '2000000', months: '6', available: '3000000' },
    primary: 'Rp12.000.000',
    detail: '1,50 bulan',
    invalid: 'months',
    bad: '0',
  },
  {
    slug: 'deposito',
    title: 'Kalkulator Deposito',
    inputs: { principal: '1200000', rate: '6', months: '6', tax: '20', fees: '0' },
    primary: 'Rp1.228.800',
    detail: 'Rp28.800',
    invalid: 'fees',
    bad: '2000000',
  },
  {
    slug: 'imbal-hasil-investasi',
    title: 'Kalkulator Imbal Hasil Investasi',
    inputs: { initial: '100', ending: '90', costs: '5' },
    primary: '−15,00%',
    detail: '−Rp15',
    invalid: 'initial',
    bad: '0',
  },
  {
    slug: 'cagr',
    title: 'Kalkulator CAGR',
    inputs: { initial: '100', ending: '121', years: '2' },
    primary: '10,0000%',
    detail: '10,0000%',
    invalid: 'initial',
    bad: '0',
  },
]

for (const scenario of scenarios) {
  test(`investment result and validation: ${scenario.slug}`, async ({ page, isMobile }, info) => {
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
    await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter')
    const result = page.getByRole('region', { name: 'Hasil perhitungan' })
    const live = result.locator('[aria-live="polite"]')
    await expect(live.locator('dd').first()).toHaveText(scenario.primary)
    await expect(live).toContainText(scenario.detail)
    await page.screenshot({ path: info.outputPath(`${scenario.slug}.jpg`), fullPage: true, quality: 75 })
    await result.screenshot({ path: info.outputPath(`${scenario.slug}-hasil.jpg`), quality: 75 })
    const invalid = page.locator(`[name="${scenario.invalid}"]`)
    await invalid.fill(scenario.bad)
    await expect(live).toContainText('Isi semua kolom')
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await expect(invalid).toBeFocused()
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('form').getByRole('alert')).toBeVisible()
    await expect(live).toContainText('Periksa kolom')
    await page.screenshot({
      path: info.outputPath(`${scenario.slug}-invalid.jpg`),
      fullPage: true,
      quality: 70,
    })
  })
}

test('savings goal zero contribution and small surplus are disclosed', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/target-tabungan')
  await page.locator('[name=initial]').fill('1000')
  await page.locator('[name=target]').fill('1100')
  await page.locator('[name=rate]').fill('12')
  await page.locator('[name=months]').fill('12')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('Rp0,00')
  await expect(result).toContainText('pada akhir durasi dalam model')
  await result.screenshot({ path: info.outputPath('target-tanpa-setoran.jpg'), quality: 75 })
  await page.locator('[name=initial]').fill('1')
  await page.locator('[name=target]').fill('2')
  await page.locator('[name=rate]').fill('0,0001')
  await page.locator('[name=months]').fill('1')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd').first()).toHaveText('Rp1,00')
  await expect(result.getByText('<Rp0,01', { exact: true })).toHaveCount(3)
  await result.screenshot({ path: info.outputPath('target-surplus-subrupiah.jpg'), quality: 75 })
})

test('emergency coverage undefined and surplus remain distinct', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/dana-darurat')
  await page.locator('[name=expenses]').fill('100')
  await page.locator('[name=months]').fill('3')
  await page.locator('[name=available]').fill('350')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd')).toHaveText(['Rp300', 'Rp0', 'Rp50', '3,50 bulan'])
  await result.screenshot({ path: info.outputPath('dana-darurat-surplus.jpg'), quality: 75 })
  await page.locator('[name=expenses]').fill('0')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result).toContainText('Tidak terdefinisi (pengeluaran nol)')
  await result.screenshot({ path: info.outputPath('dana-darurat-pengeluaran-nol.jpg'), quality: 75 })
})

test('deposit optional deductions, rounded ledger, and negative net are consistent', async ({
  page,
  isMobile,
}, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/deposito')
  await page.locator('[name=principal]').fill('100')
  await page.locator('[name=rate]').fill('6')
  await page.locator('[name=months]').fill('1')
  await page.locator('[name=tax]').fill('50')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd')).toHaveText(['Rp100', 'Rp1', 'Rp1', 'Rp0', 'Rp0'])
  await result.screenshot({ path: info.outputPath('deposito-pembulatan-ledger.jpg'), quality: 75 })
  await page.locator('[name=rate]').fill('0')
  await page.locator('[name=tax]').fill('')
  await page.locator('[name=fees]').fill('5')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd')).toHaveText(['Rp95', 'Rp0', 'Rp0', 'Rp5', '−Rp5'])
  await result.screenshot({ path: info.outputPath('deposito-hasil-negatif.jpg'), quality: 75 })
  await page.locator('[name=fees]').fill('101')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(page.locator('[name=fees]')).toBeFocused()
  await expect(page.getByText(/Saldo jatuh tempo negatif tidak didukung/)).toBeVisible()
})

test('ROI and CAGR preserve negative, near-zero, and total-loss distinctions', async ({
  page,
  isMobile,
}, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  await page.goto('/kalkulator/imbal-hasil-investasi')
  await page.locator('[name=initial]').fill('9999999999999')
  await page.locator('[name=ending]').fill('9999999999998')
  await page.locator('[name=costs]').fill('0')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  const result = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(result.locator('dd').first()).toHaveText('Antara −0,01% dan 0% (negatif)')
  await result.screenshot({ path: info.outputPath('roi-negatif-mendekati-nol.jpg'), quality: 75 })
  await page.goto('/kalkulator/cagr')
  await page.locator('[name=initial]').fill('100')
  await page.locator('[name=ending]').fill('81')
  await page.locator('[name=years]').fill('2')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd').first()).toHaveText('−10,0000%')
  await result.screenshot({ path: info.outputPath('cagr-negatif.jpg'), quality: 75 })
  await page.locator('[name=ending]').fill('0')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd').first()).toHaveText('−100,0000%')
  await result.screenshot({ path: info.outputPath('cagr-kehilangan-total.jpg'), quality: 75 })
  await page.locator('[name=initial]').fill('9999999999999')
  await page.locator('[name=ending]').fill('1')
  await page.locator('[name=years]').fill('1')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd').first()).toHaveText('>−100,0000%')
  await result.screenshot({ path: info.outputPath('cagr-nilai-akhir-masih-positif.jpg'), quality: 75 })
  await page.setViewportSize({ width: 320, height: 800 })
  await page.locator('[name=initial]').fill('4000000000000')
  await page.locator('[name=ending]').fill('3999996000002')
  await page.locator('[name=years]').fill('2')
  await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  await expect(result.locator('dd').first()).toHaveText('Antara −0,0001% dan 0% (negatif)')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await result.screenshot({ path: info.outputPath('cagr-negatif-subpresisi-320.jpg'), quality: 75 })
})

test('expanded finance hub and search retain published-only SEO and staging protection', async ({
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
  const listing = page.getByRole('region', { name: 'Kalkulator tersedia' })
  await expect(listing.getByRole('link')).toHaveCount(12)
  await listing.getByRole('button', { name: 'Muat lebih banyak' }).click()
  await expect(listing.getByRole('link')).toHaveCount(20)
  for (const { slug } of scenarios)
    await expect(listing.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible()
  await page.screenshot({
    path: info.outputPath('keuangan-sepuluh-kalkulator.jpg'),
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
  expect(xml.match(/<loc>/g)).toHaveLength(72)
  for (const { slug } of scenarios)
    expect(xml).toContain(`<loc>https://kalkulatorharga.com/kalkulator/${slug}</loc>`)
  for (const slug of ['tiktok-shop', 'shopee']) {
    expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404)
    expect(xml).not.toContain(`/kalkulator/${slug}</loc>`)
    await page.goto('/')
    await page.getByRole('searchbox').fill(slug.replaceAll('-', ' '))
    await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toHaveCount(0)
  }
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})

test('investment results reflow at all design widths', async ({ page, isMobile }) => {
  if (isMobile) return
  test.setTimeout(90000)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    for (const scenario of scenarios) {
      await page.goto(`/kalkulator/${scenario.slug}`)
      for (const [name, value] of Object.entries(scenario.inputs))
        await page.locator(`[name="${name}"]`).fill(value!)
      await page.getByRole('button', { name: 'Hitung', exact: true }).click()
      await expect(page.getByRole('region', { name: 'Hasil perhitungan' }).locator('dd').first()).toHaveText(
        scenario.primary,
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    await page.goto('/keuangan')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})

test('investment methodology, source links, and FAQ remain server-rendered', async ({ browser, baseURL }) => {
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
