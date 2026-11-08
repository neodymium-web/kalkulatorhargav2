# Rencana paritas fitur tertunda, Issue #57

Baseline beku `main@a2cbd56c7c255d006f8ceb6905f6686e53699087`, 8 November 2026. Commit pertama ini hanya dokumentasi. Tidak menyatakan implementasi/CI/Preview sudah lulus. Branch `feat/issue-57-deferred-parity`.

## Invariant dan risiko awal

100 kalkulator, enam hub,22arsip dan129URL lama tetap. Tiga fitur tertunda pada baseline adalah emas, benchmark TikTok dan bandingkan. Source-link ke hostname yang kelak dipindahkan bukan arsip permanen: `page.url` dapat menjadi tautan diri, dan `legacyLink` dapat mengarah ke path/query/fragment yang tidak didukung v2. Canonical origin/proteksi/noindex/robots, production legacy/domain/DNS/alias dan settings Vercel tidak diubah. Tidak merge/auto-merge atau mengaktifkan redirect.

## Kontrak yang akan diverifikasi

### Tautan dan provenance

Crawl HTML production-build mulai root tanpa JS/sitemap, inventaris setiap anchor same-domain di22arsip dan navigasi/hub. Simpan source path, anchor text, absolute target, klasifikasi self-source/implemented/unresolved/external/unknown, aksi dan approval. Untuk path yang benar-benar setara, URL lokal; query/preset/fragment legacy tidak dianggap didukung hanya karena path dasar200. Untuk fitur yang belum setara, referensi arsip nonklik dengan teks tujuan asal dan penjelasan bahwa host lama bukan arsip permanen. Sumber/path/tanggal/hash tetap terlihat; jangan mengganti kutipan konten atau membuat redirect root palsu. Tidak membuat hostname arsip. Owner harus memilih archival hosting terpisah jika akses legacy setelah cutover diperlukan.

### Emas manual, bukan feed harga

Periksa ulang sumber/UI asli dan kontrak historis. Kandidat bounded: berat bruto minus berat nonemas, kadar karat/24 atau fineness/1000, acuan rupiah per gram emas murni yang diisi pengguna, spread manual atau quote buyback langsung, biaya beli/jual eksplisit. Jangan mengubah angka karat menjadi stamp komersial (14/24 tidak identik dengan585). Tidak ada harga/rate/default pasar atau tabel merek tersalin.

Harga sumber/tanggal/kelayakan acuan harus jelas; missing/stale/unknown tidak menghasilkan angka. Validasi netweight>0, kadar>0 dan maksimal24/1000, biaya nonnegatif, quote positif, spread0–100, kalender date-only dan batas numerik. Aritmetika BigInt/rasional; tiap arus kas dibulatkan sekali memakai kebijakan half-away-from-zero yang sudah dipakai project. Selisih cash direkonsiliasi terhadap cash pembelian dan cash penerimaan, bukan menjumlah angka tampilan yang dibulatkan.

Oracle sintetis independen, bukan harga pasar: bruto12g, nonemas2g,18K→7,5g murni; acuan1000000Rp/g→7500000; spread10%→6750000; biaya beli20000 dan jual30000→modal7520000, penerimaan6720000, selisih−800000. Uji18K=750‰,14/24 repeating, .5rupiah bertanda, spread100, netweightnol/negatif, quote kosong/tanggal stale dan batas digit. Kesetaraan feed merek, refresh/live price, assay, aturan pajak dan harga ukuran/premium tetap keputusan owner, tidak diklaim selesai oleh manual tool.

Sumber definisi primer awal: Royal Mint, Metal Fineness Explained (24-part ratio); World Gold Council, Gold Jewellery (purity). Halaman ANTAM dapat menjelaskan perbedaan transaksi buyback, tetapi tidak menjadi preset harga/fee/pajak otomatis. Sumber dan keterbatasan akan dicatat terpisah sebelum implementasi.

### Pembanding settlement manual

Gunakan core `calculatePlatformSettlement` yang ada; jangan mengganti kontrak100alat. Bandingkan empat kanal berlabel, semua input/rate/cap/basis/scope/kredit/ongkir/discount/HPP manual dan eksplisit. Tidak ada preset resmi atau biaya hilang yang dianggap0. Missing/unknown/coverage unsupported membatalkan ranking/hasil komparatif; angka0 harus diisi/diakui pengguna. Samakan basket quantity/HPP sebelum ranking, atau jelaskan bahwa skenario belum sebanding. Ranking memakai profit eksak, bukan hasil cash yang tampak seri.

Pajak tidak dihitung dari undang-undang baru: hanya nominal pemotongan yang telah dikonfirmasi dari bukti pengguna, atau explicit tidak berlaku; data/klasifikasi tak pasti tetap UNKNOWN. Jika dibutuhkan, wrapper menambahkan nominal tercatat ke ledger secara terpisah tanpa mengganti engine lama. Retur, pajak/rules/cap per-unit yang belum terpetakan tetap unsupported. Tidak merekonstruksi Rp8000 yang hilang sebagai tarif resmi.

Oracle independen: bruto100000, diskon0, admin9,25%→9250, proses1250→payout89500; payout81500 memerlukan biaya tambahan8000 yang harus dinyatakan, bukan diasumsikan. Oracle logistik/discount: bruto200000, diskon10000, fee10%basisnet=19000, proses1250, kreditongkir5000, ongkirseller8000, HPP120000→payout166750, hasil46750 sebelum komponen tambahan. Uji cap/min, custombasis, unknown, negatif, .5rupiah, tiecash berbedaeksak dan rekonsiliasi.

### Benchmark

Inventaris semua tabel/angka/cohort/penyebut/periode/sampel/quantile dan URLs sumber dari legacy; jangan publikasikan ulang dataset tanpa lisensi/izin yang dapat ditunjukkan. Jika belum ada, route tetap404 dan kebutuhan task/owner terinci. Tautan ke engagement calculator adalah alternatif terpisah, bukan paritas atau301 otomatis.

## Tahapan commit dan bukti

1. Rencana docs-only ini, sebelum source/link fixes.
2. Source/link remediation dan audit dependency.
3. Fitur manual bounded hanya setelah sumber/rumus/oracle terdokumentasi dan diuji.
4. Tests/evidence, ledger25outcome,map/sitemap hanya actualpublished.129awal dipertahankan; kemungkinan dua tambahan dicatat terpisah dari100calculatorIDs, bukan target yang memaksa halaman palsu.

Node22 cleaninstall,typecheck,unit,build,fullPlaywrightdesktop/mobile/WebKit,noJS/privacy100forms+newforms,axe/keyboard/tabel/textresize/reflow320/375/768/1440. BFS seluruh publishedroutes dari root, unknown/deferred404, no same-domain dangling/self-source selepas model cutover, archivecopy/provenance tetap. Screenshot benar-benar diinspeksi. CI/artifact/PreviewREADY exactHEAD; network protected hanya setelah izin baru bila connector membuat sharelink23jam, tidak mewarisi izin PR56.

## Gate owner yang tetap terbuka

Benchmark rights/methodology, licensed live gold, penerimaan perbedaan manual/preset, archive entity/byline/privacy/copyright/legal/tax dan kesegaran, GSC/GA4/backlinks enam bulan (UNKNOWN tanpa owner-suppliedexport), apex/www, perangkat nyata/fieldCWV, operator/jendela rollback. `CUTOVER_GATE_27.md` akan memisahkan kesiapan teknis staging,25disposition dan strictNO-GOdomainmove. CI hijau tidak mengizinkan domain move.
