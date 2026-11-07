import type { BatchField } from '../batch-four/tools'
import {
  calculatePromo,
  calculateShipping,
  calculatePackaging,
  calculateReturns,
  calculateCod,
  type SellerResult,
} from './engines'
export type SellerTool = {
  title: string
  description: string
  keywords: string[]
  inputFields: BatchField[]
  rowFields?: BatchField[]
  rows?: string
  outputFields: { id: string; label: string; type: 'decimal'; unit: string }[]
  engine: (input: unknown) => SellerResult
  hint: string
  formula: string
  example: string
  assumptions: string
  limits: string
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const percent = (id: string, label: string): BatchField => ({ id, label: label + ' (%)', type: 'decimal' })
const count = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const out = (id: string, label: string, unit = 'IDR') => ({ id, label, type: 'decimal' as const, unit })
export const sellerTools = {
  'promo-seller': {
    title: 'Kalkulator Promo Seller',
    description:
      'Pisahkan beban diskon seller, pendanaan platform, harga pembeli, dan penerimaan kotor sebelum fee.',
    keywords: ['promo seller', 'diskon penjual', 'co funding'],
    inputFields: [
      money('price', 'Harga sebelum diskon'),
      money('discount', 'Diskon nominal'),
      percent('share', 'Bagian seller dari diskon'),
    ],
    outputFields: [
      out('burden', 'Beban diskon seller'),
      out('platform', 'Bagian diskon platform'),
      out('buyer', 'Harga produk dibayar pembeli'),
      out('proceeds', 'Penerimaan kotor seller sebelum fee'),
    ],
    engine: calculatePromo,
    hint: 'Mode diskon nominal rupiah. Bagian seller adalah persentase dari diskon, bukan harga. Isi sesuai pembagian kampanye yang dikonfirmasi.',
    formula:
      'Beban seller = diskon × bagian seller. Bagian platform = diskon − beban seller. Harga pembeli = harga awal − diskon. Penerimaan kotor = harga awal − beban seller.',
    example:
      'Harga Rp100.000, diskon Rp20.000 dan bagian seller 25% memberi beban seller Rp5.000, bagian platform Rp15.000, harga pembeli Rp80.000 dan penerimaan kotor Rp95.000.',
    assumptions:
      'Bagian platform diasumsikan benar-benar dikreditkan. Rincian tampilan direkonsiliasi setelah beban seller dibulatkan ke dua desimal.',
    limits:
      'Belum dikurangi fee, pajak, ongkir dan biaya produk. Bukan laba atau dana cair final. Batas voucher, stacking, dan syarat reimbursement perlu diperiksa sendiri.',
    testCase: 'promo reconciles seller and platform funding',
  },
  'subsidi-ongkir': {
    title: 'Kalkulator Subsidi Ongkir',
    description:
      'Hitung ongkir yang ditanggung seller dari biaya aktual, pembayaran pembeli, dan subsidi yang dikreditkan.',
    keywords: ['subsidi ongkir', 'beban pengiriman seller'],
    inputFields: [
      money('actual', 'Ongkir aktual'),
      money('buyer', 'Ongkir dibayar pembeli'),
      money('credit', 'Subsidi platform yang dikreditkan'),
    ],
    outputFields: [
      out('seller', 'Ongkir ditanggung seller'),
      out('actual', 'Ongkir aktual'),
      out('buyer', 'Pendanaan pembeli'),
      out('credit', 'Pendanaan platform'),
    ],
    engine: calculateShipping,
    hint: 'Gunakan biaya dan pendanaan pengiriman yang sama. Subsidi harus benar-benar dikreditkan, bukan sekadar nilai voucher.',
    formula: 'Ongkir seller = ongkir aktual − pembayaran pembeli − subsidi platform yang dikreditkan.',
    example:
      'Ongkir Rp20.000, pembeli membayar Rp5.000 dan platform mengkreditkan Rp10.000 menghasilkan beban seller Rp5.000.',
    assumptions:
      'Pendanaan tidak boleh melebihi biaya aktual; ketidaksesuaian harus diperiksa sebelum menghitung.',
    limits:
      'Tidak ada subsidi atau tarif bawaan. Masukkan surcharge yang relevan dalam ongkir aktual; hindari menggabungkan periode atau pengiriman berbeda.',
    testCase: 'shipping rejects overfunding',
  },
  'biaya-kemasan': {
    title: 'Kalkulator Biaya Kemasan',
    description: 'Jumlahkan biaya banyak bahan kemasan per kiriman dan batch dengan penyesuaian waste.',
    keywords: ['biaya kemasan', 'packaging', 'bahan kemasan'],
    inputFields: [count('shipments', 'Jumlah kiriman dalam batch')],
    rows: 'materials',
    rowFields: [
      money('price', 'Harga pembelian bahan'),
      {
        id: 'unit',
        label: 'Satuan pembelian dan penggunaan',
        type: 'choice',
        options: ['pcs', 'm', 'cm', 'g', 'kg', 'ml', 'l'].map((value) => ({ value, label: value })),
      },
      { id: 'quantity', label: 'Kuantitas pembelian', type: 'decimal' },
      { id: 'usage', label: 'Penggunaan layak pakai per kiriman', type: 'decimal' },
      percent('waste', 'Waste dari bahan pembelian'),
    ],
    outputFields: [out('per', 'Biaya kemasan per kiriman'), out('total', 'Total biaya kemasan batch')],
    engine: calculatePackaging,
    hint: 'Tambahkan setiap bahan. Gunakan satuan yang sama dalam satu baris. Kuantitas hingga tiga desimal; waste adalah bagian pembelian yang terbuang, harus kurang dari 100%.',
    formula:
      'Biaya per kiriman = jumlah [harga pembelian × penggunaan per kiriman ÷ (kuantitas pembelian × (1 − waste))]. Total batch = biaya eksak per kiriman × jumlah kiriman.',
    example:
      'Kardus Rp100.000/100 pcs, pemakaian 1 pcs, waste 0% = Rp1.000. Perekat Rp20.000/100 m, pemakaian 2 m, waste 20% = Rp500. Total Rp1.500/kiriman; 10 kiriman Rp15.000.',
    assumptions:
      'Pecahan seluruh bahan dijumlah sebelum pembulatan. Total batch memakai angka eksak, bukan biaya per kiriman tampilan.',
    limits:
      'Alokasi konsumsi bahan kemasan saja; ongkir dan tenaga kerja dihitung terpisah. Bukan jumlah paket pembelian bulat. Waste mengurangi bahan layak pakai; tidak berarti tambahan konsumsi persentase. Maksimal 100 bahan.',
    testCase: 'packaging sums rational materials before rounding',
  },
  'biaya-retur': {
    title: 'Kalkulator Biaya Retur',
    description:
      'Hitung kerugian bersih satu retur dan ekspektasi biaya incremental per pesanan serta total kelompok.',
    keywords: ['biaya retur', 'ekspektasi retur', 'kerugian retur'],
    inputFields: [
      money('gross', 'Kerugian bruto per retur'),
      money('recovery', 'Pemulihan per retur'),
      percent('rate', 'Probabilitas retur'),
      count('orders', 'Jumlah pesanan dalam kelompok'),
    ],
    outputFields: [
      out('per', 'Ekspektasi kerugian retur per pesanan'),
      out('net', 'Kerugian bersih per retur'),
      out('total', 'Ekspektasi total kerugian retur'),
    ],
    engine: calculateReturns,
    hint: 'Isi biaya incremental yang tidak pulih: ongkir, kerusakan, penanganan atau refund pada cakupan sama. Pemulihan belum dikurangkan dari kerugian bruto.',
    formula:
      'Kerugian bersih = kerugian bruto − pemulihan. Ekspektasi per pesanan = probabilitas retur × kerugian bersih. Total = jumlah pesanan × ekspektasi eksak.',
    example:
      'Kerugian bruto Rp50.000, pemulihan Rp20.000, probabilitas 5% dan 100 pesanan memberi kerugian bersih Rp30.000, ekspektasi Rp1.500/pesanan dan total Rp150.000.',
    assumptions:
      'Ekspektasi adalah rata-rata model, bukan tagihan atau prediksi kejadian aktual. Probabilitas dan biaya rata-rata sama untuk kelompok ini.',
    limits:
      'Jangan menghitung refund dan pembalikan pendapatan dua kali; keluarkan biaya produk yang sudah pulih. Pemulihan tidak boleh melebihi bruto. Pisahkan retur umum dari gagal COD.',
    testCase: 'returns preserve small probabilities in batch totals',
  },
  'kerugian-cod': {
    title: 'Kalkulator Kerugian COD',
    description:
      'Hitung ekspektasi pengiriman COD gagal dan kerugian tanpa membulatkan jumlah gagal lebih awal.',
    keywords: ['kerugian cod', 'gagal cod', 'cash on delivery'],
    inputFields: [
      count('attempts', 'Jumlah percobaan kirim COD'),
      percent('rate', 'Probabilitas gagal COD'),
      money('loss', 'Biaya bersih tidak pulih per gagal COD'),
    ],
    outputFields: [
      out('total', 'Ekspektasi total kerugian COD'),
      out('failures', 'Ekspektasi jumlah gagal COD', 'attempts'),
      out('per', 'Ekspektasi biaya per percobaan'),
    ],
    engine: calculateCod,
    hint: 'Gunakan probabilitas dari data atau skenario Anda. Biaya adalah kerugian incremental bersih setelah recovery, bukan seluruh harga jual.',
    formula:
      'Ekspektasi gagal = percobaan × probabilitas gagal. Ekspektasi kerugian = percobaan × probabilitas × biaya bersih per gagal. Biaya per percobaan = probabilitas × biaya bersih.',
    example:
      '100 percobaan, probabilitas 3,5% dan biaya Rp20.000 menghasilkan ekspektasi 3,5 kegagalan dan kerugian Rp70.000; Rp700 per percobaan.',
    assumptions:
      'Jumlah gagal ekspektasian boleh pecahan. Total dihitung sebelum pembulatan. Biaya per percobaan tetap parameter model saat jumlah percobaan nol.',
    limits:
      'Bukan prediksi jumlah paket aktual atau seluruh retur. Gunakan ongkir, kerusakan kemasan, penanganan dan biaya yang benar-benar tidak pulih pada gagal COD; tidak ada probabilitas bawaan. Ketentuan logistik, ongkir retur, dan reimbursement mengikuti pengaturan marketplace atau mitra Anda.',
    testCase: 'COD never rounds expected failures before loss',
  },
} satisfies Record<string, SellerTool>
export type SellerSlug = keyof typeof sellerTools
