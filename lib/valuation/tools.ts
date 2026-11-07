import type { BatchField } from '../batch-four/tools'
import type { ValuationSourceId } from './sources'
import {
  calculatePresentValue,
  calculateNpv,
  calculateInflation,
  calculateAverageStock,
  calculateStockProfit,
  type ValuationResult,
} from './engines'

export type ValuationTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly BatchField[]
  rowFields?: readonly BatchField[]
  rows?: string
  rowConfig?: { name: string; label: string; startIndex?: number; max: number; limitLabel?: string }
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: string }[]
  engine: (input: unknown) => ValuationResult
  hint: string
  formula: string
  example: string
  assumptions: string
  rounding: string
  sources: readonly ValuationSourceId[]
  faq: readonly { question: string; answer: string }[]
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, unit: 'IDR', type: 'integer' })
const price = (id: string, label: string): BatchField => ({ id, label, unit: 'IDR', type: 'decimal' })
const count = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const discount = { id: 'rate', label: 'Diskonto tahunan (%, 0–100)', type: 'decimal' as const }
const years = count('years', 'Jumlah tahun utuh (0–100)')
const lotSize = count('sharesPerLot', 'Jumlah lembar per lot (isi sesuai transaksi Anda)')
const output = (id: string, label: string, unit = 'IDR-cents') => ({
  id,
  label,
  unit,
  type: unit === 'shares' || unit === 'lots' ? ('integer' as const) : ('decimal' as const),
})
const rateHint =
  'Tingkat tahunan hipotetis 0–100%, maksimal empat desimal persen. Periode memakai tahun utuh; tidak ada tarif lembaga keuangan bawaan.'
const stockScope =
  'Isi harga bruto per lembar hingga dua desimal rupiah dan biaya total transaksi dalam rupiah bulat. Lembar per lot wajib diisi; tidak ada aturan lot atau tarif broker otomatis.'

