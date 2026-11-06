# Sistem desain KalkulatorHarga

**Phase A · Usulan untuk persetujuan**

Dokumen ini menetapkan aturan visual dan perilaku komponen untuk beranda, kategori, dan kalkulator. Preview memakai HPP sebagai contoh dari registry saat ini. Terapkan sistem ini pada aplikasi setelah persetujuan Phase A.

## Arah visual

Gunakan komposisi lembar hitung dengan garis pemisah tipis, angka tabular, label yang mudah dipindai, dan latar putih. Biru menandai tautan, fokus, dan aksi utama. Hierarki berubah sesuai tugas: pencarian pada beranda, daftar pada kategori, dan angka hasil pada kalkulator. Gerak dibatasi pada umpan balik kontrol.

- 21st.dev menjadi referensi untuk anatomi input, tombol, dan kartu yang konsisten. [Katalog komponen](https://21st.dev/)
- Mobbin menjadi referensi untuk alur pencarian, hasil kosong, dan pengisian form mobile. [Pustaka pola UX](https://mobbin.com/)
- Dribbble menjadi referensi komposisi angka dan panel kalkulator. Gunakan palet dan aturan kontras produk untuk menerjemahkannya. [Eksplorasi visual kalkulator](https://dribbble.com/search/calculator-dashboard)

## Token semantik

Gunakan nama di bawah sebagai API gaya. Nilai rem mengacu pada ukuran akar bawaan pengguna. Seluruh permukaan menggunakan tema terang pada fase awal.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `--surface-page` | `#FFFFFF` | Kanvas dan latar kontrol |
| `--surface-subtle` | `#F8FAFC` | Pita pencarian dan latar panel hasil |
| `--text-primary` | `#0F172A` | Judul, label, angka |
| `--text-secondary` | `#475569` | Deskripsi, hint, metadata |
| `--border-subtle` | `#E2E8F0` | Pemisah dan batas dekoratif |
| `--border-control` | `#64748B` | Batas input yang perlu terlihat |
| `--action-primary` / `--text-on-action` | `#2563EB` / `#FFFFFF` | Aksi utama dan teks tombol |
| `--action-hover` / `--action-active` | `#1D4ED8` / `#1E40AF` | Hover dan tekan |
| `--focus-ring` / `--focus-offset` | `#2563EB` / `3px` | Outline 3 px pada `:focus-visible`, dengan jarak dari kontrol |
| `--text-error` / `--surface-error` | `#991B1B` / `#FEF2F2` | Pesan dan area kesalahan |
| `--text-success` / `--surface-success` | `#166534` / `#F0FDF4` | Konfirmasi hasil dengan teks status |
| `--surface-disabled` | `#F1F5F9` | Kontrol nonaktif dengan label sekunder |
| `--font-ui` | `system-ui, sans-serif` | Teks, form, dan hasil |
| `--text-small` / `--text-body` | `0.875rem/1.5` / `1rem/1.5` | Metadata dan isi |
| `--text-section` | `1.25rem/1.3`, 650 | Judul bagian |
| `--text-title` | `clamp(1.875rem, 4vw, 3rem)`, 1.1, 750 | Satu H1 per halaman |
| `--text-result` | `clamp(1.5rem, 3.5vw, 2.5rem)`, 1.15, 750 | Nilai utama |
| `--space-{1,2,3,4,5,6,8,10,12,16}` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px | Skala 4 px, simpan sebagai rem |
| `--radius-control` / `--radius-panel` | 8 / 12 px | Kontrol / panel |
| `--target-min` / `--control-size` | 44 / 48 px | Target sentuh minimum dan tinggi minimum kontrol |
| `--container-max` / `--measure-prose` | `75rem` / `65ch` | Lebar konten / metodologi |
| `--motion-fast` / `--motion-ease` | `120ms` / `ease-out` | Perubahan warna kontrol saja |

Target kontras teks 4,5:1, serta batas kontrol dan indikator fokus 3:1 terhadap area yang bersebelahan. Warna status selalu disertai pesan. Pada `prefers-reduced-motion: reduce`, hilangkan transisi dan gulir animasi. Gunakan breakpoint `48rem`, `64rem`, dan `90rem`. Lebar 320 dan 375 px berbagi layout dasar, dengan gutter yang tumbuh dari 12 ke 16 px sebelum tablet.

### Angka dan mata uang

Format hasil dengan `Intl.NumberFormat('id-ID')` dan konfigurasi satuan yang eksplisit. HPP menampilkan rupiah bulat sesuai engine, misalnya **Rp 4.000**, serta label **HPP per unit**. Nilai mentah dan pembulatan tetap berada di engine. Gunakan `font-variant-numeric: tabular-nums`, rata kanan untuk kolom nilai yang dibandingkan, dan unit di label atau di nilai. Pada ruang sempit, izinkan nilai panjang membungkus tanpa elipsis dan pertahankan teks utuh untuk penyalinan. Gunakan satu tanda minus untuk nilai negatif yang sah. Nilai nol tampil sebagai angka. Hasil kosong menampilkan instruksi singkat.

## Kontrak komponen

| Komponen | Anatomi dan varian | Perilaku dan aksesibilitas |
| --- | --- | --- |
| Button | Label berupa tindakan, varian primary, secondary dan text. Ikon opsional dengan nama aksesibel bila tanpa teks. | Gunakan `button` untuk aksi dan tautan untuk navigasi. Default `type="button"`, submit eksplisit. Sediakan hover, active, fokus, disabled dan pending. Status pending menjaga lebar dan diumumkan saat perlu. |
| Input | Label terlihat, kontrol 48 px, hint dan pesan kesalahan. Prefix atau suffix satuan bila diperlukan. | Kaitkan label dengan ID dan hint melalui `aria-describedby`. Terapkan `aria-invalid` setelah validasi gagal. Gunakan `inputmode` sesuai data dan pertahankan nilai yang diketik. |
| Card | Varian tautan kalkulator, tautan kategori, dan panel konten. Judul, satu kalimat penjelas, metadata opsional. | Kartu tautan punya satu target fokus yang meliputi seluruh kartu. Jika ada tindakan tambahan, gunakan panel dengan tautan terpisah. Judul menjelaskan tujuan saat dibaca sendiri. |
| Search | Region pencarian, label, kolom, tombol hapus bila ada kueri, dan daftar hasil. | Pencarian lokal memfilter daftar publik tanpa memindahkan fokus. Umumkan jumlah hasil lewat `role="status"`. Saat kosong, tampilkan contoh kueri dan aksi hapus. Tab menavigasi hasil sesuai urutan. |
| CalculatorForm | Judul atau legend, pengantar singkat, daftar field, dan submit. | Pakai elemen form dan fieldset bila ada kelompok. Enter mengirim form. Saat gagal, umumkan ringkasan dan fokuskan field invalid pertama setelah pesan terpasang. Pertahankan input. |
| CalculatorField | Input ditambah satuan, batas atau contoh format, dan pesan spesifik. | Tampilkan satuan pada label atau deskripsi. Gunakan hint dan pesan dengan ID berbeda agar keduanya tetap dapat dibaca. Kelompokkan input berulang dengan legend. |
| ResultPanel | Judul, hasil utama, rincian berlabel dalam `dl`, dan asumsi singkat bila relevan. | Siapkan keadaan awal, sukses, dan input invalid. Umumkan hasil yang berubah melalui region `aria-live="polite"` yang sudah ada. Hapus hasil yang tidak lagi cocok ketika input berubah. |
| Breadcrumb | Navigasi berlabel “Jejak navigasi”, daftar tautan, item terakhir dengan `aria-current="page"`. | Pemisah dekoratif, pembungkusan baris alami, target tautan 44 px. Sembunyikan segmen kategori bila belum memiliki hub. |
| Navigasi situs | Skip link, merek ke beranda, kategori dengan hub publik, dan penanda halaman aktif. | Tautan kategori tetap terlihat selama jumlahnya muat. Jika bertambah, gunakan disclosure dengan `aria-expanded`, Escape menutup dan fokus kembali ke pemicu. Hindari header lengket pada layar sempit. |

## Layout responsif

Urutan DOM sama di semua ukuran. Beranda mengutamakan pencarian sebelum daftar dan kategori. Kategori mengutamakan breadcrumb, H1, deskripsi, lalu daftar. Detail mengutamakan breadcrumb, H1, deskripsi, form, hasil, metodologi, dan alat terkait bila tersedia.

| Lebar | Gutter dan batas | Beranda | Kategori | Detail |
| --- | --- | --- | --- | --- |
| 320 px | 12 px per sisi | Pita pencarian satu kolom, input dan kartu memenuhi ruang | Daftar satu kolom, breadcrumb dapat membungkus | Form lalu hasil, tombol selebar panel, angka dapat membungkus |
| 375 px | 16 px per sisi | Susunan satu kolom, ruang untuk hint yang lebih panjang | Daftar satu kolom | Form lalu hasil, padding panel 16 px |
| 768 px | 24 px per sisi | Input hingga 640 px, daftar maksimal dua kolom | Grid dua kolom bila tersedia cukup alat | Form dan hasil sejajar 1:1, metodologi di bawah |
| 1024 px | 32 px per sisi | Pencarian 640 px, daftar maksimal tiga kolom | Grid maksimal tiga kolom | Form dan hasil 3:2, gap 24 px |
| 1440 px | Konten 1200 px terpusat | Pertahankan ukuran input, maksimal tiga kolom | Grid maksimal tiga kolom | Form dan hasil 3:2, gap 32 px, artikel hingga 65ch |

Gunakan kolom eksplisit saat jumlah kartu cukup. Satu item tetap selebar satu kolom pada breakpoint grid. Kartu baru mengikuti urutan registry, tanpa kartu kosong. Pada zoom 200%, gunakan lebar CSS efektif untuk kembali ke layout yang muat. Hindari lebar minimum tetap pada anak grid dan beri area fokus ruang agar outline terlihat. Dengan keyboard virtual terbuka, field aktif dan tombol tetap bisa dicapai lewat gulir alami.

## CSS dan urutan implementasi setelah persetujuan

Pilih CSS biasa dengan custom properties dan gaya lokal komponen. Stack saat ini sudah mendukungnya. Token dapat dipakai lintas komponen tanpa menambah dependency, langkah build, atau kelas utilitas di markup. Tailwind dan shadcn dapat dievaluasi jika kebutuhan komponen kompleks berkembang. Kontrak token dan interaksi di atas tetap berlaku bila alat implementasi berubah.

1. Buat branch Phase B dari main terbaru setelah persetujuan desain. Petakan selector global dan rekam tangkapan layar acuan serta perilaku HPP.
2. Masukkan token ke stylesheet yang diimpor layout. Aliaskan nama lama sementara, seperti `--accent` ke `--action-primary`, agar migrasi dapat dilakukan bertahap.
3. Pindahkan selector elemen global seperti `input`, `button`, dan `label` ke gaya komponen atau CSS Modules. Migrasikan form HPP dan uji perilakunya sebelum memindahkan direktori serta navigasi. Sisakan reset dan tipografi dasar di global.
4. Hapus alias setelah pemakai terakhir pindah. Tambahkan rujukan sistem desain ke AGENTS.md. Jalankan CI dan browser untuk regresi keyboard, zoom, status, viewport, dan hasil hitung.

## Preview dan persetujuan

[Buka sumber preview statis](design-previews/preview.html). Unduh file dan buka di browser untuk mengganti tampilan dengan `?page=home`, `?page=category`, atau `?page=hpp`. Tambahkan `&state=empty` atau `&state=invalid` untuk meninjau keadaan awal dan kesalahan HPP. Contoh hasil HPP memakai data dari contoh yang terdokumentasi. Preview ini memvisualisasikan state desain dan tidak menjalankan pencarian atau engine.

| Halaman | Desktop 1440 px | Mobile 375 px |
| --- | --- | --- |
| Beranda | [Preview](design-previews/home-1440.jpg) | [Preview](design-previews/home-375.jpg) |
| Bisnis | [Preview](design-previews/category-1440.jpg) | [Preview](design-previews/category-375.jpg) |
| HPP | [Preview](design-previews/hpp-1440.jpg) | [Preview](design-previews/hpp-375.jpg) |

- [ ] Setujui palet, tipografi, skala jarak, dan penekanan hasil.
- [ ] Setujui kontrak komponen dan urutan fokus serta pesan validasi.
- [ ] Setujui susunan tiga halaman pada 320, 375, 768, 1024, dan 1440 px.
- [ ] Setujui CSS biasa dan urutan migrasi selector.
- [ ] Beri persetujuan eksplisit sebelum membuka Phase B.
