# Verifikasi rumus resep, proyek, persediaan, investasi, dan paket

Referensi diperiksa 7 November 2026. Contoh berikut dihitung independen sebelum implementasi. Kebijakan tampilan dan batas input di bagian ini merupakan keputusan aplikasi.

## Presisi

Nominal memakai rupiah utuh hingga 13 digit. Kuantitas, dimensi, divisor, dan jam menerima hingga tiga desimal dengan koma atau titik. Parser menolak pemisah ribuan, angka eksponensial, dan input kosong. Perhitungan uang memakai BigInt dan pecahan rasional yang disederhanakan, sehingga biaya bahan tidak dibulatkan per baris sebelum penjumlahan. Jumlah resep, biaya per porsi, biaya proyek, dan penawaran minimum dibulatkan ke atas ke rupiah utuh. Payback ditampilkan hingga dua desimal dari pecahan eksak dengan setengah dibulatkan ke atas. Berat ditampilkan hingga enam desimal sebagai perbandingan mentah sebelum aturan kurir. Batas teknis daftar adalah 100 bahan atau 120 periode agar form dan perhitungan tetap terkelola.

## Food Cost

Untuk setiap bahan, biaya terpakai = harga kemasan × jumlah terpakai ÷ isi kemasan. Jumlahkan biaya seluruh bahan, lalu bagi dengan porsi. Referensi memakai rincian bahan resep dan biaya per porsi. Contoh sumber menunjukkan efek pembulatan antara langkah, sehingga aplikasi menyimpan pecahan eksak sampai hasil akhir. [BCcampus, Controlling Food Costs](https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/controlling-food-costs/)

- Bahan A Rp20.000 untuk 1.000 g, dipakai 250 g, memberi Rp5.000. Bahan B Rp12.000 untuk 6 unit, dipakai 2 unit, memberi Rp4.000. Total **Rp9.000**, untuk 4 porsi menjadi **Rp2.250/porsi**.
- Dua bahan masing-masing berharga Rp1 untuk kemasan berisi 3 unit dan pemakaian 1 unit menghasilkan total eksak 2/3 rupiah. Total tampilan **Rp1**, untuk 2 porsi biaya eksak 1/3 rupiah ditampilkan **Rp1/porsi**. Membulatkan dua baris lebih dulu akan memberi hasil berbeda.
- Isi kemasan nol, porsi nol, daftar kosong, atau satuan tidak didukung ditolak. Pemakaian nol sah. Setiap baris memiliki satu satuan bersama untuk kemasan dan pemakaian, dipilih dari g, kg, ml, l, atau unit. Pemakaian boleh melebihi satu kemasan. Biaya ini mencakup bahan saja. Tenaga kerja, utilitas, susut yang tidak tercermin dalam kuantitas, fee layanan, harga jual dan food-cost percentage memerlukan input/model tambahan.

## Harga Borongan

