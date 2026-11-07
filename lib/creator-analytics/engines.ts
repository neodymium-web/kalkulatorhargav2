import { z } from 'zod'
const count = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan hitungan utuh nonnegatif hingga 13 digit.').transform(BigInt)
const money = z.string().trim().regex(/^\d{1,13}$/, 'Masukkan rupiah utuh nonnegatif hingga 13 digit.').transform(BigInt)
function decimal(digits: number, wholeDigits = 13) {
  return z.string().trim().regex(new RegExp(`^\\d{1,${wholeDigits}}([.,]\\d{1,${digits}})?$`), `Maksimal ${wholeDigits} digit bulat dan ${digits} desimal nonnegatif.`).transform(v => {
    const [a, b = ''] = v.replace(',', '.').split('.')
    return BigInt(a) * 10n ** BigInt(digits) + BigInt(b.padEnd(digits, '0'))
  })
}
const cents = decimal(2)
const margin = decimal(4, 3).refine(v => v < 1000000n, 'Margin harus 0 hingga kurang dari 100%.')
const quantity = count.refine(v => v >= 1n && v <= 1000n, 'Jumlah konten harus 1–1.000.')
const pricing = { production: money, hours: decimal(2, 6), hourly: money, overhead: money, usage: money, deliverables: quantity }
const basis = z.enum(['followers', 'views'], { error: 'Pilih pengikut atau tayangan sebagai basis.' })
export const ctrInput = z.object({ clicks: count, impressions: count.refine(v => v > 0n, 'Impresi harus lebih dari nol.') })
export const youtubeInput = z.object({ views: count, rpm: cents })
export const earningsInput = z.object({ eligibleViews: count, rpm: cents, sponsor: cents, affiliate: cents, gift: cents,
  incomeBasis: z.enum(['realized', 'assumed'], { error: 'Pilih realisasi atau asumsi untuk sumber lain.' }),
})
export const accountInput = z.object({ followers: count, views: count, likes: count, comments: count, saves: count, shares: count, videos: count, basis })
export const endorsementInput = z.object({ ...pricing, margin })
export const rateCardInput = z.object({ ...pricing, lowMargin: margin, highMargin: margin, slots: count.refine(v => v <= 1000n, 'Maksimal 1.000 paket sponsor.') })
  .refine(v => v.highMargin >= v.lowMargin, { path: ['highMargin'], message: 'Margin tinggi harus sama atau lebih besar dari margin rendah.' })
