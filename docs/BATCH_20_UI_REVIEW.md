# Review UI Batch20

Empat alat settlement manual untuk penjual memakai bahasa lembar hitung Design System v2: ENERGY1 / RHYTHM2 / MOTION1. Reuse StructuredForm, ResultPanel, kontrol berlabel, tabel dengan region scroll, token font/warna/jarak. Tidak menambah aset, font, ikon, motion atau pola halaman baru. Sumber dan metodologi tetap SSR di bawah kalkulator.

## Bukti dan keputusan

- Node22.23.4; npm ci (0 vulnerabilities), typecheck,789unit dan build lulus.25unit baru menjalankan vektor independen untuk keempat platform serta invariant katalog. Semua96alat lama tetap tersedia dan engine lamanya tidak berubah.
-20pengujian Playwright baru desktop/mobile lulus: normal/invalid/status/stale/SEO/screenshot tiap platform; cap/minimum/custom/scope; negatif±half-rupiah; pemetaan kredit ongkir; ketidaklengkapan; batas12baris; labelduplikat; keyboard/fokus; lima viewport; tanpaJS; pencarian,20Marketplace dan107sitemap. Putaran penuh final dan bukti CI dicatat di PR pada SHA final yang sama.
- Form awal memiliki0baris fee, tanpa angka tarif bawaan. Semua nominal wajib diisi termasuk0. Jenis/basis/scope/batas belum diketahui dan kelengkapan belum dikonfirmasi tidak menghasilkan angka dana cair. Kasus retur/sengketa/pajak terpisah/cap per unit ditahan.
- Field kondisional bertingkat mengikuti parent dan membersihkan pilihan turunannya saat parent berubah. Add/remove mempertahankan key/input/fokus baris; tidak membawa basis custom lama ke fixed. Mengubah input selalu menghapus hasil dan ledger.
- Lebar dokumen diuji sama dengan320/375/768/1024/1440px untuk setiap platform, termasuk nominal maksimum serta label fee panjang. Arial/Verdana320 juga lulus. Tabel saja yang bergulir horizontal dan dapat difokuskan/digeser keyboard; tidak memakai overflow:hidden pada halaman.
- Screenshot fullpage, hasil dan invalid tiap platform tersedia di artifact browser-evidence untuk desktop/mobile. Tambahan settlement-negatif, settlement-belum-lengkap dan marketplace-20. Ditinjau visual: hasil Shopee mobile dan TikTok Shop desktop, status tanpaangka desktop, dan hasil negatif mobile. Nama platform dan dana cair menjadi jawaban utama; setelahHPP dan eksak/cash terpisah, teks panjang membungkus.
- Kontras mewarisi token terverifikasi: teksutama/putih17,85:1, sekunder/latarlembut7,24:1, biru/putih5,17:1. Tidak ada warna baru. CSS Module lokal hanya mengatur min-width, pembungkusan, angka tabular dan jarak ledger.
- Disclaimer selalu terlihat. Tidak ada mode tarif terverifikasi, tabel resmi rekaan, klaim tarif terbaru atau klaim ketepatan invoice. Tautan primer menyatakan keterbatasan sumber dan tanggal pemeriksaan8November2026.

## Gate

