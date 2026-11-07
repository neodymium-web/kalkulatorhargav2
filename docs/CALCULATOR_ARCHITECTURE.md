# Registry dan penerbitan kalkulator

Inventaris di `CALCULATOR_INVENTORY.md` adalah rencana produk. Registry di `lib/registry.ts` menyimpan definisi implementasi. Pisahkan kedua lapisan agar rencana konten tidak ikut dibundel ke browser dan perubahan status rencana tidak membuat rute.

1. Ambil ID, slug, intent, dan kategori dari inventaris. Daftarkan kategori di `lib/categories.ts`. Isi `hub` hanya jika halaman kategori sudah tersedia.
2. Tambah modul TypeScript murni dengan skema Zod dan engine. Tetapkan satuan, validasi, presisi, pembulatan, dan kasus tepi. Catat rujukan tes dalam urutan contoh normal, pembulatan, batas, lalu input tidak valid.
3. Daftarkan `CalculatorDefinition` dengan judul dan deskripsi Indonesia, kata kunci, metadata input/output, versi rumus, dan sumber resmi bila relevan. Definisi `idea` atau `draft` boleh dibuat selama pengembangan.
4. Daftarkan komponen form dan metodologi di `components/calculators/views.ts`. Gunakan form klien untuk interaksi dan metodologi server untuk rumus, contoh, serta batas penggunaan. Rute bersama menangani metadata, breadcrumb dan alat terkait.
5. Ubah status menjadi `published` setelah engine, tampilan, konten, sumber, dan tes lolos. Status terbit mensyaratkan engine dan rujukan tes pada tipe. Build gagal jika alat terbit tidak memiliki view. Perbarui status inventaris di PR yang sama.

`listPublished` membatasi direktori, pencarian, sitemap, relasi, dan parameter statis. Browser hanya menerima proyeksi direktori yang bisa diserialisasi. Rute `/kalkulator/[slug]` menggunakan `dynamicParams = false`. Slug yang belum terbit dan slug tak dikenal menghasilkan 404. Rute publik HPP tetap `/kalkulator/hpp`.

## Tarif dinamis dan sumber resmi

Gunakan dokumen otoritatif dari platform, regulator, atau penerbit produk. Untuk marketplace, verifikasi kategori, program, kanal, komponen biaya dan dasar pengenaannya di dokumentasi resmi penjual. Untuk pajak, gunakan regulasi dan panduan instansi yang berlaku untuk masa serta wilayah terkait. Untuk pinjaman, minta pengguna mengisi suku bunga, biaya, dan fase dari penawarannya. Gunakan dokumen produk resmi jika kelak ada preset yang diterbitkan.

Setiap snapshot preset harus memuat URL dan judul resmi, waktu verifikasi UTC, tanggal mulai berlaku, tanggal berakhir jika diketahui, wilayah atau program, dan versi data. Simpan catatan perubahan dengan alasan, perbedaan basis tarif, dan versi lama. Pilih snapshot berdasarkan tanggal transaksi. Jika dua aturan tumpang tindih, minta pemilihan skenario yang didukung sumber. Naikkan versi data saat parameter atau cakupan berubah, dan versi rumus saat algoritme, basis pengenaan, atau pembulatan berubah.

Jika sumber belum terverifikasi, kedaluwarsa, atau tidak mencakup transaksi pengguna, sembunyikan preset. Untuk alat yang mendukung input manual, tampilkan nilai tersebut sebagai asumsi pengguna serta jelaskan komponen biaya yang belum tercakup. Untuk alat yang bergantung pada aturan resmi, tahan publikasi sampai sumber dan periode tersedia. Jangan memasukkan tarif default dari artikel pihak ketiga.

### Checklist perubahan tarif

- Konfirmasi dokumen resmi, periode berlaku, wilayah, program, komponen, dasar, dan pembulatan.
- Arsipkan versi dan perbarui catatan perubahan beserta tanggal verifikasi.
- Uji batas pergantian tanggal, kategori, potongan gabungan, serta skenario tanpa snapshot.
- Periksa form dan hasil agar sumber resmi dan input manual terlihat jelas.
- Tinjau sitemap, canonical, dan perilaku rute sebelum mengubah status terbit.

## Verifikasi rumus batch bisnis

Lihat [catatan verifikasi rumus](BUSINESS_FORMULA_VERIFICATION.md) untuk sumber, asumsi, pembulatan, dan contoh uji independen kelima alat.

Lihat juga [verifikasi batch operasional](BATCH_2_FORMULA_VERIFICATION.md).

Lihat juga [verifikasi batch persediaan, kas, dan jasa](BATCH_3_FORMULA_VERIFICATION.md).

Lihat juga [verifikasi batch resep, proyek, persediaan, investasi, dan paket](BATCH_4_FORMULA_VERIFICATION.md).

Lihat juga [verifikasi metrik iklan dan konversi](BATCH_5_FORMULA_VERIFICATION.md).

Lihat juga [verifikasi bunga, cicilan, dan rasio cicilan](BATCH_7_FORMULA_VERIFICATION.md), termasuk konvensi pembulatan dan rekonsiliasi jadwal rupiah.

Lihat juga [verifikasi tabungan, cadangan, deposito, ROI dan CAGR](BATCH_8_FORMULA_VERIFICATION.md), termasuk bukti setoran minimum dan pembulatan akar bertanda.

Lihat juga [verifikasi nilai kini, NPV, inflasi dan saham](BATCH_9_FORMULA_VERIFICATION.md), termasuk arus kas bertanda serta biaya perolehan multi-transaksi.

Lihat juga [verifikasi pinjaman bertanggal, KPR, pelunasan, refinancing dan kurs](BATCH_10_FORMULA_VERIFICATION.md).

Lihat juga [verifikasi engagement, pertumbuhan pengikut dan biaya iklan](BATCH_11_FORMULA_VERIFICATION.md).

Lihat [verifikasi CTR, model RPM, empat modul TikTok, pricing dan waktu](BATCH_12_FORMULA_VERIFICATION.md).

Lihat [verifikasi diskon, unit price, alokasi tagihan dan persen](BATCH_13_FORMULA_VERIFICATION.md).

Lihat [verifikasi kalender Gregorian, hari kerja, usia, shift dan BBM](BATCH_14_FORMULA_VERIFICATION.md), termasuk bukti ordinal integer, anniversary asli dan pembulatan biaya dari rasio eksak.

Lihat [verifikasi listrik, air progresif, cat, keramik dan beton](BATCH_15_FORMULA_VERIFICATION.md), termasuk konservasi blok air, ceiling dari pecahan asli dan batas galat pendekatan π.
