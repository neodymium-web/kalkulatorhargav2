import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata('Kalkulator Sehari-hari', 'Hitung harga, tagihan, persen, selisih tanggal, hari kerja, usia, durasi shift dan estimasi BBM dengan aturan serta satuan yang jelas.', '/sehari-hari')
export default function SehariHari() {
  return <CategoryPage categoryId="sehari-hari" title="Kalkulator sehari-hari"
    description="Hitung harga, tagihan dan persen; periksa tanggal, hari kerja, usia, durasi shift serta estimasi BBM. Setiap alat menjelaskan aturan kalender, satuan, asumsi dan pembulatannya." />
}
