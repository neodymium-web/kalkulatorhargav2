# Audit UX dan aksesibilitas

Snapshot 8 November 2026. Semua 107 halaman diperiksa pada lebar 320/375/768/1024/1440 di Chromium desktop dan mobile emulation. Tambahan 100 state hasil dihitung pada kelima lebar tersebut dalam kedua project. Tidak ada document overflow pada pengukuran ini; tabel lebar memakai local scroll berlabel. Ini mengukur reflow, bukan membuktikan setiap piksel atau kombinasi input tak terbatas.

100 alur input baru berhasil menghitung, lalu mengosongkan required field menghapus hasil lama; submit invalid memberi error dan fokus ke field yang salah. Penekanan Enter pada submit dipakai dalam audit baru. Tes lama tetap dijalankan untuk Tab/Shift-Tab, skip-link, baris dinamis tambah/hapus, selector mode, fokus ledger, pencarian/kategori dan reduced motion. Referensi: `smoke.spec.ts`, `everyday.spec.ts`, `calendar-time.spec.ts`, `creator-analytics.spec.ts`, `platform-settlement.spec.ts`, `layout.spec.ts`. Tidak semua kombinasi kontrol dari100alat diaudit manual dengan keyboard; hasil otomatis dan sampel tidak disebut sebagai pemeriksaan manusia menyeluruh.

axe-core4.14.0:110scan pada31halaman sampel awal dan24state hasil, masing-masing desktop/mobile;0violations untuk tag WCAG2A/AA,2.1AA,2.2AA dan best-practice. Label/landmark/kontras otomatis yang tersedia lulus. Tidak mengklaim konformitas penuh WCAG: screen reader nyata, kebutuhan kognitif, zoom browser200/400%, speech input dan tap pada perangkat fisik belum diverifikasi.

WebKit11alur dengan emulated iPhone13 lulus: HPP,KPR,TikTok kreator,bagi tagihan,usia,TER,impor dan4platform. Ini WebKit desktop dengan emulasi, bukan iOS/Safari di iPhone fisik. Chromium mobile memakai emulasi Android; Android nyata belum diuji. Perbedaan date picker lokal/perangkat masih memerlukan smoke test pemilik sebelum launch.

Run CI pertama meluluskan699Playwright dan seluruh assertion WebKit, tetapi4capture fullpage seller gagal karena DPR3 menghasilkan gambar di atas batas32767piksel renderer Linux. Capture WebKit memakai `scale:'css'` pada revisi berikutnya: seluruh halaman tetap diambil, tidak di-crop, tidak mengubah viewport/DPR aplikasi, assertion atau timeout. Dimensi CSS/DPR dilampirkan dalam artifact agar penyesuaian capture dapat diperiksa. Screenshot Chromium desktop/mobile tetap seperti semula. Hasil run awal yang gagal tidak disebut CI sukses.

## Inspeksi visual yang benar-benar dilakukan

[Indeks62inspeksi](audit/SCREENSHOT_INDEX.md) dan [JSON/hash](audit/screenshot-index.json) mencakup homepage+6hub+24alat, masing-masing desktop1440/mobile375. Sampel: Bisnis3,Keuangan3,MediaSosial2,Seharihari2,Pajak10,Marketplace4. Prioritas legal/settlement,baris dinamis,kalender dan jadwal. Original initial/result fullpage serta critical viewport/panel tersimpan dalam browser-evidence. Review sheet menggabungkan piksel screenshot asli, bukan mockup. Viewport/panel dibaca untuk hasil/label/clip, fullpage thumbnail untuk struktur; tidak semua teks kecil sepanjang fullpage dibaca manual.

HPP146,BEP8unit,NPVnegatif,impor manual dan rekonsiliasi biaya seller memiliki jawaban utama yang jelas. Empat platform membedakan dana cair dari hasil setelahHPP. Batas legal dan simulasi terlihat; tidak ditemukan badge verifikasi atau klaim tarif resmi baru. Invalid HPP mobile memperlihatkan outline fokus biru, error merah dengan teks, dan link ringkasan error. Screenshot noJS setelah perbaikan AR-001 memperlihatkan kontrol disabled dan penjelasan, tanpa berpura-pura kalkulator bekerja tanpa JavaScript.

AR-005 mencatat intro cakupan dan spasi pajak yang padat. Tidak ditemukan clipping pada62sheet yang dilihat. Struktur komponen reusable dipertahankan; tidak menambah chart/dekorasi atau redesign. Perubahan produk audit hanya guard hidrasi AR-001; state hydrated tetap memakai DOM lama agar interaksi tidak berubah.

## Gate perubahan UI audit

Gate ini berlaku pada guard hidrasi AR-001, bukan klaim bahwa seluruh produk bebas temuan atau siap launch. Arah tetap Design System v2; ENERGY2/RHYTHM1/MOTION1 mengikuti utilitas formulir yang konsisten. Fieldset sementara menjaga nilai finansial; tidak menambah motif/aset/desain baru.

| Blok | Status dan bukti |
| --- | --- |
| Hard gate R-02/03/17/18/23–28/32–38 | PASS untuk perubahan guard: copy nyata, tidak ada aset/statistik baru,100form inert noJS;100alur hydrated dan5width lulus; error/fokus terlihat pada screenshot;typecheck/unit/build/browser dijalankan. |
| Purpose gate R-01/04/06–10/12–14/19/22/31 | PASS: tidak ada teknik visual baru; fieldset tanpa border/padding mempertahankan layout lama dengan alasan keamanan sebelum hidrasi. |
| Liveliness | PASS untuk perubahan terbatas: hierarki form/hasil dan aksen fokus biru Design System tetap; dials2/1/1 konsisten; tidak membuat desain baru yang memerlukan identitas baru. |
| Craftsmanship C-1–5 dan consistency locks | PASS untuk guard: fungsi asli terjaga, tidak ada ghost control setelah hidrasi, noJS dijelaskan, dan bukti/regresi tersedia. Temuan produk P2 tetap tercatat, tidak disembunyikan oleh gate perubahan ini. |
