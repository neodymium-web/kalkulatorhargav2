# Verifikasi metrik iklan dan konversi Marketplace

Sumber diperiksa 7 November 2026. Definisi dan contoh independen di bawah dicatat sebelum implementasi.

## Presisi dan cakupan

Nominal memakai rupiah utuh nonnegatif hingga 13 digit, dan hitungan kunjungan/pesanan memakai bilangan bulat nonnegatif hingga 13 digit. BigInt mempertahankan nilai eksak saat perkalian dan pembagian. Hasil biasa dibulatkan ke dua desimal terdekat, dengan setengah dibulatkan ke atas. Ambang ROAS impas dibulatkan ke atas ke dua desimal agar syarat minimum tidak berkurang. ROAS dan ROAS impas memakai satuan kali (x), ACOS dan konversi memakai persen, AOV memakai rupiah dengan dua desimal.

Semua input dalam satu perhitungan harus berasal dari mata uang, periode, toko/akun, dan kelompok transaksi yang sama. Untuk data iklan, samakan platform, model atribusi, dan jendela atribusi. Aplikasi menerima agregat pengguna dan tidak mengaudit sumber analitik. Perbedaan definisi atribusi antarplatform dapat menghasilkan metrik berbeda.

## ROAS

ROAS = pendapatan teratribusi ÷ biaya iklan. Penyebut biaya iklan harus positif. Sumber mendefinisikan rasio ini dan ACOS yang membalik basisnya. ROAS menghubungkan pendapatan yang dikreditkan oleh model atribusi dengan belanja iklan. Laba, ROI, dan bukti bahwa iklan menyebabkan seluruh penjualan memerlukan analisis tambahan. [Amazon Ads, What Is Advertising Cost of Sales?](https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales)

- Rp400.000 teratribusi ÷ Rp100.000 iklan = **4,00x**.
- Rp1 ÷ Rp32 = 0,03125x, ditampilkan **0,03x**. Pendapatan nol dengan biaya positif memberi **0,00x**. Biaya nol ditolak untuk pendapatan nol maupun positif.

## ROAS Impas

Kontribusi sebelum iklan C = pendapatan teratribusi R − biaya variabel relevan V. Untuk R > 0 dan 0 < C ≤ R, margin kontribusi m = C/R. Iklan tertutup oleh kontribusi jika biaya iklan A ≤ C. Maka R/A ≥ R/C = 1/m. Ini ambang penutupan iklan pada model margin kontribusi sebelum iklan. Sumber platform mendukung bentuk 1/margin, sementara definisi kontribusi mengikuti pendapatan dikurangi biaya variabel. [Shopify, Target ROAS](https://www.shopify.com/blog/target-roas) · [OpenStax, Explain Contribution Margin](https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin)

- Pendapatan Rp100.000 dan biaya variabel Rp60.000 memberi kontribusi Rp40.000, margin 40%, dan ambang **2,50x**.
- Pendapatan Rp100.000 dan biaya variabel Rp70.000 memberi margin 30%. Ambang eksak 10/3 dibulatkan ke atas menjadi **3,34x**. Nilai 3,33 masih di bawah 10/3.
- V = 0 memberi ambang **1,00x**. V ≥ R memberi **Tidak ada ROAS impas berhingga**. R = 0 ditolak. Nilai biaya negatif ditolak sehingga kontribusi positif tidak dapat melebihi pendapatan.
- Biaya variabel mencakup biaya produk, fee marketplace, pengiriman yang ditanggung penjual, dan komponen transaksi lain yang relevan sebelum iklan. Samakan penyesuaian diskon/refund pada pendapatan dan biaya. Angka dapat berasal dari riwayat agregat atau skenario pengguna, dan mewakili margin sebelum iklan. Biaya tetap dan pajak yang belum dimasukkan dapat mengubah hasil bisnis secara keseluruhan. Margin membagi kontribusi dengan pendapatan, sedangkan markup memakai biaya sebagai pembagi.

## ACOS

ACOS = biaya iklan ÷ pendapatan penjualan teratribusi × 100%. ACOS menggunakan penjualan yang dikreditkan pada iklan, dengan cakupan yang sesuai belanja iklan. Untuk kedua nominal positif, ACOS% = 100/ROASx pada nilai eksak. Setiap hasil dibulatkan sendiri dari input, tanpa menghitung ACOS dari ROAS tampilan. [Amazon Ads, What Is Advertising Cost of Sales?](https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales)

- Rp100.000 iklan ÷ Rp400.000 teratribusi × 100 = **25,00%**, berpasangan dengan ROAS 4,00x.
- Rp1 iklan ÷ Rp3 teratribusi × 100 = **33,33%**. Biaya nol dengan pendapatan positif memberi **0,00%**. Pendapatan nol memberi **ACOS tidak terdefinisi** untuk belanja positif maupun nol. Pembagian tidak dilakukan pada kondisi tersebut.

## Konversi Toko

Konversi = kunjungan dengan sedikitnya satu pembelian ÷ seluruh kunjungan × 100%. Referensi membedakan sesi yang menghasilkan pembelian dari jumlah pesanan, karena satu sesi dapat menghasilkan beberapa pesanan. Aplikasi mensyaratkan kedua hitungan memakai definisi sesi/kunjungan, toko, kanal, dan periode yang identik. [Shopify Help Center, Behavior Reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/behaviour-reports)

- 7 kunjungan membeli dari 200 kunjungan memberi **3,50%**.
- 1 dari 32 memberi **3,13%** setelah pembulatan 3,125%. Nol dari 32 memberi **0,00%**, dan 32 dari 32 memberi **100,00%**. Jumlah kunjungan nol ditolak, begitu juga kunjungan membeli melebihi total.
- Pengunjung unik, pembeli unik, pesanan, dan sesi memiliki definisi berbeda. Hitungan harus berasal dari pasangan metrik sesi yang sepadan.

## Nilai Pesanan Rata-rata

AOV = pendapatan produk dari kelompok pesanan yang sama ÷ jumlah pesanan. Definisi pendapatan aplikasi adalah nilai produk setelah diskon saat pesanan dibuat, sebelum penyesuaian refund/retur sesudah pemesanan, serta mengecualikan ongkir dan pajak. Denominator memakai pesanan berbayar selesai dalam kelompok tanggal pemesanan yang dipilih, mengecualikan pesanan batal, belum dibayar, dan uji. Pesanan yang kemudian direfund tetap dihitung pada AOV awal ini. Jika ingin membandingkan dashboard, cocokkan aturan pemilihan pesanan dan pengakuan pendapatannya. Sumber mendukung bentuk (gross sales − discounts)/orders dan menjelaskan penyesuaian setelah pesanan dibuat. [Shopify Help Center, Analytics Fields](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/analytics-fields) · [Shopify Help Center, Rollout Analytics](https://help.shopify.com/en/manual/markets/rollouts/analytics)

- Rp100.000 dari 3 pesanan memberi **Rp33.333,33**.
- Rp1 dari 8 pesanan memberi **Rp0,13**, dibulatkan dari Rp0,125. Pendapatan nol dengan pesanan positif memberi **Rp0,00**. Pesanan nol ditolak.
- AOV menunjukkan rata-rata nilai awal pesanan pada cakupan ini. Laba memerlukan biaya dan penyesuaian pendapatan yang relevan.
