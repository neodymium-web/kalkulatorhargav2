# Review UI Batch 8

Arah visual: Design System v2 yang sudah dipakai aplikasi, ENERGY 1 / RHYTHM 2 / MOTION 1. Form, hasil, metodologi dan katalog memakai komponen produk. Angka utama bergaris biru menjadi fokus; batas dan asumsi mendukung pembacaan hasil.

## Bukti

- Node 22: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e`.
- 201 unit test lulus. Pemeriksaan mencakup minimalitas setoran dengan rekursi bulanan independen, ledger deposito, gain bertanda, dan batas akar CAGR.
- Seluruh Playwright: 135 passed, 1 skipped. Skip adalah tes matriks layout lama di project mobile; lebar CSS eksplisit diperiksa project desktop.
- Sesudah perbaikan copy CAGR: typecheck, build, dan 24 tes browser Batch 8 kembali lulus.
- `tests/investment.spec.ts`: 320/375/768/1024/1440 px, lima route, status kosong/invalid/hasil, fokus, Enter, hub10alat, pencarian, canonical, sitemap45URL, noindex dan 404 alat belum terbit.
- Artifact CI `browser-evidence` berisi halaman penuh, hasil jarak dekat, invalid, setoran0, surplus subrupiah, dana darurat surplus/pengeluaran0, deposito pembulatan/net negatif, ROI negatif kecil, CAGR negatif/kehilangan total/nilai akhir positif dan near-zero320px.
- Screenshot normal serta batas diperiksa. Angka dan catatan membungkus tanpa overflow dokumen. Detail algoritme ada di verifikasi rumus, sedangkan UI menjelaskan definisi, pembulatan dan batas yang relevan.
- CSS/token produk tidak diubah. Pasangan token yang digunakan sama dengan review Batch 7: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa, rentang en dash, dan tanda minus untuk loss. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; near-zero CAGR juga diuji pada320px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dan hub Keuangan dipakai kembali; tidak menambah aset atau struktur navigasi baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan placeholder XIRR. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas minimum setoran, cadangan, potongan manual, ROI negatif dan arus kas CAGR. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: imbal hasil/potongan adalah input manual; tidak ada janji hasil, rekomendasi tenor atau tarif hukum bawaan. |
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
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan10alat. |
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

Review React: hasil disimpan lokal, output diturunkan dari hasil engine, field memakai key stabil, StructuredForm/ResultPanel digunakan kembali. Metodologi, FAQ, contoh dan sumber tetap server-rendered. Tidak ada fetch/efek baru atau perubahan engine Batch 1–7.

Catatan nonblocking PR #23 tetap terpisah dari batch ini. Batas proyeksi baru dinyatakan sebagai batas nilai eksak dan diuji. Rumus maupun perilaku kalkulator bunga/cicilan sebelumnya dipertahankan.
