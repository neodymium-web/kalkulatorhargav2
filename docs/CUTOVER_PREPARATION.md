# Persiapan cutover: rencana dan baseline beku

Issue #53. Baseline immutable: `main@ec4bdb2b42ca7db16eea9ee74b1a7a23c5db5a44`. Tanggal: 8 November 2026 (Asia/Jakarta). Branch `fix/issue-53-cutover-preparation`. Commit pertama ini khusus dokumentasi rencana, belum menyatakan pengujian atau remediasi lulus.

## Wewenang dan observasi awal

Tugas ini hanya memperbaiki v2 pada branch, mengaudit situs legacy secara read-only, dan menyiapkan simulasi/runbook. Tidak memindah domain, DNS, alias, project, ownership, env indexing, Deployment Protection atau production. Tidak mengeksekusi redirect live, sitemap submission, promote, `vercel --prod` atau cutover. Canonical origin dan staging noindex tetap.

Observasi read-only konektor Vercel pada 8 November 2026 sekitar 10:20 UTC:

| Objek | Hasil yang benar-benar teramati |
| --- | --- |
| Alias `kalkulatorharga.com` | Project legacy `prj_OtNkapBGqShbDEludYl1Ea5QoLz9`, deployment `dpl_kk6BZ55DrPg8hrnTovFjgWvkeJiJ`, redirect ke `www.kalkulatorharga.com`, status konfigurasi308 |
| Alias `www.kalkulatorharga.com` | Project legacy yang sama dan deployment yang sama; redirect null |
| Domain project v2 `prj_p1VRZQiOB0BHJrQSC5JS2rDhYoF7` | Hanya `kalkulatorhargav2.vercel.app`, verified true; tidak memuat kedua custom domain legacy |

Ini observasi assignment saat audit, bukan pernyataan kepemilikan registrar/DNS atau persetujuan pemindahan. Waktu/raw network dan metadata sanitasi akan dicatat dalam bukti berikutnya. Project/deployment legacy adalah calon rollback yang harus diverifikasi ulang oleh owner pada jendela cutover, bukan identifier yang boleh diaktifkan otomatis.

Pembaca web awal tidak dapat membuka root/robots/sitemap legacy. Ini batas alat, bukan bukti bahwa situs mati. Crawl GET langsung berikutnya harus merekam status, redirect chain dan isi yang benar-benar diterima. Konfigurasi apex→www yang teramati berbeda dari canonical origin v2 apex; konflik host ini harus dibawa ke approval cutover, bukan diubah dalam tugas ini.

GSC/GA4, trafik, indexed footprint dan backlinks belum tersedia. Tandai UNKNOWN, minta ekspor owner-ready dalam runbook. Jangan menyimpulkan seluruh URL indexed hanya dari sitemap.

## Workstream dan acceptance gate

| Temuan | Rencana | Bukti kelulusan baru yang diperlukan |
| --- | --- | --- |
| AR-002 | Tautan SSR kategori yang dapat mencapai semua alat sambil mempertahankan pencarian dan pemuatan bertahap | Breadth-first crawl dari root memakai HTML respons tanpa JS/sitemap mencapai tepat107rute, tanpa internal404 |
| AR-004 | Favicon asli dari motif dua batang milik project, tanpa gambar pihak ketiga | GET favicon200, MIME image icon, header noindex; screenshot/browser tanpa favicon404 |
| AR-005 | Intro enam kategori dan100alat, spasi pajak yang terbaca tanpa mengubah arti/batas hukum | SSR/content assertions dan inspeksi screenshot desktop/mobile; formula/scope tetap |
| AR-003 | Rekam beberapa run baseline dan kandidat pada lingkungan yang sama; optimalkan bottleneck terukur saja | Minimal3run mobile home/food-cost sebelum/sesudah, median/range dan settings; tidak mengklaim field INP/p75 |
| AR-006 | Evaluasi Referrer-Policy dan CSP report-only yang tidak memblokir Next/hidrasi | Header aktual build, alur browser tetap, dokumentasi tradeoff dan verifikasi Preview bila akses disetujui |
| AR-008 | Inventaris sumber/legal scope dan tindak lanjut perangkat nyata | Tidak memperluas tarif/tahun/wilayah; daftar owner/manual follow-up dengan status jujur |
| Legacy/mapping | GET/HEAD terbatas dengan throttling; metadata dan semua redirect hop; map107v2 | CSV inventory dan107baris mapping dengan provenance, confidence, intent dan manual-review; tidak ada mapping palsu ke homepage |
| Dry-run/runbook | Redirect hanya fixture lokal, runbook perubahan/rollback belum dijalankan | Tes one-hop301, tanpa loop/chain/soft404; approval owner baru wajib sebelum tindakan domain/indexing |

