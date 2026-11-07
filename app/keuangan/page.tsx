import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata(
  'Kalkulator Keuangan',
  'Hitung bunga, KPR, pelunasan, refinancing, kurs manual, tabungan, nilai kini dan saham dengan asumsi serta pembulatan yang jelas.',
  '/keuangan',
)

export default function Keuangan() {
  return (
    <CategoryPage
      categoryId="keuangan"
      title="Kalkulator keuangan"
      description="Bandingkan cicilan KPR dan skenario pinjaman, konversikan kurs manual, rencanakan tabungan, serta nilai arus kas dan saham dengan asumsi yang jelas."
    />
  )
}
