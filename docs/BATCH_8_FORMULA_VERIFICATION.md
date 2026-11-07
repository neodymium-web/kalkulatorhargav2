# Verifikasi rumus Batch 8: tabungan, cadangan, deposito, ROI, dan CAGR

Diperiksa 7 November 2026, sebelum implementasi engine. Versi rumus 1.0.0. Seluruh tingkat bunga, biaya, potongan, dan durasi adalah asumsi pengguna. Tidak ada preset tarif bank, pajak deposito, durasi cadangan yang disarankan, atau jaminan imbal hasil.

## Sumber yang berhasil diperiksa

- [OpenStax, Contemporary Mathematics 6.6: Methods of Savings](https://openstax.org/books/contemporary-mathematics/pages/6-6-methods-of-savings): nilai masa depan ordinary annuity, setoran pada akhir periode, dan setoran untuk target. Saldo awal ditambahkan sebagai lump sum yang tumbuh terpisah.
- [OpenStax 6.3: Simple Interest](https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest): bunga sederhana dengan satuan tingkat tahunan dan waktu dalam tahun.
- [OpenStax, Introductory Business Statistics 2e 2.5: Geometric Mean](https://openstax.org/books/introductory-business-statistics-2e/pages/2-5-geometric-mean): akar pangkat jumlah periode mempertahankan hasil perkalian faktor pertumbuhan. CAGR di bawah diturunkan dari persamaan pertumbuhan geometris ini.
- [CFPB: An essential guide to building an emergency fund](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/): cadangan untuk kejadian tak terduga harus sesuai keadaan pengguna dan mudah diakses. Perkalian pengeluaran × bulan di aplikasi adalah model anggaran, bukan rekomendasi universal jumlah bulan.
- [OJK, Buku 2 Perbankan, halaman cetak 109–110](https://sikapiuangmu.ojk.go.id/FrontEnd/LiterasiPerguruanTinggi/assets/pdf/Buku%202%20-%20Perbankan.pdf#page=109): deposito mempunyai jatuh tempo dan persyaratan produk; pembayaran bunga dan potongan mengikuti ketentuan terkait. Buku ini tidak digunakan sebagai snapshot tarif atau hukum pajak terkini.
- [BCA: Cara Hitung Bunga Deposito, Ini Rumus yang Perlu Diketahui](https://www.bca.co.id/id/informasi/edukatips/2024/07/02/06/10/cara-hitung-bunga-deposito-ini-rumus-yang-perlu-diketahui): contoh bunga prorata berbasis hari menunjukkan pentingnya basis waktu dan potongan. Aplikasi sengaja memakai bulan/12; hasil aktual berbasis hari dan pembulatan bank dapat berbeda. Angka tarif contoh sumber tidak dijadikan preset.
- [FINRA: Key Concepts, Return and Rate of Return](https://syndication.finra.org/content/key-concepts-return-and-rate-return): gain/loss, dampak biaya, pembagi modal investasi, dan perbedaan holding-period return dari annualized return.

Rumus matematika tidak menetapkan kelayakan investasi atau perlakuan hukum/pajak. Bunga deposito di model ini tidak dikapitalisasi; ROI dan CAGR tidak memasukkan dividen atau arus kas antara. Simulasi edukasi, bukan penawaran atau rekomendasi keuangan pribadi.

## Domain dan aritmetika

Nominal input: rupiah utuh nonnegatif, maksimal 13 digit. Modal pembagi ROI/CAGR wajib positif. Bunga nominal tahunan dan potongan pajak manual: 0–100%, maksimal empat desimal persen, koma atau titik. Pecahan 100% disimpan sebagai integer S=1.000.000. Durasi target tabungan 1–600 bulan, cadangan dan deposito 1–1.200 bulan, CAGR 1–100 tahun selesai. Bilangan pecahan bulan/tahun, eksponen, pemisah ribuan, negatif, kosong pada field wajib, nonfinite, dan angka di atas batas ditolak. Tax/fee deposito bersifat opsional dan kolom kosong eksplisit berarti nol **dalam model saja**.

Semua uang, faktor, perbandingan dan pangkat dihitung dengan BigInt/pecahan rasional. Number hanya dipakai untuk jumlah periode yang telah dibatasi. Tidak ada floating-point pada uang atau akar CAGR. Half-up untuk nilai bertanda berarti pembulatan ke increment terdekat dengan nilai tengah menjauh dari nol. Biaya/deposito dan ROI memakai rupiah utuh; proyeksi tabungan dua desimal rupiah; cakupan dana dua desimal bulan; ROI dua desimal persen; CAGR empat desimal persen. Nilai positif/negatif yang membulat menjadi nol diberi keterangan arah dan batas increment tampilan.

## Target Tabungan

Intent: setoran rupiah utuh **minimum setiap akhir bulan**, bunga hipotetis tetap. P=saldo sekarang, T=target, n=bulan, i=r/12 (r pecahan nominal tahunan), Q=(1+i)^n. Setoran terakhir tidak mendapat bunga periode tambahan. FV(A)=PQ+A×(Q−1)/i. Derivasi faktor adalah penjumlahan 1+(1+i)+…+(1+i)^(n−1). Untuk i=0: FV=P+nA.

Jika PQ≥T maka A=0. Jika tidak, A=ceil((T−PQ)/((Q−1)/i)); cabang i=0 memakai ceil((T−P)/n). Faktor dihitung rasional eksak, bukan dari nilai desimal yang sudah dibulatkan. Karena faktor positif, A mencapai target dan A−1 tidak mencapai target ketika A>0. Dengan d=12S, b=integer tingkat tahunan, U=(d+b)^n,V=d^n: A=ceil((TV−PU)b/[d(U−V)]) untuk gap positif. FV dihitung ulang dari A tersebut.

Saldo akhir dan pertumbuhan dari saldo awal dibulatkan half-up ke 0,01 rupiah hanya di akhir. Total setoran=nA eksak; pertumbuhan seluruh dana=FV−P−nA; surplus=FV−T. Pengurangan komponen integer setelah pembulatan FV sama dengan pembulatan pecahan selisih secara langsung, sehingga rincian tetap cocok. Saldo eksak maksimum Rp999.999.999.999.999.999; proyeksi melampaui batas ditolak pada field durasi. Bunga tidak dibulatkan bulanan; hasil nyata tidak dijamin.

Contoh independen:

1. P=0,T=1.200,r=0,n=12: A=100; FV=1.200; A=99 hanya mencapai1.188. P=T=1.000,r=0,n=12 memberi A=0, FV1.000.
2. P=1.000,T=5.000,r=12%,n=2: Q=1,0201, faktor setoran2,01; saldo awal tumbuh menjadi1.020,10. A=ceil(3.979,90/2,01)=1.981; FV=1.020,10+1.981×2,01=5.001,91; surplus1,91, total setoran3.962, seluruh pertumbuhan39,91. A=1.980 hanya mencapai4.999,90.
3. P=1,T=2,r=0,0001%,n=1: A=1; FV=2+1/12.000.000 rupiah. Surplus dan pertumbuhan positif di bawah satu sen ditandai, bukan diklaim tepat nol. Target0 memberi setoran0; bulan0 ditolak. Saldo awal dapat mencapai target melalui pertumbuhan tanpa setoran, sehingga status menyebut pencapaian pada akhir proyeksi, bukan sudah tercapai hari ini.

## Dana Darurat

Intent: anggaran cadangan likuid. E=pengeluaran wajib bulanan, m=bulan cadangan pilihan pengguna, C=dana likuid yang tersedia. Target=Em, kekurangan=max(0,Em−C), surplus=max(0,C−Em). Cakupan bulan=C/E bila E>0. Jika E=0, cakupan **tidak terdefinisi**, termasuk C=0; tidak menampilkan tak terhingga. Target, gap dan surplus rupiah tetap eksak. Tidak memasukkan inflasi, perubahan kebutuhan, imbal hasil, dana terkunci, atau bulan cadangan rekomendasi otomatis.

Contoh independen:

1. E=2.000.000,m=6,C=3.000.000: target12.000.000,gap9.000.000,surplus0,cakupan1,50 bulan.
2. E=100,m=3,C=350: target300,gap0,surplus50,cakupan3,50 bulan. E=0,m=3,C=50: target0,gap0,surplus50,cakupan tidak terdefinisi. C=0 dengan E>0 memberi cakupan0. Bulan0 tidak valid.

## Deposito

Intent: proyeksi deposito bunga sederhana tanpa kapitalisasi. P=pokok, r=nominal tahunan, n=bulan, t=potongan pajak manual atas bunga bruto, F=biaya tetap. Bruto eksak G*=Prn/12. **Konvensi operasional aplikasi**: G=halfUp(G*) ke rupiah, lalu W=halfUp(Gt) ke rupiah. Net=G−W−F; jatuh tempo=P+Net. Semua komponen tampilan adalah angka yang sama dengan ledger ini. Pajak dihitung atas bruto yang sudah dibulatkan; konvensi dapat berbeda dari bank. Tidak menghitung net dari pecahan bruto lain yang akan merusak penjumlahan tampilan.

Net boleh negatif. Biaya yang membuat jatuh tempo negatif ditolak pada field biaya; tidak dijepit menjadi nol. Potongan manual0 bukan pernyataan bebas pajak. Ketentuan pajak, pengecualian, basis hari, bunga dibayar berkala, dan biaya kontrak harus diverifikasi pengguna dari produk/regulasi aktual.

Contoh independen:

1. P=1.200.000,r=6%,n=6,t=20%,F=0: bruto36.000,potongan7.200,net28.800,jatuh tempo1.228.800. **20% adalah input contoh pengguna, bukan tarif hukum bawaan.**
2. P=100,r=6%,n=1,t=50%,F=0: G*=0,50 →G1; pajak=halfUp(1×0,5)=1; net0,jatuh tempo100. Ini menguji dua pembulatan ledger secara terpisah.
3. P=100,r=0,n=1,t=0,F=5: net−5,jatuh tempo95. F=101 ditolak. P=0,F=0 memberi seluruh uang0; pajak100% dapat menghabiskan seluruh bruto; n=0 invalid.

## Imbal Hasil Investasi

Intent: ROI bersih **selama periode kepemilikan**, tidak disetahunkan. B=harga perolehan/modal awal **sebelum biaya beli**, E=nilai akhir/hasil jual bruto **sebelum biaya jual**, C=jumlah biaya beli/jual/lain yang dicatat terpisah, di luar pajak. Gain=E−B−C; ROI=100×Gain/B%. Tidak ada distribusi/dividen, tambahan modal, penarikan, pajak, IRR atau annualization pada model ini. Jika nilai awal/akhir sudah mengurangi biaya, sesuaikan data agar biaya tidak dikurangi dua kali. Pembagi tetap B, bukan B+C; konvensi modal ini dinyatakan eksplisit.

Contoh independen:

1. B=100,E=90,C=5: gain−15, ROI−15,00%. E=0,C=5 memberi gain−105 dan ROI−105,00% karena biaya tambahan bisa melampaui modal yang hilang.
2. B=100,E=120,C=5: gain15,ROI15,00%. B=32,E=33,C=0 memberi3,125% →3,13%; E=31 memberi−3,125% →−3,13%. E=B,C=0 memberi0%; B=0 ditolak. Gain−1 dengan B=9.999.999.999.999 harus tetap ditandai sebagai rasio negatif kecil.

## CAGR

Intent: pertumbuhan tahunan geometris yang diratakan, tanpa arus kas antara. B>0,E≥0,y=jumlah tahun selesai positif. Dari E=B(1+g)^y, g=(E/B)^(1/y)−1. Hasil disajikan dalam persen empat desimal. E=0 memberi tepat−100%; E>0 berarti g>−100%, termasuk ketika pembulatan mendekati batas itu. Nilai bukan kinerja aktual tiap tahun. Tambahan modal, penarikan atau distribusi memerlukan metode arus kas bertanggal seperti XIRR; alat yang belum terbit tidak diberi tautan placeholder.

Algoritme eksak: cari integer L=floor(S×(1+g)) dengan bisection dan perbandingan L^y×B terhadap E×S^y. Batas atas untuk pertumbuhan adalah E×S/B+1 saat E≥B, atau S saat E<B; paling besar sekitar10^19 untuk input13digit. Setelah menemukan L, bandingkan midpoint **(2L+1)^y×B** dengan **E×(2S)^y**. Untuk gain, midpoint sama dibulatkan ke L+1; untuk loss, midpoint sama dibulatkan ke L agar rate negatif menjauh dari nol. Rate integer hasil=pertumbuhan bulat−S. Ini menghindari salah pembulatan negatif yang muncul bila growth factor selalu dibulatkan half-up lalu dikurangi1. Maksimal100tahun dan sekitar64langkah bisection; semua pangkat integer BigInt. Tidak ada Math.pow, floating root, atau konversi uang ke Number.

Jika rate membulat menjadi0 tetapi E≠B, tampilkan batas bertanda positif/negatif. Jika rate membulat−100% padahal E>0, tampilkan >−100,0000%, bukan kehilangan total. Pertumbuhan ekstrem dari nilai awal sangat kecil tetap mungkin secara matematika; batas input bukan klaim kewajaran imbal hasil.

Contoh independen:

1. B=100,E=121,y=2: akar1,21=1,1 →10,0000%. E=81 memberi−10,0000%; E=0 memberi−100,0000%. B=1.000,E=1.331,y=3 juga10,0000%.
2. B=100,E=200,y=3: akar kubik2=1,259921049894873… →25,9921%. E=50,y=3 →−20,6299%. B=0 atau y=0 ditolak.
3. Tie eksak y=2: B=4.000.000.000.000; E=(2.000.001)^2=4.000.004.000.001 →rate0,00005% →0,0001%. E=(1.999.999)^2=3.999.996.000.001 →rate−0,00005% →−0,0001%. Mengubah E satu rupiah ke sisi nol pada kedua kasus menghasilkan rate yang membulat0, dengan tanda arah tetap terlihat. B=9.999.999.999.999,E=1,y=1 harus ditandai >−100,0000%.

## Audit wajib

Uji minimalitas setoran dengan proyeksi referensi independen untuk A dan A−1. Rekonsiliasi ledger deposito dan nilai jatuh tempo; cek net negatif dan fee tidak layak. Uji ROI negatif/tie serta akar CAGR di kedua sisi midpoint, nol, total loss, dan batas input. Pertahankan seluruh engine Batch 1–7. UI memakai form/error/hasil bersama, metodologi dan sumber server-rendered, serta pengungkapan batas hasil. Verifikasi katalog tetap100entri/41published/10Keuangan, sitemap45URL (41alat+3hub+beranda), 404 alat belum terbit, noindex, dan screenshot desktop/mobile normal serta batas.
