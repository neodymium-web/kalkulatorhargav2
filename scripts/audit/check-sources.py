"""Network accessibility is evidence, not proof of source applicability."""
import json,urllib.request,urllib.error,hashlib,re,time,concurrent.futures
from pathlib import Path
catalog=json.loads(Path('docs/audit/catalogue.json').read_text());urls=sorted(set(s['url'] for t in catalog['tools'] for s in t['sources']))
cache=Path('/tmp/issue51-sources');cache.mkdir(exist_ok=True)
def check(url):
 start=time.monotonic();r={'url':url,'checkedAt':'2026-11-08','method':'GET urllib,15s timeout,4 workers'}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 audit source verification'}),timeout=15) as f:
   body=f.read(20000000);r.update(status=f.status,finalUrl=f.url,contentType=f.headers.get('Content-Type',''),bytes=len(body),sha256=hashlib.sha256(body).hexdigest())
   text=body.decode('utf-8','replace');r['title']=re.sub('<[^>]+>','',m.group(1)).strip() if (m:=re.search(r'<title[^>]*>(.*?)</title>',text,re.S|re.I)) else None; r['accessBlockPage']=bool(re.search(r'Permintaan Akses Tidak Dapat Diproses|Access Denied|Just a moment',r['title'] or text[:500],re.I)); r['requiresJavaScript']=bool(re.search(r"We're sorry but react app|Please enable JavaScript to continue",text[:3000],re.I))
   if 'pdf' in r['contentType'].lower(): (cache/(r['sha256']+'.pdf')).write_bytes(body)
 except urllib.error.HTTPError as e:r.update(status=e.code,error=str(e),finalUrl=e.url)
 except Exception as e:r.update(status=None,error=type(e).__name__+': '+str(e))
 r['seconds']=round(time.monotonic()-start,2);return r
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(check,urls))
Path('docs/audit/source-network.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'urls':len(results),'http200':sum(r['status']==200 for r in results),'blocked':sum(r.get('accessBlockPage',False) for r in results),'non200':[(r['url'],r['status']) for r in results if r['status']!=200]},indent=2))
