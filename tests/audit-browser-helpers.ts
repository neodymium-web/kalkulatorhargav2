import { type Page } from '@playwright/test'
export async function fillAudit(page: Page, input: Record<string, unknown>, prefix = '') {
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const [index, row] of value.entries()) {
        const firstKey = Object.keys(row)[0]
        while (!await page.locator(`[name="${prefix}${key}.${index}.${firstKey}"]`).count()) await page.getByRole('button', { name: /^Tambah / }).click()
        await fillAudit(page, row, `${prefix}${key}.${index}.`)
      }
    } else {
      const field = page.locator(`[name="${prefix}${key}"]`)
      if (!prefix && key === 'mode' && !await field.count()) {
        await page.getByLabel(page.url().endsWith('/tiktok') ? 'Pilih modul TikTok Kreator' : 'Mode kalkulator persen', { exact: true }).selectOption(String(value)); continue
      }
      if (await field.evaluate(el => el.tagName === 'SELECT')) await field.selectOption(String(value)); else await field.fill(String(value))
    }
  }
}
