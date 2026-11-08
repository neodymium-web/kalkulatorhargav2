# Rencana migrasi konten legacy, Issue #55

Baseline beku: `main@83485060ae157855bd1adcf9c5250c231c3e5972`, 8 November 2026. Commit pertama ini hanya dokumentasi rencana, belum menyatakan migrasi atau pengujian lulus.

## Batas dan sumber kebenaran

100 kalkulator published, enam hub dan 107 URL lama wajib tetap. Inspeksi source baseline: app hanya memiliki home, enam hub dan `/kalkulator/[slug]`; tidak ada route untuk 25 halaman di bawah, tidak ada redirect aktif. Dua usulan Issue #53 hanya fixture localhost. Inventaris manual-review berisi tepat 25 URL, bukan dua redirect proposal.

Baca ulang sumber via GET publik host www, concurrency satu, jeda minimum 350 ms, tanpa API/studio/auth; simpan timestamp UTC, hash, status, title/H1, canonical, full content semantik, tautan, JSON-LD dan tanggal yang benar-benar ada. Snapshot Issue #53 tetap immutable; snapshot baru disimpan terpisah. Akses publik membuktikan isi terbit, bukan otorisasi legal, kebenaran tarif terkini, kredensial penulis, atau kepemilikan gambar.

## Inventaris dan kepemilikan route

1. `/kalkulator/tiktok/benchmark`
2. `/kalkulator/tiktok/panduan`
3. `/kalkulator/emas`
4. `/biaya-admin-marketplace`
5. `/bandingkan`
6. `/update-tarif`
7. `/blog`
8. `/metodologi`
9. `/redaksi`
10. `/kebijakan-editorial`
11. `/disclaimer`
12. `/blog/menghitung-margin-marketplace`
13. `/blog/strategi-naikkan-profit`
14. `/blog/biaya-admin-marketplace`
15. `/blog/fee-shopee-2026`
16. `/blog/lazada-marketplace-vs-lazmall`
17. `/blog/pph-22-marketplace`
18. `/blog/gratis-ongkir-xtra-shopee-2026`
19. `/blog/tokopedia-tiktok-shop-komisi-dinamis`
20. `/blog/harga-jual-minimum-marketplace`
21. `/blog/kalkulator-vs-spreadsheet`
22. `/blog/cek-dana-cair-shopee`
23. `/blog/memilih-marketplace-untuk-mulai-jual`
24. `/blog/engagement-rate-tiktok-2026`
25. `/blog/kalkulator-average-down-saham-harga-rata-rata`

Informasi/artikel/panduan yang dapat dibaca utuh: pertahankan path dan teks, heading, struktur list/tabel serta link berguna melalui template server bersama. Hindari gambar tanpa lisensi dan script/HTML mentah. Metadata tanggal/byline hanya yang bersumber; tidak memutakhirkan tanggal publikasi secara diam-diam. Halaman kebijakan diwarisi secara akurat dengan label review owner, bukan kebijakan baru yang diasumsikan sah. Tarif/hukum bertanggal diberi peringatan kesegaran; jangan dipromosikan sebagai tarif resmi terbaru. Keputusan port adalah usulan teknis, tidak dianggap approval manusia.

Tool emas, benchmark, pembanding atau halaman bergantung data/API: inventaris fungsi dan sumber terlebih dahulu. Jangan menerbitkan fake200 atau mengganti kalkulator khusus dengan artikel. Jika kesetaraan tidak dapat diverifikasi, route tetap tidak diimplementasikan, keputusan owner dan task terpisah menjadi blocker.

## Data keluaran dan hitungan

`legacy-page-decisions.csv`: 25 baris dengan status sumber, metadata, kategori, aksi usulan, route, parity, freshness, link impact, provenance dan approval pending. `legacy-content-parity.csv`: hasil aktual, status build, batas/keputusan owner. Tambahkan hanya route yang benar-benar diimplementasikan ke sitemap/map; pertahankan 107 record awal dan snapshot denominator historis. Jumlah URL final tidak ditetapkan sebelum inspeksi sumber. 100 kalkulator tidak bertambah lewat halaman konten.

## Validasi dan gate

- Node22 clean npmci, typecheck, unit, production build, seluruh Playwright desktop/mobile dan WebKit; noJS/privacy100 form tidak berkurang.
- Periksa 25 outcome, full-text parity blok semantik, tidak ada script/HTML tidak aman, tanggal/tautan/provenance, metadata, canonical origin tetap, noindex dan robots tidak berubah.
- BFS dari root mencapai semua route yang benar-benar diterbitkan, link internal tidak404, blog index SSR berurutan stabil, sitemap set sesuai registry + content registry, unknown404. Tool tertunda tidak dibuat fake200.
- Keyboard/focus, axe, lebar320/375/768/1440, screenshot desktop/mobile diinspeksi; CI/artifact dan Preview READY harus exact SHA final.
- Akses Preview terlindungi hanya setelah izin baru bila fetch membuat sharelink23jam. Tidak mewarisi izin PR54.

Dokumen keputusan owner mencakup 25 outcome, hak konten/entity/legal, tarif seller manual, GSC/GA4/backlinks enam bulan, apex/www, perangkat nyata dan operator rollback. Rekomendasi persiapan harus jujur; domain move tetap NO-GO sampai seluruh blocker/approval ditutup. Host policy diuji sebagai draft/fixture saja.

Tidak mengubah domain/DNS/alias/canonical/legacy production/indexing/env/protection, tidak menambah analytics/API eksternal, tidak mengaktifkan redirect live. Runbook tetap DRAFT; PR Closes #55, tanpa merge/auto-merge.
