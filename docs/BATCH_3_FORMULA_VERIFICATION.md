# Verifikasi rumus persediaan, kas, dan jasa

Sumber diperiksa 7 November 2026. Contoh di bawah dihitung independen sebelum implementasi, kemudian digunakan sebagai nilai pembanding tes unit.

## Presisi dan domain

Nominal berupa rupiah utuh nonnegatif hingga 13 digit. Kuantitas dan jam menerima hingga tiga desimal, memakai koma atau titik sebagai tanda desimal. Parser tidak menerima pemisah ribuan. Perhitungan menggunakan BigInt dan skala 1.000 untuk input pecahan. Rasio dan hari persediaan dibulatkan ke dua desimal terdekat dengan setengah dibulatkan ke atas. Runway dibulatkan turun ke dua desimal agar estimasi durasi tidak bertambah karena pembulatan. Biaya layanan dan tarif per jam dibulatkan ke atas ke rupiah utuh. Pembulatan hanya dilakukan saat membentuk hasil, tanpa memakai hasil pembulatan sebagai penyebut perhitungan berikutnya.

Angka negatif, kosong, nonnumerik, atau melebihi batas input ditolak. Kas negatif ditolak karena model menerima dana tersedia. Kas nol dengan burn positif memberikan nol bulan. Satuan yang dipakai adalah unit fisik diskret untuk reorder point, transaksi tertagih per bulan untuk biaya layanan, dan jam tertagih per tahun untuk freelance. Batas teknis 13 digit bukan tolok ukur kapasitas kerja yang realistis.

## Perputaran Persediaan

