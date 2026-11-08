# Migration release: keputusan final untuk review

Baseline `main@b8dd6ee6fe9a45bca1b86e793a430ce25ca27844`. Ini rujukan terkini untuk release blocker; dokumen Issue #53/#55/#57 adalah riwayat bertanggal, bukan daftar keputusan aktif.

**Keputusan eksekusi migrasi: NO-GO.** Persiapan teknis dapat direview setelah CI, tetapi tidak ada persetujuan konten, data SEO, host, atau operator yang boleh disimpulkan dari tes hijau. Tidak ada fitur, UI, formula, canonical, indexing, SSO, DNS, domain atau alias yang diubah.

## Bukti dan jumlah yang direkonsiliasi

- 100 kalkulator asli + 2 alat manual tambahan; 6 hub dan 22 arsip = 131 URL sitemap. Fingerprint 180 file aplikasi/konfigurasi dibandingkan baseline oleh tes. Tidak ada audit manual ulang seluruh kalkulator.
- Survey publik historis memuat 37 respons URL/varian/kontrol, bukan 37 halaman konten. Ada 32 path konten unik: 5 preserve, 22 arsip, 2 manual, 1 benchmark, dan 2 proposal redirect. Prioritas trafik seluruhnya UNKNOWN.
- [Peta 131 target](audit/cutover-url-map.csv) tetap; [overlay 32 path legacy](audit/migration-release/legacy-seo-overlay.csv) membedakan keadaan sekarang dari usulan. Tidak menganggap new berarti belum pernah indexed.
- [Register keputusan](audit/migration-release/register.json) memuat 22 baris arsip, 6 instance referensi, dan 11 kelompok gate. 39 baris keputusan bukan 39 insiden independen; beberapa saling terkait. Seluruhnya UNKNOWN, approval null.
- [62 dependensi historis](audit/legacy-link-dependencies.csv): 34 tautan lokal, 22 provenance nonklik, 6 referensi fitur nonklik. Nol dangling anchor tidak berarti nol blocker. Bukti lama tetap memakai timestamp asal.
- [Observasi domain read-only](audit/migration-release/domain-observation.json): kedua hostname masih pada project/deployment legacy; v2 hanya domain platform. Ini tidak membuktikan kepemilikan DNS, hak Move, TLS pada hari cutover, atau rollback nyata.

## 22 arsip: keberadaan teknis bukan persetujuan konten

Semua mempertahankan path, judul, teks dan tanggal sumber beserta notice review. Tidak diam-diam mengoreksi artikel atau menjadikan tarif historis sebagai tarif kini. Setiap baris memerlukan keputusan owner konten/legal/SEO beserta bukti, identitas reviewer dan tanggal. Penanggung jawab berupa peran; nama orang belum diberikan.

| ID | Path | Keputusan release |
| --- | --- | --- |
| ARCHIVE-01 | `/kalkulator/tiktok/panduan` | UNKNOWN |
| ARCHIVE-02 | `/biaya-admin-marketplace` | UNKNOWN |
| ARCHIVE-03 | `/update-tarif` | UNKNOWN |
| ARCHIVE-04 | `/blog` | UNKNOWN |
| ARCHIVE-05 | `/metodologi` | UNKNOWN |
| ARCHIVE-06 | `/redaksi` | UNKNOWN |
| ARCHIVE-07 | `/kebijakan-editorial` | UNKNOWN |
| ARCHIVE-08 | `/disclaimer` | UNKNOWN |
| ARCHIVE-09 | `/blog/menghitung-margin-marketplace` | UNKNOWN |
| ARCHIVE-10 | `/blog/strategi-naikkan-profit` | UNKNOWN |
| ARCHIVE-11 | `/blog/biaya-admin-marketplace` | UNKNOWN |
| ARCHIVE-12 | `/blog/fee-shopee-2026` | UNKNOWN |
| ARCHIVE-13 | `/blog/lazada-marketplace-vs-lazmall` | UNKNOWN |
| ARCHIVE-14 | `/blog/pph-22-marketplace` | UNKNOWN |
| ARCHIVE-15 | `/blog/gratis-ongkir-xtra-shopee-2026` | UNKNOWN |
| ARCHIVE-16 | `/blog/tokopedia-tiktok-shop-komisi-dinamis` | UNKNOWN |
| ARCHIVE-17 | `/blog/harga-jual-minimum-marketplace` | UNKNOWN |
| ARCHIVE-18 | `/blog/kalkulator-vs-spreadsheet` | UNKNOWN |
| ARCHIVE-19 | `/blog/cek-dana-cair-shopee` | UNKNOWN |
| ARCHIVE-20 | `/blog/memilih-marketplace-untuk-mulai-jual` | UNKNOWN |
| ARCHIVE-21 | `/blog/engagement-rate-tiktok-2026` | UNKNOWN |
| ARCHIVE-22 | `/blog/kalkulator-average-down-saham-harga-rata-rata` | UNKNOWN |

