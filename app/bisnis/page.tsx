import { Breadcrumb } from '../../components/breadcrumb'
import { Directory } from '../../components/directory'
import { business, calculators } from '../../lib/registry'
import { pageMetadata } from '../../lib/seo'

export const metadata = pageMetadata('Kalkulator Bisnis', 'Temukan alat hitung biaya produksi untuk usaha Anda.', business.path)

export default function Business() {
  return <div className="wrap page">
    <Breadcrumb current={business.name} />
    <h1>Kalkulator bisnis</h1>
    <p className="intro">Hitung biaya produksi untuk mengetahui modal per unit.</p>
    <Directory tools={calculators.filter(tool => tool.category.path === business.path)} />
  </div>
}
