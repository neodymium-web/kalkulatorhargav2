# Verifikasi Batch 17: settlement manual dan operasional marketplace

Diperiksa 7 November 2026 sebelum implementasi, dari main `da78218f7d3669e27c9bebe2f73ce8b1598a2bd6`. Versi rumus 1.0.0. Commit pertama hanya dokumen ini. Semua tarif adalah asumsi input pengguna, tanpa preset kontrak Blibli atau marketplace lain.

## Referensi yang dibuka dan batas bukti

- [MIT OpenCourseWare, Management Accounting and Control, lecture 2](https://ocw.mit.edu/courses/15-963-management-accounting-and-control-spring-2007/c0e4e8a92624f3eff86232c0b2df69cf_lec2.pdf), slide 16: membedakan kontribusi dari laba kotor dan laba operasional. Dipakai untuk cakupan biaya bundel, bukan kebijakan platform.
- [AccountingCoach, Income Statement](https://www.accountingcoach.com/income-statement/explanation), bagian Gross profit dan SG&A: penjualan neto dikurangi HPP belum laba akhir setelah beban operasi. Dipakai untuk membatasi istilah hasil, bukan standar laporan keuangan Indonesia.
- [Shopify Help Center, Product analytics overview](https://help.shopify.com/en/manual/products/analytics), Days of inventory remaining: persediaan akhir dibagi rata-rata unit terjual harian. Ini referensi dimensi stock cover, bukan janji forecast atau kebijakan marketplace.
- Dua halaman SAP Inventory Days' Supply dan Calculating Days' Supply dibuka, tetapi badan halaman tidak terbaca oleh alat web. Cuplikan pencarian hanya mengonfirmasi konsep average daily issues/demand; tidak diklaim telah membaca isi penuh atau dipakai sebagai bukti rumus kontrak. Rumus stok/laju harian di bawah diturunkan lewat satuan unit dibagi unit/hari, dengan asumsi permintaan konstan.

Seluruh persamaan settlement dan pembalikan harga adalah model eksplisit Issue #43, bukan aturan faktur Blibli. Diskon/subsidi/pajak/PPN, refund, cap, kategori, biaya program, pembulatan invoice dan jadwal pencairan tidak ditebak. Input biaya lain boleh mewakili komponen kontrak pengguna, tanpa label bahwa kontrak terverifikasi. Tidak ada tarif resmi yang diterbitkan.

## Representasi, batas dan pembulatan

Uang input integer rupiah nonnegatif sampai 13 digit (9999999999999). Quantity integer 1–10000. Persen string 0–100 dengan maksimal 6 desimal, denominator 100000000 setelah fixed-point 6 desimal persen; harga inverse mewajibkan diskon dan fee <100. Permintaan harian nonnegatif sampai 13 digit bulat dan 6 desimal, stok integer sampai 13 digit. Kanal 2–5; isi bundel 1–20. Label wajib setelah trim, maksimum 60 karakter; label kanal duplikat case-insensitive ditolak, label produk duplikat sah. Number/null/eksponen/nonfinite/negatif, presisi berlebih dan enum asing ditolak. Biaya lain/ongkir kosong atau tidak diberikan berarti 0; input utama termasuk biaya tetap wajib eksplisit.

BigInt dan pecahan n/d, d>0, digunakan sepanjang domain. Helper lama round hanya benar untuk n nonnegatif; pembulatan bertanda baru menghitung round(abs(n)/d), lalu mengembalikan tanda. Cash aggregate half-away-from-zero ke rupiah, sekali per payout/kontribusi, tidak per komponen. Karena HPP integer, laba cash = payout cash − HPP total; ties ketika payout positif tetapi laba negatif dapat membuat round(laba eksak) berbeda, maka laba cash sengaja mengikuti ledger cash payout. Ledger rasional sebelum pembulatan tetap tersedia dan direkonsiliasi. Penyesuaian pembulatan payout = cash − eksak ditampilkan; biaya persen hingga 8 desimal rupiah eksak (integer uang × persen6/100), bukan biaya bulat. Margin kontribusi hanya jika netSale>0, denominator netSale, 6 desimal dengan marker arah nonnol subpresisi; tidak menyebut margin laba bersih akuntansi. Stok hari 6 desimal, floor dari pecahan asli. Harga inverse memakai ceiling asli, bukan angka tampilan.

## Settlement Blibli manual

G=P×Q; S=G−D; B=G atau S sesuai pilihan; C=B×r; F=C+fixed+other+shipping; payout=S−F; H=HPP×Q; hasil setelah HPP=payout−H. D rupiah per pesanan, bukan per unit, wajib D≤G. Negatif dipertahankan. Simulasi komisi berdasarkan input kontrak Anda; bukan kalkulator tarif resmi Blibli.

Vektor independen:
1. P100000,Q2,D10000,HPP60000,r5%,fixed2000,other1000,shipping3000: G200000,S190000. Basis neto C9500,F15500,payout174500,hasil54500. Basis bruto C10000,F16000,payout174000,hasil54000.
2. P1,Q1,D0,HPP1,r50%,fixed1: C1/2,payout−1/2→cash−1; laba cash−2, laba eksak−3/2. r49,999999% memberi payout−49999999/100000000→cash0,laba cash−1. P1,r50%,fixed0,HPP1: payout1/2→cash1,laba cash0 meski laba eksak−1/2 (perbedaan kebijakan tie dijelaskan).
3. Seluruh fee/diskon0 memberi payout=G; D=G dengan basis neto memberi C0; basis bruto masih bisa menghasilkan payout negatif.

## Harga listing minimum

a=(1−d)(1−f)>0; paid=L(1−d); payout(L)=La−fixed. Jaminan target terhadap payout rasional SEBELUM pembulatan. L*= (T+fixed)/a; L=ceil(L*) minimal integer nonnegatif. Bukti: (L−1)<L*≤L sehingga payout(L−1)<T≤payout(L). Engine melakukan forward verification kandidat dan sebelumnya. Kebijakan ini sengaja bukan minimal menurut payout cash yang dibulatkan; tidak ada pilihan kebijakan cash lain.

1. T90000,fixed5000,d10%,f5%: a171/200,L*=19000000/171=111111,111…; L111112,payout90000,76. L111111,payout89999,905 <90000 meski cash pembulatan bisa90000. Ini membuktikan alasan kebijakan target unrounded.
2. T1,fixed0,d0,f50%: L2,payout1; L1,payout1/2 tidak memenuhi target walau cash1. T0/fixed0 memberi L0, tidak menguji harga negatif. Semua rate0 memberi L=T+fixed.
3. d=f=99,999999% memberi a=1/10^16. Pada T=fixed9999999999999, L=199999999999980000000000000000; tidak boleh Number atau clamp ke batas uang input. d/f100 ditolak.

## Perbandingan kanal

Common G,S,H sama untuk semua kanal. Setiap kanal menghitung settlement tanpa ongkir terpisah (masukkan ke biaya lain). Pilihan basis per kanal eksplisit. Urutan tabel tetap urutan input; semua kanal profit eksak maksimum ditandai terbaik/seri. H sama membuat ranking payout dan laba setara. Ranking dari pecahan asli, bukan cash; dua hasil cash sama belum tentu seri. ID hasil adalah indeks urutan input snapshot; React form memakai ID baris stabil saat hapus/tambah, label bukan key. Label dirender sebagai teks React, tanpa HTML.

1. P100000,Q1,D0,HPP60000. A5%+2000: payout93000,hasil33000; B8%+0: payout92000,hasil32000. C5%+2000 seri A; urutan A/B/C tetap.
2. P100,Q1,D20,HPP60. A25% basis bruto: C25,payout55,hasil−5; B25% neto: C20,payout60,hasil0. Keduanya neto dengan fee sama menjadi seri.

## Bundel satu pesanan

COGS=Σ cost_i×qty_i; S=price−discount (discount rupiah pesanan ≤price); C=S×rate; fees=C+fixedFulfillment; kontribusi=S−COGS−fees. FixedFulfillment mencakup kemasan/fulfillment pesanan, dihitung sekali. Tidak mengurangi diskon dua kali. Kontribusi setelah HPP dan biaya yang dimasukkan, bukan laba bersih; sewa,gaji,pajak,marketing/overhead belum masuk kecuali secara sadar dimasukkan pengguna. Jika HPP mengandung biaya tetap, istilah kontribusi di sini adalah kontribusi skenario, bukan klasifikasi variable-cost murni. Margin=kontribusi/S×100 hanya S>0.

1. A20000×2+B30000×1 →COGS70000; price100000,D10000,S90000,r5%→4500;fixed2000→kontribusi13500,margin15%.
2. price1,D0,r50%,fixed1,HPP1×1→kontribusi−3/2,cash−2. Price0,HPP2×1,fee0→kontribusi−2,margin tidak terdefinisi. HPP0 sah. Memecah A×2 menjadi dua baris A×1, menukar baris atau label duplikat tidak mengubah total.

## Stok cover

Stok sellable integer I, rata-rata penjualan v unit/hari; jika v>0, cover=I/v hari, wholeDays=floor(cover). Bukan ceiling hari terakhir, forecast time-series atau janji kehabisan. Tidak memakai tanggal sekarang/lead time/default restock. Jika v0,I>0: tidak ada estimasi finite (tak terhingga di model konstan). Jika keduanya0: tidak terdefinisi, bukan infinity. Status tersebut menjadi jawaban utama.

1. I120,v8→15hari,whole15. I10,v3→10/3hari,tampil3,333333,whole3. I0,v5→0hari.
2. I1,v9999999999999,999999→1/9999999999999,999999hari,positif <0,000001hari,whole0. I9999999999999,v0,000001→9999999999999000000hari tepat.
3. I120,v0→tanpa estimasi finite; I0,v0→tidak terdefinisi. Stok desimal/negatif dan v negatif ditolak.

## Rencana pengujian

Fixture independen di atas dihitung aljabar dan diverifikasi dengan Python Fraction sebelum implementasi. Uji konservasi ledger asli, cash adjustment/laba cash, signed ties, basis/rate0/100/99,999999, harga minimum forward kandidat/sebelumnya, ranking/ties sebelum pembulatan, split/reorder bundel, nol-demand stok, batas payload/baris dan seluruh regresi. Browser mencakup form 5 route, baris2–5/1–20, fokus keyboard/invalid/stale, normal/edge desktop/mobile, lima lebar, SSR sumber/FAQ, hub16/pencarian/sitemap92/404 dan noindex staging.
