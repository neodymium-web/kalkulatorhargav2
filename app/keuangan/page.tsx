import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata(
  'Kalkulator Keuangan',
  'Hitung bunga, cicilan, target tabungan, dana darurat, deposito, ROI, dan CAGR dengan asumsi dan pembulatan yang jelas.',
  '/keuangan',
)

export default function Keuangan() {
  return (
    <CategoryPage
      categoryId="keuangan"
      title="Kalkulator keuangan"
      description="Tinjau bunga dan cicilan, rencanakan tabungan serta cadangan, lalu hitung deposito dan imbal hasil investasi dengan batas model yang jelas."
    />
  )
}
