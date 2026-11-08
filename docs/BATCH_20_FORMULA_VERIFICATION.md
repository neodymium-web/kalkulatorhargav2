# Batch 20 — verifikasi sebelum implementasi

Tanggal pemeriksaan: 8 November 2026. Indonesia. Keputusan: empat simulator **manual-only**, tanpa preset tarif, tanpa mode tarif terverifikasi. Versi model `manual-settlement-v1`.

## Sumber primer yang benar-benar dibuka

| Platform | Sumber | Hasil pemeriksaan dan keterbatasan |
| --- | --- | --- |
| Shopee | https://help.shopee.co.id/portal/4/article/71187-Syarat-Layanan-Shopee | Syarat layanan Indonesia dapat dibaca; bukan bukti jadwal seluruh kategori, tier, program dan tanggal pesanan. Tidak memasukkan angka tarif dari hasil pencarian sekunder. |
| TikTok Shop | https://seller-id.tiktok.com/university/home | Academy Indonesia menampilkan aplikasi yang membutuhkan JavaScript; tabel biaya tidak dapat diperiksa dari respons. Tidak mengasumsikan kesamaan biaya TikTok Shop dan Shop Tokopedia. |
| Tokopedia | https://assets.tokopedia.net/asts/onboarding/Ketentuan_biaya_Tokopedia_Official_Store.pdf | PDF satu halaman dibaca: rentang per kategori dan catatan nominal bergantung tipe penjual. Tidak menyatakan tanggal berlaku atau cakupan integrasi sekarang; rentang bukan tarif akun tertentu. Tidak digunakan sebagai default. |
| Lazada | https://sellercenter.lazada.co.id/apps/register/lazmall/joining | Respons tidak menyediakan baris tabel yang dapat dibaca. Cuplikan pencarian bukan bukti tabel lengkap dan tidak dijadikan tarif. |

Untuk **setiap** platform: kategori/tier/program/tanggal berlaku, dasar tiap biaya, minimum/cap, PPN, scope cap dan pembulatan invoice terkini belum terverifikasi lengkap. Effective date: **tidak diketahui**. Tidak ada tarif resmi yang diterbitkan aplikasi. Pengguna harus membaca kontrak/rincian pesanan sendiri, memasukkan tarif termasuk perlakuan pajaknya hanya jika tidak membutuhkan model pajak terpisah, dan menyatakan datanya lengkap. Kasus pajak tersendiri ditahan. Perubahan sumber kelak memerlukan pemeriksaan primer baru, tanggal berlaku, versi dan changelog; tidak boleh sekadar mengganti default.

Shopee memisahkan administrasi kategori/tier, pembayaran dan program voucher/gratis ongkir. TikTok Shop memisahkan affiliate dan platform serta konteks kanal Shop Tokopedia. Tokopedia memisahkan konteks legacy/terintegrasi, tanpa menyalin tarif TikTok Shop. Lazada memisahkan komisi, pembayaran, handling, program, iklan dan logistik. Semua adalah petunjuk komponen yang harus diperiksa, bukan klaim fee wajib.

## Kontrak matematika manual

Uang: integer nonnegatif maksimal 13 digit; kuantitas integer 1–10000; tarif 0–100% hingga enam desimal. Semua parsing BigInt, pecahan rasional direduksi; tidak ada Number pada jalur uang.

G = harga unit × kuantitas. D = diskon **seller per pesanan**; 0 ≤ D ≤ G. S = G − D. Diskon tampilan yang didanai platform bukan D dan tidak otomatis mengurangi S. HPP = HPP unit × kuantitas.

0–12 baris fee berlabel unik (trim dan case-insensitive): persen atau tetap. Persen memilih basis G, S, atau nilai custom integer eksplisit. Tarif tidak boleh kosong. Fixed memiliki scope per pesanan atau per unit. Minimum dan maksimum opsional mempunyai pilihan eksplisit: tidak berlaku / berlaku dengan nilai / belum diketahui. Nilai aktif wajib diisi dan min ≤ cap. Fee = min(max(base × rate, minimum), cap), dengan batas yang tidak aktif dilewatkan. Batas ini **hanya per pesanan**, juga untuk total fixed per unit; cap per unit tidak didukung dan pengguna harus memilih kasus di luar model. Tidak ada cap terduga.

