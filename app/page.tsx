import Link from 'next/link'
import { Directory } from '../components/directory'
import { pageMetadata } from '../lib/seo'
import { business } from '../lib/registry'

export const metadata = pageMetadata('Direktori Kalkulator Indonesia', 'Temukan kalkulator bisnis dan hitung biaya produksi per unit.', '/')

export default function Home() {
  return (
    <div className="wrap page home">
      <h1>Direktori kalkulator</h1>
      <p className="intro">Temukan alat hitung untuk kebutuhan bisnis Anda.</p>
      <Directory searchable />
      <section className="categories">
        <h2>Jelajahi kategori</h2>
        <Link href={business.path}>{business.name}</Link>
      </section>
    </div>
  )
}
