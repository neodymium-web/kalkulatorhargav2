# Verifikasi Batch 11: engagement, pengikut dan biaya iklan

Diperiksa 7 November 2026 sebelum implementasi. Versi rumus 1.0.0, main acuan108be3b8. Semua hitungan dan biaya manual, bukan data langsung atau benchmark platform. Tidak mengubah engine 51 kalkulator terdahulu.

## Sumber primer yang diperiksa

- [Sprout Social API, metric definitions](https://api.sproutsocial.com/docs): penyedia analitik menjelaskan engagement per follower dan membedakan basis metrik. Komponen yang dihitung dapat berbeda antarplatform.
- [Hootsuite, calculating engagement rate](https://blog.hootsuite.com/calculate-engagement-rate/): pembilang interaksi dibagi reach atau followers, kemudian dikali100; reach, impressions dan views berbeda. Model aplikasi menetapkan tepat likes+comments+saves+shares sebagai jumlah **aksi**, bukan orang unik. Tidak mengimpor benchmark dari artikel.
- [Socialinsider, calculating follower growth](https://www.socialinsider.io/blog/how-to-calculate-follower-growth/): (ending−starting)/starting×100; sumber asli penyedia analitik, bukan agregator tarif.
- [Google Ads, CPM definition](https://support.google.com/google-ads/answer/6310?hl=en): unit biaya per seribu impressions. Aplikasi menghitung average CPM historis, bukan menetapkan bid/vCPM atau tarif.
- [Google Ads, Average CPC](https://support.google.com/google-ads/answer/14074?hl=en): total biaya terkait klik dibagi total klik, berbeda dari maksimum bid.
- [Google Ads, Average CPA](https://support.google.com/google-ads/answer/6396841?hl=en): biaya konversi dibagi jumlah konversi; Google memakai istilah cost per action. Aplikasi meminta definisi hasil (penjualan, lead, pendaftaran) dan menyebut basisnya, tidak menganggap action, akuisisi pelanggan dan transaksi selalu sinonim.
- [Google Ads, conversion windows](https://support.google.com/google-ads/answer/3123169?hl=en): batas waktu sesudah interaksi iklan memengaruhi konversi yang dicatat. Tidak mengisi default jendela atribusi.

URL di atas berhasil dibuka. Google Ads answer14019 gagal diakses dan tidak dipakai sebagai rujukan. Definisi platform dapat berbeda; jangan mencampur periode, akun, paid/organic, definisi klik/konversi atau model/jendela atribusi. Tidak ada klaim bahwa metrik tertentu baik, menguntungkan, atau membuktikan sebab-akibat iklan.

## Domain, satuan dan pembulatan

Semua hitungan dan biaya input berupa string digit bilangan bulat nonnegatif hingga13digit, 0–9.999.999.999.999. Biaya dalam **rupiah utuh**, tidak menerima desimal rupiah, pemisah ribuan, eksponen, negatif atau nonfinite. Semua aritmetika angka memakai BigInt, tanpa konversi uang/hitungan ke Number. Input pilihan wajib enum native; field kosong/null/undefined/angka JS ditolak.

Pembagi engagement, impressions, clicks dan acquisitions harus positif. Pengikut awal/akhir boleh nol; awal0 menghasilkan persen null, termasuk0→0, sementara perubahan absolut dan akhir tetap tersedia. Persen disimpan sebagai seperseratus persen dan biaya rata-rata sebagai sen diagnostik (Rp0,01), bukan tagihan pembayaran.

Untuk pecahan bertanda N/D dengan D>0, ambil q=abs(N) div D dan sisa rem; tambahkan1 bila2*rem>=D, lalu kembalikan tanda N. Ini nearest dengan tie menjauh dari nol. Persen dibentuk dari jumlah eksak×10.000/pembagi; biaya sen CPC/CPA=spend×100/pembagi, CPM=spend×100.000/impressions. Tidak membulatkan input, jumlah interaksi, delta pengikut atau hasil perantara.

Jika nilai eksak nonnol membulat0, tampilkan arah: biaya positif <Rp0,01; ER positif <0,01%; pertumbuhan positif di antara0% dan+0,01%, negatif di antara−0,01% dan0%. Nol eksak tetap0,00. Status ER melebihi basis membandingkan total aksi eksak dengan pembagi, bukan persen tampilan (misalnya100,00000000001% masih diberi catatan). Tidak melakukan cap100%.

## Engagement Rate

I=L+C+S+H (suka, komentar, simpan, bagikan). ER=I/B×100%, B adalah jumlah pengikut snapshot relevan atau reach konten yang dipilih. User memilih basis followers/reach dan jumlah sesuai basis itu. Reach bukan jumlah impressions/views. Sebaiknya input mewakili satu konten dan cakupan analitik yang sama; penjumlahan banyak post tanpa mendefinisikan reach unik menghasilkan metrik lain. Tidak menafsirkan ER sebagai proporsi orang unik, karena satu orang dapat melakukan lebih dari satu aksi.

Vektor hitung independen:

1. L100,C20,S10,H5 memberi I135; followers1000:135×100/1000=13,50%. Basis reach100:135%, valid dengan catatan aksi tidak harus unik.
2. L1,C0,S0,H0,B32:100/32=3,125%→3,13%. Nol seluruh aksi/B1→0,00%. I1/B9.999.999.999.999 positif di bawah0,01%.
3. Empat komponen9.999.999.999.999 memberi I39.999.999.999.996; B1 memberi3.999.999.999.999.600,00%, tetap eksak. B0 invalid. I9.999.999.999.999/B9.999.999.999.998 membulat100,00% namun peringatan >basis tetap aktif.

## Pertumbuhan Pengikut

Delta=end−start; jika start>0, growth=delta/start×100%. Ini perbandingan **dua snapshot**, tanpa tanggal, lama periode atau rata-rata harian. Inventory disesuaikan agar tidak menjanjikan normalisasi tanggal yang tidak tersedia. Delta neto tidak sama dengan gross follows baru: unfollow dan perubahan pencatatan sudah tercermin di jumlah akhir.

1. 1000→1250:delta+250,growth+25,00%; 1000→800:delta−200,growth−20,00%.
2. 32→33:delta+1,growth+3,125%→+3,13%;32→31 memberi−3,125%→−3,13%. 1000→0 memberi−100,00%.
3. 0→200:delta+200,akhir200,persen tidak terdefinisi;0→0 juga persen tidak terdefinisi. 1000→1000 memberi delta0 dan0,00%. 9.999.999.999.999→9.999.999.999.998 mempunyai delta−1, persen negatif di bawah presisi, bukan nol. Tidak memprediksi pengikut masa depan.

## CPM

Average CPM=spend/impressions×1000, satuan IDR per1000impresi. Impresi positif dapat mencakup penayangan berulang pada orang yang sama. Seluruh biaya adalah belanja kampanye yang dimasukkan; biaya agensi, produksi, pajak atau biaya lain tidak ditambahkan otomatis.

1. Rp150.000/50.000×1000=Rp3.000,00 per1000impresi.
2. Rp1/3.000×1000=Rp0,333…→Rp0,33; Rp1/8.000×1000=Rp0,125→Rp0,13; Rp1/200.000×1000=Rp0,005→Rp0,01. Rp1/200.001 memberi nilai kurang dari setengah sen, tampilan <Rp0,01.
3. Spend0/impresi1→Rp0,00, valid. Impresi0 invalid sekalipun spend0. Spendmaks/impression1 memberiRp9.999.999.999.999.000,00, melampaui safe integer Number namun aman BigInt.

## CPC

Average CPC=spend/clicks, IDR per klik sesuai definisi input. Klik adalah aksi, tidak harus orang unik atau link click. Jangan memasukkan seluruh klik bila ingin metrik link click dan jangan mencampur biaya/platform yang tidak sepadan.

1. Rp100.000/250=Rp400,00 perklik.
2. Rp1/3=Rp0,333…→Rp0,33;Rp1/8=Rp0,125→Rp0,13;Rp1/200=Rp0,005→Rp0,01;Rp1/201 positif tetapi tampilan <Rp0,01.
3. Spend0/click1 valid0,00. Click0 invalid. Spendmaks/clickmaks tepatRp1,00; pembagi1 mempertahankan spend sebagai average dengan dua desimal, tanpa overflow.

## CPA

Average CPA=spend/acquisitions sesuai definisi hasil teratribusi yang dipilih (penjualan, lead, pendaftaran). Ini biaya per hasil dalam model manual, bukan bukti pelanggan baru, laba, LTV, ROAS atau pengaruh kausal. Gunakan satu jenis hasil, periode biaya/pelaporan, model dan jendela atribusi yang sama. Konversi berbobot pecahan dari platform tidak didukung; input harus hitungan integer sesuai cakupan yang dinyatakan.

1. Rp500.000/20penjualan=Rp25.000,00 perpenjualan teratribusi.
2. Rp1/3lead=Rp0,33;Rp1/8pendaftaran=Rp0,13;Rp1/200hasil=Rp0,01;Rp1/201hasil positif <Rp0,01.
3. Spend0/akuisisi1 valid0,00;akuisisi0 invalid, bukan CPA0 atau Infinity. Pilihan basis hasil tidak mengubah pembagian tetapi wajib dipertahankan pada hasil. Tidak menggabungkan semua definisi hasil menjadi pelanggan unik.

## Gate implementasi

Tes fixture independen dan invariansi: dua basis ER, jumlah interaksi empat komponen, >100% sebelum pembulatan, delta bertanda dan awal0, cross-product error<=setengah unit tampilan, tie simetris, skala, maksimum, subpresisi, spend0 dan semua pembagi0/malformed. Semua51engine sebelumnya tetap dengan fixture lama. Target100entri unik,56terbit,5MediaSosial,4hub dan61URL sitemap. Browser memeriksa field/Enter/select/error/fokus, hasil stale dibersihkan, state nol/tiny/>100%/penurunan, SSR sumber, 320/375/768/1024/1440px, nav/headerwrap/hub/search, noindex/robots dan404unpublished. Screenshot desktop/mobile serta Vercel Preview menjadi bukti PR; tidak merge atau mengubah production/indexing staging.
