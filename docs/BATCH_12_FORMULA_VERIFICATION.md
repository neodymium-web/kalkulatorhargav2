# Verifikasi Batch 12: CTR dan analitik kreator

Diperiksa 7 November 2026 sebelum implementasi. Versi1.0.0, main cd8ed806. Lima ID yang ada, termasuk calc-estimasi-tiktok-kreator dengan canonical /kalkulator/tiktok. Seller calc-tiktok /kalkulator/tiktok-shop tetap ide. Tidak ada akses akun, username lookup, tarif resmi atau klaim kelayakan monetisasi.

## Sumber primer yang berhasil diperiksa

- [Google Ads CTR](https://support.google.com/google-ads/answer/2615875?hl=en): clicks/impressions, dikonversi ke persen. Klik dan impressions adalah event, bukan reach/orang unik.
- [YouTube revenue/RPM](https://support.google.com/youtube/answer/9314357?hl=en): RPM kreator berbeda dari CPM pengiklan dan mencakup basis tayangan yang berbeda untuk Videos/Shorts. Model aplikasi sengaja hanya **video non-Shorts**, total views dari cakupan RPM yang sama, termasuk tayangan yang tidak menampilkan iklan. Jangan mengalikan RPM all-views dengan hanya monetized playbacks. Tidak mengimpor share revenue atau aturan payout.
- [YouTube Analytics metric definitions](https://developers.google.com/youtube/analytics/metrics): averageViewDuration dalam detik dan estimatedMinutesWatched dalam menit; laporan dapat berbeda cakupan. Model watch time adalah perkalian agregat pada populasi yang sama, bukan audit jam publik yang memenuhi YPP. Konversi detik ke menit memerlukan pembagian60.
- [TikTok Newsroom, pengumuman18Maret2024](https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program?lang=en): qualified views, RPM, estimasi rewards dan faktor program dipisahkan pada dashboard. Dipakai hanya untuk membedakan tayangan publik dari qualified views dan menunjukkan bahwa formula resmi lebih kompleks. **Bukan verifikasi aturan2026, wilayah, eligibility, RPM atau tarif**. TikTok Help /how-rewards-work dibuka tetapi tidak mempunyai teks terbaca; tidak mengklaim verifikasi kebijakan sekarang.
- [Sprout Social API](https://api.sproutsocial.com/docs): basis engagement bervariasi. Empat aksi dan basis followers/views di aplikasi adalah model manual eksplisit; merujuk juga verifikasi Batch11.
- [OpenStax contribution margin](https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin): pendapatan dikurangi biaya terkait dan rasio terhadap pendapatan. Rumus penawaran di bawah adalah **model bisnis internal**, diturunkan aljabar dari margin pada harga jual; bukan tarif endorsement TikTok atau standar pasar. Hak pakai ditambahkan terpisah tanpa margin.

Sumber Queensland pricing dan salah satu OpenStax chapter path tidak berhasil diakses; tidak digunakan. Semua angka contoh di bawah adalah input hipotetis untuk verifikasi, bukan benchmark atau tarif. Seluruh sumber di UI diberi tanggal verifikasi; tidak menampilkan ambang kelayakan platform.

## Domain dan aritmetika

- Hitungan views, impressions, clicks, followers, aksi, video: integer nonnegatif hingga13digit, <=9.999.999.999.999. Impressions CTR wajibpositif. Basis engagement dan video boleh0 tetapi rasionya null, bukan0 atau Infinity.
- RPM dan pendapatan per sumber: rupiah nonnegatif hingga13digit bulat, dua desimal, koma/titik. Nominal0 wajib diisi bila tidak ada sumber. RPM adalah **asumsi IDR neto per1000views sesuai basis**, bukan tarif bawaan.
- Pricing: produksi kas, kompensasi/jam, overhead, hak pakai per konten berupa rupiah utuh hingga13digit; jam/konten maksimal6digit bulat dan2desimal. Jumlah konten1–1000, jumlah paket sponsor0–1000. Margin target0<=m<100%, empat desimal persen; rentang low<=high. Tidak ada pajak/biaya negosiasi otomatis.
- Waktu tonton menerima **menit desimal**, maksimal6digit bulat dan4desimal. Tidak ada input detik ambigu; replays/durasi melebihi panjang video tidak dipotong. Input kosong/null/angka JS/eksponen/negatif/nonfinite/pemisah ribuan/di atas batas ditolak.
- Semua uang/count/rate memakai BigInt rasional. Persen, average views dan waktu tampil2desimal, half-away-from-zero. Uang RPM tampil sen (Rp0,01); harga penawaran ceiling ke rupiah utuh. Tidak membulatkan rasio/hasil perantara. Setiap output punya tanda subpresisi jika eksak nonnol tetapi tampil0. Persen undefined tetap null.
- Data akun/sumber pendapatan memakai satu periode pelaporan yang dipilih pengguna, tidak dinormalisasi bulanan/tahunan. Tidak ada bunga/diskonto/tanggal pencairan. Model pendapatan dan realisasi sumber lain tidak disebut saldo atau payout terverifikasi.

## CTR

Output rate=clicks/impressions*100%, clicks dan impressions integer; peringatan bila clicks>impressions memakai perbandingan eksak sebelum pembulatan. Jangan cap100%: minta periksa definisi dan pengukuran. Bukan CVR/CPA/ROI atau bukti profit.

1. Click5,impressions100 ->5,00%; jumlah event5/100 tetap ditampilkan. Click1,impressions32 ->3,125% ->3,13%.
2. Click0,impressions1 ->0,00%; click135,impressions100 ->135,00% dengan peringatan. Click1/impressionsmaks ->positif<0,01%. Impressions0 invalid.
3. Clickmaks/impressions1 ->999.999.999.999.900,00%; tidak memakai Number pada perkalian.

## Estimasi YouTube

V=total views **video non-Shorts** dalam basis RPM yang sama. R=RPM kreator asumsi IDR/1000totalviews, termasuk scope pendapatan yang sudah tercermin pada R. Hasil E=V*R/1000 IDR. Output pendapatan dan views; RPM tidak dikalikan share revenue lagi atau dikurangi biaya platform fiktif. Tidak menambah sponsor/membership sekali lagi bila sudah termasuk dalam R.

1. V10000,R1500,25 ->E15002,50; V12345,R1500,25 ->E18520,58625 ->Rp18.520,59.
2. V1,R5 ->E0,005 ->Rp0,01; V1,R0,01 ->E0,00001 -><Rp0,01. Views0 atau R0 memberi0. V1000,R1 ->Rp1,00. Nilai merupakan skenario, bukan pendapatan resmi atau prediksi.

## TikTok: empat modul

UI progresif memakai pilihan modul native yang jelas, bukan tab palsu. Mengganti modul menghapus hasil dan input modul aktif; sumber/metodologi keempat modul tetap SSR. Modul berdiri sendiri, tidak memindahkan revenue/RPM antarform secara tersembunyi.

### A. Pendapatan

Q=views yang **diasumsikan memenuhi basis RPM model**, bukan semua views publik. R=asumsi RPM neto IDR/1000Q. Platform model P=Q*R/1000. S=sponsor neto, A=komisi affiliate neto, G=gift neto yang sudah direalisasi/dianggap akan direalisasi sesuai pilihan sumber lain (realisasi/asumsi). Total T=P+S+A+G. Seluruh komponen setelah fee langsung masing-masing sumber, **sebelum** pajak pribadi dan biaya produksi umum; jangan mengurangi fee lagi. Tidak memasukkan nilai gift/coin mentah, nilai penjualan affiliate, atau seluruh omzet seller. S/A/G harus terpisah dan tidak mencakup jumlah yang sudah ada pada R. P selalu model; T campuran model dan input sumber lain, bukan total payout nyata. Jika tidak ada pembayaran untuk akun/wilayah/views terkait, isiRPM0; aplikasi tidak memutuskan kelayakan.

1. Q10000,R100 ->P1000; S200,A30,G20 ->T1250. Sumber tetap200,30,20, satu kali masing-masing.
2. Q1,R5 ->P0,005 dibulatRp0,01; S0,01,A0,02,G0,03 ->T0,065 dibulatRp0,07. Karena sumber lain dalam sen utuh, tampilan P+S+A+G sama dengan tampilan T. Q1,R0,01,S=A=G0 ->P danT positif<0,01; Q0/R0 dengan sumber0 ->0. RPM0 dengan S200,A30,G20 ->T250.

### B. Engagement dan metrik akun

I=L+C+S+H. Basis D=followers atau **views konten** (bukan reach). ER=I/D*100%, nulljikaD0; total aksiI tetap tersedia. Average views/video=V/N, nulljikaN0. Output jumlahpengikutF,viewsV,videoN untuk basis audit. >100% adalah aksi tidak unik, tidak dibatasi. Seluruh akun/konten/aksi dalam satu cohort dan periode; bukan analitik akun yang diambil otomatis.

1. F1000,V3000,N3,L100,C20,S10,H5 ->I135, ERfollowers13,50%, ERviews4,50%, avg1000,00. Output F1000,V3000,N3 tetap.
2. F32,V1000,N3,L1,aksi lain0 ->ERfollowers3,13%, ERviews0,10%, avg333,33. F0 dengan basisfollowers menghasilkanERnull; V0 dengan basisviews menghasilkanERnull; N0 memberiavgnull. F1,V100,N1,I135 ->ERfollowers13500%, ERviews135%,avg100. I0 denganD>0 memberi0.

### C. Penawaran sponsor

Memakai fungsi biaya dan minimum harga yang sama dengan endorsement (di bawah), dengan margin target rendah/tinggi mL<=mH dan paket/konten yang sama. QuoteL/H=ceil(B/(1−mL/H))+U. Slots adalah jumlah **paket** pada periode pilihan, bukan jumlahkonten lagi. Skenario omzet quoteL/H*slots; ini kapasitas asumsi, bukan pesanan/pendapatan terjamin. Output quoteL/H, biaya dasar B, hakpakai U, omzetL/H danslots.

1. Satu konten: produksi100,jam2,kompensasi100/jam,overhead50 ->B350,U50. Margin20% ->ceil437,5+50=488; margin30% ->ceil500+50=550. Slots2 ->omzet976–1100. B350,U50 tetap.
2. Tiga konten: produksi100,jam1,25,kompensasi80,overhead25 ->labor300,B675,U60 (hak20/konten). Margin0% ->735; margin25% ->960. Slots3 ->2205–2880. Slot0 ->omzet0, quote tidak berubah. Marginhigh<low,100% ataujumlahkonten0 invalid.

### D. Perbandingan akun A/B

Satu pilihan basis D untuk keduanya, satu periode/cohort yang sebanding. Input perakun followersF,viewsV,totalaksiI (empataksi yang sama),videosN. Tabel menampilkan keenam metrik: F,V,I,N, ER=I/D*100%, avg=V/N. Selisih B−A untuk F/V/I/N integer; selisih ER dalam **poin persentase**, dihitung dari (IB*DA−IA*DB)/(DA*DB)*100, tidak mengurangi ERtampilan. Selisih avg=(VB*NA−VA*NB)/(NA*NB), bukan average tampilan. Bila salahsatu pembagi0, metrik/delta terkaitnull. Tidak membagi perubahan dengan akunA dan tidak membuat ranking/bobot/skor kualitas.

1. Basisfollowers: A(F1000,V1000,I100,N3), B(F2000,V800,I100,N2). Fdelta+1000,Vdelta−200,Idelta0,Ndelta−1; ERa10%,ERb5%,delta−5,00pp; avgA333,33,avgB400,00,delta+66,67. Basisviews ->ERa10%,ERb12,5%,delta+2,50pp; avg sama.
2. A(F32,V32,I1,N1),B(F31,V31,I1,N1): ERa3,125% ->3,13%,ERb100/31%=3,225806… ->3,23%; delta=25/248 pp=0,100806… ->+0,10pp. Fdelta−1,Vdelta−1,Idelta0,Ndelta0; avgA32,avgB31,delta−1. Swap akun membalik seluruh delta eksak. A/B0 semua memberi count0 tetapi ER/avg/delta rasio null. Akun identik positif memberi delta rasio0.

## Tarif Endorsement

D=konten (1–1000); C=biayaproduksi/konten; h=jam/konten (2desimal); w=kompensasi/jam; O=overhead/konten; u=hakpakai/konten. Semua biaya IDRutuh. Labor total L=D*h*w (sen eksak). B=D*(C+h*w+O). U=D*u, hakpakai **dihargai terpisah tanpa margin**, bukan biaya yang dinaikkan/dikurangi olehm. Komponen produksi minimum P=ceil(B/(1−m)) ke IDRutuh. Total quote=P+U, profitproduksi=P−B (sen), effective marginproduksi=(P−B)/P*100% jikaP>0, nulljikaP0. Hakpakai dikecualikan dari profit/margin ini. Rumus dari (P−B)/P>=m iff P>=B/(1−m); ceiling memastikan harga minimum rupiah memenuhi margin, tidak memakai markup. Nilai B,L adalah sen eksak, bukan agregat yang dibulatkan. Tidak ada standar biaya per follower, pajak, diskonnegosiasi atau klaim market-clearing price.

1. D1,C100,h2,w100,O50,u50,m20% ->L200,B350,U50,P438,quote488,profit88,effective4400/219%=20,091324… ->20,09%.
2. D3,C100,h1,25,w80,O25,u20,m25% ->L300,B675,U60,P900,quote960,profit225,effective25,00%. m0 memberiP675,quote735,profit0,margin0. C=O=h=u=0 ->quote0,L=B=U=profit0,effective null, bukan0/0. h0,01,w1,D1,B0,01,m0 ->P1,quote1,profit0,99,margin99%; ceiling minimum rupiah tetap eksplisit.
3. Margin99,9999% valid;100% invalid. B=Rp1,m33,3333% ->P2, bukan1; ketidaksamaan margin minimal diuji integercross-product.

## Waktu Tonton

V=views pada populasi/periode yang sama dengan average minutes a. Menit total M=V*a; jam total H=M/60. Dua output dibulatkan sendiri dari ledger rasional yang sama, bukanjam=menittampilan/60 atau sebaliknya. Bukan qualifying public watch hours atau reward-qualified time.

1. V1000,a1,5menit ->M1500,00,H25,00. V3,a0,1 ->M0,30,H0,005 ->H0,01. Jangan menolak durasi yang melebihi panjangvideo bila laporan mencakup replay; definisi rata-rata harus konsisten.
2. V1,a0,0001 ->M0,0001,H1/600000, keduanya positif di bawah0,01. V0 ataua0 ->M=H0. Vmaks,a999999,9999 ->M9.999.999.998.999.000.000,0001 dan H=M/60, BigInt di atas safeinteger, tidakoverflow. Menit7desimal/durasi1.000.000 invalid sesuai batas.

## Gate

Unit fixture independen untuk setiap output dan modul; audit ceiling harga minimum, sum pendapatan tanpa doublecount, diff rasio sebelum pembulatan, nol/tiny/tie/large, inputinvalid. Regresi56engine lama. Browser semua5routes+4modulTikTok, mode/Enter/select/errorfocus/stale, comparisontablekeyboard, sourceSSR/FAQ, canonical/nav/search/hub10, noindex/robots, viewport320/375/768/1024/1440, screenshotdesktop/mobile termasukstatusbatas. Inventaris100unik/61terbit/10MediaSosial/66sitemapURL. Tidak mengubah domain production atauindexingstaging, tidakmerge/automerge.
