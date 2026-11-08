# Inspeksi visual arsip legacy

22 halaman × dua viewport = **44 frame** dari build kandidat, diinspeksi melalui delapan contact sheet lokal pada 8 November 2026. Mobile375×900 dan desktop1440×900 (desktop diperkecil pada contact sheet). Semua judul dan banner review terlihat, teks membungkus, tidak ditemukan clipping/overlap pada viewport yang diperiksa. Ini bukan klaim membaca setiap piksel fullpage atau pengujian perangkat fisik.

Kelompok yang diinspeksi: blog index, seluruh13artikel, panduan TikTok, biaya-admin, update-tarif, metodologi, redaksi, kebijakan-editorial dan disclaimer. Pada mobile, H1 ditempatkan sebelum catatan review agar identitas halaman langsung terlihat. Intro, byline dan tanggal sumber tetap dalam urutan teks aslinya; anotasi baru ditandai terpisah sehingga tes copy parity dapat mengecualikannya tanpa mengecualikan isi sumber.

Screenshot awal sebelum perbaikan struktur inline dan hierarki tidak dipakai sebagai bukti final. Suite terarah final62/62 lulus: source25outcome,44archiveviews, axe, empatlebar,129SSRgraph, noJS22arsip, keyboard TOC/table dan textresize200%. Tidak menutupi hydration errors lewat suppressHydrationWarning; span sumber dipertahankan sebagai inline.

Fullpage dan viewport originals serta33WebKit screenshots dibuat ulang pada SHA final oleh CI, tersimpan di browser-evidence. Catatan inspeksi lokal bukan klaim hash rendering CI identik. Hasil CI, tautan artifact dan Preview exactSHA dicatat dalam PR setelah benar-benar selesai.

## Gate desain dan React

Design read: utility-first lembar hitung, Design System v2, ENERGY2/RHYTHM1/MOTION1. Article measure65ch, blok dibentuk oleh struktur konten, banner biru memakai motif hasil/brand; tidak menambah tema/animasi atau identitas baru.

Hard gate dan purpose gate: tidak ada placeholder tool, tracker, gambar tanpa lisensi atau klaim tarif baru; tiga route tertunda404. Tabel scroll dibatasi pada region yang fokus dan keyboard-scrollable. Liveliness: hierarki judul/body, garis biru review, TOC hanya untuk isi yang substantif, archive list satu kolom mobile/dua desktop. Craftsmanship: anchor dan native details bekerja, focus ring global tetap, reflow320/375/768/1440 serta200%text diuji, axe tidak menemukan pelanggaran pada22halaman pada kedua project. Kontras tetap token biru/putih5,17:1 dan teks gelap/putih17,85:1 dari sistem desain, tanpa palette baru.

React review: template server, static content registry terpisah dari100calculatorIDs, tidak ada hook/effect/fetch runtime, data JSON tidak diimpor komponen client. Renderer allowlist tag/atribut dan URL scheme, React escape teks; tidak ada rawHTML atau script dari sumber. State counter heading bersifat lokal per render, key stabil menurut tree statis. Tidak merekomputasi angka kalkulator atau membuat schema Article/byline legal yang belum disahkan.

Gate perubahan UI terbatas ini PASS setelah tes terarah. Gate launch/cutover tetap NO-GO dan tidak dipengaruhi kelulusan visual.
