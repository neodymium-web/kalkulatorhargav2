# Review UI Batch 10

Arah visual: Design System v2, ENERGY 1 / RHYTHM 2 / MOTION 1. Antarmuka lembar hitung untuk pengguna yang membandingkan arus kas, cicilan dan kurs manual. Angka utama bergaris biru memakai motif produk; tabel berfokus pada rekonsiliasi. Form diikuti hasil pada mobile, sejajar pada desktop. Font sistem dan angka tabular membantu perbandingan. Jarak, radius, palet dan seluruh CSS Modules dipakai kembali, tanpa aset dekoratif atau navigasi baru.

## Bukti

- Node 22: npm ci, typecheck, 308 unit tests, build dan seluruh Playwright lulus. Browser: 191 passed, 1 skipped (matriks layout mobile lama; lebar eksplisit diuji project desktop).
- 62 unit tests baru mencakup residu independen ACT/365, endpoint, kegagalan konvergensi, tanggal invalid/kabisat, invarian jadwal, pergantian fase, ekstra dan penalti, crossing nonmonotonik serta FX eksak.
- tests/loan-scenarios.spec.ts: lima form, Enter, error/fokus/aria, input tanggal native, tambah/hapus baris dengan isi terjaga, tabel disclosure/keyboard, reset hasil, kedua arah FX, impas sementara/permanen, sumber SSR, hub20alat, pencarian, sitemap55URL, noindex dan unpublished404.
- Layout hasil dan tabel diperiksa 320/375/768/1024/1440 px. Tambahan 320px menguji angka maksimum, tingkat negatif di bawah presisi dan pembayaran penutup lebih besar dari acuan.
- Screenshot desktop/mobile halaman penuh, hasil, invalid dan tabel tersedia pada artifact browser-evidence. Hasil bunga bertanggal, KPR, refinancing sementara serta rincian ditinjau visual; teks membungkus dan tabel bergulir dalam region sendiri.
- Pasangan token tidak berubah: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1.

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
| R-28 | PASS: FAQ membahas tanggal pembayaran, fase bunga, penalti, impas dan arah kurs. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: bunga, biaya, penalti dan kurs adalah input manual; tidak ada janji hasil atau tarif hukum bawaan. |
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
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan20alat. |
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
| C-4 | PASS: normal, invalid, nol, negatif dan subpresisi diuji; hasil negatif dan impas sementara diperiksa visual. |
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

Review React: StructuredForm dan ResultPanel dipakai kembali. Perubahan field atau baris menghapus hasil dan tabel lama; key baris tetap stabil. Metadata, metodologi, contoh, sumber dan FAQ server-rendered. State hanya menyimpan hasil engine, tanpa efek/fetch tambahan. Perhitungan normal sinkron; tidak menambah loader palsu. DetailTable membagikan disclosure/caption/header/scroll focus untuk tiga jenis tabel.

Impas permanen menjadi jawaban utama refinancing. Crossing pertama dan selisih lifetime tetap terlihat agar angsuran rendah tidak terbaca sebagai hemat. Jadwal memisahkan ordinary, extra, penalti, bunga dan pokok; angka footer berasal ledger. Kurs hanya USD/IDR dengan unit output eksplisit. Tingkat efektif bukan klaim APR/EIR regulator dan residu tidak diverifikasi dengan rate tampilan yang dibulatkan.

Tidak mengubah 46 engine lama, CSS/token, domain production atau indexing staging. Perubahan konsumen tes lama terbatas hitungan katalog/URL terbit; seluruh pengujian regresi lulus.
