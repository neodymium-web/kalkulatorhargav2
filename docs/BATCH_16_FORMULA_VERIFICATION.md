# Verifikasi Batch 16: skala, satuan, suhu dan kelajuan

Diperiksa 7 November 2026 sebelum implementasi dari main `effe3ba159dcd730fe1b801f8dbb107e3ec4ae08`. Versi rumus 1.0.0. Commit pertama hanya file ini. Konversi memakai definisi satuan, bukan harga, massa jenis atau asumsi ketelitian alat ukur.

## Sumber resmi yang berhasil dibuka

- [NIST, Definitions of SI Base Units](https://www.nist.gov/si-redefinition/definitions-si-base-units): meter, kilogram dan second adalah satuan panjang, massa dan waktu SI. Definisi SI sekarang berbasis konstanta, bukan prototipe kilogram lama.
- [NIST SI Prefixes](https://www.nist.gov/pml/owm/metric-si-prefixes): faktor desimal kilo, centi, milli dan micro. Faktor prefiks bukan pendekatan.
- [NIST SP811 Appendix B §B.6](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors): international yard=0,9144m dan foot=0,3048m eksak, berbeda dari U.S.survey foot. [Appendix B.9](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9) diperiksa pada Length; tidak menyalin faktor massa tujuh digit yang dibulatkan.
- [NIST SP811 footnote22](https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes): pound avoirdupois eksak0,45359237kg. [NIST Handbook44–2026 Appendix C](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c), C-5/C-7/C-17/C-19/C-27:12in=1ft,3ft=1yd,5280ft=1mi,16oz avoirdupois=1lb; angka pound/ounce penuh dan metric tonne. Ini bukan troy ounce, fluid ounce, short/long ton atau survey mile.
- [NIST SI Units: Temperature](https://www.nist.gov/pml/owm/si-units-temperature): tabel Temperature Conversion (Exact) memuat offset273,15 dan32 serta faktor1,8=9/5. Tabel touchstone yang diberi label approximate tidak dipakai untuk konstanta. [NIST Kelvin Introduction](https://www.nist.gov/si-redefinition/kelvin-introduction): nol mutlak0K=−273,15°C=−459,67°F.
- [NIST SP330 §4](https://www.nist.gov/pml/special-publication-330/sp-330-section-4):1min=60s,1h=3600s,1t=1000kg. Kecepatan skalar diturunkan sebagai jarak/waktu, sehingga km/h=(1000/3600)m/s.

PDF lengkap HB44 terlalu besar untuk alat web, tetapi Appendix C28halaman di atas berhasil dibuka dan dibaca. SP1020-1 yang ditemukan berstatus withdrawn; tidak dipakai sebagai sumber. Semua referensi ini mendukung satuan/konstanta, bukan klaim legal mengenai hasil pengukuran atau ketelitian denah.

## Domain, unit matrix dan presisi

Input besaran panjang/massa/jarak dan suhu: string hingga13digit bulat dan6desimal, titik/koma tanpa pemisah ribuan. Hanya suhu mengizinkan minus. Kosong, null, angka JS, eksponen, nonfinite, unit tak dikenal dan presisi/batas berlebih ditolak. Panjang/massa/jarak adalah besaran nonnegatif, bukan perpindahan bertanda atau gaya. Tidak ada parsing Date/timezone.

Skala N integer1–1000000000; waktu jam integer0–999999999,menit integer0–59,detik0–59,999999 dengan6desimal, total>0. Tidak ada batas24jam. Input seluruh komponen durasi eksplisit termasuk0; total elapsed time mencakup berhenti.

Faktor satu unit ke basis disimpan sebagai BigInt rasional n/d,d>0:

| Panjang ke meter | Faktor eksak |
| --- | --- |
| µm,mm,cm,m,km | 1/1000000;1/1000;1/100;1;1000 |
| in,ft,yd,mi (international) | 127/5000;381/1250;1143/1250;201168/125 |

| Massa ke kilogram | Faktor eksak |
| --- | --- |
| µg,mg,g,kg,t(metric) | 1/1000000000;1/1000000;1/1000;1;1000 |
| lb avoirdupois | 45359237/100000000 |
| oz avoirdupois | 45359237/1600000000 (1/16lb) |

| Kecepatan ke m/s | Faktor eksak |
| --- | --- |
| m/s,km/h,mph(international mile/h) | 1;5/18;1397/3125 |

Umum: out=x×factorAsal/factorTujuan. Pecahan direduksi, tidak dikonversiNumber. Reuse helper rasional Batch15 untuk operasi berpenyebut positif; pembulatan bertanda baru membulatkan magnitudo lalu memasang tanda. Tidak mengubah engine/helper lama. Number hanya indeks/digit tampilan, bukan besaran.

Hasil panjang/skala/suhu/speed6desimal; massa9desimal. Basis yang ditampilkan memakai presisi sama. Quantize half-away-from-zero: q=floor(abs(n)*scale/d);tambah1 jika2*remainder≥d,lalu pasang tanda. Nol eksak tampil0tanpa minus. Nonnol yang membulat0tetap menyatakan positif/negatif dan interval subpresisi; Kelvin tidak pernah negatif pada output eksak.

Hasil menampilkan juga pecahan target eksak sebelum kuantisasi (bilangan bulat bila penyebut1). Konversi bolak-balik diuji dari pecahan asli; tampilan terbatas tidak dijanjikan lossless atau setara ketelitian pengukuran. Tombol Tukar satuan menukar pilihan asal/tujuan dengan **nilai input tetap**, membersihkan hasil, tidak memasukkan hasil tampilan ke input. Mode skala yang berganti menghapus data form selain pilihan mode; unit swap tidak mengubah mode atau N.

## 1. Skala Denah

Rasio1:N adalah panjang di gambar dibanding panjang sebenarnya pada satuan sama. Normalisasi jarak asal ke meter, lalu gambar→nyata mengalikanN atau nyata→gambar membagiN, lalu ubah meter ke unit tujuan. Mode linear saja; luas/volume memerlukan pangkat faktor berbeda dan tidak disediakan. Dimensi fisik cetakan/render harus mengikuti skala; tidak mengoreksi pembesaran cetak atau proyeksi peta.

- Gambar1cm,N100→100cm atau1m. Gambar1cm,N1→1cm. Jarak0selalu0.
- Nyata2,5m,N50→5cm pada gambar; hasilmeter1/20m. Membalik faktor dari pecahan5cm menghasilkan kembali2,5m.
- Nyata1,000001m,N2→0,5000005m; tampilan0,500001m (tie). Bukan sumber input otomatis untuk pembalikan.
- Nyata0,000001mm,N1000000000,tujuankm→1/10²¹km,ditandai positif<0,000001km. Maksjarak9999999999999,999999km,N1000000000,tujuanmm→9999999999999999999000000000mm;BigInttetapeksak.

## 2. Konversi Panjang

Gunakan faktor meter pada matriks. Seluruh unit international dipilih eksplisit; survey foot dan nautical mile tidak disediakan. Kebalikan faktor a/b adalah b/a, sehingga (x×a/b)×b/a=x sebelum pembulatan. Identitas unit sama tetapx.

-1km=1000m=100000cm.25,4mm=1in.3ft=0,9144m.1mi=1609,344m=1,609344km.0,001mm=1µm.
-1m→in=5000/127in≈39,370078740…→39,370079in (6desimal). Pecahan5000/127in kembali persis1m; angka39,370079bukan pecahan itu.
-0,000001µm→km=10⁻¹⁵km,ditandai positif.0dalamsemuaunitselalu0. Maksinput9999999999999,999999km→µm=9999999999999999999000µm.

## 3. Konversi Berat (Massa)

UI menyebut massa/berat sehari-hari, menormalkan ke kg. Tidak mengonversi gaya newton, troy, volume/densitas atau berat semu akibat gravitasi. t berarti metric tonne1000kg. Oz/lb berarti avoirdupois.

-1kg=1000g=1000000mg.2,5t=2500kg.1lb=453,59237g→453,592370000g (9desimal).
-16oz=1lb;1oz=28,349523125g tepat (9desimal).1g→lb=100000/45359237lb≈0,002204622621…→0,002204623lb. Pecahan tetap dikembalikan persis1g oleh faktor sebaliknya.
-0,000001µg→t=10⁻¹⁸t,ditandai positif<0,000000001t. Input0→0. Maks9999999999999,999999t→µg=9999999999999999999000000µg.

## 4. Konversi Suhu Absolut

Konversi adalah affine dengan offset, bukan rasio: K=C+273,15;C=(F−32)×5/9;F=C×9/5+32. Untuk basisK:F→K=(F+459,67)×5/9;K→F=(K−273,15)×9/5+32. Koefisien dan offset rasional eksak.

Input C≥−273,15,F≥−459,67,K≥0 diperiksa dari nilai asli skala10⁶ **sebelum pembulatan/output**. Pembagi konstanta5/9 bukan input; tidak ada pembagian nol. Ini suhu absolut dalam rentang model biasa, bukan interval/perbedaan suhu atau model temperatur negatif termodinamika khusus.

-0°C→32°F dan273,15K.100°C→212°F/373,15K.−40°C→−40°F.98,6°F→37°C dan310,15K.
-−273,15°C→0K/−459,67°F.−459,67°F→0K.0K→−273,15°C/−459,67°F.−0,000000K adalah nol eksak dan ditampilkan tanpa minus.
-−273,150001°C,−459,670001°F dan−0,000001K ditolak.−273,149999°C→0,000001K;−459,669999°F→1/1800000K≈0,000000555…→0,000001K. Tidak meng-clamp nilai di bawah batas menjadi0.
-−17,777778°C→−0,0000004°F; tampil interval negatif antara−0,000001°F dan0°F. Helper quantize±1/2000000 pada6desimal memberi±0,000001(tie menjauh dari nol). Suhu positif hingga9999999999999,999999diterima; hasil antarunit tidak dibatasi kembali ke batas digit input karena tetapBigInt.

## 5. Kecepatan Rata-rata

Jarak nonnegatif dengan unitm/km/mi international. Durasi elapsed=3600×jam+60×menit+detik (detik rasional). Kecepatan basis m/s=jarakMeter/durasiDetik. Targetm/s,km/hatau mph memakai faktor matriks. Waktu berhenti termasuk jika dimasukkan pada elapsed; tidak ada pilihan moving-only, timestamp, route/ETA atau rekomendasi berkendara. Kecepatan ini kelajuan skalar dari totaljarak, bukan vektor perpindahan.

-150km,2jam30menit0detik→150000/9000=50/3m/s=60km/h,pecahan target60/1. Durasi90jam sah, tidak dibatasi24jam.
-100m,0jam0menit9,58detik→5000/479m/s≈10,438413361…→10,438413m/s. Nilai pecahan ditampilkan; perubahan output ke km/h menghitung ulang dari input asli.
-1km,0jam0menit1detik→3600km/h;1mi/1jam→1mph. Jarak0durasi>0→0. Semua komponenwaktu0invalid pada detik, tanpaInfinity.
-Minjarak0,000001m/makswaktu999999999jam59menit59,999999detik→1/3599999999999999999m/s,positiftiny. Maksjarak9999999999999,999999km/mindurasi0,000001detik→9999999999999999999000m/s. Menit/detik60ditolak;jam1000000000diatasbatas.

## Gate

Contoh dihitung manual dan Python Fraction, bukan output engine. Uji semua pasangan unit/identity/roundtrip/transitivity dari pecahan asli, invers skala, konsistensi affine lewatK, nol mutlak±1tick, error pembulatan/simetri tanda, pecahan berulang, tiny/max/malformed dan denominatornol. Regress76engine lama.

Playwright lima alat/mode/unitswapdanstalereset,invalid/fokus/aria/Enter,SSRcontoh/FAQ/sumber,limalebar320/375/768/1024/1440,hub20load-more/search/canonical/sitemap87/noindex/robots/404,screenshotdesktop/mobile. Target100IDunik/81terbit/20Sehari-hari/5hub/87sitemap. Node22npmci/typecheck/test/build/seluruhe2e; CI,artifactdanPreview READY harusSHAheadidentik. PR Closes#41,tidakmerge/automerge,production/indexingstagingtetap.
