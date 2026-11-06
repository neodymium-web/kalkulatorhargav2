# Verifikasi rumus batch kalkulator bisnis

Rumus versi 1.0.0 dibandingkan dengan referensi di bawah. Contoh rupiah dihitung secara independen dari kode. Untuk harga minimum dan volume minimum, periksa juga nilai satu langkah di bawah jawaban. Angka pada dokumen ini menjadi kasus regresi di `tests/business.unit.ts`.

## Ketentuan model dan presisi

Nominal input berupa rupiah utuh nonnegatif hingga 13 digit. Selisih dan kontribusi dapat bernilai negatif. Mesin menghitung dengan BigInt. Persentase target menerima hingga dua desimal dan disimpan sebagai kelipatan 0,01 poin persentase. Margin dan markup hasil dibulatkan ke 0,01 poin persentase terdekat, dengan nilai tengah menjauh dari nol. Harga minimum dibulatkan ke atas ke rupiah utuh. Volume minimum dibulatkan ke atas ke unit utuh. Aturan pembulatan dan kasus batas ini adalah kebijakan kalkulator.

Harga dan biaya mengikuti cakupan input pengguna. Platform, pajak, logistik, iklan, dan diskon tidak dihitung otomatis. Masukkan nominal yang sudah disesuaikan jika komponen tersebut relevan. Laba kotor per unit tidak mencakup biaya usaha di luar biaya per unit yang dimasukkan. Model BEP dan target laba memakai satu produk, satu periode, harga jual dan biaya variabel per unit yang konstan, serta biaya tetap untuk periode itu.

## Harga Jual

Untuk HPP per unit `C`, harga jual positif `P` dan margin target sebagai pecahan `m`, syarat margin adalah `(P − C) / P ≥ m`. Karena `0 ≤ m < 1`, syarat itu setara dengan `P ≥ C / (1 − m)`. Penyebut margin adalah harga jual. Referensi mendukung rumus harga berbasis margin. [University of Maryland Extension, Matching Prices to Market Outlets](https://www.extension.umd.edu/resource/matching-prices-market-outlets)

- HPP Rp7.350 dengan target 18% memberi batas eksak `7350 / 0,82`. Rp8.964 memenuhi syarat karena `8964 × 82 = 735048 ≥ 735000`. Rp8.963 gagal karena `8963 × 82 = 734966`. Hasil **Rp8.964**.
- HPP Rp7.350 dengan target 0% memberi **Rp7.350**. HPP Rp0 dengan target yang valid memberi **Rp1**, harga positif terkecil, karena margin tidak terdefinisi pada harga Rp0. Target 100% ditolak sesuai domain model.

## Margin Laba Kotor

Laba kotor per unit adalah `P − C`. Margin dalam persen adalah `100 × (P − C) / P`, dengan `P > 0`. Referensi membedakan pembagi harga jual dari pembagi biaya. [University of Maine Cooperative Extension, Basic Pricing Strategies for Small Businesses](https://extension.umaine.edu/publications/3000e/)

- Harga Rp64.000 dan biaya Rp50.000 memberi laba kotor **Rp14.000**. Rasio `14000 / 64000 = 7/32` memberi 21,875%, ditampilkan **21,88%**.
- Pada harga yang sama dengan biaya Rp78.000, hasilnya **−Rp14.000** dan **−21,88%**. Jika harga Rp0, margin tidak terdefinisi dan kolom harga ditolak.

## Markup

Selisih harga atas biaya adalah `P − C`. Markup dalam persen adalah `100 × (P − C) / C`, dengan `C > 0`. [University of Maine Cooperative Extension, Basic Pricing Strategies for Small Businesses](https://extension.umaine.edu/publications/3000e/)

- Harga Rp64.000 dan biaya Rp50.000 memberi selisih **Rp14.000**. Karena `14000 / 50000 = 7/25`, markup adalah **28%**, sedangkan margin pada pasangan yang sama adalah 21,88% setelah pembulatan.
- Harga Rp0 dan biaya Rp50.000 memberi **−Rp50.000** dan **−100%**. Jika biaya Rp0, markup tidak terdefinisi dan kolom biaya ditolak.

## BEP Unit

Dengan biaya variabel per unit `V`, kontribusi `K = P − V`, biaya tetap `F` dan jumlah unit `q`, laba model adalah `qK − F`. Untuk `K > 0`, unit minimum agar laba mencapai nol atau lebih adalah `ceil(F / K)`. [OpenStax, Principles of Managerial Accounting, §3.2](https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars)

- Harga Rp45.000, biaya variabel Rp33.000, dan biaya tetap Rp83.500. Kontribusi **Rp12.000**. Enam unit menghasilkan laba `72000 − 83500 = −11500`, sedangkan tujuh menghasilkan `84000 − 83500 = 500`. Hasil **7 unit**.
- Dengan biaya tetap Rp0, **0 unit** sudah memenuhi syarat. Dengan biaya tetap Rp83.500 dan kontribusi Rp0, laba tetap −Rp83.500 pada berapa pun unit. Hasil **target tidak dapat dicapai**, dengan kontribusi **Rp0**. Kontribusi negatif membuat laba turun saat volume bertambah.

## Target Laba

Untuk target `T ≥ 0`, syaratnya `qK − F ≥ T`. Jika `K > 0`, unit minimum adalah `ceil((F + T) / K)`. Hasil berupa unit terjual. [OpenStax, Principles of Managerial Accounting, §3.2](https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars)

- Dengan kontribusi Rp12.000, biaya tetap Rp83.500, dan target Rp25.000, sembilan unit memberi laba `108000 − 83500 = 24500`. Sepuluh memberi `120000 − 83500 = 36500`. Hasil **10 unit**.
- Target Rp0 menghasilkan BEP, yaitu **7 unit** untuk biaya dan kontribusi di atas. Jika biaya tetap dan target sama-sama nol, **0 unit** sudah memenuhi syarat. Jika harga Rp32.999 dan biaya variabel Rp33.000, kontribusi **−Rp1**. Dengan biaya tetap Rp83.500 dan target Rp25.000, laba berawal dari −Rp83.500 dan terus turun. Hasil **target tidak dapat dicapai**.
