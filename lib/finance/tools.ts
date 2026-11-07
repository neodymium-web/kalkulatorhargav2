import type { BatchField } from '../batch-four/tools'
import type { FinanceSourceId } from './sources'
import {
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateAnnuity,
  calculateFlatLoan,
  calculateDebtRatio,
  type FinanceResult,
} from './engines'

export type FinanceTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly BatchField[]
  outputFields: readonly {
    id: string
    label: string
    type: 'integer' | 'decimal'
    unit: 'IDR' | '%' | 'rate' | 'bulan'
  }[]
  engine: (input: unknown) => FinanceResult
  hint: string
  formula: string
  example: string
  assumptions: string
  rounding: string
  faq: readonly { question: string; answer: string }[]
  sources: readonly FinanceSourceId[]
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const principal = money('principal', 'Pokok awal')
const annualRate = { id: 'rate', label: 'Bunga nominal tahunan (%)', type: 'decimal' as const }
const tenure = { id: 'months', label: 'Tenor (bulan utuh, 1–600)', type: 'integer' as const }
const output = (id: string, label: string, unit: 'IDR' | '%' | 'rate' | 'bulan' = 'IDR') => ({
  id,
  label,
  type: unit === '%' || unit === 'rate' ? ('decimal' as const) : ('integer' as const),
  unit,
})
const rateHint =
  'Isi rupiah utuh tanpa pemisah ribuan. Bunga tahunan 0–100%, maksimal empat desimal persen, memakai koma atau titik.'
const exclusions =
  'Simulasi edukasi dengan tingkat tetap dari pengguna. Pajak, administrasi, provisi, asuransi, denda, dan perubahan bunga belum dihitung. Bukan penawaran produk atau jaminan persetujuan kredit. Cocokkan dengan kontrak pemberi pinjaman.'
const loanTotals = [
  output('last', 'Pembayaran penutup'),
  output('lastMonth', 'Bulan pembayaran terakhir', 'bulan'),
  output('interest', 'Total bunga jadwal'),
  output('total', 'Total pembayaran jadwal'),
]

