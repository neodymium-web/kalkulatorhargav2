import type { BatchField } from '../batch-four/tools'
import type { StructuredTool } from '../../components/ui/structured-form'
import { calculateElectricity, calculateWater, calculatePaint, calculateTiles, calculateConcrete, type MaterialsResult } from './engines'
import type { MaterialsSourceId } from './sources'
export type MaterialsTool = StructuredTool & {
  title: string; description: string; keywords: readonly string[]
  outputFields: readonly { id: string; label: string; unit: string; type: 'integer' | 'decimal' }[]
  engine: (input: unknown) => MaterialsResult
  formula: string; example: string; assumptions: string; rounding: string
  sources: readonly MaterialsSourceId[]; faq: readonly { question: string; answer: string }[]; testCase: string
}
const decimal = (id: string, label: string): BatchField => ({ id, label, type: 'decimal' })
const integer = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const output = (id: string, label: string, unit: string) => ({ id, label, unit, type: ['cash', 'packages', 'tiles', 'boxes'].includes(unit) ? 'integer' as const : 'decimal' as const })
const reserve = decimal('reserve', 'Cadangan (%, 0–100; kosong = 0)')
const dimensionsHint = 'Luas/daya/coverage/kemasan maksimal 6 digit bulat dan 6 desimal. Dimensi ubin/beton maksimal 4 digit bulat dan 6 desimal. Koma atau titik desimal, tanpa pemisah ribuan.'
export const materialsTools = {
  'biaya-listrik': {
    title: 'Kalkulator Biaya Listrik', description: 'Simulasikan energi kWh dan biaya perangkat dari watt per unit, jam per hari, jumlah hari serta tarif Rp/kWh manual.', keywords: ['biaya listrik', 'watt kwh', 'energi perangkat', 'tarif listrik manual'],
    inputFields: [decimal('power', 'Daya per perangkat (W)'), decimal('hours', 'Jam pemakaian per hari (0–24)'), integer('days', 'Jumlah hari (1–366)'), integer('quantity', 'Jumlah perangkat (1–10000)'), decimal('tariff', 'Tarif manual (Rp/kWh, maksimal 4 desimal)')],
    outputFields: [output('cost', 'Estimasi biaya energi', 'cash'), output('energy', 'Estimasi energi seluruh perangkat', 'kWh')], engine: calculateElectricity,
    hint: `${dimensionsHint} Jam hingga 6 desimal. Tarif hingga 13 digit bulat dan 4 desimal. Daya/jam/tarif nol boleh; hari dan jumlah wajib positif.`,
    formula: 'Energi kWh = daya W per perangkat × jam per hari × hari × jumlah perangkat ÷ 1.000. Estimasi biaya = energi eksak × tarif Rp/kWh. Watt adalah daya; kWh adalah energi selama pemakaian.',
    example: '300 W × 8 jam/hari × 30 hari × 1 perangkat = 72 kWh. Dengan tarif asumsi Rp1.700/kWh, biayanya Rp122.400. 100 W × 2 jam/hari × 30 hari × 3 perangkat = 18 kWh, atau Rp27.000 pada tarif Rp1.500/kWh. 1 W selama 1 jam memakai 0,001 kWh.',
    assumptions: 'Daya diisi per perangkat dan dianggap konstan selama jam operasi. Daya label dapat berbeda dari rata-rata atau duty cycle dan meter aktual. Tidak ada tarif PLN terkini, pajak, admin, minimum tagihan, konversi VA atau efisiensi otomatis. Nol daya/jam memberi nol energi dan biaya; tarif nol hanya menolkan biaya.',
    rounding: 'Energi tampil empat desimal kWh. Biaya rupiah utuh dibulatkan setengah ke atas sekali dari energi eksak, bukan kWh tampilan. Nilai positif subpresisi diberi catatan; cash yang membulat nol tetap Rp0 dengan nilai positif di bawah Rp0,50 sebelum pembulatan.',
    sources: ['energy', 'units'], faq: [{ question: 'Apakah tarifnya otomatis mengikuti PLN?', answer: 'Tidak. Isi tarif Rp per kWh yang ingin Anda simulasikan. Hasil hanya biaya energi, belum biaya lain pada tagihan.' }], testCase: 'electricity converts per-device daily watt hours and rounds original energy cost',
  },
  'biaya-air': {
    title: 'Kalkulator Biaya Air Progresif', description: 'Alokasikan pemakaian m³ ke blok tarif kumulatif manual, lalu tambahkan biaya tetap sekali dan bulatkan tagihan akhir.', keywords: ['biaya air', 'tarif air progresif', 'blok air', 'pdam manual'],
    inputFields: [decimal('usage', 'Total pemakaian air (m³)'), { ...integer('fixed', 'Biaya tetap (kosong = 0)'), unit: 'IDR' }], rows: 'tiers', rowConfig: { name: 'blok', label: 'Blok tarif', min: 2, max: 8 },
    rowFields: [{ id: 'limit', label: 'Jenis batas blok', type: 'choice', options: [{ value: 'bounded', label: 'Batas atas kumulatif' }, { value: 'unbounded', label: 'Tanpa batas (hanya blok terakhir)' }] },
      { ...decimal('upper', 'Batas atas kumulatif (m³, bukan lebar blok)'), visibleWhen: { field: 'limit', value: 'bounded' } }, decimal('rate', 'Tarif blok (Rp/m³)')],
    outputFields: [output('bill', 'Estimasi tagihan setelah pembulatan', 'cash'), output('usage', 'Volume yang teralokasi', 'volume6'), output('variable', 'Biaya pemakaian sebelum pembulatan', 'money10'), output('fixed', 'Biaya tetap ditambahkan sekali', 'cash'), output('totalExact', 'Total sebelum pembulatan rupiah', 'money10')], engine: calculateWater,
    hint: 'Volume dan batas: hingga 13 digit bulat dan 6 desimal m³; tarif hingga 13 digit bulat dan 4 desimal Rp/m³. Biaya tetap rupiah utuh hingga 13 digit. Isi 2–8 blok dengan batas kumulatif naik ketat. Tanpa batas hanya di baris terakhir; tanpa blok itu, volume harus tercakup batas akhir. Kolom batas tidak aktif dihapus ketika pilihan berubah.',
    formula: 'Setiap blok menagih bagian volume di antara batas sebelumnya dan batas atasnya. Blok pertama mulai dari nol. Biaya variabel = jumlah volume blok × tarif masing-masing. Total = biaya variabel + biaya tetap; total akhir baru dibulatkan ke rupiah.',
    example: 'Contoh manual: batas 10 m³ dan 20 m³, lalu blok tanpa batas; tarif Rp3.000, Rp5.000 dan Rp7.000 per m³, biaya tetap Rp10.000. Pemakaian 18 m³ terbagi 10 + 8 + 0 m³: Rp30.000 + Rp40.000 + Rp10.000 = Rp80.000. Pada 25 m³, porsi 10 + 10 + 5 m³ memberi total Rp125.000. Pada 10,001 m³, hanya 0,001 m³ masuk blok kedua.',
    assumptions: 'Ini tarif progresif marginal buatan pengguna, bukan tarif regional PDAM/PAM. Tarif boleh nol dan tidak harus naik. Volume nol memberi biaya tetap saja. Batas nol, duplikat/menurun dan konsumsi di luar cakupan ditolak. Mengganti blok ke tanpa batas menghapus input batas yang tidak aktif; tarif tetap dipertahankan.',
    rounding: 'Volume enam desimal × tarif empat desimal memberi biaya blok eksak hingga sepuluh desimal rupiah. Tabel menampilkan biaya tersebut tanpa pembulatan ke rupiah. Jumlah biaya blok sama dengan biaya variabel eksak. Biaya tetap ditambahkan sekali, kemudian seluruh tagihan dibulatkan setengah ke atas. Jangan menjumlah biaya tiap blok yang dibulatkan sendiri.',
    sources: ['units'], faq: [{ question: 'Apakah seluruh volume memakai tarif blok tertinggi?', answer: 'Tidak. Hanya porsi yang melewati batas sebelumnya masuk tarif blok berikutnya. Contoh 18 m³ dengan batas pertama 10 m³ mengisi 10 m³ di blok pertama dan 8 m³ di blok kedua.' }], testCase: 'water allocates marginal tiers exactly and rounds only the final total',
  },
  'kebutuhan-cat': {
    title: 'Kalkulator Kebutuhan Cat', description: 'Hitung liter cat, cadangan dan kemasan utuh dari luas bersih, lapisan serta daya sebar asumsi produk.', keywords: ['kebutuhan cat', 'liter cat', 'kemasan cat', 'daya sebar cat'],
    inputFields: [decimal('gross', 'Luas permukaan kotor (m²)'), decimal('openings', 'Luas bukaan yang dikurangi (m²)'), integer('coats', 'Jumlah lapisan (1–100)'), decimal('coverage', 'Daya sebar per lapis (m²/L)'), reserve, decimal('package', 'Isi per kemasan (L)')],
    outputFields: [output('packages', 'Kemasan utuh yang dibutuhkan', 'packages'), output('net', 'Luas bersih setelah bukaan', 'area6'), output('theory', 'Liter teori sebelum cadangan', 'liters'), output('required', 'Liter kebutuhan termasuk cadangan', 'liters'), output('purchased', 'Total liter dalam kemasan pembelian', 'liters6'), output('leftover', 'Sisa model setelah kebutuhan bercadangan', 'liters')], engine: calculatePaint,
    hint: `${dimensionsHint} Bukaan tidak boleh melebihi luas kotor. Daya sebar dan isi kemasan harus positif. Cadangan hingga 4 desimal persen, 0–100%.`,
    formula: 'Luas bersih = luas kotor − bukaan. Liter teori = luas bersih × lapisan ÷ daya sebar per lapis. Kebutuhan = teori × (1 + cadangan/100). Kemasan = pembulatan ke atas kebutuhan eksak ÷ isi kemasan. Liter pembelian = kemasan × isi; sisa = pembelian − kebutuhan.',
    example: 'Luas 40 m² dikurangi bukaan 5 m², 2 lapis dengan daya sebar 10 m²/L memberi teori 7 L. Cadangan 10% memberi 7,7 L. Kemasan 5 L membutuhkan 2 kemasan, total 10 L dan sisa model 2,3 L. Luas 25 m², 1 lapis, daya sebar 10 m²/L, tanpa cadangan, kemasan 2,5 L membutuhkan tepat 1 kemasan.',
    assumptions: 'Satu produk dengan daya sebar sama di semua lapisan. Daya sebar dan kemasan diisi berdasarkan asumsi atau spesifikasi produk Anda; bukan angka universal. Kondisi permukaan, aplikasi dan kehilangan aktual dapat berbeda. Luas bersih nol memberi nol kemasan. Tidak menghitung harga atau waktu pengeringan.',
    rounding: 'Ceiling kemasan berasal dari liter eksak sebelum tampilan empat desimal. Kebutuhan 10,000001 L pada kemasan 5 L tetap memerlukan 3 kemasan walaupun tampil 10,0000 L. Luas bersih dan liter pembelian tampil enam desimal eksak; teori/kebutuhan/sisa empat desimal, bukan dasar ceiling.',
    sources: ['units'], faq: [{ question: 'Mengapa jumlah kemasan bisa naik saat liter tampilan terlihat tepat kelipatan?', answer: 'Kebutuhan eksak bisa sedikit melebihi kelipatan kemasan tetapi tertutup pembulatan tampilan. Pembelian memakai kebutuhan sebelum pembulatan agar tidak kekurangan karena tampilan.' }], testCase: 'paint package ceiling uses exact reserve-adjusted liters and reconciles leftovers',
  },
  'kebutuhan-keramik': {
    title: 'Kalkulator Kebutuhan Keramik', description: 'Hitung ubin dan dus utuh dari luas lantai, dimensi ubin cm, isi dus dan cadangan potong/pecah.', keywords: ['kebutuhan keramik', 'jumlah dus keramik', 'ubin per dus', 'cadangan keramik'],
    inputFields: [decimal('area', 'Luas lantai (m², diisi langsung)'), decimal('length', 'Panjang ubin (cm)'), decimal('width', 'Lebar ubin (cm)'), integer('perBox', 'Isi per dus (ubin, 1–10000)'), reserve],
    outputFields: [output('boxes', 'Dus utuh yang dibutuhkan', 'boxes'), output('required', 'Kebutuhan ubin setelah ceiling dan cadangan', 'tiles'), output('purchased', 'Jumlah ubin dalam pembelian', 'tiles'), output('surplus', 'Surplus terhadap kebutuhan ubin', 'tiles'), output('tileArea', 'Luas satu ubin (tampilan)', 'area'), output('purchaseArea', 'Luas seluruh ubin pembelian', 'area'), output('quota', 'Kuota ubin sebelum ceiling (tampilan)', 'quota')], engine: calculateTiles,
    hint: `${dimensionsHint} Luas lantai boleh nol. Panjang/lebar ubin dan isi dus harus positif. Cadangan 0–100%, hingga 4 desimal persen.`,
    formula: 'Luas ubin m² = panjang cm × lebar cm ÷ 10.000. Kuota = luas lantai ÷ luas ubin × (1 + cadangan/100). Kebutuhan ubin = kuota dibulatkan ke atas. Dus = kebutuhan ubin utuh ÷ isi dus, dibulatkan ke atas. Pembelian = dus × isi; surplus = pembelian − kebutuhan ubin.',
    example: '12 m² dengan ubin 40 × 40 cm (0,16 m²), cadangan 10% dan isi 6 ubin/dus memberi kuota 82,5, kebutuhan 83 ubin, 14 dus, 84 ubin dibeli, surplus 1 dan luas pembelian 13,44 m². Pada 10 m², ubin 50 × 50 cm, cadangan nol dan isi 4, hasilnya 40 ubin atau 10 dus.',
    assumptions: 'Mode luas lantai langsung, bukan panjang×lebar ruang. Ubin boleh persegi panjang. Cadangan perkiraan potong/pecah, bukan pengoptimal tata letak; pola, arah, nat dan ruang tak beraturan bisa mengubah kebutuhan. Luas nol memberi nol ubin/dus; tidak menghitung harga.',
    rounding: 'Dua ceiling memakai rasio eksak: kebutuhan ubin dahulu, lalu dus. Tidak membulatkan luas ubin, lantai atau kuota tampilan sebelum ceiling. Luas/kuota tampil empat desimal dengan penanda positif kecil. Surplus dihitung terhadap kebutuhan ubin yang sudah mencakup cadangan.',
    sources: ['geometry', 'units'], faq: [{ question: 'Apakah ubin harus persegi?', answer: 'Tidak. Masukkan panjang dan lebar sebenarnya dalam cm. Misalnya 30 × 50 cm memiliki luas 0,15 m², berbeda dari ubin 30 × 30 cm.' }], testCase: 'tiles use exact area then per-tile and per-box ceilings',
  },
  'volume-beton': {
    title: 'Kalkulator Volume Beton', description: 'Jumlahkan volume balok dan silinder dari beberapa elemen, lalu tambahkan cadangan tanpa menjumlah angka baris yang dibulatkan.', keywords: ['volume beton', 'volume balok', 'volume silinder', 'kebutuhan beton m3'],
    inputFields: [reserve], rows: 'elements', rowConfig: { name: 'elemen', label: 'Elemen beton', max: 20 },
    rowFields: [{ id: 'shape', label: 'Bentuk elemen', type: 'choice', options: [{ value: 'prism', label: 'Balok / pelat persegi panjang' }, { value: 'cylinder', label: 'Silinder (diameter)' }] },
      { ...decimal('length', 'Panjang balok (m)'), visibleWhen: { field: 'shape', value: 'prism' } }, { ...decimal('width', 'Lebar balok (m)'), visibleWhen: { field: 'shape', value: 'prism' } },
      { ...decimal('diameter', 'Diameter silinder (m, bukan radius)'), visibleWhen: { field: 'shape', value: 'cylinder' } }, decimal('height', 'Tinggi / tebal elemen (m)'), integer('count', 'Jumlah elemen serupa (1–10000)')],
    outputFields: [output('total', 'Estimasi volume termasuk cadangan', 'volume'), output('base', 'Volume dasar semua elemen', 'volume'), output('reserve', 'Volume tambahan cadangan', 'volume')], engine: calculateConcrete,
    hint: `${dimensionsHint} Isi 1–20 baris. Semua dimensi/jumlah positif. Cadangan 0–100% hingga 4 desimal. Mengganti bentuk menghapus dimensi yang tidak aktif; tinggi dan jumlah tetap dipertahankan.`,
    formula: 'Balok: panjang × lebar × tinggi/tebal × jumlah. Silinder: pendekatan π × diameter² × tinggi × jumlah ÷ 4. Volume dasar = jumlah volume baris eksak menurut model. Total = dasar × (1 + cadangan/100). Cadangan = total − dasar.',
    example: 'Satu baris berisi 2 pelat 2 × 3 × 0,1 m menghasilkan 1,2 m³. Tambah satu kubus 1 × 1 × 1 m memberi dasar 2,2 m³; cadangan 10% menambah 0,22 m³ sehingga total 2,42 m³. Silinder berdiameter 1 m dan tinggi 1 m, jumlah 1 tanpa cadangan, memiliki volume sekitar 0,785398 m³, tampil 0,7854 m³.',
    assumptions: 'Silinder memakai diameter, bukan radius. Pendekatan π adalah 3,14159265358979323846264338327950288419716939937510, konstanta rasional 50 desimal dari Wolfram. Galat konstanta pada total dalam batas input kurang dari 10⁻³³ m³ sebelum pembulatan. Ini bukan klaim π eksak. Estimasi bruto tidak menetapkan campuran, jumlah sak, kapasitas truk, minimum order atau kecukupan struktur; pengukuran dan kondisi lokasi tetap perlu dinilai.',
    rounding: 'Jumlahkan pecahan volume baris sebelum menambah cadangan dan membulatkan. Volume baris, dasar, tambahan dan total tampil empat desimal m³, setengah ke atas. Jumlah tampilan baris dapat berbeda dari total. Volume positif yang membulat nol tetap ditandai; tidak ada ceiling pembelian atau kelipatan truk.',
    sources: ['geometry', 'pi', 'units'], faq: [{ question: 'Mengapa penjumlahan angka baris tampilan bisa berbeda dari total?', answer: 'Setiap angka baris hanya tampilan empat desimal. Total menjumlah volume sebelum pembulatan, sehingga tidak menumpuk selisih pembulatan per baris.' }], testCase: 'concrete accumulates original prism and rational-pi cylinder volumes',
  },
} satisfies Record<string, MaterialsTool>
export type MaterialsSlug = keyof typeof materialsTools
