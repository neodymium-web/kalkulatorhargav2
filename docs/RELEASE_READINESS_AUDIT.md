# Audit kesiapan rilis 100 kalkulator

**Keputusan: CONDITIONAL GO untuk review kesiapan saja, bukan izin launch.** Tidak ditemukan P0 baru pada skenario yang diuji. Satu P1 privasi AR-001 ditemukan dan diperbaiki dalam commit terpisah. Temuan P2 dan verifikasi operasional yang belum terbukti tetap terbuka. Tidak ada perubahan production,DNS,domain,alias,canonical,SITE_INDEXABLE atau indexing staging.

Baseline beku main `f865ee826c4965b1557c20b46c802f3e54138efc`. Tanggal8November2026. Branch `audit/issue-51-release-readiness`. Commit pertama `f5282c1` lokal adalah rencana dokumentasi saja; hasil di bawah baru dihasilkan setelah rencana. SHA remote commit pertama/final dan tautan CI/artifact/READY dicatat dalam PR agar dokumen tidak merujuk SHA dirinya sendiri. Artifact CI mengandung `commit.json` dan `audit-lab/summary.json` dengan SHA yang benar-benar diuji.

## Hasil baru dan batas bukti

| Pemeriksaan | Hasil baru |
| --- | --- |
| Inventaris |100IDunik,100published,6hub,107sitemap; kategori20/20/20/10/10/20 |
| HTTP/SSR |214respons107URL×2device,semua200;107title/description/canonical unik,1H1,rute unknown/injection404 |
| Formula independen |100baseline+100edge baru,217stress;PASS untuk skenario tersimpan, bukan jaminan semua input/hukum |
| Unit |1307PASS:789lama+518baru; tidak mengganti expected lama dengan engine |
| Browser |699PASS,1skip lama (mobile layout explicit viewport sudah dijalankan desktop);11WebKit terpisah PASS |
| Reflow |107awal+100hasil×5lebar×2project;tidak ada document overflow |
| Visual |62sheet benar-benar dilihat:24alat+home+6hub×desktop/mobile; state hasil/form dan struktur fullpage |
| Aksesibilitas |110axe scan,0violations; tidak sama dengan konformitas WCAG penuh/perangkat nyata |
| Runtime |214workflow tanpa pageerror/consoleerror atau request eksternal; Lighthouse terpisah menemukan favicon404 |
| Performa |22run lokal; mobilehomeLCP3613ms,foodcost2566ms melewati2500;CLS0,TBTmaks110,5ms; bukan fieldINP |
| Dependency |Node22.23.4clean install,typecheck,build;finalnpm audit0advisories;versi lama tidak dinaikkan |
| Preview network |Anonim baseline302SSO dengan noindex;body app/robots/sitemap remote masih UNKNOWN karena akses terlindungi |
| CI/READY final |Bukti exactSHA danartifact diselesaikan pada PR; hasil lokal tidak disebut CI atau network remote |

Bukti lama: batch docs,fixture dan CI sebelum audit adalah provenance saja. Bukti baru tersimpan di [formula](FORMULA_AUDIT_100.md),[SEO](SEO_CONTENT_AUDIT.md),[UX](UX_ACCESSIBILITY_AUDIT.md),[security/performance](SECURITY_PERFORMANCE_AUDIT.md),[sumber](audit/SOURCE_REVIEW.md),[matriksCSV](audit/route-matrix.csv),[indeksvisual](audit/SCREENSHOT_INDEX.md). [Checklistlaunch](PRODUCTION_LAUNCH_CHECKLIST_DRAFT.md) adalah rencana belum disetujui.

## Register temuan P0/P1/P2

P0: tidak ada yang teramati; bukan bukti tidak mungkin ada. P1 terbuka:tidak ada exploit yang belum dimitigasi setelah AR-001. Unknown akses deployment tetap syarat sebelum launch, tidak diubah menjadi PASS.

