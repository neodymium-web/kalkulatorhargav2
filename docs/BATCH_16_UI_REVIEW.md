# Review UI Batch 16

Utilitas konversi satuan dan pengukuran mengikuti Design System v2: ENERGY1 / RHYTHM2 / MOTION1. Hasil utama bergaris biru, pecahan eksak dan basis satuan menjadi rincian pendukung. Memakai CSS Modules, token, font tabular dan komponen produk yang sudah ada; tanpa CSS atau aset baru. Form/hasil sejajar desktop dan bertumpuk mobile.

## Bukti

- Node 22, npm ci (0 vulnerabilities), typecheck, 541 unit test dan build lulus. Seluruh Playwright: 363 lulus, 1 skip lama untuk matriks mobile yang sudah diuji dari project desktop. CI final dan artifact dicatat di PR pada SHA yang sama.
- 33 unit test baru: fixture independen/Python Fraction, semua pasangan panjang/massa, roundtrip dan transitivitas sebelum kuantisasi, skala dua arah, transformasi suhu affine, nol mutlak, pembulatan bertanda, nol/maksimum/subpresisi dan payload invalid. 76 engine lama dan helper rasional lama tidak diubah.
- 28 kasus Playwright baru desktop/mobile: lima route dengan kedua mode denah, normal/invalid/Enter/error focus, swap mempertahankan nilai input, mode denah membersihkan kolom lain, hasil stale dibersihkan, SSR metodologi/FAQ/sumber, canonical, noindex/robots, hub 20/load-more/pencarian dan sitemap 87 URL.
- Enam alur form diuji pada lebar 320/375/768/1024/1440. Hasil skala dan massa maksimum, suhu negatif sangat kecil dan kecepatan maksimum diuji pada 320 px tanpa overflow.
- Screenshot desktop 1440/mobile 375 halaman, hasil dan invalid tersedia dalam artifact browser-evidence. Ditinjau visual: massa sembilan desimal desktop, pecahan panjang mobile, suhu negatif subpresisi mobile. Angka, label dan catatan membungkus; pecahan dan arah nilai negatif tetap terbaca.
- Kontras token tidak berubah: teks utama/putih 17,85:1, sekunder/latar lembut 7,24:1, biru/putih 5,17:1. Tidak menambah pasangan warna atau motion.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa dan satuan eksplisit; tidak menambah em dash pada copy aplikasi. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; angka maksimum, pecahan panjang dan nilai subpresisi juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #41, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas satuan resmi, skala dua arah, nol mutlak dan durasi perjalanan. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: nilai, satuan, skala, jarak dan durasi diisi pengguna; tidak ada preset pengukuran rekaan. |
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
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan dua puluh alat. |
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
| C-4 | PASS: normal, invalid, nol, maksimum dan subpresisi diuji; hasil massa desktop, pecahan panjang mobile dan suhu negatif subpresisi mobile ditinjau visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan pecahan eksak, angka tampilan dan basis satuan menjaga pemahaman hasil. |

Review React: UnitsForm menggunakan controlled input dan hasil lokal untuk pertukaran satuan serta reset mode yang eksplisit. Perubahan input membersihkan hasil; penukaran mempertahankan angka asli, bukan menyalin hasil dibulatkan. Metadata yang sama menentukan kontrol, payload dan urutan error. ID berasal dari useId, option memakai key satuan stabil. Tidak ada efek hitung, fetch atau mutasi DOM. Perhitungan berada di domain BigInt/rasional; metodologi dan sumber tetap SSR. Checklist react-best-practices diterapkan pada dua TSX baru tanpa mengubah form kalkulator lama.

Hasil panjang/skala/suhu/kecepatan memakai enam desimal; massa sembilan. Pecahan eksak tetap ditampilkan. Pembulatan setengah menjauhi nol tidak menghilangkan arah nilai nonnol subpresisi. Input suhu diperiksa terhadap nol mutlak sebelum konversi atau pembulatan. Penukaran satuan bukan janji bahwa hasil desimal terbatas dapat disalin balik tanpa kehilangan informasi.

Inventaris 100 ID unik, 81 terbit, 20 Sehari-hari, 5 hub dan 87 sitemap URL. Hub memakai Directory 12 kartu per muat dengan fokus ke kartu pertama yang ditambahkan. Tes lama hanya menyesuaikan katalog/pagination/404 alat belum terbit. Production/domain/DNS/alias/redirect dan indexing staging tetap; tidak merge/auto-merge.
