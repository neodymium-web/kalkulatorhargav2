# Review UI Batch 15

Membaca ini sebagai utilitas biaya dan kebutuhan material untuk skenario rumah/toko/proyek sederhana. Arah Design System v2, ENERGY1 / RHYTHM2 / MOTION1. Hasil cash atau kemasan/dus menjadi titik fokus dengan motif garis biru; rincian memisahkan energi, volume, kebutuhan teori dan pembelian. Font sistem/tabular, permukaan dan jarak berasal dari token yang ada. Form/hasil sejajar desktop, bertumpuk mobile. Tabel dipakai untuk alokasi blok air dan volume elemen karena perbandingan baris menjelaskan jumlah. Tidak menambah aset atau warna. Satu CSS Module baru membungkus konstanta π pada teks asumsi, tanpa mengubah CSS global.

## Bukti

- Node22 npmci (0 vulnerabilities), typecheck,508unit test dan build lulus. Seluruh Playwright335lulus/1skip lama untuk matriks layout mobile yang diuji via desktop. Setelah menambah assertion submit pada8blok/20elemen, typecheck/508unit dan26browser batch baru kembali lulus. CI final dan artifact dicatat pada PR dengan SHA yang sama.
- 34unit test baru dengan fixture manual/Python Fraction, enumerasi marginal air terpisah, konservasi volume/biaya, minimalitas ceiling, pembelian/sisa/surplus, konstantaπ dan bounderror, nol/max/tiny/invalid.71engine lama tidak diubah.
- tests/utilities-materials.spec.ts meliputi kelima route normal/invalid/Enter/fokus/aria-describedby/stale,2–8blok/1–20elemen, submit pada maksimum, batas finite vs unbounded, pilihan bentuk, hapus/tambah ID stabil dan kolom bersama, reset dimensi tidak aktif, subrupiah, ceiling dekat batas, SSR tanpaJS, hub15/load-more/search/canonical/noindex/robots/sitemap82/404.
- Lima lebar320/375/768/1024/1440 menguji kelima form/hasil, tabel dan hub setelah load-more. Nilai listrik/kemasan maksimum diuji320px. Tokenπ50desimal sempat meluaskan metodologi320px; pengukuran DOM mengidentifikasi paragraf tersebut, lalu CSS Module pembungkus membuat matriks lulus. Tidak menyembunyikan overflow dokumen.
- Screenshot desktop1440/mobile375 halaman penuh, hasil dan invalid setiap route; tabel air/beton, listrik kecil, air biaya blok eksak/subrupiah, cat/keramik dekat batas ceiling, silinder dan beton kecil, hub15alat. Tabel air desktop, hasil air mobile, cat normal desktop dan cat dekat ceiling mobile ditinjau visual. Tabel bergulir dalam region; angka dan catatan membungkus.
- Warna tetap: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1. Tidak menambah pasangan warna atau motion.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa dan satuan eksplisit; tidak menambah em dash pada copy aplikasi. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; angka maksimum, subpresisi dan konstanta π panjang juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #39, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas tarif manual, blok marginal, ceiling kemasan, ubin persegi panjang dan total volume sebelum pembulatan. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: tarif energi/air, coverage, cadangan dan dimensi diisi pengguna; tidak ada preset tarif, kapasitas truk atau standar campuran rekaan. |
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
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan lima belas alat. |
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
| C-4 | PASS: normal, invalid, nol, batas ceiling dan subpresisi diuji; tabel air desktop, hasil air mobile serta kemasan cat desktop/mobile ditinjau visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan biaya eksak/cash, liter teori/cadangan/pembelian serta ubin/dus menjaga pemahaman hasil. |

Review React: MaterialsForm menyimpan hasil lokal. StructuredForm menambah pilihan baris hanya untuk metadata visibleWhen; key pilihan menurut ID stabil, bukan indeks visual. Baris yang dihapus membersihkan state pilihannya. Filter kolom yang sama membentuk tampilan, payload dan urutan error. Input tidak aktif dilepas dan nilainya dibersihkan saat berganti kembali; field bersama tetap hidup dengan key/ID yang sama. Alat lama tanpa metadata tersebut mempertahankan perilaku sebelumnya. Native select memegang fokus saat beralih; tambah memfokuskan pilihan baris pertama, hapus ke baris terdekat. ResultPanel/table lama dibersihkan pada seluruh perubahan. Checklist react-best-practices diterapkan pada TSX baru; tidak ada fetch, efek hitung, atau penjumlahan dari tampilan.

Keputusan format mengikuti akurasi: air menampilkan biaya blok eksak hingga10desimal sehingga baris dapat direkonsiliasi sebelum biaya tetap dan cash rounding. Cat/keramik menonjolkan pembelian utuh dari pecahan asli, bukan liter/luas tampilan. Beton menyatakan konstantaπ pendekatan dan membedakan dasar/cadangan, dengan catatan jumlah angka baris tampilan bukan total. Tarif, coverage dan cadangan pengguna tidak disamarkan sebagai data resmi.

Hub tetap memakai Directory12kartu per muat. Setelah bertambah15alat, tombol Muat lebih banyak dengan Enter menampilkan tiga kartu terakhir dan memfokuskan kartu pertama yang baru muncul. Inventaris100IDunik/76terbit/15Sehari-hari/5hub/82sitemapURL. Tes lama hanya menyesuaikan katalog, pagination dan404 alat yang masih belum terbit. Production/domain/DNS/alias/redirect dan indexing staging tetap; tidak merge/auto-merge.
