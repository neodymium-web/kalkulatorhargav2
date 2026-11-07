import { CategoryPage } from '../../components/category-page'
import { categories } from '../../lib/categories'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Bisnis', 'Temukan alat hitung biaya produksi untuk usaha Anda.', categories.bisnis.hub)

export default function Business() {
  return <CategoryPage categoryId="bisnis" title="Kalkulator bisnis" description="Hitung biaya produksi untuk mengetahui modal per unit." />
}
