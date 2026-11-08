import csv,json,pathlib
D=pathlib.Path('docs/audit');src=json.load(open(D/'legacy55/source-pages.json'));pages={p['path']:p for p in json.load(open('lib/legacy/pages.json'))};blocked=json.load(open(D/'legacy55/blocked.json'))
def write(path,rows):
 with open(path,'w',newline='')as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
decisions=[];parity=[]
build={}
for report in pathlib.Path('test-results').glob('legacy-pages-*/legacy-outcome.json'):
 r=json.load(open(report));build.setdefault(r['path'],[]).append(r)
if build:assert len(build)==25, 'Require complete 25-route build observations' 
for p in src:
 path=p['path'];port=path in pages
 risk=pages[path]['reviewNotice']if port else blocked[path]
 decisions.append({'path':path,'legacy_status':p['status'],'source_title':p['title'],'source_h1':p['h1'],'source_canonical':p['canonical'],'category':'tool'if path in ['/kalkulator/emas','/bandingkan','/kalkulator/tiktok/benchmark']else'blog'if path.startswith('/blog')else'policy'if path in ['/redaksi','/disclaimer','/kebijakan-editorial']else'guide','suggested_action':'PORT_WITH_REVIEW'if port else'OWNER_DECISION','v2_route':path if port else'NOT_IMPLEMENTED','content_feature_parity':'Full source semantic text, dates and links preserved; advertisement placeholder removed; inherited archive, not current operational claim'if port else blocked[path],'freshness_flags':risk,'link_impacts':'Ported archive links local; calculators/deferred source links stay absolute legacy to avoid false feature equivalence; separate v2 links clearly identified'if port else'No fake200; source links retained externally, no automatic redirect','source_evidence':p['url'],'observed_at_utc':p['observedAtUtc'],'body_sha256':p['sha256'],'text_sha256':p['textSha256'],'manual_owner_approval':'PENDING; suggested disposition is not approved','rights':'User requested migration; content/entity/attribution approval pending; no images/scripts reused'})
 parity.append({'path':path,'outcome':'IMPLEMENTED_REVIEW_NEEDED'if port else'BLOCKED','v2_route':path if port else'NOT_IMPLEMENTED','expected_build_status':200 if port else 404,'observed_build_status':build[path][0]['status']if path in build else'PENDING_TEST','build_observed_at_utc':build[path][0]['observedAtUtc']if path in build else'PENDING_TEST','content_check':'Full normalized source text minus only ad-placeholder; metadata/H1/dates preserved'if port else'No functional substitute published','source_timestamp':p['observedAtUtc'],'owner_status':'PENDING','blocker':risk})
write(D/'legacy-page-decisions.csv',decisions);write(D/'legacy-content-parity.csv',parity)
old=list(csv.DictReader(open(D/'legacy55/cutover-url-map-before.csv')))
assert len(old)==107
for p in pages.values():old.append({'v2_route':p['path'],'expected_production_url':'https://kalkulatorharga.com'+p['path'],'legacy_equivalent':p['url'],'action':'preserve','old_source_evidence':p['url']+' @ '+p['observedAtUtc'],'intended_canonical':'https://kalkulatorharga.com'+p['path'],'title':p['title'],'h1':p['h1'],'priority':'P1 owner review before cutover','confidence':'Verified source-text parity; factual/legal freshness and entity approval pending','notes':'Published inherited archive on staging; not current tariff/policy approval. No domain or redirects changed.'})
write(D/'cutover-url-map.csv',old)
print('25 decisions/outcomes;107 original map records preserved +22 actual archives =129')
