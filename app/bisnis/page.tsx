import { CategoryPage } from '../../components/category-page'
import { categories } from '../../lib/categories'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Bisnis', 'Hitung biaya produksi, harga jual, laba, arus kas, persediaan, dan tarif jasa dengan 20 kalkulator bisnis.', categories.bisnis.hub)

export default function Business() {
  return <CategoryPage categoryId="bisnis" title="Kalkulator bisnis" description="Rencanakan biaya produksi, harga jual, laba, arus kas, persediaan, dan tarif jasa dengan 20 kalkulator bisnis." />
}
