import {
  calculateCashFlow, calculateCogs, calculateDepreciation, calculateUtilization, calculateYield,
  type OperationResult,
} from './engines'

type Field = { id: string; label: string; type: 'integer' | 'decimal' | 'date' | 'choice'; unit?: string }
export type OperationTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly Field[]
  outputFields: readonly Field[]
  engine: (input: unknown) => OperationResult
  hint: string
  assumption: string
  testCase: string
}

const money = (id: string, label: string): Field => ({ id, label, type: 'integer', unit: 'IDR' })
const decimal = (id: string, label: string, unit?: string): Field => ({ id, label, type: 'decimal', unit })
const period: readonly Field[] = [
  { id: 'start', label: 'Tanggal awal', type: 'date' },
  { id: 'end', label: 'Tanggal akhir', type: 'date' },
]
const samePeriod = 'Gunakan satu periode untuk semua angka. Masukkan rupiah utuh tanpa pemisah.'

export const operationTools = {
  'harga-pokok-penjualan': {
    title: 'Kalkulator Harga Pokok Penjualan',
    description: 'Hitung biaya barang dagang terjual dari persediaan awal, pembelian bersih, dan persediaan akhir.',
    keywords: ['harga pokok penjualan', 'COGS', 'persediaan barang dagang'],
    inputFields: [...period, money('opening', 'Persediaan awal'), money('purchases', 'Pembelian bersih'), money('closing', 'Persediaan akhir')],
    outputFields: [money('cogs', 'Harga pokok penjualan'), money('available', 'Biaya barang tersedia')],
    engine: calculateCogs,
    hint: samePeriod,
    assumption: 'Pembelian bersih mencakup ongkos angkut masuk setelah retur, pengurangan harga, dan diskon pembelian.',
    testCase: 'calculates merchandising COGS and checks available inventory',
  },
  'yield-bahan': {
    title: 'Kalkulator Yield Bahan',
    description: 'Hitung persentase bahan yang dapat digunakan dan susut berat setelah pengolahan.',
    keywords: ['yield bahan', 'susut berat', 'berat bersih bahan'],
    inputFields: [
      { id: 'unit', label: 'Satuan berat', type: 'choice' },
      decimal('gross', 'Berat kotor'), decimal('net', 'Berat bersih'),
    ],
    outputFields: [decimal('yield', 'Yield bahan', '%'), decimal('loss', 'Susut berat'), decimal('lossPercent', 'Persentase susut', '%')],
    engine: calculateYield,
    hint: 'Pilih g atau kg dengan mengetik satuannya. Gunakan satu batch dan maksimal tiga angka desimal.',
    assumption: 'Yield dan persen susut masing-masing dibulatkan ke dua desimal.',
    testCase: 'calculates yield and exact loss in the selected weight unit',
  },
  'penyusutan-garis-lurus': {
    title: 'Kalkulator Penyusutan Garis Lurus',
    description: 'Hitung beban penyusutan buku tahunan dari biaya perolehan, nilai residu, dan umur manfaat.',
    keywords: ['penyusutan aset', 'garis lurus', 'depresiasi tahunan'],
    inputFields: [money('cost', 'Biaya perolehan'), money('residual', 'Nilai residu'), { id: 'years', label: 'Umur manfaat (tahun)', type: 'integer' }],
    outputFields: [money('annual', 'Penyusutan per tahun'), money('base', 'Dasar penyusutan')],
    engine: calculateDepreciation,
    hint: 'Gunakan rupiah dan umur manfaat dalam tahun utuh.',
    assumption: 'Beban satu tahun penuh dibulatkan ke rupiah terdekat.',
    testCase: 'rounds annual book depreciation to whole rupiah',
  },
  'arus-kas': {
    title: 'Kalkulator Arus Kas',
    description: 'Hitung arus kas bersih dan saldo kas akhir dari saldo awal, penerimaan, serta pengeluaran.',
    keywords: ['arus kas', 'saldo kas akhir', 'kas masuk dan keluar'],
    inputFields: [...period, money('opening', 'Saldo awal'), money('receipts', 'Kas masuk'), money('payments', 'Kas keluar')],
    outputFields: [money('closing', 'Saldo akhir'), money('net', 'Arus kas bersih')],
    engine: calculateCashFlow,
    hint: 'Gunakan satu periode dan rupiah utuh. Saldo awal boleh negatif.',
    assumption: 'Ringkasan memakai transaksi kas aktual dalam periode yang dipilih.',
    testCase: 'preserves signed cash balances and warns on a deficit',
  },
  'utilisasi-kapasitas': {
    title: 'Kalkulator Utilisasi Kapasitas',
    description: 'Bandingkan produksi aktual dengan kapasitas acuan yang tersedia dalam satu periode.',
    keywords: ['utilisasi kapasitas', 'kapasitas produksi', 'output aktual'],
    inputFields: [...period, { id: 'unit', label: 'Satuan produksi', type: 'choice' }, decimal('actual', 'Produksi aktual'), decimal('capacity', 'Kapasitas acuan')],
    outputFields: [decimal('utilization', 'Utilisasi kapasitas', '%')],
    engine: calculateUtilization,
    hint: 'Gunakan satu periode dan satu satuan, misalnya unit atau kg. Masukkan maksimal tiga angka desimal.',
    assumption: 'Produksi dan kapasitas acuan memakai satuan dan periode yang sama.',
    testCase: 'rounds utilization and detects overrun before rounding',
  },
} satisfies Record<string, OperationTool>

export type OperationSlug = keyof typeof operationTools
