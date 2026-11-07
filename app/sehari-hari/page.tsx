import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata('Kalkulator Sehari-hari', 'Hitung harga, tanggal, utilitas, bahan bangunan, skala denah, konversi satuan dan kecepatan rata-rata dengan rumus serta asumsi yang jelas.', '/sehari-hari')
export default function SehariHari() {
  return <CategoryPage categoryId="sehari-hari" title="Kalkulator sehari-hari"
    description="Pilih alat untuk harga, tanggal, perjalanan, utilitas dan bahan bangunan; konversikan skala, panjang, massa, suhu atau kecepatan. Setiap alat menjelaskan satuan, asumsi dan pembulatannya." />
}
