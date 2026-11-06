import styles from '../../components/ui/layout.module.css'
import { Breadcrumb } from '../../components/breadcrumb'
import { Directory } from '../../components/directory'
import { listCategory } from '../../lib/registry'
import { categories } from '../../lib/categories'
import { directoryEntry } from '../../lib/directory'
import { pageMetadata } from '../../lib/seo'

const business = categories.bisnis

export const metadata = pageMetadata('Kalkulator Bisnis', 'Temukan alat hitung biaya produksi untuk usaha Anda.', business.hub)

export default function Business() {
  return <div className={`${styles.container} ${styles.page}`}>
    <Breadcrumb current={business.name} />
    <h1>Kalkulator bisnis</h1>
    <p className={styles.intro}>Hitung biaya produksi untuk mengetahui modal per unit.</p>
    <div className={styles.section}><Directory tools={listCategory('bisnis').map(directoryEntry)} /></div>
  </div>
}
