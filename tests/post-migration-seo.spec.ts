import { expect, test } from '@playwright/test'

const critical = [
  ['/kalkulator/tiktok', /TikTok/], ['/kalkulator/emas', /emas.*manual/i],
  ['/kalkulator/saham/average', /Average saham/], ['/kalkulator/tiktok/benchmark', /manual/i],
  ['/kalkulator/hpp', /HPP/], ['/kalkulator/shopee', /Shopee/], ['/kalkulator/tiktok-shop', /TikTok Shop/],
] as const

for (const [path, heading] of critical) test(`SEO preserved SSR route ${path}`, async ({ page, request }) => {
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText(heading)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com' + path)
  await expect(page.locator('head meta[name=description]')).toHaveAttribute('content', /\S/)
  expect(await page.title()).not.toBe('')
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('https://kalkulatorharga.com' + path + '</loc>')
  if (path === '/kalkulator/tiktok/benchmark') {
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(schema).toHaveLength(1)
    const app = JSON.parse(schema[0])
    expect(app).toMatchObject({ '@type': 'WebApplication', url: 'https://kalkulatorharga.com' + path })
    expect(JSON.stringify(app)).not.toMatch(/"Dataset"|aggregateRating|"license"/)
    await expect(page.locator('main')).toContainText('Dataset benchmark legacy belum tersedia')
  }
})

test('HPP remains discoverable and useful in initial HTML without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    for (const path of ['/', '/bisnis']) {
      await page.goto(path)
      const link = page.locator('main a[href="/kalkulator/hpp"]').first()
      await expect(link).toBeVisible()
      await expect(link).toContainText('Kalkulator HPP')
    }
    const response = await page.goto('/kalkulator/hpp')
    await expect(page.getByRole('heading', { name: 'Cara menghitung HPP' })).toBeVisible()
    await expect(page.locator('article')).toContainText('Contoh perhitungan')
    await expect(page.getByRole('button', { name: 'Hitung HPP', exact: true })).toBeDisabled()
    expect(await response?.text()).toMatch(/<noscript><p[^>]*>Aktifkan JavaScript untuk menghitung\./)
  } finally { await context.close() }
})

test('staging robots and alias stay protected while nonexistent calculators return a true 404', async ({ request }) => {
  expect((await (await request.get('/robots.txt')).text())).toContain('Disallow: /')
  const alias = await request.get('/kalkulator', { maxRedirects: 0 })
  expect(alias.status()).toBe(200); expect(alias.headers().location).toBeUndefined()
  expect(await alias.text()).toContain('rel="canonical" href="https://kalkulatorharga.com"')
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/kalkulator</loc>')
  expect((await request.get('/kalkulator/seo-audit-route-that-does-not-exist')).status()).toBe(404)
})
