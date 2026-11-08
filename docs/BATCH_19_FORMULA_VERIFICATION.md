# Verifikasi hukum dan rumus Batch19

Versi model/data1.0.0; diperiksa8November2026. Base main b749c4d1f167479d924901236a8b13d341540d39. Dokumen ini dibuat dan di-commit sebelum implementasi. Semua angka pajak adalah estimasi terbatas atau simulasi manual, bukan penetapan otoritas, SPT, PIB atau SPPT.

## Register sumber primer dan tanggal

| Sumber yang dibaca | Bagian | Berlaku / cakupan |
| --- | --- | --- |
| [PP58/2023 naskah DJP](https://pajak.go.id/id/peraturan/tarif-pemotongan-pajak-penghasiian-pasal-21-atas-penghasilan-sehubungan-dengan-pekerjaan), [lampiran resmi15halaman](https://pajak.go.id/sites/default/files/lampiran/Lampiran%20PP58TAHUN2023.pdf) | Pasal2(3)–(5),5; LampiranA/B/C seluruhnya | 1Januari2024 menurut Pasal5, bukan tanggal penetapan27Desember2023 pada metadata JDIH. Status DJP aktif; riwayat JDIH dibaca, tidak ditemukan perubahan tabel A/B/C pada pemeriksaan ini. |
| [PMK168/2023 naskah DJP](https://pajak.go.id/id/peraturan/petunjuk-pelaksanaan-pemotongan-pajak-atas-penghasilan-sehubungan-dengan-pekerjaan-jasa-1) | Pasal5,7–10,13,15,21–22,25 | 1Januari2024. Bruto seluruh penghasilan masa, biaya jabatan, iuran sah, PTKP awal tahun, PKP ribuan ke bawah, masa akhir dan pengembalian kelebihan selainDTP. |
| [UU7/2021 HPP naskah DJP](https://pajak.go.id/id/peraturan/harmonisasi-peraturan-perpajakan) | Pasal3 perubahan UU PPh Pasal7/17; Pasal17(1) penutup | PPh mulai Tahun Pajak2022; lapisan5/15/25/30/35%. |
| [PMK101/2016 naskah JDIH](https://jdih.kemenkeu.go.id/api/download/FullText/2016/101~PMK.010~2016Per.pdf), [DJP](https://pajak.go.id/id/peraturan/penyesuaian-besarnya-penghasilan-tidak-kena-pajak-2) | Pasal1,3,5 | Diundangkan27Juni2016, besaran berlaku Tahun Pajak2016. PTKP54juta, tambahan kawin4,5juta dan tanggungan4,5juta maksimal3. |
| [PMK105/2025 DTP2026 naskah DJP](https://www.pajak.go.id/id/peraturan/pajak-penghasilan-pasal-21-atas-penghasilan-tertentu-yang-ditanggung-pemerintah-dalam-0) | Pasal2–7, penutup | Diundangkan31Desember2025 (ditetapkan29Desember2025), insentif masaJan–Des2026. Bukan perubahan universal TER; KLU, identitas dan penghasilan menentukan fasilitas. FasilitasDTP termasuk PMK10/2025 jo72/2025 dan peserta magang PMK6/2026 tidak diotomatisasi. |
| [PMK144/2022 naskah JDIH](https://jdih.kemenkeu.go.id/api/download/dc898419-85c0-4fe3-a2e8-c3770c034e16/144~PMK.04~2022.pdf), [FAQ DJBC](https://www.beacukai.go.id/faq-impor-nilai-pabean-untuk-penghitungan-bea-masuk) | Pasal2,5–9,21,41; lampiranA | 1Januari2023. CIF dengan tambahan hanya bila belum termasuk; nilai transaksi harus memenuhi syarat. Kurs harus KMK/NDPBM pada masa PIB, bukan kurs pasar. |
| [PMK4/2025, metadata JDIH](https://www.jdih.kemenkeu.go.id/dok/pmk-4-tahun-2025/overview), [pemberitahuan Kemenkeu](https://www.kemenkeu.go.id/informasi-publik/publikasi/berita-utama/Kemenkeu-Terbitkan-PMK-4-2025) | Perubahan kedua PMK96/2023 barang kiriman | Barang kiriman memiliki aturan khusus mulai5Maret2025. Tidak mengambil tarif dari metadata/ringkasan: seluruh barang kiriman/de-minimis, penumpang, preferensi, cukai/PPnBM, antidumping dan pembebasan di luar cakupan hitung ini. |
| [Kerangka HKPD melalui PP35/2023 naskah primer](https://jdih.kemenkeu.go.id/api/download/06195e1e-c66b-4254-b3b0-877cfa443aa3/35TAHUN2023PP.pdf) | PP35 Pasal12–13 (PBB),18 (BPHTB),55 | PP35 diundangkan16Juni2023. Persentase PBB setelah NJOPTKP ditetapkan Perkada; tidak menetapkan tarif Jakarta untuk daerah lain. |
| [PerdaDKI1/2024 PDF primer](https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2024PERDA00311.pdf) | Pasal31–36,37–41,118 | 5Januari2024. NJOPTKP60juta satu objek/WP, PBB0,5% atau pangan/ternak0,25%; BPHTB5%, NPOPTKP250juta perolehan pertama,1miliar waris/hibah wasiat hubungan tertentu. NJOP tahun perolehan menjadi floor NPOP. |
| [PergubDKI17/2024 PDF primer](https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2024PERGUB003117.pdf) | Pasal1(8),2–5 | **30Mei2024** pada halaman bertanda tangan (penetapan/pengundangan), hunian40%, selain hunian60%, setelah NJOPTKP. Lapisan teks PDF salah terbaca31Mei; tanggal diverifikasi visual halaman4, tidak menyalin ekstraksi. Tanah kosong selainhunian. |
| [PergubDKI16/2024 PDF primer](https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2024PERGUB003116.pdf) | Pasal3–6 danpenutup | Insentif khusus PBB tahun2024, antara lain hunian≤2miliar OP/NIK dan satu objek; pengurangan memerlukan fakta SPPT. Bukan bagian dari hasil bruto sebelum fasilitas. |
| [PergubDKI23/2023 PDF primer](https://jdih.jakarta.go.id/link/download-fulltext/13650) | Pasal2–4 danpenutup | 28Agustus2023; pembebasan BPHTB rumah tapak OP pertama NPOP≤2miliar, perlu prosedur/fakta. Kasus potensial ini ditahan dalam mode dasar biasa, tidak diberi angka bruto yang bisa disalahartikan sebagai tagihan. |
| [Kepgub281/2025 primer](https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2025KEPGUB0031281.pdf) | DiktumKEEMPAT; lampiran | Berlaku8April2025; fasilitas PBB2025 berbeda. Tidak diterapkan ke2024 atau2026. |
| [Kepgub339/2026 primer](https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2026KEPGUB0031339.pdf) | Halaman3–6, diktumKEEMPAT/lampiran dibaca visual | Berlaku1April2026; rumah tapak≤2miliar/rumah susun≤650juta, NIK, satuobjek; pengurangan berbasisSPPT dan diskon tanggal bayar. Tidak diotomatisasi. |
| [Kepgub450/2026 primer Bapenda](https://bapenda.jakarta.go.id/peraturan-perpajakan/unduh/kepgub-nomor-450-tahun-2026-tentang-kriteria-pemberian-pengurangan-dan-pembebasan-pokok-bea-perolehan-hak-atas-tanah-dan-bangunan) | Halaman3–6, diktumKETIGA/KEEMPAT/lampiran dibaca visual | Ditetapkan/berlaku13Mei2026, mencabut840/2025. Banyak kriteria pengurangan75%/50% serta pembebasan; bukan sekadar5%×NPOP. Tahun2025/2026 BPHTB ditahan, tidak menebak fasilitas. |

Tanggal snapshot bukan tanggal pencabutan. Link JDIH /view yang kadang hanya menampilkan shell dan ringkasan AI tidak digunakan sebagai teks hukum. Naskah/halaman ditinjau, termasuk sampel visual tabel TER halaman3/6/14 untuk memperbaiki urutan hasil ekstraksi. Pencarian perubahan terbaru dilakukan pada DJP/JDIH/Bapenda; ketiadaan temuan bukan jaminan tidak ada perubahan. Cakupan yang belum terautentikasi ditahan, bukan diekstrapolasi.

## Cakupan dan model

1. TER: pegawai tetap swasta DN, kewajiban subjektif penuhJan–Des, satu pemberi kerja, status PTKP awal tahun dan identitas valid terverifikasi, seluruh bruto rupiah diklasifikasikan, bukanDTP/natura/pengecualian. Masa2024-01 sampai2026-11 saja; masaakhir harusDesember dan bulan yang dihitung harusJan–Nov. Berhenti lebih awal, masaakhir, fasilitas atau fakta belum lengkap → status tanpa angka dan tautan rekonsiliasi. TER=gross×rate/100, tidak mengurangi PTKP/biaya jabatan setiap bulan.
2. Rekonsiliasi: agregat payroll setahun yang telah dicocokkan, pegawai penuh12bulan satu pemberi kerja dan subjektif penuh tahun, finalDesember; tahun2024/2025 saja. Tahun2026 belum selesai pada snapshot: ditahan, bukan mengklaim gaji masa depan aktual. Penghasilan tidak teratur/THR termasuk bruto terverifikasi. Pindah pemberi kerja, paruh tahun/subjektif/ekspatriat,DTP/natura/statusPTKPbelumjelas di luar cakupan. Biaya jabatan=min(5%×gross,6juta); cap500ribu per bulan tercatat tersendiri, tidak mengklaim partial-year otomatis. Iuran pensiun/hari tua dan zakat wajib melalui pemberi kerja yang memenuhi Pasal10 diberi input terpisah dan konfirmasi. Neto=gross−jabatan−iuran−zakat; pengurang>gross ditolak. PKP=floor(max(neto−PTKP,0)/1000)×1000. Progresif per lapisan; selisih=pajaksetahun−potonganaktualJan–Nov. Negatif adalah kelebihan pemotongan untuk diproses pemotong dengan bukti menurut Pasal21, bukan refund otomatis/negative payable.
3. Impor **SIMULASI MANUAL SAJA**, bukan tarif hukum/penetapan PIB. Reguler imporuntukdipakai, HS dinyatakan pengguna, nilai transaksi dan cakupan terkonfirmasi, tanggal2023-01-01–2026-11-08. Mata uangUSD/EUR/JPY/IDR eksplisit; kurs KMK input bersama sumbernomor, awal/akhir masa≤7hari dan tanggaldeklarasi di dalamnya; tidak mengunduh kurs live. FOB→harga+freight+insurance; CFR→harga+insurance (freight wajib0); CIF/manualCIF→harga (freight/insurance wajib0). Seluruh komponen satu mata uang; cents dipertahankan. Tidak menambah asuransi/freight tebak0,5% atau menilai assist/royalti. BMmanual=nilaiIDR×rateBM. DasarPDRImanual dipilih eksplisit nilaiIDR atau nilaiIDR+BM; PPNmanual=dasarpilihan×proporsiDPPmanual×tarifmanual; PPh22manual=dasarpilihan×tarifmanual. Tidak ada preset universal11%, tarifHS atau tarifPPh22 otomatis. PPnBM/cukai/beamasuktambahan/preferensi/consignment/klasifikasiatauKMKbelumjelas → status tanpa nominal. Totaleksak=BM+PPN+PPh22; totalcash=jumlahcash komponen (hindari rekonsiliasi palsu).
4. BPHTB: DKI saja, tanggalterutang5Jan–31Des2024 saja (PPJB/AJB/pendaftaranwaris/lelang sesuaiPasal41). Perolehanpertama terkonfirmasi; jualbeli/lelang memakai nilai transaksi, waris/hibahwasiat memakai nilai pasar. NPOP=max(nilai perolehan yang sah,NJOP tahunperolehan). NPOPTKP250juta; waris/hibahwasiat hanya OP keluarga garis lurus1derajat/suamiistri terkonfirmasi memakai1miliar. Hibahbiasa/bentuklain/firstunknown/fasilitasunknown ditahan. Rumah tapakOPpertama≤2miliar yang berpotensiPergub23 ditahan. Hasil subset biasa dilabeli **estimasi dasar sebelum fasilitas, bukan BPHTB final**; tidak mencampur PPhpenjual/notaris. Tidak menghitung pembayaran fasilitas/relief.
5. PBB-P2: DKI tahun2024 saja, NJOPbumi danbangunan resmi kondisi1Januari dikonfirmasi. BukanPBBpusat/perkebunan/perhutanan/pertambangan/objekdikecualikan. NJOPTKP60juta hanya bila objekini dipastikan mendapat alokasi satuobjekWP; jika dialokasikan diobjeklain,0; takjelas ditahan. Dasar=max(0,NJOPbumi+bangunan−pengurang)×40%hunianatau60%selainhunian/tanahkosong/panganternak. Tarifumum0,5%; panganternak0,25%hanya bila klasifikasi resmi dikonfirmasi. Hasil hanya **PBBbruto sebelum fasilitas**, pengguna harus memilih pemahaman ini. Tidak mengklaimSPPTpayable, termasukRp880ribu pada hunian500juta yang mungkin memperoleh pembebasan. ModepenghitunganSPPT/fasilitas, wilayah/tahunlain dan fakta belumterverifikasi→status tanpaangka.

Input uang IDR integer0..13digit, valas hingga6desimal dan13digit utuh; tarif/proporsi0..100 dengan6desimal, kurs positif hingga6desimal. Tidak memakai Number untuk uang, rate, irisan tarif atau pembulatan. Pecahan BigInt disederhanakan sebelum operasi. Konvensi **tampilan cash** model: half-away-from-zero satu kali per hasil/komponen; bukan klaim pembulatan resmi SPT/PIB/SPPT. PKP ribuan ke bawah adalah aturan hukum terpisah. Tampilkan eksak, cash dan adjustment. Nol terhitung berbeda dari status tanpa angka. Perubahan input menghapus hasil/ledger lama.

## PTKP dan progresif lengkap untuk cakupan

| StatusPTKP | PTKP(Rp/tahun) | TER |
| --- | --- | --- |
| TK/0 | 54000000 | A |
| TK/1 | 58500000 | A |
| TK/2 | 63000000 | B |
| TK/3 | 67500000 | B |
| K/0 | 58500000 | A |
| K/1 | 63000000 | B |
| K/2 | 67500000 | B |
| K/3 | 72000000 | C |

K/I dan klasifikasi PTKP belumterverifikasi tidak didukung, bukan dipetakan secara tebakan. Khusus karyawati kawin ikuti fakta Pasal9, bukan sekadar label menikah.

| PKP irisan(Rp) | Tarif |
| --- | --- |
| 0–60000000 | 5% |
| >60000000–250000000 | 15% |
| >250000000–500000000 | 25% |
| >500000000–5000000000 | 30% |
| >5000000000 | 35% |

## TER A/B/C lengkap

Disalin dari lampiran resmiPP58/2023, A44baris halaman1–5, B40baris halaman6–10, C41baris halaman10–14. Semua input integer rupiah: kolom bawah dan atas **inklusif**, baris pertama mulai0; baris berikutnya=atassebelumnya+1. ∞ adalah tanpa batas atas hukum (batas input model tetap13digit). Persen dicatat hingga2desimal; kode menyimpan basispoints/10000. Tidak ada gap/overlap.

### KategoriA

| Bawah(Rp,inklusif) | Atas(Rp,inklusif) | Tarif(%) |
| --- | --- | --- |
| 0 | 5400000 | 0.00 |
| 5400001 | 5650000 | 0.25 |
| 5650001 | 5950000 | 0.50 |
| 5950001 | 6300000 | 0.75 |
| 6300001 | 6750000 | 1.00 |
| 6750001 | 7500000 | 1.25 |
| 7500001 | 8550000 | 1.50 |
| 8550001 | 9650000 | 1.75 |
| 9650001 | 10050000 | 2.00 |
| 10050001 | 10350000 | 2.25 |
| 10350001 | 10700000 | 2.50 |
| 10700001 | 11050000 | 3.00 |
| 11050001 | 11600000 | 3.50 |
| 11600001 | 12500000 | 4.00 |
| 12500001 | 13750000 | 5.00 |
| 13750001 | 15100000 | 6.00 |
| 15100001 | 16950000 | 7.00 |
| 16950001 | 19750000 | 8.00 |
| 19750001 | 24150000 | 9.00 |
| 24150001 | 26450000 | 10.00 |
| 26450001 | 28000000 | 11.00 |
| 28000001 | 30050000 | 12.00 |
| 30050001 | 32400000 | 13.00 |
| 32400001 | 35400000 | 14.00 |
| 35400001 | 39100000 | 15.00 |
| 39100001 | 43850000 | 16.00 |
| 43850001 | 47800000 | 17.00 |
| 47800001 | 51400000 | 18.00 |
| 51400001 | 56300000 | 19.00 |
| 56300001 | 62200000 | 20.00 |
| 62200001 | 68600000 | 21.00 |
| 68600001 | 77500000 | 22.00 |
| 77500001 | 89000000 | 23.00 |
| 89000001 | 103000000 | 24.00 |
| 103000001 | 125000000 | 25.00 |
| 125000001 | 157000000 | 26.00 |
| 157000001 | 206000000 | 27.00 |
| 206000001 | 337000000 | 28.00 |
| 337000001 | 454000000 | 29.00 |
| 454000001 | 550000000 | 30.00 |
| 550000001 | 695000000 | 31.00 |
| 695000001 | 910000000 | 32.00 |
| 910000001 | 1400000000 | 33.00 |
| 1400000001 | ∞ | 34.00 |

### KategoriB

| Bawah(Rp,inklusif) | Atas(Rp,inklusif) | Tarif(%) |
| --- | --- | --- |
| 0 | 6200000 | 0.00 |
| 6200001 | 6500000 | 0.25 |
| 6500001 | 6850000 | 0.50 |
| 6850001 | 7300000 | 0.75 |
| 7300001 | 9200000 | 1.00 |
| 9200001 | 10750000 | 1.50 |
| 10750001 | 11250000 | 2.00 |
| 11250001 | 11600000 | 2.50 |
| 11600001 | 12600000 | 3.00 |
| 12600001 | 13600000 | 4.00 |
| 13600001 | 14950000 | 5.00 |
| 14950001 | 16400000 | 6.00 |
| 16400001 | 18450000 | 7.00 |
| 18450001 | 21850000 | 8.00 |
| 21850001 | 26000000 | 9.00 |
| 26000001 | 27700000 | 10.00 |
| 27700001 | 29350000 | 11.00 |
| 29350001 | 31450000 | 12.00 |
| 31450001 | 33950000 | 13.00 |
| 33950001 | 37100000 | 14.00 |
| 37100001 | 41100000 | 15.00 |
| 41100001 | 45800000 | 16.00 |
| 45800001 | 49500000 | 17.00 |
| 49500001 | 53800000 | 18.00 |
| 53800001 | 58500000 | 19.00 |
| 58500001 | 64000000 | 20.00 |
| 64000001 | 71000000 | 21.00 |
| 71000001 | 80000000 | 22.00 |
| 80000001 | 93000000 | 23.00 |
| 93000001 | 109000000 | 24.00 |
| 109000001 | 129000000 | 25.00 |
| 129000001 | 163000000 | 26.00 |
| 163000001 | 211000000 | 27.00 |
| 211000001 | 374000000 | 28.00 |
| 374000001 | 459000000 | 29.00 |
| 459000001 | 555000000 | 30.00 |
| 555000001 | 704000000 | 31.00 |
| 704000001 | 957000000 | 32.00 |
| 957000001 | 1405000000 | 33.00 |
| 1405000001 | ∞ | 34.00 |

### KategoriC

| Bawah(Rp,inklusif) | Atas(Rp,inklusif) | Tarif(%) |
| --- | --- | --- |
| 0 | 6600000 | 0.00 |
| 6600001 | 6950000 | 0.25 |
| 6950001 | 7350000 | 0.50 |
| 7350001 | 7800000 | 0.75 |
| 7800001 | 8850000 | 1.00 |
| 8850001 | 9800000 | 1.25 |
| 9800001 | 10950000 | 1.50 |
| 10950001 | 11200000 | 1.75 |
| 11200001 | 12050000 | 2.00 |
| 12050001 | 12950000 | 3.00 |
| 12950001 | 14150000 | 4.00 |
| 14150001 | 15550000 | 5.00 |
| 15550001 | 17050000 | 6.00 |
| 17050001 | 19500000 | 7.00 |
| 19500001 | 22700000 | 8.00 |
| 22700001 | 26600000 | 9.00 |
| 26600001 | 28100000 | 10.00 |
| 28100001 | 30100000 | 11.00 |
| 30100001 | 32600000 | 12.00 |
| 32600001 | 35400000 | 13.00 |
| 35400001 | 38900000 | 14.00 |
| 38900001 | 43000000 | 15.00 |
| 43000001 | 47400000 | 16.00 |
| 47400001 | 51200000 | 17.00 |
| 51200001 | 55800000 | 18.00 |
| 55800001 | 60400000 | 19.00 |
| 60400001 | 66700000 | 20.00 |
| 66700001 | 74500000 | 21.00 |
| 74500001 | 83200000 | 22.00 |
| 83200001 | 95600000 | 23.00 |
| 95600001 | 110000000 | 24.00 |
| 110000001 | 134000000 | 25.00 |
| 134000001 | 169000000 | 26.00 |
| 169000001 | 221000000 | 27.00 |
| 221000001 | 390000000 | 28.00 |
| 390000001 | 463000000 | 29.00 |
| 463000001 | 561000000 | 30.00 |
| 561000001 | 709000000 | 31.00 |
| 709000001 | 965000000 | 32.00 |
| 965000001 | 1419000000 | 33.00 |
| 1419000001 | ∞ | 34.00 |

## Vektor independen sebelum implementasi

- PP58 contohK/0 bruto10juta→kategoriA, bracket9.650.001–10.050.000,2%,200.000/bulanJan–Nov. Tahun2024gross120juta−jabatan6juta−iuran1,2juta=112,8juta; PTKP58,5juta; PKP54,3juta; pajak2.715.000; dipotong2,2juta; selisihDes515.000. Bukan TER atas gajiDes.
- VariasiTHR: K/0 Jan–Nov total110juta, Des20juta→gross130juta, jabatan6juta, iuran1,2juta, neto122,8juta, PKP64,3juta; pajak3juta+645ribu=3.645.000; potonganaktual2,2juta→selisih1.445.000. Jika dipotong5juta→selisih−1.355.000, statusproseskelebihan (bukanrefundotomatis).
- TER batasA5.400.000→0%;5.400.001→0,25%→13.500,0025eksak,cash13.500. B6.200.000→0%;+1→0,25%. C6.600.000→0%;+1→0,25%. Semua batas di tabel harus diuji−1,tepat,+1 termasukakhirterbuka. Tarif34%untukA>1,4miliar,B>1,405miliar,C>1,419miliar.
- PKP0/999→0;1000→50pajak;60juta→3juta;250juta→31,5juta;500juta→94juta;5miliar→1.444juta;5miliar+1000→1.444.000.350. Biayajabatanbulan0/10juta/20juta→0/500ribu/500ribu; setahun120juta/120juta+1 tetapcap6juta.
- FOB100USD+freight20+insurance5=125USD;KMK16000→2.000.000IDR;BMmanual10%=200.000. DasarmanualCIF+BM2.200.000;PPNmanual12%×proporsi100%=264.000;PPh22manual2,5%=55.000;totalmanual519.000. Tarif ini asumsi fixture, BUKANtarifproduk. CFR120+insurance5 danCIF125 harusidentik, tidak menambahfreight/insuranceganda. ManualCIFIDR bolehkurs1; kursIDRlain ditolak.
- Valas0,000001×kurs0,5→1/2.000.000IDR, pecahan tetap; tanpa biaya/tarif→total0. Komponenpajak0,5rupiah+0,5rupiah→cash1+1=2 walau totaleksak1; catatadjustment.
- BPHTBdasarDKI2024jualbeli biasa badan:harga800juta,NJOP1miliar→basis1miliar−250juta=750juta;5%=37,5juta sebelumfasilitas. Basis250juta−1/tepat→0;+1→pajak1/20rupiah,cash0. Harga>NJOPmemakaiharga. OPwariskeluargaterverifikasiapartemenbasis1,2miliar−1miliar→10juta sebelumfasilitas; hubunganunknown/tanpakonfirmasiatauOPtapak≤2miliarditahan, bukan0.
- PBBbrutoDKI2024 NJOPbumi300juta+bangunan200juta−NJOPTKP60juta=440juta;hunian40%=176juta;0,5%=880ribu **sebelumfasilitas**, bukanSPPT. Nonhunian60%→1.320.000; panganternak60%×0,25%→660.000. BilaNJOPTKPdipakaiobjeklain,hunian500juta→1juta. BatasNJOP60juta±1 dan0floor; NJOPTKPtidakperkomponenbangunan/bumi. Tahun2023/2025/2026, daerahlain, klasifikasibelumjelas→tanpaangka.

## Rencana penerimaan

Unit: seluruh125barisTER besertabatas±1 danpemetaanPTKP; nol,topopen,max; koherensiTER/rekonsiliasiberpolagrosberbeda;progresifsemuabatas,PKPfloor,deduksicap,lebihpotong,subjektifparuh/multiemployer/finalperiodheld; CIF/CFR/FOB,KMKminggu/date,manualbase,rational,cashconservation;regionalperiod/facility/beneficiary/multiobjectguard; malformed/null/negative/overflow/unknown failclosed. UI: semua5alur normal/invalid/held/stale,dropdown/fokus/keyboard/tabel,SSRmetodologi/sumber,hub10alat/search/sitemap103/4platform404,100IDunik/96terbit. Lima viewport320/375/768/1024/1440 dan screenshotdesktop/mobile. Node22npmci,typecheck,607regresi+unitbaru,build,seluruhPlaywright,CIartifactdanPreviewREADYpadaSHAfinalsama. Tidakmengubahproduction/domain/indexing.
