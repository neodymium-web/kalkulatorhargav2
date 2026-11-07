import type { BatchField } from '../batch-four/tools'
import { calculateCtr, calculateYoutube, calculateWatchTime, calculateEndorsement, calculateCreatorEarnings, calculateAccount, calculateRateCard, calculateComparison, calculateTiktok, type CreatorResult } from './engines'
import type { CreatorSourceId } from './sources'
export type CreatorTool = {
  title: string; description: string; keywords: readonly string[]
  inputFields: readonly BatchField[]
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: string }[]
  engine: (input: unknown) => CreatorResult
  hint: string; formula: string; example: string; assumptions: string
  sources: readonly CreatorSourceId[]; faq: readonly { question: string; answer: string }[]; testCase: string
}
const count = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const decimal = (id: string, label: string): BatchField => ({ id, label, type: 'decimal' })
const cash = (id: string, label: string): BatchField => ({ ...money(id, label), type: 'decimal' })
const out = (id: string, label: string, unit = 'cents') => ({ id, label, unit, type: unit === 'IDR' || unit === 'count' || unit === 'delta' ? 'integer' as const : 'decimal' as const })
const manual = 'Data manual satu akun/cohort dan periode pelaporan yang sama. Hitungan utuh hingga 13 digit, tanpa pemisah ribuan. Tidak ada analitik akun langsung atau benchmark.'
const rpm = cash('rpm', 'RPM kreator asumsi neto per 1.000 tayangan sesuai basis (2 desimal)')
const basis: BatchField = { id: 'basis', label: 'Basis engagement kedua akun', type: 'choice', options: [{ value: 'followers', label: 'Pengikut' }, { value: 'views', label: 'Tayangan konten (bukan reach)' }] }
const pricingFields = [money('production', 'Biaya produksi kas per konten'), decimal('hours', 'Jam kerja per konten (maksimal 2 desimal)'), money('hourly', 'Target kompensasi per jam'), money('overhead', 'Overhead langsung per konten'), money('usage', 'Hak pakai terpisah per konten (tanpa margin)'), count('deliverables', 'Jumlah konten dalam satu paket (1–1.000)')]
const priceHint = 'Biaya per konten dalam rupiah utuh hingga 13 digit; jam maksimal 6 digit bulat dan 2 desimal. Margin pada harga jual komponen produksi, 0 hingga kurang dari 100%, maksimal 4 desimal persen. Hak pakai ditambahkan terpisah tanpa margin.'
export const creatorModes = {
  earnings: {
    title: 'Simulasi pendapatan', description: 'Gabungkan model RPM hipotetis dengan sponsor, affiliate dan gift neto tanpa menghitung sumber dua kali.', keywords: [],
    inputFields: [count('eligibleViews', 'Tayangan yang diasumsikan memenuhi basis RPM model'), rpm,
      { id: 'incomeBasis', label: 'Dasar angka sumber pendapatan lain', type: 'choice', options: [{ value: 'realized', label: 'Realisasi neto yang saya catat' }, { value: 'assumed', label: 'Asumsi neto untuk skenario' }] },
      cash('sponsor', 'Sponsor neto pada periode yang sama'), cash('affiliate', 'Komisi affiliate neto (bukan omzet)'), cash('gift', 'Gift neto yang direalisasi atau diasumsikan (bukan coin)')],
    outputFields: [out('total', 'Total gabungan model dan input sumber lain'), out('platform', 'Pendapatan platform model RPM hipotetis'), out('sponsor', 'Sponsor neto input'), out('affiliate', 'Komisi affiliate neto input'), out('gift', 'Gift neto input')],
    engine: calculateCreatorEarnings,
    hint: 'Semua nominal dalam IDR, maksimal 13 digit bulat dan 2 desimal. Satu periode pelaporan pilihan Anda, bukan otomatis per bulan. Platform selalu model hipotetis. Isi 0 pada sumber yang tidak ada dan RPM 0 jika tayangan tidak menghasilkan pembayaran.',
    formula: 'Platform model = tayangan asumsi yang sesuai basis × RPM asumsi ÷ 1.000. Total = platform model + sponsor neto + komisi affiliate neto + gift neto. Seluruh sumber lain dimasukkan sekali saja.',
    example: 'Asumsi 10.000 tayangan dan RPM Rp100 memberi platform model Rp1.000,00. Sponsor neto Rp200, affiliate neto Rp30 dan gift neto Rp20 memberi gabungan Rp1.250,00. Ini input ilustratif, bukan tarif TikTok. Satu tayangan dengan RPM Rp5 memberi Rp0,005 sebelum pembulatan.',
    assumptions: 'Tayangan publik tidak otomatis memenuhi basis pembayaran. Model ini tidak mereplikasi formula resmi atau memeriksa akun, wilayah, program maupun eligibility. Semua komponen neto setelah fee langsung sumber masing-masing, sebelum pajak pribadi dan biaya produksi umum. Jika sponsor/affiliate/gift sudah termasuk RPM, jangan masukkan lagi. Pilihan realisasi/asumsi hanya menjelaskan sumber lain; total dengan platform model tetap bukan payout terverifikasi.',
    sources: ['tiktok'], faq: [{ question: 'Apakah semua views TikTok dibayar?', answer: 'Tidak ada asumsi seperti itu. Anda menentukan basis tayangan dan RPM hipotetis. Jika tidak ada pembayaran, gunakan RPM 0. Kalkulator tidak memutuskan kelayakan monetisasi.' }], testCase: 'creator earnings reconciles modeled and separate net income once',
  },
  account: {
    title: 'Engagement dan metrik akun', description: 'Jumlahkan empat aksi dan pilih pengikut atau tayangan konten untuk basis engagement TikTok.', keywords: [],
    inputFields: [count('followers', 'Jumlah pengikut'), count('views', 'Tayangan konten pada cohort pilihan'), count('likes', 'Jumlah suka'), count('comments', 'Jumlah komentar'), count('saves', 'Jumlah simpan'), count('shares', 'Jumlah bagikan'), count('videos', 'Jumlah video pada cohort yang sama'), { ...basis, label: 'Basis engagement akun' }],
    outputFields: [out('rate', 'Engagement akun pada basis pilihan', '%'), out('interactions', 'Total aksi interaksi', 'count'), out('average', 'Rata-rata tayangan per video', 'decimal'), out('followers', 'Pengikut', 'count'), out('views', 'Tayangan konten', 'count'), out('videos', 'Video', 'count')],
    engine: calculateAccount, hint: manual,
    formula: 'I = suka + komentar + simpan + bagikan. ER = I ÷ basis × 100%, dengan basis pengikut atau tayangan konten. Rata-rata tayangan = views ÷ jumlah video. Rasio dengan pembagi nol tidak terdefinisi.',
    example: '1.000 pengikut, 3.000 tayangan, 3 video dan 135 aksi memberi ER pengikut 13,50%, ER tayangan 4,50%, serta 1.000,00 tayangan/video. Satu aksi, 32 pengikut, 1.000 tayangan dan 3 video memberi ER pengikut 3,13% serta rata-rata 333,33.',
    assumptions: 'Gunakan satu periode/cohort dan definisi aksi yang sama. Basis tayangan berbeda dari reach pada Engagement Rate generik. Aksi tidak harus orang unik dan dapat melebihi basis. Jumlah video nol membuat average tidak terdefinisi; jumlah aksi dan hitungan lain tetap tersedia.',
    sources: ['engagement', 'tiktok'], faq: [{ question: 'Mengapa berbeda dari kalkulator Engagement Rate?', answer: 'Alat generik memilih followers atau reach. Modul TikTok ini memakai followers atau views konten, menambahkan rata-rata views/video, dan tidak mengambil akun langsung.' }], testCase: 'creator account metrics preserve views follower basis and zero denominators',
  },
  ratecard: {
    title: 'Rentang penawaran sponsor', description: 'Gunakan biaya paket dan dua margin asumsi untuk rentang quote serta kapasitas omzet sponsor.', keywords: [],
    inputFields: [...pricingFields, decimal('lowMargin', 'Margin produksi rendah (%)'), decimal('highMargin', 'Margin produksi tinggi (%)'), count('slots', 'Jumlah paket sponsor asumsi pada periode pilihan (0–1.000)')],
    outputFields: [out('low', 'Penawaran rendah seluruh paket', 'IDR'), out('high', 'Penawaran tinggi seluruh paket', 'IDR'), out('base', 'Biaya dasar produksi seluruh paket'), out('rights', 'Hak pakai seluruh paket', 'IDR'), out('revenueLow', 'Omzet skenario rendah (quote × paket)', 'IDR'), out('revenueHigh', 'Omzet skenario tinggi (quote × paket)', 'IDR'), out('slots', 'Jumlah paket sponsor asumsi', 'count')],
    engine: calculateRateCard, hint: priceHint,
    formula: 'B = jumlah konten × (produksi kas + jam × kompensasi/jam + overhead). U = jumlah konten × hak pakai. Quote rendah/tinggi = ceil(B ÷ (1−margin rendah/tinggi)) + U. Omzet skenario = quote × jumlah paket sponsor.',
    example: 'Satu konten dengan produksi Rp100, 2 jam × Rp100, overhead Rp50 dan hak pakai Rp50 memberi B Rp350 dan U Rp50. Margin 20–30% menghasilkan quote Rp488–Rp550. Dua paket sponsor memberi omzet asumsi Rp976–Rp1.100. Tiga konten dengan B Rp675, U Rp60 dan margin 0–25% memberi Rp735–Rp960 per paket.',
    assumptions: 'Model biaya internal, bukan harga pasar TikTok atau tarif per follower. Margin tinggi harus ≥ rendah dan keduanya <100%. Hak pakai dihargai terpisah tanpa margin; biaya dan konten sama di kedua sisi rentang. Jumlah paket bukan jumlah konten lagi. Slot 0 memberi omzet 0 tanpa menghapus quote. Omzet adalah kapasitas asumsi, bukan pesanan, payout atau pendapatan terjamin.',
    sources: ['margin'], faq: [{ question: 'Apakah range ini standar rate card TikTok?', answer: 'Tidak. Range hanya berasal dari biaya, hak pakai, konten dan margin yang Anda masukkan. Kesepakatan pasar, pajak serta negosiasi tidak dimodelkan.' }], testCase: 'creator rate card reuses exact pricing with ordered margins and package slots',
  },
  comparison: {
    title: 'Perbandingan manual A/B', description: 'Bandingkan hitungan, engagement dan rata-rata views/video dengan periode dan basis yang sepadan.', keywords: [],
    inputFields: [basis, ...(['A', 'B'] as const).flatMap(id => [count(`followers${id}`, `Akun ${id}: pengikut`), count(`views${id}`, `Akun ${id}: tayangan konten`), count(`interactions${id}`, `Akun ${id}: total aksi suka + komentar + simpan + bagikan`), count(`videos${id}`, `Akun ${id}: jumlah video`)])],
    outputFields: [out('erChange', 'Selisih engagement B−A', 'pp'), out('averageChange', 'Selisih rata-rata tayangan/video B−A', 'delta-decimal')],
    engine: calculateComparison, hint: manual,
    formula: 'Untuk setiap akun: ER = aksi ÷ basis × 100%; average = views ÷ video. Selisih = B−A. Selisih ER dalam poin persentase dan selisih average dihitung dari rasio eksak sebelum membulatkan hasil masing-masing.',
    example: 'Basis pengikut: A 1.000 followers, 1.000 views, 100 aksi, 3 video; B 2.000 followers, 800 views, 100 aksi, 2 video. ER 10% dan 5%, selisih −5,00 poin persentase. Average 333,33 dan 400,00, selisih +66,67. A 32 pengikut/1 aksi dan B 31 pengikut/1 aksi memberi selisih +0,10 poin persentase.',
    assumptions: 'Samakan periode/cohort dan definisi semua input, termasuk jenis aksi dan video. Tabel menampilkan A, B dan selisih untuk pengikut, views, aksi, video, ER dan average. Pembagi nol menghasilkan status tidak terdefinisi pada rasio dan delta terkait. Selisih bukan persen pertumbuhan terhadap akun A. Tidak ada skor, bobot, ranking akun terbaik atau klaim analitik langsung.',
    sources: ['engagement'], faq: [{ question: 'Apakah akun dengan ER lebih tinggi pasti lebih baik?', answer: 'Tidak. Basis, periode, tipe konten, tujuan dan cara pencatatan dapat berbeda. Modul ini menunjukkan selisih manual tanpa ranking kualitas.' }], testCase: 'creator comparison derives signed differences from unrounded ratios',
  },
} satisfies Record<string, CreatorTool>
export const creatorTools = {
  ctr: {
    title: 'Kalkulator CTR', description: 'Hitung click-through rate dari klik dan impresi, dengan validasi basis serta hasil persen yang presisi.', keywords: ['ctr', 'click through rate', 'persentase klik impresi'],
    inputFields: [count('clicks', 'Jumlah klik'), count('impressions', 'Jumlah impresi')],
    outputFields: [out('rate', 'CTR', '%'), out('clicks', 'Klik event', 'count'), out('impressions', 'Impresi', 'count')], engine: calculateCtr, hint: manual,
    formula: 'CTR = jumlah klik ÷ jumlah impresi × 100%. Impresi wajib positif. Klik dan impresi adalah hitungan event, bukan orang unik atau reach.',
    example: '5 klik dari 100 impresi memberi CTR 5,00%. Satu klik dari 32 impresi memberi 3,13% setelah pembulatan. 135 klik dari 100 impresi memberi 135,00% dengan peringatan untuk memeriksa data.',
    assumptions: 'Gunakan definisi, periode dan cakupan pelaporan yang sama. Klik melebihi impresi tidak dibatasi diam-diam; periksa pencatatan dan definisi data. CTR bukan CVR, CPA, ROI atau bukti kampanye menguntungkan.',
    sources: ['ctr'], faq: [{ question: 'Apakah CTR boleh melebihi 100%?', answer: 'Hasil manual tetap ditampilkan dengan peringatan untuk memeriksa definisi dan pencatatan. Kalkulator tidak menganggap semua model pengukuran identik.' }], testCase: 'CTR uses exact event counts and warns above impressions',
  },
  'estimasi-youtube': {
    title: 'Kalkulator Estimasi Pendapatan YouTube', description: 'Simulasikan pendapatan video non-Shorts dari total tayangan dan RPM kreator asumsi pada basis yang sama.', keywords: ['estimasi youtube', 'rpm youtube', 'simulasi pendapatan youtube'],
    inputFields: [count('views', 'Total tayangan video non-Shorts sesuai basis RPM'), rpm], outputFields: [out('income', 'Pendapatan model RPM asumsi'), out('views', 'Total tayangan dalam basis RPM', 'count'), out('rpm', 'RPM neto asumsi per 1.000 total tayangan')], engine: calculateYoutube,
    hint: 'Isi total views video non-Shorts pada basis RPM yang sama, termasuk tayangan tanpa iklan. Jangan memakai hanya monetized playbacks. RPM asumsi dalam IDR hingga 13 digit bulat dan 2 desimal, bukan tarif resmi; nol valid.',
    formula: 'Pendapatan model = total tayangan video non-Shorts × RPM kreator asumsi ÷ 1.000. RPM adalah pendapatan per 1.000 total tayangan pada cakupan yang sama, bukan CPM pengiklan atau pendapatan per monetized playback.',
    example: 'Asumsi 10.000 total tayangan dan RPM Rp1.500,25 menghasilkan model Rp15.002,50. Dengan 12.345 tayangan, hasil Rp18.520,59. Satu tayangan dan RPM Rp5 memberi Rp0,005 sebelum pembulatan.',
    assumptions: 'Scope sengaja video non-Shorts; tidak mencampur basis engaged views Shorts. RPM dianggap sudah neto sesuai definisi input, sehingga share platform tidak dikurangi lagi. Jangan menambahkan sumber yang sudah tercakup di RPM. Tidak ada estimasi eligibility, YPP, sponsor otomatis, harga iklan, tarif payout atau jaminan penghasilan.',
    sources: ['rpm'], faq: [{ question: 'Apakah RPM sama dengan CPM?', answer: 'Tidak. RPM kreator memakai pendapatan pada basis tayangan terkait; CPM pengiklan berhubungan dengan biaya per seribu impresi iklan. Keduanya tidak dapat saling menggantikan.' }], testCase: 'YouTube model uses matching total-view RPM without invented revenue share',
  },
  tiktok: {
    title: 'Kalkulator TikTok Kreator', description: 'Simulasi penghasilan, engagement, rentang penawaran sponsor dan perbandingan akun TikTok dari asumsi manual, tanpa tarif resmi.', keywords: ['kalkulator tiktok', 'penghasilan kreator tiktok', 'engagement tiktok', 'rate card tiktok', 'perbandingan akun tiktok'],
    inputFields: creatorModes.earnings.inputFields, outputFields: creatorModes.earnings.outputFields, engine: calculateTiktok,
    hint: creatorModes.earnings.hint,
    formula: 'Empat modul mandiri: pendapatan asumsi RPM dan sumber neto, rasio engagement akun, penawaran sponsor berbasis biaya, serta selisih metrik manual A/B.',
    example: creatorModes.earnings.example,
    assumptions: 'Halaman untuk kreator, bukan biaya seller TikTok Shop. Semua modul manual dan independen. Tanpa pencarian username, koneksi akun atau benchmark. Pengumuman TikTok 2024 hanya konteks historis, bukan verifikasi aturan atau ketersediaan program saat ini.',
    sources: ['tiktok', 'engagement', 'margin'], faq: [{ question: 'Apakah saya bisa menghitung penghasilan hanya dari username?', answer: 'Tidak. Isi data dan asumsi Anda sendiri. Tidak ada pengambilan akun langsung, tarif resmi atau pemeriksaan kelayakan monetisasi.' }], testCase: 'TikTok suite dispatches every functional manual mode without seller intent',
  },
  'tarif-endorsement': {
    title: 'Kalkulator Tarif Endorsement', description: 'Susun minimum penawaran paket konten dari biaya, jam kerja dan margin harga jual, dengan hak pakai terpisah.', keywords: ['tarif endorsement', 'harga sponsor konten', 'cost plus kreator', 'hak pakai konten'],
    inputFields: [...pricingFields, decimal('margin', 'Target margin komponen produksi (%)')],
    outputFields: [out('quote', 'Minimum penawaran seluruh paket', 'IDR'), out('productionQuote', 'Komponen produksi sebelum hak pakai', 'IDR'), out('base', 'Biaya dasar produksi paket'), out('labor', 'Kompensasi kerja paket (bagian dari biaya dasar)'), out('rights', 'Hak pakai paket, tanpa margin', 'IDR'), out('profit', 'Surplus produksi sebelum pajak'), out('effective', 'Margin efektif komponen produksi', '%')], engine: calculateEndorsement, hint: priceHint,
    formula: 'B = konten × (produksi + jam × kompensasi/jam + overhead), U = konten × hak pakai. Penawaran = ceil(B ÷ (1−margin)) + U. Surplus produksi = komponen produksi − B; margin efektif = surplus ÷ komponen produksi × 100%, jika komponen produksi positif.',
    example: 'Satu konten: biaya produksi Rp100, 2 jam × Rp100, overhead Rp50, hak pakai Rp50 dan margin 20%. Biaya dasar Rp350; produksi minimum Rp438 dan total penawaran Rp488. Surplus produksi Rp88 dan margin efektif 20,09%. Tiga konten dengan dasar Rp675, hak Rp60 dan margin 25% memberi quote Rp960.',
    assumptions: 'Model bisnis internal dari biaya pengguna, bukan standar tarif kreator atau harga pasar per follower. Hak pakai dihargai terpisah tanpa margin dan dikecualikan dari surplus/margin produksi. Seluruh nominal biaya per konten, jumlah konten hanya dikalikan sekali. Pajak, biaya lain dan negosiasi tidak ditambahkan otomatis.',
    sources: ['margin'], faq: [{ question: 'Apakah margin sama dengan markup?', answer: 'Tidak. Margin membagi surplus dengan harga jual komponen produksi. Markup membagi surplus dengan biaya. Rumus ini memakai margin pada harga jual.' }], testCase: 'endorsement ceilings minimum production price and passes rights separately',
  },
  'waktu-tonton': {
    title: 'Kalkulator Waktu Tonton', description: 'Estimasi total jam dan menit tonton dari views serta durasi rata-rata pada populasi dan periode yang sama.', keywords: ['waktu tonton', 'jam tonton', 'watch time', 'durasi rata rata'],
    inputFields: [count('views', 'Jumlah tayangan dalam populasi rata-rata'), decimal('minutes', 'Durasi rata-rata per tayangan (menit, maksimal 4 desimal)')],
    outputFields: [out('hours', 'Estimasi total jam tonton', 'hours'), out('minutes', 'Estimasi total menit tonton', 'minutes')], engine: calculateWatchTime, hint: 'Durasi memakai menit desimal, bukan format menit:detik; maksimal 6 digit bulat dan 4 desimal. Views integer hingga 13 digit. Nol views atau durasi valid.',
    formula: 'Total menit = views × durasi rata-rata dalam menit. Total jam = total menit ÷ 60. Keduanya berasal dari ledger eksak yang sama, bukan mengonversi hasil tampilan yang sudah dibulatkan.',
    example: '1.000 views dengan rata-rata 1,5 menit memberi 1.500,00 menit atau 25,00 jam. Tiga views × 0,1 menit memberi 0,30 menit atau 0,005 jam, ditampilkan 0,01 jam.',
    assumptions: 'Samakan periode, populasi views, metode rata-rata dan deduplikasi laporan. Bila sumber memberi average duration dalam detik, ubah ke menit dengan membagi 60 terlebih dahulu sesuai presisi input. Durasi replay tidak dibatasi panjang video otomatis. Ini bukan jam publik yang memenuhi YPP atau qualified watch time TikTok.',
    sources: ['watch'], faq: [{ question: 'Mengapa jam dan menit tampilan bisa tampak berbeda saat dikonversi?', answer: 'Kedua angka dibulatkan sendiri dari waktu eksak. Mengonversi angka tampilan yang sudah dibulatkan dapat memberi selisih kecil.' }], testCase: 'watch time derives hours and minutes independently from one exact ledger',
  },
} satisfies Record<string, CreatorTool>
export type CreatorSlug = keyof typeof creatorTools
