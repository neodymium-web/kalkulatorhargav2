import type { BatchField } from '../batch-four/tools'
import type { StructuredTool } from '../../components/ui/structured-form'
import { calculateDateDifference, calculateWorkdays, calculateAge, calculateShift, calculateFuel, type CalendarResult } from './engines'
import type { CalendarSourceId } from './sources'
export type CalendarTool = StructuredTool & {
  title: string; description: string; keywords: readonly string[]
  outputFields: readonly { id: string; label: string; unit: string; type: 'integer' | 'decimal' }[]
  engine: (input: unknown) => CalendarResult
  formula: string; example: string; assumptions: string; rounding: string
  sources: readonly CalendarSourceId[]; faq: readonly { question: string; answer: string }[]; testCase: string
}
const date = (id: string, label: string): BatchField => ({ id, label, type: 'date' })
const choice = (id: string, label: string, options: readonly { value: string; label: string }[]): BatchField => ({ id, label, type: 'choice', options })
const output = (id: string, label: string, unit = 'integer') => ({ id, label, unit, type: ['liters', 'decimal-hours', 'km', 'km/L'].includes(unit) ? 'decimal' as const : 'integer' as const })
const calendarHint = 'Kalender Gregorian proleptik, tahun 0001–9999. Pilih tanggal kalender saja; tidak ada waktu, offset atau penyesuaian DST. Akhir tidak boleh sebelum awal.'
const dateFields = [date('start', 'Tanggal awal'), date('end', 'Tanggal akhir')]
export const calendarTools = {
  'selisih-tanggal': {
    title: 'Kalkulator Selisih Tanggal', description: 'Hitung jarak hari kalender dan minggu penuh, dengan aturan awal tidak dihitung atau kedua tanggal dihitung.', keywords: ['selisih tanggal', 'jarak hari', 'tanggal inklusif', 'minggu penuh'],
    inputFields: [...dateFields, choice('mode', 'Aturan hitung tanggal', [{ value: 'elapsed', label: 'Awal tidak dihitung, akhir dihitung' }, { value: 'inclusive', label: 'Kedua tanggal dihitung (inklusif)' }])],
    outputFields: [output('days', 'Jumlah hari menurut mode', 'days'), output('weeks', 'Minggu penuh dari jumlah hari', 'weeks'), output('remainder', 'Sisa setelah minggu penuh', 'days'), output('elapsed', 'Selisih ordinal tanpa tambahan inklusif', 'days')],
    engine: calculateDateDifference, hint: calendarHint,
    formula: 'Selisih = ordinal akhir − ordinal awal. Mode awal tidak dihitung memakai selisih tersebut; mode inklusif menambah satu hari. Minggu penuh = jumlah hari dibagi tujuh secara integer, sisa = jumlah hari modulo tujuh.',
    example: '28 Februari 2024 sampai 1 Maret 2024 memberi 2 hari jika awal tidak dihitung, atau 3 hari jika kedua tanggal dihitung. Pada 2023, rentang yang sama memberi 1 atau 2 hari. 2–9 November 2026 memberi 7 hari (1 minggu, sisa 0) atau 8 hari (1 minggu, sisa 1).',
    assumptions: 'Tanggal sama memberi 0 hari pada mode awal tidak dihitung dan 1 hari pada mode inklusif. Rentang terbalik ditolak. Gregorian dipakai juga sebelum reformasi historis 1582; ini bukan konversi kalender Julian atau durasi realtime.',
    rounding: 'Hari, minggu penuh dan sisa adalah integer eksak. Tidak mengubah hari menjadi bulan dengan pembagi 30 atau tahun dengan pembagi 365.',
    sources: ['leap', 'calendar', 'representation'], faq: [{ question: 'Mengapa tanggal sama bisa menghasilkan satu hari?', answer: 'Mode inklusif menghitung tanggal itu sebagai satu anggota rentang. Mode awal tidak dihitung mengukur selisih ordinal, sehingga tanggal sama bernilai nol.' }], testCase: 'date differences respect Gregorian boundaries and both endpoint conventions',
  },
  'hari-kerja': {
    title: 'Kalkulator Hari Kerja', description: 'Hitung hari kerja dalam rentang inklusif menurut pola mingguan dan tanggal libur yang Anda masukkan, tanpa pengurangan ganda.', keywords: ['hari kerja', 'hitung hari kerja', 'libur manual', 'tanggal kerja'],
    inputFields: [...dateFields, choice('weekend', 'Hari libur mingguan', [
      { value: 'sat-sun', label: 'Sabtu dan Minggu libur' }, { value: 'fri-sat', label: 'Jumat dan Sabtu libur' }, { value: 'sun', label: 'Minggu saja libur' },
      { value: 'none', label: 'Tidak ada hari libur mingguan' }, { value: 'all', label: 'Semua hari libur (nol hari kerja terjadwal)' },
    ])], rows: 'holidays', rowConfig: { name: 'libur', label: 'Tanggal libur', min: 0, max: 100 }, rowFields: [date('date', 'Tanggal libur tambahan')],
    outputFields: [output('workdays', 'Hari kerja setelah libur eksplisit', 'days'), output('total', 'Total hari kalender inklusif', 'days'), output('scheduled', 'Hari terjadwal sebelum libur tambahan', 'days'), output('qualifying', 'Libur unik yang mengurangi hari terjadwal', 'days'), output('unique', 'Tanggal libur unik'), output('duplicates', 'Baris libur duplikat'), output('weekendHolidays', 'Libur unik pada hari libur mingguan'), output('outside', 'Libur unik di luar rentang')],
    engine: calculateWorkdays, hint: `${calendarHint} Kedua batas dihitung. Daftar libur opsional 0–100 baris; setiap baris tambahan wajib diisi atau dihapus. Duplikat dihitung sekali. Tanggal di luar rentang diabaikan dan dilaporkan.`,
    formula: 'Total inklusif = ordinal akhir − ordinal awal + 1. Hari terjadwal = minggu penuh × jumlah hari kerja per minggu + hari kerja pada sisa maksimal enam hari. Hasil akhir = hari terjadwal − tanggal libur unik dalam rentang yang tadinya hari kerja.',
    example: '2–8 November 2026 (Senin–Minggu), Sabtu/Minggu libur, memberi 7 hari kalender dan 5 hari terjadwal. Masukkan 4 November dua kali, 7 November dan 9 November: ada 3 tanggal unik, 1 duplikat, 1 libur pada weekend dan 1 di luar rentang. Hanya 4 November mengurangi hasil menjadi 4 hari kerja. 26 Februari–3 Maret 2024 juga memberi 5 hari kerja sebelum libur tambahan.',
    assumptions: 'Pola mingguan dipilih pengguna, bukan aturan perusahaan atau pemerintah. Tidak memuat hari libur nasional Indonesia, cuti bersama atau kalender dinamis. Semua hari libur mingguan menghasilkan nol hari kerja terjadwal. Tabel tanggal unik tidak mengulang baris duplikat.',
    rounding: 'Semua hitungan hari integer eksak. Libur di luar rentang diperiksa dahulu; libur di dalam rentang yang sudah nonkerja tidak dikurangi lagi. Unik = pengurang + nonkerja mingguan + di luar rentang.',
    sources: ['leap', 'calendar', 'representation'], faq: [{ question: 'Apakah hari libur nasional sudah dimasukkan?', answer: 'Belum. Isi sendiri tanggal yang berlaku untuk skenario Anda. Duplikat dan tanggal yang sudah hari libur mingguan tidak menyebabkan pengurangan dua kali.' }], testCase: 'workdays deduplicate explicit holidays and reconcile their classification ledger',
  },
  usia: {
    title: 'Kalkulator Usia', description: 'Hitung usia kalender dalam tahun, bulan dan hari pada tanggal acuan pilihan Anda, termasuk aturan akhir bulan dan 29 Februari.', keywords: ['usia', 'umur kalender', 'tanggal lahir', 'umur tahun bulan hari'],
    inputFields: [date('birth', 'Tanggal lahir'), date('reference', 'Tanggal acuan usia')],
    outputFields: [output('years', 'Usia kalender pada tanggal acuan', 'age'), output('totalDays', 'Total hari yang telah berlalu', 'days'), output('totalMonths', 'Jumlah bulan penuh dari tanggal lahir')],
    engine: calculateAge, hint: 'Isi tanggal lahir dan acuan secara eksplisit, tahun 0001–9999. Acuan tidak boleh sebelum lahir. Tidak ada default hari ini atau ketergantungan zona waktu perangkat.',
    formula: 'Cari jumlah bulan penuh terbesar dengan anniversary dari tanggal lahir asli yang tidak melewati acuan. Jika hari lahir tidak ada pada bulan tujuan, pakai hari terakhir bulan itu (clamp). Tahun = bulan penuh dibagi 12, bulan = sisanya, hari = selisih ordinal dari anniversary terakhir ke acuan.',
    example: '29 Februari 2024 sampai 28 Februari 2025 menghasilkan 1 tahun 0 bulan 0 hari, total 365 hari. 31 Januari 2024 sampai 29 Februari 2024 menghasilkan 0 tahun 1 bulan 0 hari, total 29 hari. 29 Februari 2000 sampai 29 Februari 2024 menghasilkan 24 tahun, total 8.766 hari.',
    assumptions: 'Anniversary selalu berpatokan pada tanggal lahir asli. 31 Januari ke 30 Maret 2024 adalah 1 bulan 30 hari; ke 31 Maret adalah 2 bulan 0 hari. Tidak melakukan clamp berulang yang menggeser anniversary. Acuan sama dengan lahir memberi nol. Konvensi 28 Februari ini bukan penetapan usia hukum, kewarganegaraan atau kelayakan kontrak.',
    rounding: 'Tahun/bulan/hari berasal dari kalender, tanpa pembulatan dan tanpa asumsi tahun 365 hari atau bulan 30 hari. Total hari terpisah adalah selisih ordinal eksak.',
    sources: ['leap', 'calendar', 'representation'], faq: [{ question: 'Bagaimana usia orang yang lahir 29 Februari?', answer: 'Pada tahun biasa, model ini menjepit anniversary ke 28 Februari. Pada tahun kabisat, tanggal 29 tetap dipakai. Ini konvensi perhitungan kalender aplikasi, bukan aturan usia legal.' }], testCase: 'age uses maximal original-anchor clamped months without anniversary drift',
  },
  'durasi-kerja': {
    title: 'Kalkulator Durasi Kerja', description: 'Hitung jam dan menit bersih satu shift setelah jeda, dengan akhir hari yang sama atau hari berikutnya dipilih eksplisit.', keywords: ['durasi kerja', 'jam kerja', 'shift malam', 'jeda menit'],
    inputFields: [{ id: 'start', label: 'Jam mulai (HH:mm)', type: 'time' }, { id: 'end', label: 'Jam selesai (HH:mm)', type: 'time' }, choice('endDay', 'Hari berakhir shift', [{ value: 'same-day', label: 'Hari yang sama' }, { value: 'next-day', label: 'Hari berikutnya' }]), { id: 'break', label: 'Jeda total (menit utuh, 0–2879)', type: 'integer' }],
    outputFields: [output('net', 'Durasi bersih setelah jeda', 'duration'), output('decimalHours', 'Jam bersih dalam desimal', 'decimal-hours'), output('gross', 'Durasi kotor shift', 'minutes'), output('break', 'Jeda yang dikurangkan', 'minutes')],
    engine: calculateShift, hint: 'Gunakan jam 24 jam 00:00–23:59. Pilih hari berakhir, tidak diinferensi dari jam. Satu rollover mengizinkan maksimal 47 jam 59 menit. Jeda harus menit utuh nonnegatif dan tidak melebihi durasi kotor.',
    formula: 'Menit jam = jam × 60 + menit. Durasi kotor = menit selesai − menit mulai, ditambah 1.440 menit hanya jika memilih hari berikutnya. Durasi bersih = kotor − jeda. Jam desimal = menit bersih dibagi 60.',
    example: '09:00–17:30 hari yang sama dengan jeda 60 menit: kotor 510, bersih 450 menit = 7 jam 30 menit = 7,5000 jam. 22:00–06:00 hari berikutnya dengan jeda 30 menit: kotor 480, bersih juga 450 menit. 00:00–00:01 tanpa jeda memberi 1 menit atau 0,0167 jam.',
    assumptions: 'Jam mulai/selesai sama menghasilkan 0 jam jika hari yang sama, atau 24 jam jika hari berikutnya. Selesai lebih awal pada hari yang sama ditolak. Jeda sama dengan kotor memberi nol; jeda lebih besar ditolak. Jam dinding ini tidak menghitung elapsed realtime pada DST, payroll, lembur atau aturan ketenagakerjaan.',
    rounding: 'Seluruh durasi dasar adalah menit integer eksak. Jam+menit tidak dibulatkan; jam desimal dibulatkan setengah ke atas sekali ke empat desimal. Detik, offset dan 24:00 tidak diterima.',
    sources: ['representation', 'units'], faq: [{ question: 'Apakah jam selesai lebih kecil otomatis berarti besok?', answer: 'Tidak. Pilih Hari berikutnya untuk shift yang berakhir besok. Pilihan eksplisit membedakan shift nol jam dari shift 24 jam ketika jam mulai dan selesai sama.' }], testCase: 'shift minutes respect explicit rollover and conserve gross break and net',
  },
  'konsumsi-bbm': {
    title: 'Kalkulator Konsumsi BBM', description: 'Simulasikan liter BBM dan biaya perjalanan dari jarak total, efisiensi km/L dan harga Rp/L yang Anda masukkan.', keywords: ['konsumsi bbm', 'biaya bensin', 'efisiensi km per liter', 'liter perjalanan'],
    inputFields: [{ id: 'distance', label: 'Jarak total perjalanan (km)', type: 'decimal' }, { id: 'efficiency', label: 'Efisiensi konsumsi (km/L, harus positif)', type: 'decimal' }, { id: 'price', label: 'Harga manual per liter', type: 'integer', unit: 'IDR' }],
    outputFields: [output('liters', 'Estimasi BBM untuk jarak tersebut', 'liters'), output('cost', 'Estimasi biaya setelah pembulatan rupiah', 'IDR'), output('distance', 'Jarak total input', 'km'), output('efficiency', 'Efisiensi input', 'km/L'), output('price', 'Harga per liter input', 'IDR-per-L')],
    engine: calculateFuel, hint: 'Jarak nonnegatif dan efisiensi positif, hingga 13 digit bulat dan 6 desimal; koma/titik desimal tanpa pemisah ribuan. Harga Rp/L rupiah utuh nonnegatif hingga 13 digit. Isi jarak total yang dimaksud, termasuk pulang-pergi bila perlu; tidak digandakan otomatis.',
    formula: 'Liter = jarak km ÷ efisiensi km/L. Biaya = (jarak ÷ efisiensi) × harga Rp/L. Liter dan biaya dihitung dari rasio eksak yang sama, kemudian masing-masing dibulatkan untuk tampilan.',
    example: '150 km pada 15 km/L dan Rp10.000/L membutuhkan 10,0000 L, estimasi biaya Rp100.000. 125 km pada 12,5 km/L dan Rp13.500/L juga membutuhkan 10,0000 L, biaya Rp135.000. 1 km pada 3 km/L dan Rp10.000/L membutuhkan 1/3 L: tampil 0,3333 L, biaya Rp3.333.',
    assumptions: 'Jarak dan harga diisi manual, tanpa peta, ETA atau tarif BBM terkini. Efisiensi selalu km/L, bukan L/100 km. Jarak nol menghasilkan liter/biaya nol; harga nol hanya menolkan biaya. Hasil estimasi dapat berbeda karena kendaraan, beban, lalu lintas dan kelipatan pembelian pompa. Tidak termasuk tol atau emisi.',
    rounding: 'Gunakan BigInt rasional tanpa membulatkan liter sebelum menghitung biaya. Liter tampil empat desimal, biaya rupiah utuh, keduanya setengah ke atas. Liter positif yang membulat nol ditandai <0,0001 L. Biaya positif yang membulat nol tetap Rp0 dengan catatan estimasi positif <Rp0,50 sebelum pembulatan.',
    sources: ['units'], faq: [{ question: 'Mengapa biaya tidak persis sama dengan liter tampilan dikali harga?', answer: 'Biaya memakai pecahan liter sebelum pembulatan, sedangkan tampilan liter hanya empat desimal. Ini mencegah pembulatan antara yang dapat mengubah biaya, terutama pada harga besar.' }], testCase: 'fuel costs round original rational liters once without display intermediates',
  },
} satisfies Record<string, CalendarTool>
export type CalendarSlug = keyof typeof calendarTools
