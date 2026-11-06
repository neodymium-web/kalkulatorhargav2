import styles from '../ui/layout.module.css'
import type { CalculatorViewProps } from './views'

export function HppMethodology({ formulaVersion }: CalculatorViewProps) {
  return <>
    <h2>Cara menghitung HPP</h2>
    <p>Total biaya produksi = bahan baku + tenaga kerja langsung + overhead produksi.</p>
    <p>HPP per unit = total biaya produksi ÷ jumlah unit yang selesai diproduksi.</p>
    <h3>Contoh perhitungan</h3>
    <p>Jika biaya bahan baku Rp120.000, tenaga kerja Rp60.000, dan overhead Rp20.000,
      total biaya produksi adalah Rp200.000. Untuk 50 unit, HPP per unit adalah Rp4.000.</p>
    <h3>Asumsi dan pembulatan</h3>
    <p>Gunakan biaya dari satu kelompok produksi dengan unit sejenis. Kalkulator menjumlahkan rupiah
      secara tepat dan membulatkan HPP per unit ke rupiah terdekat. Pecahan setengah rupiah dibulatkan ke atas.
      Setiap input dibatasi hingga 13 digit.</p>
    <h3>Apakah hasil ini sama dengan harga pokok penjualan?</h3>
    <p>Hasil menunjukkan biaya unit yang diproduksi. Harga pokok penjualan juga memperhitungkan
      persediaan awal dan akhir untuk menentukan biaya barang yang terjual.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
