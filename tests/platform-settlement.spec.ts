import { legacyPaths } from '../lib/legacy/routes'
import { test, expect, type Page } from '@playwright/test'
import { platformFixture, percentFee, fixedFee } from './platform-settlement-fixtures'
const platforms = [['shopee', 'Shopee'], ['tiktok-shop', 'TikTok Shop'], ['tokopedia', 'Tokopedia'], ['lazada', 'Lazada']] as const
const result = (page: Page) => page.getByRole('region', { name: 'Hasil perhitungan', exact: true })
async function fill(page: Page, input: Record<string, unknown>, prefix = '') {
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) { for (const [index, row] of value.entries()) { await page.getByRole('button', { name: 'Tambah biaya', exact: true }).click(); await fill(page, row, `fees.${index}.`) } }
    else { if (value === undefined) continue; const field = page.locator(`[name="${prefix}${key}"]`); if (await field.evaluate(el => el.tagName === 'SELECT')) await field.selectOption(String(value)); else await field.fill(String(value)) }
  }
}
const submit = (page: Page) => page.getByRole('button', { name: 'Hitung', exact: true }).click()
async function open(page: Page) { await page.goto('/kalkulator/shopee'); await fill(page, platformFixture); await submit(page) }
for (const [slug, name] of platforms) test(`Batch20 ${slug} manual payout invalid stale SEO and screenshots`, async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 })
  const response = await page.goto(`/kalkulator/${slug}`); expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Kalkulator Biaya Admin ${name} (Simulasi Tarif Penjual)`)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://kalkulatorharga.com/kalkulator/${slug}`)
  await expect(page.getByText('Simulasi berdasarkan tarif dan komponen yang Anda isi; bukan kalkulator resmi / tarif otomatis marketplace.', { exact: true }).first()).toBeVisible()
  await expect(page.locator('input[name^="fees."]')).toHaveCount(0)
  await submit(page); await expect(page.locator('[name=price]')).toBeFocused()
  await fill(page, platformFixture); await page.getByRole('button', { name: 'Hitung', exact: true }).press('Enter'); await expect(result(page).locator('dd').first()).toHaveText('Rp 175.500'); await expect(result(page)).toContainText('Rp 55.500')
  await expect(page.getByRole('table', { name: `Rincian fee manual ${name}` }).locator('tbody tr')).toHaveCount(2)
  await page.screenshot({ path: info.outputPath(`${slug}.jpg`), quality: 75, fullPage: true }); await result(page).screenshot({ path: info.outputPath(`${slug}-hasil.jpg`), quality: 75 })
  await fill(page, { discount: '200001' }); await expect(page.getByRole('table')).toHaveCount(0); await expect(result(page)).not.toContainText('175.500'); await submit(page); await expect(page.locator('[name=discount]')).toBeFocused(); await expect(page.locator('[name=discount]')).toHaveAttribute('aria-invalid', 'true')
  await page.screenshot({ path: info.outputPath(`${slug}-invalid.jpg`), quality: 75, fullPage: true })
  await fill(page, { discount: '10000', confirmation: 'unknown' }); await submit(page); await expect(result(page).locator('dd')).toHaveCount(1); await expect(result(page)).toContainText('Belum dapat dihitung'); await expect(result(page)).not.toContainText('Rp 0')
})
test('manual fee scope custom basis cap minimum and signed tie ledger', async ({ page, isMobile }, info) => {
  await page.setViewportSize({ width: isMobile ? 375 : 1440, height: 900 }); await open(page)
  await fill(page, { capMode: 'enabled', cap: '8000' }, 'fees.0.'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 177.000')
  await fill(page, { minimumMode: 'enabled', minimum: '9000' }, 'fees.0.'); await submit(page); await expect(page.locator('[name="fees.0.cap"]')).toBeFocused()
  await fill(page, { minimumMode: 'none', capMode: 'none', basis: 'custom', custom: '80000' }, 'fees.0.'); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 181.000')
  await fill(page, { type: 'fixed', amount: '1000', scope: 'unit' }, 'fees.0.'); await expect(page.locator('[name="fees.0.custom"]')).toHaveCount(0); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 183.000')
  await fill(page, { type: 'percent' }, 'fees.0.'); await expect(page.locator('[name="fees.0.basis"]')).toHaveValue(''); await expect(page.locator('[name="fees.0.custom"]')).toHaveCount(0); await fill(page, { rate: '50', basis: 'net' }, 'fees.0.'); await fill(page, { amount: '1' }, 'fees.1.'); await fill(page, { price: '1', quantity: '1', discount: '0', cost: '2', shipping: '0' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('−Rp 1'); await expect(result(page)).toContainText('−Rp 3')
  await expect(page.locator('main')).toContainText('-1/2 Rp'); await result(page).screenshot({ path: info.outputPath('settlement-negatif.jpg'), quality: 75 })
})
test('unknown receipt coverage basis limits and acknowledgement hide all payout', async ({ page }, info) => {
  await open(page)
  for (const patch of [{ confirmation: 'unknown' }, { confirmation: 'complete', shippingFlow: 'unknown' }, { shippingFlow: 'excluded', coverage: 'unsupported' }]) { await fill(page, patch); await submit(page); await expect(result(page).locator('dd')).toHaveCount(1); await expect(page.getByRole('table')).toHaveCount(0) }
  await fill(page, { coverage: 'ordinary' }); for (const patch of [{ basis: 'unknown' }, { basis: 'net', capMode: 'unknown' }, { capMode: 'none', minimumMode: 'unknown' }]) { await fill(page, patch, 'fees.0.'); await submit(page); await expect(result(page).locator('dd')).toHaveCount(1) }
  await result(page).screenshot({ path: info.outputPath('settlement-belum-lengkap.jpg'), quality: 75 })
  await fill(page, { minimumMode: 'none' }, 'fees.0.'); await fill(page, { buyerShipping: '10000', shippingFlow: 'excluded' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 175.500'); await fill(page, { shippingFlow: 'credited', reimbursement: '3000' }); await submit(page); await expect(result(page).locator('dd').first()).toHaveText('Rp 188.500')
})
test('fee rows keyboard focus uniqueness and 12 row limit', async ({ page }) => {
  await page.goto('/kalkulator/shopee'); const add = page.getByRole('button', { name: 'Tambah biaya', exact: true }); await add.focus(); await add.press('Enter'); await expect(page.locator('[name="fees.0.label"]')).toBeFocused(); await fill(page, percentFee, 'fees.0.')
  await add.click(); await expect(page.locator('[name="fees.1.label"]')).toBeFocused(); await fill(page, { ...fixedFee, label: 'ADMIN ASUMSI' }, 'fees.1.'); await fill(page, { ...platformFixture, fees: undefined } as Record<string, unknown>)
  await submit(page); await expect(page.locator('[name="fees.1.label"]')).toHaveAttribute('aria-invalid', 'true')
  await page.getByRole('button', { name: 'Hapus biaya 1', exact: true }).click(); await expect(page.locator('[name="fees.0.label"]')).toBeFocused(); await expect(page.locator('[name="fees.0.label"]')).toHaveValue('ADMIN ASUMSI')
  await page.getByRole('button', { name: 'Hapus biaya 1', exact: true }).click(); await expect(add).toBeFocused()
  for (let i = 0; i < 12; i++) await add.click(); await expect(add).toBeDisabled(); await expect(page.getByRole('button', { name: /^Hapus biaya/ })).toHaveCount(12)
})
test('all new platforms reflow five widths with exact max values and local table scrolling', async ({ page, isMobile }) => {
  for (const [slug] of platforms) {
    await page.goto(`/kalkulator/${slug}`); await fill(page, { ...platformFixture, price: '9999999999999', quantity: '10000', fees: [{ ...percentFee, rate: '0.000001', label: 'BiayaDenganNamaSangatPanjangTanpaSpasiUntukUjiReflow', basis: 'gross' }] }); await submit(page)
    for (const width of [320, 375, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width) }
    await page.setViewportSize({ width: 320, height: 900 }); for (const font of ['Arial', 'Verdana']) { await page.addStyleTag({ content: `body,input,select,button{font-family:${font},sans-serif!important}` }); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320) }
    const region = page.getByRole('region', { name: /^Rincian fee manual/ }); await region.focus(); await region.press('ArrowRight'); await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  }
})
test('100 searchable calculators 20 Marketplace and 107 URLs preserve creator intent', async ({ page, request }, info) => {
  await page.goto('/marketplace'); await page.getByRole('button', { name: 'Muat lebih banyak' }).click(); await expect(page.locator('main section ul > li')).toHaveCount(20)
  for (const [slug, name] of platforms) await expect(page.locator(`main a[href="/kalkulator/${slug}"]`).first()).toContainText(name)
  await page.screenshot({ path: info.outputPath('marketplace-20.jpg'), quality: 75, fullPage: true })
  await page.goto('/kalkulator/banding-biaya-marketplace'); for (const [slug] of platforms) await expect(page.locator(`main a[href="/kalkulator/${slug}"]`).first()).toBeVisible()
  const xml = await (await request.get('/sitemap.xml')).text(); expect(xml.match(/<loc>/g)).toHaveLength(107 + legacyPaths.length); for (const [slug] of platforms) expect(xml).toContain(`/kalkulator/${slug}</loc>`)
  await page.goto('/'); for (const [slug] of platforms) { await page.getByRole('searchbox').fill(slug.replaceAll('-', ' ')); await expect(page.locator(`a[href="/kalkulator/${slug}"]`)).toBeVisible() }
  await page.goto('/kalkulator/tiktok'); await expect(page.getByRole('heading', { level: 1 })).toContainText('Kreator'); expect((await request.get('/kalkulator/kalkulator-tidak-ada')).status()).toBe(404); expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /')
})
test('platform methods examples sources disclaimer are server rendered', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage()
  for (const [slug] of platforms) { await page.goto(`http://127.0.0.1:3100/kalkulator/${slug}`); await expect(page.getByRole('heading', { name: 'Contoh independen, bukan tarif platform' })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Sumber dan status verifikasi' })).toBeVisible(); await expect(page.getByText('Simulasi berdasarkan tarif dan komponen yang Anda isi; bukan kalkulator resmi / tarif otomatis marketplace.', { exact: true }).first()).toBeVisible() }
  await context.close()
})
