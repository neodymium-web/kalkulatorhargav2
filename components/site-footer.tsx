import layout from './ui/layout.module.css'
import styles from './site-header.module.css'

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={`${layout.container} ${styles.footerContent}`}>
      <strong className={styles.footerTitle}>KalkulatorHarga</strong>
      <nav aria-label="Alat tambahan dan arsip" className={styles.footerLinks}>
        <a href="/kalkulator/emas">Emas manual</a>
        <a href="/bandingkan">Bandingkan biaya marketplace</a>
        <a href="/kalkulator/saham/average">Average saham dan impas</a>
        <a href="/kalkulator/tiktok/benchmark">Analisis engagement TikTok manual</a>
        <a href="/blog">Arsip catatan seller (perlu review)</a>
      </nav>
    </div>
  </footer>
}
