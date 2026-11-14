# Kandidat migrasi: dua URL tersedia, cutover belum diizinkan

Baseline main 1b8278b3; branch implementasi terpisah. Otorisasi master terbaru mengizinkan kode staging untuk saham dan fallback benchmark manual serta persiapan www. PR #64 dipakai sebagai sumber, tidak di-merge; PR #68 tidak diubah dan bukan blocker engineering. Tidak ada produksi legacy, domain, DNS, alias atau environment yang dimutasi.

## Route, inventaris dan indexing

100 ID kalkulator asli tetap. Dua supplementary lama (emas, bandingkan) ditambah dua tool migrasi menghasilkan 133 route yang dapat dicapai dari root:107 registry/home/hub + 22 arsip + 4 supplementary. Arsip masih PENDING_OWNER_APPROVAL. Referensi historis ke saham/benchmark dalam arsip tetap nonklik: tersedianya route bukan persetujuan referensi atau bukti parity. Tidak ada redirect massal atau redirect saham ke weighted-average-only. /kalkulator dipertahankan sebagai alias200 direktori bersama, canonical root, tanpa301. Alias noncanonical tidak ditambahkan ke sitemap. Seluruh32URL inventaris legacy memiliki route200 pada kandidat; ini bukan klaim parity atau publikasi arsip approved. Matriks 33 URL di PR #67 merupakan input historis, status saham/benchmark kini 200 pada kandidat ini; rekomendasi HOLD parity/data tidak dihapus.

Staging tetap SSO/noindex dan sitemap staging 133 URL seperti model inventory, bukan submission production. Runtime canonical tetap apex. releaseConfiguration mengaktifkan www hanya bila VERCEL_ENV=production, MIGRATION_CUTOVER_APPROVED=true dan SITE_INDEXABLE=true secara bersamaan, **tidak disetel dalam tugas ini**. Preview/development tidak dapat mengaktifkan www melalui flag tersebut. Saat diaktifkan kelak, sitemap eligible 111 URL mengecualikan 22 arsip yang belum approved; arsip memiliki meta robots noindex/nofollow eksplisit. Exclusion bukan approval menghapus URL atau bukti arsip aman dipublikasikan; status arsip harus diselesaikan sebelum cutover. Host redirect apex→www belum diaktifkan.

## Fungsi dan batas yang jujur

Saham: mode gross+fee atau inclusive broker, multi-buy, average, partial sale/net/ROI, theoretical BE dan minimum whole-lot affine solver dengan proof/predecessor, BigInt/rasional. Tarif hanya input manual. Fee capped/nonlinear, nota broker/FIFO dan validitas order BEI lengkap belum tersertifikasi. Tabel fraksi dari sumber primer dan anchor harian digunakan sebagai informasi; grid kandidat manual tetap hipotetis, bukan harga pasti sah diperdagangkan. Ini remaining parity gap yang nyata, bukan alasan mengarang aturan.

TikTok benchmark: exact URL berisi perbandingan manual A/B, basis followers/views, rasio dan delta pp eksak, metode dan batas sampling. Tidak ada median/kuartil/industri/nilai pihak ketiga, username lookup atau klaim paritas dataset legacy. Dataset berizin tetap diperlukan bila owner mensyaratkan parity studi.

Rumus/sumber/oracle: MIGRATION_IMPLEMENTATION.md, STOCK engine fixtures dan tests/migration-completion*. Nilai kerugian dan pembagi0 tidak disembunyikan. Input perubahan membersihkan hasil. Reuse StructuredForm, ResultPanel, CreatorComparison, CSS Modules/tokens. Script WebApplication JSON-LD tidak memuat rating, tarif atau klaim resmi rekaan.

## Snapshot sebelum tindakan

