import csv,json,pathlib,urllib.request,urllib.error,time,hashlib,datetime
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
rows=[r for r in csv.DictReader(open('docs/audit/legacy-url-inventory.csv'))if r['mapping_decision']=='manual-review']
root=pathlib.Path('/tmp/issue55-source');root.mkdir(exist_ok=True)
records=[]
for row in rows:
 url=row['old_url'];path=url.removeprefix('https://www.kalkulatorharga.com');time.sleep(.4)
 req=urllib.request.Request(url,headers={'User-Agent':'KalkulatorHarga-LegacyParityAudit/1.0 (Issue55; public GET only)'})
 try:
  with opener.open(req,timeout=25)as r:
   data=r.read(3000000);record={'path':path,'url':url,'finalUrl':r.url,'status':r.status,'observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'contentType':r.headers.get('Content-Type')}
  (root/(path.strip('/').replace('/','__')+'.html')).write_bytes(data)
 except urllib.error.HTTPError as e:
  record={'path':path,'url':url,'status':e.code,'error':'HTTP access/redirect error; not bypassed'}
  records.append(record);pathlib.Path('docs/audit/legacy55/network.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n');raise SystemExit('Stop survey: HTTP '+str(e.code))
 except Exception as e:record={'path':path,'url':url,'error':str(e)}
 records.append(record);pathlib.Path('docs/audit/legacy55/network.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n');print(record['path'],record.get('status',record.get('error')),flush=True)
