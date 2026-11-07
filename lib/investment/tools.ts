import type { BatchField } from '../batch-four/tools'
import type { InvestmentSourceId } from './sources'
import {
  calculateSavingsGoal,
  calculateEmergencyFund,
  calculateDeposit,
  calculateInvestmentRoi,
  calculateCagr,
  type InvestmentResult,
} from './engines'

export type InvestmentUnit = 'IDR' | 'IDR-cents' | '%' | 'rate' | 'months'
export type InvestmentTool = {
  title: string
  description: string
  keywords: readonly string[]
  inputFields: readonly BatchField[]
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: InvestmentUnit }[]
  engine: (input: unknown) => InvestmentResult
  hint: string
  formula: string
  example: string
  assumptions: string
  rounding: string
  faq: readonly { question: string; answer: string }[]
  sources: readonly InvestmentSourceId[]
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const rate = (id: string, label: string): BatchField => ({ id, label, type: 'decimal' })
const months = (max: number): BatchField => ({
  id: 'months',
  label: `Durasi (bulan utuh, 1–${max.toLocaleString('id-ID')})`,
  type: 'integer',
})
const output = (id: string, label: string, unit: InvestmentUnit = 'IDR') => ({
  id,
  label,
  unit,
  type: unit === 'IDR' ? ('integer' as const) : ('decimal' as const),
})
const moneyHint =
  'Masukkan rupiah utuh tanpa pemisah ribuan. Persentase menerima koma atau titik, maksimal empat desimal.'

