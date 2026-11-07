import type { BatchField } from '../batch-four/tools'
import type { SocialSourceId } from './sources'
import { calculateEngagement, calculateFollowerGrowth, calculateCpm, calculateCpc, calculateCpa, type SocialResult } from './engines'
export type SocialTool = {
  title: string; description: string; keywords: readonly string[]
  inputFields: readonly BatchField[]
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: string }[]
  engine: (input: unknown) => SocialResult
  hint: string; formula: string; example: string; rounding: string; assumptions: string
  faq: readonly { question: string; answer: string }[]
  sources: readonly SocialSourceId[]; testCase: string
}
const count = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const spend: BatchField = { id: 'spend', label: 'Belanja iklan dalam cakupan data', type: 'integer', unit: 'IDR' }
const output = (id: string, label: string, unit = 'count') => ({ id, label, unit, type: unit === 'count' || unit === 'change' ? 'integer' as const : 'decimal' as const })
const countHint = 'Isi bilangan bulat nonnegatif hingga 13 digit tanpa pemisah ribuan. Data manual; samakan akun, konten dan cakupan analitik.'
const adHint = 'Isi belanja kampanye dalam rupiah utuh dan jumlah hasil integer hingga 13 digit. Gunakan platform, periode dan cakupan biaya yang sama. Nol biaya valid; jumlah hasil harus positif.'
const percentRounding = 'Hitung rasio dari jumlah eksak, lalu bulatkan sekali ke dua desimal persen. Nilai tepat setengah increment dibulatkan menjauh dari nol. Nilai positif/negatif di bawah presisi tetap disebutkan arahnya.'
const costRounding = 'Biaya rata-rata dihitung dari pecahan eksak, lalu dibulatkan sekali ke dua desimal rupiah dengan setengah dibulatkan ke atas. Rp0,01 adalah presisi diagnostik, bukan aturan tagihan bank. Nilai positif yang membulat nol tampil <Rp0,01; nol biaya tepat tampil Rp0,00.'
const adScope = 'Biaya mencakup belanja kampanye yang Anda masukkan. Biaya produksi, agensi, pajak atau biaya lain tidak ditambahkan otomatis. Tidak ada tarif iklan langsung, benchmark baik/buruk, atau jaminan hasil.'
export const socialTools = {
  'engagement-rate': {
    title: 'Kalkulator Engagement Rate',
    description: 'Hitung persentase aksi suka, komentar, simpan dan bagikan terhadap pengikut atau reach dengan basis yang jelas.',
    keywords: ['engagement rate', 'er', 'engagement pengikut', 'engagement reach', 'interaksi konten'],
    inputFields: [count('likes', 'Jumlah suka'), count('comments', 'Jumlah komentar'), count('saves', 'Jumlah simpan'), count('shares', 'Jumlah bagikan'),
      { id: 'basis', label: 'Basis pembagi Engagement Rate', type: 'choice', options: [{ value: 'followers', label: 'Pengikut (followers)' }, { value: 'reach', label: 'Reach (akun yang dijangkau)' }] },
      count('denominator', 'Jumlah basis terpilih (pengikut atau reach)'),
    ],
    outputFields: [output('rate', 'Engagement Rate', '%'), output('interactions', 'Total aksi interaksi'), output('denominator', 'Jumlah basis pembagi')],
    engine: calculateEngagement,
    hint: `${countHint} Pilih pengikut atau reach, lalu masukkan jumlah sesuai pilihan. Reach bukan impressions atau views; pembagi harus lebih dari nol.`,
    formula: 'Total interaksi I = suka + komentar + simpan + bagikan. Engagement Rate = I ÷ B × 100%, dengan B jumlah pengikut atau reach sesuai pilihan. Interaksi adalah jumlah aksi, bukan jumlah orang unik.',
    example: '100 suka, 20 komentar, 10 simpan dan 5 bagikan memberi 135 aksi. Dibagi 1.000 pengikut menghasilkan 13,50%. Dengan basis reach 100, aksi yang sama menghasilkan 135,00% dan tetap valid. Satu aksi dari basis 32 memberi 3,13% setelah pembulatan.',
    rounding: percentRounding,
    assumptions: 'Gunakan satu konten dan cakupan analitik yang konsisten. Pengikut adalah snapshot jumlah pengikut yang relevan, sedangkan reach menghitung akun yang dijangkau menurut platform. Satu orang dapat melakukan beberapa aksi, sehingga hasil bisa melebihi 100%. Hasil tidak dibatasi 100% dan bukan proporsi orang unik. Definisi platform dan komponen engagement dapat berbeda; tidak ada ambang engagement baik universal.',
    faq: [
      { question: 'Mengapa Engagement Rate bisa lebih dari 100%?', answer: 'Pembilang menghitung aksi. Satu akun dapat menyukai, berkomentar, menyimpan dan membagikan konten yang sama. Pengikut juga dapat lebih sedikit dari semua akun yang berinteraksi.' },
      { question: 'Apakah reach sama dengan impressions?', answer: 'Tidak. Reach mengacu pada akun yang dijangkau, sedangkan impressions menghitung kemunculan yang bisa berulang. Pilihan pembagi harus sesuai data Anda.' },
    ], sources: ['sprout', 'engagement'], testCase: 'engagement sums four actions and preserves both denominator bases beyond 100 percent',
  },
  'pertumbuhan-pengikut': {
    title: 'Kalkulator Pertumbuhan Pengikut', description: 'Bandingkan dua snapshot jumlah pengikut untuk melihat perubahan bersih dan persentase terhadap jumlah awal.',
    keywords: ['pertumbuhan pengikut', 'follower growth', 'perubahan followers', 'pengikut turun'],
    inputFields: [count('start', 'Jumlah pengikut pada snapshot awal'), count('end', 'Jumlah pengikut pada snapshot akhir')],
    outputFields: [output('rate', 'Pertumbuhan terhadap pengikut awal', 'growth'), output('change', 'Perubahan bersih pengikut', 'change'), output('start', 'Pengikut awal'), output('end', 'Pengikut akhir')],
    engine: calculateFollowerGrowth, hint: `${countHint} Bandingkan dua snapshot akun yang sama; kalkulator tidak menghitung laju harian atau memakai tanggal.`,
    formula: 'Perubahan bersih Δ = pengikut akhir − pengikut awal. Jika awal > 0, pertumbuhan = Δ ÷ awal × 100%. Jika awal = 0, persentase tidak terdefinisi; perubahan bersih dan jumlah akhir tetap ditampilkan.',
    example: '1.000 menjadi 1.250 memberi perubahan +250 dan pertumbuhan +25,00%. 1.000 menjadi 800 memberi −200 dan −20,00%. Dari 0 menjadi 200, perubahan +200 tetapi persentase tidak terdefinisi. Dari 32 menjadi 31 memberi −3,13% setelah pembulatan.',
    rounding: percentRounding,
    assumptions: 'Hanya membandingkan dua snapshot, tanpa normalisasi waktu, prediksi, atau klaim pengikut per hari. Perubahan neto dapat mencerminkan follow, unfollow dan penyesuaian pencatatan. Awal nol tidak diubah menjadi 100%, termasuk bila akhir juga nol. Persentase dapat melebihi 100% untuk pertumbuhan dari basis kecil.',
    faq: [
      { question: 'Mengapa persentase dari nol tidak dihitung?', answer: 'Rumus membutuhkan pembagian dengan jumlah awal. Pembagian dengan nol tidak terdefinisi, walaupun perubahan jumlah absolut tetap bisa dihitung.' },
      { question: 'Apakah perubahan bersih sama dengan jumlah follow baru?', answer: 'Tidak selalu. Perubahan bersih juga memperhitungkan pengikut yang hilang dan perubahan pencatatan. Ini bukan hitungan gross follow.' },
    ], sources: ['growth'], testCase: 'follower growth supports signed changes and leaves zero-base percent undefined',
  },
  cpm: {
    title: 'Kalkulator CPM Iklan', description: 'Hitung biaya rata-rata per 1.000 impresi dari belanja kampanye dan jumlah penayangan yang sesuai.',
    keywords: ['cpm', 'cost per mille', 'biaya per seribu impresi', 'biaya penayangan iklan'],
    inputFields: [spend, count('impressions', 'Jumlah impresi iklan')],
    outputFields: [output('cost', 'CPM per 1.000 impresi', 'IDR-cents'), output('spend', 'Belanja iklan yang dimasukkan', 'IDR-whole'), output('events', 'Jumlah impresi')],
    engine: calculateCpm, hint: adHint,
    formula: 'CPM rata-rata = belanja iklan ÷ jumlah impresi × 1.000. Satuannya rupiah per 1.000 impresi; jumlah impresi harus positif.',
    example: 'Belanja Rp150.000 untuk 50.000 impresi menghasilkan CPM Rp3.000,00 per 1.000 impresi. Belanja Rp1 untuk 3.000 impresi memberi Rp0,33. Belanja Rp1 untuk 8.000 impresi memberi Rp0,13 setelah pembulatan.',
    rounding: costRounding,
    assumptions: `${adScope} Impresi dapat memuat penayangan berulang pada orang yang sama. CPM historis dari input ini bukan target bid, vCPM, biaya per klik atau pendapatan kreator.`,
    faq: [
      { question: 'Apakah 1.000 impresi berarti 1.000 orang?', answer: 'Tidak. Satu orang bisa melihat iklan berulang kali. Jumlah orang unik memerlukan metrik reach yang sesuai.' },
      { question: 'Apakah CPM ini harga yang akan ditagihkan?', answer: 'Ini rata-rata diagnostik dari data manual. Bid, mekanisme lelang, penyesuaian dan tagihan platform dapat berbeda.' },
    ], sources: ['cpm'], testCase: 'CPM scales exact spend by one thousand impressions before rounding',
  },
  cpc: {
    title: 'Kalkulator CPC Iklan', description: 'Hitung biaya rata-rata per klik dari belanja iklan dan definisi klik yang Anda gunakan.',
    keywords: ['cpc', 'average cpc', 'biaya per klik', 'cost per click'],
    inputFields: [spend, count('clicks', 'Jumlah klik sesuai definisi data')],
    outputFields: [output('cost', 'CPC rata-rata per klik', 'IDR-cents'), output('spend', 'Belanja iklan yang dimasukkan', 'IDR-whole'), output('events', 'Jumlah klik')],
    engine: calculateCpc, hint: adHint,
    formula: 'CPC rata-rata = belanja iklan ÷ jumlah klik. Jumlah klik harus positif; masukkan biaya dan klik dari cakupan yang sama.',
    example: 'Belanja Rp100.000 untuk 250 klik memberi CPC Rp400,00 per klik. Belanja Rp1 untuk 3 klik memberi Rp0,33; untuk 8 klik memberi Rp0,13 setelah pembulatan.',
    rounding: costRounding,
    assumptions: `${adScope} Klik adalah aksi dan tidak selalu orang unik. CPC semua klik tidak otomatis sama dengan cost per link click; gunakan jumlah dan biaya yang mengikuti definisi klik tujuan Anda. Ini rata-rata, bukan maksimum bid.`,
    faq: [
      { question: 'Apakah klik sama dengan pengunjung unik?', answer: 'Tidak. Orang yang sama bisa mengeklik beberapa kali, dan definisi klik serta sesi dapat berbeda.' },
      { question: 'Bolehkah biaya iklan nol?', answer: 'Boleh, jika jumlah klik positif maka CPC model ini Rp0,00. Jumlah klik nol tetap membuat pembagian tidak terdefinisi dan ditolak.' },
    ], sources: ['cpc'], testCase: 'CPC divides matched campaign spend by positive click events',
  },
  cpa: {
    title: 'Kalkulator CPA Iklan', description: 'Hitung biaya rata-rata per penjualan, lead atau pendaftaran teratribusi dengan definisi hasil yang Anda pilih.',
    keywords: ['cpa', 'cost per acquisition', 'biaya per akuisisi', 'cost per action', 'biaya per hasil'],
    inputFields: [spend, { id: 'action', label: 'Definisi hasil teratribusi', type: 'choice', options: [{ value: 'sale', label: 'Penjualan' }, { value: 'lead', label: 'Lead' }, { value: 'signup', label: 'Pendaftaran' }] }, count('acquisitions', 'Jumlah hasil teratribusi sesuai pilihan')],
    outputFields: [output('cost', 'CPA per hasil teratribusi', 'IDR-cents'), output('spend', 'Belanja iklan yang dimasukkan', 'IDR-whole'), output('events', 'Jumlah hasil teratribusi')],
    engine: calculateCpa, hint: `${adHint} Pilih satu definisi hasil. Samakan periode, model dan jendela atribusi biaya serta hasil yang dibandingkan.`,
    formula: 'CPA rata-rata = belanja iklan ÷ jumlah hasil teratribusi. Hasil adalah penjualan, lead atau pendaftaran sesuai pilihan. Jumlah hasil harus positif dan memakai satu definisi yang konsisten.',
    example: 'Belanja Rp500.000 untuk 20 penjualan teratribusi memberi Rp25.000,00 per penjualan. Belanja Rp1 untuk 3 lead memberi Rp0,33 per lead; untuk 8 pendaftaran memberi Rp0,13 setelah pembulatan.',
    rounding: costRounding,
    assumptions: `${adScope} Gunakan model dan jendela atribusi yang sama; kalkulator tidak mengaudit atribusi. Cost per acquisition dan cost per action tidak selalu sinonim: sumber Google menyebut action, sedangkan hasil di sini mengikuti pilihan Anda. Lead atau transaksi tidak otomatis pelanggan baru. Hanya jumlah integer didukung, bukan konversi berbobot pecahan. CPA bukan ROAS, LTV, laba atau bukti bahwa iklan menyebabkan seluruh hasil.`,
    faq: [
      { question: 'Apakah CPA membuktikan kampanye menguntungkan?', answer: 'Tidak. Laba memerlukan nilai hasil, margin, biaya lain dan analisis tambahan. Hasil teratribusi juga tidak membuktikan sebab-akibat iklan.' },
      { question: 'Mengapa definisi dan jendela atribusi harus sama?', answer: 'Perubahan jenis hasil atau jendela waktu mengubah jumlah yang dikreditkan pada iklan. Membandingkan data yang berbeda cakupan dapat menyesatkan meskipun pembagiannya benar.' },
    ], sources: ['cpa', 'attribution'], testCase: 'CPA preserves chosen acquisition definition while dividing attributed results',
  },
} satisfies Record<string, SocialTool>
export type SocialSlug = keyof typeof socialTools
