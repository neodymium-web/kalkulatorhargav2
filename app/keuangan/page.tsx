import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata(
  'Kalkulator Keuangan',
  'Hitung bunga, cicilan, tabungan, nilai kini, NPV, inflasi, dan biaya saham dengan asumsi serta pembulatan yang jelas.',
  '/keuangan',
)

export default function Keuangan() {
  return (
    <CategoryPage
      categoryId="keuangan"
      title="Kalkulator keuangan"
      description="Rencanakan tabungan dan pembayaran utang, nilai arus kas, serta tinjau daya beli dan biaya saham melalui simulasi dengan batas yang jelas."
    />
  )
}
