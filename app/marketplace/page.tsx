import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Marketplace', 'Hitung metrik iklan, konversi, nilai pesanan, dan berat volumetrik untuk operasional Marketplace.', '/marketplace')

export default function Marketplace() {
  return <CategoryPage categoryId="marketplace" title="Kalkulator marketplace"
    description="Tinjau iklan, konversi kunjungan, nilai pesanan, dan berat paket dengan cakupan data yang sesuai." />
}
