# Review UI Pajak Batch18

Membaca ini sebagai alat estimasi pajak dengan cakupan hukum eksplisit, mengikuti Design System v2 ENERGY1/RHYTHM2/MOTION1. Garis biru dan angka tabular menandai hasil; bila kelayakan tidak diketahui, status menjadi jawaban utama tanpa nominal pajak. Warna, font, jarak dan permukaan berasal dari token yang sudah ada. Form/hasil sejajar desktop, bertumpuk mobile. Ledger UMKM memakai tabel untuk merekonsiliasi bulan, kumulatif, eksak dan cash. Tidak menambah CSS, aset, logo pemerintah atau klaim resmi.

## Bukti

- Node22 npmci (0 vulnerabilities), typecheck,599unit dan build lulus.32unit baru: fixture hukum/tanggal, DPP harga vs pajak, NPWP, peran sewa, minimum gross-up, threshold±1, ledger cash bulanan, nol/max/invalid dan status tanpaangka.86engine lama dan helper rasional lama tidak diubah.
-32kasus Playwright baru desktop/mobile. Seluruh suite final425lulus/1skip lama untuk matriks mobile yang diuji melalui project desktop. Lima alur normal/invalid/Enter/fokus/aria-describedby/stale; perubahan tanggal/klasifikasi; manual rate wajib;12bulan fiskal tetap; kumulatif OP/badan dan rounding; transisi/kelayakan ditahan; hub Pajak, navigasi, pencarian, canonical, sitemap98, noindex/robots dan404.
- Lima form/hasil serta hub diuji320/375/768/1024/1440. Gross-up maksimum dan status kelayakan panjang diuji320px; tabel bergulir di region berlabel/tabIndex. FAQ/sumber/tanggal berlaku/batas hukum tersedia SSR tanpaJS.
- Screenshot desktop1440/mobile375 setiap halaman/hasil/invalid, PPNinclusive/DPP dan status, PPh23invoicePPN, sewasetor-sendiri, gross-up targeteksak, ledger UMKM ambang/rounding dan status ditahan, hub5alat tersedia dalam artifact CI. Ditinjau visual: PPN inclusive desktop/mobile, status UMKM ditahan desktop, ledger UMKM mobile. Screenshot tabel memakai region gulir, dengan kolom cash terpisah setelah gulir keyboard; layout tidak diperlebar untuk screenshot. Kolom cash dan footer setelah gulir keyboard juga ditinjau visual; CI dan artifact pada SHA final dicatat di PR.
- CI Linux pertama menemukan rumus sewa tanpa spasi melebar343px pada viewport320px. Pengukuran Range text node dengan fontVerdana mereproduksi338px pada paragraf rumus. Operator rumus diberi spasi agar dapat membungkus secara alami; tidak menyembunyikan overflow. Matriks fontArial/Verdana untuk kelima alat ditambahkan. CI pada SHA perbaikan harus lulus sebelum penyerahan.
- Kontras token tetap: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1. Tanpa warna/motion baru.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa dan satuan eksplisit; tidak menambah em dash pada copy aplikasi. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; gross-up maksimum, sumber hukum dan status kelayakan panjang juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #45, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas DPP PPN, cakupan PPh23, peran sewa, gross-up manual dan kelayakan UMKM. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: nominal, tanggal, klasifikasi, tarif simulasi serta fakta kelayakan diisi pengguna; tidak ada preset pengukuran rekaan. |
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
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan lima alat Pajak. |
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
| C-4 | PASS: normal, invalid, nol, maksimum dan subpresisi diuji; PPN inclusive mobile, status UMKM ditahan desktop dan ledger UMKM mobile ditinjau visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan estimasi hukum, simulasi manual, status tanpaangka serta ledger eksak/cash menjaga pemahaman hasil. |

Review React: TaxForm menyimpan hasil lokal dan menghitung hanya saat submit. Setiap perubahan input menghapus hasil, catatan status dan ledger lama. StructuredForm rowConfig.fixed menyembunyikan aksi tambah/hapus hanya untuk12bulan tetap; key/ID stabil dan fokus invalid memakai komponen bersama. Form lama tanpafixed mempertahankan perilaku sebelumnya. Metadata/legal copy dan sumber tetap SSR, bukan fetch client. Label sebagai teks React; tanpa HTML runtime atau efek hitung. Checklist react-best-practices diterapkan pada TSX baru.

Keputusan akurasi terlihat: harga komersial dan DPP PPN terpisah; kas sewa pemotong vs setor sendiri berbeda; gross-up menjamin neto sebelum pembulatan. UMKM menonjolkan eligibility unverified tanpa nominal/ledger saat cakupan belum jelas. Sumber primer dan tanggal efektif tampil dekat hasil serta metodologi, dengan snapshot/model1.0.0; konfirmasi pengguna tidak diklaim verifikasi DJP. Pembulatan simulasi tidak diklaim aturan faktur/setoran resmi.

Batas hukum untuk audit pemilik: otomatisasi UMKM hanya WP baru mulai22April2026, masaMei–November2026. WP lama/PasalIIperalihan, penggabungan belum jelas, omzet melampaui4,8miliar dan profesi/rezim lain ditahan. PPh23 hanya objek biasa badanDN; sewa hanya tanpaPPN dan bukanBGS/akomodasi. PPNrezimkhusus tidak diasumsikan11%/12%. Detail ada pada BATCH_18_FORMULA_VERIFICATION.md.

Inventaris100IDunik/91terbit/5Pajak/6hub/98sitemapURL. Seluruh86alat sebelumnya tetap. Production/domain/DNS/alias/redirect dan indexing staging tidak diubah. Tidak merge/auto-merge.

## Revisi audit PR46 (model/data1.1.0)

Tabel bulanan kini wajib dikonfirmasi mencakup seluruh usaha/lokasi milik satu WP, sejak registrasi. Kolom gabungan Pasal58 hanya menguji kelayakan4,8miliar; hasil memisahkan kumulatif satu WP dan gabungan pihak terkait. Konfirmasi parsial/tidak diketahui dan omzet kosong menghasilkan status tanpa nominal atau ledger. Tidak ada CSS, TSX, warna, domain atau indexing yang diubah dalam revisi ini.

Validasi ulang berurutan: typecheck,607unit,build,429Playwright lulus/1skip lama.40unit Pajak dan36kasus browser Pajak mencakup beberapa usaha WP yang sama, gabungan WP berbeda, ambang0/500juta±1, ketidaklengkapan bulanan/penggabungan, bulan registrasi dan stale result. Guard WP lama/peralihan tetap diuji. Putaran awal pengujian bersamaan mengalami timeout/asset saat build berjalan; putaran final berurutan seluruhnya lulus tanpa perubahan timeout atau pengurangan suite.

Screenshot desktop/mobile `umkm-seluruh-usaha-satu-wp.jpg`, `umkm-gabungan-wp-berbeda.jpg`, `umkm-data-belum-lengkap.jpg` ditambahkan ke artifact otomatis CI. Hasil WPberbeda desktop/mobile serta status ditahan desktop ditinjau visual: label dan nominal terpisah, status utama tanpa angka pajak, teks membungkus. Uji lima viewport dan font320px tetap lulus. Delivery gate di atas tetap berlaku; penambahan konfirmasi memakai komponen Select yang sama, sumber/FAQ tetapSSR. SHA, CI dan artifact final dicatat pada PR setelah upload.
