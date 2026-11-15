# Audit SEO pascamigrasi KalkulatorHarga.com

Baseline repository: `main@a8744da1e0c2b47fbcc09830e5f23a1d63e01d25`. Pemeriksaan 15 November 2026, zona laporan Asia/Jakarta. Waktu setiap GET disimpan dalam UTC di bukti JSON. Target yang diperiksa langsung: **https://www.kalkulatorharga.com**, bukan localhost atau hasil mesin pencari yang mungkin tersimpan lama.

**Hasil P0: PASS pada sampel waktu crawl.** Seluruh 134 URL HTML yang diharapkan merespons 200, tanpa redirect tak terduga, 5xx, canonical bertentangan, title/H1 kosong/ganda, atau noindex yang melanggar kebijakan saat ini. HPP masih belum tercatat di indeks Google menurut inspeksi tersimpan; penyebab spesifik belum dapat dipastikan. Warning Dataset benchmark berasal dari versi legacy yang terakhir dirayapi Oktober, sedangkan HTML production sekarang berisi WebApplication.

Tidak ditemukan cacat runtime SEO yang membenarkan perubahan aplikasi. PR ini menambahkan inventaris, verifier HTTP, bukti dan regression tests. **Tidak mengubah title/deskripsi, schema, tautan aplikasi, URL, canonical, sitemap, robots, engine, approval arsip, pengaturan Search Console atau Vercel. Tidak deploy/merge production.**

## Inventaris yang diharapkan dan diuji

Inventaris berasal dari registry aktual, published paths, supplemental/migration routes, record legacy, dan pemindaian halaman statis App Router. Generator menolak duplikasi, kalkulator hilang, atau halaman statis yang belum diklasifikasikan. Tidak menyalin daftar sitemap production sebagai satu-satunya sumber harapan.

| Kelompok | Jumlah | Status HTTP | Kebijakan production |
| --- | ---: | --- | --- |
| Kalkulator registry | 100 | 100 × 200 | Indexable, canonical sendiri, dalam sitemap |
| Beranda + enam hub | 7 | 7 × 200 | Indexable, canonical sendiri, dalam sitemap |
| Emas + bandingkan | 2 | 2 × 200 | Scope manual, dalam sitemap |
| Saham average + benchmark manual | 2 | 2 × 200 | Dalam sitemap; batas fungsi/metode tetap dijelaskan |
| Legacy menunggu approval | 22 | 22 × 200 | Meta noindex/nofollow; sengaja tidak dalam sitemap |
| `/kalkulator` | 1 | 200 tanpa redirect | Alias direktori, canonical `/`, tidak dalam sitemap |
| **Total HTML** | **134** | **134 × 200** | **111 sitemap +22 pending +1 alias** |

Record legacy semuanya masih `PENDING_OWNER_APPROVAL`; **tidak ada legacy tambahan dengan bukti approval terdaftar**. Nama helper `publishedPaths()` dan status HTTP 200 bukan izin publikasi arsip. Dua puluh dua URL tetap dipertahankan sebagai halaman, tidak dihapus atau dialihkan.

Bukti lengkap:

- [Inventaris dan sumbernya](audit/post-migration-seo/inventory.json).
- [Seluruh URL, HTTP, canonical, index policy, title, deskripsi dan H1](audit/post-migration-seo/production-urls.csv).
- [GET production lengkap, redirect hops, header/TLS, hash body, JSON-LD dan tautan SSR](audit/post-migration-seo/production-before.json).
- [GET follow-up tujuh URL kritis, audit UA/Googlebot UA dan endpoint](audit/post-migration-seo/production-followup.json).
- [URL Inspection dan performance GSC yang dibaca tanpa mutasi](audit/post-migration-seo/search-console.json).
- [Snapshot read-only domain/alias](audit/post-migration-seo/platform-observation.json).

## HTTP, canonical, robots dan sitemap

