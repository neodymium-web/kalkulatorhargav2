# Review UI Batch 7

Scope: lima kalkulator keuangan, jadwal cicilan, dan hub Keuangan. Arah: lembar hitung Design System v2, ENERGY 1 / RHYTHM 2 / MOTION 1. Hasil utama memakai garis biru produk; jadwal dibuka setelah hasil agar urutan form, hasil, rincian, dan penjelasan tetap jelas.

## Bukti pemeriksaan

- Node 22: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e`.
- Seluruh browser suite: 111 passed, 1 skipped. Skip adalah matriks layout lama pada project mobile; lebar eksplisit diuji oleh project desktop.
- Setelah penajaman copy periode dan tambahan screenshot jarak dekat: typecheck dan build berhasil; `npm run e2e -- tests/finance.spec.ts` 22 passed.
- `tests/finance.spec.ts` mencakup lima hasil/validasi, frekuensi kapitalisasi, jadwal/penutup, bunga nol, pokok nol, pengungkapan subrupiah, status rasio eksak, SEO, hub/search, unpublished 404, dan metodologi tanpa JavaScript.
- Halaman hasil dan jadwal terbuka diperiksa pada 320/375/768/1024/1440 px. Tabel mempunyai region gulir tersendiri; lebar dokumen tetap sesuai viewport.
- Screenshot penuh dan jarak dekat untuk kelima kalkulator pada 1440/375 px, hub, jadwal anuitas/flat, serta sisi saldo akhir tabel mobile disimpan di artifact CI `browser-evidence`.
- Token kontras dihitung dengan luminansi sRGB: teks utama/putih 17,85:1; teks sekunder/latar lembut 7,24:1; biru/putih 5,17:1. CSS baru hanya memakai token produk.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa; rentang memakai en dash dan nilai negatif memakai tanda minus. |
| R-03 | PASS: tes lebar dokumen pada lima viewport, termasuk jadwal terbuka. |
| R-17 | PASS: angka contoh diturunkan di verifikasi rumus dan diuji; tidak ada statistik pengguna/pasar. |
| R-18 | PASS: halaman berisi form, hasil, sumber, contoh, FAQ, dan katalog; tidak ada testimonial. |
| R-23 | PASS: identitas visual memakai komponen produk; hub/navigasi Keuangan diminta Issue #22. |
| R-24 | PASS: hub, pencarian, canonical, breadcrumb dan relasi berasal dari registry rute terbit. |
| R-25 | PASS: kontras token terukur di atas; tabel memakai teks utama dan latar produk. |
| R-26 | PASS: lima submit, seluruh opsi frekuensi, validasi, dan disclosure jadwal dijalankan Playwright. |
| R-27 | PASS: instruksi awal dan pesan invalid memakai ResultPanel; perhitungan sinkron tidak memerlukan state menunggu. |
| R-28 | PASS: FAQ spesifik membahas kapitalisasi, definisi periode, penutup, flat/anuitas, dan basis pendapatan. |
| R-32 | PASS: Enter menghitung dan membuka jadwal; error memfokuskan input invalid pertama; region tabel dapat difokuskan. |
| R-33 | PASS: perubahan UI ditulis langsung pada TSX/CSS Modules, tanpa script patch runtime. |
| R-34 | PASS: tema terang mengikuti lingkup Design System v2; tidak ada kontrol tema baru. |
| R-35 | PASS: build produksi dan click-through otomatis kelima form, select, jadwal, hub, dan pencarian berhasil. |
| R-36 | PASS: asumsi, biaya yang dikecualikan, pembulatan dan batas model dijelaskan; tidak ada klaim kelayakan kredit. |
| R-37 | PASS: arah berasal dari DESIGN_SYSTEM.md; dial dan motif dicatat di awal review. |
| R-38 | PASS: sumber benar-benar diperiksa, contoh adalah simulasi berlabel, dan tidak ada konten pemasaran rekaan. |
| R-01 | PASS: CSS baru tidak memakai gradient/glow. |
| R-04 | PASS: tidak menambah pustaka ikon; disclosure memakai kontrol native. |
| R-06 | PASS: font sistem dan angka tabular mengikuti token untuk keterbacaan angka. |
| R-07 | PASS: latar putih/lembut produk tanpa pola dekoratif. |
| R-08 | PASS: aksi berlabel Hitung dan Lihat jadwal; tidak menambah panah dekoratif. |
| R-09 | PASS: tidak menambah badge atau pill. |
| R-10 | PASS: panel menggunakan permukaan opaque produk, tanpa glassmorphism. |
| R-12 | PASS: struktur memakai border dan whitespace, tanpa bayangan baru. |
| R-13 | PASS: fokus memakai outline biru sesuai token, tanpa efek glow. |
| R-14 | PASS: kartu katalog memakai anatomi tetap agar nama/tujuan alat dapat dibandingkan. |
| R-19 | PASS: kontrol mengikuti transisi warna produk; disclosure native tidak menambah animasi. |
| R-22 | PASS: tidak ada ilustrasi atau aset bitmap baru. |
| Liveliness: dials | PASS: ENERGY 1 / RHYTHM 2 / MOTION 1 sesuai utilitas keuangan yang tenang. |
| Liveliness: focal point | PASS: angka hasil utama besar dan garis biru pada ResultPanel terlihat di screenshot. |
| Liveliness: whitespace | PASS: form/hasil sejajar desktop; jadwal dan artikel mempunyai jarak bagian sesuai token. |
| Liveliness: accent | PASS: biru untuk hasil utama, tautan, aksi, dan fokus sesuai sistem produk. |
| Liveliness: motif | PASS: garis hasil dan wordmark dua batang mempertahankan identitas lembar hitung. |
| C-1 | PASS: layout dan tipografi mengikuti alasan keterbacaan dalam Design System v2. |
| C-2 | PASS: semua kontrol baru mempunyai tindakan yang diuji. |
| C-3 | PASS: setiap bagian mendukung input, audit angka, sumber, atau penemuan alat terkait. |
| C-4 | PASS: sukses, invalid, nol, subrupiah, dan lima lebar layar diuji; screenshot hasil dan jadwal diperiksa. |
| C-5 | PASS: klaim perhitungan dapat ditelusuri ke fixture dan sumber, tanpa klaim pelanggan. |
| R-05 | PASS: komposisi mengikuti tugas menghitung dan memeriksa jadwal, bukan template pemasaran. |
| R-11 | PASS: radius kontrol/panel memakai dua token berbeda; tabel tetap berupa lembar angka. |
| R-15 | PASS: aksi Hitung dan Lihat jadwal menjelaskan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan bunga, periode, biaya dan batas penggunaan dalam bahasa langsung. |
| R-20 | PASS: wordmark, garis biru hasil, dan struktur katalog berasal dari identitas KalkulatorHarga. |
| R-21 | PASS: tema terang mengikuti arahan eksplisit produk. |
| R-29 | PASS: CSS baru tidak menambah warna di luar token. |
| R-30 | PASS: komponen memakai sistem visual repository; tidak mengadopsi template merek lain. |
| R-31 | PASS: keputusan tabel bergulir menjaga kolom angka utuh pada mobile; disclosure menjaga fokus awal pada hasil. |

Pemeriksaan React: state hasil lokal, input reuse StructuredForm, render jadwal dengan key bulan stabil, metadata/metodologi tetap server-rendered, dan tidak ada fetch atau efek baru dalam alur perhitungan. Engine lama Batch 1–6 tidak diubah.
