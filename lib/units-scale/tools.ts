import type { BatchField } from '../batch-four/tools'
import { calculateScale, calculateLength, calculateMass, calculateTemperature, calculateSpeed, type UnitsResult } from './engines'
import { lengthUnits, massUnits, temperatureUnits, speedUnits } from './units'
import type { UnitsSourceId } from './sources'
export type UnitsTool = {
  title: string; description: string; keywords: readonly string[]; inputFields: readonly BatchField[]
  engine: (input: unknown) => UnitsResult
  hint: string; formula: string; example: string; assumptions: string; rounding: string
  sources: readonly UnitsSourceId[]; faq: readonly { question: string; answer: string }[]; testCase: string
}
const amount = (label: string, signed = false): BatchField => ({ id: 'value', label, type: 'decimal', signed })
const options = (units: Record<string, { label: string }>) => Object.entries(units).map(([value, u]) => ({ value, label: u.label }))
const choice = (id: string, label: string, values: { value: string; label: string }[]): BatchField => ({ id, label, type: 'choice', options: values })
const pair = (units: Record<string, { label: string }>) => [choice('from', 'Satuan asal', options(units)), choice('to', 'Satuan tujuan', options(units))]
const bounds = 'Angka hingga 13 digit bulat dan 6 desimal; titik atau koma sebagai desimal, tanpa pemisah ribuan. Kosong, eksponen dan nonfinite ditolak.'
const rounding = 'Hasil dan basis tampil enam desimal, dibulatkan setengah menjauh dari nol. Pecahan target eksak ditampilkan terpisah. Nonnol yang membulat nol tetap ditandai arahnya. Konversi balik dari pecahan asli eksak; angka tampilan terbatas tidak dijanjikan lossless dan tidak menambah ketelitian pengukuran.'
export const unitsTools = {
  'skala-denah': {
    title: 'Kalkulator Skala Denah', description: 'Ubah jarak gambar ke jarak nyata atau sebaliknya pada skala linear 1:N, dengan satuan asal dan tujuan eksplisit.', keywords: ['skala denah', 'skala 1 banding', 'jarak gambar nyata', 'ukuran model'],
    inputFields: [choice('mode', 'Arah konversi skala', [{ value: 'drawing-real', label: 'Gambar ke jarak sebenarnya' }, { value: 'real-drawing', label: 'Jarak sebenarnya ke gambar' }]), amount('Jarak asal (nonnegatif)'), { id: 'scale', label: 'Penyebut N pada skala 1:N (1–1000000000)', type: 'integer' }, ...pair({ mm: lengthUnits.mm, cm: lengthUnits.cm, m: lengthUnits.m, km: lengthUnits.km })], engine: calculateScale,
    hint: `${bounds} N integer positif maksimal 1 miliar. Mengganti arah menghapus data form selain pilihan arah. Tukar satuan hanya menukar asal/tujuan, nilai dan N tetap; hasil lama dibersihkan.`,
    formula: 'Normalisasi jarak asal ke meter. Gambar ke nyata: kalikan N. Nyata ke gambar: bagi N. Kemudian ubah meter ke satuan tujuan. Skala 1:N adalah rasio panjang gambar terhadap panjang nyata pada satuan yang sama.',
    example: '1 cm pada gambar berskala 1:100 berarti 100 cm atau 1 m nyata. Sebaliknya 2,5 m nyata pada skala 1:50 menjadi 5 cm pada gambar. Skala 1:1 dan satuan sama mempertahankan jarak; jarak nol tetap nol.',
    assumptions: 'Hanya ukuran linear, bukan luas atau volume. Cetakan atau render harus memiliki ukuran fisik sesuai skala; memperbesar gambar dapat mengubah skala fisiknya. Tidak mengoreksi distorsi proyeksi peta atau menjamin ketelitian pengukuran.',
    rounding, sources: ['si', 'prefixes'], faq: [{ question: 'Apakah skala 1:100 juga berarti luas dikali 100?', answer: 'Tidak. Alat ini hanya untuk panjang. Luas dan volume memiliki faktor pangkat yang berbeda dan tidak dihitung di sini.' }], testCase: 'plan scale converts both directions after exact unit normalization',
  },
  'konversi-panjang': {
    title: 'Kalkulator Konversi Panjang', description: 'Konversi µm, mm, cm, m, km serta inch, foot, yard dan mile international melalui faktor meter eksak.', keywords: ['konversi panjang', 'meter cm km', 'inch mm', 'feet meter', 'mile kilometer'],
    inputFields: [amount('Panjang asal (nonnegatif)'), ...pair(lengthUnits)], engine: calculateLength,
    hint: `${bounds} Panjang fisik nonnegatif. Tukar satuan mempertahankan angka input, bukan mengambil hasil desimal yang telah dibulatkan.`,
    formula: 'Panjang tujuan = panjang asal × faktor meter satuan asal ÷ faktor meter satuan tujuan. Faktor disimpan sebagai pecahan eksak: 1 in = 0,0254 m; 1 ft = 0,3048 m; 1 yd = 0,9144 m; 1 mi = 1609,344 m.',
    example: '1 km = 1.000 m = 100.000 cm. 25,4 mm = 1 in; 3 ft = 0,9144 m; 1 mi = 1,609344 km. 0,001 mm = 1 µm. 1 m = 5000/127 in, tampil 39,370079 in pada enam desimal.',
    assumptions: 'Panjang adalah besaran fisik nonnegatif, bukan perpindahan bertanda. Inch/foot/yard/mile memakai definisi international. Survey foot dan nautical mile tidak disediakan. Identitas satuan dan nol tetap dipertahankan sebelum pembulatan.',
    rounding, sources: ['si', 'prefixes', 'international', 'handbook'], faq: [{ question: 'Mengapa hasil yang dibulatkan tidak selalu kembali tepat ke angka awal?', answer: 'Tampilan memotong presisi menjadi enam desimal. Faktor dan pecahan asli dapat dibalik eksak, tetapi menyalin angka tampilan menjadi input baru dapat kehilangan sebagian nilai.' }], testCase: 'length factors use exact international and metric definitions',
  },
  'konversi-berat': {
    title: 'Kalkulator Konversi Berat', description: 'Konversi massa sehari-hari antara µg, mg, g, kg, ton metrik, ounce dan pound avoirdupois dengan presisi sembilan desimal.', keywords: ['konversi berat', 'konversi massa', 'kg gram', 'pound ounce avoirdupois'],
    inputFields: [amount('Massa asal (nonnegatif)'), ...pair(massUnits)], engine: calculateMass,
    hint: `${bounds} Berat sehari-hari di sini berarti massa. t adalah ton metrik; oz/lb adalah avoirdupois. Tukar satuan hanya menukar pilihan, nilai input tetap.`,
    formula: 'Massa tujuan = massa asal × faktor kilogram satuan asal ÷ faktor kilogram satuan tujuan. 1 kg = 1.000 g; 1 t metrik = 1.000 kg; 1 lb avoirdupois = 0,45359237 kg tepat; 1 oz avoirdupois = 1/16 lb.',
    example: '1 kg = 1.000 g = 1.000.000 mg. 2,5 t = 2.500 kg. 1 lb = 453,59237 g. 16 oz = 1 lb; 1 oz = 28,349523125 g tepat, sehingga sembilan desimal mempertahankan contoh ini.',
    assumptions: 'Ini konversi satuan massa, bukan gaya berat/newton atau efek gravitasi. Tidak mengubah volume menjadi massa atau mengasumsikan densitas. Oz/lb bukan troy atau fluid ounce, dan ton bukan short/long ton. Nol sah; massa negatif ditolak.',
    rounding: 'Hasil dan basis kilogram tampil sembilan desimal, half-away-from-zero (pada massa nonnegatif sama dengan half-up). Pecahan eksak terpisah; nilai positif yang membulat nol ditandai <0,000000001 satuan. Sembilan desimal adalah presisi tampilan, bukan jaminan ketelitian alat ukur atau reversibilitas angka yang disalin.',
    sources: ['si', 'prefixes', 'pound', 'handbook'], faq: [{ question: 'Apakah ounce ini sama dengan ounce untuk logam mulia?', answer: 'Tidak. Alat ini memakai avoirdupois, dengan 16 oz = 1 lb. Troy ounce dan fluid ounce berbeda dan tidak disediakan.' }], testCase: 'mass uses exact avoirdupois pound ounce and metric tonne factors',
  },
  'konversi-suhu': {
    title: 'Kalkulator Konversi Suhu', description: 'Konversi suhu absolut Celsius, Fahrenheit dan Kelvin dengan offset eksak dan validasi nol mutlak sebelum pembulatan.', keywords: ['konversi suhu', 'celsius fahrenheit kelvin', 'nol mutlak', 'suhu negatif'],
    inputFields: [amount('Suhu asal (boleh minus sesuai skala)', true), choice('from', 'Skala suhu asal', options(temperatureUnits)), choice('to', 'Skala suhu tujuan', options(temperatureUnits))], engine: calculateTemperature,
    hint: `${bounds} Celsius ≥ −273,15; Fahrenheit ≥ −459,67; Kelvin ≥ 0. Gunakan tanda minus biasa (-). Tukar skala mempertahankan angka input; validasi memakai skala asal yang baru.`,
    formula: 'K = C + 273,15; F = C × 9/5 + 32; C = (F − 32) × 5/9. Konversi memakai Kelvin sebagai basis rasional; dari Fahrenheit, K = (F + 459,67) × 5/9. Offset tidak boleh dihilangkan.',
    example: '0 °C = 32 °F = 273,15 K; 100 °C = 212 °F = 373,15 K. −40 °C = −40 °F. 98,6 °F = 37 °C. Nol mutlak adalah −273,15 °C = −459,67 °F = 0 K.',
    assumptions: 'Suhu absolut dalam cakupan model ini, bukan selisih/interval suhu. Celsius dan Fahrenheit negatif yang masih di atas nol mutlak sah. Kelvin negatif serta input di bawah batas asal ditolak sebelum pembulatan, tidak dijepit menjadi nol. Nilai −0 ekuivalen nol dan tidak mempertahankan tanda minus.',
    rounding, sources: ['temperature', 'absolute', 'si'], faq: [{ question: 'Mengapa angka negatif kadang sah dan kadang ditolak?', answer: 'Skala Celsius/Fahrenheit memiliki titik nol yang berbeda dari nol mutlak. Nilai negatif sah sampai −273,15 °C atau −459,67 °F. Kelvin memakai nol mutlak sebagai batas bawah, sehingga tidak menerima nilai negatif.' }], testCase: 'temperature affine conversion enforces absolute zero on exact input',
  },
  'kecepatan-rata-rata': {
    title: 'Kalkulator Kecepatan Rata-rata', description: 'Hitung kelajuan skalar dari jarak total dan durasi elapsed jam, menit, detik; hasil km/h, m/s atau mph dari pecahan asli.', keywords: ['kecepatan rata-rata', 'kelajuan rata-rata', 'jarak waktu', 'km per jam meter per detik'],
    inputFields: [{ id: 'distance', label: 'Total jarak (nonnegatif)', type: 'decimal' }, choice('distanceUnit', 'Satuan jarak', options({ m: lengthUnits.m, km: lengthUnits.km, mi: lengthUnits.mi })), { id: 'hours', label: 'Jam elapsed (0–999999999)', type: 'integer' }, { id: 'minutes', label: 'Menit tambahan (0–59)', type: 'integer' }, { id: 'seconds', label: 'Detik tambahan (0–59,999999)', type: 'decimal' }, choice('to', 'Satuan hasil kelajuan', options(speedUnits))], engine: calculateSpeed,
    hint: 'Jarak hingga 13 digit bulat dan 6 desimal. Jam integer hingga 9 digit, menit integer 0–59, detik 0–59,999999 hingga 6 desimal. Isi tiap komponen waktu, termasuk 0. Total durasi wajib positif dan boleh lebih dari 24 jam. Titik/koma desimal, tanpa pemisah ribuan.',
    formula: 'Durasi detik = jam × 3.600 + menit × 60 + detik. Kelajuan basis m/s = jarak dalam meter ÷ durasi detik. Untuk km/h kalikan 18/5; untuk mph bagi faktor 0,44704 m/s per mph (international mile).',
    example: '150 km dalam 2 jam 30 menit 0 detik menghasilkan 60 km/h. 100 m dalam 9,58 detik menghasilkan 5000/479 m/s, tampil 10,438413 m/s. 1 km dalam 1 detik secara matematika memberi 3.600 km/h. 1 mi dalam 1 jam adalah 1 mph.',
    assumptions: 'Rata-rata memakai total jarak, bukan perpindahan bertanda. Durasi elapsed mencakup berhenti; tidak ada mode moving-only. Ini bukan kecepatan sesaat, ETA, rute atau rekomendasi berkendara. Tidak memakai waktu kalender atau zona waktu. Jarak nol dengan durasi positif memberi nol.',
    rounding, sources: ['si', 'time', 'international', 'handbook'], faq: [{ question: 'Apakah waktu berhenti perlu dimasukkan?', answer: 'Ya, bila yang dicari rata-rata perjalanan secara elapsed. Masukkan total durasi dari awal hingga akhir, termasuk berhenti. Alat tidak menebak atau memisahkan waktu bergerak.' }], testCase: 'average speed uses exact elapsed seconds and distance unit factors',
  },
} satisfies Record<string, UnitsTool>
export type UnitsSlug = keyof typeof unitsTools