| ID | Severity/status | Route dan impact | Repro/expected/actual/bukti | Owner dan remediasi |
| --- | --- | --- | --- | --- |
| AR-001 | P1, FIXED; regression PASS | Semua 100 form; input finansial dapat masuk URL bila JS gagal | [Repro](audit/findings/AR-001.md): synthetic HPP317/211/101/7; expected inert, actual native GET. Fix disabled sampai hidrasi;100form noJS×2project lulus. | Engineering: review fix terpisah dan pertahankan tes. |
| AR-002 | P2, OPEN |8alat tanpa inbound HTML awal; penemuan bergantung JS/sitemap | `route-summary.json`:8zeroInitialInbound; directory slice12. Expected root crawl107, actual8tanpa inbound. | Engineering/SEO: pagination SSR terpisah dan root crawl. |
| AR-003 | P2, OPEN | Home/food-cost mobile; LCP melewati target lab | `lighthouse-summary.json`:3613/2566ms vs2500; satu run, bukan p75. | Performance: profile dan remediasi bundle terpisah; ukur beberapa run. |
| AR-004 | P2, OPEN | Favicon global404; console error pada client tertentu |22LHrawreport menunjuk `/favicon.ico`; expected asset200, actual404. | Design/engineering: asset disetujui dan network regression. |
| AR-005 | P2, OPEN | Intro home/Bisnis kurang mewakili cakupan; spasi pajak padat |62sheet inspected; copy masih fokus bisnis produksi dan ada spasi hilang. | Content: copy review terpisah; pertahankan arti hukum. |
| AR-006 | P2, OPEN hardening | Belum ada CSP/referrer policy aplikasi eksplisit | Inspeksi config; tidak ada sink XSS teramati. Header SSO bukan header aplikasi. | Security: CSP report-only compatibility dan review header edge. |
| AR-007 | P2, UNKNOWN gate | Preview terlindungi; network app/robots/sitemap belum terbukti | Anonim302SSO,noindex; CLI logged out; auto-review menolak connector fetch karena sharelink23jam. | Owner: otorisasi akses sebelum verifikasi remote; proteksi tetap aktif. |
| AR-008 | P2, LIMITATION | Sumber hukum/tarif, perangkat dan field performance |93URL dengan403/timeout/block page; scope legal terbatas; emulasi bukan perangkat fisik. | Legal/product/QA: review scope, sumber terblokir dan real-device/field checks sebelum launch. |

Temuan P2 tidak diperbaiki dengan refactor/redesign massal dalam audit. Tidak ada tarif resmi baru atau koreksi formula material diam-diam. Bila reviewer menemukan salah angka/hukum didukung, klasifikasikan P0 dan ubah rekomendasi menjadi NO-GO sampai remediasi terpisah terbukti.

## Syarat rekomendasi

CONDITIONAL GO berarti paket bukti layak direview. Belum memenuhi izin rilis production. Pemilik harus menutup/menyetujui P2 dengan mitigasi,melakukan networkcheck protectedPreview,QA perangkat fisik/reviewer legal,dan baseline legacyGSC/GA4 serta launchchecklist terpisah. GO hanya sesudah bukti lengkap; NO-GO bila ada P0 atau launch-blockingP1 terbuka. Siapa pun tetap tidak boleh mempromosikan deployment berdasarkan audit ini.

Peninjauan otomatis menolak aksi fetchPreview melalui konektor karena aksi itu membuat/memakai tautan berbagi sementara23jam. Tautan belum dibuat dan tidak ada workaround/protectionchange. Persetujuan pemilik diperlukan bila opsi itu dipilih. Metadata deployment READY/SHA dapat diperiksa tanpa membuka isi terlindungi dan tidak menggantikan networkcheck.

## Reproduksi dan provenance

Gunakan Node22.23.4+, `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e`, `npx playwright test --config=playwright.audit-webkit.config.ts`, `node scripts/audit/lighthouse.mjs`, `npm audit --json`. CI menjalankan semuanya dan mengunggah test-results sebagai browser-evidence. Chromium dan WebKit perlu diinstal Playwright. Jangan menonaktifkan staging noindex untuk memperbaiki skorLighthouseSEO.

