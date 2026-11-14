import type { BatchField } from "../batch-four/tools";
const n = (id: string, label: string): BatchField => ({
  id,
  label,
  type: "decimal",
});
const choice = (
  id: string,
  label: string,
  options: [string, string][],
): BatchField => ({
  id,
  label,
  type: "choice",
  options: options.map(([value, label]) => ({ value, label })),
});
export const stockFields = {
  rows: "rows",
  inputFields: [
    choice("mode", "Basis posisi awal", [
      ["gross", "Harga beli bruto + biaya"],
      ["inclusive", "Rata-rata broker sudah termasuk biaya"],
    ]),
    n("openingShares", "Saham awal (lembar integer)"),
    n("openingPrice", "Harga/rata-rata awal per saham"),
    n("openingFee", "Biaya awal tambahan (0 wajib jika inklusif)"),
    choice("sellMode", "Cakupan biaya jual", [
      ["inclusive", "Fee jual sudah termasuk pajak"],
      ["separate", "Fee dan pajak terpisah"],
    ]),
    n("sellRate", "Fee jual persen bruto"),
    n("sellFixed", "Biaya jual tetap"),
    n("taxRate", "Pajak jual persen bruto (0 bila inklusif)"),
    n("taxFixed", "Pajak jual nominal (0 bila inklusif)"),
    n("saleShares", "Saham dijual (alokasi rata-rata biaya)"),
    n("salePrice", "Harga jual skenario"),
    n("target", "Target rata-rata biaya per saham"),
    n("targetPrice", "Harga bruto pembelian untuk target"),
    n("targetRate", "Fee beli target persen bruto"),
    n("targetFixed", "Biaya beli target tetap"),
    choice("targetFeeModel", "Model fee solver", [
      ["affine", "Persentase + nominal tetap per transaksi"],
      ["unsupported", "Capped/nonlinear/belum lengkap"],
    ]),
    n("previousClose", "Harga penutupan acuan hari sebelumnya"),
    choice("gridContext", "Status grid", [
      ["unknown", "Belum diverifikasi; tanpa harga tersertifikasi"],
      ["hypothetical", "Simulasi grid manual saja"],
    ]),
    n("gridOrigin", "Asal grid hipotetis (bukan ditebak dari BEI)"),
    n("gridMinimum", "Batas harga bawah hipotetis"),
    n("gridMaximum", "Batas harga atas hipotetis"),
  ],
  rowFields: [
    n("price", "Harga beli bruto per saham"),
    n("lots", "Lot beli (integer, 1 lot = 100 saham)"),
    n("rate", "Fee beli persen bruto"),
    n("fee", "Biaya beli nominal tambahan"),
  ],
  rowConfig: { name: "rows", label: "Pembelian tambahan", max: 100, min: 0 },
  hint: "Semua biaya manual, isi 0 jika nol; tanpa preset broker/pajak. Maksimal 13 digit dan 6 desimal, saham integer, lot 1–1 miliar. Posisi broker inklusif tidak boleh dibebani ulang. Penjualan parsial memakai alokasi rata-rata biaya. Input solver/grid boleh kosong bila memilih status tidak didukung/belum diverifikasi; tidak ada angka default resmi.",
};
