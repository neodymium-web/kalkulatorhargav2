import { DirectorySearch } from '../components/directory'
import layout from '../components/ui/layout.module.css'
import { pageMetadata } from '../lib/seo'
import { listCategoryHubs, listPublished } from '../lib/registry'
import { directoryEntry } from '../lib/directory'

export const metadata = pageMetadata('Direktori Kalkulator Indonesia', 'Temukan 100 kalkulator bisnis, marketplace, keuangan, pajak, media sosial, dan kebutuhan sehari-hari dengan rumus serta asumsi yang jelas.', '/')

export default function Home() {
  return <DirectorySearch tools={listPublished().map(directoryEntry)} hubs={listCategoryHubs()}>
    <h1>Direktori kalkulator</h1>
    <p className={layout.intro}>Pilih dari 100 kalkulator untuk bisnis, marketplace, keuangan, pajak, media sosial, dan kebutuhan sehari-hari.</p>
  </DirectorySearch>
}
