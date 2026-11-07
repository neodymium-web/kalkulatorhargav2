import Link from 'next/link'
import { metricTools, type MetricSlug } from '../../lib/marketplace-metrics/tools'
import styles from '../ui/layout.module.css'

export function MetricsMethodology({ slug, formulaVersion }: { slug: MetricSlug; formulaVersion: string }) {
  const tool = metricTools[slug]
  return <>
    <h2>Cara menghitung</h2>
    <p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3>
    <p>{tool.example}</p>
    <h3>Asumsi dan batas penggunaan</h3>
    <p>{tool.assumptions}</p>
    <p>{tool.limits}</p>
    <p>Untuk meninjau hubungan harga dan biaya, gunakan <Link href="/kalkulator/margin-laba">Kalkulator Margin Laba Kotor</Link> dan <Link href="/kalkulator/markup">Kalkulator Markup</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
