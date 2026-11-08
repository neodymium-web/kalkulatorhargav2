import type { BatchField } from '../batch-four/tools'
import type { StructuredTool } from '../../components/ui/structured-form'
import { calculatePlatformSettlement } from './engine'
const money = (id: string, label: string): BatchField => ({ id, label, type: 'integer', unit: 'IDR' })
const choice = (id: string, label: string, pairs: readonly (readonly [string, string])[]): BatchField => ({ id, label, type: 'choice', options: pairs.map(([value, label]) => ({ value, label })) })
const when = (field: BatchField, key: string, value: string): BatchField => ({ ...field, visibleWhen: { field: key, value } })
export const manualDisclaimer = 'Simulasi berdasarkan tarif dan komponen yang Anda isi; bukan kalkulator resmi / tarif otomatis marketplace.'
export const settlementPolicy = 'Pecahan dipertahankan eksak (n/d rupiah). Cash payout dibulatkan sekali, setengah menjauhi nol; cash setelah HPP = cash payout − HPP integer. Bukan invoice, laba bersih akuntansi atau konfirmasi transfer bank. Margin tidak terdefinisi bila penjualan neto nol.'
export const settlementFields: StructuredTool = {
  inputFields: [money('price', 'Harga jual per unit'), { id: 'quantity', label: 'Jumlah unit (1–10000)', type: 'integer' }, money('discount', 'Diskon seller per pesanan'), money('cost', 'HPP per unit'),
    { id: 'context', label: 'Konteks kategori, tier, program, tanggal pesanan (catatan opsional; tidak mengisi tarif)', type: 'text' },
    money('buyerShipping', 'Ongkir dibayar buyer'), choice('shippingFlow', 'Pemetaan ongkir buyer', [['excluded', 'Pass-through di luar penerimaan seller'], ['credited', 'Benar-benar dikreditkan ke seller'], ['unknown', 'Belum diketahui']]),
    money('shipping', 'Ongkir dibayar seller'), money('reimbursement', 'Reimbursement logistik aktual, bukan kredit yang sudah dicatat'), money('receipts', 'Kredit aktual lain, bukan diskon platform tampilan'), money('other', 'Penyesuaian biaya lain, tidak termasuk fee yang sudah dicatat'),
    choice('coverage', 'Cakupan transaksi', [['ordinary', 'Pesanan selesai biasa; tanpa retur, pajak terpisah atau cap per unit'], ['unsupported', 'Ada retur/refund, sengketa, pajak terpisah, cap per unit atau aliran gateway belum jelas'], ['unknown', 'Belum diketahui']]),
    choice('confirmation', 'Konfirmasi kelengkapan', [['complete', 'Semua biaya, basis dan kredit lengkap atau sadar nol; tidak ganda'], ['unknown', 'Belum lengkap / belum yakin']]),
  ], rows: 'fees', rowConfig: { name: 'biaya', label: 'Biaya', min: 0, max: 12 }, rowFields: [
    { id: 'label', label: 'Nama biaya (unik)', type: 'text' }, choice('type', 'Jenis biaya', [['percent', 'Persentase'], ['fixed', 'Tetap'], ['unknown', 'Belum diketahui']]),
    when({ id: 'rate', label: 'Tarif manual (%, 0–100; 6 desimal)', type: 'decimal' }, 'type', 'percent'), when(choice('basis', 'Basis persentase', [['gross', 'Bruto sebelum diskon'], ['net', 'Setelah diskon seller'], ['custom', 'Nilai custom eksplisit'], ['unknown', 'Belum diketahui']]), 'type', 'percent'),
    when(money('custom', 'Basis custom sesuai arus kas yang terpetakan'), 'basis', 'custom'), when(money('amount', 'Nominal biaya tetap'), 'type', 'fixed'), when(choice('scope', 'Scope biaya tetap', [['order', 'Per pesanan'], ['unit', 'Per unit'], ['unknown', 'Belum diketahui']]), 'type', 'fixed'),
    choice('minimumMode', 'Minimum per pesanan', [['none', 'Tidak berlaku'], ['enabled', 'Berlaku, isi nilai'], ['unknown', 'Belum diketahui']]), when(money('minimum', 'Nilai minimum per pesanan'), 'minimumMode', 'enabled'),
    choice('capMode', 'Maksimum per pesanan', [['none', 'Tidak berlaku'], ['enabled', 'Berlaku, isi nilai'], ['unknown', 'Belum diketahui']]), when(money('cap', 'Nilai maksimum per pesanan (bukan per unit)'), 'capMode', 'enabled'),
  ], hint: 'Isi uang integer 0–9999999999999 tanpa pemisah ribuan; 0 wajib ditulis jika memang nol. Kuantitas 1–10000. Tambahkan 0–12 fee manual, tanpa tarif bawaan. Minimum/cap hanya per pesanan. Semua arus kas harus terpetakan dan tidak ganda; di luar model tampil status tanpa angka.',
}
export const platformSources = {
  shopee: { title: 'Syarat layanan Shopee Indonesia (bukan jadwal tarif)', url: 'https://help.shopee.co.id/portal/4/article/71187-Syarat-Layanan-Shopee' },
  'tiktok-shop': { title: 'Academy TikTok Shop dan Tokopedia Indonesia (tabel tidak terbaca)', url: 'https://seller-id.tiktok.com/university/home' },
  tokopedia: { title: 'Ketentuan biaya Tokopedia Official Store (tanggal berlaku tidak tersedia)', url: 'https://assets.tokopedia.net/asts/onboarding/Ketentuan_biaya_Tokopedia_Official_Store.pdf' },
  lazada: { title: 'Lazada Seller Center Indonesia (tabel tidak terbaca)', url: 'https://sellercenter.lazada.co.id/apps/register/lazmall/joining' },
} as const
export const platformTools = {
  shopee: { name: 'Shopee', id: 'calc-shopee', context: 'Pisahkan administrasi kategori/tier, biaya pembayaran, voucher dan program gratis ongkir. Periksa apakah masing-masing fee mempunyai basis dan maksimum berbeda.' },
  'tiktok-shop': { name: 'TikTok Shop', id: 'calc-tiktok', context: 'Alat ini untuk penjual TikTok Shop, bukan pendapatan kreator. Pisahkan komisi platform, affiliate, iklan dan program. Kanal Shop Tokopedia tidak otomatis mempunyai tarif atau basis yang sama.' },
  tokopedia: { name: 'Tokopedia', id: 'calc-tokopedia', context: 'Catat apakah transaksi berasal dari skema legacy atau integrasi seller. Jangan menyalin tarif TikTok Shop secara otomatis. Periksa biaya kategori, layanan dan program pada pesanan Anda.' },
  lazada: { name: 'Lazada', id: 'calc-lazada', context: 'Pisahkan komisi, pembayaran, handling, program, iklan dan logistik. Pastikan basis dan penerimaan ongkir tiap komponen tidak dihitung ganda.' },
} as const
export type PlatformSlug = keyof typeof platformTools
export const platformTitle = (slug: PlatformSlug) => `Kalkulator Biaya Admin ${platformTools[slug].name} (Simulasi Tarif Penjual)`
export const platformDescription = (slug: PlatformSlug) => `Hitung simulasi dana cair ${platformTools[slug].name}, biaya manual dengan basis dan cap eksplisit, serta hasil setelah HPP. Tanpa tarif resmi otomatis.`
export const platformEngine = calculatePlatformSettlement
