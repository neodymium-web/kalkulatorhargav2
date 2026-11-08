import csv,json,pathlib
D=pathlib.Path('docs/audit');root=D/'deferred57'
def read(p):return list(csv.DictReader(open(p)))
def write(p,rows):
 with open(p,'w',newline='')as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
for src,dst in [('cutover-url-map.csv','cutover-map-before.csv'),('legacy-content-parity.csv','parity-before.csv')]:
 if not(root/dst).exists():(root/dst).write_bytes((D/src).read_bytes())
rows=read(root/'cutover-map-before.csv');assert len(rows)==129
for path,title,h1 in [('/kalkulator/emas','Kalkulator Emas dengan Harga Manual','Kalkulator emas dengan harga manual'),('/bandingkan','Bandingkan Marketplace dengan Biaya Manual','Bandingkan marketplace dengan biaya manual')]:
 rows.append({'v2_route':path,'expected_production_url':'https://kalkulatorharga.com'+path,'legacy_equivalent':'https://www.kalkulatorharga.com'+path,'action':'preserve','old_source_evidence':'docs/audit/deferred57/legacy-contracts.json; public GET snapshot8November2026','intended_canonical':'https://kalkulatorharga.com'+path,'title':title+' | KalkulatorHarga','h1':h1,'priority':'P1 owner acceptance of manual scope before cutover','confidence':'Verified arithmetic/manual contract; not live/preset feature parity','notes':'Supplemental tool outside100baseline; no quote/rate defaults, source/feature acceptance pending. No domain or redirect mutation.'})
write(D/'cutover-url-map.csv',rows)
rows=read(root/'parity-before.csv')
for r in rows:
 if r['path']in ['/kalkulator/emas','/bandingkan']:
  r.update(outcome='IMPLEMENTED_BOUNDED_MANUAL_REVIEW_NEEDED',v2_route=r['path'],expected_build_status='200',observed_build_status='PENDING_TEST',build_observed_at_utc='PENDING_TEST',content_check='Functional manual tool, not legacy source-text copy or live/preset parity',blocker='Owner acceptance of manual scope; live quote/preset/legal/license parity not approved')
write(D/'legacy-content-parity.csv',rows)
records=json.load(open(root/'legacy-contracts.json'));bench=next(r for r in records if r['path']=='/kalkulator/tiktok/benchmark')
rows=[]
for table in bench['tables']:
 headers=table['rows'][0]
 for row in table['rows'][1:]:rows.append({'source_path':bench['path'],'table_caption':' | '.join(table['caption']),'headers':' | '.join(headers),'observed_values':' | '.join(row),'observed_at_utc':bench['observedAtUtc'],'body_sha256':bench['sha256'],'denominator_scope':'Perfollowers median/quantiles; perviews mean or study-specific. Never combine as one cohort. See header/source text.','geography':'UNKNOWN unless independently documented by dataset owner','period':'Legacy labels2026/previous quarters; precise window not verified','quantile_method':'UNKNOWN; no licensed raw dataset/reproducible cohort supplied','rights':'UNVERIFIED; attribution alone is not permission','frontend_status':'DEFERRED404; evidence only, not published benchmark'})
write(root/'benchmark-inventory.csv',rows)
print('Map131;22archives+2boundedmanual+1blocked across25;benchmark rows',len(rows))
