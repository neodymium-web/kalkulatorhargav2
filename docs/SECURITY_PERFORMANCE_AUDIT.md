# Audit keamanan, privasi dan performa

Tanggal8November2026. Pemeriksaan source dan runtime terbatas pada aplikasi ini, bukan penetration test seluruh Vercel atau audit retensi log penyedia.

## Keamanan dan privasi

**AR-001,P1 diperbaiki dalam commit terpisah.** Tanpa JavaScript, form SSR sebelumnya aktif dengan native GET; input keuangan sintetis masuk query URL/history dan berpotensi access log. Repro independen dan URL dummy tersimpan di [finding](audit/findings/AR-001.md). Form sekarang disabled sampai hidrasi, dengan noscript yang menjelaskan kondisi. Sesudah hidrasi DOM tetap seperti sebelumnya. `release-privacy.spec.ts` menguji100form noJS pada dua project, serta HPP terhidrasi tanpa navigasi/query. Tidak mengubah formula atau menghapus tes lama.

Static inspection tidak menemukan eval/newFunction, dangerouslySetInnerHTML atau HTML sink untuk label fee, redirect berdasarkan input, fetch kalkulasi, cookie/localStorage/sessionStorage untuk nilai pengguna. Engine client memakai schema Zod dan aritmetika murni; Number untuk counter/periode dibatasi, nominal memakai integer/rasional/Decimal. Tidak ada API penyimpanan kalkulator baru. Runtime payload img/onerror tampil sebagai teks tanpa eksekusi; encoded script dan __proto__ route404; prototype-shaped input100engine tidak throw/mutasi.214alur halaman tidak mengirim request eksternal. Hasil ini bukan jaminan bebas semua injection atau semua ekstensi browser.

**AR-006,P2 hardening:** aplikasi belum mendefinisikan CSP/referrer-policy/frame-ancestors sendiri. Tidak ada exploit XSS yang teramati, jadi tidak diperlakukan sebagai bukti kebocoran aktif. Rekomendasi terpisah: uji CSP report-only/nonce dengan Next sebelum enforcement, Referrer-Policy dan kontrak header edge; jangan menonaktifkan staging protection. HSTS dan X-Frame-Options DENY teramati pada respons edge SSO anonim baseline, bukan bukti header aplikasi final. Raw cookie/nonce SSO tidak dimasukkan ke repository/artifact.

Model browser tidak menyimpan atau mengirim nilai setelah hidrasi. Klaim itu tidak mencakup log hosting, crash tooling di luar repo, kebijakan penyedia atau script pengguna. Pemilik harus meninjau retensi/log serta privacy notice sebelum launch. Tidak memasang analytics/tracking baru dan tidak membaca nilai secret.

## Dependency/provenance

Clean install Node22.23.4, lockfile terikat SHA256 `18a04aa7c5227be0913f10a693507b6bd9ab13f9a5c910b6aa5b6c3440ec0d31`. Versi terkunci: Next16.4.5,React19.3.1,decimal.js10.6.0,Zod4.6.7. axe-core4.14.0 dan Lighthouse13.6.0 ditambah sebagai dev dependency audit, bukan runtime bundle. Baseline advisory0; laporan advisory final terpisah `audit/npm-audit-final.json`. Tidak ada mass upgrade. Hasil npm audit bergantung database pada tanggal pemeriksaan, bukan jaminan tak ada kerentanan.

## Pengukuran lab baru

22run, satu run per route/device. Node22.23.4, macOS arm64 AppleA18Pro, Chrome158 dari Playwright, Lighthouse13.6.0, build production lokal. Mobile memakai konfigurasi Lighthouse default simulated throttling (RTT150ms,throughput1638,4kbps,CPU×4), desktop memakai desktopConfig. Settings rinci tersimpan di [JSON](audit/lighthouse-summary.json). Tidak ada percentile dari satu run, field INP atau p75 CWV yang diklaim. CI mengulang22run pada runnerLinux dan menyimpan rawreport dengan SHA; hasil waktunya dapat berbeda.

