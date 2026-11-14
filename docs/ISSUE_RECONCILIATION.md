# Rekonsiliasi lima issue, 15 November 2026

Baseline main terverifikasi: `4a48b0e29c558089ddeacdfd9fff602995a8bbc0` (squash PR #65). Instruksi master mengizinkan audit, bukti, dokumentasi dan penutupan issue historis yang terbukti selesai, bukan mengatasi larangan implementasi/publikasi per issue. **Cutover STRICT NO-GO.** Tidak ada perubahan aplikasi, formula, routing, canonical, sitemap, indexing, SSO, domain, DNS, alias atau legacy production.

## Matriks dependensi

| Issue | Status awal | Bukti dan pekerjaan | Keputusan | Sisa dependensi |
| --- | --- | --- | --- | --- |
| #6 | OPEN, deskripsi Phase A/B lama | PR #7/#9 merged; token/komponen/CSS Modules, kontrak, preview; verifikasi main ulang, 15 kombinasi halaman/lebar dan 99 browser cases | Selesai sebagai pekerjaan design system; tutup dengan bukti, tanpa rewrite | Bukan approval release atau semua halaman konten; label proposal historis di dokumen diklarifikasi |
| #36 | OPEN, draft Batch14 | Task penerus #37 dan PR #38 merged; lima ID existing published, sumber/formula/fixture, tes property dan UI | Selesai sesuai scope yang disempurnakan #37; tutup dengan bukti, tanpa duplikasi | Pilihan draft lama yang superseded dicatat di bawah; tidak mengembalikan jumlah sitemap lama |
| #66 | OPEN, audit parsial tersebar | Satu matriks 33 path, metadata/SSR GET aktual legacy dan build main, ringkasan GSC berprovenance, contoh manual dan batas parity | KEEP/REVIEW/HOLD untuk rekomendasi, tetap OPEN | Raw/full GSC, page×query, GA4/backlinks, acceptance per-URL, invoice/dataset dan publikasi belum lengkap |
| #63 | OPEN, SPEC_READY_FOR_OWNER_REVIEW | Review read-only exact PR64 b46d47d1 beserta komentar; oracle Python independen | Tetap SPEC_READY_FOR_OWNER_REVIEW; PR64 frozen/draft, jangan ditutup | Izin resume baru, kebijakan scope BEI/grid, test gaps dan keputusan SEO |
| #60 | OPEN, NO-GO | PR65 merged, www future/manual acceptance dipertahankan; konsolidasi #63/#66 dan semua gate | Tetap OPEN, STRICT NO-GO | 22 approval,6 referensi, benchmark/saham/SEO/redirect/operasi/rollback/otorisasi |

Open PR diperiksa sebelum branch baru: #64 draft stock (frozen) dan #2 scaffold lama yang tidak terkait. Branch main dan branch pekerjaan sebelumnya diinventarisasi; tidak ada fungsi completed yang ditimpa. Commit PR65 tidak dianggap cutover approval. Source histories dan Issue #66 tersimpan di [issue-evidence.json](audit/reconciliation/issue-evidence.json).

## #6: Phase A/B sudah merged dan tervalidasi

- Phase A [PR7](https://github.com/neodymium-web/kalkulatorhargav2/pull/7), merge `1e860f1a5f993f8d15762b1acd4a8f4cd0dd1a63`: docs/DESIGN_SYSTEM.md, homepage/category/HPP state previews, specimen sheet dan checklist. `docs/design-previews/` menyimpan contoh desktop/mobile asli.
- Phase B [PR9](https://github.com/neodymium-web/kalkulatorhargav2/pull/9), merge `d35ac72dc8d73ebe3f279c3c66c31342ac97f3d0`, head `8f2e28ab35a3e4e9d33fc01398fa151f366d0ff3`: tokens.css, CSS Modules, reusable controls, CalculatorForm/ResultPanel, directory search/cards, breadcrumb/nav; AGENTS mewajibkan sistem desain. Pemilihan CSS Modules dijelaskan dalam spec, tanpa kebutuhan rewrite Tailwind/shadcn.
- Kini: token warna, tipografi/angka, spacing/radius, focus/error/success dan motion semantik; kontrak dan pola form tercatat di docs/UI_COMPONENTS.md. Navigation links memiliki min-height token 44 px. Ketentuan screen reader, focus-first-invalid, live results, stale reset dan noJS diuji.
- Fresh verification main: homepage/Bisnis/HPP masing-masing pada 320/375/768/1024/1440, overflow=false, axe WCAG2A/AA2.1/2.2 tidak menemukan violation dalam 15 case; focus-visible 3px solid biru, reduced-motion membuat transisi tombol 0s. [Hasil mesin](audit/reconciliation/design-checks.json). Ini scoped automated checks, bukan sertifikasi semua teknologi bantu.
- `tests/layout.spec.ts` dan `smoke.spec.ts` menguji breakpoint, keyboard skip link, search/empty/clear focus, validasi/HPP valid dan maksimum, SSR/noJS/canonical. Screenshot homepage 1440 dan HPP 375 diperiksa visual; screenshot regresi yang sama dihasilkan CI. Tidak ada gap implementasi design system yang terkonfirmasi; hanya header status proposal lama di docs diklarifikasi.

## #36: lima ID terbit, bukan pekerjaan batch baru

[PR38](https://github.com/neodymium-web/kalkulatorhargav2/pull/38), merge `d47d44098e9434c3e9eba3c7aad024c3716664d9`, head `2db201aaa640c90ba33eb42b1a0eabf2a2ae910a`, menutup task penerus #37. CI historis [42376704359](https://github.com/neodymium-web/kalkulatorhargav2/actions/runs/42376704359):474unit,309browser/1skip dan Preview READY pada head yang sama, menurut PR dan riwayat merge. Itu bukti historis, bukan pengujian baru pada SHA tersebut.

| ID published | Route existing | Kontrak dan bukti batas |
| --- | --- | --- |
| calc-selisih-tanggal | /kalkulator/selisih-tanggal | Ordinal BigInt Gregorian 0001–9999, elapsed/inclusive, strict dates, reverse rejected; 1900 bukan leap, 2000 leap |
| calc-hari-kerja | /kalkulator/hari-kerja | Minggu penuh+ ≤6 hari, pola eksplisit termasuk semua libur, 0–100 tanggal manual, dedupe dan klasifikasi weekend/out-of-range; ledger reconcile |
| calc-usia | /kalkulator/usia | Maksimum bulan anniversary dari birth asli dengan clamp, total elapsed terpisah, acuan eksplisit; bukan usia hukum |
| calc-durasi-kerja | /kalkulator/durasi-kerja | Menit BigInt, same/next-day eksplisit, jeda≤gross; jam sama 0/24 jam; nominal wall-clock bukan DST/payroll |
| calc-konsumsi-bbm | /kalkulator/konsumsi-bbm | Jarak total manual/efisiensi>0, harga manual, rasio eksak dan biaya sekali dibulatkan; positif subpresisi dibedakan dari nol |

#36 adalah draft lama, bukan izin mengembalikan perilaku sebelum #37: preferensi signed-date diganti reverse rejection yang diizinkan #37; semua hari nonkerja diizinkan #37; usia memakai maksimum bulan dari anchor asli, bukan year-adjusted anchor; multiplier pulang-pergi opsional tidak diimplementasikan, pengguna memasukkan jarak total. Contoh #36 2000-02-29→2001-02-27=11bulan30hari tidak cocok dengan kebijakan terpilih: anchor 2001-01-29 menyisakan 29 hari. Tidak mencatatnya sebagai fitur hilang yang perlu diam-diam dibangun. Batas/konvensi diterangkan dalam docs/BATCH_14_FORMULA_VERIFICATION.md dan tools.ts; original #36 ditutup berdasarkan task yang disempurnakan dan delivery merged, bukan klaim setiap preferensi draft lama tetap ada.

`tests/calendar-time.unit.ts` mencakup 58 cases termasuk siklus 400 tahun, enumerasi hari kerja independen, dedupe/permutasi, anniversary/maximality, konservasi menit, tie/tiny/max/rupiah; tests/calendar-time.spec.ts mencakup 28 cases dua proyek, daftar libur keyboard, noJS, DST-browser contexts, viewport dan metadata. Jalur dan status diverifikasi di docs/CALCULATOR_INVENTORY.md serta lib/registry.ts. Jumlah 77 sitemap/71 published adalah snapshot batch lama; main sekarang 100 calculator + 2 supplemental + 6 hub + 22 archive = 131 URL. Jangan membuat ID/route baru atau mengembalikan route seller yang kini published menjadi 404.

## #66: satu matriks readiness, bukan approval

[CSV 33 path](audit/reconciliation/seo-parity-matrix.csv) dan [JSON](audit/reconciliation/seo-parity-matrix.json) memuat URL lama/target, clicks/impressions, batas periode, HTTP/SSR, feature gaps, title/canonical/schema, KEEP/REVIEW/HOLD, disposition redirect, approval, owner dan next action. [HTTP metadata aktual](audit/reconciliation/http-metadata.json) membedakan GET legacy (remote JS tidak dijalankan, tanpa submit form) dari build production lokal main. Semua 32 path inventaris+Tokopedia diperiksa; tidak menguji kalkulasi production. Metadata33path bukan bukti penuh parity perilaku browser legacy.

### Batas GSC yang tidak boleh hilang

Sumber adalah ringkasan ekspor owner 15 November di Issue #66, bukan raw spreadsheet yang berhasil dibaca dalam tugas ini. Propertywww, filter tertulis 16 bulan, observasi harian hanya 17 Oktober–11 November 2026 (26 hari). Chart 38 klik/2475 impresi; Pages dilaporkan 32 URL, namun hanya 9 baris prioritas yang angka persisnya tersedia dalam issue. Total Pages tidak direkonsiliasi dengan chart. Interval setiap row Pages belum diverifikasi dari raw export. Karena itu angka page tidak dipaksakan menjadi total 26 hari/16 bulan/enam bulan; metrik URL lain UNKNOWN, bukan 0. Queries export terpisah tidak menghubungkan keyword ke page. [Catatan provenance](audit/reconciliation/gsc-evidence.json).

| Path | Clicks / impressions yang dilaporkan | Route / readiness |
| --- | --- | --- |
| `/` | 4 / 165 | REVIEW / REVIEW |
| `/kalkulator/shopee` | 1 / 154 | KEEP / REVIEW |
| `/kalkulator/lazada` | 1 / 64 | KEEP / REVIEW |
| `/kalkulator/tiktok-shop` | 1 / 231 | KEEP / REVIEW |
| `/kalkulator/tiktok` | 20 / 317 | KEEP / REVIEW |
| `/kalkulator/tiktok/benchmark` | 0 / 12 | HOLD / HOLD |
| `/kalkulator/emas` | 7 / 1529 | KEEP / REVIEW |
| `/kalkulator/saham/average` | 2 / 68 | HOLD / HOLD |
| `/bandingkan` | 0 / 87 | KEEP / REVIEW |

### Hasil parity dan contoh

- TikTok: KEEP exact URL, REVIEW. Legacy memiliki username/shared monthly assumptions/benchmark tiers; v2 empat modul manual terpisah, tanpa username/benchmark. Pendapatan10keligibleviews×Rp100RPM/1000+net sponsor200+affiliate30+gift20=Rp1.250. ER135aksi/1000followers=13,5%, atau/3000views=4,5% melalui run terpisah. Ratecard v2 biaya350+rights50+margin sale-price20–30% menghasilkan488–550; bukan range pasar legacy. Test aktual creator lulus; legacy computation tidak dijalankan, tidak mengklaim hasil keduanya sama.
- Emas: KEEP/REVIEW dengan manual scope yang **sudah diterima**. Tidak membuka ulang feed live. Gross12g−nonGold2g,18K/24→fine7,5g; quote manual1juta, buyCost20k memberi7,52juta; spread10%, sellCost30k memberi6,72juta. Brand quote/table legacy dan pengalaman manual berbeda; source/date/buyback metadata perlu acceptance SEO, bukan nilai pasar otomatis.
- Bandingkan: KEEP/REVIEW, scope manual diterima. Legacy static contoh tabel kategori/tier, v2 butuh skenario empat kanal, bukti fee/tax dan kesamaan jumlah/HPP. 100k−9,25%−1250=89500; menjadi81500 hanya dengan biaya lain8000 yang eksplisit. Ranking eksak sebelum cash rounding; bukan tarif resmi kini.
- Shopee/Lazada/TikTok Shop: KEEP/REVIEW per URL, tidak otomatis tercakup approval bandingkan. Legacy tier/category/program controls vs input manual persen/tetap, gross/net/custom basis, minimum/cap/order. Fixture200k−diskon10k−5%net9500−fixed2000−ongkir3000=175500; setelah HPP120k=55500. Ini fixture sintetis manual, bukan invoice aktual atau tarif terverifikasi. Invoice/kategori/tax/metadata intent masih perlu bukti dan keputusan.
- Root: REVIEW; halaman lama seller presets berbeda dari directory100kalkulator. `/kalkulator`: HOLD, lama200/main 404;301ke root belum disahkan. Jangan mengganti intent root atau membuang query preset.
- Saham/benchmark: HOLD200legacy→404main, tidak ada redirect pengganti/retirement approved. Benchmark denominator/cohort/rights belum matching. Tokopedia exact path saat GET404legacy vs200v2; GSC row tidak diberikan; root legacy mempunyai Tokopedia scenario, bukan bukti exact URL itu pernah indexed.
- Seluruh 22 arsip KEEP path/HOLD publikasi: metadata terkini dibandingkan dalam matriks, tetapi hak teks/byline/privacy/legal/source freshness dan enam referensi tetap pending. Koreksi editorial bukan approval. No ld+json types ditemukan pada SSR v2 yang ditangkap; bukan klaim seluruh structured data browser sudah diaudit. Future www dipilih owner, runtime canonical apex dan noindex tetap; discrepancy itu direncanakan, belum diotorisasi untuk diperbaiki.

[Oracle Python independen](audit/reconciliation/independent-oracles.json) memakai datetime/Fraction/Decimal tanpa import engine TS; angka di atas juga cocok dengan unit/browser fixtures yang benar-benar dijalankan. Itu memverifikasi model manual v2, bukan kesamaan input/API/nota marketplace lama. Data/fitur yang tidak terbukti tetap ditahan.

## #63: read-only, izin dan gap spesifik

PR64 tetap OPEN+DRAFT pada `b46d47d1cfd5a4bb256b0346416e9406e9874bd0`, tidak dibawa ke main/branch ini. CI historis #71 menunjukkan1429unit,779browser/1skip,37WebKit; tidak dijalankan ulang sebagai implementasi saat ini. Review komentar6878830747,6880113759,6880835092 dan source exact-head membuktikan mode modal bruto/inclusive, buys, manual fees, proportional partial cost, theoretical BE/net/ROI dan affine whole-lot solver ada di draft. Itu bukan full BEI order-admissibility parity.

Oracle C6626000/N1500/assumed sell0,25% menghasilkan exact BE5300800/1197=4428,4043441938…; P4430 net6628387,50 dan P4420 net6613425. Tidak menyebut4430 sebagai harga order sah. [BEI primer](https://www.idx.id/id/produk-layanan/jam-dan-mekanisme-perdagangan/) dibaca ulang 15 November: 100 shares/lot regular/cash, tabel1/2/5/10/25 dan daily-fixed rule tersedia; sumber halaman ringkas belum merupakan verifikasi grid origin, batas harga/instrumen/board/auto-rejection/order yang lengkap. Jangan mengarang rule atau preset broker/pajak.

Gap yang dipertahankan untuk task berizin: (1) rulebook-to-test BEI/current effective scope, termasuk batas instrumen, zero/decimal price policy; (2) explicit oracle misaligned origin/minimum dan BE di bawah minimum, yang belum tampak dalam 19 unit test draft; (3) fee-inclusive equivalence dengan biaya awal nonzero, sebab tes mode saat ini membandingkan openingFee 0; (4) kebijakan nota/rounding, FIFO vs proportional, fee cap/nonlinear yang saat ini unsupported; (5) acceptance produk/SEO dan page×query. Tidak mengeksekusi perubahan/test baru di branch frozen atau mengklaim bug tanpa repro.

**Izin tepat yang masih diperlukan:** instruksi owner baru untuk resume implementasi staging #63/PR64, memilih apakah menerima scope manual/hypothetical-grid dengan batasannya atau mewajibkan BEI-valid order parity, beserta kebijakan fee/broker/market dan acceptance yang diperlukan. Approval merge exact SHA dan publikasi/cutover tetap izin terpisah. Status SPEC_READY_FOR_OWNER_REVIEW dipertahankan. Tugas master ini secara eksplisit tidak melewati gate implementasi individual.

## #60: blocker terkonsolidasi

| Gate | Status nyata | Bukti/keputusan yang dibutuhkan |
| --- | --- | --- |
| www future primary | OWNER_SELECTED, planning only | Izin spesifik canonical/sitemap/redirect activation; runtime apex tetap |
| Emas / bandingkan manual | ACCEPTED_MANUAL_SCOPE_ONLY | Tidak diminta ulang; parity/SEO/claim legal masih direview perURL |
| 22 arsip | PENDING_OWNER_APPROVAL,0 approved | PerURL: reviewer berwenang, hak teks/byline, tanggal/sumber/legal/privacy/proses, disposition |
| 6 referensi | PENDING_INTENT_DECISION | Root preset vs directory/manual comparison, saham dan benchmark; provenance sah tanpa fake archive |
| Benchmark | RETAIN/RESEARCH_ONLY | Hak upstream/komersial/privacy, cohort/denominator/metode reproduktif dan publikasi terpisah |
| Saham | SPEC_READY, PR64 frozen, main 404 | Izin resume+scope, BEI/test/fee/parity/SEO; tidak ada weighted-average301 |
| GSC | PARTIAL_OWNER_REPORTED, baseline belum lengkap | Raw 6 bulan Pages/Queries, page×query bila tersedia, date/filter/property/timezone, indexing/sitemap; rekonsiliasi totals |
| GA4/backlinks/404 | UNKNOWN | Ekspor organic landing/key events, referring URLs dan log404 authorized, periode/scope/reviewer |
| Redirects | NO ACTIVE APPROVAL | Root 301 pending; saham no redirect; unknownquery HOLD; www host satuarah belum aktif |
| Rollback/operator | NOT_PLATFORM_REHEARSED | Named operator+backup+decision owner, exact legacy/candidate SHA/deployment, window, snapshot DNS/TTL/TLS/config, izin recovery, baseline/threshold dan recovery duration nyata |
| Final authorization | ABSENT | Instruksi terpisah exactSHA/host/project/window/change scope; CI/READY/closed issues bukan izin |

Plan dan snapshot PR65 dipertahankan sebagai catatan saat disusun. Ringkasan GSC baru di Issue #66 **tidak** mengisi raw exports atau menyelesaikan baseline lengkap; temuan parsial ini overlay audit terbaru, bukan aktivasi plan. Tidak mengedit source-snapshot atau approvalnull untuk membuat gate hijau.

## Validasi dan batas handoff

Fresh main: npm ci 0 advisories; typecheck; 1430 unit/32 files; production build; 99 Playwright PASS/1 skip existing explicit viewport-on-desktop matrix. Lima belas tambahan desain/axe/keyboard-focus/reduced-motion checks lulus. Kalender diuji lewat 58 unit dan 28 browser project cases yang termasuk suite; contoh manual TikTok/emas/comparison/seller termasuk 99 PASS. Counts tidak dijumlahkan dua kali. Hasil unit/property mencakup fixture independen dan enumerasi; tidak ada audit manual baru seluruh 100 kalkulator.

Screenshot desktop/mobile lokal diambil dan homepage 1440/HPP 375 diperiksa; screenshot regresi final berada pada artifact CI PR dokumentasi. CI/Preview final harus dicatat pada PR dengan exact head, tanpa self-referential SHA dalam commit. Sampai diverifikasi, jangan mengklaim Preview authenticated atau final CI baru lulus. GET production hanya membaca, tidak menjalankan JS remote/form; tidak ada perubahan legacy. Closed historical issues tidak mengubah NO-GO release.
