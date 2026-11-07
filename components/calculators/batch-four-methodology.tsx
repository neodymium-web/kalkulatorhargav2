import { batchFourTools, type BatchSlug } from '../../lib/batch-four/tools'
import styles from '../ui/layout.module.css'

export function BatchFourMethodology({ slug, formulaVersion }: { slug: BatchSlug; formulaVersion: string }) {
  const tool = batchFourTools[slug]
  return <>
    <h2>Cara menghitung</h2>
    <p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3>
    <p>{tool.example}</p>
    <h3>Asumsi dan batas penggunaan</h3>
    <p>{tool.assumptions}</p>
    <p>{tool.limits}</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
