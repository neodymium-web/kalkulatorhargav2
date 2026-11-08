# Disposisi P2 dan gate persiapan

Baseline `ec4bdb2b42ca7db16eea9ee74b1a7a23c5db5a44`, 8 November 2026. Rekomendasi **CONDITIONAL GO untuk persiapan/review**, **NO-GO untuk eksekusi cutover**. Ini bukan peluncuran; tidak ada otorisasi domain/indexing dalam Issue53.

| ID | Disposisi | Bukti baru dan risiko tersisa |
| --- | --- | --- |
| AR-002 | Remediasi | Hub memiliki disclosure native berisi tautan SSR lengkap. BFS dari root saja pada production build mencapai107/107 tanpa sitemap/JS, tidak ada internal404. Search dan Muat lebih banyak tetap. Tidak menambah URL pagination ke sitemap. |
| AR-004 | Remediasi | ICO16/32/48px asli dari motif dua kolom project. Respons favicon200 dan MIME image/x-icon, header noindex, signature ICO diuji. Source/provenance di docs/assets; tidak mengambil gambar pihak ketiga. |
| AR-005 | Remediasi | Intro home menyebut100alat/enam kategori, Bisnis mencakup20alat biaya/laba/kas/stok/jasa.130string pajak hanya mendapat whitespace; fingerprint kode/angka/string tanpa whitespace identik pada empat file.100title/ID/path tetap.7description metadata berubah whitespace saja, dicatat agar audit frozen51 tidak ditimpa. |
| AR-003 | PARTIAL; tetap perlu follow-up | Beberapa run baseline/kandidat direkam pada host/config sama. Prefetch kartu dan navigasi dibatasi setelah network trace menunjukkan transfer tak digunakan. Eksperimen dynamic import seluruh form ditolak karena transfer food-cost meningkat; wiring form asli dipertahankan. Tidak menjanjikan LCP/INP lapangan. Rincian angka pada PERFORMANCE_COMPARISON.md. |
| AR-006 | Remediasi bounded; monitoring belum lengkap | Referrer-Policy strict-origin-when-cross-origin dan nosniff; CSP report-only tidak memblokir hidrasi. Header, browser, noJS dan semua engine diuji. Inline scripts/styles masih diizinkan; tidak ada report collector. Ini observasi/kompatibilitas, bukan CSP enforce atau klaim bebasXSS. |
| AR-007 audit51 | Sudah ditutup di PR52 | Tidak perlu dibuka kembali untuk baseline. Preview baru Issue53 tetap memerlukan pemeriksaan jaringan dan izin akses spesifik bila terlindungi. Tidak mewarisi izin sharelink deployment PR52. |
| AR-008 | LIMITATION terbuka |100source/scope inventory dicatat, tidak memperluas tarif/hukum. GSC/GA4/backlink dan perangkat fisik masih owner follow-up. Emulasi tidak dinamai iPhone/Android nyata. |
| MIG-001 | P1 blocker cutover, bukan kerusakan staging |25halaman legacy belum ada padanan v2: emas, panduan/artikel, metodologi/redaksi/kebijakan/disclaimer dan lain-lain. Setiap URL ada di legacy inventory; retensi/porting/keputusan owner wajib, bukan redirect massal ke root. |
| MIG-002 | P1 blocker cutover |Legacy apex→www308, v2canonicalapex tetap. Owner harus menyetujui host policy dan membekukan rollback sebelum perubahan agar tidak terjadi loop/canonical conflict. |
| MIG-003 | UNKNOWN owner gate |Traffic/indexed footprint di luar crawl32halaman tidak diketahui. GSC/GA4/export/backlinks dan keputusan fitur presetfee→manual harus disetujui sebelum cutover. |

## Batas keamanan header

CSP report-only mengamati pelanggaran dan tidak menegakkan blokir. Kebijakan mengizinkan self serta origin toolbar Vercel yang relevan, inline scripts/styles untuk Next statis, dan data images. Tidak menambahkan collector telemetry atau `report-sample` yang bisa membawa data pengguna. Tidak ada klaim enforcement frame-ancestors dalam mode report-only. Sumber: [Next CSP](https://nextjs.org/docs/app/guides/content-security-policy) dan [MDN report-only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only), dibaca8November2026. Nonce/strict CSP membutuhkan pembahasan rendering/cache tersendiri, bukan dipaksakan dalam tugas ini.

Tidak mengubah canonical origin, robots/indexing, tariff data, rumus, status published, domain/DNS/alias atau project legacy. Redirect proposals hanya CSV+fixture localhost, bukan routing Next atau Vercel. CI dan artifact final akan direkam di PR pada SHA yang sama dengan Preview READY; hasil lokal tidak disebut sebagai network Preview.

## Gate UI dan React untuk perubahan terbatas

Design read: direktori utilitas Indonesia dengan Design System v2, ENERGY2/RHYTHM1/MOTION1. Disclosure menghemat ruang untuk navigasi nama alat lengkap dan bekerja tanpa JS; min-target44px/fokus memakai token. Favicon mengulang brand dua batang; tipografi, palet dan layout lama tetap. Tidak menambah animasi atau identitas baru.

Hard gate/Purpose gate/Liveliness/Craftsmanship wajib dibuktikan dengan screenshot, keyboard, reflow,axe dan suite final sebelum delivery. Review React: komponen server untuk index SSR, tidak menambah hook/effect/fetch baru, ID tool stabil, props serializable, links semantik, disclosure native, CSS Modules dan token. Pemuatan kalkulator tetap jalur asli setelah eksperimen yang tidak bermanfaat dibatalkan. Temuan produk/owner di atas tidak disembunyikan sebagai PASS gate launch.