export const valuationTools = {
  'nilai-kini': {
    title: 'Kalkulator Nilai Kini',
    description:
      'Hitung nilai hari ini dari satu pembayaran nominal pada akhir tahun mendatang dengan diskonto asumsi Anda.',
    keywords: ['nilai kini', 'present value', 'diskonto', 'nilai sekarang pembayaran'],
    inputFields: [money('future', 'Pembayaran nominal masa depan'), discount, years],
    outputFields: [
      output('present', 'Nilai kini pembayaran'),
      output('future', 'Nominal pembayaran masa depan'),
      output('difference', 'Selisih dari nominal pembayaran'),
    ],
    engine: calculatePresentValue,
    hint: rateHint,
    formula:
      'PV = FV ÷ (1+r)^n, dengan r pecahan diskonto tahunan (10% = 0,10), n tahun utuh, dan FV satu pembayaran pada akhir tahun n.',
    example:
      'Pembayaran Rp1.210 pada akhir tahun ke-2, dengan diskonto 10% per tahun, mempunyai nilai kini Rp1.000,00. Selisih dari nominal Rp210,00.',
    assumptions:
      'Ini nilai satu pembayaran dengan diskonto tahunan tetap, bukan nilai kini bersih proyek atau ukuran daya beli. Pembayaran dan diskonto adalah asumsi; ketidakpastian realisasi, biaya, dan pajak tidak ditambahkan otomatis.',
    rounding:
      'Nilai kini dibulatkan ke dua desimal rupiah hanya pada hasil akhir. Selisih dihitung dari nominal dikurangi nilai kini tampilan agar rincian cocok. Nilai positif yang membulat nol ditandai <Rp0,01. Tahun nol dan diskonto nol mempertahankan nominal; diskonto negatif tidak didukung.',
    faq: [
      {
        question: 'Apa perbedaan Nilai Kini dan NPV?',
        answer:
          'Nilai Kini mengubah satu pembayaran masa depan ke nilai hari ini. NPV menjumlahkan arus masuk dan keluar bertanda pada banyak periode.',
      },
      {
        question: 'Apakah diskonto sama dengan inflasi?',
        answer:
          'Tidak selalu. Diskonto adalah asumsi tingkat untuk menilai waktu dan risiko pembayaran. Untuk perubahan daya beli berdasarkan inflasi hipotetis, gunakan Kalkulator Inflasi.',
      },
    ],
    sources: ['time'],
    testCase: 'present value discounts one annual payment with exact ratios',
  },
  npv: {
    title: 'Kalkulator NPV',
    description:
      'Jumlahkan nilai kini arus kas tahunan bertanda, mulai hari ini pada tahun 0, tanpa pembulatan total terlalu awal.',
    keywords: ['npv', 'nilai kini bersih', 'net present value', 'arus kas bertanda'],
    inputFields: [discount],
    rows: 'cashflows',
    rowFields: [{ ...money('amount', 'Arus kas neto (minus untuk pengeluaran)'), signed: true }],
    rowConfig: { name: 'tahun', label: 'Tahun', startIndex: 0, max: 101, limitLabel: 'baris (tahun 0–100)' },
    outputFields: [
      output('npv', 'NPV (nilai kini bersih)'),
      output('initial', 'Arus kas tahun 0, hari ini'),
      output('nominal', 'Jumlah arus kas nominal tanpa diskonto'),
    ],
    engine: calculateNpv,
    hint: `${rateHint} Tahun 0 adalah hari ini; baris berikutnya pada akhir tahun 1, 2, dan seterusnya. Menghapus baris menggeser tahun baris setelahnya.`,
    formula:
      'NPV = jumlah CF_t ÷ (1+i)^t untuk t=0 sampai N. i adalah pecahan diskonto tahunan. CF0 tidak didiskontokan. Arus masuk positif, arus keluar negatif; masukkan biaya awal sekali saja pada tahun 0.',
    example:
      'Arus kas tahun 0 −Rp1.000, tahun 1 Rp600, tahun 2 Rp600, dan diskonto 10% memberi NPV Rp41,32. Dengan diskonto nol, jumlah nominalnya Rp200,00.',
    assumptions:
      'Arus kas adalah neto pada waktu yang disebutkan, dalam mata uang dan cakupan yang sama. NPV positif bergantung pada asumsi arus, waktu, diskonto dan risiko, bukan jaminan laba aktual. Ini bukan IRR dan tidak mendukung tanggal arus tidak beraturan.',
    rounding:
      'Seluruh PV dijumlah dari pecahan asli, lalu NPV dibulatkan ke dua desimal rupiah; nilai tengah menjauh dari nol. Rincian baris dibulatkan terpisah untuk dibaca, sehingga jumlah angka tampilan bisa berbeda dari total. Maksimal 101 baris, tahun 0 sampai 100.',
    faq: [
      {
        question: 'Apakah biaya awal harus dikurangi lagi?',
        answer:
          'Tidak. Masukkan pengeluaran awal sebagai nilai negatif pada tahun 0; arus tersebut sudah termasuk dalam NPV.',
      },
      {
        question: 'Bolehkah arus kas di tahun berikutnya negatif?',
        answer:
          'Boleh. Biaya perawatan, investasi lanjutan atau pengeluaran lain masuk sebagai arus neto negatif pada tahun yang sesuai.',
      },
    ],
    sources: ['time', 'npv'],
    testCase: 'NPV sums signed discounted fractions before rounding',
  },
  inflasi: {
    title: 'Kalkulator Inflasi',
    description:
      'Bedakan proyeksi harga keranjang dan daya beli uang nominal tetap dengan asumsi inflasi tahunan Anda.',
    keywords: ['inflasi', 'daya beli', 'harga masa depan', 'uang nominal tetap'],
    inputFields: [
      money('price', 'Harga keranjang atau nominal uang hari ini'),
      { id: 'rate', label: 'Asumsi inflasi tahunan (%, 0–100)', type: 'decimal' },
      years,
    ],
    outputFields: [
      output('future', 'Proyeksi harga keranjang yang sama'),
      output('purchasing', 'Daya beli nominal uang tetap, dalam uang hari ini'),
      output('increase', 'Kenaikan harga keranjang'),
      output('loss', 'Kehilangan daya beli nominal tetap'),
    ],
    engine: calculateInflation,
    hint: `${rateHint} Laju ini tidak diambil dari data resmi. Dua hasil utama memakai nominal awal yang sama, tetapi menjawab pertanyaan berbeda.`,
    formula:
      'Harga keranjang masa depan = P(1+h)^n. Daya beli dari uang yang nominalnya tetap P, dinyatakan dalam uang hari ini = P ÷ (1+h)^n. h adalah pecahan inflasi tahunan; model memakai pertumbuhan majemuk.',
    example:
      'P=Rp100, inflasi 10% per tahun selama 2 tahun: harga keranjang diproyeksikan Rp121,00. Uang yang tetap nominal Rp100 hanya mempunyai daya beli Rp82,64 dalam uang hari ini; kehilangan daya belinya Rp17,36.',
    assumptions:
      'Laju tetap merupakan skenario, bukan angka resmi terbaru atau perkiraan pemerintah. Komposisi keranjang dan pendapatan yang berubah tidak dimodelkan. Deflasi tidak didukung pada kalkulator ini.',
    rounding:
      'Harga masa depan dan daya beli dibulatkan masing-masing ke dua desimal rupiah. Kenaikan dan kehilangan diturunkan dari kedua angka tampilan agar jumlah konsisten. Proyeksi harga eksak dibatasi Rp999.999.999.999.999.999. Nol tahun atau nol inflasi mempertahankan nilai awal.',
    faq: [
      {
        question: 'Mengapa harga naik dan daya beli turun dengan angka berbeda?',
        answer:
          'Kenaikan harga mengalikan faktor inflasi. Daya beli uang nominal tetap membagi faktor yang sama; keduanya bukan satu pengurangan yang identik.',
      },
      {
        question: 'Apakah tingkat inflasi di sini resmi?',
        answer:
          'Tidak. Anda mengisi sendiri asumsi tahunan. Sumber BI digunakan untuk definisi inflasi, bukan untuk mengisi laju otomatis.',
      },
    ],
    sources: ['time', 'inflation'],
    testCase: 'inflation separates future basket price from fixed money purchasing power',
  },
  'rata-rata-beli-saham': {
    title: 'Kalkulator Rata-rata Beli Saham',
    description:
      'Gabungkan banyak transaksi beli menjadi biaya perolehan dan rata-rata per lembar yang sudah memasukkan biaya beli.',
    keywords: ['rata rata beli saham', 'average saham', 'harga perolehan', 'biaya beli saham'],
    inputFields: [lotSize],
    rows: 'purchases',
    rowConfig: { name: 'transaksi', label: 'Transaksi', max: 100 },
    rowFields: [
      price('price', 'Harga beli bruto per lembar'),
      count('lots', 'Jumlah lot dibeli'),
      money('fee', 'Total biaya beli transaksi'),
    ],
    outputFields: [
      output('average', 'Rata-rata biaya per lembar, termasuk fee'),
      output('cost', 'Total biaya perolehan'),
      output('gross', 'Nominal pembelian sebelum fee'),
      output('fees', 'Total biaya beli'),
      output('shares', 'Total lembar saham', 'shares'),
      output('lots', 'Total lot dibeli', 'lots'),
      output('perLot', 'Rata-rata biaya per lot'),
    ],
    engine: calculateAverageStock,
    hint: `${stockScope} Gabungkan saham yang sama. Setiap baris mencatat satu transaksi; biaya adalah total untuk baris tersebut.`,
    formula:
      'Lembar transaksi = lot × lembar per lot. Total perolehan = jumlah (harga bruto × lembar + fee beli). Rata-rata per lembar = total perolehan ÷ total lembar. Rata-rata per lot dihitung dari total biaya dan ukuran lot yang sama.',
    example:
      'Dengan 100 lembar per lot, beli 2 lot pada Rp1.000 dengan fee Rp1.000, lalu 1 lot pada Rp2.000 dengan fee Rp500. Total 300 lembar dan biaya Rp401.500,00; rata-rata Rp1.338,33 per lembar dan Rp133.833,33 per lot.',
    assumptions:
      'Ukuran lot dan fee diisi pengguna; tidak ada aturan BEI bawaan. Dividen, split, rights, transfer dan aksi korporasi tidak dihitung. Ini rata-rata biaya ekonomi, bukan penetapan metode pajak.',
    rounding:
      'Jumlahkan nominal dan fee seluruh transaksi sebelum membagi. Rata-rata per lembar dan per lot dibulatkan sendiri dari total eksak, bukan saling dikalikan setelah pembulatan. Rata-rata tampilan diagnostik; gunakan catatan biaya presisi untuk rekonsiliasi akuntansi. Maksimal 100 transaksi.',
    faq: [
      {
        question: 'Mengapa rata-rata tidak sama dengan rata-rata dua harga?',
        answer:
          'Setiap harga dibobot jumlah lembar yang dibeli, lalu biaya transaksi ditambahkan. Jumlah lot berbeda memberi bobot berbeda.',
      },
      {
        question: 'Bagaimana memakai rata-rata ini pada Untung Rugi Saham?',
        answer:
          'Harga rata-rata sudah memuat fee beli, sehingga fee yang sama tidak boleh ditambahkan lagi. Angka tampilan dibulatkan dan bukan basis akuntansi persis; gunakan catatan biaya saham yang benar-benar dijual.',
      },
    ],
    sources: ['weighted', 'stocks', 'statement'],
    testCase: 'stock average weights purchases and allocates fees only after summation',
  },
  'untung-rugi-saham': {
    title: 'Kalkulator Untung Rugi Saham',
    description:
      'Hitung hasil jual bersih, laba atau rugi, serta ROI untuk saham yang dijual setelah biaya dan pajak nominal manual.',
    keywords: ['untung rugi saham', 'laba saham', 'roi saham', 'hasil jual bersih'],
    inputFields: [
      price('buyPrice', 'Harga beli per lembar sebelum fee'),
      price('sellPrice', 'Harga jual bruto per lembar'),
      count('lots', 'Jumlah lot yang dijual'),
      lotSize,
      money('buyFee', 'Biaya beli untuk saham yang dijual'),
      money('sellFee', 'Total biaya jual'),
      money('sellTax', 'Pajak jual nominal (opsional; kosong = 0)'),
    ],
    outputFields: [
      output('profit', 'Laba atau rugi bersih'),
      output('roi', 'ROI atas biaya perolehan', '%'),
      output('acquisition', 'Biaya perolehan saham yang dijual'),
      output('netSale', 'Hasil jual bersih'),
      output('grossSale', 'Nilai jual bruto'),
      output('sellingCosts', 'Total biaya dan pajak jual'),
      output('shares', 'Lembar saham yang dijual', 'shares'),
    ],
    engine: calculateStockProfit,
    hint: `${stockScope} Gunakan harga, alokasi biaya beli, dan biaya jual untuk jumlah saham yang sama. Pajak nominal opsional, bukan tarif otomatis.`,
    formula:
      'Biaya perolehan = lembar dijual × harga beli + biaya beli terkait. Hasil jual bersih = lembar × harga jual − biaya jual − pajak nominal manual. Laba = hasil jual bersih − perolehan; ROI = laba ÷ perolehan × 100%.',
    example:
      'Jual 2 lot × 100 lembar, beli Rp10 dengan fee Rp10, jual Rp12 dengan fee Rp5 dan pajak nominal Rp3. Perolehan Rp2.010,00, jual bersih Rp2.392,00, laba Rp382,00, ROI 19,00%.',
    assumptions:
      'Tidak ada harga langsung atau tarif broker/pajak bawaan. Harga yang belum terealisasi menghasilkan skenario, bukan laba tunai aktual. Alokasikan biaya beli hanya ke saham yang dijual. Jika harga beli sudah termasuk fee, fee tambahan harus nol; rata-rata tampilan yang dibulatkan tidak dianggap basis presisi.',
    rounding:
      'Ledger harga, biaya, hasil jual dan laba dihitung dalam dua desimal rupiah sesuai input. ROI dibulatkan ke dua desimal persen dengan nilai tengah menjauh dari nol. Biaya perolehan harus positif. Biaya/pajak yang membuat hasil jual bersih negatif ditolak; laba negatif dan rugi total tetap didukung.',
    faq: [
      {
        question: 'Bolehkah hasilnya rugi?',
        answer:
          'Boleh. Hasil jual bersih di bawah biaya perolehan menghasilkan laba negatif. Hasil jual nol memberi ROI −100% bila biaya perolehan positif.',
      },
      {
        question: 'Apakah pajak jual dihitung otomatis?',
        answer:
          'Tidak. Masukkan nominal total sesuai data dan ketentuan Anda. Kolom kosong hanya berarti potongan tidak dimasukkan dalam simulasi.',
      },
    ],
    sources: ['stocks', 'statement'],
    testCase: 'stock profit reconciles same-share acquisition net sale and signed ROI',
  },
} satisfies Record<string, ValuationTool>
export type ValuationSlug = keyof typeof valuationTools
