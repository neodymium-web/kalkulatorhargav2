import { CategoryPage } from '../../components/category-page'
import { pageMetadata } from '../../lib/seo'
export const metadata = pageMetadata(
  'Kalkulator Media Sosial',
  'Hitung engagement, biaya iklan, CTR, simulasi RPM YouTube/TikTok, tarif endorsement dan waktu tonton dari data manual.',
  '/media-sosial',
)
export default function MediaSosial() {
  return <CategoryPage categoryId="media-sosial" title="Kalkulator media sosial"
    description="Tinjau interaksi, biaya iklan dan waktu tonton, atau susun skenario RPM kreator serta penawaran sponsor. Seluruh input diisi manual, tanpa tarif resmi atau data akun langsung." />
}
