"""Generate reviewed inherited content; never builds deferred calculator placeholders."""
import json,pathlib,hashlib
source=json.load(open('docs/audit/legacy55/source-pages.json'))
blocked={
 '/kalkulator/emas':'Harga emas/buyback bertanggal, kadar/berat, biaya dan sumber harga; input3/select1/button4. Data harga dan kesetaraan interaksi belum diverifikasi. Perlu task terpisah dengan fixture harga, konversi kadar, spread, biaya, stale/error state dan lisensi sumber.',
 '/kalkulator/tiktok/benchmark':'Tiga tabel studi pihak ketiga memerlukan verifikasi dataset, periode/sampel, hak republication, penyebut ER dan kuartil. Tidak ada form pada SSR; angka/sumber benchmark belum disahkan. Pertahankan legacy sampai audit sumber dan acceptance task terpisah.',
 '/bandingkan':'Tabel preset Fashion100000/HPP60000 belum setara dengan simulasi manual v2. Contoh Tokopedia/TikTok: admin9,25% dan proses1250 tetapi dana cair81500; komponen8000 tambahan tidak direkonsiliasi dalam kolom tabel. Jangan menebak tarif; perlu ledger komponen, cap, scope dan primary-source verification.'}
pages=[]
for p in source:
 if p['path']in blocked:continue
 risk='Teks, byline dan tanggal berikut diwarisi dari situs lama. Klaim tarif, sumber, fitur dan proses belum diverifikasi ulang untuk v2; ini bukan data resmi terbaru. Kalkulator seller v2 memakai biaya manual, bukan preset legacy.'
 if p['path']in ['/metodologi','/redaksi','/kebijakan-editorial','/disclaimer']:risk+=' Pernyataan entity, kebijakan, privasi, username lookup dan tanggung jawab adalah teks legacy, bukan janji operasional v2 yang telah disahkan. Pemilik wajib meninjaunya sebelum production.'
 if p['path']=='/kalkulator/tiktok/panduan':risk+=' Ketersediaan Creator Rewards/negara dan syarat program bersifat historis; v2 hanya simulasi asumsi pengguna dan tidak menyediakan pencarian akun atau tarif resmi.'
 if 'average-down' in p['path']:risk+=' Contoh sumber belum konsisten: harga impas sekitar Rp4.436 dibanding fraksi Rp5, sementara tabel teks menyebut Rp10 untuk harga Rp2.000–Rp5.000. Fee beli contoh juga belum direkonsiliasi. Jangan gunakan contoh ini untuk order; perlu koreksi owner dan verifikasi primer.'
 if p['path']=='/blog/cek-dana-cair-shopee':risk+=' Teks lama menyebut pembulatan per komponen; v2 merekonsiliasi aggregate rasional dan adjustment, sehingga hasil bisa berbeda dari pembulatan legacy.'
 if p['path']in ['/blog/engagement-rate-tiktok-2026','/blog/pph-22-marketplace']:risk+=' Angka studi/pajak dalam kutipan sumber belum merupakan verifikasi studi atau ketentuan pajak terkini.'
 pages.append({k:p[k]for k in ['path','url','title','h1','description','canonical','dates','observedAtUtc','sha256','textSha256','tree','contentText']}|{'kind':'blog'if p['path'].startswith('/blog/')else'index'if p['path']=='/blog'else'policy'if p['path']in ['/redaksi','/kebijakan-editorial','/disclaimer']else'guide','publication':'published-archive','approval':'PENDING_OWNER_REVIEW','reviewNotice':risk})
pathlib.Path('lib/legacy/pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2)+'\n')
pathlib.Path('lib/legacy/routes.ts').write_text('// Published inherited archives, separate from the 100 calculator registry.\nexport const legacyPaths = '+json.dumps([p['path']for p in pages],ensure_ascii=False,indent=2)+' as const\n')
pathlib.Path('docs/audit/legacy55/blocked.json').write_text(json.dumps(blocked,ensure_ascii=False,indent=2)+'\n')
print(len(pages),'published inherited archives;',len(blocked),'deferred; sitemap',107+len(pages))
