# Audit kesiapan rilis: rencana dan baseline beku

Baseline immutable: `f865ee826c4965b1557c20b46c802f3e54138efc` (main). Tanggal audit: 8 November 2026, Asia/Jakarta. Issue #51. Branch audit terpisah, staging saja. Commit pertama ini hanya rencana; belum ada hasil baru atau keputusan kelulusan.

## Batas wewenang

Tidak mengubah kalkulator secara material, formula hukum/tarif, domain production, DNS, alias, redirect, canonical origin, SITE_INDEXABLE, robots atau header noindex. Perbaikan material memerlukan issue/PR remediasi terpisah. GO audit bukan izin launch. Semua temuan tetap dicatat meskipun CI hijau.

## Pemisahan bukti

Bukti lama: dokumen Batch1–20, fixture dan CI implementasi. Hanya provenance, bukan hasil audit baru. Bukti baru: oracle independen Python Fraction/Decimal dengan input dan output tersimpan, pengujian engine yang membandingkan hasil dengan oracle tanpa memanggil engine untuk expected, HTTP crawl107URL, pengujian browser, screenshot yang benar-benar diperiksa, advisory/dependency audit, pengukuran lab, pemeriksaan sumber primer pada tanggal audit, CI dan Preview final.

## Metode dan prosedur reproduksi

1. Node22 clean npm ci; rekam versi lockfile/dependency dan npm audit --json. Tidak mass upgrade.
2. Daftarkan100ID/slug/category/formulaVersion/source/scope dari registry dan cocokkan dengan inventaris. Semua100 mendapat baseline substantif + edge/invalid baru dan referensi oracle terpisah. Python Fraction/Decimal menjadi pembanding nilai, bukan output engine atau formatter aplikasi. Catat setiap deviasi.
3. Prioritas stress: inversi minimum integer, jadwal/anuitas/peralihan fixed-floating, IRR/APR arus kas bertanggal, signed rounding, cap/tier, pajak/TER/UMKM, tanggal/leap-day/zona waktu, konversi dua arah dan settlement. Tidak mengasumsikan seluruh domain legal didukung.
4. Build lokal lalu HTTP/SSR crawl seluruh107URL: status200, title/description/H1/canonical unik dan intent benar, konten/metode/sumber/FAQ sesuai scope, internal links, sitemap107, nonexistent404. Rekam100baris kalkulator di docs/audit/route-matrix.csv dan7halaman lain terpisah.
5. Browser actual-rendered:107halaman ×320/375/768/1024/1440, document overflow0; ledger lebar hanya boleh local scroll berlabel. Catat console/pageerror/hydration. Latih100alur baseline dan invalid; uji keyboard/fokus/baris/search serta payload teks berbahaya tanpa eksekusi.
6. Visual minimum24alat: Bisnis3 (HPP, BEP, food cost); Keuangan3 (KPR, refinancing, NPV); MediaSosial2 (TikTok kreator, CTR); Seharihari2 (bagi tagihan, usia); Pajak10 (semuanya); Marketplace4 (Shopee, TikTok Shop seller, Tokopedia, Lazada). Tambah homepage+6hub. Desktop1440/mobile375 fullpage dan state hasil/form; inspect pixels melalui gambar, bukan hanya keberadaan file. Pilihan mencakup semua kategori, input dinamis, tanggal, investasi/jadwal, legal dan fee manual. Font/keyboard/motion/axe diperiksa; WebKit/iOS dan perangkat nyata hanya diklaim bila benar-benar tersedia.
7. Legal/source snapshot: buka ulang sumber primer beserta effective date, klasifikasi dan wilayah. Pisahkan model exact/simulasi/input tarif/legal scoped. URL tak terbaca/login/403 menjadi limitation, bukan bukti tarif atau hukum. Semua100provenance berada di FORMULA_AUDIT_100.md.
8. Security: static boundary/input/output/storage/network review dan runtime XSS/prototype/route/query probes; tidak membuka secret. Performance: Lighthouse desktop/mobile home+6hub+heavy sample, LCP/CLS/TBT dan lingkungan nyata; lab TBT bukan field INP. Rekam bundle/build/response size dan keterbatasan field CWV.
9. Jalankan typecheck/unit/build/seluruhPlaywright dan CI. Artifact browser-evidence dan Vercel READY harus terikat SHA head PR yang sama. Buktikan network staging noindex+robots; canonical production tetap dinilai sebagai intent staging, tidak diubah.

## Matriks provenance/sumber yang akan diperiksa

