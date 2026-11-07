import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Marketplace', 'Hitung iklan, promo, biaya operasional, settlement manual, harga listing, kontribusi bundel dan stok cover Marketplace.', '/marketplace')

export default function Marketplace() {
  return <CategoryPage categoryId="marketplace" title="Kalkulator marketplace"
    description="Tinjau iklan, biaya operasional, settlement manual, harga listing, perbandingan kanal, bundel dan stok. Tarif berasal dari input Anda, bukan daftar tarif resmi platform." />
}
