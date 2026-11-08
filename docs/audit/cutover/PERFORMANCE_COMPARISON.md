# Perbandingan performa P2

8 November 2026, macOS arm64 AppleA18Pro, Node22.23.4, Lighthouse13.6.0, Chromium158 Playwright. Build production baseline main ec4bdb2b dibuat terisolasi di worktree; kandidat memakai working tree P2. Dependency/lockfile sama. Tidak ada build, unit test atau workload browser lain berjalan bersamaan dengan pengukuran. Perubahan copy hub Pajak terakhir tidak memengaruhi dua route sampel; CI mengulang pengukuran pada exact SHA final.

Protokol final identik: Chrome baru per pengukuran, default simulated mobile Lighthouse (RTT150ms,throughput1638,4kbps,CPU×4), browser storage/cache direset oleh Lighthouse, home lalu food-cost diseling tiga kali. Setiap run valid dipertahankan, termasuk yang lambat. Tiga adalah sampel kecil, bukan p75/field INP. Raw settings, environment, timestamp, byte/LCP/TBT/CLS ada di `performance-baseline-fresh.json` dan `performance-final-fresh.json`. Keduanya memiliki6run valid dan0invalidAttempts. SHA di laporan lokal kandidat adalah parent saat working tree belum di-commit, bukan klaim SHA build final; exact-head verification berasal dari CI/artifact PR.

| Route | Fase | LCP tiga run (ms) | Median / range (ms) | Transfer bytes per run | TBT median (ms) |
| --- | --- | --- | --- | --- | --- |
| / | Baseline |915,2046,908 |915 /908–2046 |381978 |27 |
| / | Final |2136,907,906 |907 /906–2136 |200118 |25 |
| /kalkulator/food-cost | Baseline |905,905,905 |905 /905–905 |361279 |33,5 |
| /kalkulator/food-cost | Final |2718,911,908 |911 /908–2718 |347679 |35,5 |

Transfer homepage turun181860bytes (47,6%), food-cost turun13600bytes (3,8%). Trace baseline menunjukkan chunk kalkulator169KB di homepage hampir100% tidak digunakan; prefetch kartu dihapus. Trace food-cost juga menunjukkan prefetch RSC enam hub/root yang tidak diperlukan untuk menghitung; prefetch navigasi dibatasi. Tautan/search dan routing kalkulator tetap jalur aslinya. Tradeoff: first navigation mengambil data saat klik, bukan menghabiskan bandwidth untuk tujuan yang belum dipilih.

Tidak ada bukti konsisten perbaikan LCP: median home berubah8ms, food-cost naik6ms, dan worst-case final food-cost2718ms masih melewati target2500ms. CLS seluruh12run final-protocol adalah0. TBT adalah proxy lab, bukan field INP. AR-003 tetap PARTIAL/OPEN untuk profiling dan beberapa run/perangkat/jaringan tambahan sebelum launch. Jangan menyebut penurunan byte sebagai bukti seluruh CWV sudah lulus.

Eksperimen yang ditolak dicatat agar hasil tidak diseleksi:

- Pemisahan20kelompok form lewat next/dynamic menambah transfer food-cost (sekitar386KB vs361KB baseline awal) dan dihapus seluruhnya dari final. Tidak mengubah wiring/engine untuk memaksa hasil benchmark.
- Protokol awal memakai satu Chrome untuk beberapa run; dua fase mengalami recorder NO_NAVSTART. Run tanpa trace/LCP tidak dihitung sebagai hasil. Protokol final fresh browser dijalankan ulang untuk baseline dan kandidat, bukan mengganti satu run valid yang lambat. Ringkasan exploratory lama disimpan terpisah dengan nama fase dan tidak dipakai pada tabel final.
- Script final menyimpan raw invalid report, hanya mengizinkan maksimum3attempt untuk NO_NAVSTART, dan gagal bila tetap invalid/error lain. Tidak mengulang karena skor buruk atau LCP tinggi. CI menyimpan invalidAttempts jika terjadi.

Tidak ada perubahan indexing untuk menaikkan skor SEO. Favicon dan header diperiksa terpisah; angka performa produksi tetap memerlukan data lapangan setelah launch yang kelak diotorisasi.
