# Review UI Batch 17

Membaca ini sebagai utilitas operasional seller dengan tarif manual, mengikuti Design System v2 ENERGY1 / RHYTHM2 / MOTION1. Form mendahului ledger, angka utama bergaris biru, rincian menjelaskan angka sebelum pembulatan dan hasil cash. Kanal memakai tabel karena nilai perlu dibandingkan; produk memakai tabel HPP agar komposisi paket dapat diperiksa. Font tabular, warna biru, jarak dan permukaan berasal dari token produk. Tidak menambah CSS/aset/logo platform. Form dan panel sejajar desktop, bertumpuk mobile.

## Bukti

- Node 22, npm ci, typecheck, 567 unit test dan build lulus. 26 unit test baru meliputi fixture independen, konservasi ledger, rounding bertanda, minimalitas inverse kandidat/sebelumnya, ranking eksak/tie, split/reorder bundel, zero demand, batas dan payload invalid. Seluruh 81 engine lama dan helper rasional lama tidak diubah.
- 30 kasus Playwright Batch 17 lulus desktop/mobile. Seluruh suite final: 393 lulus / 1 skip lama untuk matriks mobile yang diuji melalui project desktop. CI dan artifact final dicatat pada PR dengan head SHA sama.
- Browser meliputi normal/invalid/Enter/fokus/error-describedby, stale reset, 2–5 kanal/1–20 produk dengan ID stabil/fokus tambah-hapus, label sebagai teks (tanpa HTML), basis bruto/neto, cash tie, inverse unrounded vs counterexample cash, stok finite/nol-demand/nol-nol/tiny/maksimum, hub16/load-more/search, sitemap92, canonical/noindex/robots dan 404 platform/pajak yang belum terbit.
- Lima form dan hasil diuji 320/375/768/1024/1440; listing maksimum 30 digit, nama kanal 60 karakter dan status stok diuji320px. Tabel bergulir pada region fokus tanpa meluaskan halaman. SSR metode/sumber/FAQ diuji tanpa JavaScript.
- Screenshot desktop1440/mobile375: halaman, hasil, invalid setiap route, settlement negatif setengah rupiah, inverse kebijakan target/maksimum, lima kanal seri, bundel dua produk/kerugian pecahan, status stok dan hub16. Ditinjau visual: settlement negatif desktop, listing mobile, stok nol/nol desktop dan tabel kanal desktop. Hasil/batas/pembulatan terbaca; tabel besar memerlukan gulir yang dilabeli.
- Kontras token tetap: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1. Tidak menambah motion atau warna.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa dan satuan eksplisit; tidak menambah em dash pada copy aplikasi. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; listing maksimum, nama kanal panjang dan nilai stok subpresisi juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #43, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas basis komisi, target payout sebelum pembulatan, kontribusi bundel dan stok nol-demand. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: tarif, basis, diskon, biaya, HPP, stok dan laju harian diisi pengguna; tidak ada preset pengukuran rekaan. |
| R-37 | PASS: arah Design System v2 dan dial dicatat; output mengikuti identitas lembar hitung. |
| R-38 | PASS: contoh adalah fixture matematika, sumber diperiksa, tanpa klaim pelanggan, tarif resmi atau spesifikasi produk rekaan. |
| R-01 | PASS: tidak menambah gradient/glow. |
| R-04 | PASS: tidak menambah ikon atau pustaka ikon. |
| R-06 | PASS: font sistem dan angka tabular berasal dari komponen produk. |
| R-07 | PASS: latar putih/lembut memakai token, tanpa pola dekoratif. |
| R-08 | PASS: tindakan berlabel Hitung, tanpa panah dekoratif. |
| R-09 | PASS: tidak menambah badge/pill. |
| R-10 | PASS: panel produk memakai permukaan opaque. |
| R-12 | PASS: struktur memakai border dan jarak token, tanpa bayangan baru. |
| R-13 | PASS: outline fokus token, tanpa glow. |
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan enam belas alat. |
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
| C-4 | PASS: normal, invalid, nol, maksimum dan subpresisi diuji; settlement negatif desktop, listing mobile, status stok nol/nol desktop dan tabel kanal desktop ditinjau visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan ledger eksak, penyesuaian pembulatan dan hasil cash menjaga pemahaman hasil. |

Review React: EconomicsForm menyimpan hasil lokal, menghitung domain hanya saat submit dan menghapus panel/tabel pada setiap perubahan. StructuredForm membagikan key/ID stabil dan fokus baris yang sudah ada; penambahan field text hanya memberi keyboard teks untuk nama, tanpa mengubah kontrol numerik lama. Tidak memakai label atau indeks visual untuk key form. Baris tabel memakai ID snapshot hasil; hasil dihapus saat susunan input berubah. Semua label dirender React sebagai teks, tanpa dangerouslySetInnerHTML. Sumber/metodologi tetap server-rendered. Checklist react-best-practices diterapkan pada TSX baru; tidak ada fetch, efek hitung atau state turunan tersinkronisasi lewat efek.

Kebijakan akurasi terlihat dalam UI: ledger fee eksak (atau pecahan jika melampaui delapan desimal), hasil cash serta adjustment; perbandingan terbaik sebelum pembulatan dan semua seri; target listing sebelum pembulatan dengan nilai satu rupiah lebih rendah; status stok nol-demand/nol-nol sebagai jawaban utama, bukan angka pendukung yang menyesatkan. Tidak ada preset tarif, cap, pajak atau janji settlement resmi.

Inventaris100IDunik/86terbit/16Marketplace/20Sehari-hari/5hub/92sitemapURL. Hub memuat12kartu awal dan4kartu lanjutan dengan fokus ke kartu baru pertama. Production/domain/DNS/alias/redirect dan indexing staging tidak diubah; tidak merge/auto-merge.