- docs/audit/migration-implementation/platform-observation.json: metadata read-only Vercel, dua host→legacyproject prj_OtNkapBGqShbDEludYl1Ea5QoLz9 / dpl_kk6BZ55DrPg8hrnTovFjgWvkeJiJ; apex 308→www. Project tujuan v2 prj_p1VRZQiOB0BHJrQSC5JS2rDhYoF7.
- dns-observation.json: A/AAAA/CNAME/NS/SOA/MX/TXT/CAA yang terlihat publik, TTL dan waktu observasi. Perbedaan jawaban resolver vs metadata platform disimpan apa adanya; jangan dianggap zone lengkap yang bisa di-restore.
- Full authoritative DNS export, TLS/config recovery snapshot, rollback legacy SHA yang disahkan, operator+backup+decision owner, window/threshold dan measured recovery tetap UNKNOWN. Tidak mengarang kesiapan dari akses konektor.

## Urutan operasional bersyarat, bukan izin eksekusi

1. Owner mereview PR/HEAD dan parity limitations, menyelesaikan disposition /kalkulator, 22 arsip / 6 referensi, kebutuhan dataset, SEO baseline/pages×queries/GA4/backlinks serta source/rights. Engineering kandidat tidak menyatakan cutover GO.
2. Operator yang ditunjuk membekukan kandidat exact SHA + READY deployment dan legacy rollback SHA + deployment; mengambil authoritative zone export beserta TTL, kedua domain assignments/redirects, TLS dan env/indexing config pada change ticket aman. Jangan simpan secret/PII di repo.
3. Dapatkan instruksi owner terpisah yang menyebut dua host, proyek/team/deployment, window, perubahan yang tepat, operator+backup, trigger dan batas rollback. Pastikan kedua project/deployment tetap tersedia dan hak recovery teruji.
4. Dengan izin tersebut saja, gunakan prosedur Move Domain Vercel antarproject yang berlaku pada hari itu. Jangan menghapus domain sumber terlebih dahulu atau menganggap dua host dapat dipindahkan atomik. Jangan membuat arah www→apex berlawanan. Jika satu hostname saja berubah, STOP dan pulihkan sesuai snapshot.
5. Aktifkan konfigurasi canonical/sitemap/indexing production hanya sesuai izin. Preview tetap SSO/noindex. DNS hanya bila diperlukan dan persis diotorisasi; jangan mengganti nameserver berdasarkan rekomendasi otomatis.
6. Smoke eksternal kedua host: TLS, one-hop status/path/query, canonicalwww, sitemapeligible, robots production yang diotorisasi, root + 100 calculator, 4 supplementary, arsip yang dispositionnya approved dan unknown URL 404. Pastikan tidak ada soft404, loop atau error, dan staging tetap terproteksi.
7. Jika TLS/partial move/loop/5xx, wrong canonical/indexing, critical URL hilang atau hasil salah, STOP. Pulihkan **kedua** assignment/deployment/redirect, env/canonical sebelumnya dan DNS hanya jika sempat diubah; validasi dari luar per host dan catat recovery duration aktual. Routing rollback tidak memulihkan data/transaksi baru. Threshold traffic/error/bisnis harus berdasarkan baseline owner, bukan angka rekaan.
8. Monitoring segera/24 jam / 7 hari / 28 hari:404/5xx, crawl/indexation/GSC/sitemap, organic landing/query dan GA4 key events bila tersedia, backlink critical, field CWV jika cukup data. Sitemap submission/inspection hanya dengan izin. Tidak otomatis mengirim Change of Address untuk www/non-www pada domain sama.

Tes runbook yang ada adalah simulasi objek lokal (tiga failure stages), bukan rehearsal platform. New application changes hanya 16 file yang diberi hash eksplisit pada application-changes.json, baseline 180 file lain tetap dilindungi; engine 100 calculator tidak diubah. Guard historis dipertahankan, NO-GO tetap mandatory. CI/Preview exact SHA dicatat di PR untuk menghindari self-referential commit.

Keputusan: kandidat implementasi untuk review, bukan migration complete/GO. Production cutover tetap menunggu instruksi owner yang terpisah. Tidak merge/auto-merge.
