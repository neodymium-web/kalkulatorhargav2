# Verifikasi Batch 10: pinjaman bertanggal, KPR, pelunasan, refinancing, kurs

Diperiksa 7 November 2026, sebelum implementasi. Versi rumus 1.0.0. Semua angka kontrak, bunga, penalti dan kurs dimasukkan pengguna. Tidak ada penawaran atau tarif langsung. Main acuan cfe23a1b. Konvensi rupiah Batch 7 diaudit dan dipakai kembali tanpa mengubah engine lamanya.

## Sumber yang berhasil dibuka

- [Microsoft, XIRR](https://support.microsoft.com/en-us/excel/functions/xirr-function): nilai kini arus bertanggal memakai selisih hari/365. Solver aplikasi di bawah berbeda dari algoritme Excel; hanya menerima satu penerimaan awal dan pembayaran positif kemudian, sehingga tidak menghadapi banyak akar.
- [OpenStax, Contemporary Mathematics 6.8, The Basics of Loans](https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans): ordinary annuity, saldo menurun, tabel amortisasi. Konvensi pembulatan rupiah adalah kebijakan model, bukan ketentuan bank.
- [CFPB, loan options](https://www.consumerfinance.gov/owning-a-home/explore/understand-the-different-kinds-of-loans-available/): perbedaan fixed/adjustable serta perubahan angsuran setelah fase awal. Aplikasi hanya memakai dua fase, bukan proyeksi pasar.
- [CFPB, prepayment penalty](https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/): penalti bergantung kontrak; nominal manual dipisah dari pokok.
- [Federal Reserve, Consumer's Guide to Mortgage Refinancings](https://www.federalreserve.gov/pubs/refinancings/default.htm): biaya pindah, tenor lebih panjang, angsuran dan biaya seumur pinjaman perlu dibandingkan. Perluasan kumulatif lintas tenor di bawah diturunkan dari ledger pembayaran.
- [ECB, exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html): arah kuotasi harus eksplisit; referensi bukan jaminan transaksi. Tidak menyalin angka kurs sumber.
- [SIX, currency standards](https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html): presisi mata uang tidak universal. Model sengaja dibatasi IDR utuh dan USD dua desimal; bukan konverter semua mata uang.
- [decimal.js API](https://mikemcl.github.io/decimal.js/): pustaka desimal arbitrary precision, konfigurasi precision/rounding lokal. Hanya solver bertanggal memakai Decimal clone precision 80 significant digits, ROUND_HALF_UP; uang dan jadwal lain memakai BigInt rasional. Tidak ada Number untuk uang.

Halaman CFPB refinancing en-132 dan penjelasan kurs Bank of England tidak berhasil diakses; tidak dipakai sebagai rujukan terverifikasi. Sumber edukasi luar negeri tidak menetapkan APR/EIR wajib, aturan pajak, atau ketentuan hukum Indonesia.

## Batas dan konvensi bersama

Rupiah utuh nonnegatif maksimal 13 digit; pinjaman berjalan dan dana cair pembagi harus positif kecuali pokok KPR nol diperbolehkan. Bunga nominal tahunan 0–100% dengan empat desimal persen, tenor 1–600 bulan. Pembayaran akhir bulan. A=P*i/[1−(1+i)^−n], i=nominal/12; jika nol, A=P/n. Acuan C=ceil(A). Bunga tiap bulan J=halfUp(saldo*i); bayar min(C,saldo+J), kecuali bulan terakhir membayar saldo+J. Pokok=bayar−J, saldo baru=saldo−pokok. Jadwal tetap sepanjang tenor, baris sesudah lunas nol. Nilai setengah rupiah dibulatkan naik. Semua total dijumlah dari ledger, bukan C*n. Pada saldo kecil, penutup bisa lebih besar daripada C karena pembulatan bunga: diungkap di hasil. Invarian tiap baris: bayar=pokok+bunga, saldo tidak negatif; total pokok=P; total bayar=P+total bunga; saldo akhir=0.

## 1. Bunga Efektif Pinjaman bertanggal

Perspektif peminjam: +P diterima pada tanggal cair, −M_j dibayar kemudian. P>0, M_j>0, 1–100 baris, ISO YYYY-MM-DD valid tahun 1900–2199, setiap pembayaran setelah tanggal cair dan maksimal 36.525 hari kemudian. Tanggal diurutkan hanya untuk tampilan; tanggal sama boleh, urutan input tidak mengubah model. UTC date-only membuang DST/timezone. Biaya hari pencairan sudah dikurangkan pada dana bersih; biaya kemudian dimasukkan sekali sebagai pembayaran bertanggal.

P=sum M_j/(1+r)^(d_j/365), r>−1, ACT/365 fixed bahkan tahun kabisat. Substitusi diskonto harian x=(1+r)^(-1/365) membuat persamaan polinomial P=sum M_j*x^d_j. Semua M dan d positif, jadi fungsi naik ketat, akar tunggal; jumlah pembayaran sama/lebih kecil/lebih besar dari P memberi r nol/negatif/positif. Bisection deterministik x di [0,95;1,05], maksimal 300 iterasi. Setelah konvergen, r=x^(−365)−1; hasil didukung hanya −99,99% sampai 10.000% tahunan. Akar di luar bracket/domain ditolak dengan pesan batas, bukan 0 atau tebakan. Tidak ada finite root di domain dibedakan dari input invalid.

Decimal80 mengevaluasi pangkat hari integer, tidak mengklaim pecahan eksak untuk yield. Syarat sertifikat: lebar bracket <=1e−60 dan residu absolut |sum PV−P|<=Rp0,00000001. Residu diverifikasi ulang dari faktor tahunan internal, bukan rate tampilan; r/faktor penuh disimpan untuk tes. Rate tampilan empat desimal persen, half-away-from-zero; positif/negatif yang membulat nol tetap diberi arah. Rate tampilan bukan sertifikat residu. Jika batas iterasi/toleransi gagal, hasil ditahan dan minta skenario lain. Dengan uang<=1e13, 100 baris, horizon<=36525 dan akar di domain, 80 digit menyisakan banyak guard digits pada PV sekitar P. Tidak menyebut hasil sebagai APR/EIR regulator atau nominal flat/anuitas.

Vektor independen (Python decimal precision70, bisection pada r dan pangkat pecahan d/365, bukan substitusi solver aplikasi):

1. Cair 2023-01-01 Rp1.000; bayar 2024-01-01 (365 hari) Rp1.100: r=10%, PV=1000 tepat. Bayar1000 memberi0%; bayar900 memberi−10%.
2. Cair 2024-01-01 Rp1.000; Rp550 pada 2024-07-01 (182 hari) dan Rp600 pada 2025-01-01 (366 hari): r=0,2031286506098715226195353465772527552869154287459616803852777464730614; tampil20,3129%; residu referensi1e−66 rupiah.
3. Cair 2024-02-28, bayar 2024-03-01: dua hari. 2023-02-29 invalid; hari cair/sesudah horizon invalid. P1000→1100 pada366hari memberi (1,1)^(365/366)−1, bukan10%. Pembayaran terlalu besar di hari1 di luar batas ditahan.

## 2. KPR dua fase

P=harga−DP; DP rupiah, 0<=DP<=harga. Biaya awal dibayar tunai, tidak dibiayai. Fase fixed k bulan (0<=k<=n) menggunakan acuan tenor penuh n. Di awal bulan k+1, saldo direamortisasi atas n−k bulan pada tingkat fase kedua input pengguna. Fase0 langsung rate kedua; fase penuh tidak memakai rate kedua. Saldo saat switch berasal ledger, bukan saldo teoretis yang belum dibulatkan. Total dana awal=DP+fee; pengeluaran total=DP+fee+sum angsuran=harga+fee+bunga. Acuan fase yang tidak ada ditampilkan Rp0 dengan catatan.

1. Harga1200, DP200, P1000, n3, fixed12% selama1bulan, fase2 24%, fee50: bulan1 bayar341,bunga10,pokok331,sisa669; acuan fase2 ceil(669*0,02/[1−1,02^-2])=345. Bulan2 bayar345,bunga13,pokok332,sisa337; bulan3 bayar344,bunga7,pokok337,sisa0. Bunga30,pembayaran1030,danaawal250,total1280. Ledger independen Python Decimal.
2. Harga1200, DP200, kedua rate0,n3,k0: bayar334,334,332; bunga0,total outlay1250 jika fee50. DP=harga memberi seluruh cicilan0, outlay=harga+fee. k=n setara annuity Batch7; k>n invalid.

## 3. Pelunasan Dipercepat

Satu tambahan setelah cicilan biasa pada bulan event; pertahankan acuan C dan pendekkan tenor aktual. Extra aktual=min(request,saldo setelah cicilan). Penalti nominal satu kali dibayar di event, tidak mengurangi saldo dan tidak masuk bunga. Jika extra>0, event harus sebelum saldo habis pada jadwal dasar; penalti>0 dengan extra0 ditolak. Extra0/penalti0 menghasilkan baseline sama. Jadwal membagi pembayaran biasa, tambahan pokok dan penalti agar audit tidak menyebut penalti sebagai pokok. Total outflow=sum(bayar biasa+extra+penalti), total pokok termasuk extra tetap P. Hemat bunga=I_baseline−I_akselerasi; hemat neto=hemat bunga−penalti; bulan hemat=bulan lunas baseline−bulan lunas akselerasi. Tambahan tidak dikurangkan lagi dari hemat karena sudah menggantikan pokok jadwal.

1. P1000,12%,n3,C341,extra400 sesudah bulan1,penalti2: bulan1 bayar biasa341,extra400,bunga10,saldo269; bulan2 bayar272,bunga3,saldo0; bulan3nol. I0=20,I1=13,hemat7,net5,bulanhemat1; total outflow1015=1000+13+2. Penalti10 memberi net−3.
2. P1000,0%,n3,C334,extra9999bulan1: extra aktual666, lunasbulan1, I0=I1=0,bulanhemat2. Penalti5 memberi net−5,total1005. Extra di bulan3 (sesudah saldo biasa lunas) ditolak.

## 4. Refinancing

P sama, n_lama dan n_baru eksplisit, kedua jadwal independen dan akhir bulan. Biaya pindah B dibayar di bulan0, tidak dibiayai, termasuk semua penalti/biaya yang ingin dibandingkan. Horizon=max(n_lama,n_baru), pembayaran setelah lunas0. Delta kumulatif D0=−B; Dm=−B+sum_{j<=m}(bayar_lama_j−bayar_baru_j). Ini kas tidak didiskonto, tidak membandingkan ekuitas jika berhenti di tengah. Keuntungan lifetime=D_horizon=(P+I_lama)−(P+I_baru+B). Tampilkan first crossing (termasuk bulan0) dan permanent crossing terkecil yang D_j>=0 untuk semua j>=m sampai horizon. Jika awal>=0 tetapi kemudian negatif, itu crossing sementara; bukan bukti hemat lifetime. D_akhir<0 berarti tidak ada impas permanen. Tenor/biaya dimasukkan sesuai skenario, bukan rekomendasi.

1. P1000,old12%n3 ->341,341,338, total1020; new0%n3 ->334,334,332,total1000; B14: D=[−14,−7,0,6], first/permanent bulan2, net6. B21: D=[−21,−14,−7,−1], tidak impas, net−1. Sama rate/tenor dengan B0 memberi D=0 semua, impas bulan0.
2. P1000,old0%n3 ->334,334,332 lalu0; new12%n6 ->173,173,173,173,173,170 total1035; B10: D=[−10,151,312,471,298,125,−45]. Crossing bulan1 sementara, tidak ada impas permanen, lifetime−45 meski acuan baru lebih kecil. B0 punya firstbulan0 tetapi tetap tidak permanen.

## 5. Kurs manual USD/IDR

Scope USD dua desimal dan IDR utuh saja. Kuotasi K selalu 1 USD=X IDR, K>0 maksimal 13 digit bulat dan6desimal. Nominal masuk <=13digit bulat,2desimal untuk USD; IDR wajibutuh. Fee nominal dibayar dalam mata uang keluaran, ketelitian sama dengan target. Gross eksak USD→IDR=amount*K; IDR→USD=amount/K. Validasi fee<=gross eksak sebelum pembulatan; net0 diperbolehkan dan ditandai. Gross dibulat ke unit target, fee sudah integer unit target, net=gross_bulat−fee agar ledger rekonsiliasi. Net positif yang membulat0 ditandai subunit, tidak disebut gratis. Spread tidak dimodelkan. Tidak ada feed, tarif awal, atau janji settlement.

1. USD100,25 *K15000,5 =IDR1503800,125 ->gross1503800; fee1000;net1502800.
2. IDR100000/K15000 =USD6,6666… ->gross6,67;feeUSD0,10;net6,57. IDR1/K200=USD0,005 ->gross0,01. USD0,01*K50=IDR0,5 ->gross1. Fee melewati gross eksak walau gross_bulat cukup tetap ditolak; rate0 invalid. Tidak memakai Number/float untuk kurs, gross atau fee.

## Gate implementasi

Fixture di atas terpisah dari engine; uji residu dari annualFactor dengan pangkat desimal independen, tanggal kabisat/DST/order/duplikat, akar negatif/nol/positif dan no-result. Uji semua invarian jadwal, switch0/n, bunga0/100%, tenor600, pembulatan ekstrem/penutup, extra terpotong, penalti negatif/tinggi, refinancing unequaltenor dan crossing sementara, FX dua arah/tie/fee/batas. Browser memeriksa tanggal/baris/fokus, tabel keyboard, hasil kosong/invalid/berubah, seluruh viewport, SSR/SEO/noindex/404 dan screenshot desktop/mobile. Publikasi hanya lima inventoryID terpilih; target51/100 dengan20Keuangan dan55URL sitemap. Tidak mengubah production atau indexing staging.
