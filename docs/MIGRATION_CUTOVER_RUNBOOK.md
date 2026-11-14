# Runbook Final Release Gate: belum aktif, cutover NO-GO

Baseline main125e93d. [Plan terkini](audit/final-release/plan.json) dan [status gate](MIGRATION_RELEASE.md) mengikuti Issue #60. www dipilih owner untuk masa depan; canonical aplikasi tetap apex. Tidak ada perintah mutasi pada paket ini. PR #64 dibekukan dan tidak termasuk kandidat release ini.

## Pemeriksaan yang boleh dilakukan sekarang

1. Jalankan `node scripts/migration/final-release.cjs`. Pastikan 180 fingerprint runtime/config identik dengan main125e93d dan Git tree, 131 calon URL nonaktif, 22 approval arsip serta enam referensi tetap tertahan. Tidak memperbaiki fitur untuk mengejar GO.
2. Jalankan `node scripts/migration/final-release.cjs --require-release`. Exit2/NO-GO adalah hasil yang benar. Tidak ada mode apply. Guard historis tetap dijalankan sebagai regresi, bukan sumber keputusan host terkini.
3. Model hanya memakai rencana www. Seluruh path sitemap pada host apex diarahkan secara hipotetis satu hop ke www; host www tidak kembali ke apex. Usulan root301 diuji terpisah, tidak dianggap approved. Saham, benchmark, query preset dan path tak terpetakan menghasilkan HOLD, bukan fallback homepage atau approval404.
4. Injeksi kegagalan setelah host pertama, kedua dan validasi akhir harus memulihkan objek lokal persis. Snapshot model memuat ID dari observasi read-only, bukan snapshot platform yang dibekukan/ditandatangani. SSO/noindex dalam objek adalah invariant yang diwajibkan, bukan hasil tes akses platform baru.
5. CI penuh menghasilkan artifact final-release/report.json dan commit.json; cocokkan HEAD dengan CI/Preview READY. Tidak ada klaim rollback platform, TLS/DNS, akses operator atau lama recovery dari simulasi ini.

## Intake sebelum instruksi aktivasi baru

| Wajib | Status sekarang / penutup gate |
| --- | --- |
| 22 arsip | PENDING_OWNER_APPROVAL per URL; reviewer berwenang, tanggal, hak teks/byline, legal/sumber/proses dan disposition koreksi/provenance |
| Benchmark | URL dipertahankan sebagai target; dataset/metode/hak upstream belum approved; main404 bukan retirement |
| Enam referensi | Nonklik; intent/destination/provenance belum diputuskan |
| Saham | Exact path/parity belum diterima; PR64 frozen; dilarang weighted-average-only301 |
| GSC/GA4/backlinks | Ekspor berprovenance, cakupan/filters/timezone/period dan URL prioritas belum diberikan |
| www | Pilihan owner sudah ada; izin canonical/sitemap/metadata/host308 activation belum ada |
| Redirect root | Proposal301 belum disahkan per intent/query/SEO; tidak ada mass redirect |
| Kandidat dan legacy rollback | Exact SHA/deployment/project/team dan kedua host yang disetujui belum ditentukan untuk cutover |
| Operator / backup / decision owner | Nama, akses dan hak recovery belum diberikan; peran bukan approval |
| Window dan snapshot | Tiket, waktu, DNS/TTL/TLS/assignment/redirect/env/indexing dan rollback snapshot belum disahkan |
| Monitoring dan pemulihan | Baseline bisnis/error/404/CWV, threshold, durasi recovery nyata dan batas rollback belum tersedia |
| Eksekusi | Instruksi owner baru atas exact SHA, lingkup perubahan dan window belum ada |

Jika satu saja belum lengkap, STOP. Jangan mengisi nilai dari asumsi, hasil lab, CI, status READY, jumlah sitemap atau izin konektor. Tidak meminta ulang pilihan www atau scope manual yang sudah tersedia.

