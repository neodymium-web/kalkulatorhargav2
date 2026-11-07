import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Marketplace', 'Hitung iklan, konversi, promo seller, subsidi ongkir, kemasan, retur, dan kerugian COD untuk operasional Marketplace.', '/marketplace')

export default function Marketplace() {
  return <CategoryPage categoryId="marketplace" title="Kalkulator marketplace"
    description="Tinjau iklan, penjualan, promo, ongkir, bahan kemasan, retur, dan gagal COD dengan cakupan biaya yang sesuai." />
}
