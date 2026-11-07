# Verifikasi Batch 14: kalender, shift dan BBM

Diperiksa 7 November 2026 sebelum implementasi. Main acuan `0c746d42b8124c1368a3245adc16e7d1728c7f74`, versi rumus 1.0.0. Dokumen ini adalah commit pertama, hanya dokumentasi. Tidak ada data hari libur, hukum usia/ketenagakerjaan atau harga BBM bawaan.

## Referensi yang dibuka dan diperiksa

- [US Naval Observatory, Leap Years](https://aa.usno.navy.mil/faq/leap_years): tahun Gregorian habis dibagi4 adalah kabisat, kecuali abad bukan kelipatan400. Tahun1900 bukan kabisat;2000 kabisat.
- [E. G. Richards, Calendars, Explanatory Supplement to the Astronomical Almanac, bab15, halaman PDF15, §15.4.2](https://aa.usno.navy.mil/downloads/c15_usb_online.pdf): aturan Gregorian, panjang bulan dan anchor1Januari1 adalah Senin. Menggunakan proleptic Gregorian untuk seluruh domain, tanpa perpindahan kalender historis1582.
- [RFC3339 §5.6–5.7](https://www.rfc-editor.org/rfc/rfc3339.html): representasi `YYYY-MM-DD`, batas bulan/tanggal menurut kalender, jam00–23 dan menit00–59. Aplikasi memakai date-only dan subset waktu `HH:mm`, bukan mengklaim sebuah HH:mm adalah timestamp RFC lengkap. Tidak menerima offset, detik atau24:00.
- [NIST SP330 §4, tabel8](https://www.nist.gov/pml/special-publication-330/sp-330-section-4): hubungan menit/jam dan liter. [NIST SP811 bab5](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si) juga diperiksa. Dipakai untuk satuan, bukan konversi tanggal ke durasi detik atau asumsi bahwa semua hari nyata berdurasi24jam.

Konvensi inklusif, pola hari kerja, clamp ulang tahun dan shift di bawah adalah keputusan model aplikasi. Rumus ordinal dan jumlah hari kerja diturunkan langsung dari aturan kalender; tidak mengklaim mengadopsi algoritme Julian Date yang memiliki epoch/konvensi berbeda. Rumus BBM diturunkan secara dimensional, bukan konsumsi kendaraan atau tarif pemerintah.

## Primitif kalender dan bukti

Domain tepat `0001-01-01` sampai `9999-12-31`. Tahun0000, tanggal ambigu, timestamp, whitespace tambahan, tanggal mustahil dan format selain empat digit tahun/dua digit bulan/hari ditolak. Februari29 hanya jika kabisat. Parse komponen ke BigInt; tidak menggunakan Date, Date.parse, UTC, timestamp, milidetik atau zona waktu. Label hari memakai indeks terbatas0–6.

Tetapkan ordinal0 pada1Januari1. Untuk tanggal(y,m,d), Y=y−1:

`O=365Y+floor(Y/4)−floor(Y/100)+floor(Y/400)+jumlah panjang bulan sebelum m+(d−1)`.

Bagian tahun menghitung365 hari per tahun plus setiap tahun kabisat sebelumnya sekali. Jumlah panjang bulan menghitung hanya bulan yang telah selesai, termasuk tambahan Februari bila relevan. Karena panjang bulan valid, tanggal berurutan menaikkan ordinal tepat1, termasuk akhir bulan/tahun. Paling banyak11 bulan dijumlahkan; waktu konstan terhadap rentang tahun. Siklus400tahun memiliki146097hari=20871minggu, sehingga weekday juga berulang. Indeks hari Senin0 adalah `O mod7`. Tidak ada perubahan karena DST atau host timezone. Tidak ada pendekatan30hari/bulan atau365hari/tahun untuk umur kalender.

Python `datetime.date` (date-only, bukan datetime bertimezone) dipakai sebagai pemeriksaan independen dan Fraction untuk BBM. Contoh ordinal0: 2024-02-28=738943,2024-03-01=738945;1900-02-28=693653,1900-03-01=693654;2000-02-28=730177,2000-03-01=730179;9999-12-31=3652058. Seluruh rentang inklusif3652059hari. Anchor tambahan1970-01-01 Kamis,2000-01-01 Sabtu,2026-11-02 Senin.

## 1. Selisih Tanggal

Input awal/akhir dengan akhir≥awal; terbalik ditolak pada akhir. Pilihan `elapsed`: awal tidak dihitung, akhir dihitung, D=O(akhir)−O(awal). Pilihan `inclusive`: kedua batas dihitung, D=selisih+1. Minggu penuh=D div7 dan sisa=D mod7; tujuh kali minggu+sisa selalu D. Minggu/sisa menguraikan jumlah hari menurut mode, bukan umur kalender.

- 2024-02-28→2024-03-01: elapsed2hari,0minggu/sisa2; inclusive3hari,0minggu/sisa3.
- 2023-02-28→2023-03-01:1/2hari.1900-02-28→1900-03-01:1/2;2000-02-28→2000-03-01:2/3.
- Tanggal sama2026-11-07:0/1hari.2024-12-31→2025-01-01:1/2hari.2026-11-02→2026-11-09:7/8hari,minggu1+sisa0/1.
- Batas penuh: elapsed3652058hari=521722minggu+sisa4; inclusive3652059hari=521722minggu+sisa5.

## 2. Hari Kerja

Rentang selalu inklusif, akhir≥awal. Pola libur pilihan eksplisit: Sabtu+Minggu, Jumat+Sabtu, Minggu saja, tidak ada hari libur mingguan, atau semua hari libur. Opsi terakhir secara eksplisit menguji nol hari kerja terjadwal. Tidak ada pola yang dianggap aturan resmi.

Untuk D=O(akhir)−O(awal)+1, q=D div7,r=D mod7 dan w=banyak weekday kerja: scheduled=q*w+jumlah weekday kerja pada r hari sesudah q minggu penuh. Weekday awal memakai ordinal. Hanya0–6 hari sisa diiterasi; bukan setiap hari seluruh rentang.

Daftar tanggal libur opsional0–100baris. Setiap baris yang ditambahkan wajib tanggal valid; hapus bila tidak dipakai. Deduplikasi berdasarkan tanggal kanonis sebelum pengurangan. Libur unik di luar rentang diabaikan dan dihitung terpisah; libur pada hari mingguan nonkerja juga diabaikan. Qualifying hanya tanggal unik dalam rentang yang tadinya terjadwal kerja. Final=scheduled−qualifying≥0. Ledger: jumlah baris=unik+duplikat; unik=qualifying+libur mingguan+di luar rentang. Tabel menampilkan tanggal unik, hari dan statusnya; duplikat tidak menjadi baris pengurangan baru. Reorder dan duplikasi tidak mengubah hasil.

- 2026-11-02(Senin)→2026-11-08(Minggu), Sabtu/Minggu libur: total7,scheduled5,tanpa libur qualifying0,final5. Daftar04Nov,04Nov,07Nov,09Nov:4baris,3unik,1duplikat;qualifying1,weekend1,outside1,final4.
- 2024-02-26→2024-03-03: total7,scheduled5,qualifying0,final5. Tambah29Feb menjadi4.
- 02–08Nov2026, Jumat/Sabtu libur:scheduled5;libur08Nov(Minggu)qualifying1,final4. Minggu saja libur:scheduled6. Semua hari kerja:scheduled7;semua hari libur:scheduled0.
- Rentang0001-01-01→9999-12-31:521722minggu+sisa5(Senin–Jumat); Sabtu/Minggu libur memberi scheduled2608615 tanpa daftar libur. Hari tunggal nonkerja menghasilkan0; hari tunggal kerja menghasilkan1 sebelum libur eksplisit.

## 3. Usia

Tanggal lahir dan tanggal acuan eksplisit, tidak ada default hari ini atau ketergantungan waktu sistem. Acuan≥lahir. Konvensi anniversary asli: `addMonthsClamped(lahir,n)` memindahkan tahun/bulan sebanyak n bulan **dari tanggal lahir asli**, lalu min(hari asli,panjang bulan tujuan). Tidak menambahkan satu bulan berulang dari hasil clamp sebelumnya.

Ambil selisih indeks bulan antara acuan dan lahir sebagai calon n. Jika anniversary calon melewati acuan, kurangi n sekali. Ini memberi jumlah bulan penuh maksimum: kandidat berada pada bulan acuan atau bulan sebelumnya, dan kandidat n+1 melewati acuan. Tahun=n div12,bulan=n mod12,hari=O(acuan)−O(anniversary n)≥0. Total elapsed days=O(acuan)−O(lahir) disajikan terpisah. Tidak menampilkan tanggal ulang tahun berikutnya. ClampFeb28 bukan penetapan usia hukum.

- 2024-02-29→2025-02-28:12bulan penuh,1tahun0bulan0hari,total365hari;2025-02-27:11bulan penuh,0tahun11bulan29hari,total364.
- 2024-01-31→2024-02-29:1bulan,0tahun1bulan0hari,total29;2023-01-31→2023-02-28:1bulan,total28.
- 2024-01-31→2024-03-30:1bulan penuh,0tahun1bulan30hari,total59.31Maret:2bulan0hari,total60. Perbedaan ini mengikuti anniversary asli, bukan drift tanggal29.
- 2000-02-29→2024-02-29:288bulan,24tahun0bulan0hari,total8766. Lahir/acuan sama:seluruh nilai0.0001-01-01→9999-12-31:119987bulan,9998tahun11bulan30hari,total3652058.

## 4. Durasi Kerja

Jam lokal yang dimasukkan adalah angka dinding `HH:mm`, jam00–23,menit00–59. Konversi integer minute=jam*60+menit. Aturan akhir wajib `same-day` atau `next-day`, tidak diinferensi. Gross=endMinute+(next-day?1440:0)−startMinute. Same-day end<start invalid pada akhir. Satu rollover eksplisit; model ini mengizinkan0–2879menit (maks47jam59menit,<48jam). Jeda integer0–2879menit dan≤gross, selain itu invalid pada jeda. Net=gross−break, tidak negatif.

Durasi jam+menit memakai net div60/net mod60; decimal hours=net/60 dibulatkan sekali ke4desimal half-up. Gross/jeda tetap menit integer. Bukan elapsed realtime pada perubahan DST, payroll, lembur atau aturan ketenagakerjaan.

-09:00→17:30 same-day,break60:gross510,jeda60,net450=7jam30menit,decimal7,5000jam.
-22:00→06:00 next-day,break30:gross480,net450=7jam30menit,decimal7,5000jam.
-09:00→09:00 same-day:gross/net0,decimal0;next-day:gross/net1440=24jam,decimal24.0000.00:00→00:01:net1,decimal0,0167jam positif. Break31 pada gross30 invalid;break30 memberi net0.
-00:00→23:59 next-day:gross2879=47jam59menit,decimal47,9833;tidak mengasumsikan semua shift hanya≤24jam.

## 5. Konsumsi BBM

Jarak km nonnegatif,efisiensi km/L positif,masing-masing maksimal13digit bulat dan6desimal. Harga manual Rp/L rupiah utuh nonnegatif hingga13digit. Tidak ada multiplier pulang-pergi, peta/ETA atau harga BBM preset. Jarak adalah total perjalanan yang dimasukkan.

Dengan jarak integer skalaJ=km*10^6,efisiensiE=(km/L)*10^6, liter eksak=J/E. Biaya eksak=J*P/E rupiah, sebab km/(km/L)=L lalu L*(Rp/L)=Rp. Kedua output dibulatkan langsung dari pecahan aslinya: liter4desimal=halfUp(10000*J/E);cost=halfUp(J*P/E)rupiah. Jangan menghitung biaya dari liter tampilan. BigInt menjamin produk harga besar tidak kehilangan presisi. Nearest half-up nonnegatif dapat ditulis floor((2*N+D)/(2*D));E>0.

-150km,15km/L,Rp10000/L:10,0000L,costRp100000.125km,12,5km/L,Rp13500/L:10,0000L,costRp135000.
-1km,3km/L,Rp10000/L:liter1/3→0,3333L,biaya10000/3→Rp3333.1km,7km/L,Rp9999999999999/L:liter0,1429L,biayaRp1428571428571; biaya dari0,1429L akan keliru.
-1km,2km/L,Rp1/L:0,5000L,biaya0,5rupiah→Rp1. Jarak0:liter/cost0;harga0:cost0,liter tetap;efisiensi0 ditolak.
-Jarak0,000001,efisiensi9999999999999,harga1:liter1/9999999999999000000;display liter<0,0001L(positif),cost cash membulatRp0 dengan catatan estimasi positif<Rp0,50, bukan nol eksak. Pada harga0, tidak ada tanda cost positif. Maks jarak/harga9999999999999 dan efisiensi0,000001 memberi liter9999999999999000000 dan cost99999999999980000000000001000000, tetap BigInt.

Konsumsi aktual bervariasi menurut beban, lalu lintas, kondisi kendaraan dan pembelian pompa; model tidak memasukkan pembulatan transaksi pompa, tol, emisi atau kebijakan harga resmi.

## Gate pengujian dan rilis

Fixture di atas diturunkan manual dan diperiksa dengan Python date/Fraction, terpisah dari engine TS. Uji siklus400tahun, weekday anchor, adjacency/akhir abad, reverse invalid, inklusif, workweek arithmetic vs enumerasi independen, dedupe/range/weekend, anniversary maximality/reconstruction, minute conservation, fuel rational rounding/ties/tiny/max dan malformed. Uji DST/timezone melalui proses/unit atau context browser berbeda; domain tidak menyentuh Date.

Playwright mencakup lima form dan hub10alat, dynamic libur0–100, stablekey/fokus/select/Enter/invalid/stale, SSR sumber/FAQ, lima lebar320–1440, screenshot normal/invalid/edge desktop/mobile, canonical/sitemap77/noindex/robots dan unpublished404. Target100IDunik/71terbit/10Sehari-hari/5hub;66engine lama tetap. Jalankan Node22 npmci,typecheck,test,build,e2e; CI sukses dan artifact/Preview READY harus sama dengan SHA PR. Tidak merge/automerge, tidak mengubah production atau indexing staging.
