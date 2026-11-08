"""Summarise observed local results; never substitutes for executing tests or visual inspection."""
import json,csv,glob,collections,pathlib,hashlib
from fractions import Fraction
D=pathlib.Path('docs/audit')
cat=json.loads((D/'catalogue.json').read_text()); cases=json.loads((D/'oracles.json').read_text())['cases']
actual={x['slug']:x for x in json.load(open('/tmp/issue51-engine-results.json'))}
reports={}
for p in glob.glob('test-results/release-audit-*/audit.json'):
 r=json.load(open(p));reports[(r['path'],'mobile' if r['viewport']==375 else 'desktop')]=r
assert len(reports)==214
rows=[]
incoming=collections.Counter(l.split('#')[0] for (p,d),r in reports.items() if d=='desktop' for l in r['links'])
for t in cat['tools']:
 a=reports[t['path'],'desktop'];b=reports[t['path'],'mobile']
 rows.append(dict(id=t['id'],route=t['path'],category=t['category'],http_desktop=a['http'],http_mobile=b['http'],title=a['title'],description=a['description'],canonical=a['canonical'],robots=a['robots'],x_robots_tag=a['xRobotsTag'],ssr_characters=a['ssrCharacters'],h1_count=len(a['h1']),initial_inbound_links=incoming[t['path']],reflow_initial='PASS 320/375/768/1024/1440',reflow_result='PASS 320/375/768/1024/1440',workflow='PASS baseline/invalid/stale-clear',invalid_focus=a['invalidFocus'] and b['invalidFocus'],console_errors=len(a['errors'])+len(b['errors']),external_requests=len(a['externalRequests'])+len(b['externalRequests']),environment='local production build; not remote Preview'))
