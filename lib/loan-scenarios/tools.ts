import type { BatchField } from '../batch-four/tools'
import type { StructuredTool } from '../../components/ui/structured-form'
import type { ScenarioSourceId } from './sources'
import { calculateEffectiveLoan, calculateMortgage, calculateEarlyPayoff, calculateRefinance, calculateExchange, type ScenarioResult } from './engines'
export type ScenarioTool = StructuredTool & {
  title: string; description: string; keywords: readonly string[]
  outputFields: readonly { id: string; label: string; type: 'integer' | 'decimal'; unit: string }[]
  engine: (v: unknown) => ScenarioResult
  formula: string; example: string; assumptions: string; rounding: string
  sources: readonly ScenarioSourceId[]
  faq: readonly { question: string; answer: string }[]
  testCase: string
}
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const count = (id: string, label: string): BatchField => ({ id, label, type: 'integer' })
const rate = (id: string, label: string): BatchField => ({ id, label: `${label} (nominal tahunan %, 0–100)`, type: 'decimal' })
const tenor = count('months', 'Tenor tersisa (bulan, 1–600)')
const principal = money('principal', 'Sisa pokok saat ini')
const out = (id: string, label: string, unit = 'IDR') => ({ id, label, unit, type: unit === 'rate' ? 'decimal' as const : 'integer' as const })
const loanHint = 'Rupiah utuh hingga 13 digit. Bunga nominal tahunan 0–100%, empat desimal persen; angsuran akhir bulan. Isi bunga dan biaya sesuai skenario Anda, tanpa tarif bank bawaan.'
const loanRounding = 'Acuan angsuran dibulatkan ke atas ke rupiah. Bunga tiap bulan dibulatkan setengah ke atas dari saldo berjalan. Pembayaran penutup disesuaikan agar saldo tepat nol, dan dapat lebih besar dari acuan pada saldo kecil. Total berasal dari jadwal; baris setelah lunas bernilai nol. Konvensi ini dapat berbeda dari kontrak bank.'
export const scenarioTools = {
  'bunga-efektif-pinjaman': {
    title: 'Kalkulator Bunga Efektif Pinjaman',
    description: 'Cari tingkat efektif tahunan tersirat dari dana cair bersih dan pembayaran pada tanggal sebenarnya dengan basis ACT/365.',
    keywords: ['bunga efektif pinjaman', 'xirr pinjaman', 'biaya pinjaman', 'arus kas tanggal'],
    inputFields: [money('proceeds', 'Dana cair bersih yang diterima'), { id: 'disbursed', label: 'Tanggal pencairan', type: 'date' }],
    rows: 'repayments', rowConfig: { name: 'pembayaran', label: 'Pembayaran', max: 100 },
    rowFields: [money('amount', 'Nominal pembayaran keluar'), { id: 'date', label: 'Tanggal pembayaran', type: 'date' }],
    outputFields: [out('effective', 'Tingkat efektif tahunan tersirat', 'rate'), out('proceeds', 'Dana bersih diterima'), out('total', 'Total pembayaran nominal'), out('difference', 'Selisih total pembayaran dan dana bersih')],
    engine: calculateEffectiveLoan,
    hint: 'Peminjam menerima dana positif pada tanggal cair dan membayar nominal positif sesudahnya. Biaya pada hari cair sudah dikurangkan dari dana bersih; biaya kemudian dapat dimasukkan sekali sebagai pembayaran. Maksimal 100 baris, masing-masing hingga 13 digit rupiah.',
    formula: 'P = jumlah Mj ÷ (1+r)^(dj/365). P adalah dana bersih diterima, Mj pembayaran keluar, dan dj selisih hari kalender setelah pencairan. ACT/365 fixed tetap membagi 365 pada tahun kabisat. Satu penerimaan awal dan pembayaran positif berikutnya memberi satu akar.',
    example: 'Dana Rp1.000 diterima 1 Januari 2023, lalu Rp1.100 dibayar 1 Januari 2024 (365 hari): tingkat tersirat 10,0000%. Pembayaran Rp900 pada tanggal sama memberi −10,0000%. Cair 1 Januari 2024, bayar Rp550 pada 1 Juli 2024 dan Rp600 pada 1 Januari 2025 memberi 20,3129%.',
    rounding: 'Pencarian akar terkurung memakai presisi desimal 80 digit, maksimal 300 iterasi. Residu nilai kini internal harus ≤Rp0,00000001. Rate tampilan dibulatkan ke empat desimal persen, nilai tengah menjauh dari nol. Pembulatan rate tampilan dapat mengubah residu jika dipakai menghitung ulang. Arah nilai di bawah presisi tetap disebutkan.',
    assumptions: 'Tanggal valid tahun 1900–2199, pembayaran harus sesudah pencairan dan maksimal 36.525 hari kemudian; tanggal yang sama boleh. Tingkat didukung −99,99% hingga 10.000% per tahun. Akar di luar batas atau gagal toleransi ditahan. Ini yield tersirat arus kas peminjam, bukan APR/EIR wajib regulator, bunga flat, atau nominal saldo menurun. Kalender date-only memakai UTC, tanpa pergeseran zona waktu.',
    sources: ['xirr', 'loans'],
    faq: [
      { question: 'Apakah hasil boleh negatif?', answer: 'Ya. Bila total pembayaran lebih kecil dari dana diterima, tingkat tersirat negatif. Total sama memberi nol. Ini hanya sifat arus kas yang Anda masukkan.' },
      { question: 'Bagaimana memasukkan biaya pencairan?', answer: 'Kurangkan biaya hari cair dari dana diterima. Biaya pada tanggal kemudian masuk sebagai baris pembayaran terpisah. Jangan menghitung biaya yang sama dua kali.' },
    ], testCase: 'dated loan yield matches independent ACT365 fixtures and residual',
  },
  kpr: {
    title: 'Kalkulator KPR Fixed dan Floating',
    description: 'Simulasikan cicilan KPR dua fase dengan hitung ulang sisa pokok saat bunga berganti dan rincian dana awal.',
    keywords: ['kpr', 'kredit rumah', 'fixed floating', 'angsuran rumah'],
    inputFields: [money('price', 'Harga rumah'), money('down', 'Uang muka (DP nominal rupiah)'), { ...tenor, label: 'Tenor total (bulan, 1–600)' }, rate('fixedRate', 'Bunga fase fixed'), count('fixedMonths', 'Durasi fase fixed (bulan, 0–tenor)'), rate('nextRate', 'Asumsi bunga fase kedua'), money('fees', 'Biaya awal dibayar tunai')],
    outputFields: [out('outlay', 'Total pengeluaran rumah dan pembiayaan'), out('principal', 'Pokok pinjaman (harga dikurangi DP)'), out('upfront', 'Dana awal (DP dan biaya)'), out('phaseOne', 'Acuan cicilan fase fixed'), out('phaseTwo', 'Acuan cicilan fase kedua'), out('switchBalance', 'Sisa pokok saat pergantian fase'), out('interest', 'Total bunga jadwal'), out('total', 'Total angsuran'), out('last', 'Pembayaran angsuran terakhir'), out('lastMonth', 'Bulan angsuran terakhir', 'bulan')],
    engine: calculateMortgage, hint: loanHint,
    formula: 'Pokok P = harga − DP. Acuan anuitas A = P×i/[1−(1+i)^−n], i=nominal tahunan/12. Setelah fase fixed, hitung ulang acuan dari saldo jadwal dengan tenor tersisa dan tingkat fase kedua. Jika i=0, A=P/n. Total pengeluaran = DP + biaya awal + total angsuran = harga + biaya + total bunga.',
    example: 'Harga Rp1.200, DP Rp200, tenor 3 bulan, fixed 12% selama 1 bulan, fase kedua 24%, biaya awal Rp50: acuan fase pertama Rp341, fase kedua Rp345. Jadwal membayar Rp341, Rp345, Rp344; total bunga Rp30. Dana awal Rp250 dan total pengeluaran Rp1.280.',
    rounding: loanRounding,
    assumptions: 'DP nominal tidak boleh melebihi harga. Biaya awal dibayar tunai, tidak menambah pokok. Durasi fixed nol langsung memakai fase kedua; durasi fixed penuh hanya memakai fase pertama. Acuan fase yang tidak ada Rp0. Fase kedua adalah satu tingkat asumsi tetap, bukan prediksi floating bank. Pajak, asuransi dan biaya lain hanya tercakup bila dimasukkan dalam biaya awal.',
    sources: ['loans', 'phases'],
    faq: [
      { question: 'Apakah bunga floating mengikuti pasar otomatis?', answer: 'Tidak. Anda memasukkan satu tingkat skenario untuk seluruh sisa tenor. Kontrak sebenarnya dapat meninjau tingkat berulang kali.' },
      { question: 'Apakah uang muka dihitung dua kali?', answer: 'Tidak. Pokok dibiayai adalah harga dikurangi DP. Total pengeluaran menjumlah DP, biaya tunai dan angsuran saja.' },
    ], testCase: 'mortgage reamortizes rounded switch balance and reconciles outlay',
  },
  'pelunasan-dipercepat': {
    title: 'Kalkulator Pelunasan Dipercepat', description: 'Bandingkan satu tambahan pokok setelah cicilan biasa untuk mempercepat lunas, termasuk penalti kontrak manual.',
    keywords: ['pelunasan dipercepat', 'tambahan pokok', 'hemat bunga', 'penalti pelunasan'],
    inputFields: [principal, tenor, rate('rate', 'Bunga tetap'), money('extra', 'Tambahan pokok sekali'), count('eventMonth', 'Bulan tambahan sesudah cicilan biasa'), money('penalty', 'Penalti nominal sekali')],
    outputFields: [out('net', 'Penghematan neto setelah penalti'), out('saved', 'Penghematan bunga'), out('penalty', 'Penalti dibayar'), out('baseInterest', 'Bunga tanpa tambahan'), out('interest', 'Bunga dengan tambahan'), out('standard', 'Acuan cicilan biasa dipertahankan'), out('extra', 'Tambahan pokok aktual'), out('total', 'Total kas keluar termasuk tambahan dan penalti'), out('baselineTotal', 'Total kas keluar tanpa tambahan'), out('lastMonth', 'Bulan lunas skenario tambahan', 'bulan'), out('monthsSaved', 'Tenor aktual lebih singkat', 'bulan')],
    engine: calculateEarlyPayoff, hint: loanHint,
    formula: 'Pertahankan acuan anuitas awal. Sesudah cicilan biasa bulan pilihan, tambahan aktual = minimum(tambahan diminta, sisa pokok). Penalti dibayar sekali di luar pokok. Hemat bunga = bunga dasar − bunga baru; hemat neto = hemat bunga − penalti. Bandingkan bulan pembayaran terakhir dari kedua jadwal.',
    example: 'Sisa Rp1.000, nominal 12%, 3 bulan, acuan Rp341. Tambah Rp400 sesudah cicilan bulan 1, penalti Rp2: saldo menjadi Rp269 dan lunas bulan 2 dengan Rp272. Bunga turun dari Rp20 ke Rp13; hemat neto Rp5 dan tenor berkurang 1 bulan.',
    rounding: loanRounding,
    assumptions: 'Strategi mempertahankan cicilan dan memperpendek tenor aktual, bukan menurunkan cicilan sepanjang tenor lama. Tambahan hanya sekali; event harus saat saldo masih ada sesudah cicilan biasa. Permintaan melebihi saldo dibatasi. Tambahan nol membutuhkan penalti nol. Penalti nominal diisi menurut kontrak; penghematan neto bisa negatif. Tambahan sudah menggantikan pokok, tidak dikurangi lagi sebagai biaya baru.',
    sources: ['loans', 'penalty'],
    faq: [
      { question: 'Apakah penalti mengurangi pokok?', answer: 'Tidak. Penalti menambah kas keluar dan mengurangi penghematan neto; hanya tambahan pokok yang mengurangi saldo.' },
      { question: 'Mengapa tambahan aktual lebih kecil dari input?', answer: 'Tambahan dibatasi saldo setelah cicilan biasa pada bulan pilihan agar tidak membayar pokok melebihi kewajiban.' },
    ], testCase: 'early payoff keeps reference payment and separates penalty from principal',
  },
  refinancing: {
    title: 'Kalkulator Refinancing Pinjaman', description: 'Bandingkan dua tenor dan tingkat pinjaman, biaya pindah tunai, serta titik impas kas sementara dan permanen.',
    keywords: ['refinancing', 'pindah pinjaman', 'titik impas kredit', 'biaya refinancing'],
    inputFields: [principal, tenor, rate('oldRate', 'Bunga pinjaman lama'), rate('newRate', 'Bunga pinjaman baru'), count('newMonths', 'Tenor pinjaman baru (bulan, 1–600)'), money('cost', 'Seluruh biaya pindah dan penalti (tunai)')],
    outputFields: [out('net', 'Selisih kas seumur pinjaman (positif = hemat)'), out('oldStandard', 'Acuan angsuran lama'), out('newStandard', 'Acuan angsuran baru'), out('oldInterest', 'Total bunga lama'), out('newInterest', 'Total bunga baru'), out('cost', 'Biaya pindah tunai bulan 0'), out('oldTotal', 'Total kas lama'), out('newTotal', 'Total kas baru termasuk biaya pindah'), out('horizon', 'Horizon perbandingan sampai keduanya lunas', 'bulan')],
    engine: calculateRefinance, hint: loanHint,
    formula: 'Buat dua jadwal dari pokok tersisa yang sama. D0 = −biaya pindah; Dm = Dm−1 + bayar lama bulan m − bayar baru bulan m. Sesudah lunas, pembayaran nol. Impas pertama adalah bulan pertama D≥0; impas permanen adalah awal rentang D yang tetap ≥0 sampai akhir horizon maksimum kedua tenor. Selisih lifetime = total lama − (total baru + biaya).',
    example: 'Sisa Rp1.000, lama 12% selama 3 bulan memberi Rp341, Rp341, Rp338. Baru 0% selama 3 bulan memberi Rp334, Rp334, Rp332. Biaya Rp14 memberi kumulatif −Rp14, −Rp7, Rp0, Rp6: impas permanen bulan 2, hemat akhir Rp6.',
    rounding: loanRounding,
    assumptions: 'Biaya pindah dibayar tunai pada bulan 0, tidak dibiayai. Kas dibandingkan tanpa diskonto sampai kedua jadwal selesai. Dengan tenor berbeda, crossing bisa sementara dan pembayaran lebih kecil dapat memberi biaya lifetime lebih besar. Perbandingan ini tidak mengukur ekuitas atau biaya menjual rumah di tengah tenor, tidak memasukkan cashback atau pajak, dan bukan tawaran bank.',
    sources: ['loans', 'refinance'],
    faq: [
      { question: 'Mengapa impas pertama belum tentu permanen?', answer: 'Ketika tenor lama habis, pembayaran lama menjadi nol sementara pinjaman baru bisa terus berjalan. Penghematan kumulatif yang semula positif dapat menjadi negatif lagi.' },
      { question: 'Apakah cicilan baru lebih kecil berarti lebih murah?', answer: 'Tidak. Tenor lebih panjang dapat memperbesar total bunga. Tinjau total kas, selisih akhir dan impas permanen bersama.' },
    ], testCase: 'refinance tracks temporary and permanent crossovers across unequal tenors',
  },
  'kurs-mata-uang': {
    title: 'Kalkulator Kurs Mata Uang USD dan IDR', description: 'Konversikan USD ke rupiah atau rupiah ke USD dengan kurs manual dan biaya dalam mata uang keluaran.',
    keywords: ['kurs mata uang', 'usd idr', 'konversi dolar rupiah', 'kurs manual'],
    inputFields: [
      { id: 'direction', label: 'Arah konversi', type: 'choice', options: [{ value: 'usd-idr', label: 'USD ke IDR (nominal USD, biaya IDR)' }, { value: 'idr-usd', label: 'IDR ke USD (nominal IDR, biaya USD)' }] },
      { id: 'amount', label: 'Nominal masuk (USD 2 desimal / IDR utuh)', type: 'decimal' },
      { id: 'rate', label: 'Kurs manual: 1 USD = X IDR (maksimal 6 desimal)', type: 'decimal' },
      { id: 'fee', label: 'Biaya dalam mata uang keluaran (IDR utuh / USD 2 desimal)', type: 'decimal' },
    ], outputFields: [out('net', 'Nominal bersih diterima', 'target'), out('gross', 'Konversi bruto sebelum biaya', 'target'), out('fee', 'Biaya dalam mata uang keluaran', 'target')],
    engine: calculateExchange,
    hint: 'Isi kurs sendiri, selalu dalam IDR per 1 USD. Input dan kurs maksimal 13 digit bulat. USD memakai dua desimal, IDR utuh. Biaya nominal wajib diisi (0 bila tanpa biaya). Tidak ada data kurs langsung.',
    formula: 'USD ke IDR: bruto = nominal USD × kurs IDR per USD. IDR ke USD: bruto = nominal IDR ÷ kurs yang sama. Biaya nominal memakai mata uang keluaran. Bersih = bruto yang sudah dibulatkan ke unit keluaran − biaya.',
    example: 'USD100,25 pada kurs 15.000,5 memberi bruto IDR1.503.800 setelah pembulatan. Biaya IDR1.000 menghasilkan IDR1.502.800. Arah sebaliknya, IDR100.000 pada kurs 15.000 memberi bruto USD6,67; biaya USD0,10 menghasilkan USD6,57.',
    rounding: 'Kurs dihitung sebagai pecahan desimal eksak hingga enam desimal. Bruto dibulatkan setengah ke atas ke rupiah utuh atau dua desimal USD, lalu biaya dikurangi agar ledger cocok. Biaya tidak boleh melebihi bruto eksak sebelum pembulatan. Bersih nol diperbolehkan; nilai positif yang membulat nol ditandai kurang dari unit tampilan.',
    assumptions: 'Cakupan hanya IDR dan USD; tidak menganggap semua mata uang punya dua desimal. Kurs dan biaya sepenuhnya input pengguna. Spread tidak dihitung terpisah dan tidak ada feed, komisi otomatis, atau jaminan nilai settlement bank.',
    sources: ['fx', 'currency'],
    faq: [
      { question: 'Apakah kurs diisi otomatis?', answer: 'Tidak. Masukkan kuotasi Anda sebagai IDR per 1 USD. Kuotasi referensi dapat berbeda dari harga transaksi.' },
      { question: 'Dalam mata uang apa biaya diisi?', answer: 'Biaya mengikuti keluaran: IDR untuk USD ke IDR, USD untuk IDR ke USD. Baca pilihan arah sebelum mengisi nominal.' },
    ], testCase: 'manual FX respects direction target units and exact fee bounds',
  },
} satisfies Record<string, ScenarioTool>
export type ScenarioSlug = keyof typeof scenarioTools
