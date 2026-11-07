import { calculateFreelance, calculateReorder, calculateRunway, calculateServiceCost, calculateTurnover, type StockServiceResult } from './engines'

type Field = { id: string; label: string; type: 'integer' | 'decimal' | 'date' | 'choice'; control?: 'month'; unit?: string }
export type StockServiceTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly Field[]
  outputFields: readonly Field[]
  engine: (input: unknown) => StockServiceResult
  hint: string
  assumption: string
  formula: string
  example: string
  testCase: string
}
const money = (id: string, label: string): Field => ({ id, label, type: 'integer', unit: 'IDR' })
const decimal = (id: string, label: string): Field => ({ id, label, type: 'decimal' })
const month: Field = { id: 'month', label: 'Bulan acuan', type: 'date', control: 'month' }

export const stockServiceTools = {
  'perputaran-persediaan': {
    title: 'Kalkulator Perputaran Persediaan',
    description: 'Hitung perputaran stok dan estimasi hari persediaan dari harga pokok penjualan serta nilai buku stok.',
    keywords: ['perputaran persediaan', 'inventory turnover', 'hari persediaan'],
    inputFields: [
      { id: 'start', label: 'Tanggal awal', type: 'date' }, { id: 'end', label: 'Tanggal akhir', type: 'date' },
      money('cogs', 'Harga pokok penjualan'), money('opening', 'Persediaan awal'), money('closing', 'Persediaan akhir'),
    ],
    outputFields: [
      { id: 'turnover', label: 'Perputaran persediaan', type: 'decimal', unit: 'kali' },
      { id: 'days', label: 'Estimasi hari persediaan', type: 'decimal', unit: 'hari' },
      { id: 'average', label: 'Rata-rata persediaan', type: 'decimal', unit: 'IDR-decimal' },
    ],
    engine: calculateTurnover,
    hint: 'Gunakan rupiah utuh dari metode penilaian dan periode yang sama.',
    assumption: 'Hari dihitung inklusif dari tanggal awal hingga akhir. Ini ringkasan historis yang peka terhadap musim dan dua saldo yang dipilih.',
    formula: 'Perputaran = harga pokok penjualan ÷ ((persediaan awal + akhir) ÷ 2). Hari persediaan = hari periode ÷ perputaran eksak.',
    example: 'Pada 1–30 April, harga pokok penjualan Rp90.000 dan stok awal Rp20.000 serta akhir Rp40.000 memberi rata-rata Rp30.000, perputaran 3 kali, dan 10 hari.',
    testCase: 'turnover uses exact average and inclusive calendar days',
  },
  'reorder-point': {
    title: 'Kalkulator Reorder Point',
    description: 'Hitung ambang stok untuk memesan ulang dari permintaan harian, lead time, dan stok aman.',
    keywords: ['reorder point', 'titik pemesanan ulang', 'stok minimum'],
    inputFields: [decimal('demand', 'Permintaan rata-rata (unit/hari)'), decimal('lead', 'Lead time (hari)'), decimal('safety', 'Stok aman (unit)')],
    outputFields: [{ id: 'reorder', label: 'Ambang pesan ulang', type: 'integer', unit: 'unit' }],
    engine: calculateReorder,
    hint: 'Gunakan satu item dengan unit fisik diskret. Masukkan maksimal tiga desimal.',
    assumption: 'Ambang dibulatkan ke atas ke unit utuh. Permintaan, stok aman, dan lead time adalah asumsi pengguna pada basis hari yang sama.',
    formula: 'Reorder point = permintaan rata-rata harian × lead time hari + stok aman.',
    example: '2,5 unit/hari × 3,25 hari + 1,1 unit stok aman = 9,225 unit. Ambang pesan ulang dibulatkan menjadi 10 unit.',
    testCase: 'reorder rounds exact scaled demand up to physical units',
  },
  'runway-kas': {
    title: 'Kalkulator Runway Kas',
    description: 'Estimasi berapa bulan kas tersedia menutup burn bersih dari arus kas bulanan.',
    keywords: ['runway kas', 'burn rate', 'bulan cadangan kas'],
    inputFields: [month, money('cash', 'Kas tersedia saat awal proyeksi'), money('outflow', 'Kas keluar per bulan'), money('inflow', 'Kas masuk per bulan')],
    outputFields: [{ id: 'months', label: 'Runway kas', type: 'decimal', unit: 'bulan' }, money('burn', 'Burn bersih per bulan')],
    engine: calculateRunway,
    hint: 'Gunakan rupiah utuh. Kedua arus bulanan harus mengacu pada bulan yang sama.',
    assumption: 'Runway dibulatkan turun ke dua desimal. Tinjau ulang jika ada musim, utang jatuh tempo, pembelian aset, atau perubahan penerimaan.',
    formula: 'Burn bersih = kas keluar bulanan − kas masuk bulanan. Jika burn positif, runway = kas tersedia ÷ burn bersih.',
    example: 'Kas Rp100.000, keluar Rp40.000/bulan, masuk Rp10.000/bulan menghasilkan burn Rp30.000 dan runway 3,33 bulan.',
    testCase: 'runway floors months and makes no-burn an explicit state',
  },
  'biaya-layanan': {
    title: 'Kalkulator Biaya Layanan',
    description: 'Hitung biaya per transaksi tertagih dari biaya tetap bulanan dan biaya variabel per transaksi.',
    keywords: ['biaya layanan', 'biaya jasa per transaksi', 'alokasi biaya tetap'],
    inputFields: [month, money('fixed', 'Biaya tetap bulanan'), { id: 'transactions', label: 'Transaksi tertagih per bulan', type: 'integer' }, money('variable', 'Biaya variabel per transaksi')],
    outputFields: [money('cost', 'Biaya per transaksi'), money('allocation', 'Alokasi tetap per transaksi'), money('total', 'Total biaya bulanan')],
    engine: calculateServiceCost,
    hint: 'Gunakan transaksi yang benar-benar tertagih pada bulan biaya, dalam unit transaksi utuh.',
    assumption: 'Biaya dan alokasi per transaksi dibulatkan ke atas ke rupiah utuh. Total bulanan dihitung dari angka eksak.',
    formula: 'Biaya/transaksi = biaya tetap bulanan ÷ transaksi tertagih + biaya variabel/transaksi. Total bulanan = biaya tetap + transaksi × biaya variabel.',
    example: 'Biaya tetap Rp100.001, 3 transaksi, dan biaya variabel Rp2.000 memberi biaya Rp35.334/transaksi, alokasi tetap Rp33.334, dan total bulanan Rp106.001.',
    testCase: 'service cost rounds up without changing the exact monthly total',
  },
  'tarif-freelance': {
    title: 'Kalkulator Tarif Freelance',
    description: 'Hitung tarif minimum per jam dari kebutuhan penghasilan dan biaya tahunan serta jam tertagih.',
    keywords: ['tarif freelance', 'tarif per jam', 'jam tertagih'],
    inputFields: [money('earnings', 'Target penghasilan pemilik per tahun sebelum pajak'), money('expenses', 'Biaya operasi tahunan'), decimal('hours', 'Jam tertagih per tahun')],
    outputFields: [money('hourly', 'Tarif minimum per jam'), money('requirement', 'Kebutuhan pendapatan tahunan')],
    engine: calculateFreelance,
    hint: 'Gunakan rupiah utuh dan maksimal tiga desimal untuk jam tertagih.',
    assumption: 'Tarif dibulatkan ke atas ke rupiah utuh per jam. Pisahkan penghasilan pemilik dari biaya operasi agar tidak dihitung dua kali.',
    formula: 'Kebutuhan pendapatan tahunan = target penghasilan pemilik + biaya operasi. Tarif minimum = kebutuhan ÷ jam tertagih/tahun.',
    example: 'Target penghasilan Rp120.000.000 dan biaya Rp12.000.001 dengan 1.000,5 jam tertagih memerlukan tarif minimum Rp131.935/jam.',
    testCase: 'freelance rounds the required rate up using exact billable hours',
  },
} satisfies Record<string, StockServiceTool>
export type StockServiceSlug = keyof typeof stockServiceTools
