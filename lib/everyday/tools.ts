import type { BatchField } from '../batch-four/tools'
import type { StructuredTool } from '../../components/ui/structured-form'
import { calculateDiscount, calculateUnitPrice, calculateBill, calculatePortion, calculateRatioPercent, calculatePercent, calculatePercentChange, type EverydayResult } from './engines'
import type { EverydaySourceId } from './sources'
export type EverydayTool = StructuredTool & {
  title: string; description: string; keywords: readonly string[]
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: string }[]
  engine: (input: unknown) => EverydayResult
  formula: string; example: string; assumptions: string; rounding: string
  sources: readonly EverydaySourceId[]; faq: readonly { question: string; answer: string }[]; testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const decimal = (id: string, label: string, signed = false): BatchField => ({ id, label, type: 'decimal', signed })
const out = (id: string, label: string, unit = 'IDR') => ({ id, label, unit, type: unit === 'IDR' ? 'integer' as const : 'decimal' as const })
const moneyHint = 'Nominal rupiah utuh nonnegatif hingga 13 digit, tanpa pemisah ribuan. Semua harga, subtotal dan biaya diisi manual.'
export const percentModes = {
  portion: {
    title: 'X% dari N', description: 'Kalikan persen yang dipilih dengan satu bilangan.', keywords: [],
    inputFields: [decimal('value', 'Bilangan N (bertanda, maksimal 6 desimal)', true), decimal('percent', 'Persen X (bertanda, maksimal 4 desimal)', true)],
    outputFields: [out('result', 'Hasil X% dari N', 'number4')], engine: calculatePortion,
    hint: 'N menerima tanda minus, maksimal 13 digit bulat dan 6 desimal. X persen maksimal 9 digit bulat dan 4 desimal; boleh negatif atau di atas 100%. Koma atau titik sebagai desimal, tanpa pemisah ribuan.',
    formula: 'Hasil = N × X ÷ 100. Tanda negatif mengikuti perkalian biasa. Ini persen aritmetika umum, bukan diskon toko.',
    example: '15% dari 200 = 30,0000. 12,5% dari 40 = 5,0000. 15% dari −200 = −30,0000. 0,5% dari 0,01 = 0,00005, ditampilkan 0,0001.',
    rounding: 'Hasil empat desimal dibulatkan sekali dari pecahan eksak, nilai tengah menjauh dari nol. Nilai positif/negatif yang membulat nol tetap disebutkan arahnya.',
    assumptions: 'N dan X merupakan bilangan umum. Tidak ada batas 100% atau penafsiran harga/keuangan otomatis. Input kosong, eksponen dan nonfinite ditolak.',
    sources: ['percent'], faq: [{ question: 'Bolehkah persen lebih dari 100%?', answer: 'Boleh pada operasi umum ini. Misalnya 150% berarti 1,5 kali bilangan. Batas diskon toko dibahas terpisah di Kalkulator Diskon.' }], testCase: 'percent portion handles signed fixed-point products and four-decimal ties',
  },
  ratio: {
    title: 'A berapa persen dari B', description: 'Bandingkan dua bilangan dengan basis pembagi nonnol.', keywords: [],
    inputFields: [decimal('part', 'Bagian A (bertanda, maksimal 6 desimal)', true), decimal('whole', 'Basis B (bertanda dan tidak nol)', true)],
    outputFields: [out('result', 'A sebagai persen dari B', 'pct4')], engine: calculateRatioPercent,
    hint: 'A dan B menerima tanda minus, maksimal 13 digit bulat dan 6 desimal. B wajib tidak nol. Tanda mengikuti pembagian biasa; koma/titik untuk desimal.',
    formula: 'Persen = A ÷ B × 100%. Basis B boleh negatif pada aritmetika umum tetapi tidak boleh nol. Ini berbeda dari perubahan persen terhadap nilai awal nonnegatif.',
    example: '3 dari 8 = 37,5000%; 0 dari 8 = 0,0000%; −3 dari 8 = −37,5000%. −3 dari −8 = 37,5000%. 0 dari 0 ditolak karena pembagi nol.',
    rounding: 'Persen empat desimal dibulatkan sekali dari pecahan eksak dengan nilai tengah menjauh dari nol. Nilai kecil tidak disamakan dengan nol eksak.',
    assumptions: 'Basis negatif memakai tanda matematika biasa, bukan interpretasi kenaikan/penurunan finansial. Gunakan Perubahan Persen untuk perbandingan nilai awal dan akhir.',
    sources: ['percent'], faq: [{ question: 'Mengapa 0 dari 0 tidak menjadi 0%?', answer: 'Pembagian dengan nol tidak terdefinisi, termasuk 0 dibagi 0. Gunakan basis bukan nol.' }], testCase: 'percent ratio normalizes signed denominators and rejects zero',
  },
} satisfies Record<string, EverydayTool>
export const everydayTools = {
  diskon: {
    title: 'Kalkulator Diskon Bertahap', description: 'Hitung harga setelah satu atau beberapa diskon persentase, dengan pembulatan cash sekali di akhir.', keywords: ['diskon', 'diskon bertahap', 'potongan harga', 'diskon berurutan'],
    inputFields: [money('original', 'Harga awal sebelum diskon')], rows: 'discounts', rowFields: [decimal('rate', 'Diskon tahap ini (%, 0–100; maksimal 4 desimal)')], rowConfig: { name: 'tahap', label: 'Tahap', max: 20 },
    outputFields: [out('final', 'Harga cash akhir'), out('saved', 'Penghematan kas'), out('original', 'Harga awal'), out('modelPercent', 'Potongan model dari faktor eksak', 'pct2'), out('cashPercent', 'Potongan kas terhadap harga awal', 'pct2')],
    engine: calculateDiscount, hint: `${moneyHint} Isi 1–20 diskon berurutan, masing-masing 0–100% hingga empat desimal persen. Tidak ada voucher, pajak atau minimum belanja otomatis.`,
    formula: 'Faktor sisa kumulatif = hasil kali (1−diskon tiap tahap). Harga model = harga awal × faktor. Harga cash = harga model dibulatkan sekali ke rupiah. Penghematan kas = harga awal − cash. Potongan model = (1−faktor) × 100%; potongan kas = penghematan/harga awal × 100%, jika harga awal positif.',
    example: 'Rp100.000 dipotong 10% lalu 20% menjadi Rp72.000; penghematan Rp28.000 dan potongan model 28%, bukan 30%. Rp1 dipotong 50% mempunyai model Rp0,50 tetapi cash membulat Rp1: penghematan kas Rp0 walaupun potongan model 50%.',
    rounding: 'Cash dibulatkan setengah ke atas ke rupiah sekali sesudah seluruh tahap. Harga model tahap tampil dua desimal rupiah dan faktor enam desimal hanya untuk dibaca; angka tampilan tidak dipakai kembali. Model dan penghematan kas dapat berbeda akibat pembulatan.',
    assumptions: 'Potongan model ditentukan faktor dan tetap tersedia pada harga awal nol. Potongan kas tidak terdefinisi jika harga awal nol. Satu diskon 100% menghasilkan harga nol; 0% sah. Kebijakan toko yang membulatkan setiap tahap atau memakai kupon nominal tidak dimodelkan.',
    sources: ['discount', 'percent'], faq: [{ question: 'Mengapa diskon 10% dan 20% bukan 30%?', answer: 'Diskon kedua diterapkan pada sisa harga setelah diskon pertama. Faktor 0,9 × 0,8 = 0,72, sehingga potongan model 28%.' }], testCase: 'sequential discount keeps exact factors and rounds cash only once',
  },
  'harga-per-satuan': {
    title: 'Kalkulator Harga per Satuan', description: 'Bandingkan kemasan pada satuan massa, volume atau pcs yang sama, berdasarkan harga satuan eksak.', keywords: ['harga per satuan', 'harga per kg', 'harga per liter', 'kemasan lebih murah'],
    inputFields: [], rows: 'packages', rowConfig: { name: 'kemasan', label: 'Kemasan', min: 2, max: 10 },
    rowFields: [money('price', 'Harga kemasan'), decimal('quantity', 'Ukuran kemasan (maksimal 3 desimal)'), { id: 'unit', label: 'Satuan kemasan', type: 'choice', options: ['mg', 'g', 'kg', 'mL', 'L', 'pcs'].map(unit => ({ value: unit, label: unit })) }],
    outputFields: [out('minimum', 'Harga satuan minimum', 'cents'), out('maximum', 'Harga satuan tertinggi', 'cents'), out('saving', 'Penghematan terbaik terhadap harga satuan tertinggi', 'pct2')],
    engine: calculateUnitPrice, hint: `${moneyHint} Isi 2–10 kemasan dengan ukuran positif hingga 13 digit bulat dan 3 desimal. Semua satu keluarga: mg/g/kg, mL/L atau pcs. Pcs pecahan boleh bila relevan dengan ukuran barang.`,
    formula: 'Harga satuan = harga kemasan ÷ ukuran yang dinormalisasi ke kg, L atau pcs. 1 kg = 1.000 g = 1.000.000 mg; 1 L = 1.000 mL. Kemasan termurah memakai perbandingan pecahan eksak. Penghematan relatif = (harga satuan tertinggi − harga satuan kemasan) ÷ harga satuan tertinggi × 100%.',
    example: 'Rp12.000/500 g = Rp24.000/kg, sedangkan Rp22.000/1 kg = Rp22.000/kg. Kemasan kedua lebih murah 8,33% terhadap harga satuan tertinggi. Rp5.000/250 mL = Rp20.000/L dan Rp8.000/500 mL = Rp16.000/L, selisih relatif 20%.',
    rounding: 'Harga satuan tampil dua desimal rupiah; ranking dan penghematan dihitung dari pecahan asli. Harga tampilan yang sama dapat menyembunyikan selisih eksak dan diberi catatan. Jika tie eksak, semua kemasan minimum ditampilkan. Nilai positif di bawah Rp0,01 tetap ditandai.',
    assumptions: 'Tidak ada perbandingan massa dengan volume atau asumsi densitas. Harga nol valid; jika semua unit price nol, persen penghematan tidak terdefinisi. Harga satuan lebih murah tidak otomatis berarti kualitas atau ukuran lebih cocok.',
    sources: ['prefixes', 'liter'], faq: [{ question: 'Mengapa dua harga tampilan sama tetapi pemenangnya berbeda?', answer: 'Tampilan hanya dua desimal. Perbandingan memakai rasio sebelum pembulatan, sehingga selisih kecil tetap bisa menentukan biaya satuan yang lebih rendah.' }], testCase: 'unit prices normalize families and compare unrounded cross products',
  },
  'bagi-tagihan': {
    title: 'Kalkulator Bagi Tagihan', description: 'Bagi biaya bersama rata atau proporsional terhadap subtotal item per orang, dengan rekonsiliasi setiap rupiah.', keywords: ['bagi tagihan', 'split bill', 'subtotal per orang', 'pembagian biaya bersama'],
    inputFields: [money('service', 'Biaya service bersama (nominal, bukan persen)'), money('tax', 'Pajak bersama (nominal, bukan persen)'), { id: 'mode', label: 'Cara membagi biaya bersama', type: 'choice', options: [{ value: 'equal', label: 'Rata untuk semua orang' }, { value: 'proportional', label: 'Proporsional subtotal item' }] }],
    rows: 'people', rowConfig: { name: 'orang', label: 'Orang', min: 2, max: 20 }, rowFields: [money('subtotal', 'Subtotal seluruh item milik orang ini')],
    outputFields: [out('grand', 'Total tagihan yang harus dibayar'), out('subtotal', 'Jumlah subtotal item'), out('service', 'Service nominal'), out('tax', 'Pajak nominal'), out('shared', 'Biaya bersama gabungan'), out('allocated', 'Jumlah bagian seluruh orang'), out('difference', 'Selisih rekonsiliasi')],
    engine: calculateBill, hint: `${moneyHint} Satu baris adalah subtotal semua item satu orang, bukan daftar item atau item berbagi. Minimal 2, maksimal 20 orang. Service/pajak nominal dipisah dan tidak dihitung otomatis.`,
    formula: 'Total = jumlah subtotal item + service + pajak. Biaya bersama F = service + pajak. Bobot rata = 1 per orang; proporsional = subtotal masing-masing. Kuota = F × bobot ÷ total bobot. Ambil rupiah floor, lalu bagikan sisa Rp1 menurut pecahan terbesar, tie urutan orang. Bagian akhir = subtotal item + alokasi biaya bersama.',
    example: 'Subtotal Rp10.000, Rp20.000, Rp30.000 dengan service Rp3 dan pajak Rp4: proporsional memberi biaya tambahan Rp1, Rp2, Rp4, sehingga bagian Rp10.001, Rp20.002, Rp30.004, total Rp60.007. Jika biaya bersama Rp10 dibagi rata, tambahannya Rp4, Rp3, Rp3 dan total Rp60.010.',
    rounding: 'Metode largest remainder/Hamilton mempertahankan total rupiah, bukan membulatkan tiap kuota secara terpisah. Sisa dipecahkan menurut urutan Orang 1, 2 dan seterusnya saat seri. Tabel selalu menjumlah tepat ke grand total, tanpa uang hilang atau duplikat.',
    assumptions: 'Mode rata hanya membagi biaya bersama; subtotal orang tetap miliknya. Mengubah urutan pada kuota seri dapat memindahkan alokasi sisa Rp1. Mode proporsional dengan semua subtotal nol dan biaya positif ditolak; bila biaya juga nol, total nol valid. Tidak menghitung ulang tarif pajak pada item tax-inclusive, tidak membagi satu item bersama atau memvalidasi pajak restoran.',
    sources: ['allocation'], faq: [{ question: 'Apakah saya bisa memasukkan item satu per satu?', answer: 'Cakupan ini memakai subtotal seluruh item per orang. Jumlahkan item orang tersebut terlebih dahulu. Satu item bersama perlu dibagi manual ke subtotal sebelum dimasukkan.' }, { question: 'Siapa mendapat sisa satu rupiah?', answer: 'Kuota dengan pecahan terbesar mendapatkannya. Jika pecahannya sama, urutan Orang 1, 2 dan seterusnya menjadi pemecah seri.' }], testCase: 'bill allocations conserve every rupiah with largest remainder and stable ties',
  },
  persen: { ...percentModes.portion, title: 'Kalkulator Persen', description: 'Hitung X% dari N atau A sebagai persen dari B dengan bilangan bertanda dan pembulatan presisi.', keywords: ['persen', 'persentase', 'berapa persen dari', 'bagian dari jumlah'], engine: calculatePercent, testCase: 'percent dispatcher exposes both complete signed arithmetic modes' },
  'perubahan-persen': {
    title: 'Kalkulator Perubahan Persen', description: 'Hitung perubahan nilai awal ke akhir, dengan delta eksak dan persentase naik atau turun terhadap awal.', keywords: ['perubahan persen', 'persen kenaikan', 'persen penurunan', 'selisih relatif'],
    inputFields: [decimal('previous', 'Nilai awal nonnegatif (maksimal 6 desimal)'), decimal('current', 'Nilai akhir nonnegatif (maksimal 6 desimal)')],
    outputFields: [out('percent', 'Perubahan terhadap nilai awal', 'signed-pct4'), out('change', 'Perubahan nilai eksak', 'signed-number6'), out('previous', 'Nilai awal', 'number6'), out('current', 'Nilai akhir', 'number6')],
    engine: calculatePercentChange, hint: 'Nilai awal dan akhir nonnegatif, hingga 13 digit bulat dan 6 desimal. Koma/titik untuk desimal; tidak mendukung baseline negatif.',
    formula: 'Delta = nilai akhir − nilai awal. Jika awal > 0, persen = delta ÷ awal × 100%. Jika awal = 0, persen tidak terdefinisi tetapi delta dan nilai akhir tetap tersedia.',
    example: '100 menjadi 125 memberi delta +25 dan +25,0000%. 100 menjadi 80 memberi −20 dan −20,0000%. Dari 0 ke 100, delta +100 tetapi persen tidak terdefinisi. 100 ke 100 memberi delta dan persen nol.',
    rounding: 'Delta dihitung eksak dari input enam desimal dan ditampilkan tanpa nol desimal berlebih. Persen dibulatkan sekali ke empat desimal, nilai tengah menjauh dari nol; perubahan kecil tetap mempertahankan arah.',
    assumptions: 'Hanya nilai awal/akhir nonnegatif agar arah perubahan biasa tidak ambigu. Hasil dapat melebihi 100% pada kenaikan besar; penurunan sampai nol adalah −100%. Ini angka umum, bukan khusus follower integer atau persen dari dua bilangan bebas.',
    sources: ['percent'], faq: [{ question: 'Mengapa kenaikan dari nol tidak menjadi 100%?', answer: 'Persen perubahan membagi delta dengan nilai awal. Awal nol membuat pembagian tidak terdefinisi, walaupun delta dan nilai akhir bisa dihitung.' }], testCase: 'percent change preserves exact decimal delta and undefined zero baseline',
  },
} satisfies Record<string, EverydayTool>
export type EverydaySlug = keyof typeof everydayTools
