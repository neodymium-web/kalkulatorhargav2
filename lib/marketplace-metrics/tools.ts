import { calculateAcos, calculateAov, calculateBreakEvenRoas, calculateConversion, calculateRoas, type MetricResult } from './engines'

type Field = { id: string; label: string; type: 'integer'; unit?: string }
type ResultField = { id: string; label: string; type: 'integer' | 'decimal'; unit: 'IDR-whole' | 'IDR' | '%' | 'x' }
export type MetricTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly Field[]
  outputFields: readonly ResultField[]
  engine: (input: unknown) => MetricResult
  hint: string
  assumptions: string
  formula: string
  example: string
  limits: string
  testCase: string
}
const money = (id: string, label: string): Field => ({ id, label, type: 'integer', unit: 'IDR' })
const attributed = money('revenue', 'Pendapatan teratribusi')
const adSpend = money('spend', 'Biaya iklan')
const adScope = 'Gunakan akun/platform, mata uang, periode, dan jendela atribusi yang sama. Masukkan rupiah utuh.'

export const metricTools = {
  roas: {
    title: 'Kalkulator ROAS',
    description: 'Hitung kelipatan pendapatan teratribusi terhadap biaya iklan pada cakupan yang sama.',
    keywords: ['roas', 'return on ad spend', 'pendapatan teratribusi'],
    inputFields: [attributed, adSpend],
    outputFields: [{ id: 'roas', label: 'ROAS', type: 'decimal', unit: 'x' }],
    engine: calculateRoas,
    hint: adScope,
    assumptions: 'ROAS menunjukkan rupiah pendapatan teratribusi per rupiah belanja iklan. Hasil dibulatkan ke dua desimal.',
    formula: 'ROAS = pendapatan teratribusi ÷ biaya iklan. Penyebut biaya iklan harus positif.',
    example: 'Pendapatan teratribusi Rp400.000 dan biaya iklan Rp100.000 menghasilkan ROAS 4,00x.',
    limits: 'Samakan model dan jendela atribusi pada data sumber. ROAS mengukur hubungan pendapatan yang dikreditkan dengan belanja iklan. Laba, ROI, dan pengaruh sebab-akibat iklan perlu dianalisis dengan biaya dan data tambahan.',
    testCase: 'ROAS uses attributed revenue and rejects zero spend',
  },
  'roas-impas': {
    title: 'Kalkulator ROAS Impas',
    description: 'Hitung ambang ROAS untuk menutup iklan dari margin kontribusi sebelum biaya iklan.',
    keywords: ['roas impas', 'break even roas', 'margin kontribusi sebelum iklan'],
    inputFields: [attributed, money('variable', 'Biaya variabel sebelum iklan')],
    outputFields: [
      { id: 'threshold', label: 'Ambang minimum ROAS', type: 'decimal', unit: 'x' },
      { id: 'contribution', label: 'Kontribusi sebelum iklan', type: 'integer', unit: 'IDR-whole' },
      { id: 'margin', label: 'Margin kontribusi sebelum iklan', type: 'decimal', unit: '%' },
    ],
    engine: calculateBreakEvenRoas,
    hint: 'Gunakan transaksi, periode, mata uang, dan cakupan atribusi yang sama. Biaya variabel mengecualikan iklan.',
    assumptions: 'Ambang dibulatkan ke atas ke dua desimal. Angka mewakili margin kontribusi riwayat atau skenario yang Anda masukkan.',
    formula: 'Kontribusi = pendapatan teratribusi − biaya variabel sebelum iklan. Jika kontribusi positif, ROAS impas = pendapatan ÷ kontribusi = 1 ÷ margin kontribusi.',
    example: 'Pendapatan Rp100.000 dan biaya variabel Rp60.000 memberi kontribusi Rp40.000 dan ambang 2,50x. Biaya Rp70.000 memberi ambang minimum 3,34x setelah pembulatan ke atas.',
    limits: 'Masukkan biaya produk, fee marketplace, pengiriman yang ditanggung penjual, dan biaya variabel transaksi lain yang relevan. Cocokkan penyesuaian diskon/refund pada pendapatan dan biaya. Margin membagi kontribusi dengan pendapatan, sedangkan markup memakai biaya sebagai pembagi. Ambang ini menutup iklan dalam model kontribusi. Biaya tetap dan pajak yang belum dimasukkan memengaruhi hasil usaha secara keseluruhan.',
    testCase: 'break-even ROAS ceilings the exact contribution threshold',
  },
  acos: {
    title: 'Kalkulator ACOS',
    description: 'Hitung biaya iklan sebagai persentase penjualan teratribusi pada kampanye yang sama.',
    keywords: ['acos', 'advertising cost of sales', 'persentase biaya iklan'],
    inputFields: [adSpend, attributed],
    outputFields: [{ id: 'acos', label: 'ACOS', type: 'decimal', unit: '%' }],
    engine: calculateAcos,
    hint: adScope,
    assumptions: 'ACOS memakai pendapatan penjualan yang teratribusi pada iklan dalam cakupan ini.',
    formula: 'ACOS = biaya iklan ÷ pendapatan teratribusi × 100%. Untuk dua nominal positif, ACOS% = 100 ÷ ROASx pada angka eksak.',
    example: 'Biaya iklan Rp100.000 dan pendapatan teratribusi Rp400.000 memberi ACOS 25,00%. Biaya Rp1 dari pendapatan Rp3 memberi 33,33%.',
    limits: 'Pendapatan toko keseluruhan hanya bisa dipakai jika sama dengan cakupan penjualan teratribusi yang dianalisis. Pendapatan nol membuat ACOS tidak terdefinisi, termasuk ketika biaya iklan nol. Hasil dibulatkan sendiri dari input dan tidak diturunkan dari ROAS tampilan.',
    testCase: 'ACOS treats zero revenue as undefined and zero spend as zero',
  },
  'konversi-toko': {
    title: 'Kalkulator Konversi Toko',
    description: 'Hitung persentase kunjungan toko yang menghasilkan setidaknya satu pembelian.',
    keywords: ['konversi toko', 'tingkat konversi kunjungan', 'sesi dengan pembelian'],
    inputFields: [
      { id: 'visits', label: 'Total kunjungan', type: 'integer' },
      { id: 'purchasing', label: 'Kunjungan yang menghasilkan pembelian', type: 'integer' },
    ],
    outputFields: [{ id: 'conversion', label: 'Konversi kunjungan', type: 'decimal', unit: '%' }],
    engine: calculateConversion,
    hint: 'Gunakan sesi/kunjungan dari toko, kanal, periode, dan sistem analitik yang sama.',
    assumptions: 'Setiap kunjungan dihitung paling banyak sekali sebagai kunjungan yang membeli.',
    formula: 'Konversi = kunjungan dengan sedikitnya satu pembelian ÷ seluruh kunjungan × 100%.',
    example: '7 kunjungan membeli dari 200 kunjungan menghasilkan 3,50%. Satu dari 32 menghasilkan 3,13% setelah pembulatan.',
    limits: 'Satu sesi bisa menghasilkan beberapa pesanan. Gunakan kunjungan yang membeli untuk pembilang, dan total kunjungan untuk penyebut. Pengunjung unik dan pembeli unik mempunyai definisi hitungan sendiri. Total kunjungan harus positif dan pembilang tidak boleh lebih besar daripada total.',
    testCase: 'conversion uses purchasing visits with 0 and 100 percent boundaries',
  },
  'nilai-pesanan-rata-rata': {
    title: 'Kalkulator Nilai Pesanan Rata-rata',
    description: 'Hitung AOV dari pendapatan produk setelah diskon saat pemesanan dan jumlah pesanan yang sesuai.',
    keywords: ['nilai pesanan rata rata', 'aov', 'average order value'],
    inputFields: [
      money('revenue', 'Pendapatan produk setelah diskon saat pemesanan'),
      { id: 'orders', label: 'Jumlah pesanan berbayar selesai', type: 'integer' },
    ],
    outputFields: [{ id: 'aov', label: 'Nilai pesanan rata-rata', type: 'decimal', unit: 'IDR' }],
    engine: calculateAov,
    hint: 'Gunakan kelompok pesanan yang sama. Pendapatan produk mengecualikan ongkir, pajak, dan refund/retur pascapemesanan.',
    assumptions: 'AOV ditampilkan hingga dua desimal rupiah untuk melihat rata-rata diagnostik.',
    formula: 'AOV = pendapatan produk setelah diskon saat pesanan dibuat ÷ jumlah pesanan dalam kelompok yang sama.',
    example: 'Pendapatan Rp100.000 dari 3 pesanan memberi Rp33.333,33. Pendapatan Rp1 dari 8 pesanan memberi Rp0,13 setelah pembulatan.',
    limits: 'Pilih pesanan berbayar selesai berdasarkan tanggal pemesanan, kecuali pesanan batal, belum dibayar, dan uji. Untuk AOV awal ini, pesanan yang kemudian direfund tetap dihitung, dan nilai produk memakai angka awal setelah diskon sebelum penyesuaian retur/refund. AOV mengukur nilai pesanan. Laba memerlukan perhitungan biaya dan penyesuaian pendapatan yang relevan.',
    testCase: 'AOV rounds matched order cohort revenue to exact cents',
  },
} satisfies Record<string, MetricTool>
export type MetricSlug = keyof typeof metricTools
