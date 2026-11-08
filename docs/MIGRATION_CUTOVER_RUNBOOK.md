# Cutover dan rollback: prosedur review, belum diotorisasi

Rujukan keputusan: [Migration Release](MIGRATION_RELEASE.md) dan [register](audit/migration-release/register.json). Baseline b8dd6ee. **NO-GO untuk eksekusi.** Simulasi lokal tidak memindahkan domain dan tidak membuktikan rollback platform. Tidak ada perintah mutasi platform pada paket ini.

## Intake yang belum lengkap

| Isian wajib | Nilai saat ini |
| --- | --- |
| SHA yang disetujui untuk cutover, bukan sekadar head PR | UNKNOWN |
| Deployment production kandidat yang telah diuji pada SHA tersebut | UNKNOWN; Preview READY bukan production readiness |
| Legacy project/deployment snapshot | Teramati `prj_OtNkapBGqShbDEludYl1Ea5QoLz9` / `dpl_kk6BZ55DrPg8hrnTovFjgWvkeJiJ`; wajib revalidasi hari eksekusi |
| Project tujuan | V2 `prj_p1VRZQiOB0BHJrQSC5JS2rDhYoF7`; bukan izin assignment |
| Hostname lingkup | `kalkulatorharga.com`, `www.kalkulatorharga.com`; arah canonical/redirect approved UNKNOWN |
| Owner konten/legal/SEO, operator domain, reviewer dan incident commander | UNKNOWN; peran bukan nama orang yang menyetujui |
| Change ticket / bukti approval / waktu persetujuan | UNKNOWN |
| Jendela mulai/selesai dan batas keputusan rollback | UNKNOWN |
| GSC/GA4/backlinks, daftar URL prioritas dan baseline bisnis | UNKNOWN |
| DNS/registrar/TTL/TLS/config snapshot, hak Move dan recovery operator | UNKNOWN |
| 22 disposition arsip, benchmark, 6 referensi, manual scope dan 2 redirect | Belum approved; lihat setiap ID register |
| Perubahan production-only indexing, canonical, domain, alias, DNS yang persis diizinkan | UNKNOWN; tidak ada izin dalam tugas ini |
| Threshold monitoring/rollback dan reviewer perangkat nyata | UNKNOWN |

Jika satu gate wajib belum lengkap, STOP. Isi hanya dengan bukti owner yang nyata; jangan mengisi UNKNOWN dengan hasil inferensi dari public crawl, CI, deployment READY atau hak akses konektor.

## Dry-run lokal yang dapat dijalankan sekarang

1. `node scripts/migration/release-gates.cjs` memeriksa fingerprint aplikasi/konfigurasi, overlay 32 path, 131 target, 22 arsip dan 6 instance referensi. Laporan konsistensi PASS tidak mengubah keputusan NO-GO.
2. `node scripts/migration/release-gates.cjs --require-cutover` harus menghasilkan exit 2. `--apply` ditolak; tidak ada jalur menulis DNS/alias/Vercel.
3. Unit test menguji kedua hipotesis host, target langsung host+path, query UTM, query preset UNKNOWN, benchmark/unmapped 404, dan loop bila dua arah host digabung. Proposal redirect tetap tidak aktif; URL proposal pada aplikasi saat ini tetap 404.
4. Injeksi kegagalan sesudah hostname pertama, kedua, dan validasi akhir; inverse journal mengembalikan assignments, redirect dan canonical objek lokal. Assert snapshot sama, staging SSO/noindex tetap, dan snapshot asal tidak dimutasi. Kegagalan parsial adalah kondisi rollback, bukan keadaan layak launch.
5. CI menghasilkan ulang laporan di `test-results/migration-release/report.json`; manifest `commit.json` mengikat artifact ke head. Hasil ini simulasi logika, bukan pengukuran recovery time, TLS/DNS atau latihan Move di platform.

## Sebelum jendela yang kelak disetujui

- Owner menutup tiap gate dengan keputusan, reviewer, tanggal, scope dan bukti. Keputusan benchmark harus menyelesaikan kehilangan URL legacy 200: data berizin yang reproduktif, retirement yang benar-benar disetujui setelah kajian SEO, atau alternatif setara. 404 sekarang tidak dianggap approval removal.
- SEO menggabungkan ekspor GSC/GA4/backlink dengan overlay dan map; inventaris publik belum menjamin semua indexed URLs tercakup. Review kedua redirect per intent. Tidak mengarahkan artikel/benchmark/preset massal ke homepage.
- Pilih satu host dan satu arah redirect yang konsisten dengan canonical/sitemap. Opsi www memerlukan perubahan canonical v2 di task baru; opsi apex memerlukan penggantian aturan apex→www lama. Tidak menumpuk aturan dua arah. Verifikasi query/preset yang belum dimodelkan sebelum menyetujuinya.
- Operator membekukan kandidat dan rollback SHA/deployment, memverifikasi kedua project/team/host, akses dan hak recovery, snapshot assignment/redirect/path/indexing/TLS/DNS/TTL serta cache di change ticket aman. Jangan menyimpan token/PII di repo. Observasi historis bukan snapshot hari perubahan.
- Pastikan legacy masih dapat dipulihkan, project/deployment tidak dihapus, dan prosedur pemulihan dapat dijalankan operator yang sama pada jendela tersebut. Kemampuan memindah kedua hostname secara atomik belum dibuktikan. Siapkan keputusan gagal setelah satu hostname.
- Uji kandidat production yang kelak disetujui pada SHA yang sama, termasuk TLS/routing dan production indexing yang benar. Preview tetap SSO/noindex. Jangan membuka Preview untuk menyerupai production.
- Owner menetapkan threshold berbasis baseline, on-call, jendela rollback dan acceptance perangkat nyata. Tidak ada target trafik atau menit recovery rekaan dalam runbook ini.

