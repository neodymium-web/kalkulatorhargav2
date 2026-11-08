> Dokumen historis. Untuk status terkini baseline b8dd6ee, gunakan [Migration Release](MIGRATION_RELEASE.md) dan [runbook terkini](MIGRATION_CUTOVER_RUNBOOK.md). Jumlah/rencana di bawah adalah bukti pada fase asal, bukan approval atau instruksi eksekusi saat ini.

# Runbook cutover dan rollback: DRAFT, jangan dieksekusi

Issue #53 menyiapkan review, bukan perpindahan domain. Status eksekusi cutover saat ini **NO-GO** sampai gap konten legacy, data SEO, dan approval baru diselesaikan. CI hijau atau deployment READY tidak memberi izin memindahkan domain atau membuka indexing.

## Assignment yang diamati dan risiko host

Konektor Vercel read-only mengamati kedua custom domain pada legacy project `prj_OtNkapBGqShbDEludYl1Ea5QoLz9`, deployment `dpl_kk6BZ55DrPg8hrnTovFjgWvkeJiJ`. Apex `kalkulatorharga.com` mengarah308 ke `www.kalkulatorharga.com`; www melayani legacy. V2 adalah project lain, `prj_p1VRZQiOB0BHJrQSC5JS2rDhYoF7`, dengan domain platform `kalkulatorhargav2.vercel.app`. Bukti sanitasi: [domain-observations.json](audit/cutover/domain-observations.json). Assignment bukan bukti kepemilikan registrar atau izin DNS.

Canonical v2 tetap apex `https://kalkulatorharga.com`, sementara situs lama memakai www. Runbook mengusulkan apex sebagai target mengikuti konfigurasi v2 yang ada, tetapi pemilik SEO/domain wajib menyetujuinya secara eksplisit. Meninggalkan redirect apex→www lama sambil menambah www→apex akan membuat loop. Jangan mengubah salah satu konfigurasi dalam PR ini.

