import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata('Kalkulator Sehari-hari', 'Hitung harga, tagihan, tanggal, perjalanan, biaya listrik/air dan kebutuhan cat, keramik serta beton dengan satuan dan asumsi yang jelas.', '/sehari-hari')
export default function SehariHari() {
  return <CategoryPage categoryId="sehari-hari" title="Kalkulator sehari-hari"
    description="Hitung harga, tagihan, persen, tanggal dan perjalanan; simulasikan listrik, air serta kebutuhan bahan bangunan. Setiap alat menjelaskan satuan, asumsi dan pembulatannya." />
}