## Urutan eksekusi bersyarat: perlu instruksi owner BARU

Bagian ini hanya urutan untuk direview. Jangan dijalankan berdasarkan PR ini.

1. Cocokkan change ticket dengan SHA, deployment, project, hostnames, arah/status host/path redirect, perubahan DNS/alias/canonical/indexing yang persis diizinkan, operator, window dan rollback. Rekam waktu aktual. STOP bila berbeda atau gate belum ditutup.
2. Operator memeriksa prosedur Vercel terkini dan lingkungan tujuan. Perpindahan antar-project bukan transfer registrar/team. Dokumentasi primer saat review menyatakan domain ditambahkan pada project tujuan lalu Move Domain dikonfirmasi, tanpa menghapus domain sumber lebih dulu; tinjau seluruh domain terkait yang akan ikut pindah. Jangan mengasumsikan UI lama atau kedua hostname dipindahkan atomik.
3. Jalankan hanya perubahan yang tertulis pada approval; hapus aturan host berlawanan sebagai bagian paket yang disetujui. Jika hanya satu hostname berhasil, STOP dan gunakan rollback yang telah disiapkan; jangan menebak perubahan tambahan. DNS hanya disentuh bila persis diizinkan dan diperlukan.
4. Periksa dari jaringan eksternal: TLS tiap host, host/path redirect langsung, query yang disetujui, 131 URL terbit, semua legacy disposition yang approved, canonical/header/meta/robots/sitemap production yang benar, tidak ada soft404/loop/5xx. Verifikasi Preview tetap SSO/noindex. Cek cache HIT/MISS agar tidak membaca versi lama.
5. Jalankan smoke otomatis sintetis atas alur berisiko dan fitur legacy yang diterima; tidak mengulang audit manual seluruh 100 alat kecuali ada regresi. Periksa console/hidrasi/kebocoran input. Jika salah angka dalam scope, exposure input, atau critical URL hilang, rollback.
6. SEO hanya melakukan sitemap submission/inspection bila mendapat izin terpisah dan seluruh gate lulus. Perubahan hosting atau www/non-www pada domain yang sama tidak memerlukan Change of Address menurut sumber Google; jangan mengirimnya otomatis. Catat GO/rollback dan waktu aktual.

## Pemulihan bila terjadi kegagalan

| Sinyal | Keputusan | Pemulihan yang harus disiapkan operator |
| --- | --- | --- |
| Partial host move, TLS gagal, host salah, loop atau 5xx | STOP segera | Pulihkan kedua assignments dan redirect dari snapshot, bukan hanya hostname terakhir |
| Salah hasil didukung, injection atau input bocor | STOP segera | Pulihkan release/assignment legacy yang dibekukan; buka insiden dan remediasi terpisah |
| Critical URL hilang, soft404, canonical salah, production masih noindex | STOP dalam jendela | Pulihkan sesuai snapshot jika tidak dapat diperbaiki dalam batas waktu owner |
| Staging terbuka/indexable | STOP segera | Jalankan prosedur recovery kontrol akses yang disetujui dan pastikan SSO/noindex pulih; jangan membuka staging untuk melanjutkan QA |
| Trafik/error/404/CWV memburuk pasca-launch | Threshold UNKNOWN | Owner membandingkan baseline dan memutuskan; tidak menebak ambang persentase atau durasi |

Urutan pemulihan: catat kondisi terakhir tiap host; pulihkan assignments project/deployment legacy, host redirect dan path config dari snapshot yang disetujui; kembalikan DNS hanya jika sempat diubah dan snapshot tersedia; verifikasi TLS, hop/status, canonical/robots, URL kritis dan konten legacy dari jaringan luar. Staging tetap terproteksi. Catat hasil per-host, durasi gangguan dan bukti HTTP aktual. Tombol Move selesai atau objek simulasi sama bukan bukti recovery berhasil. Bila ada perubahan data/transaksi setelah launch, operator harus menilai konsistensinya; inverse routing tidak memulihkan data.

Monitoring segera, 24 jam, 7 hari dan 28 hari: error/5xx/404, redirect, canonical/indexing GSC, organic landing pages/query dan field CWV bila memadai. Owner harus menentukan penanggung jawab dan kapan rollback boleh dihentikan; audit ini tidak memasang analytics atau menghapus legacy.

Sumber primer: [Vercel transfer antar-project](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain), [Google site move](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Diverifikasi 8 November 2026 Asia/Jakarta; verifikasi ulang sebelum tindakan di masa depan. Ini dokumentasi, bukan otorisasi.
