import type { OperationSlug } from '../../lib/operations/tools'
import styles from '../ui/layout.module.css'

const notes: Record<OperationSlug, { formula: string; example: string; limits: string }> = {
  'harga-pokok-penjualan': {
    formula: 'Harga pokok penjualan = persediaan awal + pembelian bersih − persediaan akhir.',
    example: 'Persediaan awal Rp125.000, pembelian bersih Rp84.000, dan persediaan akhir Rp59.000 menghasilkan harga pokok penjualan Rp150.000.',
    limits: 'Gunakan nilai buku barang dagang dari satu periode dan satu metode penilaian, seperti FIFO atau rata-rata tertimbang. Pembelian bersih mencakup ongkos angkut masuk setelah retur, pengurangan harga, dan diskon pembelian. Hasil mengukur biaya barang terjual. Untuk biaya membuat produk, gunakan Kalkulator HPP.',
  },
  'yield-bahan': {
    formula: 'Yield = berat bersih ÷ berat kotor × 100%. Susut berat = berat kotor − berat bersih. Persen susut = susut berat ÷ berat kotor × 100%.',
    example: 'Dari 2,4 kg menjadi 1,75 kg, yield adalah 72,92%, susut berat 0,65 kg, dan persen susut 27,08%.',
    limits: 'Timbang bahan dari batch yang sama dengan satu satuan. Berat bersih harus berada antara nol dan berat kotor. Persentase dibulatkan secara terpisah ke dua desimal, sehingga totalnya dapat berselisih 0,01 poin dari 100%.',
  },
  'penyusutan-garis-lurus': {
    formula: 'Penyusutan tahunan = (biaya perolehan − nilai residu) ÷ umur manfaat dalam tahun.',
    example: 'Aset Rp100.007 dengan residu Rp10.000 dan umur manfaat 4 tahun menghasilkan Rp22.502 per tahun setelah pembulatan.',
    limits: 'Ini penyusutan buku untuk tahun penuh. Perhitungan mengecualikan penyusutan pajak, prorata tahun parsial, dan pelepasan aset. Jika membuat jadwal pembukuan, sesuaikan pembulatan pada tahun terakhir agar nilai buku berakhir pada nilai residu.',
  },
  'arus-kas': {
    formula: 'Arus kas bersih = kas masuk − kas keluar. Saldo akhir = saldo awal + arus kas bersih.',
    example: 'Saldo awal Rp35.000, penerimaan Rp48.000, dan pengeluaran Rp91.000 memberi arus bersih −Rp43.000 dan saldo akhir −Rp8.000.',
    limits: 'Gunakan saldo awal pada awal rentang dan transaksi kas aktual dalam rentang itu. Ini ringkasan kas. Laporan arus kas lengkap juga mengelompokkan transaksi operasi, investasi, dan pendanaan.',
  },
  'utilisasi-kapasitas': {
    formula: 'Utilisasi = produksi aktual ÷ kapasitas acuan tersedia × 100%.',
    example: 'Produksi 98,5 kg terhadap kapasitas acuan 80 kg menghasilkan 123,13% setelah pembulatan.',
    limits: 'Bandingkan lingkup produksi, satuan, dan periode yang sama. Nilai di atas 100% menunjukkan produksi melampaui acuan yang dimasukkan. Kalkulator menentukan status tersebut sebelum membulatkan persentase.',
  },
}

export function OperationsMethodology({ slug, formulaVersion }: { slug: OperationSlug; formulaVersion: string }) {
  const note = notes[slug]
  return <>
    <h2>Cara menghitung</h2>
    <p>{note.formula}</p>
    <h3>Contoh perhitungan</h3>
    <p>{note.example}</p>
    <h3>Asumsi dan batas penggunaan</h3>
    <p>{note.limits}</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