Oracle: `python3 scripts/audit/oracles.py`, `python3 scripts/audit/stress.py`, laluunit test. Referensi ini memakai stdlib Python dan tidak mengimpor aplikasi. `node scripts/audit/evaluate.cjs` menulis output aktual lokal, bukan expected. `python3 scripts/audit/report.py` membaca output tersebut dan214JSONbrowser untuk matriks; perlu hasil browser yang sudah dijalankan,tidak mengasumsikan PASS. Visualsheet membutuhkan Pillow dan screenshot asli; menghasilkansheet bukan inspeksipiksel. Networksourcecheck terpisah `python3 scripts/audit/check-sources.py` dapat berbeda menurut client/time; jangan timpa batas hasil yang sudah dicatat tanpa review.

Awalnya harness mendeteksi deviasi oracle unit-price,PromoSeller,statusunknownPPh23 serta perbandingan Fraction; diselidiki dan dikoreksi sesuai kontrak terdokumentasi. Fix AR-001 versi awal menambah wrapper setelah hidrasi sehingga tesgroup lama gagal; wrapper kemudian dibatasi sebelum hidrasi,semuaassertion lama tetap. Hasil final di atas berasal dari rerun; tidak mengklaim semua percobaan pertama hijau.

CI pertama pada91ba33f meluluskan699Playwright/1skip, tetapi4capture WebKit seller melampaui batas32767piksel renderer Linux padaDPR3. Capture kemudian disimpan fullpage pada skalaCSS, dengan lampiran dimensi; tidak mengubah assertion,timeout atau viewport aplikasi. CI final harus mengulang semua tahap pada SHA revisi, bukan hanya mengandalkan run pertama.

## Matriks cakupan100/100 final

