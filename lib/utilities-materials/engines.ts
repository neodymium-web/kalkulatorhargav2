import { z } from 'zod'
import { add, subtract, multiply, divide, fraction, round, ceiling, type Rational } from './rational'
const SIX = 1000000n, FOUR = 10000n
function fixed(digits = 6, whole = 6, positive = false) {
  return z.string().trim().regex(new RegExp(`^\\d{1,${whole}}([.,]\\d{1,${digits}})?$`), { message: `Isi angka nonnegatif hingga ${whole} digit bulat dan ${digits} desimal, tanpa pemisah ribuan.`, abort: true }).transform(v => {
    const [a, b = ''] = v.replace(',', '.').split('.'); return BigInt(a) * 10n ** BigInt(digits) + BigInt(b.padEnd(digits, '0'))
  }).refine(v => !positive || v > 0n, { message: 'Nilai harus lebih dari nol.', abort: true })
}
function integer(max: bigint, digits: number) {
  return z.string().trim().regex(new RegExp(`^\\d{1,${digits}}$`), { message: `Isi bilangan bulat 1–${max}.`, abort: true }).transform(BigInt).refine(v => v >= 1n && v <= max, { message: `Nilai harus 1–${max}.`, abort: true })
}
const money = z.string().trim().regex(/^\d{1,13}$/, { message: 'Isi rupiah utuh nonnegatif hingga 13 digit.', abort: true }).transform(BigInt)
const optionalZero = (value: unknown) => value === '' || value === undefined ? '0' : value
const reserve = z.preprocess(optionalZero, fixed(4, 3).refine(v => v <= 1000000n, { message: 'Cadangan maksimal 100%.', abort: true }))
const rate = fixed(4, 13)
const volume = fixed(6, 13)
export const electricityInput = z.object({ power: fixed(), hours: fixed().refine(v => v <= 24n * SIX, { message: 'Jam per hari harus 0–24.', abort: true }), days: integer(366n, 3), quantity: integer(10000n, 5), tariff: rate })
const tier = z.discriminatedUnion('limit', [
  z.object({ limit: z.literal('bounded'), upper: fixed(6, 13, true), rate }),
  z.object({ limit: z.literal('unbounded'), rate }),
])
export const waterInput = z.object({ usage: volume, fixed: z.preprocess(optionalZero, money), tiers: z.array(tier).min(2, 'Minimal dua blok tarif.').max(8, 'Maksimal delapan blok tarif.') }).superRefine((v, ctx) => {
  if (v.tiers.length < 2 || v.tiers.length > 8) return
  let previous = 0n
  v.tiers.forEach((t, i) => {
    if (t.limit === 'unbounded') {
      if (i !== v.tiers.length - 1) ctx.addIssue({ code: 'custom', path: ['tiers', i, 'limit'], message: 'Blok tanpa batas hanya boleh menjadi baris terakhir.' })
    } else {
      if (t.upper <= previous) ctx.addIssue({ code: 'custom', path: ['tiers', i, 'upper'], message: 'Batas kumulatif harus lebih besar dari batas blok sebelumnya.' })
      previous = t.upper
    }
  })
  const last = v.tiers[v.tiers.length - 1]
  if (last.limit === 'bounded' && v.usage > last.upper) ctx.addIssue({ code: 'custom', path: ['usage'], message: 'Volume melewati cakupan blok terakhir. Tambahkan blok terakhir tanpa batas atau perluas batas.' })
})
export const paintInput = z.object({ gross: fixed(), openings: fixed(), coats: integer(100n, 3), coverage: fixed(6, 6, true), reserve, package: fixed(6, 6, true) }).refine(v => v.openings <= v.gross, { path: ['openings'], message: 'Luas bukaan tidak boleh melebihi luas kotor.' })
export const tilesInput = z.object({ area: fixed(), length: fixed(6, 4, true), width: fixed(6, 4, true), perBox: integer(10000n, 5), reserve })
const dimension = fixed(6, 4, true), count = integer(10000n, 5)
const element = z.discriminatedUnion('shape', [
  z.object({ shape: z.literal('prism'), length: dimension, width: dimension, height: dimension, count }),
  z.object({ shape: z.literal('cylinder'), diameter: dimension, height: dimension, count }),
])
export const concreteInput = z.object({ reserve, elements: z.array(element).min(1, 'Minimal satu elemen.').max(20, 'Maksimal 20 elemen.') })
export const PI_NUMERATOR = 314159265358979323846264338327950288419716939937510n
export const PI_DENOMINATOR = 10n ** 50n
export const PI = fraction(PI_NUMERATOR, PI_DENOMINATOR)
export type WaterRow = { lower: bigint; upper: bigint | null; rate: bigint; volume: bigint; cost: bigint }
export type ConcreteRow = { shape: 'prism' | 'cylinder'; count: bigint; volume: bigint; tiny: boolean; exact: Rational }
export type MaterialsOutput = {
  values: Record<string, bigint>
  tiny: Record<string, true>
  exact: Record<string, Rational>
  notes: string[]
  tiers?: WaterRow[]
  elements?: ConcreteRow[]
}
export type MaterialsResult = ({ success: true } & MaterialsOutput) | { success: false; errors: Record<string, string[]> }
function calculate<T>(schema: z.ZodType<T>, engine: (v: T) => MaterialsOutput) {
  return (input: unknown): MaterialsResult => {
    const p = schema.safeParse(input)
    if (!p.success) {
      const errors: Record<string, string[]> = {}
      for (const issue of p.error.issues) (errors[issue.path.join('.')] ??= []).push(issue.message)
      return { success: false, errors }
    }
    return { success: true, ...engine(p.data) }
  }
}
function output() {
  const values: Record<string, bigint> = {}, tiny: Record<string, true> = {}, exact: Record<string, Rational> = {}
  const put = (key: string, value: Rational, scale = FOUR) => {
    exact[key] = value; values[key] = round(value, scale)
    if (value.n > 0n && values[key] === 0n) tiny[key] = true
    return values[key]
  }
  return { values, tiny, exact, put, data: { values, tiny, exact } }
}
const withReserve = (value: Rational, percent: bigint) => multiply(value, fraction(SIX + percent, SIX))
export const calculateElectricity = calculate(electricityInput, v => {
  const out = output(), energy = fraction(v.power * v.hours * v.days * v.quantity, 1000n * SIX * SIX)
  out.put('energy', energy); out.put('cost', multiply(energy, fraction(v.tariff, FOUR)), 1n)
  return { ...out.data, notes: ['Daya W adalah per perangkat; jam adalah jam pemakaian per hari. Energi dan biaya dihitung dari pecahan asli, bukan kWh tampilan.', 'Tarif Rp/kWh diisi manual. Daya nominal/rata-rata, duty cycle dan meter aktual dapat berbeda. Tidak menambahkan pajak, admin, minimum tagihan, konversi VA atau efisiensi otomatis.'] }
})
export const calculateWater = calculate(waterInput, v => {
  const out = output(); let previous = 0n, variable = 0n
  const rows = v.tiers.map(t => {
    const available = v.usage > previous ? v.usage - previous : 0n
    const charged = t.limit === 'unbounded' ? available : available < t.upper - previous ? available : t.upper - previous
    const cost = charged * t.rate
    const row = { lower: previous, upper: t.limit === 'bounded' ? t.upper : null, rate: t.rate, volume: charged, cost }
    if (t.limit === 'bounded') previous = t.upper
    variable += cost
    return row
  })
  out.put('bill', fraction(variable + v.fixed * 10n ** 10n, 10n ** 10n), 1n)
  return { ...out.data, values: { ...out.values, usage: v.usage, variable, fixed: v.fixed, totalExact: variable + v.fixed * 10n ** 10n }, tiers: rows,
    notes: ['Volume dialokasikan progresif: hanya konsumsi dalam tiap blok yang memakai tarifnya. Biaya tetap ditambahkan sekali, lalu total dibulatkan ke rupiah.', 'Volume, tarif dan biaya blok ditampilkan eksak hingga enam, empat dan sepuluh desimal. Jumlah biaya blok = biaya variabel sebelum pembulatan. Tidak ada tarif PDAM/PAM, pajak atau kebijakan wilayah otomatis.'] }
})
export const calculatePaint = calculate(paintInput, v => {
  const out = output(), net = v.gross - v.openings, theory = fraction(net * v.coats, v.coverage)
  const required = withReserve(theory, v.reserve), packages = ceiling(divide(required, fraction(v.package, SIX)))
  const purchased = fraction(packages * v.package, SIX)
  out.put('theory', theory); out.put('required', required); out.put('leftover', subtract(purchased, required))
  return { ...out.data, values: { ...out.values, net, packages, purchased: packages * v.package }, notes: ['Satu produk dengan daya sebar yang sama pada semua lapisan. Bukaan dikurangi lebih dulu, lalu lapisan dan cadangan diterapkan.', 'Jumlah kemasan adalah ceiling dari liter eksak sebelum pembulatan tampilan. Pembelian dikurangi kebutuhan bercadangan memberi sisa model. Daya sebar/ukuran kemasan adalah asumsi Anda; kondisi permukaan dan teknik pengecatan dapat berbeda.'] }
})
export const calculateTiles = calculate(tilesInput, v => {
  const out = output(), tileArea = fraction(v.length * v.width, SIX * SIX * 10000n)
  const quota = withReserve(divide(fraction(v.area, SIX), tileArea), v.reserve), required = ceiling(quota), boxes = ceiling(fraction(required, v.perBox)), purchased = boxes * v.perBox
  out.put('tileArea', tileArea); out.put('purchaseArea', multiply(tileArea, fraction(purchased))); out.put('quota', quota)
  return { ...out.data, values: { ...out.values, required, boxes, purchased, surplus: purchased - required }, notes: ['Luas lantai m² diisi langsung. Dimensi ubin dalam cm; luas ubin = panjang × lebar ÷ 10.000 m². Ubin tidak harus persegi.', 'Bulatkan kebutuhan ubin ke atas dari rasio asli, kemudian bulatkan dus ke atas dari jumlah ubin utuh. Surplus dihitung terhadap kebutuhan ubin bercadangan. Cadangan bukan pengoptimal pola, arah, nat atau bentuk ruangan.'] }
})
export const calculateConcrete = calculate(concreteInput, v => {
  const out = output(); let base = fraction(0n)
  const rows = v.elements.map(e => {
    const volume = e.shape === 'prism'
      ? fraction(e.length * e.width * e.height * e.count, SIX ** 3n)
      : multiply(PI, fraction(e.diameter * e.diameter * e.height * e.count, 4n * SIX ** 3n))
    base = add(base, volume)
    const display = round(volume, FOUR)
    return { shape: e.shape, count: e.count, volume: display, tiny: display === 0n && volume.n > 0n, exact: volume }
  })
  const total = withReserve(base, v.reserve)
  out.put('base', base); out.put('reserve', subtract(total, base)); out.put('total', total)
  return { ...out.data, elements: rows, notes: ['Semua volume baris dijumlah dari pecahan asli, lalu cadangan diterapkan. Jumlah volume baris tampilan bisa berbeda dari total karena pembulatan empat desimal.',
    ...(v.elements.some(e => e.shape === 'cylinder') ? ['Silinder memakai diameter dan pendekatan π rasional 50 desimal, bukan π eksak. Galat konstanta pada total dalam batas input <10⁻³³ m³ sebelum pembulatan.'] : []),
    'Estimasi volume bruto, tanpa desain campuran, konversi sak, kapasitas truk atau minimum pembelian. Pengukuran dan kondisi lokasi harus dinilai terpisah; hasil bukan penilaian kecukupan struktur.'] }
})