- Sitemap memuat tepat **111 URL unik**. Seluruhnya cocok dengan kebijakan registry dan canonical production `https://www.kalkulatorharga.com`. Tidak ada alias direktori atau 22 arsip pending di dalamnya.
- Seluruh **111 halaman eligible tercapai dari root melalui tautan HTML SSR**, tanpa klik JavaScript, sitemap sebagai pintu masuk, atau melewati arsip pending. Daftar lengkap kategori di disclosure native tetap ada dalam HTML awal.
- `robots.txt` HTTP 200, `Allow: /`, deklarasi sitemap memakai host www. Tidak ada blokir Googlebot untuk URL eligible yang diuji. Tidak ada header noindex pada halaman eligible; meta robots `index, follow`.
- Apex root dan ketujuh URL kritis diuji melalui GET dengan query: **308 langsung ke www, lalu 200**. Path dan query dipertahankan. Tidak ada chain tambahan atau loop pada delapan kontrol tersebut.
- Semua URL www dalam inventaris merespons 200 langsung. Root canonical tanpa trailing slash dinormalisasi secara URL, bukan ditandai sebagai konflik.
- URL kalkulator yang sengaja tidak ada menghasilkan **404 sebenarnya**, bukan homepage/soft 404. Kontrol ini terpisah dari 134 URL yang memang harus ada.
- curl memverifikasi sertifikat TLS secara default, tanpa opsi insecure. Status/hop, header tanggal dan hash payload tersimpan. Ini snapshot jaringan, bukan jaminan uptime atau representasi setiap lokasi/IP Google.

| URL penting | HTTP | Canonical | Indexability HTTP/HTML | Intent yang dipertahankan |
| --- | --- | --- | --- | --- |
| `/kalkulator/tiktok` | 200 | Sendiri, www | Diizinkan | Kreator, empat modul, asumsi manual |
| `/kalkulator/emas` | 200 | Sendiri, www | Diizinkan | Quote/kadar/biaya manual; bukan harga live |
| `/kalkulator/saham/average` | 200 | Sendiri, www | Diizinkan | Average/multi-buy/impas/target lot; validitas order BEI tetap terbatas |
| `/kalkulator/tiktok/benchmark` | 200 | Sendiri, www | Diizinkan | Perbandingan manual A/B, bukan dataset industri |
| `/kalkulator/hpp` | 200 | Sendiri, www | Diizinkan | Harga pokok produksi per unit |
| `/kalkulator/shopee` | 200 | Sendiri, www | Diizinkan | Simulasi biaya seller manual |
| `/kalkulator/tiktok-shop` | 200 | Sendiri, www | Diizinkan | Seller, terpisah dari intent kreator |

"Diizinkan" adalah hasil pemeriksaan HTTP/HTML/robots, **bukan klaim sudah diindeks**. Tujuh URL juga diminta dengan header Googlebot; itu hanya probe user-agent, bukan permintaan dari IP Google yang terverifikasi.

## HPP: diagnosis indexing yang dapat dibuktikan

Owner sebelumnya melaporkan “Discovered, currently not indexed”, tanpa tanggal/ekspor inspeksi pada permintaan ini. Pembacaan URL Inspection API pada 15 November untuk property `https://www.kalkulatorharga.com/` mengembalikan **“URL is unknown to Google”**, verdict NEUTRAL, tanpa lastCrawlTime atau Google-selected canonical. Perbedaan snapshot tersebut dicatat, tidak dianggap sebagai dua diagnosis yang sama atau bukti perbaikan indexing.

Yang terverifikasi pada production saat ini:

1. HTTP 200, tidak ada auth/redirect di URL HPP; robots mengizinkan; meta index/follow dan tidak ada X-Robots-Tag noindex.
2. Canonical sendiri `https://www.kalkulatorharga.com/kalkulator/hpp`, satu title `Kalkulator HPP | KalkulatorHarga`, satu H1 `Kalkulator HPP`, deskripsi biaya produksi yang sesuai intent.
3. Termasuk sitemap www; link HPP terlihat di HTML awal homepage dan Bisnis. Terdapat **22 anchor masuk dari 21 halaman eligible lain**, setelah mengeluarkan self/fragment link dan origin eksternal. Bisnis memiliki link kartu serta daftar lengkap; keduanya dihitung sebagai anchor terpisah.
4. Rumus, contoh, asumsi, batas pembulatan dan FAQ ada di SSR. Tanpa JavaScript, konten tetap terbaca; hanya interaksi menghitung yang dinonaktifkan agar input tidak terkirim melalui URL.

