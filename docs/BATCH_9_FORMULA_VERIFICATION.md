# Verifikasi rumus Batch 9: valuasi, inflasi, dan saham

Diverifikasi 7 November 2026, sebelum implementasi. Versi rumus 1.0.0. Semua tingkat, harga, ukuran lot, biaya dan pajak adalah input pengguna, tanpa data pasar atau tarif hukum bawaan.

## Sumber yang berhasil dibuka

- [OpenStax, Principles of Finance 7.3: Methods for Solving Time Value of Money Problems](https://openstax.org/books/principles-finance/pages/7-3-methods-for-solving-time-value-of-money-problems): hubungan nilai masa depan dan nilai kini dari satu pembayaran.
- [OpenStax 16.2: Net Present Value Method](https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method): jumlah nilai kini arus kas, termasuk pengeluaran awal CF0 hari ini.
- [Bank Indonesia: Inflasi](https://www.bi.go.id/id/fungsi-utama/moneter/inflasi/Default.aspx): definisi kenaikan harga umum. Laju tetap dalam kalkulator merupakan skenario matematika, bukan statistik resmi atau perkiraan BI.
- [OpenStax, Principles of Finance 2e 13.1: Measures of Center](https://openstax.org/books/principles-finance-2e/pages/13-1-measures-of-center): rata-rata berbobot, jumlah nilai×bobot dibagi jumlah bobot.
- [Investor.gov / SEC: Stocks](https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks): kepemilikan saham dan adanya biaya/komisi beli-jual.
- [Investor.gov / SEC: Better Understanding Your Brokerage Account Statement](https://www.investor.gov/better-understanding-your-brokerage-account-statement): harga, kuantitas, biaya transaksi, cost basis dan gain/loss pada laporan broker. Sumber edukasi regulator AS ini tidak dijadikan aturan pajak Indonesia atau izin metode cost basis fiskal.

Model rata-rata adalah alokasi biaya ekonomi, bukan laporan pajak atau metode fiskal universal. Tidak ada default aturan BEI, kurs, harga saham, fee atau pajak broker. Periksa catatan transaksi dan ketentuan produk yang berlaku. Angka contoh lot100 hanya input ilustratif. Dividen, split, rights issue, transfer dan aksi korporasi di luar cakupan. Simulasi bukan rekomendasi investasi atau jaminan hasil.

## Domain dan presisi bersama

- Rupiah input nonnegatif hingga13digit; NPV menerima rupiah bulat bertanda minus. Harga saham per lembar menerima hingga2desimal rupiah, koma/titik, dengan bagian bulat hingga13digit. Biaya/pajak input adalah rupiah bulat **total transaksi**, bukan persen atau per lembar.
- Diskonto/inflasi tahunan0–100%, hingga4desimal persen, disimpan sebagai pecahan integer S=1.000.000 untuk100%. Model batch ini tidak mendukung diskonto negatif atau deflasi. Tingkat per tahun langsung cocok dengan periode tahunan; tidak ada pembagian12 atau konversi APR pada batch ini.
- Nilai Kini/Inflasi menerima0–100tahun utuh. NPV1–101baris untuk t=0…100tahun, selalu berurutan. Pembelian saham1–100transaksi. Lot dan lembar/lot bilangan bulat positif hingga13digit, harus konsisten untuk seluruh transaksi yang digabungkan.
- Semua nilai memakai BigInt, pangkat integer dan pecahan rasional dengan reduksi gcd. Tidak ada Number pada uang atau floating-point power. Hasil uang hingga0,01rupiah; ROI saham hingga0,01poin persen. Half-up bertanda berarti tie menjauh dari nol. Nominal stok yang sudah berada pada satuan sen tetap eksak sebelum pembagian rata-rata.
- Nilai uang/rasio positif atau negatif yang membulat menjadi nol tetap diberi batas bertanda. Inflasi dibatasi harga masa depan eksak maksimum Rp999.999.999.999.999.999; parameter melampaui batas ditolak. Input periode/baris dibatasi sebelum perpangkatan.

## Nilai Kini

Intent: nilai hari ini dari **satu pembayaran nominal** FV pada akhir tahun n. Untuk r pecahan diskonto tahunan, FV=PV(1+r)^n, maka PV=FV/(1+r)^n. Ini bukan NPV proyek atau estimasi daya beli. Pada r=0 atau n=0, PV=FV; FV=0 memberi0. Karena r≥0, 0≤PV≤FV. Penyebut selalu positif. Selisih tampilan dari nominal=FV−PV tampilan, sehingga rincian cocok; ini bukan bunga kas yang dibayarkan.

Contoh independen:

1. FV=Rp1.210,r=10%,n=2: PV=1.210/(11/10)^2=Rp1.000; selisih Rp210.
2. FV=Rp100,r=10%,n=2: PV=10.000/121=Rp82,644628… →Rp82,64; selisih tampilan Rp17,36. FV=Rp1,r=100%,n=100 memberi PV=1/2^100>0 dan ditandai <Rp0,01. Tahun0 valid; tahun101, diskonto negatif atau≤−100% ditolak.

## NPV

Intent: nilai kini bersih arus kas **neto** tahunan CF_t. CF0 berada hari ini, lalu tiap baris berikutnya pada akhir tahun1,2,…,N. Arus masuk positif dan pengeluaran negatif; biaya awal tidak dikurangkan lagi lewat input lain. NPV=sum CF_t/(1+i)^t. CF0 mempunyai pangkat0, sehingga tidak didiskontokan. Tahun tidak beraturan memerlukan model lain; menambah/menghapus baris mengubah indeks waktu baris setelahnya.

Pecahan seluruh arus dijumlahkan sebelum pembulatan NPV. Rincian PV per baris boleh dibulatkan untuk tampilan, tetapi **tidak** digunakan untuk total. Karena itu jumlah angka baris tampilan bisa berbeda Rp0,01 dari footer. Dekomposisi memperlihatkan tahun, CF nominal bertanda, PV baris, dan total NPV dari pecahan asli. Status positif/negatif/nol ditentukan sebelum pembulatan. NPV positif bukan jaminan laba aktual; hasil sensitif terhadap arus, diskonto dan risiko. Ini bukan IRR.

Contoh independen:

1. i=10%, CF=[−1.000,600,600]. PV0=−1.000; PV1=6.000/11; PV2=60.000/121. NPV=5.000/121=Rp41,322314… →Rp41,32. Pada i=0, NPV=sum CF=Rp200.
2. i=100%, CF=[0,0,0,1,0,0,1]: NPV=1/8+1/64=9/64=Rp0,140625 →Rp0,14. Rincian Rp0,13 dan Rp0,02 tidak boleh dijumlah menjadi Rp0,15 sebagai NPV.
3. i=100%, CF=[−1,0,0,7]: NPV=−1+7/8=−Rp0,125 →−Rp0,13 (tie negatif). Rincian−1,00+0,88 dapat terlihat−0,12; footer tetap−0,13 dengan catatan pembulatan. CF=[−100,50,−10] pada diskonto0 memberi−60; CF=[0] memberi0. Nilai−1 pada tahun100 dengan diskonto100% tetap negatif kecil, bukan tepat0. Daftar kosong dan102baris ditolak.

## Inflasi

Intent: dua interpretasi **terpisah** dari P rupiah hari ini dan asumsi inflasi tahunan h. Harga keranjang yang saat ini berharga P diproyeksikan menjadi F=P(1+h)^n. Daya beli dari nominal uang yang **tetap P** pada tahun n, dinyatakan dalam uang hari ini, adalah R=P/(1+h)^n. Ini kebalikan faktor harga, bukan selisih F dengan uang tetap. Model majemuk, tidak memakai pendekatan linear P(1+hn). Laju tidak diambil dari statistik resmi dan tidak dijamin konstan.

F dan R dibulatkan half-up masing-masing ke0,01rupiah. Kenaikan harga tampilan=Fbulat−P; kehilangan daya beli tampilan=P−Rbulat. Perubahan diturunkan dari komponen tampilan agar jumlah konsisten, bukan dibulatkan terpisah pada tie yang bisa menambah satu sen. Nilai eksak perubahan positif subpresisi diberi tanda. h=0 atau n=0 mempertahankan P; P=0 memberi semua0. Deflasi tidak didukung.

Contoh independen:

1. P=100,h=10%,n=2: F=121,00; R=10.000/121→82,64; kenaikan21,00 dan kehilangan17,36. Angka21 adalah kenaikan harga keranjang, bukan kehilangan daya beli uang100.
2. P=1,h=100%,n=3: F=8,00, R=0,125→0,13; kehilangan tampilan0,87 agar R+kehilangan=1,00. Membulatkan kehilangan0,875 sendiri ke0,88 akan membuat jumlah1,01. n=0 memberi1,00 untuk F/R dan perubahan0. Proyeksi di atas batas harga ditolak.

## Rata-rata Beli Saham

Intent: biaya perolehan rata-rata ekonomi saham yang sama dari banyak transaksi beli. L=lembar/lot yang diisi pengguna dan berlaku konsisten; q_j=lot dibeli pada baris j; s_j=q_jL; p_j=harga bruto per lembar; f_j=total fee beli rupiah transaksi tersebut. Total lembar=sum s_j>0; nominal beli=sum p_js_j; total biaya perolehan C=sum(p_js_j+f_j); rata-rata/lembar=C/sum s_j. Rata-rata/lot=CL/sum s_j, dihitung sendiri dari C, bukan rata-rata lembar tampilan×L. Semua biaya dialokasikan setelah penjumlahan; tidak ada pembulatan biaya per lembar per baris.

Hanya gabungkan saham yang sama dan ukuran lot konsisten. Semua transaksi harus memiliki lot positif. Harga0/fee0 boleh; jumlah saham tetap positif. Rata-rata tampilan hanya diagnostik karena pembagian bisa berulang. Untuk pembukuan presisi pakai total perolehan dan catatan broker; corporate actions tidak diproses.

Contoh independen:

1. L=100; beli2lot×Rp1.000 dengan feeRp1.000, lalu1lot×Rp2.000 dengan feeRp500. Total300lembar,3lot,nominal400.000,fee1.500,C401.500. Rata-rata/lembar1.338,333… →Rp1.338,33; per lot133.833,333… →Rp133.833,33. Rata-rata tak berbobot1.500 salah untuk jumlah berbeda.
2. L=3; beli1lot pada harga0 dengan feeRp1: C1,00 dan3lembar; rata-rata0,333… →Rp0,33, per lot1,00 **bukan0,99**. Dua transaksi1lembar pada Rp0,01 danRp0,02 memberi C0,03 dan rata-rata0,015→0,02; C tidak diubah menjadi0,04. Lot0, lembar/lot0, daftar kosong atau101transaksi ditolak.

## Untung Rugi Saham

Intent: P&L untuk **jumlah saham yang sama yang dijual**, bukan laba seluruh portofolio. s=lot dijual×lembar/lot; B=p_beli×s+fee_beli; V=p_jual×s; J=V−fee_jual−pajak_jual_manual; laba=J−B; ROI=100×laba/B%. Harga bruto per lembar dapat2desimal; biaya/pajak total rupiah bulat. Semua ledger hasil sudah eksak dalam sen; hanya ROI dibulatkan half-away ke2desimal persen. B wajib positif. J<0 ditolak pada fee atau pajak yang membuat biaya jual berlebih. Dengan J≥0 dan B>0, ROI≥−100%; laba, impas dan rugi valid.

Pajak opsional nominal input, kosong berarti nol dalam model saja. Tidak ada tarif broker/pajak atau harga langsung. Gunakan fee beli yang dialokasikan untuk saham yang dijual, bukan seluruh posisi yang masih ditahan. Jika harga beli sudah merupakan basis termasuk fee (misalnya rata-rata), fee beli tambahan harus0. Rata-rata **yang sudah dibulatkan** dari alat sebelumnya tidak boleh dianggap basis akuntansi persis; gunakan catatan presisi. Skenario harga jual yang belum terealisasi bukan laba tunai aktual. Pajak mengikuti data/ketentuan pengguna, bukan perhitungan hukum otomatis.

Contoh independen:

1. s=2lot×100=200lembar; beliRp10,fee10 →B2.010; jualRp12,fee5,pajak manual3 →V2.400,J2.392,laba382,ROI=382/2.010×100=19,004975… →19,00%.
2. s=1,beli100,fee5,jual90,fee2,pajak1 →B105,J87,laba−18,ROI−17,142857… →−17,14%. J=0 memberi tepat−100%; J=B memberi0%. B0 ditolak. J negatif karena fee/pajak berlebih ditolak. B=32,J=31 memberi ROI−3,125%→−3,13%, menguji tie negatif. Harga Rp0,01,3lembar memberi nominal Rp0,03 tanpa pembulatan ke rupiah.

## Bukti penerimaan

Unit test mencakup fixtures, signed tie, jumlah NPV pecahan, invariant saham, harga/rate/ukuran maksimum dan input rusak. Browser memeriksa t0, baris transaksi, fokus tambah/hapus serta data tersisa, invalid per baris, batas viewport dan screenshot. Katalog tetap100unik,46published,15Keuangan; sitemap50URL. Alat belum terbit tetap404/noindex. Catatan PR #23/#25 mengenai cap dan penutup cicilan adalah tindak lanjut terpisah; engine lama tidak diubah.
