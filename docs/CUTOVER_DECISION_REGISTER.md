> Dokumen historis. Untuk status terkini baseline b8dd6ee, gunakan [Migration Release](MIGRATION_RELEASE.md) dan [runbook terkini](MIGRATION_CUTOVER_RUNBOOK.md). Jumlah/rencana di bawah adalah bukti pada fase asal, bukan approval atau instruksi eksekusi saat ini.

# Keputusan sebelum cutover, Issue #55

**CONDITIONAL GO untuk persiapan/review; NO-GO untuk domain move.** Baseline `83485060ae157855bd1adcf9c5250c231c3e5972`. Menerbitkan arsip di staging bukan persetujuan kebijakan, kepemilikan, tarif, konten terbaru atau launch. Domain/DNS/alias/canonical/indexing tetap.

| Keputusan | Bukti sekarang | Yang masih diperlukan / penanggung jawab |
| --- | --- | --- |
| 25 URL | 25 GET publik200; 22 arsip diterapkan, tiga tool/benchmark/preset ditunda. Semua punya baris decisions/parity. | Owner konten menyetujui tiap disposition, tidak ada removal/redirect yang dianggap approved. |
| Emas | Form berat/kadar dan tabel harga/buyback sumber bertanggal; bukan artikel pengganti. | Task terpisah: sumber/lisensi harga, state stale/error, input/fee/spread, precision dan contoh independen. Owner produk/data. |
| Benchmark TikTok | Tiga tabel third-party; formula ER, periode dan sampel belum diverifikasi ulang. | Verifikasi primer tiap studi, hak data, denominator/kuartil, tidak menyebut angka official TikTok. Owner data/editor. |
| Bandingkan | Preset legacy tidak setara manual v2; contoh Tokopedia/TikTok memiliki komponen8000 yang tidak terlihat dalam kolom fee. | Ledger independen dan tarif primer/status/kategori/cap; jangan menebak komponen. Owner seller/data. |
| Hak, entity, byline | Teks asal dan byline/tanggal diarsipkan, bukan kredensial baru; tidak ada gambar/script sumber digunakan. | Konfirmasi hak republication, responsible entity, penulis/editor yang berwenang. Owner/legal. |
| Kebijakan/proses/privasi | Metodologi, redaksi, editorial dan disclaimer ditandai teks legacy. Username lookup/preset bukan fitur v2. | Konfirmasi manusia atas seluruh teks dan privacy promises; revisi kebijakan terpisah sebelum production. Owner/legal. |
| Kesegaran dan kesalahan sumber | Tarif/hukum/studi lama diberi review notice. Artikel saham memuat contoh fee/fraksi tidak konsisten; pembulatan Shopee lama berbeda dari aggregate v2. | Verifikasi primer dan koreksi editorial yang disetujui, jangan diam-diam mengganti angka arsip. Owner formula/legal. |
| Preset seller | 100 kalkulator v2 tetap, empat seller manual; link fitur legacy tetap eksternal. | Penerimaan tertulis perubahan preset→manual atau task parity tersendiri. Owner produk. |
| GSC/GA4/backlinks | UNKNOWN; crawl bukan indexed footprint atau bukti trafik setara. | GSC enam bulan: Pages/Queries, clicks/impressions/CTR/position, page-query pairs, indexing/sitemaps. GA4 organic Landing page+query, sessions/engagement/key events, timezone/export date; backlinks utama dan legacy404. Owner SEO. |
| Host policy | Legacy apex308→www; canonical v2 apex tidak diubah. Kedua opsi diuji pada model murni; konfigurasi berlawanan membuat loop. | SEO/domain owner memilih www atau apex, satu-hop final, penghapusan aturan berlawanan dan persetujuan canonical dalam task baru bila www dipilih. |
| Perangkat nyata/CWV | Chromium desktop/mobile dan WebKit emulasi, lab bukan perangkat fisik/fieldp75. | iOS Safari dan Android Chrome nyata, koneksi lambat, keyboard/assistive tech. Owner QA. |
| Rollback | Runbook DRAFT sebelumnya berlaku; legacy harus dipertahankan. | Nama operator/approval/change ticket, snapshot config/TLS, SHA/deployment rollback terverifikasi pada hari perubahan, jendela dan threshold bisnis. Owner operasi. |

## Memo host tanpa mutasi

Rekomendasi draft: apex sebagai calon canonical karena cocok konfigurasi v2 yang sudah ada. Untuk opsi ini, aturan apex→www lama harus diganti sebagai satu paket perubahan yang disetujui, lalu www→apex301 satu hop mempertahankan path/query. Jangan menumpuk kedua arah. Opsi mempertahankan www juga sah untuk dinilai SEO, tetapi memerlukan perubahan canonical v2 yang **tidak diizinkan tugas ini**. `scripts/legacy/host-policy.cjs` hanya model unit test, tidak diimpor aplikasi/Vercel. Tidak ada aturan host/path aktif baru.

Instruksi cutover BARU harus menyebut SHA lengkap, project/deployment legacy dan v2, hostname persis, perubahan DNS/alias/canonical/indexing, jendela, operator dan rollback. CI hijau/Preview READY tidak menggantikan persetujuan tersebut. Selama tiga route dan keputusan di atas belum diselesaikan, domain move tetap **NO-GO**.
