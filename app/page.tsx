import { DirectorySearch } from '../components/directory'
import layout from '../components/ui/layout.module.css'
import { pageMetadata } from '../lib/seo'
import { listCategoryHubs, listPublished } from '../lib/registry'
import { directoryEntry } from '../lib/directory'

export const metadata = pageMetadata('Direktori Kalkulator Indonesia', 'Temukan kalkulator bisnis dan hitung biaya produksi per unit.', '/')

export default function Home() {
  return <DirectorySearch tools={listPublished().map(directoryEntry)} hubs={listCategoryHubs()}>
    <h1>Direktori kalkulator</h1>
    <p className={layout.intro}>Temukan alat hitung untuk kebutuhan bisnis Anda.</p>
  </DirectorySearch>
}
