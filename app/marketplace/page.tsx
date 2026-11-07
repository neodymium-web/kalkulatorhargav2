import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Marketplace', 'Hitung berat volumetrik paket menggunakan dimensi dan divisor dari layanan kurir Anda.', '/marketplace')

export default function Marketplace() {
  return <CategoryPage categoryId="marketplace" title="Kalkulator marketplace"
    description="Bandingkan berat paket untuk persiapan pengiriman dengan ketentuan layanan kurir Anda." />
}
