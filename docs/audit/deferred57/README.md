# Evidence Issue #57

Commit pertama docs-only: `docs/DEFERRED_FEATURE_PARITY_PLAN.md`; formula/sumber/oracle ditulis sebelum implementasi alat manual. Snapshot Issue #53/#55 tidak ditimpa. `cutover-map-before.csv` membekukan129record; currentmap menambahkan hanya dua route yang benar-benar terbit. `parity-before.csv` menyimpan22archive+3blocked baseline, currentparity25row menandai22review-needed+2boundedmanual-review-needed+1blocked, bukan25fullyresolved.

## Source dan UI legacy

GET3page publik www, concurrency1,jeda400ms, status200,UTC/bodyhash disimpan pada legacy-network.json. Kontrak yang diamati pada legacy-contracts.json: emas tiga tab/harga/kadar/buyback,3input+1select,7tabel harga/ukuran/kemurnian, quote2540000 dan spread8,1% pada snapshot bertanggal23Oktober2026. Bukan quote aktual aplikasi v2. Benchmark tidak memiliki inputSSR dan memuat3tabel. Bandingkan juga tabelcontoh tanpa inputSSR; ledger komponen selisih8000 belum dapat direkonsiliasi dari kolom yang tampil. Tidak menjalankan refresh/scrapingAPI atau mengubah source legacy.

RoyalMint dan WorldGoldCouncil dibaca sebagai definisi primer kadar. ANTAM search terlihat tetapi fullfetch403: tidak dijadikan dasar rate/fee/pajak. Tidak ada primarytariff baru yang disahkan. Seluruh angka oracle diberi label sintetis, bukan tarif pasar. Goldprice dan comparisontaxamount berasal dari pengguna dan harus dikonfirmasi; status stale/UNKNOWN tidak memiliki ledger angka.

## Tautan dan model host

Baseline crawl file di baseline/ssr-links.json adalah HTML actual build yang identik source a2cbd56 (hasil squash PR56), rootseed saja,129route. CSV legacy-link-dependencies62row mencatat anchor absolut yang benar-benar dirender sebelum remediasi, bukan sekadar data JSON sumber. Action dan ownerflags adalah keputusan teknis/usulan, bukan persetujuan cutover. Setelah implementasi,34dapatlokal dan28nonklik terdiri22provenance+6reference fitur. Tidak ada anchoroperasional yang menggantung pada hostnamelegacy; masih ada28instansi provenance/reference yang perlu strategi owner jika arsip atau fitur lama hendak dipertahankan dengan akses tersendiri.

Model resolusi tidak mempertahankan query/preset/fragment yang tidak didukung hanya karena pathdasar200. Link yang setara menjadi lokal, toolmanual diberi anotasi perubahan scope; source-self-link menjadiURLteksnonklik. Referensi unresolved juga menjadi teksnonklik dengan penjelasan dan alamat yang bisa disalin sebelum cutover. Narasi sumber/tanggal/hash tidak dihapus. Tidak membuat DNS/alias/hostarsip baru. Tests memakai kedua host tanpa mengaktifkan redirect.

CSV benchmark-inventory16baris berasal dari3tabel source dan memuat cohort/metric/date/rights gaps; data audit ini tidak diimpor frontend. Sampel/geografi/window/quantile belum dapat direproduksi dari dataset berizin. Benchmark tetap404; creator engagement calculator adalah alternatif, bukan ekuivalen atau301.

## Pengujian dan batas bukti

Target: Node22cleaninstall,typecheck/unit/build,fullChromiumdesktop/mobile,35WebKit(33lama+2manual),noJS100formlama+5formmanualbaru,axe/focus/keyboard/tabel/320–1440/text200%,sourcecopy22arsip,BFS131page, noqueryleak dan unknown404. CI menyimpan headmanifest, newlinkcrawl, source/result screenshots dan existingcalculatoraudit. Hasil aktual dan Preview exactSHA dicatat diPR setelah selesai. Network protected memakai izin baru khusus deployment; izin PR56 tidak diwarisi.

Temuan awal yang diperbaiki: tanggal invalid harus menghentikan parse sebelumordinal; empat ResultPanel perlu nama landmark unik; rangkaian formula panjang membutuhkan spasi/pembungkusan lokal, dan gridfield native memerlukan minmax0 agar ukuran intrinsik pada mobile/text200% tidak melampaui kolom. Default heading/kontrak form lama tetap. Perubahan satu input membuang ranking/hasil lama; persen dan fee tidak dibulatkan terlalu awal, cashdirekonsiliasi dari core yang sama. Perangkat nyata,fieldCWV dan trafikSEO tetap bukan bukti dari emulasi/lab.