| ID | Route | Kategori | Oracle baseline/edge | HTTP/SSR | Reflow | Workflow |
| --- | --- | --- | --- | --- | --- | --- |
| production-cost | /kalkulator/hpp | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-harga-jual | /kalkulator/harga-jual | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-margin-laba | /kalkulator/margin-laba | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-markup | /kalkulator/markup | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bep | /kalkulator/bep | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-target-laba | /kalkulator/target-laba | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-harga-pokok-penjualan | /kalkulator/harga-pokok-penjualan | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-yield-bahan | /kalkulator/yield-bahan | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-penyusutan-garis-lurus | /kalkulator/penyusutan-garis-lurus | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-arus-kas | /kalkulator/arus-kas | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-utilisasi-kapasitas | /kalkulator/utilisasi-kapasitas | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-perputaran-persediaan | /kalkulator/perputaran-persediaan | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-reorder-point | /kalkulator/reorder-point | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-runway-kas | /kalkulator/runway-kas | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-biaya-layanan | /kalkulator/biaya-layanan | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-tarif-freelance | /kalkulator/tarif-freelance | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-food-cost | /kalkulator/food-cost | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-harga-borongan | /kalkulator/harga-borongan | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-eoq | /kalkulator/eoq | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-payback-period | /kalkulator/payback-period | bisnis | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-berat-volumetrik | /kalkulator/berat-volumetrik | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-roas | /kalkulator/roas | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-roas-impas | /kalkulator/roas-impas | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-acos | /kalkulator/acos | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-konversi-toko | /kalkulator/konversi-toko | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-nilai-pesanan-rata-rata | /kalkulator/nilai-pesanan-rata-rata | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-promo-seller | /kalkulator/promo-seller | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-subsidi-ongkir | /kalkulator/subsidi-ongkir | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-biaya-kemasan | /kalkulator/biaya-kemasan | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-biaya-retur | /kalkulator/biaya-retur | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kerugian-cod | /kalkulator/kerugian-cod | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bunga-sederhana | /kalkulator/bunga-sederhana | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bunga-majemuk | /kalkulator/bunga-majemuk | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cicilan-anuitas | /kalkulator/cicilan-anuitas | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cicilan-flat | /kalkulator/cicilan-flat | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-rasio-cicilan | /kalkulator/rasio-cicilan | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-target-tabungan | /kalkulator/target-tabungan | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-dana-darurat | /kalkulator/dana-darurat | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-deposito | /kalkulator/deposito | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-imbal-hasil-investasi | /kalkulator/imbal-hasil-investasi | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cagr | /kalkulator/cagr | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-nilai-kini | /kalkulator/nilai-kini | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-npv | /kalkulator/npv | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-inflasi | /kalkulator/inflasi | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-rata-rata-beli-saham | /kalkulator/rata-rata-beli-saham | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-untung-rugi-saham | /kalkulator/untung-rugi-saham | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bunga-efektif-pinjaman | /kalkulator/bunga-efektif-pinjaman | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kpr | /kalkulator/kpr | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pelunasan-dipercepat | /kalkulator/pelunasan-dipercepat | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-refinancing | /kalkulator/refinancing | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kurs-mata-uang | /kalkulator/kurs-mata-uang | keuangan | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-engagement-rate | /kalkulator/engagement-rate | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pertumbuhan-pengikut | /kalkulator/pertumbuhan-pengikut | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cpm | /kalkulator/cpm | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cpc | /kalkulator/cpc | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-cpa | /kalkulator/cpa | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-ctr | /kalkulator/ctr | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-estimasi-youtube | /kalkulator/estimasi-youtube | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-estimasi-tiktok-kreator | /kalkulator/tiktok | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-tarif-endorsement | /kalkulator/tarif-endorsement | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-waktu-tonton | /kalkulator/waktu-tonton | media-sosial | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-diskon | /kalkulator/diskon | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-harga-per-satuan | /kalkulator/harga-per-satuan | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bagi-tagihan | /kalkulator/bagi-tagihan | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-persen | /kalkulator/persen | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-perubahan-persen | /kalkulator/perubahan-persen | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-selisih-tanggal | /kalkulator/selisih-tanggal | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-hari-kerja | /kalkulator/hari-kerja | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-usia | /kalkulator/usia | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-durasi-kerja | /kalkulator/durasi-kerja | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-konsumsi-bbm | /kalkulator/konsumsi-bbm | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-biaya-listrik | /kalkulator/biaya-listrik | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-biaya-air | /kalkulator/biaya-air | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kebutuhan-cat | /kalkulator/kebutuhan-cat | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kebutuhan-keramik | /kalkulator/kebutuhan-keramik | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-volume-beton | /kalkulator/volume-beton | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-skala-denah | /kalkulator/skala-denah | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-konversi-panjang | /kalkulator/konversi-panjang | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-konversi-berat | /kalkulator/konversi-berat | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-konversi-suhu | /kalkulator/konversi-suhu | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-kecepatan-rata-rata | /kalkulator/kecepatan-rata-rata | sehari-hari | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-blibli | /kalkulator/blibli | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-harga-jual-marketplace | /kalkulator/harga-jual-marketplace | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-banding-biaya-marketplace | /kalkulator/banding-biaya-marketplace | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bundel-produk | /kalkulator/bundel-produk | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-stok-cover | /kalkulator/stok-cover | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-ppn | /kalkulator/ppn | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pph-23 | /kalkulator/pph-23 | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pph-4-ayat-2-sewa | /kalkulator/pph-4-ayat-2-sewa | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-gross-up-pajak | /kalkulator/gross-up-pajak | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pph-final-umkm | /kalkulator/pph-final-umkm | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pph-21-bulanan | /kalkulator/pph-21-bulanan | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pph-21-rekonsiliasi | /kalkulator/pph-21-rekonsiliasi | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pajak-impor | /kalkulator/pajak-impor | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-bphtb | /kalkulator/bphtb | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-pbb-p2 | /kalkulator/pbb-p2 | pajak | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-shopee | /kalkulator/shopee | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-tiktok | /kalkulator/tiktok-shop | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-tokopedia | /kalkulator/tokopedia | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |
| calc-lazada | /kalkulator/lazada | marketplace | PASS/PASS |200desktop/mobile |5widthawal+hasilPASS |baseline/invalid/fokusPASS |

## Metode yang dibekukan pada rencana awal

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