export const financeTools = {
  'bunga-sederhana': {
    title: 'Kalkulator Bunga Sederhana',
    description:
      'Hitung bunga tanpa kapitalisasi dari pokok, bunga nominal tahunan, dan durasi bulan yang jelas.',
    keywords: ['bunga sederhana', 'simple interest', 'bunga tanpa kapitalisasi'],
    inputFields: [
      principal,
      annualRate,
      { id: 'months', label: 'Durasi (bulan utuh, 0–1.200)', type: 'integer' },
    ],
    outputFields: [output('interest', 'Total bunga sederhana'), output('future', 'Saldo akhir')],
    engine: calculateSimpleInterest,
    hint: `${rateHint} Durasi memakai bulan; 12 bulan sama dengan satu tahun.`,
    formula:
      'Bunga = pokok × (bunga nominal tahunan ÷ 100) × bulan ÷ 12. Saldo akhir = pokok + bunga. Bunga tidak dikapitalisasi.',
    example:
      'Pokok Rp1.000.000, bunga 6% per tahun, dan durasi 18 bulan menghasilkan bunga Rp90.000 dan saldo akhir Rp1.090.000.',
    assumptions:
      'Pokok tetap sepanjang durasi, tanpa cicilan atau tambahan setoran. Tarif nominal ini tidak mewakili imbal hasil bersih setelah pajak dan biaya.',
    rounding:
      'Bunga eksak dibulatkan half-up ke rupiah di akhir. Saldo akhir memakai pokok ditambah bunga bulat. Bunga positif yang membulat ke Rp0 diberi catatan.',
    faq: [
      {
        question: 'Apakah bunga bulan sebelumnya ikut berbunga?',
        answer:
          'Tidak. Setiap bulan tetap memakai pokok awal yang sama. Gunakan bunga majemuk jika bunga ikut dikapitalisasi.',
      },
      {
        question: 'Apakah durasi nol boleh?',
        answer: 'Boleh. Durasi nol, bunga nol, atau pokok nol menghasilkan bunga Rp0.',
      },
    ],
    sources: ['simple'],
    testCase: 'simple interest uses annual rate and integer months',
  },
  'bunga-majemuk': {
    title: 'Kalkulator Bunga Majemuk',
    description:
      'Hitung pertumbuhan pokok, bunga periodik, dan yield tahunan efektif dengan periode kapitalisasi utuh.',
    keywords: ['bunga majemuk', 'compound interest', 'kapitalisasi', 'yield tahunan efektif'],
    inputFields: [
      principal,
      annualRate,
      {
        id: 'frequency',
        label: 'Frekuensi kapitalisasi',
        type: 'choice',
        options: [
          { value: '1', label: 'Tahunan (1 kali/tahun)' },
          { value: '2', label: 'Semesteran (2 kali/tahun)' },
          { value: '4', label: 'Triwulanan (4 kali/tahun)' },
          { value: '12', label: 'Bulanan (12 kali/tahun)' },
        ],
      },
      { id: 'periods', label: 'Jumlah periode kapitalisasi (0–1.200)', type: 'integer' },
    ],
    outputFields: [
      output('future', 'Saldo akhir'),
      output('interest', 'Total pertumbuhan bunga'),
      output('periodic', 'Bunga per periode kapitalisasi', 'rate'),
      output('effective', 'Yield tahunan efektif sebelum biaya', 'rate'),
      output('duration', 'Durasi setara dalam bulan', 'bulan'),
    ],
    engine: calculateCompoundInterest,
    hint: `${rateHint} Jumlah periode mengikuti frekuensi: 12 periode bulanan atau 4 periode triwulanan sama-sama satu tahun.`,
    formula:
      'Dengan m kapitalisasi/tahun dan k periode utuh: saldo akhir = pokok × (1 + r/m)^k, dengan r sebagai pecahan bunga nominal tahunan. Bunga periodik = r/m; yield tahunan efektif = (1 + r/m)^m − 1.',
    example:
      'Pokok Rp1.000.000, nominal 12% per tahun, kapitalisasi bulanan, dan 2 periode berarti 2 bulan. Saldo akhir Rp1.020.100, pertumbuhan Rp20.100, bunga periodik 1%, dan yield tahunan efektif 12,6825%.',
    assumptions:
      'Tanpa setoran tambahan, penarikan, pajak, atau biaya. Nominal tahunan, bunga periodik, dan yield tahunan efektif berbeda. Yield ini bukan APR kredit yang memasukkan biaya.',
    rounding:
      'Pangkat bulat atas faktor rasional dihitung eksak, lalu pertumbuhan dibulatkan half-up ke rupiah sekali di akhir. Saldo = pokok + pertumbuhan bulat. Tingkat hasil empat desimal persen. Maksimal 1.200 periode dan saldo eksak Rp999.999.999.999.999.999.',
    faq: [
      {
        question: 'Apakah jumlah periode selalu berarti bulan?',
        answer:
          'Hanya pada kapitalisasi bulanan. Satu periode triwulanan berarti tiga bulan; satu periode semesteran berarti enam bulan. Hasil menampilkan durasi setara.',
      },
      {
        question: 'Apakah bunga dibulatkan setiap periode?',
        answer:
          'Tidak dalam model pertumbuhan ini. Pecahan tetap disimpan hingga hasil akhir; praktik rekening dapat memakai pembulatan dan biaya berbeda.',
      },
    ],
    sources: ['compound', 'apr'],
    testCase: 'compound interest uses exact integer powers and aligned periods',
  },
  'cicilan-anuitas': {
    title: 'Kalkulator Cicilan Anuitas',
    description:
      'Simulasikan angsuran anuitas, pembayaran penutup, total bunga, dan jadwal saldo pokok dalam rupiah.',
    keywords: ['cicilan anuitas', 'angsuran tetap', 'amortisasi', 'bunga saldo menurun'],
    inputFields: [principal, annualRate, tenure],
    outputFields: [output('standard', 'Angsuran bulanan acuan'), ...loanTotals],
    engine: calculateAnnuity,
    hint: `${rateHint} Pembayaran di akhir bulan. Bunga per bulan = bunga nominal tahunan ÷ 12.`,
    formula:
      'Untuk i = r/12 per bulan dan n bulan, A = P × i × (1+i)^n ÷ ((1+i)^n − 1). Pada bunga nol, A = P/n. Bunga tiap bulan dihitung dari sisa pokok.',
    example:
      'Pokok Rp1.000, nominal 12% per tahun, tenor 3 bulan: acuan dibulatkan ke Rp341. Jadwal membayar Rp341, Rp341, lalu Rp338; bunga Rp10, Rp7, Rp3. Total bunga Rp20 dan pembayaran Rp1.020.',
    assumptions: `${exclusions} Bunga flat dengan angka persen sama tidak setara dengan bunga anuitas atas saldo menurun.`,
    rounding:
      'Angsuran acuan dibulatkan ke atas ke rupiah; bunga bulanan half-up dari saldo berjalan. Pembayaran dibatasi sisa pokok dan bunga; bulan penutup disesuaikan agar saldo nol. Total dijumlah dari jadwal, bukan acuan × tenor. Jika lunas lebih awal akibat pembulatan, baris sisa bernilai nol. Pokok nol berarti tidak ada kewajiban.',
    faq: [
      {
        question: 'Mengapa pembayaran penutup berbeda dari acuan?',
        answer:
          'Angsuran acuan dan bunga bulanan dibulatkan ke rupiah. Pembayaran penutup mengambil sisa kewajiban yang tepat agar pokok lunas tanpa saldo negatif.',
      },
      {
        question: 'Apakah suku bunga ini sudah termasuk semua biaya?',
        answer:
          'Belum. Input nominal tahunan hanya bunga; biaya produk dan pajak di luar model. Angka ini tidak boleh dianggap APR menyeluruh.',
      },
    ],
    sources: ['loans', 'ojk', 'apr'],
    testCase: 'annuity reconciles the independently worked three-month schedule',
  },
  'cicilan-flat': {
    title: 'Kalkulator Cicilan Flat',
    description:
      'Hitung bunga atas pokok awal, cicilan rupiah, total pembayaran, dan jadwal flat yang saling konsisten.',
    keywords: ['cicilan flat', 'bunga flat', 'angsuran pokok awal'],
    inputFields: [principal, { ...annualRate, label: 'Bunga flat nominal tahunan (%)' }, tenure],
    outputFields: [output('first', 'Cicilan pertama'), ...loanTotals],
    engine: calculateFlatLoan,
    hint: `${rateHint} Bunga flat dihitung dari pokok awal, bukan sisa pokok.`,
    formula:
      'Pokok ideal per bulan = P/n. Bunga flat ideal per bulan = P × r/12. Total bunga nominal = P × r × n/12, dengan r pecahan bunga flat tahunan.',
    example:
      'Pokok Rp1.000, flat 12% per tahun, tenor 3 bulan: pembayaran Rp343, Rp343, Rp344. Total bunga Rp30 dan pembayaran Rp1.030. Sisa pokok setelah pembayaran terakhir Rp0.',
    assumptions: `${exclusions} Persentase flat tidak setara dengan persentase efektif saldo menurun. Konversi setara memerlukan analisis arus kas tersendiri.`,
    rounding:
      'Pokok kumulatif bulan j dibulatkan turun dari P×j/n; bunga kumulatif half-up dari P×r×j/12. Komponen bulanan adalah selisih dua nilai kumulatif. Cicilan bisa berbeda beberapa rupiah antarbulan; total bunga tepat pembulatan rumus nominal dan pokok akhir nol. Total bukan cicilan pertama × tenor.',
    faq: [
      {
        question: 'Mengapa cicilan flat bisa berbeda beberapa rupiah?',
        answer:
          'Pokok dan bunga ideal dapat berupa pecahan rupiah. Alokasi kumulatif membagikan sisa pembulatan agar semua baris tetap menjumlah ke total yang benar.',
      },
      {
        question: 'Apakah flat 12% sama dengan anuitas 12%?',
        answer:
          'Tidak. Flat memakai pokok awal sebagai dasar bunga setiap bulan, sedangkan anuitas memakai saldo tersisa. Kalkulator ini tidak menghitung tarif ekuivalen atau IRR.',
      },
    ],
    sources: ['ojk', 'apr'],
    testCase: 'flat loan allocates cumulative fractions without inflating interest',
  },
  'rasio-cicilan': {
    title: 'Kalkulator Rasio Cicilan',
    description:
      'Hitung porsi cicilan terhadap pendapatan bersih dan sisa pendapatan sebelum biaya hidup tanpa ambang kelayakan kredit.',
    keywords: ['rasio cicilan', 'pendapatan bersih', 'porsi pembayaran utang'],
    inputFields: [
      money('income', 'Pendapatan bersih bulanan sebelum potongan cicilan'),
      money('debt', 'Total cicilan wajib bulanan'),
    ],
    outputFields: [
      output('ratio', 'Rasio cicilan terhadap pendapatan bersih', '%'),
      output('remaining', 'Sisa pendapatan sebelum biaya hidup'),
    ],
    engine: calculateDebtRatio,
    hint: 'Gunakan bulan yang sama. Pendapatan setelah pajak/iuran, sebelum potongan cicilan. Jumlahkan seluruh kewajiban cicilan; masukkan juga cicilan yang dipotong payroll.',
    formula:
      'Rasio cicilan = total cicilan wajib bulanan ÷ pendapatan bersih bulanan × 100%. Sisa sebelum biaya hidup = pendapatan bersih − cicilan.',
    example:
      'Cicilan Rp1.500.000 dari pendapatan bersih Rp5.000.000 menghasilkan rasio 30,00% dan sisa Rp3.500.000 sebelum biaya hidup. Cicilan Rp4 dari pendapatan Rp3 menghasilkan rasio 133,33% dan kekurangan Rp1.',
    assumptions:
      'Ini rasio anggaran pribadi berbasis pendapatan bersih. DTI lender yang lazim memakai pendapatan kotor mempunyai basis berbeda. Tidak ada ambang aman atau jaminan persetujuan pinjaman.',
    rounding:
      'Rasio eksak dibulatkan half-up ke dua desimal persen. Sisa pendapatan rupiah tetap eksak. Status melebihi pendapatan ditentukan dari input, meski rasio tampilan membulat ke 100,00%.',
    faq: [
      {
        question: 'Apakah sisa pendapatan sudah tersedia untuk pinjaman baru?',
        answer:
          'Belum tentu. Sisa ini belum dikurangi biaya hidup, tabungan, dan pengeluaran lainnya. Hasil bukan rekomendasi atau penilaian kelayakan kredit.',
      },
      {
        question: 'Bagaimana jika cicilan dipotong langsung dari gaji?',
        answer:
          'Gunakan pendapatan bersih setelah pajak/iuran tetapi sebelum potongan cicilan. Tambahkan kembali cicilan payroll ke pendapatan tersebut dan hitung juga pada total cicilan agar basis konsisten.',
      },
    ],
    sources: ['ratio', 'disposable'],
    testCase: 'debt ratio uses net income and exact shortfall status',
  },
} satisfies Record<string, FinanceTool>
export type FinanceSlug = keyof typeof financeTools
