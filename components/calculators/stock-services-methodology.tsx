import { stockServiceTools, type StockServiceSlug } from '../../lib/stock-services/tools'
import styles from '../ui/layout.module.css'

const limits: Record<StockServiceSlug, string> = {
  'perputaran-persediaan': 'Rata-rata persediaan harus positif. Harga pokok penjualan nol menghasilkan nol perputaran dan hari yang tidak terdefinisi. Gunakan nilai buku dengan metode yang konsisten. Rasio dan hari dibulatkan terpisah ke dua desimal dari angka eksak.',
  'reorder-point': 'Permintaan rata-rata dan waktu pemasok dapat berubah. Stok aman harus ditentukan untuk item yang sama. Alat ini menghitung ambang pemesanan, sementara jumlah yang dipesan dan EOQ memerlukan analisis tambahan.',
  'runway-kas': 'Kas tersedia tidak boleh negatif. Kas nol dengan burn positif memberi nol bulan. Jika arus masuk sama atau lebih besar daripada arus keluar, model konstan tidak menghabiskan kas melalui burn bersih. Pastikan kas tersedia adalah saldo saat proyeksi dimulai dan angka bulanan berasal dari periode acuan yang sama.',
  'biaya-layanan': 'Transaksi harus lebih dari nol. Gunakan transaksi tertagih yang sebenarnya pada bulan yang sama, bukan kapasitas maksimum. Perubahan volume penjualan memengaruhi alokasi biaya. Harga jual dan laba ditentukan setelah memahami biaya ini.',
  'tarif-freelance': 'Jam tertagih harus positif dan realistis untuk setahun. Keluarkan jam administrasi, pemasaran, cuti, dan waktu tanpa klien. Penghasilan pemilik adalah kebutuhan sebelum pajak. Pajak, margin tambahan, dan biaya platform perlu diperhitungkan pengguna dalam kebutuhannya jika relevan. Batas 13 digit adalah batas teknis input, bukan ukuran kapasitas kerja manusia.',
}

export function StockServicesMethodology({ slug, formulaVersion }: { slug: StockServiceSlug; formulaVersion: string }) {
  const tool = stockServiceTools[slug]
  return <>
    <h2>Cara menghitung</h2>
    <p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3>
    <p>{tool.example}</p>
    <h3>Asumsi dan batas penggunaan</h3>
    <p>{tool.assumption}</p>
    <p>{limits[slug]}</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
