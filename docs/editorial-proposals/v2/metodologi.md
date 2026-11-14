# Metodologi KalkulatorHarga.com

> **DRAF INTERNAL · PENDING_OWNER_APPROVAL.** Usulan pengganti `/metodologi`. Bukan verifikasi hukum, sertifikasi semua 100 kalkulator, atau aktivasi tarif resmi.

KalkulatorHarga.com mengolah input pengguna dengan rumus dan asumsi yang dinyatakan pada setiap alat. Perhitungan simulasi tidak otomatis sama dengan invoice, laporan pajak, harga pasar, atau nilai transaksi aktual.

## Prinsip perhitungan

Input, satuan, basis perhitungan, pembulatan dan kasus yang tidak dapat dihitung harus dibaca bersama hasil. Contoh angka adalah ilustrasi, bukan tarif atau harga yang berlaku otomatis.

## Kalkulator biaya penjual marketplace

Pada model settlement manual:

- Bruto penjualan = harga per unit × kuantitas.
- Penjualan setelah diskon = bruto − diskon **yang ditanggung seller**.
- Fee = penjumlahan tiap biaya manual berdasarkan basis yang dipilih (bruto, setelah diskon, atau nilai custom bila didukung), termasuk batas minimum/maksimum **per pesanan** jika berlaku.
- Dana cair simulasi sebelum pembulatan = penjualan setelah diskon + kredit yang benar-benar masuk ke seller − fee − ongkir seller − biaya lain.
- Hasil setelah HPP = dana cair cash simulasi − HPP seluruh unit; **bukan laba bersih akuntansi**.

Engine mempertahankan nilai fee sebagai pecahan rasional eksak dan membulatkan dana cair agregat sekali ke rupiah (setengah menjauhi nol). Aturan pembulatan simulasi tidak dijamin sama dengan invoice penyedia platform. Ongkir pembeli yang hanya diteruskan kepada penyedia logistik tidak otomatis dihitung sebagai pendapatan seller.

Data biaya, basis, minimum, maksimum atau cakupan yang belum diketahui dapat menyebabkan hasil **ditahan tanpa nominal**. Pajak terpisah, retur, sengketa, dan cap per unit yang belum dipetakan berada di luar model tersebut.

Tidak ada tarif resmi otomatis berdasarkan kategori, tier, program, atau tanggal transaksi. Pengguna harus merujuk catatan pesanan/kontrak sesuai situasi.

## Kalkulator kreator dan keuangan

Simulasi TikTok kreator menerima asumsi RPM/tayangan serta pendapatan neto dari komponen lain; tidak memeriksa eligibility atau saldo platform. Rasio engagement tergantung komponen interaksi dan penyebut yang digunakan.

Alat keuangan mempunyai asumsi dan batas masing-masing. Aturan pasar, pajak, dan fee broker tidak boleh dianggap otomatis lengkap bila tidak dibuktikan oleh input serta aturan yang berlaku.

## Sumber dan versi

Rujukan arsip legacy hanya dipertahankan sebagai provenance historis. Tanggal yang tercetak pada arsip bukan tanggal verifikasi v2. Pernyataan perubahan metode perlu disesuaikan dengan commit, tes, dan dokumentasi yang benar-benar tersedia.

**Sebelum publikasi:** verifikasi setiap tautan dan ruang lingkup klaim; cek pengungkapan modal uang dan pajak; tinjau seluruh frasa yang menyiratkan proses editorial atau update tarif otomatis.