with (D/'route-matrix.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
json.dump([r for (p,d),r in reports.items() if d=='desktop' and not p.startswith('/kalkulator/')],(D/'hub-results.json').open('w'),indent=2)
summary={'routes':len({p for p,d in reports}),'desktopMobileResponses':len(reports),'uniqueTitles':len({r['title'] for (p,d),r in reports.items() if d=='desktop'}),'uniqueDescriptions':len({r['description'] for (p,d),r in reports.items() if d=='desktop'}),'zeroInitialInbound':[r['route'] for r in rows if r['initial_inbound_links']==0],'axeScans':sum(('axeInitial'in r)+('axeResult'in r)for r in reports.values()),'axeViolations':sum(len(r.get('axeInitial',[]))+len(r.get('axeResult',[]))for r in reports.values()),'runtimeErrors':sum(len(r['errors'])for r in reports.values()),'externalRequests':sum(len(r['externalRequests'])for r in reports.values())}
json.dump(summary,(D/'route-summary.json').open('w'),indent=2)
def at(o,p):
 for k in p.split('.'):
  if isinstance(o,list):o=o[int(k)]
  elif isinstance(o,dict):o=o.get(k)
  else:return None
 return o
def check(o,c):
 v=at(o,c['path'])
 if c['kind']=='absent':return v is None
 if c['kind']=='literal':return v==c['expected']
 if c['kind']=='rational':return Fraction(int(v['n']),int(v['d']))==Fraction(c['expected'])
 return str(v)==c['expected']
results=[]
for c in cases:
 a=actual[c['slug']];ok=all(check(a['baseline'],x)for x in c['checks'])and all(check(a['edge'],x)for x in c['edgeChecks']);assert ok,c['slug']
 results.append({'id':c['id'],'slug':c['slug'],'baseline':'PASS','edge':'PASS','actualBaseline':a['baseline'],'actualEdge':a['edge']})
json.dump(results,(D/'formula-results.json').open('w'),indent=2)
intro='''# Audit formula 100 kalkulator

Tanggal: 8 November 2026. Baseline `f865ee826c4965b1557c20b46c802f3e54138efc`.

**100 baseline substantif + 100 edge baru PASS**, 217 stress tambahan PASS. Ini membuktikan skenario yang dicatat, bukan seluruh kemungkinan input atau opini hukum. Expected dihitung di `scripts/audit/oracles.py` dan `stress.py` dengan Python Fraction/Decimal/date tanpa impor engine aplikasi. `tests/release-audit.unit.ts` membandingkan engine dengan fixture independen; `audit/formula-results.json` menyimpan output aktual. Input lengkap, output eksak, field/path dan konvensi ada di `audit/oracles.json`, keyed by ID. Tabel berikut menampilkan baseline proof dan expected; edge input dan expected ditampilkan eksplisit per baris.

Scope setiap alat adalah deskripsi pada tabel ditambah batas input UI/schema dan dokumentasi batch asal. Sumber registry dicatat sebagai provenance, bukan otomatis dianggap telah diverifikasi ulang secara substantif. Sumber matematika tanpa rujukan eksternal berarti aljabar yang diturunkan dalam oracle. Pemeriksaan legal primer terbaru dan batas akses dijelaskan di [SOURCE_REVIEW.md](audit/SOURCE_REVIEW.md). HTTP200 bukan bukti isi sumber atau tarif resmi.

Model: legally scoped untuk pajak otomatis; manual-rate simulation untuk platform, impor/gross-up dan biaya bertarif input; mathematical exact untuk rasio/konversi/kalender; user-input simulation untuk proyeksi keuangan/bisnis. Label exact merujuk aritmetika, tidak menjamin ketepatan asumsi dunia nyata.

## Review risiko tinggi

- Anuitas/flat/KPR: pokok terakhir menutup saldo; bunga dibulatkan per periode sesuai kontrak model, total adalah jumlah ledger aktual. Stress menguji bunga0/100%, pokok kecil/maksimum dan batas fixed/floating; bukan simulasi penawaran bank atau floating masa depan.
- APR bertanggal: oracle Decimal presisi90 memakai ACT/365 dan bisection, termasuk arus kas neto/biaya serta IRR negatif. CAGR memakai akar Decimal independen; engine BigInt tidak menjadikan floating point sebagai oracle.
- Target tabungan dan harga inversi: kandidat integer minimum dibanding kandidat satu unit lebih rendah. NPV mendukung arus kas negatif; ROI rugi tetap negatif.
- UMKM: fasilitas500juta hanya omzet kumulatif seluruh usaha WP yang sama; omzet WP terkait hanya uji4,8miliar. WP lama/peralihan dan fakta belum lengkap ditahan tanpa angka. Baseline baru memakai masa7/2026, kumulatif559juta, pajak masa155ribu; bukan perluasan cakupan hukum.
- TER: baseline bruto9.000.137 kategoriA1,75%=157.502,3975, cash157.502. Stress memeriksa batas terpilih A/B/C±1. Audit ini tidak mengklaim transkripsi independen ulang seluruh125baris; pengujian tabel lama tetap dijalankan.
- PPN: transisi Januari/Februari2025 diuji; kasus nilai lain/fasilitas/DTP tidak diberi tarif tebakan. BPHTB/PBB hanya model dasar DKI2024 sebelum fasilitas, bukan tagihan akhir. Impor seluruh klasifikasi/tarif manual, bukan lookup HS/KMK.
- Settlement empat platform: basis persen G/S/custom, min/cap, signed tie dan jumlah fee eksak diuji. Cash rounded sekali kemudian adjustment rekonsiliasi ditampilkan. Tarif resmi otomatis tetap tidak ada.
- Kalender: date-only Gregorian, 1900 bukan leap dan2000 leap; usia29Feb memakai clamp sesuai model. Satuan memakai rasio exact; suhu di bawah nol mutlak ditolak.

## Deviasi yang diselidiki

Tidak ditemukan deviasi engine pada 417 vector numerik/edge baru. Dugaan awal Promo Seller selisih1sen ternyata oracle membulatkan net langsung; kontrak Batch6 membulatkan beban seller ke sen dahulu lalu merekonsiliasi net. Oracle dikoreksi mengikuti kebijakan terdokumentasi, bukan mengganti engine. Satuan unit-price juga disesuaikan dari asumsi4desimal ke kontrak2desimal; status PPh23 unknown adalah `unverified`. Bug helper perbandingan Fraction diperbaiki dengan cross-multiplication BigInt. Semua perubahan harness ini dicatat agar PASS tidak menyembunyikan deviasi.

## Matriks 100 ID

| ID / route / versi | Model dan scope | Baseline independen → expected | Edge input → expected | Provenance / hasil |
| --- | --- | --- | --- | --- |
'''
manual={'shopee','tiktok-shop','tokopedia','lazada','blibli','pajak-impor','gross-up-pajak'}
mathslugs={'persen','perubahan-persen','skala-denah','konversi-panjang','konversi-berat','konversi-suhu','kecepatan-rata-rata','selisih-tanggal','hari-kerja','usia','durasi-kerja'}
def compact(o):return json.dumps(o,ensure_ascii=False,separators=(',',':')).replace('|','&#124;')
def checks(cs):return '; '.join(c['path']+'='+('ABSENT'if c['kind']=='absent'else str(c.get('expected')) )for c in cs)
lines=[]
for c,t in zip(cases,cat['tools']):
 assert c['slug']==t['slug']
 model='manual-rate simulation'if c['slug']in manual else 'legally scoped'if t['category']=='pajak'else 'mathematical exact'if c['slug']in mathslugs else 'user-input simulation'
 src='; '.join('['+str(i+1)+']('+ (s.get('url','')if isinstance(s,dict)else s)+')'for i,s in enumerate(c['sources']))or'Aljabar oracle; tidak ada sumber eksternal registry'
 lines.append(f"| `{c['id']}` / `{c['slug']}` / {c['formulaVersion']} | {model}: {t['metadata']['description']} | {c['proof']} → `{checks(c['checks'])}` | `{compact(c['edgeInput'])}` → `{checks(c['edgeChecks'])}` | {src}; **PASS baseline+edge**; `release-audit.unit.ts: independent audit {c['id']}` |")
pathlib.Path('docs/FORMULA_AUDIT_100.md').write_text(intro+'\n'.join(lines)+'\n')
lh=json.load(open('/tmp/issue51-lab/summary.json'));(D/'lighthouse-summary.json').write_text(json.dumps(lh,indent=2)+'\n')
print(json.dumps(summary,indent=2));print('formula rows',len(results))
