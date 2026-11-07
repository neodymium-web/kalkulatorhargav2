import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata(
  'Kalkulator Keuangan',
  'Simulasikan bunga sederhana, bunga majemuk, cicilan anuitas, cicilan flat, dan rasio cicilan dengan asumsi yang jelas.',
  '/keuangan',
)

export default function Keuangan() {
  return (
    <CategoryPage
      categoryId="keuangan"
      title="Kalkulator keuangan"
      description="Hitung pertumbuhan bunga dan pembayaran utang. Tinjau jadwal, pembulatan rupiah, serta basis pendapatan sebelum memakai hasil simulasi."
    />
  )
}
