# Verifikasi rumus batch operasional

Referensi diperiksa pada 7 November 2026. Contoh di bawah dihitung dari definisi sumber dan kebijakan presisi aplikasi sebelum implementasi.

Nominal menggunakan rupiah utuh hingga 13 digit. Berat dan volume produksi menerima hingga tiga desimal dengan koma atau titik, dan dihitung sebagai bilangan bulat berskala 1.000. Persentase dibulatkan ke dua desimal dan penyusutan tahunan ke rupiah terdekat. Nilai tengah dibulatkan ke atas. Penjumlahan dan pengurangan tetap eksak dengan BigInt. Input kosong, nonnumerik, melebihi presisi, dan negatif ditolak, kecuali saldo awal kas boleh bertanda negatif. Satu rentang tanggal inklusif berlaku untuk seluruh angka dalam setiap perhitungan periode. Tanggal terbalik ditolak. Pengguna harus mencocokkan tanggal sumber data dengan rentang ini.

## Harga Pokok Penjualan

Model dagang periodik memakai persediaan awal + pembelian bersih − persediaan akhir. Pembelian bersih di sini memasukkan ongkos angkut masuk yang menjadi biaya persediaan, setelah retur, pengurangan harga, dan diskon pembelian. Gunakan satu metode penilaian persediaan yang konsisten, misalnya FIFO atau rata-rata tertimbang, dan angka dari periode yang sama. Kalkulator menerima nilai buku dalam rupiah. Hasil mengukur biaya barang dagang terjual, sedangkan HPP produksi mengukur biaya membuat produk. [OpenStax, Basic Inventory Valuation Methods](https://openstax.org/books/principles-financial-accounting/pages/10-1-describe-and-demonstrate-the-basic-inventory-valuation-methods-and-their-cost-flow-assumptions) · [OpenStax, Periodic Inventory Transactions](https://openstax.org/books/principles-financial-accounting/pages/6-7-appendix-analyze-and-record-transactions-for-merchandise-purchases-and-sales-using-the-periodic-inventory-system) · [OpenStax, Freight-In Methods](https://openstax.org/books/principles-financial-accounting/pages/6-5-discuss-and-record-transactions-applying-the-two-commonly-used-freight-in-methods)

Rp125.000 + Rp84.000 − Rp59.000 = **Rp150.000**. Persediaan akhir Rp209.000 memberi Rp0. Akhir Rp209.001 ditolak karena melampaui barang tersedia.

## Yield Bahan

Yield = berat bersih ÷ berat kotor × 100. Susut berat = berat kotor − berat bersih. Persen susut memakai rasio susut terhadap berat kotor. Gunakan satu batch dan satu satuan berat yang dipilih pengguna, gram atau kilogram. Model ini mengukur pengurangan berat. Berat bersih melebihi berat kotor ditolak. [BCcampus, Yield Testing](https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/yield-testing/)

Dari 2,4 kg menjadi 1,75 kg, susut **0,65 kg**. Rasio 175/240 memberi **72,92%**, dan 65/240 memberi **27,08%**. Persentase dibulatkan masing-masing sehingga dapat berselisih 0,01 poin dari total 100% saat keduanya tepat di tengah. Bersih nol memberi yield 0% dan susut 100%. Kotor nol tidak punya penyebut yang valid.

## Penyusutan Garis Lurus

Beban tahunan = (biaya perolehan − nilai residu) ÷ umur manfaat dalam tahun utuh positif. Biaya dan residu menggunakan rupiah. Model penyusutan buku ini memakai satu tahun penuh. Penyusutan pajak, prorata tahun parsial, dan pelepasan aset di luar cakupan. Hasil yang dibulatkan adalah estimasi satu tahun, sehingga jadwal pembukuan dapat membutuhkan penyesuaian rupiah pada tahun terakhir. [OpenStax, Depreciation Methods to Allocate Capitalized Costs](https://openstax.org/books/principles-financial-accounting/pages/11-3-explain-and-apply-depreciation-methods-to-allocate-capitalized-costs)

(Rp100.007 − Rp10.000) ÷ 4 = Rp22.501,75, ditampilkan **Rp22.502**. Jika residu sama dengan biaya, hasil Rp0. Umur nol atau residu melebihi biaya ditolak.

## Arus Kas

Arus bersih = penerimaan − pengeluaran. Saldo akhir = saldo awal + arus bersih. Gunakan saldo awal pada awal periode dan transaksi kas aktual sepanjang rentang yang dipilih. Ini ringkasan saldo dan pergerakan kas tanpa klasifikasi operasi, investasi, dan pendanaan. [OpenStax, Using Excel to Create the Short-Term Plan](https://openstax.org/books/principles-finance/pages/19-6-using-excel-to-create-the-short-term-plan)

Rp35.000 + (Rp48.000 − Rp91.000) memberi arus bersih **−Rp43.000** dan saldo akhir **−Rp8.000** dengan peringatan. Arus masuk dan keluar nol mempertahankan saldo awal, termasuk saldo awal negatif.

## Utilisasi Kapasitas

Utilisasi = produksi aktual ÷ kapasitas acuan tersedia × 100. Gunakan satuan keluaran yang sama untuk kedua angka, misalnya unit, kg, atau liter, pada satu periode dan lingkup produksi yang sama. Referensi mendukung rasio keluaran terhadap kapasitas. Model aplikasi memakai kapasitas acuan dari pengguna, sehingga produksi bisa melampaui acuan. [Federal Reserve, G.17 Capacity Utilization Explanatory Notes](https://www.federalreserve.gov/releases/g17/CapNotes.htm)

98,5 kg ÷ 80 kg × 100 = 123,125%, ditampilkan **123,13%** dengan keterangan melampaui kapasitas acuan. Produksi nol memberi 0%. Kapasitas nol ditolak. Status melampaui acuan ditentukan dari angka sebelum pembulatan.
