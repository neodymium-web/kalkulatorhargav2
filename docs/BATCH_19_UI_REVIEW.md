# Review UI dan delivery gate Batch19

Membaca ini sebagai alat estimasi pajak bersyarat untuk pegawai, importir dan pemilik properti. Mengikuti bahasa lembar hitung Design System v2, ENERGY1 / RHYTHM2 / MOTION1. Angka tabular, garis hasil biru, token kontras dan layout form/hasil dipakai kembali; tidak menambah aset, ikon, warna atau motion. Metodologi sumber tetap di bawah form agar perhitungan dapat dicapai dahulu pada mobile.

## Perilaku dan bukti

- Node22.23.4: npm ci (0 vulnerabilities), typecheck,764unit dan build berhasil.157unit baru mencakup seluruh125baris TER pada batas±Rp1, pemetaanPTKP, progresif/PKP/cap, koherensiTER dan rekonsiliasi, CIF/incoterm/KMK, pembulatan komponen dan batas wilayah/tahun/fasilitas. Semua91engine lama dan helper rasional lama tetap.
-30kasus Playwright Batch19 desktop/mobile lulus: normal/invalid/status/stale untuk5alat, Enter/fokus/error terhubung, TER disclosure125baris, tabel progresif dan komponen impor, pilihan NJOPTKP/waris, kelayakan/pengurang, peralihan tahun, sumberSSR tanpaJS, kategori/search/103sitemap/4platform404/noindex. Pengujian penuh dan CI final dicatat dalam PR pada SHA yang sama.
- Lima viewport320/375/768/1024/1440 dan fontArial/Verdana320 diuji, termasuk impor bernilai maksimum dan disclosure seluruh TER. Kolom hasil baru memiliki min-width0 serta overflow-wrap:anywhere untuk referensi pengguna dan catatan hukum panjang; bukan overflow:hidden. Tabel memakai region berfokus dan gulir dari CSS Module bersama, dengan caption serta headerkolom/baris.
- Pilihan select awal yang tidak diisi menghasilkan FormData null; skema baru mengartikan itu sebagai fakta belum diketahui, sama dengan kosong/hilang. Payload malformed tetap error. Ringkasan invalid memfokuskan kolom invalid pertama dalam urutan form. Tidak mengubah komponen form atau perilaku lama.
- Screenshot desktop/mobile hasil normal, invalid dan fullpage setiap alat disimpan otomatis. Tambahan: ter-batas-kategori-c, payroll-status-tanpa-angka, rekonsiliasi-lebih-potong, rekonsiliasi-lapisan-progresif, impor-dasar-manual-terpisah, impor-rounding-komponen, impor-kelayakan-belum-jelas, bphtb-waris-hubungan-terverifikasi, bphtb-fasilitas-perlu-konfirmasi, pbb-njoptkp-objek-lain, pbb-bukan-sppt-tanpa-angka, pajak-sepuluh-alat.
- Ditinjau visual: TER hasil desktop, rekonsiliasi negatif desktop/mobile, hasil PBB bruto desktop, status tanpaangka desktop dan pembulatan impor mobile. Jawaban utama, label bruto/manual/kelebihan dan nilai eksak/cash terbaca; catatan membungkus tanpa elipsis. Screenshot dan artifact CI final ditautkan di PR.
- Kontras memakai token yang sama: teksutama/putih17,85:1, sekunder/latarlembut7,24:1, biru/putih5,17:1. Borderkontrol dan fokus memakai token yang sudah disetujui. Tidak ada pasangan warna baru.

## Gate