| Item | Status dan bukti |
| --- | --- |
| R-01 | PASS: tidak ada gradient/glow baru. |
| R-02 | PASS: copy aplikasi memakai kalimat langsung, tanpa em dash. |
| R-03 | PASS: reflow lima viewport dan dua font320 teruji, termasuk nilai maksimum. |
| R-04 | PASS: tidak menambah ikon. |
| R-05 | PASS: detail kalkulator dan kategori utilitas yang sama. |
| R-06 | PASS: font sistem dan angka tabular untuk audit nilai. |
| R-07 | PASS: latar putih/lembut dari token, tanpa pola dekoratif. |
| R-08 | PASS: aksi Hitung tanpa panah dekoratif. |
| R-09 | PASS: ketidaklengkapan menjadi jawaban teks utama, tanpa badge tambahan. |
| R-10 | PASS: panel opaque, tanpa glass. |
| R-11 | PASS: radius panel/kontrol yang sama, tanpa pill tambahan. |
| R-12 | PASS: border/jarak dari token; tidak menambah shadow. |
| R-13 | PASS: fokus token tetap, tanpa glow. |
| R-14 | PASS: kartu katalog membandingkan fungsi, bukan dekorasi. |
| R-15 | PASS: Hitung/Tambah biaya/Hapus biaya menyebut tindakannya. |
| R-16 | PASS: copy membedakan simulasi manual, basis, cash dan eksak. |
| R-17 | PASS: angka contoh dari vektor independen, bukan statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial/profil rekaan. |
| R-19 | PASS: gerak hanya perilaku kontrol yang sudah ada. |
| R-20 | PASS: angka dan garis jawaban biru mempertahankan identitas produk. |
| R-21 | PASS: tema terang sesuai arahan produk. |
| R-22 | PASS: tidak ada ilustrasi rekaan. |
| R-23 | PASS: hanya empat ID terakhir dan perluasan katalog yang diminta. |
| R-24 | PASS: tautan empat platform dari perbandingan serta hub dan TikTok kreator benar. |
| R-25 | PASS: warna diwarisi token; CSS baru tidak mendefinisikan warna. |
| R-26 | PASS: seluruh form dihitung Playwright, interaksi menghapus hasil lama. |
| R-27 | PASS: initial/invalid/held/result lengkap; engine sinkron tanpa loader palsu. |
| R-28 | PASS: FAQ menjelaskan input tarif, affiliate, hasil negatif dan batas transfer bank. |
| R-29 | PASS: palet token tetap. |
| R-30 | PASS: komponen repository dipakai kembali. |
| R-31 | PASS: alasan layout di atas; tabel untuk audit fee dan ledger. |
| R-32 | PASS: Enter, fokus invalid/add/remove dan scroll keyboard teruji. |
| R-33 | PASS: TSX/CSS Modules ada di source, tanpa patch runtime. |
| R-34 | PASS: tidak menambah toggle tema. |
| R-35 | PASS: build lokal dan20alur browser baru benar-benar dijalankan. |
| R-36 | PASS: tidak ada klaim tarif resmi/terbaru atau penetapan invoice. |
| R-37 | PASS: arah dan dial mengikuti sistem desain yang disetujui. |
| R-38 | PASS: batas sumber, model dan konfirmasi pengguna dinyatakan eksplisit. |
| C-1 | PASS: warna/layout/font/jarak mengikuti keterbacaan lembar hitung. |
| C-2 | PASS: kontrol menghitung, memetakan cakupan, mengelola baris atau menavigasi. |
| C-3 | PASS: bagian menjelaskan input, hasil, ledger, metode, contoh, sumber atau batas. |
| C-4 | PASS: keyboard, invalid, nol, maksimum, negatif dan held diuji. |
| C-5 | PASS: klaim matematika ditelusuri ke fixture; tidak ada tarif rekaan. |

Checklist React: hitung hanya saat submit, state lokal dibersihkan saat perubahan, tidak ada efek hitung/fetchclient/shared mutable state. Methodology dirender server. Label/konteks menjadi teks React, tanpa HTML runtime. Ledger memakai hasil engine rasional, tidak menghitung ulang dari angka tampilan. Dependency tidak bertambah. Field kondisional bertingkat tetap menjaga semua pola baris lama.

Katalog final:100IDunik/100published,20Marketplace/10Pajak/6hub/107URL. TikTok seller tetapcalc-tiktok pada/tiktok-shop; kreator tetap/tiktok. Production/domain/DNS/alias/redirect serta perlindungan indexing staging tidak diubah. Tidak merge atau auto-merge.
