import { test, expect } from '@playwright/test'
import { scenes, prepare } from '../scripts/design/capture.mjs'

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`Phase C visual, contrast, touch and reflow at ${width}px`, async ({ page }, info) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [name, path] of scenes) {
      await page.goto(path)
      await prepare(page, name)
      await expect(page.locator('h1')).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      const small = await page.locator('input, select, button, header a, footer a').evaluateAll(nodes => nodes.filter(n => {
        const r = n.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)
      }).map(n => n.textContent || n.id))
      expect(small).toEqual([])
      expect(await page.locator('button, input, select').evaluateAll(nodes => nodes.every(n => getComputedStyle(n).transitionDuration.split(',').every(t => parseFloat(t) === 0)))).toBe(true)
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
      expect(await page.evaluate(async () => (await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([])
      if (name === 'hpp') await expect(page.getByRole('region', { name: 'Hasil perhitungan' })).toContainText(/Rp\s*4\.000/)
      if (name === 'stock') await expect(page.getByRole('region', { name: 'Hasil perhitungan' })).toContainText('4428,404344')
      if (name === 'dynamic') await expect(page.getByRole('region', { name: 'Hasil perhitungan' })).toContainText(/Rp\s*3\.750/)
      if (name === 'table') {
        await expect(page.locator('tbody tr')).toHaveCount(120)
        const scroll = page.getByRole('region', { name: 'Jadwal cicilan dan sisa pokok' })
        await scroll.focus()
        await expect(scroll).toBeFocused()
        if (await scroll.evaluate(n => n.scrollWidth > n.clientWidth)) {
          await scroll.press('ArrowRight')
          await expect.poll(() => scroll.evaluate(n => n.scrollLeft)).toBeGreaterThan(0)
          await scroll.evaluate(n => { n.scrollLeft = 0 })
        }
      }
      await page.screenshot({ path: info.outputPath(`${name}-${width}.jpg`), fullPage: true, quality: 65, animations: 'disabled' })
    }
  })
}

test('Phase C keyboard, empty search, pagination and 200% text enlargement', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Langsung ke konten' })
  await expect(skip).toBeFocused()
  expect(await skip.evaluate(n => getComputedStyle(n).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  const search = page.getByRole('searchbox')
  await search.fill('zxy-nonexistent')
  await page.getByRole('button', { name: 'Hapus dan cari lagi' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await page.goto('/bisnis')
  await page.getByRole('button', { name: 'Muat lebih banyak' }).press('Enter')
  await expect(page.locator('main ul').first().locator('li').nth(12).locator('a')).toBeFocused()
  for (const path of ['/', '/bisnis', '/kalkulator/hpp', '/kalkulator/saham/average']) {
    await page.setViewportSize({ width: 640, height: 900 })
    await page.goto(path)
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(640)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('header a').first()).toBeVisible()
  }
})
