# Verifikasi rumus Batch 7: bunga, cicilan, dan rasio cicilan

Tanggal verifikasi: 7 November 2026. Versi rumus: 1.0.0. Dokumen dan contoh ini disiapkan sebelum implementasi. Semua suku bunga adalah input skenario pengguna, tanpa preset produk bank.

## Sumber yang diperiksa

1. [OpenStax, Contemporary Mathematics §6.3, Simple Interest](https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest): bunga sederhana berdasarkan pokok awal, tingkat tahunan, dan waktu dalam tahun.
2. [OpenStax §6.4, Compound Interest](https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest): kapitalisasi periodik dan effective annual yield. Nominal tahunan dibagi frekuensi kapitalisasi.
3. [OpenStax §6.8, The Basics of Loans](https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans): pembayaran anuitas biasa, bunga berdasarkan sisa pokok, serta jadwal amortisasi. Sumber memakai sen; konvensi rupiah aplikasi dijelaskan terpisah di bawah dan bukan aturan wajib bank.
4. [OJK, Seri Literasi Keuangan Buku 2: Perbankan, halaman cetak 46–47](https://sikapiuangmu.ojk.go.id/FrontEnd/LiterasiPerguruanTinggi/assets/pdf/Buku%202%20-%20Perbankan.pdf#page=46): membedakan bunga flat atas pokok awal dan anuitas atas saldo yang menurun. Sumber edukasi, bukan informasi tarif terkini.
5. [CFPB, What is a debt-to-income ratio?](https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/): DTI lazimnya memakai pendapatan **kotor**. Aplikasi ini sengaja memakai pendapatan **bersih** untuk rasio anggaran pribadi dan tidak menyamakan keduanya atau mengimpor ambang kelayakan kredit.
6. [Federal Reserve, Household Debt Service Ratios: About](https://www.federalreserve.gov/releases/DSR/about.htm): mendukung konsep pembayaran utang dibanding pendapatan disposable. Penerapan aplikasi adalah rasio anggaran individu bulanan, bukan replikasi statistik agregat tersebut.
7. [CFPB, What is the difference between a loan interest rate and the APR?](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/): APR dapat mencakup biaya selain bunga. Tingkat nominal input aplikasi tidak mewakili APR menyeluruh.

Semua URL di atas berhasil dibuka saat verifikasi. Pajak, provisi, administrasi, asuransi, biaya keterlambatan, floating rate, setoran tambahan, dan pelunasan dipercepat kontraktual tidak dimodelkan. Simulasi edukasi ini bukan penawaran, rekomendasi keuangan pribadi, atau jaminan persetujuan kredit. Cocokkan ketentuan dan pembulatan dengan kontrak.

## Domain, satuan, dan presisi

- Pokok/pendapatan/cicilan menerima rupiah utuh nonnegatif hingga 13 digit. Pendapatan pembagi wajib positif. Input pemisah ribuan, eksponen, kosong, nonnumerik, negatif, dan nonfinite ditolak.
- Tingkat nominal tahunan 0–100%, maksimal empat desimal persen, koma atau titik. Skala integer 1.000.000 mewakili pecahan 100%. Batas tersebut adalah batas model, bukan tarif wajar atau rekomendasi.
- Bunga sederhana: 0–1.200 bulan utuh. Majemuk: 0–1.200 periode utuh dan frekuensi 1, 2, 4, atau 12 per tahun. Pinjaman: 1–600 bulan utuh. Batas mencegah perhitungan dan jadwal tanpa batas.
- Pecahan dan pangkat memakai BigInt eksak, tanpa floating-point exponentiation. Nilai akhir majemuk dibatasi Rp999.999.999.999.999.999; hasil eksak di atas batas ditolak dengan error periode. Ini mencegah angka hasil yang tidak praktis, bukan batas safe integer Number.
- Hasil uang dan seluruh baris jadwal memakai rupiah utuh. Half-up berarti nilai tepat setengah rupiah dibulatkan ke atas. Gain sederhana/majemuk dibulatkan sekali di akhir; saldo akhir = pokok + gain bulat agar rincian konsisten. Gain positif yang menjadi Rp0 disertai pengungkapan subrupiah. Persentase rasio dua desimal, tingkat periodik dan yield tahunan efektif empat desimal; nilai positif yang membulat ke nol diberi tanda kurang dari increment tampilan.

## Bunga Sederhana

Intent: bunga tanpa kapitalisasi atau cicilan di tengah periode. Untuk pokok P rupiah, tingkat tahunan r sebagai pecahan, durasi h bulan: t=h/12 tahun, I=Prh/12 rupiah, saldo=P+I. Pertambahan satu bulan tidak mengubah pokok dasar bunga. Ini bukan yield efektif rekening setelah pajak/biaya.

Contoh independen:

1. P=Rp1.000.000, r=6%, h=18: I=1.000.000×6/100×18/12=Rp90.000; saldo Rp1.090.000.
2. P=Rp1, r=6%, h=1: I=Rp0,005, bunga bulat Rp0 dan saldo bulat Rp1, dengan catatan bunga eksak masih positif.
3. P=Rp100, r=6%, h=1: I=Rp0,50 menjadi Rp1; saldo Rp101. P=0, r=0, atau h=0 memberi bunga nol. Bulan negatif/pecahan atau tingkat di atas 100% invalid.

## Bunga Majemuk

Intent: pertumbuhan satu pokok tanpa setoran tambahan. m adalah kapitalisasi/tahun, k adalah **jumlah periode kapitalisasi**, bukan selalu bulan. t=k/m tahun, i=r/m per periode. Dari rekursi saldo berikutnya = saldo×(1+i), FV=P(1+r/m)^k. Gain=FV−P. Yield tahunan efektif=(1+r/m)^m−1; ini berbeda dari nominal r dan APR menyeluruh. Dengan m=12, k=12 berarti satu tahun; dengan m=4, k=4 berarti satu tahun. Periode utuh menghindari pangkat pecahan yang tidak disepakati.

Contoh independen:

1. P=Rp1.000.000, r=12%, m=12, k=2: i=1%; FV=1.000.000×101²/100²=Rp1.020.100; gain Rp20.100. Yield tahunan efektif=1,01^12−1=12,6825030131969720661201%, tampil 12,6825%.
2. P=Rp100, r=10%, m=1, k=2: FV=100×11²/10²=Rp121; gain Rp21; yield 10%. Untuk m=4, r=8%, k=4, P=Rp1.000.000: FV=1.000.000×1,02^4=Rp1.082.432,16; gain tampil Rp82.432, saldo Rp1.082.432.
3. k=0 atau r=0 mempertahankan P; P=0 memberi FV=0. P=Rp1, r=0,0001%, m=12, k=1 memberi gain positif jauh di bawah Rp1 dan harus dijelaskan. k=1.201, m=3, atau hasil melampaui batas ditolak.

## Cicilan Anuitas

Intent: angsuran akhir bulan dengan bunga tetap atas saldo pokok yang tersisa. r adalah nominal tahunan; i=r/12 per bulan; n bulan positif. Nilai kini P=A×sum[j=1..n](1+i)^(-j). Deret geometri memberi A=P×i×(1+i)^n/((1+i)^n−1), ekuivalen P×i/[1−(1+i)^(-n)]. Jika i=0, A=P/n.

Konvensi operasional aplikasi, sengaja dinyatakan sebagai simulasi rupiah:

1. Angsuran acuan C=ceil(A) ke rupiah. Pembulatan ke atas menghindari cicilan acuan nol ketika pokok positif.
2. Awal bulan j memiliki saldo B. Bunga bulan J=halfUp(B×r/12); pokok dibayar = pembayaran−J. Bulan sebelum n membayar min(C, B+J). Pada bulan n bayar B+J agar saldo akhir tepat nol; pembayaran tidak boleh melebihi sisa kewajiban.
3. Jadwal menyimpan n baris. Jika pokok lunas lebih awal karena pembulatan, baris berikutnya semua nol. Pembayaran penutup dan bulan pembayaran terakhir diambil dari baris terakhir dengan pembayaran positif; P=0 berarti tidak ada kewajiban dan bulan pembayaran terakhir 0. Total bunga/pembayaran adalah penjumlahan baris, **bukan C×n**. Jika bunga teoritis positif tetapi seluruh bunga jadwal membulat menjadi nol, hasil rupiah tetap Rp0 dan catatan menjelaskan efek pembulatan.
4. Semua baris memenuhi pembayaran=pokok+bunga, saldo baru=saldo lama−pokok≥0; sum pokok=P; saldo akhir=0; total pembayaran=P+total bunga. Pembayaran penutup bisa berbeda dari C karena pembulatan bunga bulanan.

Contoh independen:

1. P=Rp1.000,r=12%,n=3: i=1%; A=1.000×0,01×1,01³/(1,01³−1)=Rp340,022111… sehingga C=Rp341. Bulan 1: bunga10, pokok331, bayar341, sisa669. Bulan 2: bunga halfUp(6,69)=7, pokok334, bayar341, sisa335. Bulan 3: bunga halfUp(3,35)=3, pokok335, bayar338, sisa0. Total bunga20; pembayaran1.020; **bukan 341×3=1.023**.
2. P=Rp1.000,r=0,n=3: C=334; pembayaran334,334,332; bunga0; total1.000; penutup332. P=Rp1,r=100%,n=600: C=1, bunga pertama halfUp(1/12)=0, lunas pada bulan1; seluruh baris berikutnya0. P=0 memberi seluruh hasil dan jadwal0. n=0 invalid.

Kasus pembulatan ekstrem yang juga diuji: P=Rp9,r=100%,n=600. Acuan Rp1; bunga bulanan halfUp(9/12)=Rp1, sehingga pokok tidak turun pada 599 bulan pertama. Bulan600 membayar Rp10, termasuk pokok9 dan bunga1. Total bunga600 dan pembayaran609. Karena pembayaran penutup bisa lebih besar dari acuan pada konvensi rupiah ini, hasil memberi peringatan eksplisit. Ini alasan tambahan untuk memakai jadwal, bukan acuan×tenor atau menganggap hasil sama dengan tagihan suatu bank.

## Cicilan Flat

Intent: bunga atas **pokok awal**, tanpa penurunan dasar bunga. Dengan r flat tahunan, n bulan: pokok ideal/bulan=P/n; bunga ideal/bulan=Pr/12; total bunga nominal=Prn/12. Tarif flat tidak setara dengan tarif efektif saldo menurun dengan angka persen yang sama. Tidak ada konversi ekuivalen atau APR/IRR pada alat ini.

Kebijakan jadwal rupiah: alokasikan pokok kumulatif bulan j sebagai floor(P×j/n), bunga kumulatif sebagai halfUp(P×r×j/12). Komponen setiap bulan adalah selisih kumulatif kini dan sebelumnya. Dengan demikian semua komponen nonnegatif, saldo pokok tepat nol pada n, total bunga tepat halfUp(Prn/12), dan total pembayaran=P+total bunga. Cicilan dapat berbeda beberapa rupiah antarbulan akibat alokasi pecahan; jangan mengalikan cicilan pertama dengan n. Pembayaran bulan n adalah penutup. Konvensi ini membagi sisa pembulatan di sepanjang jadwal, bukan menumpuk semua selisih bunga pada bulan terakhir atau mengklaim aturan bank.

Contoh independen:

1. P=Rp1.000,r=12%,n=3: pokok kumulatif333,666,1.000 dan bunga kumulatif10,20,30. Baris: bayar343,pokok333,bunga10,sisa667; bayar343,pokok333,bunga10,sisa334; bayar344,pokok334,bunga10,sisa0. Total bunga30 dan pembayaran1.030; penutup344.
2. P=Rp100,r=6%,n=3: bunga ideal/bulan0,5; kumulatif1,1,2 memberi bunga1,0,1. Pokok33,33,34. Pembayaran34,33,35; total bunga2=halfUp(1,5), pembayaran102. Membulatkan tiap bunga ideal ke1 dahulu lalu dikalikan3 akan salah.
3. r=0 memberi pembagian pokok saja (1.000/3 →333,333,334). P=0 memberi semua0. P=1,r=0,0001%,n=1 mempunyai bunga nominal positif tetapi bunga jadwal0; ada catatan subrupiah. n=0 invalid.

## Rasio Cicilan

Intent: porsi pendapatan bersih bulanan untuk cicilan wajib, bukan skor persetujuan pinjaman. D adalah total kewajiban cicilan pada bulan yang sama; Y adalah pendapatan setelah pajak/iuran namun **sebelum** potongan cicilan. Cicilan yang sudah dipotong payroll perlu ditambahkan kembali pada basis Y dan dimasukkan pada D agar tidak dihitung dua kali. Rasio=100D/Y%; sisa sebelum biaya hidup=Y−D rupiah. Y>0,D≥0. Status D>Y memakai input eksak, bukan rasio tampilan.

Contoh independen:

1. D=Rp1.500.000,Y=Rp5.000.000: rasio30,00%, sisa Rp3.500.000 sebelum biaya hidup. D=0 memberi0,00% dan sisa Y.
2. D=Rp4,Y=Rp3: rasio133,33%, sisa−Rp1, status cicilan melebihi pendapatan. D=Y memberi100,00%, sisa0. D=Rp1,Y=Rp32 memberi3,125% →3,13%. Y=0 ditolak.
3. D=Rp1,Y=Rp9.999.999.999.999 memberi rasio positif <0,01%, bukan nol. Tidak ada ambang aman, rekomendasi pinjaman, atau klaim kelayakan berdasarkan rasio ini.

## Verifikasi implementasi yang diwajibkan

Fixture di atas menjadi tes terpisah dari engine. Tambahkan rekonsiliasi setiap baris dan total jadwal pada rentang pokok, tingkat minimum/maksimum, tenor1/600, bunga nol, dan pokok kecil yang tidak habis dibagi tenor. Uji saldo tidak negatif, bunga anuitas memakai saldo berjalan, nominal/periodik dan frekuensi majemuk, batas pangkat/hasil, serta error pembagi nol. Playwright mencakup lima formulir, perubahan dropdown yang membersihkan hasil, jadwal dan penutup, hub/navigasi/search, SEO/404/noindex, serta screenshot desktop/mobile.
