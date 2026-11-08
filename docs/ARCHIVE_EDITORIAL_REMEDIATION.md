# Rencana remediasi editorial 22 arsip — Issue #61

Baseline `main@2f3f1b8ec18e8e555c0193faa1e282bd175614e4`; audit [Issue #60](https://github.com/neodymium-web/kalkulatorhargav2/issues/60). Commit pertama hanya dokumen rencana. Rencana ini belum mengubah arsip atau mengklaim tes lulus.

Semua 22 status publikasi **PENDING_OWNER_APPROVAL**, cutover **NO-GO**. Pilihan owner www masa depan dan penerimaan dua alat manual hanya keputusan produk/perencanaan; canonical aktif apex, SSO/noindex, routing,131sitemap,100engine,2manual,6hub tetap. GSC parsial pernah disebut di Issue #60, bukan ekspor lengkap yang tersimpan/ditelaah di tugas ini; cakupan GSC/GA4/backlink tetap belum lengkap.

## Metode dan batas

Revisi blok teks minimum dengan ledger before/after yang dapat diputar ulang terhadap baseline. Simpan source snapshot dan tanggal/byline sebagai catatan historis berlabel, bukan identitas atau verifikasi v2. Link historis tetap dapat diaudit; enam referensi unresolved tetap nonklik. Hapus rekomendasi statistik tak terverifikasi, tandai grid tarif sebagai sejarah yang belum disahkan. Tidak membuat solver, tarif, fitur atau approval.

Sumber primer dicek 9 November 2026 Asia/Jakarta. Kode di baseline adalah sumber perilaku v2, bukan bukti log/retensi operasional. Verifikasi awal: BEI idx.id dapat dibaca (tick10 rentang2000–<5000; nomor aturan di halaman berbeda dari referensi lama, perlu dicatat tanpa menebak tanggal efektif); JDIH/DJPFAQ terbaca; salah satu press release DJP diblokir; Shopee7216/24877 hanya app shell; TikTok Support awal tanpa teks, perlu sumber first-party alternatif. Keterbatasan tidak diubah menjadi klaim lolos verifikasi. Ledger final akan mencatat outcome tiap sumber.

## Ledger rencana per URL (22/22)

### 01 `/kalkulator/tiktok/panduan` — P0

**Before (teks tepat dari baseline):** Bawaan rate Creator Rewards di kalkulator adalah Rp0, karena programnya belum tersedia di Indonesia. Kalau programnya sudah tersedia di wilayahmu, ganti rate-nya di panel pendapatan dengan angka yang kamu lihat di laporan Creator Tools-mu.

**After yang diusulkan:** Simulasi Creator Rewards memakai qualified views dan asumsi RPM pengguna; eligibility dan pembayaran harus diperiksa di akun/ketentuan resmi, tanpa klaim negara atau tarif universal.

**Sumber/kebutuhan verifikasi primer:** https://support.tiktok.com/en/business-and-creator/creator-rewards-program/creator-rewards-program; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 02 `/biaya-admin-marketplace` — P0

**Before (teks tepat dari baseline):** Bandingkan biaya admin dan biaya proses Shopee, Tokopedia, TikTok Shop, dan Lazada per kategori. Angka memakai satu subkategori acuan per kategori; tarif subkategori lain bisa berbeda. Selalu cek sumber resmi sebelum menetapkan harga.

**After yang diusulkan:** Tabel adalah snapshot klaim tarif legacy, belum diverifikasi per kategori/tanggal; v2 memakai biaya manual, bukan tabel default resmi.

**Sumber/kebutuhan verifikasi primer:** https://seller.shopee.co.id/edu/article/7216; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 03 `/update-tarif` — P0

**Before (teks tepat dari baseline):** Setiap perubahan tarif yang masuk ke dataset dicatat di sini. Tanggal verifikasi terakhir: 18 Oktober 2026.

**After yang diusulkan:** Tanggal pada changelog adalah catatan historis sumber, bukan bukti pipeline pembaruan atau verifikasi tarif v2.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/tools.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 04 `/blog` — P1

**Before (teks tepat dari baseline):** Engagement rate TikTok 2026: cara hitung dan membacanyaPahami cara menghitung engagement rate TikTok, lalu bandingkan angka Anda dengan median dan kuartil tingkat pengikut dari studi 2026.Benchmark · 20 Oktober 2026

**After yang diusulkan:** Indeks menautkan artikel dengan status review; tidak merekomendasikan angka benchmark atau menyetujui publikasinya.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/issues/60; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 05 `/metodologi` — P0

**Before (teks tepat dari baseline):** Kalkulator ini memakai tarif default dari halaman resmi marketplace, bukan estimasi yang dikarang atau tabel dari situs lain. Setiap baris data menyimpan sumber, tanggal berlaku, dan tanggal verifikasi.

**After yang diusulkan:** Marketplace dan pembanding v2 menghitung tarif manual; tidak ada dataset preset resmi otomatis yang disahkan melalui halaman ini.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 06 `/redaksi` — P0

**Before (teks tepat dari baseline):** Kalkulator Harga adalah alat bantu independen untuk seller marketplace Indonesia. Semua tarif yang dipakai berasal dari halaman resmi marketplace, dicatat dengan sumber, tanggal berlaku, dan tanggal verifikasi. Tidak ada tarif yang ditebak.

**After yang diusulkan:** Identitas redaksi dan proses verifikasi lama adalah klaim historis; entitas, reviewer berwenang, dan bukti proses masih perlu owner.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/issues/60; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 07 `/kebijakan-editorial` — P0

**Before (teks tepat dari baseline):** Halaman kalkulator kreator TikTok punya fitur pencarian akun. Kalau kamu mengetik username sendiri, server kami membaca halaman profil publik TikTok dan mengambil angka publik saja: jumlah pengikut, total suka di akun, jumlah video, serta rata-rata tayangan, suka, komentar, dan bagikan dari beberapa video terbaru. Tidak ada data privat yang diakses, tidak ada akun yang dibuka, dan tidak ada penulisan ke akun mana pun.

**After yang diusulkan:** V2 menggunakan input kreator manual, tanpa pencarian username; praktik log/retensi operasional belum diverifikasi sehingga tidak menjanjikan tidak ada penyimpanan data.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/components/calculators/creator-form.tsx; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 08 `/disclaimer` — P0

**Before (teks tepat dari baseline):** Fitur pencarian akun di kalkulator kreator membaca halaman profil publik TikTok. Angka yang ditampilkan bisa tertunda karena penampungan sisi TikTok, dan bisa saja berbeda dari yang terlihat di aplikasi. Verifikasi angka final kamu di aplikasi TikTok.

**After yang diusulkan:** Simulasi kreator menggunakan angka pengguna, bukan pembacaan profil; tidak ada benchmark endorse resmi atau klaim privacy operasional baru.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/issues/60; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 09 `/blog/menghitung-margin-marketplace` — P1

**Before (teks tepat dari baseline):** Mulai dari harga jual, kurangi biaya admin, biaya program, biaya proses, lalu kurangi HPP. Dana yang tersisa adalah profit bersih yang bisa dipakai untuk mengambil keputusan.

**After yang diusulkan:** Hasil setelah HPP dan biaya yang dimasukkan bukan otomatis laba bersih; definisikan margin terhadap omzet bruto dan bedakan pajak dipungut dari komisi.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 10 `/blog/strategi-naikkan-profit` — P1

**Before (teks tepat dari baseline):** Semua angka di halaman ini memakai sumber dan tanggal verifikasi yang sama dengan kalkulator.

**After yang diusulkan:** Hasil strategi bersyarat pada input manual; bundling tidak selalu menguntungkan dan penurunan HPP harus mempertahankan mutu/cakupan biaya.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/supplemental/comparison.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 11 `/blog/biaya-admin-marketplace` — P0

**Before (teks tepat dari baseline):** Semua angka di halaman ini memakai sumber dan tanggal verifikasi yang sama dengan kalkulator.

**After yang diusulkan:** Tidak menyamakan tanggal/sumber arsip dengan tarif manual kalkulator; verifikasi setiap komponen pesanan dan bukti seller.

**Sumber/kebutuhan verifikasi primer:** https://seller.shopee.co.id/edu/article/7216; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 12 `/blog/fee-shopee-2026` — P0

**Before (teks tepat dari baseline):** Semua angka di halaman ini memakai sumber dan tanggal verifikasi yang sama dengan kalkulator.

**After yang diusulkan:** Tidak menyatakan default tarif atau cap per unit yang belum didukung; cap v2 per pesanan sesuai scope input.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 13 `/blog/lazada-marketplace-vs-lazmall` — P0

**Before (teks tepat dari baseline):** Selain komisi, pertimbangkan biaya proses pesanan, PPh 22 bila berlaku, biaya iklan per pesanan, dan biaya operasional lain. Kalkulator Lazada menyediakan kolom-kolom tersebut agar dana cair tidak hanya dihitung dari persentase komisi.

**After yang diusulkan:** Tidak ada pemilihan resmi Marketplace/LazMall atau tarif pajak otomatis; gunakan bukti komponen manual, cakupan di luar model ditahan.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/tools.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 14 `/blog/pph-22-marketplace` — P0

**Before (teks tepat dari baseline):** PPh 22 dapat dipotong dari penghasilan seller marketplace bila ketentuan pajak berlaku untuk transaksi tersebut. Kalkulator menyediakan opsi PPh 22 agar simulasi dana cair lebih dekat dengan laporan keuangan, tetapi hasilnya tetap estimasi.

**After yang diusulkan:** Pisahkan tanggal berlaku PMK, penunjukan dan pelaksanaan pemungut; penerapan 0,5% bergantung scope/pengecualian dan bukti periode, bukan otomatis untuk semua seller.

**Sumber/kebutuhan verifikasi primer:** https://jdih.kemenkeu.go.id/dok/pmk-37-tahun-2025; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 15 `/blog/gratis-ongkir-xtra-shopee-2026` — P0

**Before (teks tepat dari baseline):** Gunakan kalkulator Shopee untuk melihat rate normal/khusus yang terisi otomatis dari tabel resmi. Rate tetap bisa diedit jika ketentuan aktual toko berbeda, lalu cocokkan hasilnya dengan rincian pendapatan di Seller Centre.

**After yang diusulkan:** Rate, cap, waiver dan tanggal perubahan lama tidak diverifikasi sebagai aturan sekarang; masukkan bukti seller secara manual tanpa autopreset.

**Sumber/kebutuhan verifikasi primer:** https://seller.shopee.co.id/edu/article/24877; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 16 `/blog/tokopedia-tiktok-shop-komisi-dinamis` — P0

**Before (teks tepat dari baseline):** Komisi dinamis ditambahkan pada tarif dasar ketika kondisi transaksi tertentu terpenuhi. Karena itu angka di dashboard bisa lebih tinggi dari tarif di tabel, dan kalkulator selalu memisahkan biaya dasar dari komisi dinamis agar selisihnya terlihat.

**After yang diusulkan:** Komisi dasar/dinamis adalah baris biaya manual jika bukti transaksi menyatakannya, bukan mapping kategori otomatis.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 17 `/blog/harga-jual-minimum-marketplace` — P1

**Before (teks tepat dari baseline):** Langkah pertama: hitung total biaya platform untuk satu unit pada harga jual sementara. Kedua, tambahkan HPP. Ketiga, tambahkan target margin. Kalau hasilnya tidak masuk akal, ubah HPP atau paket, bukan menebak tarif.

**After yang diusulkan:** Untuk model linear yang dinyatakan: harga minimum=(C+f+L)/(1-r), atau (C+f)/(1-r-m) jika target margin atas harga jual; cap butuh uji cabang, bukan satu penjumlahan fee.

**Sumber/kebutuhan verifikasi primer:** Independent algebra; lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 18 `/blog/kalkulator-vs-spreadsheet` — P1

**Before (teks tepat dari baseline):** Kalkulator memberi tiga hal yang sulit dijaga manual: tarif dengan tanggal berlaku dan sumber, komponen biaya yang dipisahkan, dan cap program yang dihitung per kuantitas.

**After yang diusulkan:** Kalkulator maupun spreadsheet bergantung input, basis dan pembulatan; tidak ada keunggulan dari tarif resmi otomatis yang tidak tersedia.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 19 `/blog/cek-dana-cair-shopee` — P0

**Before (teks tepat dari baseline):** Kalau selisihnya kecil, periksa juga pembulatan. Kalkulator memakai pembulatan rupiah terdekat per komponen, sehingga penjumlahan pembulatan bisa berbeda satu rupiah dari pembulatan total.

**After yang diusulkan:** Engine mempertahankan fee rasional dan membulatkan dana cair sekali; angka tampilan per fee tidak dijumlah ulang sebagai ledger.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 20 `/blog/memilih-marketplace-untuk-mulai-jual` — P1

**Before (teks tepat dari baseline):** Mulai dari satu kanal dan ukur dulu. Menambah kanal kedua sebelum understand biaya kanal pertama membuat kesalahan yang sama terulang dua kali.

**After yang diusulkan:** Gunakan bahasa Indonesia dan basket/HPP setara serta bukti fee/ongkir manual; tidak merekomendasikan kanal dari tarif historis.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/supplemental/comparison.ts; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 21 `/blog/engagement-rate-tiktok-2026` — P0

**Before (teks tepat dari baseline):** Angka acuan 2026 bergerak dan bergantung metodologi. Socialinsider mencatat engagement rate per tayangan 3,85 persen pada paruh pertama 2026 dan 3,90 persen pada kuartal ketiga. SociaVault Labs, yang hanya menghitung akun terverifikasi bersih, mendapat median 4,25 persen per pengikut. Rival IQ dan Quid mencatat 2,01 persen dengan penyebut per pengikut dan sampel 150 perusahaan acak.

**After yang diusulkan:** Angka studi tanpa rights/cohort/denominator dikeluarkan dari rekomendasi; ER bukan retensi dan penyebut tidak dicampur. Benchmark tetap 404.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/docs/audit/deferred57/benchmark-inventory.csv; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 22 `/blog/kalkulator-average-down-saham-harga-rata-rata` — P0

**Before (teks tepat dari baseline):** Contoh lengkapnya begini. Posisi awal 10 lot dengan rata-rata Rp4.500 dari aplikasi broker, jadi modal awal Rp4.500.000 dan fee belinya sudah termasuk. Membeli 5 lot di Rp4.200 menambah nilai Rp2.100.000 plus fee belinya. Total modal jadi sekitar Rp6.626.000 untuk 1.500 lembar, rata-rata turun ke sekitar Rp4.417 per lembar. Dengan tarif jual Stockbit 0,25 persen yang sudah memuat levy, PPN, dan PPh, harga impasnya sekitar Rp4.436 dan minimal harga jualnya Rp4.440 setelah dibulatkan ke fraksi Rp5.

**After yang diusulkan:** Modal6626000, saham1500, asumsi sell fee inklusif0,25% memberi impas4428,404…; tick10 pada rentang ini memberi contoh4430, bukan4436/4440. Tambahan biaya26000 diidentifikasi eksplisit, bukan diklaim tarif broker.

**Sumber/kebutuhan verifikasi primer:** https://www.idx.id/id/produk-layanan/jam-dan-mekanisme-perdagangan/; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

## Gate verifikasi

Gunakan tes existing dengan kontrak editorial baru: replay perubahan bernama terhadap snapshot asli, expected text rendered berasal dari ledger, preservasi semua blok/atribut yang tidak diubah, tanggal/byline historis berlabel, oracle rasional independen saham/harga minimum/pembulatan settlement,22route200,131sitemap,6referensi nonklik dan crawl noJS. Fingerprint scope lama harus membolehkan hanya perubahan konten yang direkonsiliasi, bukan dihapus. CI tetap menjalankan Node22,typecheck,unit,build,Playwright/WebKit dan audit dependency tanpa menambah koleksi screenshot masif.

Satu PR `Closes #61`; CI success dan Preview READY exact head. Tanpa izin baru, jangan membuat sharelink; jika SSO 302, laporkan keterbatasan body Preview. Tidak merge, production, domain/DNS/alias/canonical/redirect/indexing/protection mutation. Hasil aktual dicatat di PR dan lampiran akhir, bukan angka target dianggap lulus.


## Revisi yang disiapkan setelah rencana pertama

Ledger lengkap [changes.json](audit/editorial61/changes.json) mencatat 275 operasi blok berurutan: exact before/after beserta posisi/tag, metadata yang berubah, sumber lama, expected full text dan pilihan owner yang masih kosong. Snapshot sumber [legacy55/source-pages.json](audit/legacy55/source-pages.json) tetap byte-identik; replay wajib cocok sebelum setiap revisi diterapkan. Tidak mengganti assertion teks lengkap dengan sekadar pemeriksaan keberadaan judul.

Judul, H1, URL, canonical aktif, semua elemen tanggal sumber dan hash provenance tetap. Sebelas description diperbaiki sebagai bagian editorial agar tidak menjanjikan preset/proses atau benchmark yang tidak ada. Byline/tanggal ditandai sebagai catatan sumber lama yang belum disahkan, bukan identitas editor aktif. Data numerik grid tarif tetap hanya snapshot klaim historis berlabel; tidak ada tarif baru atau lisensi yang diarang. Semua approval/publication arsip dan owner_status CSV adalah PENDING_OWNER_APPROVAL.

Koreksi saham mendefinisikan Rp26.000 sebagai total biaya beli asumsi yang belum dibuktikan oleh nota, bukan tarif Stockbit. Bruto Rp2.100.000 + Rp26.000 = Rp2.126.000; modal Rp6.626.000/1.500 saham dengan asumsi fee jual inklusif 0,25% memberi impas Rp4.428,404344…; ilustrasi harga Rp4.430 neto Rp6.628.387,50 dan harga Rp4.420 neto Rp6.613.425. Fee beli hipotesis 0,15% justru Rp3.150, bukan Rp26.000. Finance owner masih harus menilai fixture/nota dan ketentuan order; contoh bukan saran transaksi atau janji eksekusi.

Harga minimum adalah penurunan aljabar bersyarat, bukan solver baru. Asumsi C Rp100.000, f Rp5.000, r 10% dan laba nominal Rp20.000 memberi ceil(125000/0,9)=138889; harga sebelumnya gagal. Jika margin 20% atas harga jual, harga Rp150.000 memberi laba Rp30.000. Dengan cap fee Rp10.000 per pesanan, kandidat Rp135.000 memberi laba Rp20.000 dan kandidat Rp134.999 gagal. Basis/diskon, minimum/cap dan biaya tak lengkap tidak disamakan dengan model linear ini. Contoh settlement Rp1 dengan tiga fee masing-masing 50% mempertahankan total Rp1,50 dan dana cair −Rp0,50 → −Rp1, bukan pembulatan tiap fee lebih dahulu.

### Bukti primer dan batas yang masih terbuka

[sources.json](audit/editorial61/sources.json) membedakan sumber terbaca, sumber historis, app shell, security block, search-index-only dan verifikasi perilaku kode. Seluruh pemeriksaan sumber pada 9 November 2026 Asia/Jakarta; bukan tanggal efektif tarif atau tanggal persetujuan publikasi.

| ID sumber | URL / bukti | Hasil dan batas |
| --- | --- | --- |
| V2-SETTLEMENT | https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts | PRIMARY_CODE_READ: Code establishes implemented scope, not hosting logs/retention, operational process or owner/legal publication approval. |
| V2-CREATOR | https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/creator-analytics/tools.ts | PRIMARY_CODE_READ: Code establishes implemented scope, not hosting logs/retention, operational process or owner/legal publication approval. |
| V2-COMPARISON | https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/supplemental/comparison.ts | PRIMARY_CODE_READ: Code establishes implemented scope, not hosting logs/retention, operational process or owner/legal publication approval. |
| BEI-FRACTION | https://www.idx.id/id/produk-layanan/jam-dan-mekanisme-perdagangan/ | PRIMARY_TEXT_READ: Old idx.co.id URL403; readable idx.id page cites Kep-00158/BEI/10-2026, unlike old09-2026 citation. No invented effective date; actual order/day/market rules require verification. |
| PMK37-TEXT | https://www.pajak.go.id/index.php/id/peraturan/penunjukan-pihak-lain-sebagai-pemungut-pajak-penghasilan-serta-tata-cara-pemungutan | PRIMARY_REGULATION_TEXT_READ: Does not establish latest appointment/operational start for a specific marketplace/order. JDIH PDF link404; DJP HTML regulation used instead. |
| JDIH-METADATA | https://jdih.kemenkeu.go.id/dok/pmk-37-tahun-2025 | PRIMARY_METADATA_READ: Not the same as appointment or actual collection start for every marketplace. |
| DJP-FAQ | https://pajak.go.id/marketplace | PRIMARY_TEXT_READ: FAQ appointment dates are not proof for every transaction; latest legal/period-specific evidence still needed. |
| DJP-POSTPONEMENT | https://pajak.go.id/index.php/id/pengumuman/penundaan-waktu-pemberlakuan-ketentuan-pemungutan-pph-pasal-22-oleh-marketplace | SEARCH_INDEX_ONLY_NOT_RECONCILED: Direct reader exposed no complete authoritative announcement/dated attachment. Do not resolve conflicting dates from a search snippet or infer latest operative appointment. |
| DJP-OLD-PRESS | https://stats.pajak.go.id/id/siaran-pers/pemungutan-pph-pasal-22-melalui-marketplace-mulai-dilaksanakan-1-oktober-2026 | SECURITY_BLOCK_PAGE: Not proof of an October start. Owner/legal must supply latest signed notice and appointment evidence before definitive scenario/date claims. |
| SHOPEE7216 | https://seller.shopee.co.id/edu/article/7216 | HTML_SHELL_NO_RATE_TABLE: Historical rate cells retained only as unverified source claims. No current rates, waivers, effective dates or category mappings certified. |
| SHOPEE24877 | https://seller.shopee.co.id/edu/article/24877 | HTML_SHELL_NO_RATE_TABLE: December2026/January2027 claims not adopted as effective policy; seller/account evidence required. |
| TIKTOK2024 | https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program?lang=en | PRIMARY_HISTORICAL_TEXT_READ: Historical context only; not a current country list, universal RPM or eligibility/payout certification. |
| TIKTOKSUPPORT | https://support.tiktok.com/en/business-and-creator/creator-rewards-program/creator-rewards-program | NO_READABLE_TEXT: No new geographic or detailed eligibility rules inferred; directs reader to their own current account/terms. |
| BENCHMARK-RIGHTS | https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/docs/audit/deferred57/benchmark-inventory.csv | RIGHTS_COHORT_NOT_VERIFIED: No third-party benchmark numbers recommended or published as current; benchmark route stays404. |
| OWNER60 | https://github.com/neodymium-web/kalkulatorhargav2/issues/60 | PLANNING_PRODUCT_CHOICES_ONLY: No archive publication, legal/finance signoff, active canonical/routing/indexing or cutover approval. Short GSC discussed externally is not complete six-month GSC/GA4/backlink evidence in this checkout. |
| MATH-ORACLES | https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/lib/platform-settlement/engine.ts | DERIVATION_REVIEW_REQUIRED: Educational assumptions, not broker tariffs, legal determination, production solver or authorized finance approval. Actual test run linked in final PR. |

PMK 37/2025 tersedia sebagai salinan HTML DJP walau link PDF JDIH 404. Tanggal pengundangan dari metadata JDIH dibedakan dari penunjukan dan mulai pemungutan. Rujukan pengumuman Oktober/November 2026 belum dapat disahkan sebagai bukti primer lengkap/terbaru per pemungut; teks tidak menetapkan tanggal operasional definitif atau angka pajak pesanan yang belum terverifikasi. Ini blocker review legal yang tetap terbuka, bukan masalah yang dianggap selesai lewat disclaimer.

Sumber TikTok 2024 hanya konteks qualified-view/RPM historis; akses Support tidak memberi teks terbaca untuk mengesahkan negara/syarat terkini. Statistik studi pihak ketiga ditarik sebagai rekomendasi dan tautannya diberi label rujukan historis; tidak ada klaim lisensi/cohort terverifikasi. Benchmark tetap 404 dan enam referensi unresolved tetap nonklik.

### Handoff publikasi per URL

Setiap baris tetap PENDING_OWNER_APPROVAL, reviewer/keputusan owner null. Kolom pilihan sengaja kosong; tidak ada hak atau identitas editorial yang disahkan oleh tes.

| URL | Risiko | Blok direvisi | Sumber primer / bukti | Pilihan owner (APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD) |
| --- | --- | --- | --- | --- |
| `/kalkulator/tiktok/panduan` | P0 | 24 | V2-CREATOR, TIKTOK2024, TIKTOKSUPPORT, BENCHMARK-RIGHTS | |
| `/biaya-admin-marketplace` | P0 | 15 | V2-SETTLEMENT, SHOPEE7216, SHOPEE24877 | |
| `/update-tarif` | P0 | 23 | V2-SETTLEMENT, SHOPEE7216, SHOPEE24877 | |
| `/blog` | P1 | 9 | V2-CREATOR, V2-SETTLEMENT, BENCHMARK-RIGHTS | |
| `/metodologi` | P0 | 25 | V2-SETTLEMENT, V2-CREATOR, BEI-FRACTION | |
| `/redaksi` | P0 | 11 | V2-SETTLEMENT, OWNER60 | |
| `/kebijakan-editorial` | P0 | 12 | V2-CREATOR, V2-SETTLEMENT, OWNER60 | |
| `/disclaimer` | P0 | 5 | V2-CREATOR, OWNER60 | |
| `/blog/menghitung-margin-marketplace` | P1 | 9 | V2-SETTLEMENT, PMK37-TEXT | |
| `/blog/strategi-naikkan-profit` | P1 | 7 | V2-COMPARISON | |
| `/blog/biaya-admin-marketplace` | P0 | 10 | V2-SETTLEMENT, SHOPEE7216 | |
| `/blog/fee-shopee-2026` | P0 | 9 | V2-SETTLEMENT, SHOPEE7216 | |
| `/blog/lazada-marketplace-vs-lazmall` | P0 | 10 | V2-SETTLEMENT, PMK37-TEXT | |
| `/blog/pph-22-marketplace` | P0 | 11 | PMK37-TEXT, JDIH-METADATA, DJP-FAQ, DJP-POSTPONEMENT, DJP-OLD-PRESS | |
| `/blog/gratis-ongkir-xtra-shopee-2026` | P0 | 13 | SHOPEE7216, SHOPEE24877, V2-SETTLEMENT | |
| `/blog/tokopedia-tiktok-shop-komisi-dinamis` | P0 | 9 | V2-SETTLEMENT, V2-COMPARISON | |
| `/blog/harga-jual-minimum-marketplace` | P1 | 9 | MATH-ORACLES, V2-SETTLEMENT | |
| `/blog/kalkulator-vs-spreadsheet` | P1 | 10 | V2-SETTLEMENT | |
| `/blog/cek-dana-cair-shopee` | P0 | 10 | MATH-ORACLES, V2-SETTLEMENT | |
| `/blog/memilih-marketplace-untuk-mulai-jual` | P1 | 9 | V2-COMPARISON | |
| `/blog/engagement-rate-tiktok-2026` | P0 | 11 | V2-CREATOR, BENCHMARK-RIGHTS | |
| `/blog/kalkulator-average-down-saham-harga-rata-rata` | P0 | 22 | BEI-FRACTION, MATH-ORACLES | |

## Verifikasi dan scope guard

Hanya lib/legacy/pages.json berubah pada 180 file aplikasi/konfigurasi yang dibekukan. 179 file lain tetap hash-identik. Pengecualian pemeriksa scope hanya berlaku jika replay sumber asli→ledger→JSON saat ini cocok seluruhnya; perubahan yang tidak tercatat, approval owner rekaan atau perubahan file aplikasi lain tetap gagal. Komponen/layout/engine,100 ID, 2 manual, 6 hub, 22 path dan 131 URL sitemap tidak berubah. Workflow CI tidak diubah.

Unit/typecheck/build dan browser harus dilaporkan sesuai run aktual di PR. Screenshot existing tetap di CI; dua capture tambahan hanya untuk contoh saham yang berubah, bukan koleksi baru seluruh kalkulator. CI/artifact/Preview exact HEAD ditautkan di PR. SSO 302 hanya membuktikan edge protection/noindex, bukan body aplikasi; tanpa izin spesifik baru tidak ada sharelink.

## Keputusan

0/22 owner publication approvals. Cutover STRICT NO-GO. Owner tetap harus meninjau hak/byline/tanggal tiap URL, legal/finance dan evidence gap; benchmark disposition, enam referensi, data SEO lengkap, dua redirect, implementasi www terpisah, TLS/domain/operator/live rollback serta otorisasi eksekusi belum tertutup. Keputusan Issue60 menerima dua alat manual dan memilih www masa depan tidak memberi izin publikasi arsip atau mengubah canonical apex yang aktif.

Inspeksi visual terbatas: lima viewport benar-benar dilihat (kebijakan desktop/mobile, contoh saham desktop/mobile, grid arsip mobile). Hash/dimensi/batas inspeksi ada di [visual-review.json](audit/editorial61/visual-review.json). Tidak mengklaim seluruh 22 arsip/semua piksel fullpage dilihat ulang. Fraksi/angka dan notice terbaca, tidak ada overlap/overflow halaman; paragraf saham yang berlanjut di bawah viewport bukan clipping konten. ENERGY2/RHYTHM1/MOTION1 mengikuti DS yang ada; tidak ada asset, identitas, layout atau CSS baru. Gate copy: klaim palsu diperbaiki, sumber dan batas dinyatakan, tidak ada angka/approval/testimoni rekaan; gate visual terbatas PASS.
