import fs from 'node:fs'
import { chromium } from 'playwright'

export const scenes = [
  ['home', '/'], ['category', '/bisnis'], ['hpp', '/kalkulator/hpp'],
  ['stock', '/kalkulator/saham/average'], ['dynamic', '/kalkulator/food-cost'],
  ['table', '/kalkulator/cicilan-anuitas'],
]

export async function prepare(page, name) {
  const fill = async (key, value) => {
    const input = page.locator(`[name="${key}"]`)
    if (await input.evaluate(n => n.tagName === 'SELECT')) await input.selectOption(value)
    else await input.fill(value)
  }
  if (name === 'hpp') {
    for (const [label, value] of Object.entries({ 'Bahan baku (Rp)': '240000', 'Tenaga kerja langsung (Rp)': '120000', 'Overhead produksi (Rp)': '40000', 'Jumlah unit': '100' })) await page.getByLabel(label, { exact: true }).fill(value)
    await page.getByRole('button', { name: 'Hitung HPP', exact: true }).click()
  }
  if (name === 'stock') {
    const values = { mode: 'gross', openingShares: '1000', openingPrice: '4500', openingFee: '0', sellMode: 'inclusive', sellRate: '0.25', sellFixed: '0', taxRate: '0', taxFixed: '0', saleShares: '1500', salePrice: '4430', target: '4400', targetPrice: '4000', targetRate: '0', targetFixed: '0', targetFeeModel: 'affine', previousClose: '4400', gridOrigin: '0', gridMinimum: '50', gridMaximum: '10000', gridContext: 'hypothetical' }
    for (const [key, value] of Object.entries(values)) await fill(key, value)
    await page.getByRole('button', { name: 'Tambah rows', exact: true }).click()
    for (const [key, value] of Object.entries({ price: '4200', lots: '5', rate: '0', fee: '26000' })) await fill(`rows.0.${key}`, value)
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  }
  if (name === 'dynamic') {
    await page.getByLabel('Jumlah porsi', { exact: true }).fill('4')
    for (let i = 1; i <= 3; i++) {
      if (i > 1) await page.getByRole('button', { name: 'Tambah bahan', exact: true }).click()
      const row = page.getByRole('group', { name: `Bahan ${i}`, exact: true })
      for (const [label, value] of Object.entries({ 'Harga kemasan (Rp)': '20000', 'Isi kemasan': '1000', 'Pemakaian resep': '250' })) await row.getByLabel(label, { exact: true }).fill(value)
      await row.getByLabel('Satuan bersama', { exact: true }).selectOption('g')
    }
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
  }
  if (name === 'table') {
    for (const [key, value] of Object.entries({ principal: '100000000', rate: '12', months: '120' })) await fill(key, value)
    await page.getByRole('button', { name: 'Hitung', exact: true }).click()
    await page.locator('details summary').first().click()
  }
}

async function capture() {
  const output = process.argv[2] || 'test-results/phase-c/after'
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch()
  try {
    for (const width of [320, 375, 768, 1024, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      for (const [name, path] of scenes) {
        await page.goto(`http://127.0.0.1:3100${path}`)
        await prepare(page, name)
        await page.screenshot({ path: `${output}/${name}-${width}.jpg`, fullPage: true, quality: 65, animations: 'disabled' })
        console.log(`${name} ${width}`)
      }
      await page.close()
    }
  } finally { await browser.close() }
}
if (process.argv[1]?.endsWith('/capture.mjs')) capture().catch(error => { console.error(error); process.exitCode = 1 })