export const investmentTools = {
  'target-tabungan': {
    title: 'Kalkulator Target Tabungan',
    description:
      'Hitung setoran minimum setiap akhir bulan untuk mencapai target dengan saldo awal dan imbal hasil hipotetis.',
    keywords: ['target tabungan', 'setoran bulanan minimum', 'ordinary annuity', 'tujuan menabung'],
    inputFields: [
      money('initial', 'Saldo tabungan sekarang'),
      money('target', 'Target saldo akhir'),
      rate('rate', 'Imbal hasil nominal tahunan (%, 0–100)'),
      months(600),
    ],
    outputFields: [
      output('payment', 'Setoran minimum setiap akhir bulan', 'IDR-cents'),
      output('deposits', 'Total setoran baru', 'IDR-cents'),
      output('startingGrowth', 'Pertumbuhan dari saldo awal', 'IDR-cents'),
      output('allGrowth', 'Pertumbuhan seluruh dana', 'IDR-cents'),
      output('future', 'Proyeksi saldo akhir', 'IDR-cents'),
      output('surplus', 'Surplus terhadap target', 'IDR-cents'),
    ],
    engine: calculateSavingsGoal,
    hint: `${moneyHint} Setoran dilakukan pada akhir bulan. Imbal hasil bulanan = nominal tahunan ÷ 12, bukan yield tahunan efektif.`,
    formula:
      'Dengan i = r/12 per bulan dan n bulan, FV = P(1+i)^n + A×((1+i)^n−1)/i. A minimum adalah pembulatan ke atas solusi persamaan ini ke rupiah utuh. Jika i=0, FV=P+nA. Jika saldo awal yang tumbuh sudah mencapai target, A=0.',
    example:
      'Saldo Rp1.000, target Rp5.000, nominal 12% per tahun, durasi 2 bulan: setoran minimum Rp1.981. Proyeksi saldo Rp5.001,91 dan surplus Rp1,91. Setoran Rp1.980 hanya mencapai Rp4.999,90.',
    assumptions:
      'Imbal hasil tetap adalah asumsi hipotetis, bukan jaminan. Tidak ada pajak, biaya, penarikan, atau setoran tambahan di luar setoran bulanan tetap. Pertumbuhan seluruh dana mencakup saldo awal dan setoran baru; pertumbuhan saldo awal adalah bagiannya.',
    rounding:
      'Minimum setoran dihitung dari faktor rasional eksak, lalu dibulatkan ke atas ke rupiah utuh. Bunga tidak dibulatkan bulanan. Proyeksi dan pertumbuhan ditampilkan hingga dua desimal rupiah; surplus dan pertumbuhan seluruh dana direkonsiliasi dari saldo akhir. Batas saldo eksak Rp999.999.999.999.999.999.',
    faq: [
      {
        question: 'Mengapa setoran dibulatkan ke atas?',
        answer:
          'Setoran harus berupa rupiah utuh minimum. Setoran satu rupiah lebih kecil dari hasil tidak memenuhi target dalam model eksak, meski angka proyeksi tampilan mungkin sudah dibulatkan.',
      },
      {
        question: 'Apa arti setoran minimum Rp0?',
        answer:
          'Saldo awal yang diproyeksikan sudah memenuhi target pada akhir durasi tanpa setoran baru. Pertumbuhan hipotetis tersebut belum tentu terjadi di dunia nyata.',
      },
    ],
    sources: ['savings'],
    testCase: 'savings goal returns the exact minimum end-of-month payment',
  },
  'dana-darurat': {
    title: 'Kalkulator Dana Darurat',
    description:
      'Hitung target cadangan likuid, kekurangan, surplus, dan cakupan bulan dari pengeluaran wajib pilihan Anda.',
    keywords: ['dana darurat', 'cadangan likuid', 'kekurangan dana', 'bulan cadangan'],
    inputFields: [
      money('expenses', 'Pengeluaran wajib per bulan'),
      months(1200),
      money('available', 'Dana likuid yang tersedia'),
    ],
    outputFields: [
      output('target', 'Target dana darurat'),
      output('gap', 'Kekurangan dana'),
      output('surplus', 'Surplus terhadap target'),
      output('coverage', 'Cakupan dana saat ini', 'months'),
    ],
    engine: calculateEmergencyFund,
    hint: 'Isi pengeluaran wajib bulanan, jumlah bulan cadangan pilihan Anda, dan dana yang bisa diakses. Tidak ada jumlah bulan rekomendasi otomatis.',
    formula:
      'Target = pengeluaran wajib bulanan × bulan cadangan. Kekurangan = maksimum(0, target − dana tersedia); surplus = maksimum(0, dana tersedia − target). Cakupan = dana tersedia ÷ pengeluaran bulanan.',
    example:
      'Pengeluaran wajib Rp2.000.000, cadangan 6 bulan, dan dana tersedia Rp3.000.000 menghasilkan target Rp12.000.000, kekurangan Rp9.000.000, surplus Rp0, serta cakupan 1,50 bulan.',
    assumptions:
      'Jumlah bulan ditentukan pengguna sesuai kebutuhannya. Dana harus likuid dan belum terikat untuk keperluan lain. Model tidak memperhitungkan inflasi, perubahan pengeluaran, atau imbal hasil.',
    rounding:
      'Target, kekurangan dan surplus tetap rupiah eksak. Cakupan bulan dibulatkan half-up ke dua desimal. Jika pengeluaran nol, cakupan tidak terdefinisi; tidak dianggap tak terbatas.',
    faq: [
      {
        question: 'Apakah dana lebih dari target membuat kekurangan negatif?',
        answer: 'Tidak. Kekurangan menjadi Rp0 dan kelebihannya ditampilkan sebagai surplus terhadap target.',
      },
      {
        question: 'Mengapa cakupan bulan tidak terdefinisi saat pengeluaran nol?',
        answer:
          'Cakupan membagi dana dengan pengeluaran bulanan. Pembagi nol tidak menghasilkan jumlah bulan yang bermakna, meski target cadangan dapat dihitung nol.',
      },
    ],
    sources: ['emergency'],
    testCase: 'emergency reserve separates shortfall and surplus',
  },
  deposito: {
    title: 'Kalkulator Deposito',
    description:
      'Simulasikan deposito bunga sederhana dengan potongan manual dan ledger rupiah yang konsisten sampai jatuh tempo.',
    keywords: ['deposito', 'bunga deposito bersih', 'saldo jatuh tempo', 'potongan pajak manual'],
    inputFields: [
      money('principal', 'Pokok deposito'),
      rate('rate', 'Bunga nominal tahunan (%, 0–100)'),
      months(1200),
      rate('tax', 'Potongan pajak atas bunga (%, opsional; kosong = 0)'),
      money('fees', 'Biaya tetap (opsional; kosong = 0)'),
    ],
    outputFields: [
      output('maturity', 'Saldo saat jatuh tempo'),
      output('gross', 'Bunga bruto setelah pembulatan'),
      output('withholding', 'Potongan pajak manual'),
      output('fees', 'Biaya tetap'),
      output('net', 'Hasil bersih setelah potongan dan biaya'),
    ],
    engine: calculateDeposit,
    hint: `${moneyHint} Model bulan/12, tanpa kapitalisasi. Potongan dan biaya opsional: kosong berarti nol dalam simulasi, bukan penetapan bebas pajak.`,
    formula:
      'Bruto eksak = pokok × nominal tahunan × bulan/12. Bruto dibulatkan ke rupiah, lalu potongan = bruto bulat × persen potongan manual, dibulatkan lagi. Hasil bersih = bruto − potongan − biaya; jatuh tempo = pokok + hasil bersih.',
    example:
      'Pokok Rp1.200.000, bunga 6% per tahun, tenor 6 bulan, potongan input 20%, dan biaya Rp0: bruto Rp36.000, potongan Rp7.200, hasil bersih Rp28.800, jatuh tempo Rp1.228.800. Angka potongan adalah contoh, bukan tarif hukum bawaan.',
    assumptions:
      'Periksa bunga, basis hari, pajak/pengecualian dan biaya pada produk serta ketentuan yang berlaku. Bunga dibayar berkala, reinvestasi, dan penalti di luar input tidak dihitung. Hasil bukan janji pembayaran bank.',
    rounding:
      'Bruto half-up ke rupiah terlebih dahulu. Potongan dihitung dari bruto bulat dan half-up ke rupiah. Net dan jatuh tempo memakai ledger tersebut, bukan pecahan bruto lain. Hasil bersih boleh negatif; biaya yang membuat saldo jatuh tempo negatif ditolak.',
    faq: [
      {
        question: 'Apakah pajak deposito sudah otomatis sesuai hukum?',
        answer:
          'Tidak. Persentase potongan harus Anda isi sesuai situasi produk dan ketentuan aktual. Kolom kosong hanya mengecualikan potongan dari model.',
      },
      {
        question: 'Mengapa hasil bisa berbeda dari laporan bank?',
        answer:
          'Simulasi memakai bulan/12 dan urutan pembulatan yang dinyatakan di atas. Produk dapat menggunakan hitungan hari, pembulatan atau waktu pembayaran bunga berbeda.',
      },
    ],
    sources: ['simple', 'ojk', 'deposit'],
    testCase: 'deposit reconciles rounded gross interest withholding and maturity',
  },
  'imbal-hasil-investasi': {
    title: 'Kalkulator Imbal Hasil Investasi',
    description:
      'Hitung ROI bersih selama periode kepemilikan, termasuk kerugian dan biaya beli/jual yang dicatat terpisah.',
    keywords: ['imbal hasil investasi', 'roi investasi', 'holding period return', 'return negatif'],
    inputFields: [
      money('initial', 'Modal awal sebelum biaya beli'),
      money('ending', 'Nilai akhir sebelum biaya jual'),
      money('costs', 'Total biaya beli, jual, dan lain (di luar pajak)'),
    ],
    outputFields: [
      output('roi', 'ROI bersih selama periode', '%'),
      output('gain', 'Keuntungan atau kerugian bersih'),
    ],
    engine: calculateInvestmentRoi,
    hint: 'Gunakan harga perolehan sebelum biaya beli dan nilai akhir/hasil jual bruto sebelum biaya jual. Catat biaya hanya sekali. Dividen, pajak dan arus kas antara tidak dimasukkan.',
    formula:
      'Gain bersih = nilai akhir − modal awal − biaya terpisah. ROI = gain bersih ÷ modal awal × 100%. Pembagi adalah modal awal sebelum biaya, bukan modal ditambah biaya.',
    example:
      'Modal Rp100, nilai akhir Rp90, dan biaya Rp5 menghasilkan kerugian Rp15 serta ROI −15,00%. Nilai akhir Rp120 dengan modal dan biaya yang sama menghasilkan ROI 15,00%.',
    assumptions:
      'ROI ini mencakup satu periode kepemilikan tanpa tambahan modal, penarikan, dividen atau pajak. Nilai akhir yang belum direalisasi adalah valuasi/skenario, bukan keuntungan tunai yang sudah diterima. Ini bukan return tahunan, CAGR atau IRR.',
    rounding:
      'Gain rupiah tetap eksak dan dapat negatif. ROI dibulatkan ke dua desimal persen; nilai tengah menjauh dari nol. Rasio negatif kecil yang membulat nol tetap diberi tanda arah. Biaya tambahan dapat membuat ROI kurang dari −100%.',
    faq: [
      {
        question: 'Mengapa ROI bisa negatif?',
        answer:
          'Nilai akhir lebih kecil dari modal dan biaya yang dikeluarkan. Kerugian tetap dihitung, tidak dijepit menjadi nol.',
      },
      {
        question: 'Apakah ROI ini bisa langsung dibandingkan antarjangka waktu?',
        answer:
          'ROI ini tidak disetahunkan. Durasi berbeda memerlukan analisis tambahan; untuk dua nilai tanpa arus antara dan tahun utuh, gunakan CAGR.',
      },
    ],
    sources: ['returns'],
    testCase: 'holding period ROI supports signed net gains and fee accounting',
  },
  cagr: {
    title: 'Kalkulator CAGR',
    description:
      'Hitung pertumbuhan tahunan geometris dari nilai awal dan akhir, termasuk penurunan nilai serta kehilangan total.',
    keywords: ['cagr', 'compound annual growth rate', 'pertumbuhan tahunan geometris', 'cagr negatif'],
    inputFields: [
      money('initial', 'Nilai awal investasi'),
      money('ending', 'Nilai akhir investasi'),
      { id: 'years', label: 'Jumlah tahun selesai (1–100, bilangan bulat)', type: 'integer' },
    ],
    outputFields: [output('cagr', 'CAGR per tahun', 'rate')],
    engine: calculateCagr,
    hint: 'Gunakan dua nilai yang sebanding tanpa tambahan modal, penarikan, atau distribusi di antaranya. Tahun harus bilangan bulat selesai; nilai awal harus positif.',
    formula:
      'CAGR = ((nilai akhir ÷ nilai awal)^(1/tahun) − 1) × 100%. Persamaan setaranya: nilai akhir = nilai awal × (1 + CAGR sebagai pecahan)^tahun.',
    example:
      'Nilai awal Rp100 dan nilai akhir Rp121 setelah 2 tahun menghasilkan CAGR 10,0000%. Nilai akhir Rp81 menghasilkan −10,0000%; nilai akhir nol menghasilkan tepat −100,0000%.',
    assumptions:
      'CAGR meratakan pertumbuhan, bukan kinerja aktual tiap tahun atau jaminan hasil masa depan. Arus kas antara memerlukan metode bertanggal seperti XIRR, yang belum tersedia sebagai alat terbit. Pertumbuhan sangat besar dari nilai awal kecil perlu ditinjau dari data sumber.',
    rounding:
      'Hasil dibulatkan ke empat desimal persen; nilai tepat di tengah dibulatkan menjauh dari nol. Nilai negatif atau positif dekat nol tetap diberi tanda arah. Nilai akhir positif yang membulat mendekati kehilangan total ditampilkan >−100,0000%. Durasi maksimal 100 tahun.',
    faq: [
      {
        question: 'Apakah CAGR negatif diperbolehkan?',
        answer:
          'Ya. Nilai akhir di bawah nilai awal menghasilkan CAGR negatif. Nilai akhir nol berarti kehilangan total −100%; nilai akhir positif selalu lebih besar dari −100% pada angka eksak.',
      },
      {
        question: 'Mengapa CAGR tidak menerima setoran tambahan?',
        answer:
          'Dua nilai ujung saja tidak menjelaskan besar dan waktu arus kas antara. Metode seperti XIRR diperlukan untuk memperhitungkan arus tersebut, bukan rumus CAGR ini.',
      },
    ],
    sources: ['geometric', 'returns'],
    testCase: 'CAGR rounds exact positive and negative root thresholds correctly',
  },
} satisfies Record<string, InvestmentTool>
export type InvestmentSlug = keyof typeof investmentTools
