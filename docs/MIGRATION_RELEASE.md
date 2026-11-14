> Rekonsiliasi berikutnya: [Issue #66 dan lima issue terbuka](ISSUE_RECONCILIATION.md). Ringkasan ekspor GSC owner 15 November sudah tersedia sebagai bukti parsial (26 observasi harian); UNKNOWN di plan sebelumnya tidak berarti tidak pernah ada data, melainkan baseline lengkap belum tervalidasi. Raw export, page×query, GA4 dan backlink belum tersedia di repository. Plan/runtime tidak diaktifkan atau diubah.

# Final Release Gate: review persiapan, eksekusi NO-GO

Baseline `main@125e93d240d83ae35f63965289dd87315cb52bcc`. Ditinjau 15 November 2026 (Asia/Jakarta). Spesifikasi dan keputusan owner: [Issue #60](https://github.com/neodymium-web/kalkulatorhargav2/issues/60). Instruksi tugas terbaru mengizinkan satu PR persiapan, bukan aktivasi. Fitur dibekukan; PR #64 tidak dilanjutkan atau dimasukkan ke branch ini.

Sumber keputusan terkini adalah [plan nonaktif](audit/final-release/plan.json), [snapshot Issue #60 dan observasi read-only](audit/final-release/source-snapshot.json), dan laporan `final-release/report.json` dari CI final. [Register sebelumnya](audit/migration-release/register.json), overlay dan model dua hipotesis host adalah bukti historis; bukan keputusan owner terkini. [Dokumen sebelum konsolidasi](https://github.com/neodymium-web/kalkulatorhargav2/blob/125e93d240d83ae35f63965289dd87315cb52bcc/docs/MIGRATION_RELEASE.md) tetap dapat ditelusuri. Koreksi editorial PR #62 sudah berada di main; koreksi tersebut tidak memberi hak publikasi.

## Keputusan yang tersedia dan batasnya

| Item | Bukti/keputusan | Gate yang masih terbuka |
| --- | --- | --- |
| Canonical masa depan | Owner memilih `https://www.kalkulatorharga.com`; pilihan apex lama superseded | Aktivasi canonical/sitemap/host redirect belum disetujui. Runtime tetap apex. |
| Emas dan perbandingan marketplace | Manual scope diterima sebagai pilihan produk | Bukan approval seluruh konten, tarif, hukum, SEO atau release. Tidak dibuka ulang sebagai pekerjaan fitur. |
| Benchmark TikTok | Pertahankan URL sebagai target migrasi masa depan, riset saja | Data berizin dan metodologi sepadan belum tersedia/disetujui. Main tetap 404. |
| Saham | Redirect ke weighted-average-only tidak setara; pertahankan intent/path pada rencana | Main masih 404. PR #64 draft, frozen pada `b46d47d1cfd5a4bb256b0346416e9406e9874bd0`, bukan bagian kandidat ini; parity/order BEI dan SEO belum diterima. |
| Teknis | 180 file aplikasi/konfigurasi dibanding hash baseline dan Git tree | CI/Preview hijau hanya bukti persiapan teknis. Cutover tetap NO-GO. |

## 22 approval publikasi arsip

Semua teks koreksi tetap seperti main. Ledger before/after dan sumber ada pada [editorial #61](ARCHIVE_EDITORIAL_REMEDIATION.md). Belum ada approver/reviewer berwenang, tanggal persetujuan, hak republication/byline, verifikasi proses/klaim aktual, dan disposition publikasi per URL. Peran reviewer tidak diisi sebagai nama orang. Setiap approval dalam plan bernilai null.

| ID | URL | Status |
| --- | --- | --- |
| ARCHIVE-01 | `/kalkulator/tiktok/panduan` | PENDING_OWNER_APPROVAL |
| ARCHIVE-02 | `/biaya-admin-marketplace` | PENDING_OWNER_APPROVAL |
| ARCHIVE-03 | `/update-tarif` | PENDING_OWNER_APPROVAL |
| ARCHIVE-04 | `/blog` | PENDING_OWNER_APPROVAL |
| ARCHIVE-05 | `/metodologi` | PENDING_OWNER_APPROVAL |
| ARCHIVE-06 | `/redaksi` | PENDING_OWNER_APPROVAL |
| ARCHIVE-07 | `/kebijakan-editorial` | PENDING_OWNER_APPROVAL |
| ARCHIVE-08 | `/disclaimer` | PENDING_OWNER_APPROVAL |
| ARCHIVE-09 | `/blog/menghitung-margin-marketplace` | PENDING_OWNER_APPROVAL |
| ARCHIVE-10 | `/blog/strategi-naikkan-profit` | PENDING_OWNER_APPROVAL |
| ARCHIVE-11 | `/blog/biaya-admin-marketplace` | PENDING_OWNER_APPROVAL |
| ARCHIVE-12 | `/blog/fee-shopee-2026` | PENDING_OWNER_APPROVAL |
| ARCHIVE-13 | `/blog/lazada-marketplace-vs-lazmall` | PENDING_OWNER_APPROVAL |
| ARCHIVE-14 | `/blog/pph-22-marketplace` | PENDING_OWNER_APPROVAL |
| ARCHIVE-15 | `/blog/gratis-ongkir-xtra-shopee-2026` | PENDING_OWNER_APPROVAL |
| ARCHIVE-16 | `/blog/tokopedia-tiktok-shop-komisi-dinamis` | PENDING_OWNER_APPROVAL |
| ARCHIVE-17 | `/blog/harga-jual-minimum-marketplace` | PENDING_OWNER_APPROVAL |
| ARCHIVE-18 | `/blog/kalkulator-vs-spreadsheet` | PENDING_OWNER_APPROVAL |
| ARCHIVE-19 | `/blog/cek-dana-cair-shopee` | PENDING_OWNER_APPROVAL |
| ARCHIVE-20 | `/blog/memilih-marketplace-untuk-mulai-jual` | PENDING_OWNER_APPROVAL |
| ARCHIVE-21 | `/blog/engagement-rate-tiktok-2026` | PENDING_OWNER_APPROVAL |
| ARCHIVE-22 | `/blog/kalkulator-average-down-saham-harga-rata-rata` | PENDING_OWNER_APPROVAL |

## Enam referensi legacy

Ini enam instance, bukan enam URL target unik. Keempat referensi root lama mengacu ke pengalaman preset; direktori root v2 bukan padanan otomatis. Seluruhnya tetap nonklik; tidak ada tautan ke arsip permanen rekaan. Hak provenance setelah perpindahan domain juga harus dicakup keputusan publikasi arsip.

| ID | Halaman / teks | Target historis | Status |
| --- | --- | --- | --- |
| REF-01 | `/blog` / kalkulator utama | `https://www.kalkulatorharga.com/` | PENDING_INTENT_DECISION |
| REF-02 | `/blog/kalkulator-vs-spreadsheet` / Kalkulator fee marketplace | `https://www.kalkulatorharga.com/` | PENDING_INTENT_DECISION |
| REF-03 | `/blog/kalkulator-average-down-saham-harga-rata-rata` / Kalkulator average down saham | `https://www.kalkulatorharga.com/kalkulator/saham/average` | PENDING_INTENT_DECISION |
| REF-04 | `/biaya-admin-marketplace` / Buka kalkulator Tokopedia | `https://www.kalkulatorharga.com/` | PENDING_INTENT_DECISION |
| REF-05 | `/biaya-admin-marketplace` / Hitung profit | `https://www.kalkulatorharga.com/` | PENDING_INTENT_DECISION |
| REF-06 | `/kalkulator/tiktok/panduan` / Benchmark engagement rate TikTok | `https://www.kalkulatorharga.com/kalkulator/tiktok/benchmark` | PENDING_INTENT_DECISION |

## Benchmark, saham dan data SEO

Audit dataset dalam Issue #60 membuktikan konsistensi internal kandidat Crawlora, bukan izin upstream/komersial atau kesetaraan benchmark. Sampel video bernilai view tinggi, denominator per-view dengan saves dan bobot video berbeda dari benchmark akun/per-follower; cakupan Indonesia dan periode representatif belum dibuktikan. Socialinsider juga belum memberi bukti lisensi publikasi tabel. Tidak memilih dataset, menyalin data mentah/identifier, menerbitkan angka baru, membuat fake 200, retirement atau redirect generik. Owner perlu menyetujui sumber berizin, cohort/metode, reproduksi independen dan naskah publikasi pada task terpisah.

URL saham tetap blocker tersendiri. Keberadaan artikel yang sudah dikoreksi atau dua kalkulator saham terpisah tidak membuktikan kesetaraan. Usulan historis 301 ke `/kalkulator/rata-rata-beli-saham` tetap tidak aktif dan dikeluarkan dari rencana redirect final. Tidak memperbaiki, menyetujui, merge atau melanjutkan PR #64.

| Bukti yang belum diberikan | Intake yang diperlukan | Status |
| --- | --- | --- |
| GSC | Ekspor minimal enam bulan Pages/Queries dan pairs bila tersedia, indexing/sitemap/inspection, property/host scope, rentang, filter, timezone, waktu ekspor dan gap | UNKNOWN; exports kosong |
| GA4 | Organic landing pages, sessions/engaged sessions/key events, property, rentang/filter/timezone dan waktu ekspor; tanpa PII | UNKNOWN; exports kosong |
| Backlinks / URL hilang | Sumber inbound/referring pages dan log404 yang diizinkan, periode, URL prioritas, reviewer dan disposition | UNKNOWN; exports kosong |

Ekspor singkat terdahulu bukan baseline lengkap. Nol klik benchmark bukan bukti aman menghapus URL. Public crawl 32 path konten bukan seluruh footprint indeks/backlink. Data analytics tidak dapat disimpulkan dari akses Vercel atau CI.

## Konfigurasi review yang belum aktif

[131 baris candidate-urls.csv](audit/final-release/candidate-urls.csv) memisahkan canonical runtime apex dari usulan www; setiap `enabled=false`. Daftar runtime/sitemap lama tidak diubah. Rencana host satu arah apex → www memakai usulan308 untuk mempertahankan arah/status legacy, **bukan konfigurasi yang diimpor Next/Vercel**. Status harus disahkan dalam instruksi aktivasi kelak. Query UTM dipertahankan pada model; query preset/unknown ditahan, bukan dibuang atau disetujui diam-diam. `/kalkulator` → `/` tetap proposal301 yang perlu kajian intent/SEO. Tidak ada aturan redirect saham atau benchmark.

Observasi read-only pada snapshot tugas ini menunjukkan kedua host masih menunjuk project legacy `prj_OtNkapBGqShbDEludYl1Ea5QoLz9`, deployment `dpl_kk6BZ55DrPg8hrnTovFjgWvkeJiJ`, apex308→www; v2 hanya domain platform yang dilaporkan konektor. Ini bukan verifikasi registrar/DNS/TLS, izin Move, snapshot rollback yang disahkan atau bukti SSO runtime baru. Tidak ada mutasi platform.

## Dry-run dan batas bukti

```sh
node scripts/migration/final-release.cjs
node scripts/migration/final-release.cjs --require-release
```

Exit0 berarti pemeriksaan dokumen/model berhasil, tidak berarti GO. Mode kedua wajib exit2 dengan NO-GO. Semua flag apply/deploy/approve ditolak. Script hanya membaca file/Git dan menghitung objek lokal; tidak memiliki klien jaringan atau jalur mutasi platform. CI membandingkan seluruh 180 file runtime/config dengan manifest dan Git baseline, menjalankan 262 kombinasi host/path untuk www, one-hop query, proposal root terpisah, HOLD untuk saham/benchmark/unknown, dan tiga injeksi kegagalan rollback. Model tidak membuktikan recovery nyata atau durasinya.

CI penuh tetap menjalankan regresi otomatis yang ada (tanpa audit manual ulang 100 kalkulator), typecheck, unit, build, Chromium/WebKit, lab, crawl dan dependency audit. Artifact `final-release/report.json` serta `commit.json` mengikat hasil ke head; link CI, artifact dan Preview exact SHA dicatat di PR setelah diverifikasi. Preview READY tidak memberi persetujuan konten atau cutover. Tidak ada perubahan UI sehingga screenshot yang disediakan adalah regresi, bukan desain baru.

## Handoff dan keputusan

**NO-GO**: 22 approval arsip, 6 referensi, benchmark, saham, GSC, GA4, backlink, aktivasi www, redirect root, operasi/rollback, indexing production dan otorisasi eksekusi masih belum ditutup. Plan memuat 38 baris blocker; angka itu mencakup dependensi terkait, bukan 38 insiden independen. Hak publikasi, implementasi, merge dan cutover adalah izin berbeda. Nama operator/backup/decision owner, SHA/deployment release dan rollback yang disahkan, jendela, snapshot DNS/TLS, threshold dan durasi pemulihan tetap null, tidak dikarang.

[Runbook](MIGRATION_CUTOVER_RUNBOOK.md) adalah urutan bersyarat untuk review. Aktivasi kelak memerlukan task baru, semua bukti/approval, exact SHA dan instruksi owner terpisah. Jangan merge PR ini atau mengubah production, domain, DNS, alias, canonical aktif, redirect aktif, noindex/SSO staging berdasarkan paket persiapan ini.

Dasar primer ditinjau pada tugas ini: [Google site move](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Vercel transfer antar-project](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain). Sinyal canonical/redirect/sitemap harus konsisten saat aktivasi yang kelak disahkan; tidak ada jaminan ranking atau trafik. Dokumentasi platform bukan approval tindakan.
