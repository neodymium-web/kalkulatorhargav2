# Review UI Batch 12

Membaca ini sebagai utilitas kreator untuk model pendapatan, metrik akun dan penawaran berbasis biaya. Arah Design System v2, ENERGY 1 / RHYTHM 2 / MOTION 1. Angka tabular dan garis hasil biru menjadi fokus; font sistem, layout, radius dan jarak memakai komponen produk. Form dahulu, hasil lalu metodologi panjang pada mobile; form/hasil sejajar desktop. Mode selector native menampilkan satu modul aktif agar delapan alur tidak menjadi satu form panjang. Tabel A/B dipakai karena data perlu dibandingkan per baris, dengan scroll region pada layar sempit. Tidak menambah aset atau CSS/token.

## Bukti

- Node22: npm ci (0 vulnerabilities), typecheck, 384 unit tests, build dan seluruh Playwright lulus. Browser final253passed/1skipped, skip hanya matriks layout mobile lama; lima lebar eksplisit diuji desktop project.
- 33 tes unit baru dengan vektor independen dan invarian: CTR, model RPM, rekonsiliasi sumber neto, empat mode, margin minimum ceiling, hak terpisah, selisih rasio bertanda sebelum pembulatan, null/tiny/zero/large dan ledger waktu bersama.
- tests/creator-analytics.spec.ts: kelima route dan keempat mode TikTok desktop/mobile, Enter, label/select, fokus pertama invalid, aria-describedby, stale reset, input/reset antar modul, table focus/ArrowRight, SSR seluruh metodologi tanpaJS, hub10/search/sitemap66, canonicalTikTok, seller/legacy404, noindex/robots.
- Pilihan native diuji melalui API selectOption yang didukung Playwright serta fokus Tab/Shift+Tab. Asumsi Home/ArrowUp memilih nilai pada popup OS tidak dipakai karena berbeda antara lingkungan desktop/mobile. Tidak menambah key handler aplikasi yang mengambil alih perilaku native.
- Viewport320/375/768/1024/1440 menguji semua delapan alur, tabel dan hub tanpa overflow dokumen. 320px juga menguji uang/quote maksimum dan selisih negatif subpresisi.
- Screenshot desktop/mobile halaman penuh, hasil dan invalid untuk semua mode; tambahan CTR>100%, RPM0/tiny, pendapatan dengan realisasi neto dan half-sen, akun pembagi0, selisih rasio, harga minimum/zero dan watchtiny. Hasil pendapatan mobile, ratecard desktop serta tabel A/B desktop/mobile ditinjau visual. Tabel bergulir dalam region; angka hasil panjang membungkus.
- Artifact browser-evidence memuat screenshot dan laporan CI. Pasangan token tetap: teks utama/putih17,85:1, sekunder/latar lembut7,24:1, biru/putih5,17:1.

## Delivery gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy baru memakai tanda baca biasa, rentang en dash, dan tanda minus untuk perubahan negatif. |
| R-03 | PASS: lebar dokumen cocok dengan lima viewport; angka maksimum dan tingkat negatif subpresisi juga diuji pada 320 px. |
| R-17 | PASS: angka contoh adalah fixture matematika yang diturunkan dan diuji, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial atau profil rekaan. |
| R-23 | PASS: identitas produk dipakai kembali; hub dan komponen produk dipakai kembali untuk lima route yang diotorisasi Issue #32, tanpa aset visual baru. |
| R-24 | PASS: breadcrumb, hub, pencarian dan alat terkait berasal dari registry terbit; tidak ada tautan ke alat belum terbit. |
| R-25 | PASS: seluruh komponen memakai pasangan token berkontras yang dicatat di atas. |
| R-26 | PASS: delapan alur submit dan semua kolom baru dipakai Playwright; perubahan input membersihkan hasil. |
| R-27 | PASS: instruksi kosong, hasil, status batas dan ringkasan invalid tersedia; perhitungan sinkron tidak membutuhkan loader. |
| R-28 | PASS: FAQ membahas CTR, RPM, neto per sumber, basis akun, hak pakai dan ledger waktu. |
| R-32 | PASS: Enter menghitung, field invalid pertama difokuskan dan error terhubung lewat kontrol bersama. |
| R-33 | PASS: TSX ditulis langsung sebagai source, tanpa patch UI runtime. |
| R-34 | PASS: mengikuti tema terang yang ditetapkan sistem desain; tidak menambah kontrol tema. |
| R-35 | PASS: produksi lokal dijalankan Playwright; kelima form, hub dan pencarian dilalui. |
| R-36 | PASS: hitungan, RPM, pendapatan dan biaya adalah input manual; tidak ada tarif platform, klaim eligibility atau benchmark rekaan. |
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
| C-4 | PASS: normal, invalid, nol, negatif dan subpresisi diuji; pendapatan hipotetis, range sponsor dan tabel A/B diperiksa visual. |
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

Review React: state hanya hasil lokal dan pilihan modul; key mode me-remount form untuk menghapus input/hasil sebelumnya. StructuredForm, ResultPanel dan Select dipakai kembali. Aritmetika tetap di domain murni Zod/BigInt; tabel hanya memformat output engine. Metodologi semua mode, FAQ, sumber dan contoh tetap server-rendered. Tidak ada fetch, efek, widget tab palsu atau koneksi akun baru. Checklist react-best-practices diterapkan pada TSX baru.

Setiap keputusan visual mendukung pembacaan: satu hasil utama, rincian sumber uang dengan pemisah, selector progresif untuk empat tugas, dan tabel sejajar A/B tanpa warna ranking. RPM neto asumsi dan realisasi sumber lain dibedakan; total bukan payout terverifikasi. Model sponsor memakai harga internal dan hak terpisah, tanpa standar per follower. UI YouTube menyebut total views video non-Shorts sesuai basis RPM. Watch time tidak disebut jam publik yang memenuhi YPP.

56 engine lama dipertahankan. Tes lama hanya memperbarui jumlah katalog dan status route baru, termasuk pemisahan TikTok kreator terbit dari seller belum terbit. Semua regresi lulus. Tidak mengubah domain production, redirect, alias atau indexing staging. TikTok Help yang tidak terbaca tidak dipakai mengklaim kebijakan sekarang; Newsroom2024 dilabeli konteks historis.