Checklist tiap arsip: hak republication; entity/byline/editor yang berwenang; tanggal dan kesegaran sumber; klaim tarif/hukum/studi; kebenaran contoh; janji privacy/proses yang benar-benar berlaku; tautan dan provenance setelah cutover. Redaksi, metodologi, editorial dan disclaimer bukan otomatis kebijakan yang disetujui. Contoh saham/fee dan pembulatan lama tetap perlu koreksi editorial berizin. Alamat asal pada domain yang dipindah bukan arsip permanen. Owner dapat menyetujui provenance historis nonklik atau menyediakan host arsip sah; tidak ada host arsip rekaan.

## Enam referensi: tetap nonklik sampai keputusan intent

| ID | Halaman asal / teks | Target historis | Keputusan |
| --- | --- | --- |
| REF-01 | `/blog` — kalkulator utama | `https://www.kalkulatorharga.com/` | UNKNOWN; nonklik |
| REF-02 | `/blog/kalkulator-vs-spreadsheet` — Kalkulator fee marketplace | `https://www.kalkulatorharga.com/` | UNKNOWN; nonklik |
| REF-03 | `/blog/kalkulator-average-down-saham-harga-rata-rata` — Kalkulator average down saham | `https://www.kalkulatorharga.com/kalkulator/saham/average` | UNKNOWN; nonklik |
| REF-04 | `/biaya-admin-marketplace` — Buka kalkulator Tokopedia | `https://www.kalkulatorharga.com/` | UNKNOWN; nonklik |
| REF-05 | `/biaya-admin-marketplace` — Hitung profit | `https://www.kalkulatorharga.com/` | UNKNOWN; nonklik |
| REF-06 | `/kalkulator/tiktok/panduan` — Benchmark engagement rate TikTok | `https://www.kalkulatorharga.com/kalkulator/tiktok/benchmark` | UNKNOWN; nonklik |

Empat instance menuju root legacy yang berisi preset; direktori v2 bukan padanan preset. Satu menuju average-down legacy dengan ekstra impas yang perlu review; satu menuju benchmark. Tidak memberi href ke root, ER generik atau tool yang hanya serupa nama. Setelah owner memilih retensi, penulisan ulang atau alternatif yang sepadan, perubahan konten/redirect memerlukan task terpisah dan tes intent.

## Benchmark dan dua fitur manual

Benchmark legacy pernah 200, sedangkan v2 tetap 404 dan tidak masuk sitemap. Ini blocker kehilangan URL, **bukan retirement yang disetujui**. [Inventaris audit 16 baris/3 tabel](audit/deferred57/benchmark-inventory.csv) bukan dataset berlisensi. Belum ada hak data, raw cohort/sampel, geografi, tanggal, numerator/denominator, pemisahan per-follower/per-view, definisi statistik dan reproduksi kuartil. Tidak mempublikasikan ulang angka, mengklaim resmi TikTok, membuat fake200 atau redirect ke kalkulator kreator.

Owner harus memilih: menyediakan dataset primer berizin dan acceptance tersendiri; menyetujui removal 404/410 dengan dampak GSC/backlink yang ditelaah; atau menyediakan alternatif setara yang benar-benar disahkan. Tidak ada pilihan yang telah diambil. Legacy tetap pada production sekarang.

Emas manual dan `/bandingkan` sudah berfungsi dalam baseline. Perbedaan live feed/preset versus input manual tetap memerlukan penerimaan owner produk/data; tidak menambah fitur atau tarif untuk menutup gap secara spekulatif. Dokumen rumus dan pengujian sebelumnya dipertahankan.

## SEO, www/apex dan data yang tidak tersedia