## Urutan bersyarat untuk task aktivasi mendatang, bukan izin menjalankan

1. Bekukan kandidat dan legacy rollback deployment/SHA yang telah direview. Owner mengesahkan seluruh gate dan instruksi perubahan yang persis: dua host, project/team, arah/status redirect, path/query yang approved, perubahan canonical/sitemap/indexing production, apakah DNS/alias perlu disentuh, window, operator dan triggers. Hak merge tidak sama dengan hak cutover.
2. Operator memverifikasi ulang kondisi aktual kedua host, registrar/DNS/TTL/TLS, redirect dan hak pemulihan. Simpan snapshot aman tanpa token/PII dalam repo. Pastikan legacy deployment tetap tersedia; jangan menghapus sumber sebelum pemulihan terbukti.
3. Verifikasi prosedur Vercel terkini untuk perpindahan antar-project. Jangan menganggap kedua host dapat dipindahkan atomik. Hentikan jika hanya satu host berubah atau rencana berbeda dari tiket; gunakan jalur pemulihan yang disahkan, bukan improvisasi.
4. Aktifkan hanya konfigurasi yang diotorisasi pada task tersebut. Pertahankan satu arah apex→www, gabungkan host/path langsung bila disetujui, hindari aturan balik www→apex. Metadata dan sitemap www baru boleh diterapkan setelah izin spesifik. Staging tetap noindex/SSO.
5. Verifikasi dari jaringan luar: HTTPS/TLS kedua host, status/hop/query tiap disposition yang approved, URL penting dan arsip yang benar-benar approved, canonical/meta/header/robots/sitemap production, tidak ada loop/soft404/5xx, serta smoke sintetis fungsi yang berisiko. Jangan menganggap cache lama sebagai bukti baru.
6. SEO menjalankan submission/inspection hanya dengan izin; tidak mengirim Change of Address otomatis untuk perubahan www/non-www pada domain yang sama. Catat waktu, keputusan dan bukti aktual. Rencana ini tidak memasang analytics atau menghapus legacy.

## Pemulihan yang harus disahkan dan dibuktikan

| Trigger | Tindakan bersyarat |
| --- | --- |
| Partial host move, TLS gagal, loop, salah project/deployment atau 5xx | STOP; pulihkan kedua assignment dan arah/status redirect sesuai snapshot yang disahkan |
| Hasil penting salah atau data input terekspos | STOP; kembali ke legacy yang dibekukan dan buka insiden; jangan refactor fitur di jendela cutover |
| Critical URL hilang, canonical/indexing production salah | STOP dalam batas window owner; pulihkan bila tidak dapat diselesaikan sesuai tiket |
| Staging terbuka/indexable | STOP; pulihkan proteksi dengan prosedur yang disahkan; jangan membuka staging agar QA lolos |
| Trafik/error/404/performa berubah | Threshold tetap UNKNOWN sampai baseline dan decision owner tersedia; tidak mengarang persentase atau menit |

Pulihkan kedua host/project/deployment, redirect dan metadata dari snapshot, lalu DNS hanya jika pernah diubah dan pemulihannya diotorisasi. Verifikasi HTTP/TLS, canonical/robots dan URL penting pada setiap host dari luar, catat waktu aktual dan recovery duration. Pemulihan objek JavaScript tidak membuktikan pemulihan platform. Routing rollback tidak mengembalikan data/transaksi baru; nilai konsistensi data secara terpisah bila ada.

Monitoring sesudah perubahan yang kelak disahkan mencakup segera/24jam/7hari/28hari: error/5xx/404, redirect, GSC indexing/landing-query, GA4 organic dan field CWV bila datanya memadai. Owner menentukan penanggung jawab dan akhir jendela rollback berdasarkan baseline nyata.

Sumber primer ditinjau pada tugas ini: [Google site move](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [Google canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Vercel transfer domain antar-project](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain). Dokumen lama tersimpan di riwayat Git. Tidak ada eksekusi production pada tugas ini.