Biaya proyek = jam kerja × biaya tenaga kerja per jam + material + overhead proyek. Penawaran minimum = biaya proyek + target laba tetap dalam rupiah. Referensi mendukung komponen biaya pekerjaan dan penambahan laba yang diinginkan. [OpenStax, Compute the Cost of a Job Using Job Order Costing](https://openstax.org/books/principles-managerial-accounting/pages/4-5-compute-the-cost-of-a-job-using-job-order-costing) · [Business Queensland, Cost-plus Pricing Calculator](https://www.business.qld.gov.au/running-business/marketing-sales/marketing/calculators/cost-plus-pricing)

- 2,5 jam × Rp40.000/jam + material Rp30.000 + overhead Rp10.000 = **Rp140.000** biaya. Target laba Rp25.000 memberi penawaran **Rp165.000**.
- 0,001 jam × Rp1/jam dengan biaya lain dan target nol memberi biaya eksak Rp0,001 dan penawaran utuh **Rp1**. Semua input nol memberi Rp0. Negatif ditolak.
- Biaya per jam adalah pengeluaran tenaga kerja proyek. Tarif kepada pelanggan merupakan hasil penawaran. Target laba menggunakan nominal tetap. Pajak dan cadangan risiko perlu diperkirakan pengguna di luar model ini.

## EOQ

Untuk permintaan D unit/tahun, biaya pesan S rupiah/pesanan dan simpan H rupiah/unit/tahun, biaya relevan tahunan C(Q) = DS/Q + HQ/2. Akar dari kondisi minimum memberi Q* = sqrt(2DS/H). [MIT OpenCourseWare, Introduction to Manufacturing Systems, Inventory, slide 44–50](https://www.ocw.mit.edu/courses/2-854-introduction-to-manufacturing-systems-fall-2016/6c8fec8f99bcf7059b73b82e96d43901_MIT2_854F16_Inventory.pdf)

Aplikasi memilih unit pesanan utuh dengan biaya C terkecil di antara lantai dan langit-langit Q*. Akar bulat dihitung dengan BigInt. Jika lantai k ≥ 1, pilih k bila 2DS ≤ Hk(k+1), selain itu pilih k+1. Ini membandingkan biaya eksak, dengan nilai sama memilih yang lebih kecil. Jika Q* < 1, pilih 1 unit. Biaya pesan dan simpan untuk Q terpilih ditampilkan dalam rupiah terdekat.

- D=1.000, S=100, H=20 memberi Q*=100. Hasil **100 unit**, biaya pesan **Rp1.000/tahun** dan biaya simpan **Rp1.000/tahun**.
- D=10, S=1, H=3 memberi akar antara 2 dan 3. C(2)=5+3=8, sedangkan C(3)=10/3+4,5=47/6. Hasil **3 unit**, biaya pesan Rp3 dan biaya simpan Rp5 setelah pembulatan. Nilai tengah di biaya simpan dibulatkan ke atas.
- H harus positif. D atau S nol memberikan batas optimum kontinu nol sebagai **kasus degenerat**, dengan penjelasan bahwa model tidak memberi ukuran pesanan fisik. Asumsi model meliputi permintaan konstan, kedatangan langsung, tanpa stockout dan diskon kuantitas. Kapasitas gudang dan batas minimum pemasok perlu ditinjau terpisah.

## Payback Period

Kurangi investasi awal dengan akumulasi arus kas bersih yang diurutkan per periode. Saat pertama kali pulih, waktu = jumlah periode penuh sebelum pemulihan + sisa investasi ÷ arus kas positif pada periode pemulihan. Referensi mendukung penjumlahan arus kas tidak seragam dan fraksi periode. [OpenStax, Evaluate the Payback and Accounting Rate of Return in Capital Investment Decisions](https://openstax.org/books/principles-managerial-accounting/pages/11-2-evaluate-the-payback-and-accounting-rate-of-return-in-capital-investment-decisions)

- Investasi Rp100, arus [Rp30, −Rp10, Rp50, Rp60] memberi kumulatif 30, 20, 70, 130. Pemulihan pertama pada **3,5 periode**. Dengan periode tahun, hasil 3,5 tahun.
- Investasi Rp100, arus [Rp120, −Rp100] pulih pertama pada **0,83 periode** setelah pembulatan dari 5/6. Saldo kemudian jatuh di bawah investasi lagi. Produk secara eksplisit memakai pemulihan pertama, dengan peringatan jika saldo akhir di bawah investasi.
- Investasi Rp100 dengan [Rp20, −Rp10] menghasilkan **belum kembali dalam horizon yang diisi**, dengan kumulatif Rp10. Investasi nol pulih di awal, yaitu 0 periode. Daftar kosong ditolak. Arus kas boleh negatif dan semua periode harus sama panjang. Fraksi memakai asumsi arus merata selama periode. Diskonto, NPV dan jaminan pemulihan berkelanjutan di luar model.

## Berat Volumetrik

Dengan dimensi cm dan divisor cm³/kg dari pengguna, berat volumetrik = panjang × lebar × tinggi ÷ divisor. Bandingkan dengan berat aktual kg dan ambil yang lebih besar sebagai berat pembanding. Referensi kurir mendukung rumus dan perbandingan. [DHL, About Weight](https://dct.dhl.com/help)

- Dimensi 40×30×20 cm dan divisor contoh pengguna 6.000 memberi **4 kg** volumetrik. Aktual 3 kg memberi **4 kg** pembanding.
- Dimensi 10×10×10 cm dan divisor contoh pengguna 6.000 memberi **0,166667 kg** setelah pembulatan tampilan. Aktual 0,2 kg memberi **0,2 kg** pembanding. Pembandingan memakai pecahan eksak sebelum pembulatan.
- Ketiga dimensi dan divisor harus positif. Aktual nol sah. Divisor tidak diberi preset. Kurir dapat membulatkan dimensi dan berat dengan aturan berbeda. Berat pembanding mentah ini belum menentukan berat tagihan final atau biaya kirim.
