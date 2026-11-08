"""Build review-only mapping from observed legacy pages, never installs redirect rules."""
import json,csv,pathlib,urllib.parse,collections
D=pathlib.Path('docs/audit');cat=json.load(open(D/'catalogue.json'));data=json.load(open(D/'cutover/legacy-network.json'));records=data['records'];pages=[r for r in records if r.get('title')]
# Equivalence is editorially reviewed from fetched title/H1/excerpt, not inferred by slug alone.
preserve={'/':'/','/kalkulator/shopee':'/kalkulator/shopee','/kalkulator/lazada':'/kalkulator/lazada','/kalkulator/tiktok-shop':'/kalkulator/tiktok-shop','/kalkulator/tiktok':'/kalkulator/tiktok'}
redirects={'/kalkulator':'/','/kalkulator/saham/average':'/kalkulator/rata-rata-beli-saham'}
byPath={urllib.parse.urlsplit(r['url']).path:r for r in pages if urllib.parse.urlsplit(r['url']).hostname=='www.kalkulatorharga.com'}
incoming=collections.Counter()
for r in pages:
 for link in set(r['links']):
  u=urllib.parse.urlsplit(urllib.parse.urljoin(r['finalUrl'],link));incoming[urllib.parse.urlunsplit((u.scheme,u.netloc,u.path or '/','',''))]+=1
rows=[]
for r in records:
 path=urllib.parse.urlsplit(r['url']).path;dest=preserve.get(path)or redirects.get(path);html=bool(r.get('title'))
 decision='preserve'if path in preserve else 'redirect-301'if path in redirects else 'manual-review'if html else 'control-file-review'
 note='Intent matches; manual-fee v2 does not preserve legacy automatic tariff presets. Owner must accept capability/content change.'if path in ['/kalkulator/shopee','/kalkulator/lazada','/kalkulator/tiktok-shop']else 'Creator intent preserved; never redirect to seller TikTok Shop.'if path=='/kalkulator/tiktok'else 'Directory intent matches root v2, not an arbitrary homepage redirect.'if path=='/kalkulator'else 'Average purchase cost intent matches; owner must review legacy break-even extras before approval.'if path in redirects else 'No equivalent content in 107-route v2 inventory; retain/port or explicit owner decision before cutover.'if decision=='manual-review'else 'Public observation only; GSC/GA4 and registrar ownership UNKNOWN.'
 rows.append({'old_url':r['url'],'status':r['chain'][0]['status']if r['chain']else'UNKNOWN','final_status':r['status'],'redirect_target':r['chain'][0].get('location')or'','redirect_chain':json.dumps(r['chain'],separators=(',',':')),'canonical':r.get('canonical')or'','title':r.get('title')or'','h1':' | '.join(r.get('h1',[])),'inbound_observed':incoming[r['url']],'v2_destination':'https://kalkulatorharga.com'+dest if dest else'','mapping_decision':decision,'evidence_url':r['url'],'evidence_time_utc':r['checkedAtUtc'],'body_sha256':r['sha256'],'action_priority':'P1 launch blocker'if decision=='manual-review'else'P2 review','notes':note})
def write(name,rows):
 with(D/name).open('w')as f:w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
write('legacy-url-inventory.csv',rows)
meta={t['path']:t['metadata']for t in cat['tools']};hubTitles={'/':'Direktori Kalkulator Indonesia','/bisnis':'Kalkulator Bisnis','/marketplace':'Kalkulator Marketplace','/keuangan':'Kalkulator Keuangan','/pajak':'Kalkulator Pajak','/media-sosial':'Kalkulator Media Sosial','/sehari-hari':'Kalkulator Sehari-hari'}
graph=D/'cutover/ssr-graph.json'
observed={r['path']:r for r in json.load(open(graph))['rows']}if graph.exists()else{}
mapRows=[]
for path in cat['paths']:
 old=[p for p,d in preserve.items()if d==path and p in byPath];proposed=[p for p,d in redirects.items()if d==path and p in byPath];sources=old+proposed
 action='preserve'if old else 'redirect-301'if proposed else 'new'
 title=meta[path]['title']if path in meta else hubTitles[path]
 mapRows.append({'v2_route':path,'expected_production_url':'https://kalkulatorharga.com'+path,'legacy_equivalent':' | '.join('https://www.kalkulatorharga.com'+p for p in sources),'action':action,'old_source_evidence':' | '.join(byPath[p]['url']+' @ '+byPath[p]['checkedAtUtc']for p in sources)or'Not observed in public crawl; indexed footprint UNKNOWN','intended_canonical':'https://kalkulatorharga.com'+(path if path!='/'else''),'title':title+(' | KalkulatorHarga'if path!='/'else''),'h1':title,'priority':'P1 review before cutover'if sources else'P2 provisional new','confidence':'reviewed-intent; owner acceptance required'if sources else'provisional-public-crawl-only','notes':'Host www→apex needs separate approval; current legacy apex→www308 must not be left in place. No active redirects in this PR.'})
assert len(mapRows)==len({r['v2_route']for r in mapRows})==107
for row in mapRows:
 if row['v2_route']in observed:
  actual=observed[row['v2_route']];row['title']=actual['title'];row['h1']=' | '.join(actual['h1'])
write('cutover-url-map.csv',mapRows)
write('redirect-proposals.csv',[{'source':p,'destination':d,'status':'301','approved_for_production':'no','rationale':'Existing calculator directory → v2 directory at root'if p=='/kalkulator'else'Average purchase cost; review legacy break-even extras','evidence_url':byPath[p]['url'],'scope':'dry-run fixture only; never imported by Next config'}for p,d in redirects.items()])
print('Legacy responses',len(rows),'HTML routes',len(byPath),'manual-review',sum(r['mapping_decision']=='manual-review'for r in rows),'v2',len(mapRows))
