# Rencana konsolidasi release blocker

Baseline: `main@b8dd6ee6fe9a45bca1b86e793a430ce25ca27844`.

Ruang lingkup hanya kesiapan migrasi kalkulatorharga.com: 22 arsip, benchmark TikTok, enam referensi legacy, 131 URL v2 dan dua proposal redirect, host www/apex, data SEO UNKNOWN, serta dry-run cutover/rollback. Tidak menambah fitur, mengubah aplikasi, mengaudit manual ulang 100 kalkulator, atau mengubah konfigurasi produksi/staging.

1. Bekukan fingerprint aplikasi dan konfigurasi; gunakan bukti baseline sebagai bukti historis dengan tanggal asalnya.
2. Satukan disposition dan kebutuhan keputusan owner dalam register yang dapat diperiksa mesin. Persetujuan yang belum diberikan tetap UNKNOWN, tanpa nama penanda tangan rekaan.
3. Rekonsiliasi 32 URL konten legacy dengan 131 target v2, benchmark 404, dua fitur manual, serta enam referensi nonklik. Jangan menyamakan keberhasilan teknis dengan persetujuan konten atau intent.
4. Simulasikan kedua opsi host, penggabungan redirect host/path, penolakan loop, kegagalan sebagian perpindahan, dan pemulihan snapshot. Semua lokal; simulasi bukan bukti hak akses, TLS, DNS atau rollback platform yang sebenarnya.
5. Jalankan unit, typecheck, build dan Playwright otomatis sebagai regresi; CI menyimpan laporan dan manifest SHA. Tidak mengulang review manual seluruh kalkulator tanpa temuan regresi.
6. Buka satu PR ke main dengan hasil aktual, keputusan GO/NO-GO terpisah, bukti dan owner handoff. Jangan merge/auto-merge. Preview baru tetap SSO/noindex; share sementara baru hanya jika diizinkan khusus deployment tersebut.

Kriteria selesai tugas persiapan: register konsisten, tes dan dry-run lulus, bukti terikat SHA dan PR review tersedia. Kriteria ini tidak memberi izin cutover. Gate domain tetap NO-GO selama konten/data/host/operasi/otorisasi belum lengkap.