| Kelompok | Versi dasar | Sumber primer dan cakupan yang harus diperiksa ulang |
| --- | --- | --- |
| Bisnis/operasi/stok | formulaVersion tiap registry; dokumen Batch1–4 | Konsep biaya/margin/inventori/EOQ; asumsi permintaan dan periode; input bukan data pasar |
| Marketplace/creator | Batch5/6/10/11/17/20 | Konsep metrik/biaya, platform Academy/help; tarif dan RPM tetap manual, bukan janji monetisasi |
| Keuangan | Batch7–9 | Bunga, anuitas, investasi, NPV, IRR/APR dan kalender arus kas; konvensi periode/rounding eksplisit |
| Seharihari | Batch12–16 | Rasio, kalender Gregorian, SI/NIST/BIPM dan sumber material; tarif manual bukan otomatis |
| Pajak | Batch18/19 snapshot2026-11-08 | PP20/2026, PMK164/2023Pasal6, PP58/2023, PMK168/2023, PPN/PPh23, DKI2024, impor manual; jangan memperluas scope |
| Teknis | lockfile dan Next/React versi terpasang | Advisory primer, dokumentasi keamanan/performance/a11y; tidak mengandalkan skor tunggal |

## Threshold dan klasifikasi

P0: salah uang/pajak pada skenario didukung, eksekusi injection, kebocoran sensitif, canonical/indexing/production exposure yang berbahaya. P1: blocker peluncuran yang nyata (rute hilang, asumsi menyesatkan, interaksi/a11y penting rusak, validasi/batas salah). P2: dampak terbatas, hardening atau keterbatasan yang jelas dan tidak memalsukan hasil. Setiap temuan memuat input, expected, actual, sumber, bukti, owner dan status.

NO-GO bila ada P0 atau P1 launch-blocking terbuka. CONDITIONAL GO bila tidak ada P0 tetapi remediasi/validasi yang spesifik masih diperlukan. GO untuk review kesiapan saja bila seluruh kriteria terbukti. Tidak boleh mengubah unknown menjadi PASS. HTTP107/107,100IDunik/published,200vector independen minimal,107×5reflow,24+visualsampledua viewport,0error runtime baru, CIgreen dan READYsameSHA adalah gates terukur. Advisory dinilai menurut prasyarat exploit; skor lab bukan jaminan CWV lapangan. TargetlabLCP≤2.5s/CLS≤0.1, TBT≤200ms dicatat sebagai baseline terkontrol dan temuan bila meleset, bukan klaim INP.

## Pelacakan cakupan awal (belum diperiksa)

