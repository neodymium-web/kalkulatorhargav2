# Bukti migrasi 25 URL legacy

Baseline Issue #55: `83485060ae157855bd1adcf9c5250c231c3e5972`. Snapshot Issue #53 di `docs/audit/cutover` tidak ditimpa. `cutover-url-map-before.csv` membekukan 107 record sebelum penambahan, dan tes membandingkan record awal secara utuh.

`network.json`: 25 GET publik berurutan, jeda400ms, semua200 pada host www, tanpa API/auth/secret. Timestamp UTC dan SHA256 body disimpan. HTML mentah berada di cache lokal `/tmp/issue55-source`, bukan dependency runtime. `source-pages.json` memuat seluruh teks main, tree semantik aman, metadata, tanggal literal, links dan JSON-LD yang benar-benar diterima. JSON-LD source hanya evidence, tidak ditayangkan sebagai klaim author/Article baru.

`legacy-page-decisions.csv` di direktori induk mencatat 25 usulan yang belum disetujui. `legacy-content-parity.csv` mencatat 22 implemented/review-needed dan tiga blocked, bukan “25 selesai”. Semua 22 merupakan **published inherited archive** pada staging: route dan sitemap nyata, tetapi approval editorial/legal/rights/freshness belum tersedia. Mereka tidak disebut sebagai kebijakan/tarif terkini v2. Halaman tarif tidak dipromosikan sebagai rekomendasi; navigasi entry diberi label arsip/perlu review.

Transformasi yang disengaja:

- Full text, title, H1, heading, byline dan time/dateTime sumber dipertahankan. Tanggal pengamatan ditampilkan terpisah, tidak mengubah tanggal publikasi/review lama. Untuk halaman tanpa tanggal publikasi, tidak dibuat tanggal baru.
- Hanya placeholder iklan “Ruang iklan”, class/style/layout lama dan markup/script nonkonten dihapus. Tidak ada gambar, font, tracker, iframe atau script sumber dipakai. Tidak menjalankan HTML mentah/dangerouslySetInnerHTML; renderer hanya tag/atribut yang diizinkan dan React meng-escape teks.
- Source links antar22arsip menjadi lokal. Links menuju fungsi calculator/preset yang belum setara tetap absolute ke legacy, termasuk root/query pilihan marketplace dan emas/benchmark/bandingkan; label tidak diganti menjadi klaim feature parity. Tautan tambahan ke alat v2 dikelompokkan secara eksplisit sebagai alat dengan asumsi berbeda. Redirect server/JS tidak ditambahkan.
- TOC native anchor, tabel scroll region focusable dengan caption/header asli, breadcrumb dan CSS Modules memakai token Design System v2. Inline span dipertahankan agar browser tidak memperbaiki struktur paragraf dan memicu hydration mismatch.

## Keputusan dan kesalahan sumber yang belum diselesaikan

`blocked.json` menjelaskan fitur/test tambahan untuk emas, benchmark dan bandingkan. Tiga route ini tetap404 di v2; tautan sumber tetap dapat menuju legacy yang hidup. Tidak menghapus/redirect URL legacy.

Artikel average-down menyebut fraksiRp5 pada contoh harga4436 walau tabel teksnya menyebut fraksiRp10 pada rentang2000–5000; komponen fee beli contoh juga belum direkonsiliasi. Halaman bandingkan menampilkan dana cair81500 di Tokopedia/TikTok sementara kolom admin9,25% dan proses1250 hanya menjelaskan potongan10500 dari100000, sehingga8000 belum terlihat pada kolom. **Tidak memperbaiki angka dengan tebakan.** Arsip saham diberi warning khusus, bandingkan ditunda. Klaim pembulatan per komponen pada artikel Shopee bukan algoritme aggregate rasional v2; notice khusus menjelaskan perbedaannya.

Kebijakan editorial/disclaimer/metodologi/redaksi memuat klaim proses, entity, privasi dan pencarian profil dari sistem lama. Semuanya ditempatkan dalam konteks arsip dan memerlukan konfirmasi manusia; bukan janji operasional atau kredensial baru. Kutipan tarif/hukum dan studi pihak ketiga belum diverifikasi primer ulang. Hak publikasi/bentuk atribusi owner belum dianggap disahkan hanya dari akses publik. [Register keputusan](../../CUTOVER_DECISION_REGISTER.md) adalah gate owner, bukan checklist yang otomatis selesai karena CI.

## Regenerasi dan pengujian

`scripts/legacy/survey.py` mengambil25path dari snapshot inventory lama; hentikan jika akses/rate-limit, jangan bypass. `extract.py` memverifikasi hash HTML dan menghasilkan snapshot semantik; `generate.py` menerapkan keputusan port/defer yang eksplisit; `ledgers.py` menghasilkan CSV dan menambah hanya22row nyata. Jangan menjalankan ulang atas source yang berubah tanpa review diff; snapshot bukan layanan pembaruan tarif.

Target pengujian: typecheck, unit, build, seluruh desktop/mobile, 33WebKit (11calculatorlama+22arsip), noJS100form lama serta22arsip, BFS129page, unknown404, sourcecopy/links/dates, axe dan reflow320/375/768/1440. Hasil aktual CI/Preview final dan artifact ditautkan di PR agar tidak mengarang SHA dirinya sendiri. Semua107originalroute tetap; sitemap global129, kalkulator100, hub6, arsip22.

CI evidence dipisah browser, calculator desktop, calculator mobile dan lab agar ZIP dapat ditinjau tanpa melewati batas konektor512MiB; setiap bagian menyertakan commit.json. Tidak menghapus tes atau data bukti untuk mengecilkan artifact. Screenshot lokal harus diinspeksi piksel sebelum disebut INSPECTED; capture CI bukan klaim inspeksi manual setiap piksel fullpage.