Pemeriksaan awal bukan hasil remediasi. Rencana implementasi UI tetap mengikuti Design System v2: motif kolom biru, formulir utilitas, ENERGY2/RHYTHM1/MOTION1. Tautan tambahan dipakai untuk navigasi alat, favicon memakai motif brand yang sudah ada. Tidak redesign atau mengubah matematika.

## Metode legacy dan pemetaan

1. GET root, robots dan sitemap, apex serta www, dengan maksimal2request bersamaan dan jeda minimal300ms; User-Agent audit jelas. Hanya host legacy terkait, tanpa bypass auth atau permintaan mutasi. Jika rate-limited/blokir, hentikan dan catat keterbatasan.
2. Parse XML sitemap/index dan tautan HTML nyata, canonical/title/meta/H1. Simpan URL asal, setiap redirect hop, UTC, status dan hash respons; pisahkan URL observasi dari dugaan. Query/fragment dinormalisasi dengan provenance; halaman non-HTML tidak diperlakukan sebagai kalkulator.
3. Tentukan equivalence dari isi dan intent, bukan kemiripan slug semata. TikTok kreator tetap `/kalkulator/tiktok`; seller hanya `/kalkulator/tiktok-shop`. Halaman legacy tanpa padanan memerlukan owner, bukan redirect arbitrer.
4. CSV107target memuat old evidence/action/confidence/title/H1/canonical. Perubahan apex/www atau redirect tetap usulan yang memerlukan approval baru; jangan aktifkan di Next/Vercel saat audit.
5. Ekspor GSC pages/queries3–6bulan dan GA4 organic landing pages owner masih diperlukan untuk prioritas/URL yang tidak tercrawl. Jangan mengarang angka trafik atau ranking.

## Strategi cutover dan rollback yang akan dirinci

Target adalah gangguan sekecil mungkin, bukan janji zero-downtime atomik. Sebelum perubahan: freeze SHA yang telah direview, verifikasi deployment legacy masih READY dan dapat melayani kedua hostname, backup konfigurasi sanitasi, uji HTTPS/routing/redirect/indexing pada fixture. Pemilik harus menyetujui jendela maintenance dan batas waktu rollback. Kemampuan memindah kedua hostname secara atomik belum terbukti.

| Kondisi pada jendela perubahan yang kelak disetujui | Keputusan owner |
| --- | --- |
| Approval tidak menyebut SHA/project/domain/DNS/indexing/window secara lengkap | STOP, jangan memulai |
| Sertifikat/routing salah,5xx,URL penting hilang,input bocor atau angka didukung salah | NO-GO/rollback ke assignment legacy yang dibekukan |
| V2 melayani200 tetapi masih noindex pada domain production | Hentikan validasi launch, perbaiki sesuai izin atau rollback; jangan membuka staging |
| Header/URL/intent sesuai dan smoke test lulus | Owner menilai lanjut; monitoring tetap wajib, bukan auto-promote |

Approval cutover harus instruksi user BARU yang menyebut SHA, kedua project, hostname, perubahan DNS/alias yang persis, konfigurasi indexing, jendela perubahan/rollback dan pemilik eksekusi. Issue/PR ini tidak memberi izin tersebut.

## Prosedur pengujian dan bukti

Node22 clean `npm ci`; typecheck,1307unit baseline plus tes baru,build,seluruhPlaywrightdesktop/mobile,WebKit dan noJS100form. Rekam skip lama, jangan mengendurkan assertion/timeout. Bandingkan100published/6hub/107sitemap dan noindex/robots/canonical invariant. Screenshot sebelum/sesudah home,hub,food-cost dan kalkulator representatif harus benar-benar diinspeksi. CI/artifact dan Preview READY wajib exact headSHA. Akses Preview terlindungi tidak boleh membuat sharelink tanpa izin spesifik deployment/tugas; izin PR52 tidak otomatis dipakai untuk deployment baru PR53.

Hasil akhir akan memisahkan PASS/FAIL/UNKNOWN, perbaikan P2, blocker owner/GSC/GA4/perangkat nyata dan rekomendasi GO/CONDITIONAL GO/NO-GO untuk persiapan launch saja. Dokumen akhir: CSV legacy inventory, CSV107mapping, runbook cutover/rollback draft, hasil eksperimen performa dan screenshot/CI. Riwayat rencana pertama tetap tersimpan di commit ini.