| Route | Device | Performance | LCP ms | CLS | TBT ms | Transfer bytes |
| --- | --- | --- | --- | --- | --- | --- |
| / | mobile | 0.89 | 3613 | 0 | 98.0 | 382033 |
| /bisnis | mobile | 1 | 906 | 0 | 29.5 | 385060 |
| /marketplace | mobile | 1 | 907 | 0 | 29.5 | 380520 |
| /keuangan | mobile | 1 | 912 | 0 | 41.0 | 384731 |
| /pajak | mobile | 1 | 910 | 0 | 35.5 | 377654 |
| /media-sosial | mobile | 1 | 907 | 0 | 44.0 | 379898 |
| /sehari-hari | mobile | 0.99 | 2063 | 0 | 26.0 | 385895 |
| /kalkulator/kpr | mobile | 1 | 908 | 0 | 71.6 | 362705 |
| /kalkulator/pph-21-bulanan | mobile | 1 | 1056 | 0 | 32.5 | 369934 |
| /kalkulator/tiktok | mobile | 0.99 | 907 | 0 | 92.5 | 364133 |
| /kalkulator/food-cost | mobile | 0.96 | 2566 | 0 | 110.4 | 361311 |
| / | desktop | 1 | 244 | 0 | 0.0 | 426526 |
| /bisnis | desktop | 1 | 251 | 0 | 0.0 | 419519 |
| /marketplace | desktop | 1 | 481 | 0 | 0.0 | 424248 |
| /keuangan | desktop | 1 | 245 | 0 | 0.0 | 433096 |
| /pajak | desktop | 1 | 246 | 0 | 0.0 | 425643 |
| /media-sosial | desktop | 1 | 247 | 0 | 0.0 | 413083 |
| /sehari-hari | desktop | 1 | 247 | 0 | 0.0 | 436219 |
| /kalkulator/kpr | desktop | 1 | 571 | 0 | 0.0 | 362705 |
| /kalkulator/pph-21-bulanan | desktop | 1 | 611 | 0 | 0.0 | 369934 |
| /kalkulator/tiktok | desktop | 1 | 248 | 0 | 0.0 | 364133 |
| /kalkulator/food-cost | desktop | 1 | 248 | 0 | 0.0 | 361311 |

**AR-003,P2:** homepage mobile LCP3613ms dan food-cost2566ms melewati target2500ms pada run ini. CLS0 seluruh22run; TBT maksimum110,5ms. Jangan mengganti INP dengan TBT. Rekomendasi profiling/hydration/bundle terpisah dan ukur ulang beberapa run; data lapangan setelah izin launch masih diperlukan. Lighthouse menemukan sekitar194KiB unused JS pada homepage; total chunk build sekitar1,14MB uncompressed bukan transfer setiap rute. Transfer terukur ada di tabel.

**AR-004,P2:** seluruh run Lighthouse mencatat `/favicon.ico`404. Inilah alasan best-practices0,96, meskipun214workflow browser biasa tidak mencatat consoleerror. Chromium headless test context tidak selalu meminta favicon; jangan menganggap0error pada harness berarti tidak ada error di semua klien. Remediasi terpisah: asset favicon sesuai identitas yang disetujui lalu uji request sebenarnya. Audit tidak membuat logo baru.

Skor Lighthouse SEO0,66 disebabkan noindex yang memang diwajibkan untuk staging. Ini bukan alasan mengubah robots. Missing source maps,legacyJS dan render-blocking adalah diagnostics, bukan bukti exploit. Accessibility Lighthouse1 tidak menggantikan pengujian manual. Performance produksi bergantung perangkat/jaringan/cache/traffic yang belum diuji.

## Batas operasional

Aplikasi Preview terlindungi SSO; actual network app headers/robots/sitemap belum terbaca tanpa akses yang disetujui. Auto-review menolak konektor pembuat sharelink23jam. Tidak ada bypass/proteksi diubah. Metadata READY/SHA saja tidak membuktikan body remote. Status ini tetap UNKNOWN, harus ditutup sebelum keputusan launch. Domain/DNS/alias/production/canonical/indexing tidak disentuh.