Rata-rata persediaan = (nilai buku awal + akhir) ÷ 2. Perputaran = harga pokok penjualan ÷ rata-rata persediaan. Hari persediaan = hari periode ÷ perputaran eksak. Semua nilai buku dalam rupiah dari metode penilaian dan periode yang sama. Referensi mendukung penggunaan rata-rata dua titik dan hubungan antara persediaan, harga pokok penjualan, serta hari. Aplikasi menyesuaikan jumlah hari dengan rentang pengguna. [OpenStax, Examine the Efficiency of Inventory Management Using Financial Ratios](https://openstax.org/books/principles-financial-accounting/pages/10-5-examine-the-efficiency-of-inventory-management-using-financial-ratios)

Untuk 1–30 April 2026 inklusif, hari periode 30. Harga pokok penjualan Rp90.000, awal Rp20.000, akhir Rp40.000 memberi rata-rata Rp30.000, perputaran **3 kali**, dan **10 hari**. Bila harga pokok penjualan nol dan rata-rata positif, perputaran **0 kali**, sementara hari persediaan **tidak terdefinisi**. Rata-rata nol ditolak. Awal Rp1 dan akhir Rp2 memberi rata-rata eksak Rp1,50 yang tetap dipakai sebelum menghitung rasio. Tanggal akhir sebelum awal ditolak. Hasil adalah ringkasan historis dan peka terhadap musim serta pemilihan dua saldo.

## Reorder Point

Titik pemesanan ulang = permintaan rata-rata harian × lead time hari + stok aman. Referensi menjelaskan permintaan selama lead time dan tambahan safety stock. [Virginia Cooperative Extension, Lean Inventory Management in the Wood Products Industry](https://spes.vt.edu/content/pubs_ext_vt_edu/en/420/420-148/420-148.html)

Permintaan 2,5 unit/hari × lead time 3,25 hari + stok aman 1,1 unit = 9,225 unit. Ambang untuk unit fisik diskret dibulatkan ke atas menjadi **10 unit**. Ambang 9 unit tidak menutup kebutuhan model. Lead time nol memberi stok aman saja, dibulatkan ke atas. Seluruh input nol memberi 0 unit. Input negatif ditolak. Permintaan, stok, dan lead time harus mengacu pada item dan basis hari yang sama. Rata-rata musiman, ketidakpastian pemasok, dan stok aman adalah asumsi pengguna. Jumlah yang perlu dipesan dan EOQ di luar cakupan.

## Runway Kas

Burn bersih per bulan = kas keluar bulanan − kas masuk bulanan. Untuk burn positif, runway = kas tersedia ÷ burn bersih bulanan. Referensi mendukung rasio kas terhadap burn bulanan. [Stripe Atlas, Business Banking Solutions for Optimal Cash Management](https://stripe.com/en-at/guides/atlas/business-banking-solutions-for-optimal-cash-management)

Kas Rp100.000, keluar Rp40.000/bulan, masuk Rp10.000/bulan memberi burn Rp30.000 dan **3,33 bulan** setelah pembulatan turun. Kas nol dengan burn Rp30.000 memberi **0 bulan**. Jika masuk sama atau melebihi keluar, jawaban utama **Tidak ada burn bersih** dan keterangan **Tidak terbatas dalam model konstan**. Kas negatif ditolak. Kas tersedia adalah saldo saat proyeksi dimulai. Kedua arus bulanan harus berasal dari bulan acuan yang sama atau rata-rata bulanan yang sama. Model konstan perlu ditinjau jika ada musim, utang jatuh tempo, pembelian aset, atau perubahan penerimaan.

## Biaya Layanan

Biaya total bulanan = biaya tetap bulanan + transaksi tertagih × biaya variabel/transaksi. Alokasi tetap/transaksi = biaya tetap ÷ transaksi. Biaya/transaksi = alokasi tetap + biaya variabel/transaksi. Referensi mendukung pembagian biaya tetap dan variabel ke satuan keluaran. Aplikasi menerapkannya pada transaksi jasa tertagih. [OpenStax, Identify and Apply Basic Cost Behavior Patterns](https://openstax.org/books/principles-managerial-accounting/pages/2-2-identify-and-apply-basic-cost-behavior-patterns)

Tetap Rp100.001/bulan, 3 transaksi tertagih, variabel Rp2.000/transaksi memberi total **Rp106.001**. Alokasi tetap **Rp33.334** dan biaya minimum utuh **Rp35.334/transaksi** dibulatkan ke atas. Dua kali pembulatan tidak diterapkan pada total. Seluruh biaya nol dengan 3 transaksi memberi Rp0. Transaksi nol atau pecahan ditolak. Gunakan transaksi yang benar-benar tertagih pada bulan yang sama dengan biaya, bukan kapasitas maksimum. Asumsi penjualan mengubah alokasi. Hasil belum menetapkan harga jual atau laba.

## Tarif Freelance

Kebutuhan pendapatan tahunan = target penghasilan pemilik sebelum pajak + biaya operasi tahunan. Tarif minimum/jam = kebutuhan ÷ jam tertagih/tahun, dibulatkan ke atas. Referensi mencakup penghasilan, biaya, laba tambahan dan jam tertagih. Model aplikasi menetapkan laba tambahan di luar penghasilan pemilik sebesar nol, dan memakai input pengguna untuk dua komponen kebutuhan. [Freelancers Union, How to Get Paid What You’re Worth as a Freelancer](https://blog.freelancersunion.org/2014/02/03/how-get-paid-what-youre-worth/)

Penghasilan Rp120.000.000 + biaya Rp12.000.001 = kebutuhan **Rp132.000.001/tahun**. Dibagi 1.000,5 jam tertagih memberi batas antara Rp131.934 dan Rp131.935. Karena 131934 × 1000,5 = 131999967, tarif minimum adalah **Rp131.935/jam**. Kebutuhan nol dengan jam positif memberi Rp0. Jam nol ditolak. Biaya operasi tidak memasukkan kembali penghasilan pemilik. Jam administrasi, pemasaran, cuti dan waktu tanpa klien dikeluarkan dari jam tertagih. Tidak ada batas kapasitas manusia yang diasumsikan atau tolok ukur tarif pasar. Pajak, margin tambahan dan fee platform perlu dihitung pengguna dalam kebutuhannya jika relevan.
