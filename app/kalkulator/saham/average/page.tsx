import { StockParityForm } from "../../../../components/stock-parity/form";
import { Breadcrumb } from "../../../../components/breadcrumb";
import { pageMetadata } from "../../../../lib/seo";
import styles from "../../../../components/ui/layout.module.css";
export const metadata = pageMetadata(
  "Average Saham, Impas dan Target Lot Manual",
  "Simulasi modal saham fee-inclusive, beberapa pembelian, impas, target lot dan laba/rugi dengan asumsi manual. Kelayakan order BEI belum tersertifikasi.",
  "/kalkulator/saham/average",
);
export default function StockPage() {
  return (
    <div className={`${styles.container} ${styles.page}`}>
      <Breadcrumb current="Average saham dan impas manual" />
      <h1>Average saham, impas dan target lot</h1>
      <p>
        Simulasi terpadu dengan biaya manual. Tidak ada preset broker atau tarif
        pajak resmi. Halaman staging belum disetujui untuk publikasi/cutover.
      </p>
      <p>
        <strong>
          BLOCKER aturan order: tabel fraksi BEI telah dibaca, tetapi asal grid,
          batas instrumen dan aturan order lengkap belum diverifikasi. Kandidat
          grid hanya simulasi manual, bukan harga yang dipastikan boleh
          diperdagangkan.
        </strong>
      </p>
      <StockParityForm />
      <section className={styles.methodology}>
        <h2>Rumus dan cakupan</h2>
        <p>
          Modal = modal awal inklusif + jumlah bruto pembelian dan fee manual.
          Rata-rata = modal ÷ saham. Rata-rata broker yang sudah mencakup biaya
          tidak ditambah fee lagi. Satu lot reguler 100 saham; pasar
          negosiasi/auction/corporate action tidak dimodelkan. Harga/rate
          memakai pecahan BigInt, bukan floating point.
        </p>
        <p>
          Penjualan parsial mengalokasikan modal menurut proporsi saham. Neto =
          bruto − fee persen/tetap − pajak manual. Impas teoretis = (modal
          teralokasi + biaya jual tetap) ÷ (saham dijual × (1 − total rate)).
          Semua rate berdasar bruto; tarif inklusif memerlukan pajak tambahan 0.
          Biaya nonlinear/cap jual, pembulatan broker dan FIFO tidak didukung.
        </p>
        <h2>Target rata-rata</h2>
        <p>
          Untuk biaya beli affine: lot minimum = ceil((C − T×N + biaya tetap) ÷
          (100×(T − harga beli×(1+rate)))). Target tercapai memberi 0; harga
          efektif≥target berarti tidak mungkin/asimptotik bila posisi belum
          mencapai target. Maksimal 1 miliar lot, kandidat dan satu lot
          sebelumnya diuji. Fee capped/nonlinear ditahan tanpa angka solver.
        </p>
        <h2>Contoh independen</h2>
        <p>
          Modal Rp6.626.000/1.500 saham dan asumsi fee jual inklusif 0,25% tanpa
          pajak tambahan memberi impas Rp4.428,404344…; harga hipotetis 4430
          memberi neto Rp6.628.387,50 dan 4420 memberi Rp6.613.425. Ini
          membuktikan aljabar, bukan validitas order. Fee/rate ini asumsi, bukan
          tarif Stockbit/broker mana pun.
        </p>
        <h2>Sumber dan batas verifikasi</h2>
        <p>
          <a href="https://www.idx.id/id/produk-layanan/jam-dan-mekanisme-perdagangan/">
            BEI: Jam dan Mekanisme Perdagangan
          </a>
          , dibaca 14 November 2026, menyebut Kep-00158/BEI/10-2026 dan fraksi
          berlaku sepanjang hari. Arah fraksi memakai penutupan acuan, tidak
          berubah saat harga teoretis melewati batas kelompok. Nomor aturan
          bukan verifikasi lengkap kelayakan instrumen, grid origin, daily
          limits atau jaminan order terisi.
        </p>
        <p>
          Data biaya/pajak berasal dari input pengguna. Simulasi tidak
          menentukan kewajiban pajak, retensi operasional, atau kesetaraan
          preset legacy. Halaman tidak ditambahkan ke sitemap 131 URL; canonical
          aktif/SSO/noindex tidak diubah. 22 arsip tetap PENDING_OWNER_APPROVAL.
          Cutover NO-GO.
        </p>
      </section>
    </div>
  );
}
