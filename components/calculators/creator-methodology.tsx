import Link from 'next/link'
import { creatorTools, creatorModes, type CreatorSlug } from '../../lib/creator-analytics/tools'
import { creatorSources } from '../../lib/creator-analytics/sources'
import styles from '../ui/layout.module.css'
export function CreatorMethodology({ slug, formulaVersion }: { slug: CreatorSlug; formulaVersion: string }) {
  const tool = creatorTools[slug]
  const rounding = slug === 'tarif-endorsement'
    ? 'Harga komponen produksi dibulatkan ke atas ke rupiah utuh untuk memenuhi margin minimum, lalu hak pakai ditambahkan sekali tanpa margin. Biaya dasar, kompensasi kerja dan surplus memakai sen eksak. Margin efektif ditampilkan dua desimal dan tidak terdefinisi jika komponen produksi nol.'
    : slug === 'tiktok'
      ? 'Rasio, average dan pendapatan model ditampilkan dua desimal; penawaran sponsor ceiling ke rupiah utuh pada komponen produksi. Selisih A/B dihitung dari rasio eksak sebelum pembulatan. Pembagi nol menghasilkan status tidak terdefinisi. Sumber pendapatan neto dalam sen dijumlah sekali dengan platform model sebelum membulatkan total.'
      : slug === 'waktu-tonton'
        ? 'Jam dan menit dibulatkan sendiri ke dua desimal dari ledger waktu eksak, tanpa mengonversi nilai tampilan yang sudah dibulatkan. Nilai tepat setengah increment dibulatkan ke atas; hasil positif di bawah presisi diberi tanda kurang dari 0,01 unit.'
        : slug === 'ctr'
          ? 'Rasio dihitung dari hitungan eksak dan dibulatkan sekali ke dua desimal persen, nilai setengah dibulatkan ke atas. Hasil positif yang membulat nol diberi tanda <0,01%. Impresi nol ditolak, bukan menghasilkan CTR nol.'
          : 'Pendapatan model dihitung dari pecahan eksak, lalu dibulatkan sekali ke dua desimal rupiah dengan nilai setengah ke atas. Nilai positif yang membulat nol ditandai <Rp0,01. Nol tayangan atau RPM tepat nol memberi Rp0,00.' 
  return <>
    <h2>Cara menghitung</h2><p>{tool.formula}</p>
    <h3>Contoh perhitungan</h3><p>{tool.example}</p>
    {slug === 'tiktok' && Object.entries(creatorModes).map(([id, mode]) => <section key={id}>
      <h3>Modul: {mode.title}</h3><p>{mode.hint}</p><p>{mode.formula}</p><p>{mode.example}</p><p>{mode.assumptions}</p>
      {mode.faq.map(f => <div key={f.question}><h4>{f.question}</h4><p>{f.answer}</p></div>)}
    </section>)}
    <h3>Presisi dan pembulatan</h3>
    <p>{rounding}</p>
    <h3>Asumsi dan batas penggunaan</h3><p>{tool.assumptions}</p><p>{tool.hint}</p>
    <p>Input kosong, negatif, nonfinite, eksponen dan angka di atas batas ditolak. Seluruh nilai merupakan data atau asumsi pengguna, tanpa tarif otomatis atau jaminan hasil.</p>
    <h3>Sumber rumus</h3><ul>{tool.sources.map(id => <li key={id}><a href={creatorSources[id].url}>{creatorSources[id].title}</a></li>)}</ul>
    <p>Diperiksa 7 November 2026.{slug === 'tiktok' ? ' Pengumuman TikTok 2024 adalah konteks historis, bukan verifikasi aturan program saat ini.' : ' Sumber menjelaskan konsep, bukan tarif otomatis.'}</p>
    <h3>Pertanyaan tentang perhitungan ini</h3>{tool.faq.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}
    <p>Gunakan juga {(Object.keys(creatorTools) as CreatorSlug[]).filter(s => s !== slug).map((s, i) => <span key={s}>{i > 0 && ', '}<Link href={`/kalkulator/${s}`}>{creatorTools[s].title}</Link></span>)}.</p>
    <p>Temukan metrik iklan dan akun lain pada <Link href="/media-sosial">kategori Media Sosial</Link>.</p>
    <p className={styles.version}>Versi rumus {formulaVersion}</p>
  </>
}
