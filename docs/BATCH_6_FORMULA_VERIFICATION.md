# Verifikasi rumus Batch 6 — biaya operasional seller

Diverifikasi 7 November 2026 sebelum implementasi. Versi model 1.0.0.

## Sumber dan cakupan

- [OpenStax, Introductory Statistics 2e §4.2](https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation): ekspektasi variabel diskret adalah jumlah nilai × probabilitas. Untuk kerugian biner L atau 0, E = pL. Ini rata-rata model, bukan prediksi jumlah kejadian aktual.
- [BCcampus, Yield Testing](https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/yield-testing/): biaya pembelian harus mencakup bagian terbuang; biaya per unit yang dapat dipakai memperhitungkan yield. Penerapan pada bahan kemasan adalah adaptasi matematis, bukan tarif industri.
- [TikTok Shop Academy Brazil, Co-funded Campaign](https://seller-br.tiktok.com/university/essay?knowledge_id=2569565069149953&lang=en): menjelaskan pembagian pendanaan diskon platform dan seller. Referensi ini hanya membuktikan konsep pembagian pendanaan; syarat Brazil tidak dianggap berlaku di Indonesia. Rasio, batas, penggantian, dan kelayakan harus diverifikasi pengguna dari laporan kampanyenya.

Semua nominal biaya, probabilitas, dan subsidi adalah asumsi pengguna. Tidak ada tarif marketplace, probabilitas kegagalan, maupun janji reimbursement bawaan. Identitas penjumlahan pendanaan ongkir diturunkan dari neraca biaya yang didefinisikan di bawah, bukan aturan suatu marketplace.

## Presisi dan validasi bersama

Rupiah input: bilangan bulat nonnegatif maksimal 13 digit. Persentase: paling banyak dua desimal, skala integer 10.000 untuk 100%. Kuantitas bahan: tiga desimal. Semua operasi memakai BigInt dan pecahan rasional; tidak memakai floating point. Output uang diagnostik dua desimal rupiah, nearest half-up pada hasil akhir. Ekspektasi jumlah gagal COD ditampilkan sampai empat desimal, tanpa pembulatan ke bilangan paket utuh. Total batch dihitung dari pecahan asli, bukan hasil per pesanan yang telah dibulatkan. Nilai positif di bawah presisi tampilan ditandai kurang dari increment, bukan nol.

## Promo Seller

P = harga produk/order sebelum diskon; D = diskon nominal (mode rupiah saja); s = bagian seller dari diskon (bukan dari harga). Beban seller = Ds; bagian platform = D−Ds; harga pembeli = P−D; penerimaan kotor seller = P−Ds, dengan asumsi bagian platform benar-benar dikreditkan. Fee, pajak, ongkir dan biaya produk belum dipotong. D ≤ P, s antara 0 dan 1. Hasil bukan laba atau dana cair final.

Contoh independen: P=100.000, D=20.000, s=25% → seller5.000, platform15.000, pembeli80.000, penerimaan95.000. P=3,D=1,s=33,33% → seller0,3333; tampilan0,33, platform0,67, penerimaan2,67. Agar rincian tampilan tetap menjumlah ke diskon, bagian seller dibulatkan terakhir, lalu platform dan penerimaan tampilan diturunkan dari angka tersebut. D=0 menghasilkan beban0; s=0/100% mengalokasikan seluruh diskon ke platform/seller. D>P ditolak.

## Subsidi Ongkir

A = ongkir aktual, B = pembayaran pembeli, C = subsidi platform yang benar-benar dikreditkan. Seller = A−B−C; identitas A=B+C+seller. Subsidi bukan nilai voucher yang belum pasti diterima. Tidak mencakup surcharge di luar ongkir aktual; masukkan seluruh ongkir pada cakupan sama. B+C>A ditolak, tidak dijepit menjadi nol.

Contoh: A20.000,B5.000,C10.000 → seller5.000. A15.000,B0,C15.000 → seller0. Semua nol valid. A10.000,B8.000,C3.000 invalid karena pendanaan melebihi biaya.

## Biaya Kemasan

Setiap bahan memiliki harga pembelian H, kuantitas pembelian Q>0, penggunaan layak pakai per kiriman U≥0, waste w dalam [0,1). Satuan Q dan U sama pada setiap baris. Biaya bahan/kiriman = H×U/[Q×(1−w)]. Jumlahkan pecahan seluruh baris sebelum pembulatan. Maksimal100 bahan. Jumlah kiriman N>0 wajib agar total batch eksplisit; total = N×jumlah biaya eksak. Ini alokasi konsumsi, bukan rekomendasi pembelian paket bulat.

Contoh: kardus H100.000,Q100,U1,w0 →1.000; perekat H20.000,Q100,U2,w20% →500; total1.500/kiriman,10kiriman15.000. Dua bahan masing-masing H1,Q3,U1,w0 →2/3 rupiah, tampilan0,67; batch3 →2,00 (bukan2,01). H/U0 valid; Q0 dan waste100% ditolak.

## Biaya Retur

G = kerugian bruto incremental satu retur, R = pemulihan/salvage/kredit yang belum dikurangkan dari G. L=G−R≥0. E/order = pL; untuk N pesanan Etotal=NpL. G mencakup ongkir pergi/pulang, kerusakan, penanganan dan biaya/refund yang benar-benar tidak pulih sesuai pembukuan; jangan menjumlah refund dan pendapatan dibalik dua kali atau memasukkan biaya produk yang sudah pulih kembali sebagai kerugian. Pendapatan/laba normal pesanan sukses tidak dimodelkan. Retur berbeda dari gagal COD.

Contoh: G50.000,R20.000,p5%,N100 →L30.000,E1.500/order,total150.000. G1,R0,p0,01%,N10.000 →E0,0001 rupiah/order,total1 rupiah; total tidak boleh menjadi0 akibat pembulatan awal. p0 memberi0; p100% memberi L; R>G ditolak.

## Kerugian COD

N = percobaan kirim COD bulat nonnegatif; p = probabilitas gagal per percobaan; L = biaya incremental bersih yang tidak pulih per gagal COD (ongkir, kemasan rusak, penanganan setelah recovery; bukan seluruh harga jual). Egagal=Np, Etotal=NpL, E/percobaan=pL. E/percobaan adalah parameter model bahkan jika N=0, bukan pembagian hasil aktual dengan nol. Asumsikan probabilitas dan biaya rata-rata sama untuk kelompok yang dihitung. Penjumlahan ekspektasi tidak memerlukan pembulatan jumlah gagal menjadi paket utuh.

Contoh: N100,p3,5%,L20.000 →3,5 gagal ekspektasian,total70.000,700/percobaan. N1,p1%,L100 →0,01 gagal,total1,00; membulatkan gagal ke0 terlebih dahulu keliru. N0 menghasilkan total0; p0/100% memberi0/N gagal; biaya0 memberi kerugian0. Probabilitas negatif/di atas100% ditolak.

## Regresi tampilan ROAS Impas

Engine lama tetap. Margin positif yang membulat ke0,00% ditampilkan `<0,01%`, sehingga kontribusi positif tidak terbaca sebagai margin nol.
