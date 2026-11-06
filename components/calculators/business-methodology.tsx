import type { BusinessSlug } from '../../lib/business/tools'
import styles from '../ui/layout.module.css'

const methodology: Record<BusinessSlug, { formula: string; example: string; limits: string }> = {
  'harga-jual': {
    formula: 'Harga jual minimum = HPP per unit ÷ (1 − target margin dalam desimal). Margin membagi laba kotor dengan harga jual. Markup membagi selisih harga dan biaya dengan biaya.',
    example: 'Dengan HPP Rp10.000 dan target margin 25%, harga sebelum pembulatan sekitar Rp13.333,33. Harga minimum Rp13.334 memenuhi target. Rp13.333 masih di bawah target.',
    limits: 'Masukkan margin dari 0% hingga kurang dari 100%. Harga dibulatkan ke atas ke rupiah utuh. Untuk HPP nol, harga minimum Rp1 agar margin terdefinisi.',
  },
  'margin-laba': {
    formula: 'Laba kotor per unit = harga jual − biaya per unit. Margin laba kotor = laba kotor ÷ harga jual × 100%.',
    example: 'Harga Rp120.000 dan biaya Rp90.000 menghasilkan laba kotor Rp30.000 dan margin 25%. Jika biaya naik menjadi Rp150.000, laba kotor menjadi −Rp30.000 dan margin −25%.',
    limits: 'Harga jual harus positif agar margin terdefinisi. Margin negatif berarti biaya lebih besar daripada harga jual. Persentase ditampilkan hingga dua desimal.',
  },
  markup: {
    formula: 'Selisih harga dan biaya = harga jual − biaya per unit. Markup = selisih ÷ biaya per unit × 100%.',
    example: 'Harga Rp120.000 dan biaya Rp90.000 menghasilkan selisih Rp30.000 dan markup 33,33%. Dengan angka yang sama, margin kotor 25% karena pembaginya adalah harga jual.',
    limits: 'Biaya per unit harus positif agar markup terdefinisi. Harga di bawah biaya menghasilkan markup negatif. Persentase ditampilkan hingga dua desimal.',
  },
  bep: {
    formula: 'Kontribusi per unit = harga jual per unit − biaya variabel per unit. Bagi biaya tetap dengan kontribusi positif, lalu bulatkan ke atas untuk mendapat jumlah unit minimum.',
    example: 'Dengan biaya tetap Rp1.000.001, harga Rp50.000, dan biaya variabel Rp30.000, kontribusinya Rp20.000 per unit. Anda perlu menjual 51 unit. Kontribusi 50 unit hanya Rp1.000.000.',
    limits: 'Gunakan harga dan biaya variabel yang konstan untuk satu periode. Jika biaya tetap nol, titik impas tercapai pada nol unit. Jika biaya tetap positif dan kontribusi nol atau negatif, tidak ada jumlah unit yang menutup biaya.',
  },
  'target-laba': {
    formula: 'Kontribusi per unit = harga jual per unit − biaya variabel per unit. Jumlahkan biaya tetap dan target laba, bagi dengan kontribusi positif, lalu bulatkan ke atas ke unit utuh.',
    example: 'Biaya tetap Rp1.000.000, target laba Rp500.001, dan kontribusi Rp20.000 per unit membutuhkan 76 unit. Setelah biaya tetap, 75 unit baru menghasilkan laba Rp500.000.',
    limits: 'Gunakan harga dan biaya variabel yang konstan untuk satu periode. Target nol memakai perhitungan impas. Jika biaya tetap dan target sama-sama nol, nol unit sudah cukup. Jika masih ada biaya atau target yang harus ditutup dan kontribusi nol atau negatif, target tidak tercapai.',
  },
}

export function BusinessMethodology({ slug, formulaVersion }: { slug: BusinessSlug; formulaVersion: string }) {
  const content = methodology[slug]
  return <>
    <h2>Cara menghitung</h2>
    <p>{content.formula}</p>
    <h3>Contoh perhitungan</h3>
    <p>{content.example}</p>
    <h3>Asumsi dan batas penggunaan</h3>
    <p>{content.limits}</p>
    <p>Masukkan nominal setelah penyesuaian jika ingin memperhitungkan biaya platform, pajak, logistik, iklan, atau diskon. Kalkulator tidak menambahkan komponen tersebut secara otomatis.</p>
    <p>{slug === 'bep' || slug === 'target-laba'
      ? 'Hasil menunjukkan jumlah unit terjual, bukan omzet. Laba dalam model ini bergantung pada biaya yang Anda masukkan.'
      : 'Hasil menggunakan biaya per unit yang dimasukkan dan tidak menghitung laba bersih usaha.'}</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
