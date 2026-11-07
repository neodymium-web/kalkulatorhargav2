import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata('Kalkulator Sehari-hari', 'Hitung diskon, harga per satuan, bagi tagihan, persen dan perubahan persen dengan pembulatan serta basis yang jelas.', '/sehari-hari')
export default function SehariHari() {
  return <CategoryPage categoryId="sehari-hari" title="Kalkulator sehari-hari"
    description="Bandingkan harga, terapkan diskon, bagi biaya bersama dan hitung persen. Setiap alat menjelaskan basis, satuan serta pembulatan hasilnya." />
}
