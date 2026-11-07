# Verifikasi Batch 13: harga, tagihan dan persen

Diperiksa 7 November 2026 sebelum implementasi. Main acuan 08dba32f. Versi rumus 1.0.0. Semua harga, subtotal dan biaya adalah input manual; tidak ada tarif pajak, voucher toko, konversi massa-volume atau aturan pembulatan merchant bawaan.

## Sumber yang berhasil diperiksa

- [OpenStax Prealgebra 2e 6.2](https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent): bagian = persen × basis; persen = bagian/basis; perubahan terhadap nilai awal.
- [OpenStax 6.3](https://openstax.org/books/prealgebra-2e/pages/6-3-solve-sales-tax-commission-and-discount-applications): harga sesudah potongan = harga awal dikurangi diskon. Penerapan berulang memberi produk faktor sisa, bukan penjumlahan diskon.
- [NIST SI Prefixes](https://www.nist.gov/pml/owm/metric-si-prefixes): kilo=10³ dan milli=10⁻³. Normalisasi keluarga massa/volume memakai faktor integer/rasional eksak, tidak asumsi densitas.
- [NIST SP811 bab5, Units Outside SI](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si): liter sebagai satuan volume yang diterima. mL dan L dalam keluarga volume, terpisah dari massa dan count.
- [Mike Kenyon & David Lippman, Math in Society: Apportionment, halaman75–76](https://www.opentextbookstore.com/mathinsociety/2.5/Apportionment.pdf): metode Hamilton membagi kuota, mengambil lower quota/floor, lalu sisa satuan ke bagian pecahan terbesar. Adaptasi uang di sini diturunkan di bawah. Tidak menerapkan syarat politik minimal satu kursi pada orang dengan bobot nol; alokasi uang boleh nol.

Halaman LibreTexts Hamilton juga berhasil dibaca pada bagian algoritme. AMS 403, Census path dan OpenStax 5.10 tidak berhasil diakses; tidak dipakai sebagai sumber terverifikasi. Model alokasi bukan aturan hukum atau pembebanan pajak restoran.

## Domain dan presisi

- Harga awal/kemasan, subtotal item per orang, service dan pajak: rupiah utuh nonnegatif hingga13digit (maks9.999.999.999.999). Kosong/negatif/desimal rupiah/eksponen/nonfinite/pemisah ribuan/null/angka JS ditolak.
- Diskon1–20 baris, masing-masing0–100%, hingga4desimal persen. Faktor eksak memakai skala1.000.000 untuk pecahan100%. Kupon nominal, minimum belanja, pajak otomatis dan pembulatan per tahap tidak termasuk.
- Kemasan2–10baris; ukuran positif hingga13digit bulat dan3desimal, termasuk pcs pecahan bila ukuran barang relevan. Keluarga: massa mg/g/kg →perkg, volume mL/L →perL, countpcs →perpcs. Campuran keluarga ditolak pada unit baris yang tidak cocok dengan baris pertama.
- Orang2–20baris, masing-masing satu **subtotal seluruh item orang tersebut**, bukan daftar item, item berbagi atau pembagian otomatis satu item. Label Orang1…n mengikuti urutan visual. Biaya service dan pajak nominal dibayar sekali terpisah; tidak menghitung persentase pajak ulang atas item yang mungkin tax-inclusive.
- Persen umum: N/A/B bertanda maksimal13digit bulat dan6desimal; X persen bertanda maksimal9digit bulat dan4desimal, boleh >100%. Rasio menerima B negatif nonnol, dengan tanda matematika biasa. Perubahan Persen sengaja hanya nilai awal/akhir nonnegatif,13digit bulat dan6desimal. Awal0 memberi persen undefined tetapi delta/akhir tetap tampil.
- Semua aritmetika uang, jumlah, persen dan perbandingan memakai BigInt rasional; tidak ada Number untuk nilai domain. Number hanya indeks/baris terbatas. Kuantisasi nearest dengan tie menjauh dari nol: magnitude q=abs(N) div D; tambah1 jika2*(abs(N) mod D)>=D, lalu pasang tanda.
- Diskon final cash ke rupiah sekali; rincian model tahap ke sen hanya untuk dibaca. Unit price tampil2desimal rupiah, faktor kumulatif6desimal, diskon model/kas2desimal persen. Persen umum result4desimal dan persenrasio4desimal; perubahan persennya4desimal, delta dari input6desimal tetap eksak. Nilai nonnol yang membulat0 mempertahankan tanda/<increment. Undefined tidak ditampilkan0/Infinity.

## 1. Diskon bertahap

Untuk harga P dan diskon d_i sebagai pecahan, faktor kumulatif f_k=produk(1−d_i), final eksak=P*f_n, final cash=halfUp(final eksak) rupiah. Penghematan kas=P−cash. Potongan **model**=(1−f_n)*100%, ditentukan faktor dan tetap terdefinisi saat P0. Potongan kas=(P−cash)/P*100% bilaP>0, jikaP0 undefined. Rincian tahap: diskon input%, faktor kumulatif (6desimal diagnostik), P*f_k (sen diagnostik). Rincian tidak dipakai membulatkan tahap selanjutnya.

1. P100000, diskon10%,20%: tahap1 f0,9 dan model90000,00; tahap2 f0,72 dan72000,00. Final cash72000, hemat28000, potonganmodel28,00%, potongankas28,00%, bukan30%.
2. P1,d50%: f0,5,model0,50, cash1,hemat0,model50,00%,kas0,00%. P1,d50%,50%: f0,5 lalu0,25, model0,50 lalu0,25; cash0,hemat1,model75%,kas100%. Ini konsekuensi cash rounding sekali, bukan janji diskon efektif kas sama dengan model.
3. P100,d100%: f0,model0,cash0,hemat100,kedua100%. d0 mempertahankanP. P0,d10%,20% memberi cash/hemat0,model28%,kasundefined. Faktor positif sangat kecil diberi tanda <0,000001 bila tampil0; model harga nonnol di bawah sen tetap disebut positif. Finalcash0 dari nominal kecil bukan aritmetika negatif.

## 2. Harga per Satuan

Dengan ukuran asli q (3desimal) dan faktor konversi c keunitumum, ukuran normal=q*c, harga satuan u=harga/(q*c). Faktor ke kg: mg1/1.000.000,g1/1.000,kg1. Faktor keL:mL1/1.000,L1; pcs1. Jika q disimpan Q=q*1000 dan c=a/b, u=harga*1000*b/(Q*a). Harga sen tampilan=round(u*100), tetapi ranking memakai cross-product pecahan u, bukan angka tampilan.

Semua kemasan dengan u minimum eksak ditampilkan sebagai pemenang biaya satuan; tidak ada winner tunggal rekaan saat tie. Referensi relatif adalah **unit price tertinggi** M di antara semua kemasan. Penghematan relatif kemasanj=(M−u_j)/M*100%, jikaM>0; seluruhharga0 memberi undefined. Summary penghematanterbaik memakai minimum terhadapmaximum, bukan perbandingan ukuran/total harga. Jika tampilan sama tetapi u berbeda, beri catatan near-tie dan tetap pilih minimum eksak. Tidak mengukur kualitas, merek atau kebutuhan pengguna.

1. A12000/500g ->0,5kg,u24000/kg;B22000/1kg ->u22000/kg. B lebih murah, savingsA0%,B(24000−22000)/24000*100=8,333…% ->8,33%. Summary minimum22000,maximum24000,best8,33%.
2. A5000/250mL ->0,25L,u20000/L;B8000/500mL ->0,5L,u16000/L. B lebih murah,savingsA0%,B20%; summary16000/20000/20%. mg1000=g1=kg0,001;0,001pcs validukuranpecahan, tanpa mencampur denganmassa.
3. A1/1000pcs dan B1/1001pcs: uA0,001,uB1/1001≈0,000999, keduanya positif<0,01perpcs pada presisi uang. B tetap lebih murah;best savings100/1001%=0,099900…% ->0,10%. A12000/500g danB24000/1kg tieexact24000, savings0%. Harga0valid:0vspositif memberi minimum0,savings100%;semua0savingsundefined. kg/mL ataupcs/g invalid; ukuran0invalid.

## 3. Bagi Tagihan: subtotal per orang

Input s_i subtotal semua item milik orangi (sudah dijumlah pengguna), sharedF=service+tax nominal, S=sum s_i, grand=S+F. Tidak mengklaim item-level split atau berbagi satuitem. Mode equal membagi **biaya bersama saja**, item orangtetapmiliknya; bobot w_i=1,W=n. Mode proportional w_i=s_i,W=S. W0/F>0 pada modeproportional ditolak; W0/F0 memberi extras0 dan total0. S_i0 mendapat0 biaya proporsional bilaS>0, tetapi boleh mendapat biaya equal.

Exactquota x_i=F*w_i/W. Ambil a_i=floor(x_i), remainder r_i=(F*w_i) mod W. R=F−sum a_i integer0<=R<n. Urutkan remainder terbesar, tie dipecah urutan visual Orang1…n; tambahRp1 padaRbaristeratas. Extrae_i=a_i+bonus_i; share_i=s_i+e_i. Karena sum w_i=W, sum x_i=F sehingga jumlah tambahan unit tepatR dan sum shares=S+F secara eksak. Setiap e_i adalahfloor/ceilquota dannonnegatif; galatkurangdariRp1, tidak ada uang hilang/duplikat. Service dan tax digabung lalu dialokasikan **sekali**, tidak dibulatkan masing-masing.

Urutan visual adalah aturan tie, bukan identitas nama. UI menyimpan key/ID baris stabil ketika tambah/hapus agar nilai/fokus tidak tertukar. Mengubah urutan input dapat memindahkan bonusRp1 saat remainder seri; jika tidak seri, memindah orang beserta subtotal mempertahankan bagiannya. Tidak ada drag-sort tersembunyi. Alokasi diulang dari input, bukan hasil tampilan lama.

1. Subtotal10000,20000,30000;service3,tax4,F7,prop: quota7/6,7/3,7/2,floor1,2,3; sisa1 keorang3,extras1,2,4. Shares10001,20002,30004;S60000,F7,grand60007 dan totalteralokasi60007;selisihrekonsiliasi0.
2. Subtotal10000,20000,30000;F10,equal:quota10/3masing-masing,extras4,3,3. Shares10004,20003,30003,grand60010,total60010,selisih0. Dua orangsubtotal0,0,F1,equal ->shares1,0 sesuaiurutanties.
3. Subtotal0,1,2,F2,prop ->extras0,1,1;shares0,2,3,total5. Subtotal0,0,F0,prop ->0,0,total0. Subtotal0,0,F1,prop invalid. Fmaks dan subtotalmaks tetapBigInt; produk kuota F*w dapat melebihi safeintegerNumber, walaupun total tagihan pada batas ini masih lebih kecil; semua tetap BigInt.

## 4. Persen: dua mode

A: Berapa X% dari N? result=N*X/100. N signed6desimal,X signed4desimal, result4desimal. Persen>100% dan tanda negatif adalah operasi aritmetika umum, bukan diskon toko. B: A adalahberapa% dariB? result=A/B*100%, Bsignednonnol, output4desimal. Pecahan denganBnegatif dinormalisasi tanda; tidak ada interpretasi laba/pertumbuhan terhadapbasisnegatif. Input0/0 invalid, bukan0.

1. X15,N200 ->30,0000;X12,5,N40 ->5,0000;X−12,5,N40 ->−5;X15,N−200 ->−30.
2. A3,B8 ->37,5000%;A0,B8 ->0,0000%;A−3,B8 ->−37,5%;A3,B−8 ->−37,5%;A−3,B−8 ->37,5%.
3. X0,5,N0,01 ->0,00005 ->0,0001 (tie); negatif memberi−0,0001. N0,000001,X0,0001 memberiresult0,000000000001 positifdi bawah0,0001. A0,000001/Bmaks memberi persenpositifdi bawah0,0001%. B0 invalid.

## 5. Perubahan Persen

Input awal O dan baru N **nonnegatif** desimal6. Delta=N−O, disimpan/tampilhingga6desimal eksak (trim nol tidak menghilangkan presisi). JikaO>0, persen=Delta/O*100%, output4desimal bertanda; O0 memberiundefinedpersen tetapiDelta,N,Otetaptersedia. Ini berbeda dari dua bilangan bebas pada Persen dan dari integerfollowers diPertumbuhanPengikut. Tidak mendukung baseline negatif atau interpretasiabs(basis).

1. O100,N125 ->delta+25,persen+25,0000%;100→80 ->−20,−20%;100→0 ->−100,−100%.
2. 0→100 ->delta+100,akhir100,persenundefined;0→0 ->delta0,akhir0,persenundefined.100→100 ->delta0,persen0,0000%.
3. 32→33 memberi+1,+3,1250%;32→31 memberi−1,−3,1250%. O9999999999999,N9999999999998,999999 ->delta−0,000001 eksak danpersennegatiftiny; tanda tidak dihilangkan. O0,000001,Nmaks memberi persensangatbesar tanpa Numberoverflow. Awal/baru negatif ditolak.

## Gate

Fixture independen di atas diturunkan melalui pecahan/manual dan Python Fraction untuk kuota, bukan output engine. Tes konservasi semua alokasi, floor/ceilquota, sisa integer, tie/urutan/permute, unit cross-products/tie/near-tie, faktor diskon vs cash rounding, mode persen signed dan perubahanawal0, batas/null/malformed. Regresi61engine. Browser lima route/enam alur persen, dynamic barismin/max/key/fokus/select/stale, tabel/caption/keyboard, SSR sumber/FAQ, hub/nav/search/canonical/noindex/robots/404, lima lebar320–1440 dan screenshotdesktop/mobile. Target100unik/66terbit/5Sehari-hari/5hub/72sitemapURL. Tidakmerge/automerge atauubahproduction/indexingstaging.
