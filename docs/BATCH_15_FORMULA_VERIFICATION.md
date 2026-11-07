# Verifikasi Batch 15: utilitas dan bahan bangunan

Diperiksa 7 November 2026 sebelum implementasi, dari main `d47d44098e9434c3e9eba3c7aad024c3716664d9`. Versi rumus1.0.0. Commit pertama hanya dokumentasi ini. Seluruh tarif, daya sebar, ukuran kemasan, cadangan dan dimensi adalah asumsi pengguna, tanpa preset PLN/PDAM, pajak atau standar kebutuhan material universal.

## Referensi yang benar-benar dibuka

- [US EIA, Measuring electricity](https://www.eia.gov/energyexplained/electricity/measuring-electricity.php): watt mengukur daya, Wh mengukur energi dari daya dikali waktu, kWh=1000Wh; contoh40W selama5jam=0,2kWh. URL DOE Energy Saver yang dicoba memberi404; tidak diklaim terverifikasi atau dijadikan sumber aplikasi. EIA dipakai untuk definisi energi, bukan tarif Indonesia.
- [NIST, SI Prefixes](https://www.nist.gov/pml/owm/metric-si-prefixes): kilo10³,centi10⁻². [NIST SP811 bab4](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-4-two-classes-si-units-and-si-prefixes) dibuka untuk satuan turunan/prefiks. Karena1cm=1/100m,1cm²=1/10000m². Volume memakai m³, luas memakai m², bukan mengonversi panjang langsung menjadi luas.
- [OpenStax Prealgebra2e, Appendix C Geometric Formulas](https://openstax.org/books/prealgebra-2e/pages/c-geometric-formulas): luas persegi panjang=l×w, volume balok=l×w×h dan silinder=πr²h. Diameter dipakai dalam aplikasi sehingga r=d/2.
- [Wolfram Functions, Pi specific value02.03.03.0001](https://functions.wolfram.com/Constants/Pi/03/0001/): deret desimal π yang dibaca pada Input Form. Konstanta aplikasi adalah potongan50digit sesudah koma: `3.14159265358979323846264338327950288419716939937510`, bukan Math.PI.

Tarif progresif, cadangan dan pembelian kemasan diturunkan secara aljabar di bawah. Tidak mengutip kebijakan perusahaan air, daya sebar merek cat atau desain campuran beton yang tidak diverifikasi. Semua contoh adalah skenario input, bukan klaim tarif/produk resmi.

## Domain, representasi dan pembulatan

Semua uang, hasil bagi, luas, volume, ceiling dan penjumlahan baris memakai BigInt/rasional. Number hanya indeks/baris dan jumlah digit tampilan, bukan nilai domain. String desimal titik/koma tanpa pemisah ribuan; bilangan eksponen, nonfinite, negatif, kosong wajib, null/angka JS dan presisi/batas berlebih ditolak. Validasi sintaks menghentikan refinement lintas-field sebelum aritmetika.

- Besaran luas/daya/coverage/kemasan: hingga6digit bulat dan6desimal; nilai maksimum999999,999999. Dimensi keramik cm dan beton m: hingga4digit bulat dan6desimal, maksimum9999,999999. Semua dimensi, coverage dan ukuran kemasan positif. Luas permukaan/lantai dan daya boleh0.
- Jam per hari:0–24 dengan6desimal. Hari1–366 integer, jumlah perangkat/elemen dan isi dus1–10000 integer; lapisan cat1–100 integer. Tarif listrik/air hingga13digit bulat dan4desimal Rp per unit. Volume air/batas kumulatif hingga13digit bulat dan6desimal m³. Biaya tetap air rupiah utuh hingga13digit, kosong/tidak diberikan berarti0. Cadangan0–100% hingga4desimal, kosong/tidak diberikan berarti0.
- Pecahan disimpan n/d dengan d>0, direduksi untuk operasi. Half-up nonnegatif=floor((2n+d)/(2d)); ceiling=floor(n/d)+(n mod d>0?1:0). Ceiling selalu dari pecahan asli, bukan angka tampilan. Nilai0 memberi ceiling0.
- Energi kWh, liter teori/dengan cadangan/sisa dan volume beton ditampilkan4desimal. Luas bersih cat dan liter pembelian dari input tampil6desimal eksak; luas ubin/pembelian keramik4desimal dengan penanda positif kecil. Hitungan kemasan/ubin/dus integer. Cash listrik dan air rupiah utuh half-up sekali. Positif subpresisi tetap diberi arah; cash yang membulat0 tetapRp0 dengan catatan nilai positif<Rp0,50. Tidak memberi tanda positif pada nol eksak.
- Volume blok air6desimal dan tarif4desimal menghasilkan biaya eksak berskala10desimal rupiah. Baris/totals sebelum pembulatan ditampilkan hingga10desimal tanpa membulatkan (nol ekor boleh dihapus). Jumlah biaya baris sama dengan biaya variabel eksak; biaya tetap ditambahkan sekali, baru tagihan akhir dibulatkan. Tidak menjumlah nominal baris yang sudah dibulatkan ke rupiah.

## 1. Biaya Listrik

Daya W adalah per perangkat. E(kWh)=W×jamPerHari×hari×jumlah/1000. Biaya=E×tarifRpPerkWh. Input W dan jam diskalakan10⁶, tarif10⁴. Energi dan biaya dihitung dari pecahan yang sama, masing-masing dibulatkan hanya untuk tampilan. Tidak memakai total jam sebagai jam harian. Daya nominal bisa berbeda dari daya rata-rata/duty cycle atau meter; model tidak menambahkan efisiensi, VA, pajak, admin, minimum tagihan atau reactive power.

1.300W,8jam/hari,30hari,1perangkat,tarif1700:energi72,0000kWh,biayaRp122400.
2.100W,2jam/hari,30hari,3perangkat,tarif1500:energi18,0000kWh,biayaRp27000.
3.1W,1jam,1hari,1perangkat,tarif1:energi0,0010kWh,biaya eksak0,001rupiah→cashRp0(positif sebelum pembulatan).100W,0,5jam,1hari,1perangkat,tarif1700,0001:energi0,0500kWh,biaya85,000005→Rp85.
4.0W atau0jam memberi energi/biaya0. Tarif0 dengan energi positif memberi biaya0.1W×0,000001jam×1×1→10⁻⁹kWh,tidak disamakan dengan nol eksak.0,5kWh×tarif1→Rp1(setengah ke atas).

## 2. Biaya Air progresif

Ada2–8blok input berurutan. Setiap blok mempunyai pilihan batas: bounded dengan batas atas kumulatif U_i>0, atau unbounded hanya pada baris terakhir. Semua batas bounded harus naik ketat. Tarif boleh0 dan tidak harus naik; pengguna menentukan skenario, bukan jadwal resmi. Mode unbounded mengabaikan kolom batas yang tidak aktif, bukan mengartikan string kosong sebagai takhingga. Jika semua blok bounded, usage>U_akhir invalid pada volume; tidak ada sisa volume gratis. Perubahan pilihan menghapus kolom/input tidak aktif dan hasil lama.

Untuk V≥0, L_i=batas sebelumnya (awal0), lebar=U_i−L_i. V_i=min(max(V−L_i,0),lebar); blok akhir unbounded memakai max(V−L_i,0). Intervaluang konsumsi pertama[0,U1],berikutnya(U_sebelum,U_i]; V_i adalah panjang irisan, bukan hitungan endpoint. Dengan cakupan sah, ΣV_i=V secara eksak, semua V_i≥0. C_i=V_i×tarif_i. Variable=ΣC_i; exactTotal=variable+fixed;bill=halfUp(exactTotal). Tarif blok tinggi hanya pada konsumsi di blok tersebut.

1.U=[10,20,unbounded],rates=[3000,5000,7000],fixed10000,V18:volume[10,8,0],biaya[30000,40000,0],variable70000,total/bill80000.
2.V25:porsi[10,10,5],biaya[30000,50000,35000],variable115000,total/bill125000. V0:semua porsi/biaya0,totalfixed10000. V10,001:porsi[10,0,001,0],biaya[30000,5,0],variable30005,total40005.
3.Batas0/duplikat/menurun invalid;unbounded bukan baris terakhir invalid;dua bounded10,20 denganV20sah,V20,000001invalid. Tarif0sah.
4.U=[1,unbounded],rates=[0,5;0,5],V2,fixed0:biaya baris0,5+0,5=1,totalcashRp1. Membulatkan tiap baris dahulu memberi2 yang keliru. V0,000001,rate0,0001 menghasilkan biaya eksak0,0000000001rupiah dan tagihan cash0dengan catatan positif.

## 3. Kebutuhan Cat

A_net=A_gross−A_bukaan, bukaan≤gross. Teori L0=A_net×lapisan/coverage(m²/L per lapis). Kebutuhan cadangan L=L0×(1+waste/100). Kemasan N=ceil(L/ukuranL). Beli=N×ukuranL, sisa=beli−L≥0. Model satu produk, semua lapisan dengan coverage sama. Coverage manual dari asumsi/spesifikasi produk; kondisi substrat, teknik dan kehilangan aktual dapat berbeda.

1.Gross40,bukaan5,lapis2,coverage10,waste10%,kemasan5L:net35m²,teori7L,kebutuhan7,7L,N2,beli10L,sisa2,3L.
2.Gross25,bukaan0,lapis1,coverage10,waste0,kemasan2,5L:net25,teori/kebutuhan2,5L,N1,beli2,5L,sisa0.
3.Gross10,000001,coverage1,lapis1,bukaan/waste0,kemasan5L:teori/kebutuhan10,000001L→tampilan10,0000L tetapiN3,beli15L,sisa4,999999L→tampilan5,0000L. Hasil ceiling tidak berasal dari10,0000. Gross=bukaan memberi net/teori/kebutuhan/N/beli/sisa0. Coverage/kemasan0 dan bukaan>gross invalid.

## 4. Kebutuhan Keramik

Mode tunggal luas lantai m² input, tidak menurunkan dari panjang×lebar ruangan. Dimensi ubin panjang×lebar dalam cm, tidak harus persegi. Area ubin a=panjangCm×lebarCm/10000m². Kuota ubin R=(areaLantai/a)×(1+waste/100); required=ceil(R),boxes=ceil(required/isiDus),purchased=boxes×isiDus,purchaseArea=purchased×a,surplus=purchased−required.

Kebijakan dua ceiling eksplisit membulatkan unit ubin dahulu, lalu dus. Karena isiDus integer, ceil(ceil(R)/k)=ceil(R/k), tetapi implementasi mengikuti hitungan per-ubin agar required dan surplus tetap transparan. Tidak mengklaim hasil berbeda dari bentuk setara yang dihitung secara eksak. Tidak memakai luas ubin/dus tampilan dalam ceiling. Cadangan adalah perkiraan potong/pecah, bukan layout optimizer/nat/orientasi/ruang tak beraturan.

1.Area12,ubin40×40cm→a0,16m²,waste10%,isi6:R82,5,required83,boxes14,purchased84,purchaseArea13,44m²,surplus1.
2.Area10,ubin50×50cm→a0,25,waste0,isi4:R40,required40,boxes10,purchased40,purchaseArea10,surplus0.
3.Area1,000001,ubin100×100cm,waste0,isi1:R1,000001,required2,boxes2,purchased2,area2,surplus0. Area3,ubin30×50cm→a0,15,waste0,isi7:R20,required20,boxes3,purchased21,area3,15,surplus1. Area0menghasilkanrequired/boxes/purchased/area/surplus0;dimensi/isiDus0invalid.

## 5. Volume Beton dan π

1–20elemen, pilihan bentuk wajib per baris. Balok: v=l×w×h×jumlah. Silinder: v=π_approx×diameter²×h×jumlah/4. Semua dimensi m positif hingga4digit bulat/6desimal;jumlah1–10000. Volume dasar B=Σv_i;cadangan E=B×waste/100;total T=B+E. Semua baris dijumlah sebelum membulatkan; baris/base/cadangan/total ditampilkan4desimal. Bentuk balok memakai panjang/lebar/tinggi, silinder diameter/tinggi; kolom bentuk tidak aktif dihapus dari payload, tinggi/jumlah yang sama tetap terjaga.

π_approx=314159265358979323846264338327950288419716939937510 /10⁵⁰. Ini **pendekatan**, bukan nilai π eksak. Potongan50desimal memberi0<π−π_approx<10⁻⁵⁰. Karena d,h<10⁴,jumlah≤10⁴,baris≤20 danfaktorcadangan≤2,koefisien π untuk total semua silinder <20×10⁴×(10⁴)²×10⁴×2/4=10¹⁷m³. Galat absolut total akibat konstantaπ<10⁻³³m³, jauh di bawah kuantisasi tampilan10⁻⁴m³. Ini tidak menjanjikan digit pembulatan sama bila hasil arbitrer tepat di dekat batas half-up; ketidakpastian ukuran lapangan juga tidak dimodelkan. Balok tidak mempunyai galatπ.

1.Dua pelat2×3×0,1,jumlah2 pada satu baris→1,2m³;ditambah kubus1×1×1jumlah1→1m³. B2,2,E0,22 pada10%,T2,42m³. Rincian baris1,2000 dan1,0000;B2,2000/E0,2200/T2,4200.
2.Silinderdiameter1,tinggi1,jumlah1,waste0:B=π_approx/4≈0,7853981633974483m³→0,7854;E0,T0,7854. Diameter2,tinggi1,jumlah1,waste10%:B=π_approx→3,1416,E≈0,314159→0,3142,T≈3,4557519→3,4558.
3.Balok0,000001m tiapdimensi,jumlah1→10⁻¹⁸m³,ditandai positif di bawah0,0001 saat tampilan membulat0. Dua baris volume0,00005 masing-masing memberi base0,0001 walau masing-masing tampil0,0001; jumlah tampilan bukan total.0baris,21baris,dimensi0/negatif/jumlah0invalid. Maks20baris dimensi9999,999999/jumlah10000 tetap BigInt; besaran tidak dikonversiNumber.

Model hanya estimasi kuantitas bruto, tanpa desain campuran, konversi sak, kapasitas truk, minimum order atau penilaian struktur. Pengukuran, rongga, kondisi lokasi dan metode pengecoran tetap di luar model.

## Gate

Vektor di atas diperiksa manual serta Python Fraction terpisah dari engine. Uji energi/tarif, konservasi volume blok dan biaya eksak, coverage/monotonic boundaries, ceiling minimal cat/ubin/dus, pembelian/sisa, penjumlahan geometri asli, intervalπ, nol/max/tiny/invalid dan properti input terbatas. Playwright seluruh5form,barisair2–8/beton1–20,conditionalfields/keyboard/fokus/stale,SSR,hub15denganload-more,search/canonical/noindex/robots/404,limalebar320–1440dan screenshotdesktop/mobile.

Target100unik/76terbit/15Sehari-hari/5hub/82sitemapURL;71engine lama dipertahankan. Node22 npmci/typecheck/test/build/e2e,CI sukses,artifact danPreview READY harus terikatSHA PR. Tidakmerge/automerge,production/indexingstagingtidakdiubah.
