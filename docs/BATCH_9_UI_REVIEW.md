# Review UI Batch 9

Arah visual: Design System v2 yang sudah dipakai aplikasi, ENERGY 1 / RHYTHM 2 / MOTION 1. Form, hasil, metodologi dan katalog memakai komponen produk. Angka utama bergaris biru menjadi fokus; batas dan asumsi mendukung pembacaan hasil.

## Bukti

- Node 22: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e`.
- 246 unit test lulus. Pemeriksaan mencakup nilai kini rasional, NPV bertanda sebelum pembulatan, rekonsiliasi inflasi, rata-rata berbobot banyak transaksi, biaya saham dan ROI bertanda.
- Seluruh Playwright: 161 passed, 1 skipped. Skip adalah tes matriks layout lama di project mobile; lebar CSS eksplisit diperiksa project desktop.
- Sesudah memperjelas batas NPV: typecheck, build, dan 54 tes browser Batch 9 serta konsumen form dinamis lama kembali lulus.
- `tests/valuation.spec.ts`: 320/375/768/1024/1440 px, lima route, status kosong/invalid/hasil, fokus, Enter, hub15alat, pencarian, canonical, sitemap50URL, noindex dan 404 alat belum terbit.
- Artifact CI `browser-evidence` memuat screenshot desktop/mobile halaman penuh, hasil, validasi, rincian NPV, NPV negatif subpresisi, pembulatan inflasi, nilai kini kecil dan rugi saham.
- Screenshot hasil desktop/mobile ditinjau. Angka dan catatan membungkus; tabel bergulir di wilayah sendiri. Seluruh lebar dokumen diuji 320/375/768/1024/1440 px.
- CSS/token produk tidak diubah. Pasangan token yang digunakan sama dengan review Batch 7: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa, rentang en dash, dan tanda minus untuk loss. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; hasil dan tabel juga diuji pada320px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dan hub Keuangan dipakai kembali; tidak menambah aset atau struktur navigasi baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas waktu arus kas, nilai kini, inflasi, lot manual dan biaya saham. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: diskonto, inflasi, ukuran lot, fee dan pajak adalah input manual; tidak ada janji hasil atau tarif hukum bawaan. |
| R-37 | PASS: arah Design System v2 dan dial dicatat; output mengikuti identitas lembar hitung. |
| R-38 | PASS: contoh ditandai sebagai simulasi, sumber diperiksa, tanpa klaim pelanggan atau keamanan rekaan. |
| R-01 | PASS: tidak menambah gradient/glow. |
| R-04 | PASS: tidak menambah ikon atau pustaka ikon. |
| R-06 | PASS: font sistem dan angka tabular berasal dari komponen produk. |
| R-07 | PASS: latar putih/lembut memakai token, tanpa pola dekoratif. |
| R-08 | PASS: tindakan berlabel Hitung, tanpa panah dekoratif. |
| R-09 | PASS: tidak menambah badge/pill. |
| R-10 | PASS: panel produk memakai permukaan opaque. |
| R-12 | PASS: struktur memakai border dan jarak token, tanpa bayangan baru. |
| R-13 | PASS: outline fokus token, tanpa glow. |
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan15alat. |
| R-19 | PASS: hanya perilaku/transisi kontrol produk yang sudah tersedia. |
| R-22 | PASS: tidak ada ilustrasi baru. |
| Liveliness: dials | PASS: ENERGY1/RHYTHM2/MOTION1 sesuai tugas menghitung dan meninjau rincian. |
| Liveliness: focal point | PASS: hasil utama besar bergaris biru terlihat pada screenshot. |
| Liveliness: whitespace | PASS: form/hasil sejajar desktop dan bertumpuk mobile, metodologi mengikuti hasil. |
| Liveliness: accent | PASS: aksen biru membagi fungsi aksi, tautan, fokus dan hasil utama. |
| Liveliness: motif | PASS: garis hasil dan wordmark dua batang mempertahankan identitas produk. |
| C-1 | PASS: pilihan visual mengikuti keterbacaan lembar hitung yang sudah ditetapkan. |
| C-2 | PASS: seluruh kontrol baru menghitung atau menavigasi ke rute terbit. |
| C-3 | PASS: setiap bagian menjelaskan input, hasil, contoh, pembulatan, sumber atau alat terkait. |
| C-4 | PASS: normal, invalid, nol, negatif dan subpresisi diuji; hasil bertanda diperiksa visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan angka utama/rincian dan catatan arah rasio menjaga pemahaman hasil. |

Review React: hasil disimpan lokal dan dibersihkan saat input berubah. Output diturunkan dari engine, baris dinamis memakai key stabil, StructuredForm/ResultPanel dipakai kembali. Tambah/hapus baris mempertahankan nilai dan fokus; label NPV mulai Tahun 0. Metodologi, contoh, FAQ dan sumber tetap server-rendered. Tidak ada fetch/efek baru atau perubahan engine batch sebelumnya.

NPV menjumlahkan pecahan eksak sebelum membulatkan total; rincian menjelaskan kemungkinan selisih jumlah baris tampilan. Nilai positif/negatif di bawah presisi tampilan tetap menampilkan arah. Konfigurasi baris baru bersifat opsional; label dan batas lama tetap diuji untuk bahan, kemasan dan payback.