| ID | Route | Kategori | Oracle baseline/edge | HTTP/SSR | Reflow | Status |
| --- | --- | --- | --- | --- | --- | --- |
| production-cost | /kalkulator/hpp | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-harga-jual | /kalkulator/harga-jual | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-margin-laba | /kalkulator/margin-laba | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-markup | /kalkulator/markup | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bep | /kalkulator/bep | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-target-laba | /kalkulator/target-laba | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-harga-pokok-penjualan | /kalkulator/harga-pokok-penjualan | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-food-cost | /kalkulator/food-cost | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-yield-bahan | /kalkulator/yield-bahan | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-harga-borongan | /kalkulator/harga-borongan | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-tarif-freelance | /kalkulator/tarif-freelance | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-penyusutan-garis-lurus | /kalkulator/penyusutan-garis-lurus | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-perputaran-persediaan | /kalkulator/perputaran-persediaan | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-reorder-point | /kalkulator/reorder-point | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-eoq | /kalkulator/eoq | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-arus-kas | /kalkulator/arus-kas | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-runway-kas | /kalkulator/runway-kas | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-payback-period | /kalkulator/payback-period | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-utilisasi-kapasitas | /kalkulator/utilisasi-kapasitas | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-biaya-layanan | /kalkulator/biaya-layanan | bisnis | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-tiktok | /kalkulator/tiktok-shop | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-shopee | /kalkulator/shopee | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-tokopedia | /kalkulator/tokopedia | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-lazada | /kalkulator/lazada | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-blibli | /kalkulator/blibli | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-harga-jual-marketplace | /kalkulator/harga-jual-marketplace | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-banding-biaya-marketplace | /kalkulator/banding-biaya-marketplace | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-promo-seller | /kalkulator/promo-seller | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-subsidi-ongkir | /kalkulator/subsidi-ongkir | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-berat-volumetrik | /kalkulator/berat-volumetrik | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-biaya-kemasan | /kalkulator/biaya-kemasan | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-biaya-retur | /kalkulator/biaya-retur | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kerugian-cod | /kalkulator/kerugian-cod | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-roas | /kalkulator/roas | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-roas-impas | /kalkulator/roas-impas | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-acos | /kalkulator/acos | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-konversi-toko | /kalkulator/konversi-toko | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-nilai-pesanan-rata-rata | /kalkulator/nilai-pesanan-rata-rata | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bundel-produk | /kalkulator/bundel-produk | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-stok-cover | /kalkulator/stok-cover | marketplace | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bunga-sederhana | /kalkulator/bunga-sederhana | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bunga-majemuk | /kalkulator/bunga-majemuk | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cicilan-anuitas | /kalkulator/cicilan-anuitas | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cicilan-flat | /kalkulator/cicilan-flat | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bunga-efektif-pinjaman | /kalkulator/bunga-efektif-pinjaman | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kpr | /kalkulator/kpr | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pelunasan-dipercepat | /kalkulator/pelunasan-dipercepat | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-refinancing | /kalkulator/refinancing | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-rasio-cicilan | /kalkulator/rasio-cicilan | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-target-tabungan | /kalkulator/target-tabungan | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-dana-darurat | /kalkulator/dana-darurat | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-deposito | /kalkulator/deposito | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-imbal-hasil-investasi | /kalkulator/imbal-hasil-investasi | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cagr | /kalkulator/cagr | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-nilai-kini | /kalkulator/nilai-kini | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-npv | /kalkulator/npv | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-inflasi | /kalkulator/inflasi | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-rata-rata-beli-saham | /kalkulator/rata-rata-beli-saham | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-untung-rugi-saham | /kalkulator/untung-rugi-saham | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kurs-mata-uang | /kalkulator/kurs-mata-uang | keuangan | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-ppn | /kalkulator/ppn | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pph-21-bulanan | /kalkulator/pph-21-bulanan | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pph-21-rekonsiliasi | /kalkulator/pph-21-rekonsiliasi | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pph-final-umkm | /kalkulator/pph-final-umkm | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pph-23 | /kalkulator/pph-23 | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pph-4-ayat-2-sewa | /kalkulator/pph-4-ayat-2-sewa | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-gross-up-pajak | /kalkulator/gross-up-pajak | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pajak-impor | /kalkulator/pajak-impor | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bphtb | /kalkulator/bphtb | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pbb-p2 | /kalkulator/pbb-p2 | pajak | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-engagement-rate | /kalkulator/engagement-rate | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-pertumbuhan-pengikut | /kalkulator/pertumbuhan-pengikut | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cpm | /kalkulator/cpm | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cpc | /kalkulator/cpc | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-cpa | /kalkulator/cpa | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-ctr | /kalkulator/ctr | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-estimasi-youtube | /kalkulator/estimasi-youtube | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-estimasi-tiktok-kreator | /kalkulator/tiktok | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-tarif-endorsement | /kalkulator/tarif-endorsement | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-waktu-tonton | /kalkulator/waktu-tonton | media-sosial | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-diskon | /kalkulator/diskon | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-harga-per-satuan | /kalkulator/harga-per-satuan | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-bagi-tagihan | /kalkulator/bagi-tagihan | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-persen | /kalkulator/persen | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-perubahan-persen | /kalkulator/perubahan-persen | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-selisih-tanggal | /kalkulator/selisih-tanggal | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-hari-kerja | /kalkulator/hari-kerja | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-usia | /kalkulator/usia | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-durasi-kerja | /kalkulator/durasi-kerja | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-konsumsi-bbm | /kalkulator/konsumsi-bbm | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-biaya-listrik | /kalkulator/biaya-listrik | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-biaya-air | /kalkulator/biaya-air | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kebutuhan-cat | /kalkulator/kebutuhan-cat | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kebutuhan-keramik | /kalkulator/kebutuhan-keramik | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-volume-beton | /kalkulator/volume-beton | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-skala-denah | /kalkulator/skala-denah | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-konversi-panjang | /kalkulator/konversi-panjang | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-konversi-berat | /kalkulator/konversi-berat | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-konversi-suhu | /kalkulator/konversi-suhu | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |
| calc-kecepatan-rata-rata | /kalkulator/kecepatan-rata-rata | sehari-hari | PENDING | PENDING | PENDING | NOT AUDITED |

Deliverables hasil: FORMULA_AUDIT_100.md, SEO_CONTENT_AUDIT.md, UX_ACCESSIBILITY_AUDIT.md, SECURITY_PERFORMANCE_AUDIT.md, PRODUCTION_LAUNCH_CHECKLIST_DRAFT.md, CSV route-matrix, oracle/hasil, screenshot-index dan registerP0/P1/P2. Semua hasil akan ditambahkan setelah eksekusi; rencana beku ini tetap dapat dilihat pada commit pertama.