| Item | Status dan bukti |
| --- | --- |
| R-02 | PASS: copy aplikasi baru tanpa em dash; rentang memakai en dash dan operator matematika literal. |
| R-03 | PASS: pengukuran lebar dokumen sama dengan lima viewport; Arial/Verdana320 dan nilai impor maksimum juga lulus. |
| R-17 | PASS: angka contoh dari fixture independen yang didokumentasikan sebelum implementasi, tanpa statistik pemasaran. |
| R-18 | PASS: tidak ada testimonial/profil rekaan. |
| R-23 | PASS: hanya lima ID dan perluasan katalog yang diminta Issue47; tidak ada aset visual baru. |
| R-24 | PASS: tautan silang baru menuju lima route terbit dan hubPajak; empat platform tetap404. |
| R-25 | PASS: semua warna diwarisi token dengan rasio di atas; CSS baru hanya ukuran minimum dan pembungkusan. |
| R-26 | PASS: seluruh kontrol5form diisi dan dihitung oleh Playwright; perubahan menghapus hasil/ledger. |
| R-27 | PASS: instruksi awal, hasil, status tanpaangka dan invalid tersedia; engine sinkron tidak membutuhkan loader asinkron. |
| R-28 | PASS: FAQ membahas masaakhir, PTKP, kelebihan, fasilitas, CIF dan kurs sesuai alat. |
| R-32 | PASS: Enter submit/disclosure dan fokus invalid diuji; tabel berlabel bisa digeser keyboard; fokus token tetap. |
| R-33 | PASS: TSX/CSS Modules ada sebagai source repository; tidak ada patch runtime pada UI. |
| R-34 | PASS: tema terang sesuai DesignSystemv2, tidak menambah toggle tema. |
| R-35 | PASS: build produksi lokal dan30alur browser Batch19 telah dijalankan; bukti klik/screenshot otomatis. |
| R-36 | PASS: tidak mengklaim kepatuhan/penetapan resmi; tarif impor adalah asumsi input, bukan tarif produk rekaan. |
| R-37 | PASS: arah visual dan dial di atas mengikuti sistem desain yang sudah ada. |
| R-38 | PASS: sumber primer, contoh dan batas model dinyatakan; konfirmasi pengguna tidak diklaim verifikasi otoritas. |
| R-01 | PASS: tidak ada gradient/glow baru. |
| R-04 | PASS: tidak menambah ikon. |
| R-06 | PASS: font sistem untuk keterbacaan, angka tabular untuk membandingkan nilai. |
| R-07 | PASS: latar token putih/lembut tanpa pola dekoratif. |
| R-08 | PASS: aksi Hitung tanpa panah dekoratif. |
| R-09 | PASS: status adalah teks jawaban, tidak menambah badge/pill. |
| R-10 | PASS: panel opaque, tanpa glass. |
| R-12 | PASS: border dan jarak token; tanpa shadow baru. |
| R-13 | PASS: outline fokus token, tanpa glow. |
| R-14 | PASS: kartu katalog yang sama untuk membandingkan fungsi alat, tanpa kartu dekoratif. |
| R-19 | PASS: motion hanya perilaku kontrol yang sudah ada, sesuaiMOTION1. |
| R-22 | PASS: tidak ada ilustrasi rekaan. |
| Dials | PASS: ENERGY1/RHYTHM2/MOTION1 konsisten dengan form utilitas dan hasil lembar hitung. |
| Focal point | PASS: garis biru dan angka/status utama paling menonjol dalam screenshot. |
| Whitespace | PASS: form/hasil sejajar desktop, bertumpuk mobile; metodologi mengikuti tugas utama. |
| Accent | PASS: biru hanya pada aksi/tautan/fokus/hasil, sesuai token produk. |
| Identity | PASS: wordmark serta motif garis hasil produk tetap. |
| Design Read | PASS: tujuan pengguna dan bahasa visual dinyatakan di awal review. |
| C-1 | PASS: warna/layout/font/spacing mengikuti keterbacaan lembar hitung dan sistem desain, tanpa dekorasi tambahan. |
| C-2 | PASS: setiap kontrol menghitung, memverifikasi cakupan, membuka rincian atau menavigasi. |
| C-3 | PASS: setiap bagian menjelaskan input, hasil, rumus, contoh, sumber atau batas hukum. |
| C-4 | PASS: keyboard, invalid, nol, maksimum, batas tarif dan status tanpaangka diuji; screenshot negatif/manual/bruto ditinjau. |
| C-5 | PASS: klaim matematika ditelusuri ke fixture dan sumber; tidak ada klaim pelanggan atau legal compliance rekaan. |
| R-05 | PASS: struktur detail kalkulator/kategori utilitas, tanpa hero pemasaran/template baru. |
| R-11 | PASS: radius kontrol/panel dari token, tidak membuat semua elemen pill. |
| R-15 | PASS: Hitung menyebut tindakan, disclosure menyebut isi tabel TER. |
| R-16 | PASS: copy membedakan estimasi/manual/bruto/status secara konkret, tanpa buzzword pemasaran. |
| R-20 | PASS: komposisi angka serta garis jawaban mempertahankan identitas KalkulatorHarga. |
| R-21 | PASS: tema terang sesuai arahan produk, bukan preferensi default agen. |
| R-29 | PASS: palet token tetap; CSS baru tidak mendefinisikan warna. |
| R-30 | PASS: memakai komponen repository, tidak menyalin visual produk lain. |
| R-31 | PASS: alasan visual di awal; pembungkusan baru untuk referensi/catatan hukum, tabel untuk audit irisan/komponen. |

Checklist React: engine hanya dipanggil saat submit; state lokal hasil dihapus pada perubahan; tidak ada efek hitung, fetchclient, atau shared mutable request state. Metodologi, tarif dan sumber dirender server. Label/konteks/ref pengguna menjadi teks React, tanpa HTML runtime. Tabel tidak menghitung pajak dari angka tampilan; format uang dan pecahan memakai helper yang ada. Tidak menambah dependency runtime.

Inventaris100IDunik/96terbit/10Pajak/6hub/103sitemap. Impor hanya simulasi manual; properti DKI2024 sebelum fasilitas, bukan perluasan wilayah atau penetapanSPPT. Seluruh91alat sebelumnya tetap. Production/domain/DNS/alias/redirect dan perlindungan indexing staging tidak diubah. Tidak merge/auto-merge.

Putaran lokal penuh final:459Playwright lulus/1skip lama. Putaran pertama menemukan ekspektasi daftar sitemap lama yang belum memuat5route baru; daftar eksplisit diperbarui, lalu seluruh suite diulang dan lulus. Tidak mengubah timeout, mengurangi suite, atau melepas proteksi indexing. Bukti CI dan deployment final dicatat di PR.