| Gate | Keadaan yang terverifikasi | Yang wajib disediakan owner |
| --- | --- | --- |
| GSC | UNKNOWN, tidak ada ekspor baru | 6 bulan Pages/Queries, pairs bila tersedia, clicks/impressions/CTR/position, indexing/sitemaps/inspection; property, filter, timezone, tanggal ekspor dan gap data |
| GA4 | UNKNOWN, tidak ada ekspor baru | 6 bulan organic landing page + query, sessions/engaged sessions/key events, property/filter/timezone/tanggal; tanpa PII |
| Backlink/404 | UNKNOWN | Sumber backlink penting dan log 404 yang diizinkan, periode, URL prioritas dan reviewer |
| Host | Legacy apex→www308; canonical v2 apex | Keputusan tertulis satu host, arah/status redirect dan perubahan canonical bila diperlukan dalam task baru |
| Redirect | 2 usulan, 0 approved | `/kalkulator`→`/` dan average→rata-rata-beli; validasi intent/preset/impas, query, trafik dan sign-off tiap baris |

Memilih apex akan mempertahankan canonical v2 tetapi memerlukan penggantian arah host lama. Memilih www mempertahankan host legacy namun memerlukan perubahan canonical/sitemap v2 yang belum diizinkan. Tidak memilih salah satunya atas nama owner. Kedua arah bersamaan menghasilkan loop. Prefix/query/preset tidak boleh disamakan diam-diam; query selain parameter UTM yang eksplisit dalam fixture berstatus UNKNOWN_QUERY_INTENT.

## Dry-run, regresi dan bukti exact SHA

Jalankan dari root repository:

```sh
node scripts/migration/release-gates.cjs
node scripts/migration/release-gates.cjs --require-cutover
```

Perintah pertama memeriksa konsistensi dan simulasi, exit 0 hanya berarti pemeriksa berhasil. Perintah kedua sengaja exit 2 dengan NO-GO. Tidak ada mode apply. Model menguji 262 kombinasi host/path per calon host, dua redirect host+path langsung, query UTM, 404 benchmark/unmapped, penolakan query preset dan loop; kegagalan setelah host pertama, kedua dan validasi akhir dipulihkan dengan inverse journal. Snapshot adalah objek lokal dari observasi, bukan backup platform yang dapat dieksekusi. Tidak membuktikan TLS/DNS/propagasi, atomic Move, izin operator atau durasi recovery.

CI menjalankan unit, typecheck, build, seluruh Playwright/WebKit otomatis, lab dan crawl yang sudah ada. Laporan gate ada pada artifact browser `migration-release/report.json`, dengan manifest `commit.json` yang sama dengan head. Hasil final, link CI/Preview dan keterbatasan akses dicatat di PR agar tidak membuat self-referential SHA. Tidak ada redesign sehingga screenshot baru bukan bukti perubahan visual; screenshot regresi tetap di artifact. Tidak mengklaim semua 100 kalkulator diperiksa manual ulang.

## GO/NO-GO dan handoff

| Gate | Keputusan | Syarat menutup |
| --- | --- | --- |
| Konsistensi dokumen/model/regresi | GO untuk review hanya setelah CI final sukses | Bukti aktual dan manifest SHA di PR; gagal tes berarti tidak GO |
| Konten, parity, sumber dan SEO | NO-GO | Tutup 22 arsip, 6 referensi, benchmark, manual scope, provenance, ekspor dan mapping dengan keputusan owner yang dapat dilacak |
| Eksekusi domain/cutover | NO-GO | Semua gate konten/data ditutup, host dipilih, snapshot dan rollback platform siap, operator/window/threshold disahkan, otorisasi baru lengkap |

Tidak ada tanggal launch, nama approver, threshold trafik, property analytics atau hak data yang dikarang. Review persiapan bukan approval launch. [Runbook terkini](MIGRATION_CUTOVER_RUNBOOK.md) memuat intake dan rollback; runbook belum dijalankan pada platform.

## Dasar primer

Diperiksa 8 November 2026 Asia/Jakarta. [Google: site move](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes): petakan URL, hindari redirect tak relevan dan chain; Change of Address tidak diperlukan untuk www/non-www pada domain sama. [Google: canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): konsistenkan sinyal URL yang dipilih. [Vercel: transfer domain](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain): perpindahan project berbeda dari transfer kepemilikan; periksa lingkungan tujuan dan daftar domain terkait. Dokumen platform bukan izin mengubah konfigurasi.
