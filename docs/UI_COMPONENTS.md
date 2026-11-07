# Penggunaan komponen UI

Ikuti [sistem desain](DESIGN_SYSTEM.md) untuk token dan perilaku. Token berada di `app/tokens.css`. Gunakan CSS Modules untuk aturan lokal dan pertahankan breakpoint 48, 64, serta 90 rem sesuai kebutuhan komponen.

- `Button` untuk tindakan, dengan `type="submit"` pada form dan varian `secondary` untuk tindakan pendamping. Gunakan tautan untuk navigasi. `Input` menghubungkan label, hint, dan error serta menerima atribut native. Pakai nama field yang cocok dengan skema engine.
- `CalculatorForm` membungkus field dan submit. Berikan `invalidFields` dalam urutan visual dengan ID yang sama seperti pada input. Komponen mengumumkan ringkasan dan memfokuskan field invalid pertama setelah render. Pertahankan data input ketika hasil dibersihkan. Gunakan `ResultPanel` untuk nilai utama, rincian, asumsi, serta instruksi kosong atau invalid.
- `Directory` menampilkan kartu dan pemuatan bertahap. Proyeksikan alat terbit dengan `directoryEntry` di server. `DirectorySearch` mengelola kueri dan mengumumkan jumlah hasil. Bagikan `Breadcrumb` dan `CalculatorPage` untuk halaman kalkulator baru.
- Form kalkulator memanggil engine yang murni, lalu memformat hasil dengan locale Indonesia. Pisahkan metode dan contoh ke komponen server. HPP berjalan sinkron. Tambahkan status menunggu hanya jika kalkulator baru melakukan pekerjaan asinkron.

Aplikasi menampilkan alat terbit dan hub Bisnis dari registry. Preview Phase A memakai fixture untuk menguji kepadatan, state menunggu, dan layout masa depan. Beranda memakai judul H1 dan deskripsi yang sudah ada untuk menjaga intent SEO. Pilihan awal mengikuti urutan registry sampai ada kurasi editorial.

Untuk daftar bahan dan arus kas, gunakan fieldset dengan legend bernomor dan ID baris yang stabil. Nama field memakai jalur array untuk validasi, seperti `ingredients.0.package`. Tombol tambah memfokuskan kolom pertama baris baru. Tombol hapus memindahkan fokus ke baris terdekat. Setiap perubahan daftar membersihkan hasil lama. Batasi daftar sesuai skema dan tampilkan batasnya. `CategoryPage` membagikan layout hub yang mengambil alat terbit dari kategori registry.
