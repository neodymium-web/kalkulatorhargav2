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

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/components/forms/creator-analytics.tsx; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

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

**After yang diusulkan:** Angka studi tanpa rights/cohort/denominator dikeluarkan dari rekomendasi; ER bukan retensi dan penyebut tidak dicampur. Benchmark tetap404.

**Sumber/kebutuhan verifikasi primer:** https://github.com/neodymium-web/kalkulatorhargav2/blob/2f3f1b8ec18e8e555c0193faa1e282bd175614e4/docs/audit/deferred57/benchmark-inventory.csv; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

### 22 `/blog/kalkulator-average-down-saham-harga-rata-rata` — P0

**Before (teks tepat dari baseline):** Contoh lengkapnya begini. Posisi awal 10 lot dengan rata-rata Rp4.500 dari aplikasi broker, jadi modal awal Rp4.500.000 dan fee belinya sudah termasuk. Membeli 5 lot di Rp4.200 menambah nilai Rp2.100.000 plus fee belinya. Total modal jadi sekitar Rp6.626.000 untuk 1.500 lembar, rata-rata turun ke sekitar Rp4.417 per lembar. Dengan tarif jual Stockbit 0,25 persen yang sudah memuat levy, PPN, dan PPh, harga impasnya sekitar Rp4.436 dan minimal harga jualnya Rp4.440 setelah dibulatkan ke fraksi Rp5.

**After yang diusulkan:** Modal6626000, saham1500, asumsi sell fee inklusif0,25% memberi impas4428,404…; tick10 pada rentang ini memberi contoh4430, bukan4436/4440. Tambahan biaya26000 diidentifikasi eksplisit, bukan diklaim tarif broker.

**Sumber/kebutuhan verifikasi primer:** https://www.idx.id/id/produk-layanan/jam-dan-mekanisme-perdagangan/; diperiksa/diupayakan 2026-11-09, status rinci akan dicatat bersama revisi.

**Owner:** hak republication, identitas/byline/tanggal, keputusan konten serta legal/finance bila relevan belum disahkan. Status `PENDING_OWNER_APPROVAL`. Pilihan `APPROVE_REVISED / REQUEST_CHANGES / WITHHOLD`: __________.

## Gate verifikasi

Gunakan tes existing dengan kontrak editorial baru: replay perubahan bernama terhadap snapshot asli, expected text rendered berasal dari ledger, preservasi semua blok/atribut yang tidak diubah, tanggal/byline historis berlabel, oracle rasional independen saham/harga minimum/pembulatan settlement,22route200,131sitemap,6referensi nonklik dan crawl noJS. Fingerprint scope lama harus membolehkan hanya perubahan konten yang direkonsiliasi, bukan dihapus. CI tetap menjalankan Node22,typecheck,unit,build,Playwright/WebKit dan audit dependency tanpa menambah koleksi screenshot masif.

Satu PR `Closes #61`; CI success dan Preview READY exact head. Tanpa izin baru, jangan membuat sharelink; jika SSO302, laporkan keterbatasan body Preview. Tidak merge, production, domain/DNS/alias/canonical/redirect/indexing/protection mutation. Hasil aktual dicatat di PR dan lampiran akhir, bukan angka target dianggap lulus.
