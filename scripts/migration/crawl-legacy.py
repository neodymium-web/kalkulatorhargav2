"""Public GET-only survey. No auth, mutations, cross-origin crawling or robots-disallowed paths."""
import urllib.request,urllib.error,urllib.parse,time,json,hashlib,re,datetime,collections,pathlib
from html.parser import HTMLParser
from xml.etree import ElementTree as ET
HOSTS={'kalkulatorharga.com','www.kalkulatorharga.com'}
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):return None
op=urllib.request.build_opener(NoRedirect)
class Page(HTMLParser):
 def __init__(self):super().__init__();self.title=[];self.h1=[];self.links=[];self.canonical=None;self.description=None;self.robots=None;self.tag=None;self.text=[];self.ignored=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['script','style']:self.ignored+=1
  if tag in ['title','h1']:self.tag=tag
  if tag=='a'and a.get('href'):self.links.append(a['href'])
  if tag=='link'and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='meta':
   if a.get('name')=='description':self.description=a.get('content')
   if a.get('name')=='robots':self.robots=a.get('content')
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.ignored=max(0,self.ignored-1)
  if tag==self.tag:self.tag=None
 def handle_data(self,s):
  if self.ignored:return
  if self.tag=='title':self.title.append(s)
  if self.tag=='h1':self.h1.append(s)
  if s.strip():self.text.append(s.strip())
def norm(url,base):
 u=urllib.parse.urlsplit(urllib.parse.urljoin(base,url))
 if u.scheme not in ['http','https']or u.hostname not in HOSTS:return None
 if u.path.startswith(('/api/','/studio')):return None
 if re.search(r'\.(png|jpg|jpeg|svg|ico|webp|js|css|pdf)$',u.path,re.I):return None
 return urllib.parse.urlunsplit((u.scheme,u.netloc,u.path or '/','',''))
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
queue=collections.deque();provenance=collections.defaultdict(set)
def add(url,source):
 if url is not None:
  if url not in provenance:queue.append(url)
  provenance[url].add(source)
for host in sorted(HOSTS):
 for path in ['/','/robots.txt','/sitemap.xml']:add('https://'+host+path,'explicit-seed')
records=[];cache=pathlib.Path('/tmp/issue53-legacy');cache.mkdir(exist_ok=True)
checkpoint=pathlib.Path('docs/audit/cutover/legacy-network.json')
if checkpoint.exists():
 previous=json.loads(checkpoint.read_text());records=previous['records'];done={r['url']for r in records}
 for url in previous['pending']:add(url,'checkpoint-discovery')
 queue=collections.deque(u for u in queue if u not in done)
 for r in records:
  for source in r.get('discoveredFrom',[]):provenance[r['url']].add(source)
while queue and len(records)<180:
 url=queue.popleft();current=url;chain=[];body=b'';headers={};error=None;start=now()
 for hop in range(8):
  time.sleep(.35)
  try:r=op.open(urllib.request.Request(current,headers={'User-Agent':'KalkulatorHarga-MigrationAudit/1.0 (Issue53; read-only GET)'}),timeout=20)
  except urllib.error.HTTPError as e:r=e
  except Exception as e:error=type(e).__name__+': '+str(e);break
  headers={k.lower():v for k,v in r.headers.items() if k.lower() in ['content-type','location','x-robots-tag','server','etag','last-modified']};status=r.code
  chain.append({'url':current,'status':status,'location':headers.get('location')})
  try:body=r.read(3000000)
  except Exception as e:error='Body read failed: '+type(e).__name__;body=b'';break
  if status in [401,403,429]:error='Access/rate limit: not bypassed';break
  if status not in [301,302,303,307,308]:break
  target=norm(headers.get('location',''),current)
  if not target:error='Redirect outside allowed hosts: not followed';break
  if target in [x['url']for x in chain]:error='Redirect loop';break
  current=target
 row={'url':url,'checkedAtUtc':start,'method':'public GET, sequential,350ms per request,20s timeout','discoveredFrom':[],'chain':chain,'finalUrl':current,'status':chain[-1]['status']if chain else None,'headers':headers,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'error':error}
 text=body.decode('utf-8',errors='replace')
 if not error and 'text/html' in headers.get('content-type','')and row['status']==200:
  p=Page();p.feed(text);row.update(title=''.join(p.title),h1=p.h1,description=p.description,canonical=p.canonical,robots=p.robots,links=p.links,excerpt=' '.join(p.text)[:1600]);(cache/(row['sha256']+'.html')).write_bytes(body)
  for link in p.links:add(norm(link,current),current)
 elif ('xml'in headers.get('content-type','')or current.endswith('.xml'))and row['status']==200:
  try:
   xml=ET.fromstring(body);locs=[el.text for el in xml.iter()if el.tag.rsplit('}',1)[-1]=='loc'];row['sitemapLocs']=locs
   for loc in locs:add(norm(loc,current),'sitemap:'+current)
  except ET.ParseError as e:row['xmlError']=str(e)
 elif current.endswith('robots.txt')and row['status']==200:
  row['robotsText']=text
  for loc in re.findall(r'^Sitemap:\s*(.+)$',text,re.M|re.I):add(norm(loc.strip(),current),'robots:'+current)
 records.append(row)
 pathlib.Path('docs/audit/cutover/legacy-network.json').write_text(json.dumps({'baseline':'ec4bdb2b42ca7db16eea9ee74b1a7a23c5db5a44','records':records,'pending':list(queue)},ensure_ascii=False,indent=2)+'\n')
 print(row['status'],url,flush=True)
 if row['status']==429:break
for row in records:row['discoveredFrom']=sorted(provenance[row['url']])
pathlib.Path('docs/audit/cutover/legacy-network.json').write_text(json.dumps({'baseline':'ec4bdb2b42ca7db16eea9ee74b1a7a23c5db5a44','records':records,'pending':list(queue),'limitations':['Public crawl is not indexed footprint','GSC/GA4/backlinks UNKNOWN','No secret/auth bypass or production changes']},ensure_ascii=False,indent=2)+'\n')
print('Complete',len(records),'pending',len(queue))
