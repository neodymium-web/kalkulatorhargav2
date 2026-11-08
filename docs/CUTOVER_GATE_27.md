# Gate cutover27: kode, konten dan domain adalah keputusan berbeda

Baseline `a2cbd56c7c255d006f8ceb6905f6686e53699087`. Issue #57 hanya source/evidence staging; tidak merge, domain move, DNS, alias, host redirect, canonical, production legacy, Vercel target/protection/indexing atau sitemap submission.

## A. Kesiapan teknis staging: CONDITIONAL GO untuk review, menunggu bukti final

129URL baseline dipertahankan, ditambah dua alat manual nyata di luar100calculatorIDs: `/kalkulator/emas` dan `/bandingkan`. Sitemap global131, enam hub dan22arsip tetap. CI/Preview exactSHA dan hasil aktual ditautkan di PR setelah selesai; target pengujian bukan bukti kelulusan.

Crawl baseline129route dari root mengamati62anchor absolut same-domain:22self-source,26route v2 dan14fitur legacy. Setelah bounded tools ditambahkan, klasifikasi final untuk62dependency menjadi34targetlokal,22provenance nonklik dan6referensi fitur/preset nonklik. SourceURL historis tetap tertulis; pengguna dijelaskan bahwa ia dapat menyalinnya untuk memeriksa legacy sebelum cutover, tetapi hostname yang dipindahkan bukan arsip permanen. Tidak membuat hostname atau tautan arsip palsu.

Gate teknis tautan: tidak ada anchor absolut ke apex/www, localtarget terbit, query/preset/fragment lama tidak diam-diam dipindahkan, tidak ada source-self-link, BFS131page tanpa JS/sitemap. Gate ini dapat PASS walaupun **enam referensi nonklik tetap owner-blocked**. Angka0dangling anchor tidak boleh disebut0keputusan terbuka.

## B. Disposition25halaman: belum fully approved

| Kelompok | Hasil yang boleh diklaim | Yang belum selesai |
| --- | --- | --- |
|22arsip | Full source text/title/dates tetap, link/provenance diremediasi dan review annotation terpisah | Copyright, byline/entity/editorial/privacy, kesegaran studi/tarif/hukum, koreksi contoh saham dan pembulatan legacy perlu owner/legal |
|Emas | Manual nilai logam/quote/biaya dengan oracle independen, tanggal/usia dan UNKNOWN tanpa angka | Bukan livefeed, assay, merek/ukuran/premium, penawaran toko atau hukum pajak; owner menerima perbedaan scope, atau menyediakan lisensi/feed dan task parity lanjutan |
|Bandingkan | Empat ledger manual lengkap, basis/cap eksplisit, ongkir/kredit/pemotongan dari bukti, ranking eksak | Tidak memakai preset resmi; tidak menebak komponen8000, tidak menentukan hukum pajak. Owner menerima manual scope atau menyediakan snapshot primer tarif/policy |
|Benchmark | Evidence3tabel/16baris, definisi/rights gap dicatat, route tetap404 | Perizinan dataset, rawcohort/sample/date/geography, numerator/denominator, quantile dan reproduksi sebelum publikasi. Attribution bukan lisensi |

Sumber primer definisi emas dan rumus/oracle ada pada `DEFERRED_FORMULA_VERIFICATION.md`. Bukti GET3source baru ada di audit/deferred57. Angka tabel benchmark hanya inventory audit, tidak dimuat UI. Reuse engine settlement tidak memberi otorisasi menambah rate pajak atau tarif resmi.

## C. Domain move: strict NO-GO

Masih diperlukan keputusan tertulis atas benchmark, penerimaan manual versus live/preset, enam referencelegacy dan archival-host strategy bila diinginkan, serta22reviewkonten. GSC/GA4/backlinks enam bulan **UNKNOWN**: belum ada owner-suppliedexport baru; tidak mencoba mengakses akun pihak lain atau menginfer trafik dari crawl. Ekspor yang diperlukan tetap GSC Pages/Queries/indexing+clicks/impressions/CTR/position, GA4 organic landingpage+query/session/engagement/keyevents dengan timezone/exportdate, serta backlink/404penting.

Canonical v2 apex dan legacy apex308→www tetap; owner SEO/domain harus memilih arah yang disetujui, tidak menumpuk aturan berlawanan. Perangkat fisik/fieldp75CWV masih follow-up, bukan diganti emulasi/lab. Operator domain/rollback, snapshot config/deployment/TLS yang diverifikasi pada hari perubahan, jendela dan threshold rollback juga belum ditetapkan.

Instruksi cutover BARU wajib menyebut SHA, project/deployment legacy+v2, hostname persis, perubahan domain/DNS/alias/canonical/indexing yang disetujui, operator/jendela/rollback. CI hijau atau Preview READY bukan izin perubahan tersebut. Runbook sebelumnya tetap DRAFT, tidak dieksekusi dalam tugas ini.
