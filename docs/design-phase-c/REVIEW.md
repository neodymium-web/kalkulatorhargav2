# Phase C: visual review PR #71

Melanjutkan branch `design/phase-c-visual-polish`, tanpa rewrite engine. Before adalah **HEAD awal PR #71, 5e87b4d866aa1d33a1669d48400e1f436fc0cb54**, bukan main sebelum tiga commit visual pertama. Build before selesai sebelum perubahan lanjutan; fixture dan ukuran browser sama. After memakai source UI dengan hash pada application-changes.json; SHA CI final dicatat pada PR agar tidak menimbulkan commit yang merujuk dirinya sendiri.

## Keputusan desain

Utility-first Premium mengikuti dokumen desain yang disetujui. ENERGY 1 / RHYTHM 2 / MOTION 1: kanvas terang, ritme dibedakan antara pencarian, katalog, workspace dan metodologi; gerak hanya transisi warna singkat. Motif dua batang merek dan garis biru hasil dipertahankan. Angka tabular menjadi fokus; font sistem mempertahankan keterbacaan serta tidak menambah request font. Tidak ada aset eksternal, klaim popularitas, ikon dekoratif baru atau library animasi.

Referensi yang dibaca: [21st.dev](https://21st.dev/) untuk anatomi komponen, [Mobbin](https://mobbin.com/) untuk penemuan/pencarian, dan [Dribbble calculator dashboard](https://dribbble.com/search/calculator-dashboard) untuk komposisi angka. Ini arah interpretasi produk, bukan salinan maupun klaim akses ke seluruh pustaka berbayar.

- Hero desktop menempatkan pencarian di sebelah headline sehingga alat lebih cepat terlihat. Lingkaran/gradient dekoratif dihapus; satu elevasi pada pencarian membedakan tugas utama. Kartu katalog tetap rata, bukan semua diberi shadow.
- Navigasi mobile menampilkan enam kategori dalam grid; semua tetap tautan native dengan target minimal 44 px. Tidak ada menu tersembunyi, scroll horizontal navigasi atau fokus yang perlu dipindahkan ke modal. Footer mengelompokkan tautan yang sama dengan area sentuh lebih lapang.
- CategoryPage memakai header dan daftar yang sama untuk seluruh hub. Hitungan berasal dari registry; disclosure lengkap tetap SSR/no-JS. Kartu 12 per kelompok tetap dipertahankan.
- Input menjadi dua kolom hanya jika **lebar panel** minimal 30rem; dropdown top-level panjang memakai lebar penuh. Form/hasil dua kolom pada desktop, urutan DOM mobile tetap form lalu hasil. Hasil tidak sticky. Fieldset dinamis memakai latar pembeda dan fokus yang sudah ada saat tambah/hapus.
- Primary result diberi jarak dan bobot terkuat; label/rincian lebih tenang. Angka panjang membungkus utuh. Asumsi memiliki pemisah tersendiri. Metodologi dan contoh tetap setelah workspace.
- Tabel panjang tetap disclosure dengan caption/header, region fokus bergulir, strip baris dan header yang menetap **di dalam region tabel**, bukan overlay halaman. Fallback keyboard bersama menjamin ArrowLeft/Right menggeser region yang fokus pada WebKit; tidak mengambil tombol dari anak interaktif atau kombinasi modifier. Select tetap native secara semantik, dengan tinggi eksplisit dan indikator CSS agar WebKit memenuhi target sentuh.

## Perbandingan yang ditinjau

File JPEG adalah tangkapan browser sebenarnya, bukan mockup. Pada screenshot full-page mobile yang panjang, buka gambar pada ukuran asli untuk menilai teks. CI menghasilkan ulang after pada 320/375/768/1024/1440 di Chromium dan WebKit; file terlampir di bawah menampilkan 375 dan 1440.

| Halaman/state | Before desktop | After desktop | Before mobile | After mobile | Fokus inspeksi |
| --- | --- | --- | --- | --- | --- |
| Homepage | [1440](before/home-1440.jpg) | [1440](after/home-1440.jpg) | [375](before/home-375.jpg) | [375](after/home-375.jpg) | Hero, pencarian, navigasi, kategori, kartu, footer |
| Bisnis | [1440](before/category-1440.jpg) | [1440](after/category-1440.jpg) | [375](before/category-375.jpg) | [375](after/category-375.jpg) | Header katalog, density kartu, muat lebih banyak, daftar lengkap |
| HPP valid | [1440](before/hpp-1440.jpg) | [1440](after/hpp-1440.jpg) | [375](before/hpp-375.jpg) | [375](after/hpp-375.jpg) | Empat input, Rp4.000 utama, form sebelum artikel |
| Saham valid | [1440](before/stock-1440.jpg) | [1440](after/stock-1440.jpg) | [375](before/stock-375.jpg) | [375](after/stock-375.jpg) | Form panjang, dropdown, impas/rincian, batas grid hipotetis |
| Food cost 3 bahan | [1440](before/dynamic-1440.jpg) | [1440](after/dynamic-1440.jpg) | [375](before/dynamic-375.jpg) | [375](after/dynamic-375.jpg) | Kelompok bahan, tambah/hapus, angka per porsi |
| Anuitas 120 bulan | [1440](before/table-1440.jpg) | [1440](after/table-1440.jpg) | [375](before/table-375.jpg) | [375](after/table-375.jpg) | Hasil, scroll tabel, baris, angka dan metodologi |

Fixture reproducible berada di scripts/design/capture.mjs. HPP 240.000+120.000+40.000 dibagi 100 = 4.000. Food cost tiga bahan masing-masing 20.000×250/1.000 dibagi empat porsi = 3.750. Saham memakai fixture independen Issue #63. Tabel memakai pokok 100 juta, bunga 12%, 120 bulan. Script tidak mengubah rumus atau memakai hasil engine sebagai oracle baru.

## QA dan batas bukti

Tes Phase C memeriksa lima lebar, overflow halaman, target form/navigasi/footer ≥44 px, axe WCAG A/AA, reduced-motion, hasil fixture, scroll tabel melalui keyboard, fokus skip link, clear empty search, fokus setelah load-more, serta pembesaran **teks** 200% pada lebar 640. Uji reflow 320 terpisah tersedia. Pembesaran teks ini bukan klaim menjalankan native browser zoom atau keyboard fisik iPhone; keyboard virtual dan assistive technology nyata tetap membutuhkan QA perangkat.

Kontras terhitung: biru #2563EB/putih 5,17:1; border kontrol #64748B/putih 4,76:1; teks sekunder #475569/#F8FAFC 7,24:1. Focus ring memakai biru yang sama. Tautan sebaris dalam paragraf mengikuti pengecualian inline text; kontrol, kartu dan navigasi tetap ≥44 px. Warna error selalu disertai teks. Tidak ada hasil lama yang sengaja dipertahankan setelah input berubah.

Lighthouse Phase C menjalankan enam halaman representatif pada mobile dengan gate performance ≥90/accessibility ≥95 dan menyimpan seluruh report; kegagalan tidak disembunyikan. Lab bukan field CWV atau jaminan performa pengguna. Hasil aktual CI/Preview ditambahkan pada PR setelah selesai, bukan diinventarisasi sebelum dijalankan.

Guard migrasi diperluas **hanya untuk 22 file UI yang disebut eksplisit dan di-hash**, termasuk tiga file dari commit awal PR dan tujuh pemakai fallback scroll bersama. Manifest/ledger audit historis dipertahankan; sumber baseline diperiksa melalui Git object. Engine, registry, metadata layout, token lama, canonical/sitemap/robots, archive approvals, domain/DNS/alias/SSO dan konfigurasi cutover tetap dilindungi. Perubahan guard tidak mengubah syarat release; NO-GO tetap mandatory.

Approval visual owner belum diberikan. Halaman panjang tetap memerlukan gulir; related tools tetap memakai perilaku 12 kartu lama. Select native dapat menyingkat label pilihan panjang saat tertutup pada mobile; pilihan lengkap tersedia ketika dibuka dan label field tetap terlihat. Tidak ada klaim paritas dataset TikTok atau sertifikasi order BEI baru dari pekerjaan desain ini.
