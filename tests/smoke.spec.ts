import { expect, test } from '@playwright/test'

test('finds the published calculator from the homepage and business hub', async ({ page }, info) => {
  const response = await page.goto('/')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
  await expect(page.getByRole('heading', { name: 'Direktori kalkulator' })).toBeVisible()
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com')
  const search = page.getByRole('searchbox', { name: 'Cari kalkulator' })
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Langsung ke konten' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await search.fill('jadwal kereta')
  await expect(page.getByText('Coba kata kunci lain', { exact: false })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('0 kalkulator ditemukan')
  await expect(page.getByRole('navigation', { name: 'Kategori kalkulator' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Hapus pencarian' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await expect(page.getByRole('navigation', { name: 'Kategori kalkulator' })).toBeVisible()
  await search.fill('biaya produksi')
  await expect(page.getByRole('link', { name: /Kalkulator HPP/ })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('1 kalkulator ditemukan')
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
  const results = page.getByRole('region', { name: 'Hasil perhitungan' })
  await expect(results).toContainText('Isi biaya dan jumlah unit untuk melihat hasil.')
  await page.getByRole('button', { name: 'Hitung HPP' }).click()
  await expect(page.getByRole('form').getByRole('alert')).toContainText('Periksa 4 kolom')
  await expect(page.getByLabel('Bahan baku')).toBeFocused()
  await page.getByLabel('Bahan baku').fill('120000')
  await page.getByLabel('Tenaga kerja langsung').fill('60000')
  await page.getByLabel('Overhead produksi').fill('20000')
  const units = page.getByLabel('Jumlah unit')
  await units.fill('0')
  await page.getByRole('button', { name: 'Hitung HPP' }).click()
  await expect(units).toHaveAttribute('aria-invalid', 'true')
  await expect(units).toBeFocused()
  await expect(page.getByRole('form').getByRole('alert').getByRole('link', { name: 'Jumlah unit' })).toBeVisible()
  await expect(units).toHaveAccessibleDescription('Jumlah unit harus lebih dari nol.')
  await expect(page.getByText('Jumlah unit harus lebih dari nol.')).toBeVisible()
  await units.fill('50')
  await units.press('Enter')
  await expect(page.getByText(/Rp\s*4\.000$/)).toBeVisible()
  await expect(page.getByText(/^Rp\s*200\.000$/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => window.innerWidth))
  await expect(results.getByText(/satu batch/)).toBeVisible()
  await page.screenshot({ path: info.outputPath('hpp.png'), fullPage: true })
  await units.fill('51')
  await expect(results).toContainText('Isi biaya dan jumlah unit untuk melihat hasil.')
  await expect(results.getByText(/Rp\s*4\.000$/)).toHaveCount(0)
})

test('blocks preview indexing and lists only published URLs', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain('Disallow: /')
  const sitemap = await request.get('/sitemap.xml')
  expect((await sitemap.text()).match(/<loc>[^<]+<\/loc>/g)).toEqual([
    '<loc>https://kalkulatorharga.com/</loc>',
    '<loc>https://kalkulatorharga.com/bisnis</loc>',
    '<loc>https://kalkulatorharga.com/marketplace</loc>',
    '<loc>https://kalkulatorharga.com/keuangan</loc>',
    '<loc>https://kalkulatorharga.com/pajak</loc>',
    '<loc>https://kalkulatorharga.com/media-sosial</loc>',
    '<loc>https://kalkulatorharga.com/sehari-hari</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/hpp</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/harga-jual</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/margin-laba</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/markup</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bep</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/target-laba</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/harga-pokok-penjualan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/yield-bahan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/penyusutan-garis-lurus</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/arus-kas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/utilisasi-kapasitas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/perputaran-persediaan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/reorder-point</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/runway-kas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/biaya-layanan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/tarif-freelance</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/food-cost</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/harga-borongan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/eoq</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/payback-period</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/berat-volumetrik</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/roas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/roas-impas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/acos</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/konversi-toko</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/nilai-pesanan-rata-rata</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/promo-seller</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/subsidi-ongkir</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/biaya-kemasan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/biaya-retur</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kerugian-cod</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bunga-sederhana</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bunga-majemuk</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cicilan-anuitas</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cicilan-flat</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/rasio-cicilan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/target-tabungan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/dana-darurat</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/deposito</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/imbal-hasil-investasi</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cagr</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/nilai-kini</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/npv</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/inflasi</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/rata-rata-beli-saham</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/untung-rugi-saham</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bunga-efektif-pinjaman</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kpr</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pelunasan-dipercepat</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/refinancing</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kurs-mata-uang</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/engagement-rate</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pertumbuhan-pengikut</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cpm</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cpc</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/cpa</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/ctr</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/estimasi-youtube</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/tiktok</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/tarif-endorsement</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/waktu-tonton</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/diskon</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/harga-per-satuan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bagi-tagihan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/persen</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/perubahan-persen</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/selisih-tanggal</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/hari-kerja</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/usia</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/durasi-kerja</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/konsumsi-bbm</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/biaya-listrik</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/biaya-air</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kebutuhan-cat</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kebutuhan-keramik</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/volume-beton</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/skala-denah</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/konversi-panjang</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/konversi-berat</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/konversi-suhu</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/kecepatan-rata-rata</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/blibli</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/harga-jual-marketplace</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/banding-biaya-marketplace</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bundel-produk</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/stok-cover</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/ppn</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pph-23</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pph-4-ayat-2-sewa</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/gross-up-pajak</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pph-final-umkm</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pph-21-bulanan</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pph-21-rekonsiliasi</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pajak-impor</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/bphtb</loc>',
    '<loc>https://kalkulatorharga.com/kalkulator/pbb-p2</loc>',
  ])
})

test('keeps the HPP canonical and returns 404 for unpublished calculators', async ({ page, request }) => {
  await page.goto('/kalkulator/hpp')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kalkulatorharga.com/kalkulator/hpp')
  for (const slug of ['tiktok-shop', 'estimasi-tiktok-kreator', 'shopee', 'tidak-ada']) {
    expect((await request.get(`/kalkulator/${slug}`)).status()).toBe(404)
  }
})
