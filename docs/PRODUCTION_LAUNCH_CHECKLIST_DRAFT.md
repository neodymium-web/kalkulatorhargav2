# Checklist launch: DRAFT, belum diotorisasi

Audit atau PR ini bukan izin launch. Jangan menjalankan langkah perubahan di bawah sebelum persetujuan manusia yang khusus menyebut deployment, tanggal, domain dan rollback. Tidak ada DNS,domain,alias,canonical,indexability atau production yang diubah dalam tugas ini.

## Sebelum mengusulkan cutover

- Pemilik produk menyetujui daftar temuan dan penutupan P0/P1; konfirmasi seluruh100kalkulator serta snapshot hukum. Review pajak manusia untuk scope berisiko, bukan sekadar CI hijau.
- Verifikasi actual app headers,robots.txt,sitemap.xml di Preview final melalui akses yang diotorisasi. Pastikan CI/artifact/READY terikat SHA yang sama dan deployment benar-benar Preview.
- Tutup atau terima secara tertulis P2 internal crawlability,lab LCP,favicon,copy dan header hardening. Jalankan ulang crawl dari root tanpa JS; periksa107canonical dan sitemap.
- Uji perangkat fisik Safari/iOS dan Android,screen reader,zoom dan keyboard. Rekam perangkat/versi/batas; jangan menamai emulasi sebagai perangkat nyata.
- Pemilik memberikan baseline GSC/GA4 dan daftar URL website lama. Simpan trafik/ranking/query/landing pages dan inventaris canonical/redirect/404 saat ini sebelum rencana migrasi.
- Buat URL mapping100alat dan legacy: preserve `/kalkulator/tiktok` untuk kreator, seller pada `/kalkulator/tiktok-shop`; tidak membuat redirect massal tanpa relevansi intent. Pemilik SEO menyetujui mapping dan konten.
- Tetapkan pemilik DNS/domain/Vercel/observability,retensi log,privacy notice,anggaran,error budget dan jendela perubahan. Jangan membaca nilai secret ke artifact.

## Rencana perubahan terpisah setelah persetujuan

1. Bekukan SHA kandidat,backup konfigurasi alias/DNS/robots/canonical dan catat deployment legacy terakhir yang dapat dipulihkan. Verifikasi hak akses dan TTL bersama pemilik.
2. Bandingkan konten/100fungsi/107URL kandidat dengan staging yang telah disetujui. Pastikan production config tidak tersalin ke staging; staging tetap noindex dan terlindungi.
3. Usulkan perubahan domain/alias yang spesifik dan rencana robots/canonical/sitemap untuk production saja. Review kedua orang/pemilik sebelum eksekusi. Pertahankan URL legacy yang disetujui atau redirect301satu-hop yang dipetakan.
4. Setelah perubahan yang kelak diotorisasi, ambil network response nyata di domain production:200,canonical tepat,noindex tidak tertinggal,robots sesuai,sitemap107,internal links dan perbedaan cache/host. Jangan membuka staging agar tes ini lewat.
5. Submit sitemap/Search Console hanya oleh pemilik atau tugas baru yang eksplisit. Rekam waktu,property GSC dan rencana pemantauan.

## Rollback dan monitoring

Rollback bila ada salah angka didukung,kebocoran input,indexing tak sengaja,spike5xx,canonical salah atau rute legacy penting hilang. Pulihkan alias/deployment/config yang dibekukan,verifikasi respons dan cache; hanya pemilik berwenang mengeksekusi. Jangan menghapus deployment legacy sebelum periode stabil disetujui.

Pantau segera,24jam,7hari dan28hari:5xx/clienterrors,404/redirectchain,coverageGSC,canonical terpilih,traffic/query legacy,LCP/INP/CLS lapangan p75 dan keluhan hasil hitung. Target LCP≤2,5s,INP≤200ms,CLS≤0,1 bukan jaminan. Tentukan pemilik dan keputusan lanjut/rollback pada setiap tahap. Checklist ini tetap draft meskipun rekomendasi audit menjadi GO.