Tidak ditemukan penghalang teknis yang menjelaskan pengecualian indeks. Belum ada bukti untuk menyalahkan canonical, noindex, metadata pendek, kualitas konten, penalti atau crawl budget. Data GSC performance berakhir **12 November**, sebelum migrasi 15 November, sehingga belum mengukur dampak v2. Ketidaktersediaan baris HPP pada hasil performance bukan bukti jumlah trafik nol.

Tindakan: pertahankan URL dan metadata yang benar, pantau tanggal crawl/coverage melalui pembacaan GSC berikutnya. Live Test Google, crawl log IP Google, manual actions dan keputusan kualitas Google tidak dibuktikan oleh audit HTTP ini. Tidak melakukan request indexing, sitemap submission, Change of Address atau perubahan property. Google menjelaskan bahwa crawl dapat memerlukan hari hingga minggu dan permintaan crawl tidak menjamin indexing. [Google: recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [batas URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en).

## Benchmark: warning lama versus markup yang sedang disajikan

Inspeksi tersimpan Google menunjukkan crawl terakhir **25 Oktober 2026**, dengan Dataset bernama “Benchmark engagement rate TikTok per tingkat pengikut dan ukuran akun”: warning missing `license` dan invalid object type `creator`. Status rich results PASS tidak berarti warning tersebut hilang, dan tidak membuktikan markup production saat ini.

GET production sekarang menemukan satu script JSON-LD:

```json
{"@context":"https://schema.org","@type":"WebApplication","name":"Analisis engagement TikTok manual","url":"https://www.kalkulatorharga.com/kalkulator/tiktok/benchmark","applicationCategory":"UtilitiesApplication","operatingSystem":"Any","inLanguage":"id-ID"}
```

Tidak ada Dataset, distribution, creator atau lisensi dataset yang dipublikasikan di script itu. Halaman menjelaskan data input manual dan belum adanya parity dataset legacy. **Tidak menambahkan license, creator, rating, review atau harga rekaan untuk membungkam warning historis.** Tidak mengklaim sudah lolos seluruh Google Rich Results Test; parser audit hanya memeriksa JSON, tipe dan URL yang tersaji. Field lisensi/creator relevan bila dataset nyata dengan hak yang terbukti diterbitkan nanti. [Google: Dataset](https://developers.google.com/search/docs/appearance/structured-data/dataset).

## Baseline GSC untuk URL yang perlu dilindungi

Read-only performance, property www, data final **16 Oktober–12 November 2026** (tanggal pelaporan GSC Pacific Time). Angka berikut cocok dengan input owner; semuanya periode legacy sebelum migrasi. Average position adalah rata-rata GSC, bukan posisi SERP live.

| URL | Impressions | Clicks | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/kalkulator/emas` | 1.614 | 7 | ≈0,43% | 8,7 |
| `/kalkulator/tiktok` | 320 | 20 | 6,25% | 8,4 |
| `/kalkulator/saham/average` | 77 | 2 | ≈2,60% | 16,6 |

CTR emas sendiri belum membuktikan title buruk atau penurunan akibat migrasi. Tidak mengubah metadata untuk menjanjikan harga real-time yang tidak tersedia. Pertahankan scope manual dan kumpulkan data setelah migrasi dengan rentang/query yang sepadan sebelum menguji perubahan CTR. TikTok kreator dan TikTok Shop seller tetap URL dan intent berbeda; tidak di-redirect satu sama lain.

## Temuan, perbaikan dan risiko tersisa

| Prioritas | Temuan terverifikasi | Keputusan / solusi yang diuji |
| --- | --- | --- |
| P0 | Tidak ada pelanggaran kontrak URL production yang teramati | Jangan mengubah runtime yang benar; simpan bukti dan verifier yang exit nonzero bila status/canonical/noindex/sitemap/redirect menyimpang |
| P1 | HPP belum tercatat pada inspeksi tersimpan Google | Cek teknis live lulus; regression test SSR discovery dan production-mode contract. Penyebab indexing tetap UNKNOWN; jangan mengklaim metadata memaksa index |
| P1 | Warning Dataset berasal dari crawl legacy | Tes markup benchmark saat ini; tidak menambahkan lisensi/creator fiktif atau menghapus URL |
| P1 | Sebagian arsip mempunyai impresi historis, tetapi 22 URL kini sengaja noindex karena approval pending | Risiko trafik arsip nyata sebagai kebijakan, bukan salah baca header. Status/URL dipertahankan. Memulihkan eligibility perlu keputusan owner per URL beserta hak/sumber; PR ini tidak mengarang approval |
| P2 | Belum ada baseline performance setelah migrasi | Jangan menyimpulkan trafik turun/naik dari data sampai 12 November; pisahkan data legacy dan v2 |
| Verifikasi | Catatan pengikatan domain lama ditemukan di riwayat | Read-only API saat audit sudah menunjukkan kedua domain verified di proyek v2 dan alias www di deployment saat ini. Bukan masalah yang diperbaiki PR ini; tidak ada perubahan platform |
| Tes | Guard audit Git lama timeout 5 detik pada dua run lokal | Timeout **tes itu saja** menjadi 20 detik untuk verifikasi banyak Git objects. Seluruh assertion NO-GO/approval/hash tetap, tanpa skip atau pelonggaran kondisi |

Belum ada runtime fix yang perlu di-deploy. Perubahan yang diimplementasikan adalah generator inventaris, verifier GET/redirect/HTML, regression tests untuk production/staging dan tujuh route, unit parser dengan kasus gagal, serta CI lokal yang membedakan bukti staging dari production. Semua file aplikasi/engine/SEO tetap identik dengan baseline.

## Before/after dan pengujian

- **Before production:** seluruh 134 URL, endpoints, delapan apex controls dan unknown-404 control diambil dari jaringan luar; metadata, header, hash HTML serta graph SSR disimpan.
- **Follow-up production:** tujuh URL kritis dengan dua user-agent serta robots/sitemap diperiksa ulang. Ini re-verifikasi production yang tidak diubah, **bukan klaim fix kandidat sudah dideploy**.
- **Kandidat lokal/CI:** seluruh 134 halaman diuji sebagai staging: noindex, robots disallow, canonical apex staging dan sitemap 133 (berbeda dari production yang 111). Report berlabel `mode: staging`; tidak dipakai sebagai bukti Google indexing atau HTTP production.
- **Unit:** kesetaraan inventaris/registry, 100 ID, production www/111 eligible serta preview/development noindex meski flag release diisi; parser mendeteksi canonical salah/ganda, noindex, XML ganda/missing, chain/external redirect, loop/network failure, JSON-LD rusak, H1/title/description, dan self-link yang tidak boleh dianggap inbound.
- **Playwright:** tujuh route, SSR metadata, no-JS HPP discovery/metodologi, schema benchmark, robots staging, alias canonical dan 404. Seluruh regression suite kalkulator yang ada tetap dijalankan.

Hasil perintah final, CI dan SHA PR dicatat pada deskripsi PR setelah benar-benar selesai. Run unit awal mengalami timeout yang disebut di atas; tidak disebut lulus. Tidak ada merge, deploy production, perubahan domain/DNS/alias/env atau setting GSC pada pekerjaan ini.

## Cara mengulang verifikasi

Prasyarat: Node 22, npm lockfile, Python 3 dan curl dengan CA TLS yang berfungsi. Dari root repository:

```bash
npm ci
node scripts/post-migration-seo/inventory.cjs test-results/post-migration-seo/inventory.json
python3 scripts/post-migration-seo/verify.py --output test-results/post-migration-seo/production.json
python3 -m unittest discover -s scripts/post-migration-seo -p 'test_*.py' -v
npm run typecheck
npm test
npm run build
node scripts/post-migration-seo/local-contract.mjs
npx playwright test
npx playwright test --config=playwright.audit-webkit.config.ts
```

Verifier production hanya melakukan GET. DNS/TLS/network failures dicatat sebagai kegagalan dan exit nonzero, tidak diganti dengan hasil localhost atau di-skip. Script tidak memerlukan token dan tidak membuat tautan bypass SSO. CI menjalankan unit parser serta kontrak HTTP **localhost staging**, menyimpan report dalam `browser-evidence`; perintah production di atas tersedia untuk reproduksi terpisah. Jika jaringan CI tidak dapat mengakses situs publik, operator dapat menjalankan perintah GET yang sama dari mesin yang memiliki akses dan menyimpan timestamp/report, tanpa membuka staging.

Canonical dan sitemap adalah sinyal pilihan URL, bukan perintah yang menjamin Google memilih atau mengindeksnya. [Google: canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
