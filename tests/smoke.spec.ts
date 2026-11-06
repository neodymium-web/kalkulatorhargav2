import { expect, test } from '@playwright/test'

test('finds the published calculator from the homepage and business hub', async ({ page }, info) => {
  const response = await page.goto('/')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { name: 'Direktori kalkulator' })).toBeVisible()
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com')
  const search = page.getByRole('searchbox', { name: 'Cari kalkulator' })
  await search.fill('tidak ada')
  await expect(page.getByText('Coba kata kunci lain', { exact: false })).toBeVisible()
  await search.fill('biaya produksi')
  await expect(page.getByRole('link', { name: /Kalkulator HPP/ })).toBeVisible()
  await search.clear()
  await page.screenshot({ path: info.outputPath('direktori.png'), fullPage: true })
  await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Bisnis' }).click()
  await expect(page).toHaveURL('/bisnis')
  await page.screenshot({ path: info.outputPath('bisnis.png'), fullPage: true })
  await page.getByRole('link', { name: /Kalkulator HPP/ }).click()
  await expect(page).toHaveURL('/kalkulator/hpp')
})

test('rejects zero units and calculates a production batch', async ({ page }, info) => {
  await page.goto('/kalkulator/hpp')
  await page.getByLabel('Bahan baku').fill('120000')
  await page.getByLabel('Tenaga kerja langsung').fill('60000')
  await page.getByLabel('Overhead produksi').fill('20000')
  const units = page.getByLabel('Jumlah unit')
  await units.fill('0')
  await page.getByRole('button', { name: 'Hitung HPP' }).click()
  await expect(units).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Jumlah unit harus lebih dari nol.')).toBeVisible()
  await units.fill('50')
  await units.press('Enter')
  await expect(page.getByText(/Rp\s*4\.000$/)).toBeVisible()
  await expect(page.getByText(/^Rp\s*200\.000$/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => window.innerWidth))
  await page.screenshot({ path: info.outputPath('hpp.png'), fullPage: true })
})

test('blocks preview indexing and lists only published URLs', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain('Disallow: /')
  const sitemap = await request.get('/sitemap.xml')
  expect((await sitemap.text()).match(/<loc>[^<]+<\/loc>/g)).toEqual([
    '<loc>https://kalkulatorharga.com/</loc>',
    '<loc>https://kalkulatorharga.com/bisnis</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/hpp</loc>',
  ])
})
