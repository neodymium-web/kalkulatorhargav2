import Link from "next/link";
import { BenchmarkForm } from "../../../../components/calculators/creator-form";
import { Breadcrumb } from "../../../../components/breadcrumb";
import { canonicalOrigin, pageMetadata } from "../../../../lib/seo";
import styles from "../../../../components/ui/layout.module.css";
export const metadata = pageMetadata(
  "Benchmark TikTok: Analisis Engagement Manual",
  "Bandingkan engagement dua akun atau cohort dari data Anda sendiri, berdasarkan followers atau views. Tanpa median industri atau dataset benchmark resmi.",
  "/kalkulator/tiktok/benchmark",
);
export default function BenchmarkPage() {
  return (
    <div className={`${styles.container} ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Analisis engagement TikTok manual",
            url: canonicalOrigin + "/kalkulator/tiktok/benchmark",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            inLanguage: "id-ID",
          }),
        }}
      />
      <Breadcrumb current="Analisis engagement TikTok manual" />
      <h1>Benchmark TikTok: analisis dan perbandingan manual</h1>
      <p>
        Masukkan data dua akun atau cohort yang Anda berhak gunakan. Halaman ini
        tidak menyediakan median, kuartil, tier industri atau data akun
        otomatis. Dataset benchmark legacy belum tersedia dengan hak dan metode
        yang terverifikasi; fitur ini belum mencapai paritas studi legacy.
      </p>
      <p>
        Samakan periode, cakupan konten dan definisi aksi. Pilih basis followers
        atau views; jangan membandingkan dua penyebut berbeda sebagai standar
        yang sama. Tidak ada data yang dikirim untuk lookup akun.
      </p>
      <BenchmarkForm />
      <section className={styles.methodology}>
        <h2>Metode dan contoh independen</h2>
        <p>
          ER = (suka + komentar + simpan + bagikan) ÷ basis × 100%. Masukkan
          total aksi, bukan persentase yang sudah dibulatkan. Perbandingan = ER
          B − ER A dalam poin persentase, dihitung dari rasio eksak BigInt
          sebelum tampilan dibulatkan dua desimal. Pembagi nol menghasilkan
          status tidak terdefinisi, bukan nol persen.
        </p>
        <p>
          A 100 aksi dari 1.000 pengikut dan B 100 aksi dari 2.000 pengikut: 10%
          dan 5%, selisih −5 poin persentase. Jika basis views masing-masing
          1.000 dan 800, hasilnya 10% dan 12,5%, selisih +2,5 poin persentase.
          Tidak ada kesimpulan kualitas akun atau ambang industri dari dua
          contoh ini.
        </p>
        <h2>Batas analisis</h2>
        <p>
          Sampel pilihan sendiri tidak representatif otomatis. Jumlah video,
          periode, paid/organic, jenis aksi, bot dan cara pencatatan memengaruhi
          hasil. Data per-video tidak boleh disebut benchmark per-akun tanpa
          metode agregasi. Simulasi tidak mengambil tabel pihak ketiga, menjamin
          kelayakan monetisasi, atau menyatakan hak publikasi data Anda.
        </p>
        <Link href="/kalkulator/tiktok">
          Kalkulator TikTok Kreator: empat modul manual
        </Link>
      </section>
    </div>
  );
}
