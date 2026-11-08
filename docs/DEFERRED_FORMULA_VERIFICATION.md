# Verifikasi kontrak dan oracle fitur manual, Issue #57

Baseline a2cbd56, diperiksa8November2026 sebelum implementasi fitur. Semua angka contoh di bawah sintetis untuk oracle, bukan harga/rate resmi. Metadata GET baru dan kontrak SSR ketiga fitur ada di `docs/audit/deferred57/legacy-network.json` dan `legacy-contracts.json`.

## Sumber primer dan batas

- [Royal Mint: Metal Fineness Explained](https://www.royalmint.com/invest/discover/gold-news/metal-fineness-explained), dibaca8November2026: karat menggunakan24bagian;18K mengandung75%emas. Ini definisi kadar, bukan feed harga atau aturan pajak Indonesia.
- [World Gold Council: Gold Jewellery](https://www.gold.org/about-gold/about-gold-jewellery), dibaca8November2026: fineness menyatakan bagian per1000;14/24 adalah583,333…‰ sedangkan stamp585 merupakan standar komersial yang berbeda.24K ideal100% berbeda dari hasil assay999,9‰. Kalkulator tidak mengesahkan hallmark/assay dan tidak membulatkan karat menjadi kode dagang.
- [ANTAM: Panduan buyback](https://www.logammulia.com/id/news/panduan-lengkap-layanan-buyback-antam-logam-mulia), ditemukan melalui pencarian situs resmi, tetapi fetch penuh403. FAQ dan artikel yang terindeks juga memiliki konteks/ketentuan biaya berbeda. **Tidak memverifikasi atau menanam harga, pajak, fee, bank, tanggal cair maupun aturan ANTAM**. Quote berasal dari pengguna, bukan scraping/API. Dokumen/source ini bukan lisensi feed.
- Core settlement internal yang diaudit: `lib/platform-settlement/engine.ts`, formula dan bukti Batch20 tetap. Rujukan platform di `tools.ts` hanya konteks resmi, bukan rate table yang terverifikasi. Tidak mengimplementasikan hukum pajak baru; nominal pemotongan manual hanya dari bukti yang dikonfirmasi pengguna. Klasifikasi tak pasti/retur/pajak terpisah yang belum terpetakan fail closed.

## Emas: model nilai logam manual

W=berat bruto−berat nonemas, gram. f=karat/24 atau fineness/1000 menurut pilihan eksplisit. F=W×f gram emas murni. P=quote beli per gram murni, B=quote buyback per gram murni atau P×(1−spread). V=F×P. Modal eksak=V+biaya beli. Penerimaan eksak=F×B−biaya jual. Selisih eksak=penerimaan−modal. Tidak ada nilai batu, desain, ongkos kerja yang dapat direalisasi otomatis, harga ukuran/kemasan, pajak otomatis atau penawaran dealer.

Input desimal maksimal6digit untukgram/kadar/persen; quote dan biaya rupiah integer maksimal13digit. Pecahan tidak dibulatkan sebelum ledger selesai. Masing-masing modal dan penerimaan dibulatkan sekali half-away-from-zero ke rupiah cash, selisih cash=penerimaan cash−modal cash. Selisih cash bisa berbeda dari membulatkan selisih eksak; kedua nilai diberi label. Nominal negatif tidak dipaksa0.

Jika disediakan minimum quote baru, targetnya terhadap modal **eksak**: (modal+biaya jual)/(F×(1−spread)) untuk spread<100. Ceiling rupiah menghasilkan quote integer yang memenuhi target eksak, dan satu rupiah di bawah harus gagal. Ini model spread tetap, bukan forecast atau jaminan harga/toko. Spread100% tidak mempunyai titik impas finite. Quote buyback langsung tidak mengasumsikan spread konstan untuk forecast.

Tanggal quote, tanggal simulasi dan toleransi usia diisi pengguna, dihitung kalender Gregorian date-only. Quote future/invalid ditolak; age>toleransi atau status quote belum dikonfirmasi menghasilkan status tanpa angka. Tidak ada harga/tanggal pasar bawaan.0quote ditolak;0biaya harus diisi eksplisit. Pilihan quote buyback langsung mencegah konversi spread yang dibulatkan terlalu dini.

Oracle independen:

1.12g−2g=10galloy;18/24→7,5gfine;P1000000;spread10%;biayabeli20000/jual30000:V7500000,modal7520000,penerimaan6720000,selisih−800000. Harga impas eksak7550000/6,75=1118518,518…;ceiling1118519. Pada1118518,penerimaan7519996,5<7520000; pada1118519,penerimaan7520003,25≥7520000.
2.18K dan750‰ identik.14K/24 tidak diganti585‰.1g×14/24×Rp1=7/12rupiah; tidak memakai persen58,33 yang sudah dibulatkan.
3.1,5g24K×Rp1,spread10%,biaya0:modal1,5→cash2;penerimaan1,35→cash1;selisih eksak−0,15 tetapi selisih cash−1. Ledger harus menunjukkan keduanya.
4.Netweightnol,negative/overflow,karat>24,fineness>1000,spread>100,quote kosong/0 atau dateinvalid: invalid. Quote stale/unknown: status tanpa angka. Spread100:buybackgross0;biayajual1→penerimaan−1,bukan floor0.
5.Legacy snapshot memuat acuan2540000 dan tampilan spread8,1% yang menghasilkan2334260, berbeda dari quote referensi2335000. Ini menunjukkan risiko spread yang dibulatkan lebih awal; tidak dipakai sebagai rate aktual/manual default.

## Pembanding: empat ledger manual, tanpa preset

Reuse core settlement untuk gross=price×quantity, sales=gross−discount, kredit actual=creditedBuyerShipping+reimbursement+receipts, tiapfee=clamp(basis×rate atau fixed×scope,min,max). Payout=sales+credits−fees−sellerShipping−other−pemotongan manual terkonfirmasi. HPP=cost×quantity. Fee/tax unknown tidak dianggap0. Cap/min perpesanan saja; cap perunit/retur/sengketa/pajak belum terpetakan tidak didukung. Basis tax rate tidak ditebak: input hanya nominal bukti, bukan persen hukum.

Payout cash dibulatkan sekali dengan core half-away-from-zero, hasil setelahHPP cash=payoutcash−HPPinteger. Tax manual digabung ke input other core hanya setelah validasi, tetapi ditampilkan terpisah dalam rekonsiliasi agar tidak ganda. Batas13digit totalother+tax tetap. Keempat skenario harus lengkap dan basket quantity/HPP sama sebelum ranking, harga/diskon/ongkir dapat berbeda sesuai skenario. Ranking menggunakan hasil setelahHPP eksak; cash sama tidak berarti seri.

Oracle:

-100000−9250(9,25%×100000)−1250=89500. Menjadi81500 **hanya jika** ada8000biaya lain eksplisit; namanya tidak disimpulkan sebagai tarif resmi.
-200000−10000=190000;sales+credit5000−fee19000−fixed1250−shipping8000=166750;HPP120000→46750. Jika withholding manual750 danother500:cash165500,hasil45500. Setiap komponen muncul di ledger.
-Fee3×0,5rupiah→1,5totalfee;price1→payout−0,5→cash−1. Jangan membulatkan tiapfee menjadi1 sebelum mengurangi.
-Kanal payout99,49 dan99,40 sama-sama cash99, tetapi ranking eksak memilih99,49. Nama platform tidak mengisi rate/basis/cap otomatis. Semua input kosong/unknown menghilangkan ranking, bukan membuat nol.

## Benchmark dan rights

Snapshot tiga tabel, values, tiers, rangefollowers, metric denominator, dates dan attribution tersimpan sebagai evidence audit, bukan dataset frontend. Teks legacy mencampur median/kuartil per followers dan mean per views, periode “beberapa kuartal terakhir”, beberapa studi/geografi/sampel. Belum ada lisensi/izin owner-supplied, dataset mentah, definisi kuartil/reproduksi atau cohort lintasstudi yang disahkan. Route tetap404. Tidak membuat tier/median sintetis atau menyebutnya angka resmi TikTok. Engagement calculator yang sudah ada hanya alternatif terpisah.
