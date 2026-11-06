import { expect, test } from '@playwright/test'

test('reflows public pages and honors reduced motion', async ({ page, isMobile }, info) => {
  test.skip(isMobile, 'Explicit CSS viewport sizes are tested in desktop Chromium.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 680 })
    for (const [path, name] of [['/', 'beranda'], ['/bisnis', 'bisnis'], ['/kalkulator/hpp', 'hpp']]) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      if (name === 'hpp') {
        const form = await page.getByRole('form').boundingBox()
        const result = await page.getByRole('region', { name: 'Hasil perhitungan' }).boundingBox()
        expect(form && result && (width < 768 ? result.y > form.y : result.x > form.x && result.y === form.y)).toBe(true)
        await expect(page.getByRole('button', { name: 'Hitung HPP' })).toHaveCSS('transition-duration', '0s')
      }
      await page.screenshot({ path: info.outputPath(`${name}-${width}.jpg`), fullPage: true })
    }
  }
  // 640 CSS px at 200% zoom gives the same layout width as 320 CSS px.
  await page.setViewportSize({ width: 320, height: 480 })
  await page.goto('/kalkulator/hpp')
  await page.getByLabel('Bahan baku').fill('9999999999999')
  await page.getByLabel('Tenaga kerja langsung').fill('9999999999999')
  await page.getByLabel('Overhead produksi').fill('9999999999999')
  await page.getByLabel('Jumlah unit').fill('1')
  await page.getByRole('button', { name: 'Hitung HPP' }).click()
  await expect(page.getByText(/Rp\s*29\.999\.999\.999\.997/).first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})

test('serves public content without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Kalkulator HPP/ })).toBeVisible()
    await page.goto('/kalkulator/hpp')
    await expect(page.getByRole('heading', { name: 'Cara menghitung HPP' })).toBeVisible()
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/kalkulator/hpp')
  } finally {
    await context.close()
  }
})
