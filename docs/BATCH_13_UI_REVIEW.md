# Review UI Batch 13

Membaca ini sebagai utilitas harga, pembagian tagihan dan persen untuk penggunaan sehari-hari. Arah Design System v2, ENERGY 1 / RHYTHM 2 / MOTION 1. Angka tabular dan garis hasil biru menjadi fokus. Form/hasil sejajar desktop dan bertumpuk mobile; metodologi sesudah hasil. Tidak menambah CSS, token, ikon atau aset. Tiga tabel memakai CSS Module jadwal yang tersedia, dengan caption, header baris/kolom dan scroll region berfokus. Native selector memisahkan dua operasi persen dan memilih satuan maupun metode biaya bersama.

## Bukti

- Node22: npm ci (0 vulnerabilities), typecheck, seluruh unit test, build dan Playwright desktop/mobile dijalankan. Hasil final dan artifact dicatat pada PR.
- 32 tes unit baru membawa total416. Fixture independen dan invarian menguji produk diskon, pembulatan cash sekali, harga satuan lintas satuan sekeluarga, ranking eksak/tie/near-tie, Hamilton dan konservasi rupiah, persen bertanda, basis nol, delta enam desimal, batas besar dan malformed input.
- tests/everyday.spec.ts memuat28 kasus project desktop/mobile: enam alur pada lima route, label, Enter, invalid/fokus/aria-describedby, reset hasil, mode/select, minimum/maksimum baris, stable key/HTML ID setelah hapus, tabel berfokus/ArrowRight, SSR metodologi/sumber tanpaJS, hub/search/sitemap/canonical/noindex/robots dan404 alat belum terbit.
- Matriks320/375/768/1024/1440 menguji semua enam alur, tabel dan hub tanpa overflow dokumen. Harga satuan sangat besar pada320px juga diuji. Project mobile tetap320px, fixture screenshot375px; desktop screenshot1440px.
- Screenshot halaman penuh, hasil dan invalid untuk semua alur; tambahan diskonRp1 dengan50%+50%, unit price near-tie, Hamilton seri, perubahan negatif sangat kecil dan basis nol. Hasil harga satuan dan tagihan mobile, tabel rekonsiliasi desktop serta hub desktop ditinjau visual. Angka/teks membungkus; tabel bergulir dalam region.
- Token tetap: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1. Tidak menambah pasangan warna.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa, rentang en dash, dan tanda minus untuk perubahan negatif. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; angka maksimum dan tingkat negatif subpresisi juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #34, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: enam alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas faktor diskon, ranking eksak, subtotal per orang, pembagi nol dan perubahan dari awal nol. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: harga, ukuran, subtotal, service dan pajak adalah input manual; tidak ada tarif pajak atau kebijakan toko rekaan. |
| R-37 | PASS: arah Design System v2 dan dial dicatat; output mengikuti identitas lembar hitung. |
| R-38 | PASS: contoh adalah fixture matematika, sumber diperiksa, tanpa klaim pelanggan atau kebijakan merchant rekaan. |
| R-01 | PASS: tidak menambah gradient/glow. |
| R-04 | PASS: tidak menambah ikon atau pustaka ikon. |
| R-06 | PASS: font sistem dan angka tabular berasal dari komponen produk. |
| R-07 | PASS: latar putih/lembut memakai token, tanpa pola dekoratif. |
| R-08 | PASS: tindakan berlabel Hitung, tanpa panah dekoratif. |
| R-09 | PASS: tidak menambah badge/pill. |
| R-10 | PASS: panel produk memakai permukaan opaque. |
| R-12 | PASS: struktur memakai border dan jarak token, tanpa bayangan baru. |
| R-13 | PASS: outline fokus token, tanpa glow. |
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan lima alat. |
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
| C-4 | PASS: normal, invalid, nol, negatif dan subpresisi diuji; hasil harga satuan mobile, tagihan mobile, rekonsiliasi desktop dan hub desktop diperiksa visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan harga cash/model, pemenang biaya eksak dan delta/persen menjaga pemahaman hasil. |

Review React: state hanya hasil lokal dan mode persen. Mode key me-remount form agar input/hasil tidak terbawa. StructuredForm, ResultPanel dan Select dipakai kembali; rowConfig.min opsional memulai dua kemasan/orang, default satu mempertahankan seluruh form lama. Counter ID monoton dan key stabil menjaga nilai uncontrolled dan fokus ketika baris dihapus. Tabel hanya memformat output engine; perhitungan tidak berasal dari DOM atau angka tampilan. Sumber, contoh, FAQ dan related links server-rendered. Checklist react-best-practices diterapkan pada TSX baru.

Scope tagihan adalah satu subtotal seluruh item tiap orang. Equal hanya membagi service+pajak; item pribadi tetap milik orang tersebut. Proporsional menolak subtotal nol dengan biaya positif. Hamilton mengalokasikan sisa rupiah tanpa selisih dan tie mengikuti urutan visual. Harga satuan mengutamakan kemasan minimum eksak; catatan menjelaskan jika tampilan sama. Perubahan persen dari awal nol menjawab tidak terdefinisi, dengan delta/akhir tetap tampil. Diskon membedakan potongan model dari penghematan kas setelah pembulatan.

61 engine lama dipertahankan. Pembaruan tes lama mencakup katalog66, lima hub, sitemap72 dan route baru. Satu tes horizon pinjaman maksimum diberi timeout khusus30detik setelah dua run lokal melewati5detik; fixture, batas iterasi dan assertion residual tidak diubah. Tidak mengubah domain production, redirect, alias, env indexing atau robots staging.
