"use client";
import { useState } from "react";
import { StructuredForm } from "../ui/structured-form";
import { ResultPanel } from "../ui/calculator";
import { calculateStock, display } from "../../lib/stock-parity/engine";
import { stockFields } from "../../lib/stock-parity/fields";
import styles from "../ui/calculator.module.css";
export function StockParityForm() {
  const [result, setResult] = useState<ReturnType<typeof calculateStock>>();
  const r = result?.success ? result : undefined;
  return (
    <div className={styles.grid}>
      <StructuredForm
        tool={stockFields}
        errors={result?.success === false ? result.errors : undefined}
        onResult={(v) => setResult(calculateStock(v))}
        onChange={() => setResult(undefined)}
      />
      <ResultPanel
        result={
          r
            ? {
                label: "Rata-rata biaya dari input",
                value: display(r.average) + " Rp/saham",
              }
            : undefined
        }
        message="Isi data manual dan cek cakupan biaya. Tidak ada harga order BEI tersertifikasi."
        details={
          r
            ? [
                {
                  label: "Total saham / lot",
                  value: r.shares + " / " + display({ n: r.shares, d: 100n }),
                },
                { label: "Modal inklusif", value: display(r.capital) + " Rp" },
                {
                  label: "Biaya beli terpisah yang dicatat",
                  value: display(r.buyFees) + " Rp",
                },
                {
                  label: "Alokasi modal untuk saham dijual",
                  value: display(r.allocated) + " Rp",
                },
                {
                  label: "Impas teoretis",
                  value: display(r.theoretical) + " Rp/saham",
                },
                { label: "Neto penjualan", value: display(r.payout) + " Rp" },
                {
                  label: "Laba/rugi setelah biaya yang diisi",
                  value: display(r.profit) + " Rp",
                },
                {
                  label: "ROI modal teralokasi",
                  value: r.roi ? display(r.roi) + "%" : "Tidak terdefinisi",
                },
                {
                  label: "Fraksi dari penutupan sebelumnya",
                  value: r.tick
                    ? r.tick + " Rp (bukan validasi order)"
                    : "Acuan belum diisi",
                },
                { label: "Grid", value: r.grid.status },
                {
                  label: "Kandidat hipotetis",
                  value: r.grid.price
                    ? display(r.grid.price) +
                      " Rp; neto " +
                      display(r.grid.net!) +
                      " Rp"
                    : "Tidak diberikan",
                },
                {
                  label: "Neto satu tick sebelumnya",
                  value: r.grid.predecessorNet
                    ? display(r.grid.predecessorNet) + " Rp"
                    : "Di luar batas / tidak diberikan",
                },
                { label: "Target rata-rata", value: r.solver.status },
                {
                  label: "Lot minimum",
                  value:
                    r.solver.lots === undefined
                      ? "Tidak diberikan"
                      : String(r.solver.lots),
                },
              ]
            : []
        }
        assumptions="Versi stock-parity-v1. Pecahan eksak, tampilan 6 desimal half-away. Fee broker, pajak, minimum/cap jual dan pembulatan nota tidak diverifikasi. Bukan nasihat transaksi. Cutover NO-GO."
      />
    </div>
  );
}
