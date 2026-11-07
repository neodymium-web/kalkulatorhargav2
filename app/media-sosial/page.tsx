import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata(
  'Kalkulator Media Sosial',
  'Hitung Engagement Rate, pertumbuhan pengikut, CPM, CPC dan CPA dari data manual dengan pembagi serta pembulatan yang jelas.',
  '/media-sosial',
)
export default function MediaSosial() {
  return <CategoryPage categoryId="media-sosial" title="Kalkulator media sosial"
    description="Tinjau interaksi, perubahan pengikut dan biaya hasil iklan. Pilih basis metrik sesuai data Anda, tanpa benchmark atau tarif otomatis." />
}
