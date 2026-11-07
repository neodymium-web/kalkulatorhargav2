# Review UI Batch 14

Membaca ini sebagai utilitas kalender, jadwal kerja dan skenario perjalanan sehari-hari. Arah Design System v2, ENERGY1 / RHYTHM2 / MOTION1. Angka tabular dan motif garis hasil biru memusatkan perhatian pada jawaban; font sistem dan jarak token memisahkan input, hasil dan metodologi. Form/hasil berdampingan desktop, bertumpuk mobile. Tidak menambah aset, CSS atau token. Tabel tanggal libur membandingkan klasifikasi yang memengaruhi hitungan, dengan header/caption dan scroll region berfokus dari CSS Module tabel bersama.

## Bukti

- Node22 npmci (0 vulnerabilities), typecheck,474unit test, build dan seluruh Playwright lulus lokal. Browser309lulus/1skip lama (matriks layout mobile yang dijalankan pada project desktop). CI, artifact dan SHA deployment dicatat pada PR.
- 58tes unit baru: Gregorian400tahun/97kabisat/146097hari, anchor weekday, adjacency bulan/abad, reverse guard, ordinal maksimum, minggu penuh vs enumerasi independen, ledger libur unik/duplikat/weekend/di luar rentang, maximality anniversary asli, menit shift dan pembulatan rasional BBM. Total474unit test lulus lokal.
- tests/calendar-time.spec.ts:28kasus project desktop/mobile meliputi kelima form normal/invalid/Enter/fokus/aria-describedby/stale, selector mode/pola/akhir shift, tanggal kosong/terbalik, libur opsional0–100baris dengan keyboard tambah/hapus dan ID stabil, tabel berfokus/ArrowRight, kasus batas dan SSR tanpaJS. Seluruh28lulus targeted.
- Zona waktu host UTC/Jakarta/NewYork/Kiritimati/Honolulu diuji pada unit. Browser context NewYork/Kiritimati/Jakarta memverifikasi tanggal transisi DST, clamp usia dan jam dinding tidak mengubah hasil. Tidak ada Date atau timestamp dalam engine.
- Lima lebar320/375/768/1024/1440 menguji kelima hasil, tabel libur dan hub10alat tanpa overflow dokumen. BBM maksimum diuji pada320px. Screenshot desktop1440/mobile375, project mobile320 tetap dipertahankan.
- Screenshot halaman penuh/hasil/invalid semua5route, dedupe dan klasifikasi libur, usia sebelum anniversary, rentang tanggal maksimum, shift malam/1menit, BBM pecahan berulang/subpresisi dan hub10alat. Usia mobile, tabel libur desktop, BBM subpresisi desktop/mobile serta hub10alat desktop ditinjau visual. Hasil dan catatan membungkus; tabel bergulir dalam region.
- Token tidak berubah: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1. Tidak menambah pasangan warna atau motion.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa, rentang en dash, dan tanda minus untuk perubahan negatif. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; angka maksimum dan konsumsi BBM positif subpresisi juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #37, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: lima alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas inklusif, libur manual, kelahiran 29 Februari, akhir shift eksplisit dan biaya dari rasio asli. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: tanggal, pola kerja, libur, jam, jarak dan harga BBM diisi pengguna; tidak ada tarif BBM, hari libur atau ketentuan kerja rekaan. |
| R-37 | PASS: arah Design System v2 dan dial dicatat; output mengikuti identitas lembar hitung. |
| R-38 | PASS: contoh adalah fixture matematika, sumber diperiksa, tanpa klaim pelanggan atau kebijakan kerja atau tarif rekaan. |
| R-01 | PASS: tidak menambah gradient/glow. |
| R-04 | PASS: tidak menambah ikon atau pustaka ikon. |
| R-06 | PASS: font sistem dan angka tabular berasal dari komponen produk. |
| R-07 | PASS: latar putih/lembut memakai token, tanpa pola dekoratif. |
| R-08 | PASS: tindakan berlabel Hitung, tanpa panah dekoratif. |
| R-09 | PASS: tidak menambah badge/pill. |
| R-10 | PASS: panel produk memakai permukaan opaque. |
| R-12 | PASS: struktur memakai border dan jarak token, tanpa bayangan baru. |
| R-13 | PASS: outline fokus token, tanpa glow. |
| R-14 | PASS: anatomi kartu katalog tetap untuk membandingkan nama dan tujuan sepuluh alat. |
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
| C-4 | PASS: normal, invalid, nol, batas kalender dan subpresisi diuji; usia mobile, tabel libur desktop, BBM subpresisi desktop dan hub10alat ditinjau visual. |
| C-5 | PASS: klaim perhitungan ditelusuri ke fixture dan sumber. |
| R-05 | PASS: komposisi mengikuti tugas utilitas, tanpa struktur hero pemasaran. |
| R-11 | PASS: kontrol dan panel memakai radius token produk yang berbeda. |
| R-15 | PASS: tombol Hitung menyatakan tindakan sebenarnya. |
| R-16 | PASS: copy menjelaskan arti angka, tanpa buzzword pemasaran. |
| R-20 | PASS: identitas KalkulatorHarga tetap lewat motif hasil, katalog dan wordmark. |
| R-21 | PASS: tema terang mengikuti arahan produk. |
| R-29 | PASS: tidak menambah warna baru. |
| R-30 | PASS: memakai komponen repository, tanpa menyalin template merek lain. |
| R-31 | PASS: pemisahan jumlah hari/minggu, usia kalender/total hari, menit/jam desimal dan liter/biaya menjaga pemahaman hasil. |

Review React: CalendarForm menyimpan hasil lokal saja. StructuredForm, ResultPanel dan kontrol bersama dipakai kembali. Perluasan tipe field time menampilkan input waktu native; field lain tetap berperilaku sama. Holiday rows memakai rowConfig.min=0 yang sudah didukung, tanpa mengubah kontrak state/ID lama. Menghapus baris terakhir memfokuskan tombol tambah. Tabel hanya memformat data unik yang sudah diklasifikasikan engine; tidak menghitung ulang dari DOM. Metodologi, FAQ, sumber dan relasi tetap server-rendered. Checklist react-best-practices diterapkan pada TSX baru, tanpa fetch/waterfall atau state turunan yang diduplikasi.

Keputusan visual mengikuti makna data: hari kerja final menjadi jawaban utama dengan ledger terpisah; tabel menjelaskan tanggal yang mengurangi hitungan. Usia tahun/bulan/hari tampil bersama, total elapsed days terpisah. Shift menampilkan jam+menit tepat dan jam desimal yang dibulatkan. BBM positif subpresisi dibedakan dari nol eksak; biaya kasRp0 tetap menyebut nilai sebelum pembulatan bila positif. Konvensi kalender dan akhir hari dipilih eksplisit, tanpa tanggal sistem atau aturan hukum/tarif otomatis.

66engine lama tidak diubah. Tes lama memperbarui jumlah katalog71,Sehari-hari10,sitemap77,dan Selisih Tanggal yang kini terbit; kategori lain tetap20/11/20/10. Main berasal0c746d42,commit pertama hanya verifikasi sumber/rumus. Production/domain/DNS/alias/redirect dan indexing staging tidak diubah. Tidak merge atau auto-merge.