export const comparisonInput = z.object({ basis, followersA: count, viewsA: count, interactionsA: count, videosA: count,
  followersB: count, viewsB: count, interactionsB: count, videosB: count,
})
export const watchTimeInput = z.object({ views: count, minutes: decimal(4, 6) })
export type Precision = 'positive' | 'negative'
export type CreatorOutput = {
  values: Record<string, bigint | null>
  precision: Record<string, Precision>
  notes?: string[]
  comparison?: boolean
}
export type CreatorResult = ({ success: true } & CreatorOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => CreatorOutput) {
  return (input: unknown): CreatorResult => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    return { success: true, ...engine(parsed.data) }
  }
}
function output() {
  const values: Record<string, bigint | null> = {}, precision: Record<string, Precision> = {}
  const ratio = (key: string, numerator: bigint, denominator: bigint) => {
    if (!denominator) { values[key] = null; return }
    const magnitude = numerator < 0n ? -numerator : numerator
    const rounded = (2n * magnitude + denominator) / (2n * denominator)
    values[key] = numerator < 0n ? -rounded : rounded
    if (rounded === 0n && numerator !== 0n) precision[key] = numerator < 0n ? 'negative' : 'positive'
  }
  return { values, precision, ratio, data: { values, precision } }
}
const ceil = (a: bigint, b: bigint) => (a + b - 1n) / b
export const calculateCtr = calculate(ctrInput, ({ clicks, impressions }) => {
  const out = output(); out.ratio('rate', clicks * 10000n, impressions)
  return { ...out.data, values: { ...out.values, clicks, impressions }, notes: clicks > impressions
    ? ['Klik melebihi impresi pada data eksak sebelum pembulatan. Periksa kesamaan definisi, periode dan pencatatan; hasil tidak dibatasi 100%.'] : ['Klik dan impresi adalah event, bukan orang unik. CTR tidak menunjukkan profit atau konversi.'] }
})
export const calculateYoutube = calculate(youtubeInput, ({ views, rpm }) => {
  const out = output(); out.ratio('income', views * rpm, 1000n)
  return { ...out.data, values: { ...out.values, views, rpm }, notes: ['Simulasi total tayangan video non-Shorts × RPM kreator asumsi per 1.000 total tayangan. Jangan memakai hanya monetized playbacks. Tanpa tarif, share revenue tambahan, kelayakan atau payout resmi.'] }
})
export const calculateCreatorEarnings = calculate(earningsInput, ({ eligibleViews, rpm, sponsor, affiliate, gift, incomeBasis }) => {
  const out = output(); const modeled = eligibleViews * rpm
  out.ratio('platform', modeled, 1000n)
  out.ratio('total', modeled + (sponsor + affiliate + gift) * 1000n, 1000n)
  return { ...out.data, values: { ...out.values, sponsor, affiliate, gift }, notes: [
    `Platform selalu model RPM hipotetis; sumber lain adalah ${incomeBasis === 'realized' ? 'realisasi neto yang Anda masukkan' : 'asumsi neto Anda'}. Total gabungan bukan payout terverifikasi.`,
    'Gunakan satu periode pelaporan. Semua komponen neto setelah fee langsung masing-masing sumber, sebelum pajak pribadi dan biaya produksi umum. Sumber sponsor/affiliate/gift tidak boleh sudah tercakup dalam RPM. Jika views tidak dibayar, isi RPM 0; tidak ada penentuan kelayakan akun atau wilayah.',
  ] }
})
export const calculateAccount = calculate(accountInput, ({ followers, views, likes, comments, saves, shares, videos, basis }) => {
  const out = output(); const interactions = likes + comments + saves + shares
  const denominator = basis === 'followers' ? followers : views
  out.ratio('rate', interactions * 10000n, denominator); out.ratio('average', views * 100n, videos)
  return { ...out.data, values: { ...out.values, interactions, followers, views, videos }, notes: [
    `Basis engagement: ${basis === 'followers' ? 'pengikut' : 'tayangan konten, bukan reach'}. Data manual pada cohort dan periode yang sama. Aksi tidak harus unik.`,
    ...(denominator > 0n && interactions > denominator ? ['Rasio aksi eksak melebihi 100%; hasil tetap valid tanpa cap.'] : []),
    ...(!denominator ? ['Engagement tidak terdefinisi karena basis nol.'] : []), ...(!videos ? ['Rata-rata tayangan tidak terdefinisi karena jumlah video nol.'] : []),
  ] }
})
type Pricing = z.infer<typeof endorsementInput>
function costs(v: Omit<Pricing, 'margin'>) {
  const labor = v.deliverables * v.hours * v.hourly
  return { labor, base: v.deliverables * (v.production + v.overhead) * 100n + labor, rights: v.deliverables * v.usage }
}
function price(base: bigint, margin: bigint) {
  return ceil(base * 1000000n, 100n * (1000000n - margin))
}
export const calculateEndorsement = calculate(endorsementInput, v => {
  const out = output(); const c = costs(v), productionQuote = price(c.base, v.margin)
  const profit = productionQuote * 100n - c.base
  out.ratio('effective', profit * 10000n, productionQuote * 100n)
  return { ...out.data, values: { ...out.values, quote: productionQuote + c.rights, productionQuote, base: c.base, labor: c.labor, rights: c.rights, profit },
    notes: ['Penawaran seluruh paket: komponen produksi minimum dibulatkan ke atas ke rupiah, lalu hak pakai terpisah ditambahkan tanpa margin. Margin efektif hanya atas komponen produksi dan tidak terdefinisi jika komponen itu nol. Model biaya internal, bukan harga pasar, tarif per follower, atau laba setelah pajak.'] }
})
export const calculateRateCard = calculate(rateCardInput, v => {
  const c = costs(v), low = price(c.base, v.lowMargin) + c.rights, high = price(c.base, v.highMargin) + c.rights
  return { values: { low, high, base: c.base, rights: c.rights, slots: v.slots, revenueLow: low * v.slots, revenueHigh: high * v.slots }, precision: {},
    notes: ['Rentang penawaran seluruh paket memakai biaya yang sama dan dua margin asumsi. Hak pakai terpisah tanpa margin. Jumlah paket sponsor adalah kapasitas asumsi pada satu periode, bukan jumlah konten lagi. Omzet skenario bukan pesanan, payout atau pendapatan terjamin.'] }
})
export const calculateComparison = calculate(comparisonInput, v => {
  const out = output()
  const da = v.basis === 'followers' ? v.followersA : v.viewsA, db = v.basis === 'followers' ? v.followersB : v.viewsB
  out.ratio('erA', v.interactionsA * 10000n, da); out.ratio('erB', v.interactionsB * 10000n, db)
  out.ratio('erChange', (v.interactionsB * da - v.interactionsA * db) * 10000n, da * db)
  out.ratio('averageA', v.viewsA * 100n, v.videosA); out.ratio('averageB', v.viewsB * 100n, v.videosB)
  out.ratio('averageChange', (v.viewsB * v.videosA - v.viewsA * v.videosB) * 100n, v.videosA * v.videosB)
  return { ...out.data, comparison: true, values: { ...out.values,
    followersA: v.followersA, followersB: v.followersB, followersChange: v.followersB - v.followersA,
    viewsA: v.viewsA, viewsB: v.viewsB, viewsChange: v.viewsB - v.viewsA,
    interactionsA: v.interactionsA, interactionsB: v.interactionsB, interactionsChange: v.interactionsB - v.interactionsA,
    videosA: v.videosA, videosB: v.videosB, videosChange: v.videosB - v.videosA,
  }, notes: [`Basis kedua akun: ${v.basis === 'followers' ? 'pengikut' : 'tayangan konten'}. Samakan periode, cohort, definisi aksi dan video. Selisih = B dikurangi A, rasio dihitung sebelum pembulatan. Pembagi nol membuat metrik dan selisih terkait tidak terdefinisi. Aksi dapat >100%; tidak ada ranking, skor kualitas, atau analitik akun langsung.`] }
})
export const calculateWatchTime = calculate(watchTimeInput, ({ views, minutes }) => {
  const out = output(); const ledger = views * minutes
  out.ratio('hours', ledger * 100n, 600000n); out.ratio('minutes', ledger * 100n, 10000n)
  return { ...out.data, notes: ['Menit dan jam dibulatkan sendiri dari ledger waktu yang sama. Gunakan views dan durasi rata-rata pada periode/populasi yang sama. Ini estimasi waktu tonton, bukan jam publik YPP atau waktu yang memenuhi rewards. Durasi replay tidak dipotong otomatis.'] }
})

export type CreatorMode = 'earnings' | 'account' | 'ratecard' | 'comparison'
const modeInput = z.object({ mode: z.enum(['earnings', 'account', 'ratecard', 'comparison'], { error: 'Pilih modul kreator.' }) })
export function calculateTiktok(input: unknown): CreatorResult {
  const parsed = modeInput.safeParse(input)
  if (!parsed.success) return { success: false, errors: { mode: ['Pilih modul kreator yang tersedia.'] } }
  return { earnings: calculateCreatorEarnings, account: calculateAccount, ratecard: calculateRateCard, comparison: calculateComparison }[parsed.data.mode](input)
}