Ongkir buyer harus diklasifikasi: pass-through di luar dana seller, penerimaan seller terkonfirmasi, atau belum diketahui. Ongkir buyer pass-through dikeluarkan dari ledger. Reimbursement logistik yang benar-benar dikreditkan terpisah dari biaya ongkir seller. Penerimaan tambahan hanya kredit aktual (termasuk subsidi yang terbukti), bukan diskon platform tampilan. Jangan memasukkan kredit yang sama lagi ke reimbursement/penerimaan lain. Basis custom yang mencakup ongkir/pajak tidak dapat dipakai bila arus kasnya belum dipetakan. Pajak tersendiri, retur/refund/sengketa dan cap per unit di luar model: **status ditahan tanpa angka**.

R = ongkir buyer yang dikreditkan + reimbursement + penerimaan lain. Payout eksak = S + R − Σfee − ongkir seller − penyesuaian biaya lain. Hasil setelah HPP eksak = payout − HPP. Nilai negatif tetap sah. Margin hanya jika S > 0, memakai hasil setelah HPP eksak/S. Ini bukan laba bersih akuntansi dan bukan konfirmasi transfer bank.

Semua fee disimpan eksak, bukan dibulatkan per baris. Cash payout = pembulatan aggregate sekali ke rupiah, setengah menjauhi nol. Cash setelah HPP = cash payout − HPP integer. Adjustment = cash payout − payout eksak. Ledger: S + R − fee − shipping − other + adjustment = cash payout. UI menampilkan pecahan n/d agar nilai eksak dapat diaudit. Pembulatan ini milik simulator, tidak diklaim sama dengan invoice platform.

Sebelum menampilkan uang, diperlukan acknowledgement bahwa semua komponen, scope, basis dan kredit sudah lengkap/0 secara sadar, tidak ganda. Pilihan kosong/belum diketahui menahan hasil; angka malformed tetap invalid. Konteks kategori/tier/program/tanggal hanya catatan pengguna tanpa lookup tarif.

## Vektor independen (berlaku terpisah untuk Shopee, TikTok Shop, Tokopedia, Lazada)

1. Harga 100000 × 2; D=10000; S=190000; HPP=60000×2=120000. Fee net 5%=9500, fixed/order=2000, ongkir seller=3000, kredit dan lainnya0. Payout175500; setelah HPP55500. Tambah fee bruto2%=4000: payout171500; setelah HPP51500.
2. Cap/order8000 pada fee5%net mengubah9500→8000; payout177000 (naik1500). Minimum10000 mengubah9500→10000; cap8000 dengan min10000 invalid.
3. Harga1, qty1, fee50%net→payout1/2→cash1, adjustment1/2. Tambah fixed1→payout−1/2→cash−1, adjustment−1/2. HPP2 menghasilkan cash setelah HPP−3 pada kasus kedua.
4. Harga9999999999999, qty10000, tarif0.000001% gross: G=99999999999990000; fee=9999999999999/10000; payout=99999998999990000.0001; cash99999998999990000. Tidak memakai floating point.
5. Harga0, qty2, diskon0, fee100%net→fee0,payout0,margin tidak terdefinisi. Fixed/unit2000×2=4000 (dibanding fixed/order2000). Semua biaya0 dengan0baris sah hanya dengan acknowledgement lengkap.
6. Buyer shipping10000 pass-through memberi payout175500; credited memberi185500. Reimbursement3000 memberi178500. Tambahan kredit0 tidak otomatis memonetisasi diskon platform. Pemetaan shipping tidak diketahui→ditahan tanpa angka.

## Matriks pengujian sebelum publikasi

Untuk keempat platform: vektor1–6; bruto/net/custom;6desimal;100%; batasuang; negatif; ties±; min/cap monotonic; split/reorder tanpa cap identik; diskonpesanan tidak dikalikan; malformed/null/empty/Infinity/exponent; kuantitas0;diskon>G;min>cap;labelduplikat;12/13baris;rowfocus/stale; unknownack/basis/rate/limit/status→tanpa hasil uang. Tidak ada default fee. UI320/375/768/1024/1440, keyboard, tabel lokal scroll. Screenshot payout nonzero desktop/mobile per platform. Seluruh96regresi lama tetap berjalan;100IDunik/published;Marketplace20/Pajak10/6hub/107sitemap;TikTokcreator tetap pada URL lama. Production/indexing staging tidak diubah.
