import {
  calculateEoq, calculateFoodCost, calculatePayback, calculateProjectQuote, calculateVolumetric, type BatchFourResult,
} from './engines'

export type BatchField = {
  id: string
  label: string
  type: 'integer' | 'decimal' | 'choice' | 'date'
  unit?: string
  options?: readonly { value: string; label: string }[]
  signed?: boolean
}
export type BatchTool = {
  title: string
  description: string
  category: 'bisnis' | 'marketplace'
  keywords: readonly string[]
  inputFields: readonly BatchField[]
  rowFields?: readonly BatchField[]
  rows?: 'ingredients' | 'flows'
  outputFields: readonly BatchField[]
  engine: (input: unknown) => BatchFourResult
  hint: string
  assumptions: string
  formula: string
  example: string
  limits: string
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const decimal = (id: string, label: string): BatchField => ({ id, label, type: 'decimal' })

export const batchFourTools = {
  'food-cost': {
    title: 'Kalkulator Food Cost Resep',
    description: 'Hitung total biaya bahan resep dan biaya per porsi dari beberapa bahan dengan ukuran kemasan berbeda.',
    category: 'bisnis',
    keywords: ['food cost', 'biaya resep', 'biaya bahan per porsi'],
    inputFields: [{ id: 'servings', label: 'Jumlah porsi', type: 'integer' }],
    rows: 'ingredients',
    rowFields: [
      money('price', 'Harga kemasan'),
      { id: 'unit', label: 'Satuan bersama', type: 'choice', options: ['g', 'kg', 'ml', 'l', 'unit'].map(unit => ({ value: unit, label: unit })) },
      decimal('package', 'Isi kemasan'), decimal('usage', 'Pemakaian resep'),
    ],
    outputFields: [money('perServing', 'Biaya bahan per porsi'), money('total', 'Total biaya bahan resep')],
    engine: calculateFoodCost,
    hint: 'Masukkan setiap bahan dalam satuan yang sama untuk isi kemasan dan pemakaiannya. Maksimal tiga desimal untuk kuantitas.',
    assumptions: 'Biaya bahan dihitung eksak sebelum total dan biaya per porsi dibulatkan ke atas ke rupiah utuh.',
    formula: 'Biaya bahan = harga kemasan × pemakaian ÷ isi kemasan. Total resep adalah jumlah seluruh biaya bahan. Biaya per porsi = total eksak ÷ jumlah porsi.',
    example: 'Bahan A Rp20.000 untuk 1.000 g, dipakai 250 g, memberi Rp5.000. Bahan B Rp12.000 untuk 6 unit, dipakai 2 unit, memberi Rp4.000. Resep Rp9.000 untuk 4 porsi memberi Rp2.250/porsi.',
    limits: 'Satu satuan berlaku untuk kemasan dan pemakaian dalam setiap baris. Biaya tenaga kerja, utilitas, susut tambahan dan layanan perlu dihitung terpisah. Hasil mengukur biaya bahan. Harga jual dan persentase food cost memerlukan data penjualan.',
    testCase: 'food cost sums multiple rational ingredient costs before rounding',
  },
  'harga-borongan': {
    title: 'Kalkulator Harga Borongan Jasa',
    description: 'Hitung penawaran proyek jasa dari jam kerja, biaya tenaga kerja, material, overhead, dan target laba tetap.',
    category: 'bisnis',
    keywords: ['harga borongan', 'penawaran proyek jasa', 'biaya tenaga kerja proyek'],
    inputFields: [decimal('hours', 'Jam kerja proyek'), money('hourly', 'Biaya tenaga kerja per jam'), money('materials', 'Material proyek'), money('overhead', 'Overhead proyek'), money('profit', 'Target laba tetap')],
    outputFields: [money('quote', 'Penawaran minimum proyek'), money('cost', 'Total biaya proyek'), money('labor', 'Biaya tenaga kerja')],
    engine: calculateProjectQuote,
    hint: 'Biaya per jam adalah pengeluaran tenaga kerja. Masukkan target laba sebagai rupiah tetap.',
    assumptions: 'Penawaran dan biaya ditampilkan dengan pembulatan ke atas ke rupiah utuh.',
    formula: 'Total biaya = jam × biaya tenaga kerja per jam + material + overhead. Penawaran = total biaya + target laba tetap.',
    example: '2,5 jam × Rp40.000/jam + material Rp30.000 + overhead Rp10.000 = biaya Rp140.000. Dengan target laba Rp25.000, penawaran minimum Rp165.000.',
    limits: 'Gunakan biaya untuk lingkup proyek yang sama. Pajak dan cadangan risiko perlu diperkirakan terpisah. Biaya tenaga kerja per jam merupakan biaya internal proyek, sedangkan penawaran adalah nilai yang diajukan kepada pelanggan.',
    testCase: 'project quote uses fixed profit and rounds up only final costs',
  },
  eoq: {
    title: 'Kalkulator EOQ',
    description: 'Hitung ukuran pesanan ekonomis unit bulat dari permintaan tahunan, biaya pesan, dan biaya simpan.',
    category: 'bisnis',
    keywords: ['eoq', 'economic order quantity', 'ukuran pesanan ekonomis'],
    inputFields: [{ id: 'demand', label: 'Permintaan tahunan (unit)', type: 'integer' }, money('order', 'Biaya per pesanan'), money('holding', 'Biaya simpan per unit per tahun')],
    outputFields: [
      { id: 'quantity', label: 'EOQ unit bulat', type: 'integer', unit: 'unit' },
      money('ordering', 'Biaya pesan tahunan pada EOQ'), money('holding', 'Biaya simpan tahunan pada EOQ'),
    ],
    engine: calculateEoq,
    hint: 'Gunakan permintaan dalam unit utuh per tahun dan biaya simpan untuk satu unit selama satu tahun.',
    assumptions: 'Dua unit bulat di sekitar akar dibandingkan dengan biaya eksak. Biaya tahunan ditampilkan ke rupiah terdekat.',
    formula: 'EOQ kontinu = akar(2 × permintaan tahunan × biaya per pesanan ÷ biaya simpan/unit/tahun). Biaya relevan tahunan = permintaan × biaya pesan ÷ ukuran pesanan + biaya simpan × ukuran pesanan ÷ 2.',
    example: 'Permintaan 1.000 unit/tahun, biaya pesan Rp100, dan biaya simpan Rp20/unit/tahun memberi EOQ 100 unit. Biaya pesan dan simpan masing-masing Rp1.000/tahun.',
    limits: 'Model mengasumsikan permintaan konstan, penerimaan langsung, tanpa stockout dan diskon kuantitas. Jika permintaan atau biaya pesan nol, batas optimum kontinu nol merupakan kasus degenerat. Model perlu disesuaikan dengan kapasitas gudang dan ketentuan pemasok.',
    testCase: 'EOQ chooses the exact integer cost minimum around the square root',
  },
  'payback-period': {
    title: 'Kalkulator Payback Period',
    description: 'Hitung waktu pemulihan pertama investasi dari daftar arus kas bersih beberapa periode.',
    category: 'bisnis',
    keywords: ['payback period', 'balik modal investasi', 'arus kas beberapa periode'],
    inputFields: [
      money('investment', 'Investasi awal'),
      { id: 'period', label: 'Satuan periode', type: 'choice', options: [{ value: 'bulan', label: 'Bulan' }, { value: 'tahun', label: 'Tahun' }] },
    ],
    rows: 'flows',
    rowFields: [{ ...money('amount', 'Arus kas bersih'), signed: true }],
    outputFields: [{ id: 'payback', label: 'Pemulihan pertama', type: 'decimal', unit: 'periode' }, money('cumulative', 'Akumulasi arus kas dalam horizon')],
    engine: calculatePayback,
    hint: 'Isi arus kas berurutan dari periode pertama setelah investasi. Semua periode harus sama panjang. Arus keluar boleh negatif.',
    assumptions: 'Fraksi memakai arus merata sepanjang periode. Hasil mengukur pemulihan pertama dan ditampilkan hingga dua desimal.',
    formula: 'Jumlahkan arus kas bersih berurutan sampai investasi pulih. Fraksi periode pemulihan = sisa investasi sebelum periode itu ÷ arus kas positif pada periode tersebut.',
    example: 'Investasi Rp100 dengan arus Rp30, −Rp10, Rp50, dan Rp60 pulih pertama setelah 3,5 periode. Jika semua periode adalah tahun, hasilnya 3,5 tahun.',
    limits: 'Perhitungan tanpa diskonto. Arus keluar setelah pemulihan dapat mengurangi saldo kembali. Gunakan analisis NPV atau discounted payback jika perlu memperhitungkan nilai waktu uang.',
    testCase: 'payback handles uneven signed flows and first recovery',
  },
  'berat-volumetrik': {
    title: 'Kalkulator Berat Volumetrik',
    description: 'Bandingkan berat volumetrik paket dan berat aktual menggunakan divisor kurir yang Anda masukkan.',
    category: 'marketplace',
    keywords: ['berat volumetrik', 'berat dimensi paket', 'berat pembanding kirim'],
    inputFields: [
      decimal('length', 'Panjang (cm)'), decimal('width', 'Lebar (cm)'), decimal('height', 'Tinggi (cm)'),
      decimal('divisor', 'Divisor kurir (cm³/kg)'), decimal('actual', 'Berat aktual (kg)'),
    ],
    outputFields: [{ id: 'comparison', label: 'Berat pembanding mentah', type: 'decimal', unit: 'kg' }, { id: 'volumetric', label: 'Berat volumetrik mentah', type: 'decimal', unit: 'kg' }],
    engine: calculateVolumetric,
    hint: 'Masukkan divisor dari ketentuan layanan kurir Anda. Semua angka menerima maksimal tiga desimal.',
    assumptions: 'Berat mentah ditampilkan hingga enam desimal. Perbandingan memakai angka eksak sebelum pembulatan.',
    formula: 'Berat volumetrik (kg) = panjang × lebar × tinggi (cm) ÷ divisor (cm³/kg). Berat pembanding adalah nilai terbesar antara volumetrik dan aktual.',
    example: 'Paket 40×30×20 cm dengan divisor contoh pengguna 6.000 memberi berat volumetrik 4 kg. Jika aktual 3 kg, berat pembanding 4 kg.',
    limits: 'Kurir dapat membulatkan dimensi dan berat sesuai layanan. Berat pembanding ini perlu disesuaikan dengan ketentuan tagihan kurir. Divisor harus berasal dari layanan yang dipilih.',
    testCase: 'volumetric weight compares exact fractions before display rounding',
  },
} satisfies Record<string, BatchTool>
export type BatchSlug = keyof typeof batchFourTools