Vercel menyatakan domain hanya dapat di-assign pada satu project; perpindahan project memakai fitur Move pada settings domain menurut [dokumentasi transfer domain](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain). [Pengaturan domain](https://vercel.com/docs/domains/set-up-custom-domain) dan [routing domain](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting) menjadi referensi, bukan otorisasi tindakan. Kemampuan atomik kedua hostname, kesiapan TLS, propagasi cache dan akses registrar belum diuji. Target gangguan minimum, bukan janji zero-downtime.

## Gate owner yang harus lengkap

Instruksi user BARU harus menyebut semua berikut sebelum eksekusi apa pun:

- SHA kandidat lengkap yang telah direview, ID deployment v2 serta legacy yang dibekukan, kedua project ID dan team yang benar.
- Hostname persis `kalkulatorharga.com` dan `www.kalkulatorharga.com`, host canonical yang dipilih, serta arah/status redirect host. Perubahan DNS/alias yang diizinkan harus tertulis, termasuk keputusan tidak mengubah DNS jika tidak diperlukan.
- Daftar redirect path yang disetujui, keputusan untuk 25 halaman legacy tanpa padanan, dan konfirmasi bahwa perubahan fitur preset tarif menjadi manual telah diterima.
- Perubahan env/indexing untuk deployment production yang kelak disetujui; staging/Preview harus tetap noindex dan terlindungi. Mengaktifkan `SITE_INDEXABLE` bukan bagian tugas ini.
- Jendela maintenance/rollback, operator domain yang berwenang, reviewer SEO, reviewer formula/legal dan penanggung jawab keputusan stop/rollback.

Tidak ada placeholder owner yang dianggap sudah menyetujui. Rekam nama operator dan nomor persetujuan/change ticket sebelum jendela dibuka. Jika satu unsur belum ada, STOP.

## Pekerjaan sebelum jendela perubahan

1. Freeze SHA/deployment yang telah direview; jangan menganggap PR terbaru otomatis disetujui. Cocokkan CI/artifact/READY dan ulangi smoke test respons aplikasi yang terlindungi melalui akses yang diotorisasi.
2. Owner menyediakan ekspor GSC/GA4 yang belum tersedia dalam audit ini. GSC: Search results, Web, last6months, tabs Pages serta Queries, metrik clicks/impressions/CTR/position; sertakan page-query pairs bila tersedia, indexing report, sitemap submitted dan URL Inspection untuk prioritas utama. GA4: last6months, Landing page + query string, filter Organic Search, sessions/engaged sessions/key events. Sertakan timezone dan tanggal ekspor. Jangan menaruh PII ke repo.
3. Gabungkan ekspor dengan [legacy inventory](audit/legacy-url-inventory.csv), [107target map](audit/cutover-url-map.csv), backlink penting dan access-log404 bila owner mengizinkan. Public crawl32halaman bukan seluruh indeks. Prioritas trafik/backlink saat ini UNKNOWN.
4. Putuskan retensi/porting25halaman manual-review, termasuk emas, panduan, artikel dan halaman kebijakan. Jangan redirect semuanya ke homepage atau alat yang hanya mirip nama. Dua proposal path301 di [CSV](audit/redirect-proposals.csv) belum disetujui untuk production. Directory lama `/kalkulator` memang sepadan dengan directory v2 `/`; average-down memerlukan review fitur impas tambahan.
5. Backup sanitasi domain assignments, redirect host/path, project/deployment legacy, nilai kontrol indexing tanpa secret, status TLS, DNS records/TTL melalui operator registrar, dan daftar cache/CDN. Simpan snapshot aman di change ticket; jangan mengekspor credential/env secret.
6. Uji deployment legacy yang dibekukan masih dapat dipulihkan dan melayani hostname yang tepat. Jangan menghapus project/deployment lama. Operator memverifikasi hak Move/rollback dan sertifikat sebelum perubahan.
7. Jalankan dry-run lokal one-hop301 dan pemeriksaan107route, no orphan,100fungsi, noJSprivacy, serta viewport/keyboard. Tidak ada redirect simulator yang diimpor ke Next/Vercel routing.

## Urutan cutover yang hanya boleh dijalankan setelah approval baru

1. Catat waktu mulai, SHA/deployment, operator dan persetujuan. Hentikan bila legacy traffic/error tidak sesuai baseline atau rollback tidak tersedia.
2. Siapkan deployment production v2 sesuai SHA/indexing yang secara khusus disetujui, terpisah dari Preview. **Environment Production v2 di vercel.app tidak sama dengan perpindahan custom domain.** Jangan membuka indexing Preview untuk menguji production.
3. Pada jendela yang disetujui, operator menggunakan Settings→Domains→Move untuk hostname yang tercantum, memindahkannya ke project v2 yang benar; tinjau konfirmasi platform. Pindahkan kedua hostname menurut urutan yang diverifikasi operator. Jangan memakai remove+add, force assignment, promote atau perintah otomatis dari PR ini. Jika UI/izin berubah, hentikan dan review ulang prosedur.
4. Terapkan arah redirect host yang disetujui, dengan memastikan redirect lama yang berlawanan tidak tersisa. Pasang hanya path redirect yang disetujui dalam release terpisah. Jangan memetakan emas/artikel/kebijakan ke root tanpa keputusan konten.
5. Operator DNS hanya mengubah record persis yang disetujui bila konfigurasi Vercel memerlukannya. Kepemilikan registrar, nameserver dan TTL harus sudah diketahui. Tidak menjanjikan update DNS seketika.
6. Verifikasi dari jaringan eksternal: TLS kedua hostname, apex/www one-hop yang disetujui, tidak ada loop,107target200, legacy preserve200, approved outdated paths301satu-hop, tidak ada soft404. Periksa header/meta/canonical/robots/sitemap production yang nyata serta cache HIT/MISS. Verifikasi staging tetap noindex/SSO.
7. Hitung ulang smoke input sintetis berisiko tinggi (uang bertanda, nol, nominal maksimum, jadwal, pajak dalam scope, seller manual), tanpa nilai pelanggan. Periksa hydration/console/network serta kebocoran URL. Jika salah angka pada cakupan didukung, rollback.
8. Owner SEO memutuskan sitemap submission dan URL Inspection setelah semua gate lulus. Tidak dilakukan oleh tugas ini. Rekam waktu akhir dan keputusan lanjut/rollback.

## Rollback yang wajib siap sebelum perubahan

| Sinyal | Batas keputusan | Tindakan operator yang kelak diotorisasi |
| --- | --- | --- |
| TLS salah, host tidak melayani, loop redirect atau5xx | Segera; jangan menunggu monitoring harian | Hentikan perubahan, kembalikan kedua hostname/redirect ke project dan deployment legacy dari snapshot |
| Salah angka didukung, data input masuk URL/log atau injection | Segera | Rollback; blokir launch, buka insiden dan remediasi terpisah |
| URL legacy penting hilang/soft404, canonical host salah, noindex production tertinggal | Segera dalam jendela | Pulihkan assignment/config legacy atau perbaiki hanya sesuai izin; jika batas waktu owner terlampaui, rollback |
| Regresi LCP/error/404 atau traffic turun setelah launch | Threshold harus disetujui sebelum jendela; belum ada angka trafik untuk menentukannya | Owner membandingkan baseline dan menentukan rollback; jangan mengarang threshold bisnis |

Operator mengembalikan assignments apex/www dan arah apex→www308 legacy sebagaimana snapshot jika masih menjadi target rollback yang disetujui; mengembalikan DNS hanya bila sebelumnya diubah dan snapshotnya tersedia; memastikan kedua host menuju legacy dengan TLS benar; memeriksa robots/canonical/critical URLs dan cache dari jaringan luar. Catat apa yang pulih dan waktu gangguan aktual. Jangan menyebut rollback berhasil hanya karena tombol platform selesai. Re-verify project/deployment ID pada hari eksekusi, bukan menyalin ID lama tanpa pengecekan.

## Monitoring dan kondisi akhir

Segera,24jam,7hari,28hari: errors/5xx/404, redirect chains/loops, status indeks/GSC canonical, organic landing pages/query legacy, feedback kalkulasi, dan field LCP/INP/CLS p75 bila data memadai. Tidak memasang analytics baru dalam tugas ini. Owner menentukan operator on-call, jendela rollback dan kapan boleh menonaktifkan rollback; project legacy tidak dihapus oleh audit ini.

Gate persiapan dapat CONDITIONAL GO setelah P2 aman dan bukti pengujian selesai. Gate eksekusi tetap NO-GO selama25gaplegacy,GSC/GA4,host policy,perangkat nyata atau approval khusus belum selesai. Runbook ini tidak memberi kewenangan cutover meskipun seluruh tes hijau.
