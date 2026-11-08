"""Extract a text/semantic tree from public legacy main, without executable markup."""
import json,pathlib,re,hashlib,urllib.parse
from html.parser import HTMLParser
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SKIP={'script','style','svg','noscript','template'}
KEEP={'h1','h2','h3','h4','h5','h6','p','ul','ol','li','dl','dt','dd','table','caption','thead','tbody','tfoot','tr','th','td','a','strong','b','em','i','span','time','small','br','code','pre','details','summary','blockquote'}
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.root={'tag':'root','children':[]};self.stack=[self.root];self.main=None;self.title=[];self.metadata={};self.jsonld=[];self.script=None;self.inTitle=False
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='title':self.inTitle=True
  if tag=='meta'and attrs.get('name')in ['description','robots']:self.metadata[attrs['name']]=attrs.get('content')
  if tag=='link'and attrs.get('rel')=='canonical':self.metadata['canonical']=attrs.get('href')
  node={'tag':tag,'attrs':attrs,'children':[]};self.stack[-1]['children'].append(node)
  if tag=='main':self.main=node
  if tag not in VOID:self.stack.append(node)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,tag):
  if tag=='title':self.inTitle=False
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i]['tag']==tag:
    node=self.stack[i]
    if tag=='script'and node['attrs'].get('type')=='application/ld+json':
     try:self.jsonld.append(json.loads(''.join(c for c in node['children']if isinstance(c,str))))
     except ValueError:self.jsonld.append({'parseError':True})
    self.stack=self.stack[:i];break
 def handle_data(self,data):
  self.stack[-1]['children'].append(data)
  if self.inTitle:self.title.append(data)
def text(n):
 if isinstance(n,str):return n
 if n['tag']in SKIP:return ''
 return ''.join(text(c)for c in n['children'])
def norm(s):return re.sub(r'\s+',' ',s).strip()
def nodes(n):
 if isinstance(n,str):return [n]
 if n['tag']in SKIP or 'ad-placeholder' in n.get('attrs',{}).get('class','').split():return []
 children=[c for child in n['children']for c in nodes(child)]
 if not children and n['tag']!='br':return []
 attrs={k:v for k,v in n.get('attrs',{}).items()if k in ['href','datetime','colspan','rowspan','scope','start']}
 return [{'tag':n['tag']if n['tag']in KEEP else 'div','attrs':attrs,'children':children}]
def walk(n):
 if isinstance(n,str):return
 yield n
 for c in n['children']:yield from walk(c)
records=json.load(open('docs/audit/legacy55/network.json'));result=[]
for record in records:
 assert record.get('status')==200 and record['finalUrl']=='https://www.kalkulatorharga.com'+record['path']
 raw=(pathlib.Path('/tmp/issue55-source')/(record['path'].strip('/').replace('/','__')+'.html')).read_bytes();assert hashlib.sha256(raw).hexdigest()==record['sha256']
 p=Parser();p.feed(raw.decode());assert p.main
 tree=nodes(p.main)[0];original=norm(text(p.main));assert norm(text(tree))==norm(original.replace('Ruang iklan',''))
 allnodes=list(walk(p.main));h1=[norm(text(n))for n in allnodes if n['tag']=='h1'];assert len(h1)==1
 dates=[{'datetime':n['attrs'].get('datetime'),'text':norm(text(n))}for n in allnodes if n['tag']=='time']
 row={**record,'title':''.join(p.title),'h1':h1[0],**p.metadata,'dates':dates,'jsonLd':p.jsonld,'links':[n['attrs'].get('href')for n in allnodes if n['tag']=='a'],'controls':{t:sum(n['tag']==t for n in allnodes)for t in ['input','button','select','img','iframe']},'text':original,'contentText':norm(text(tree)),'textSha256':hashlib.sha256(original.encode()).hexdigest(),'tree':tree,'rights':'Owner requested migration; responsible entity, attribution and republication approval remain pending. No source images/scripts reused.'}
 result.append(row)
pathlib.Path('docs/audit/legacy55/source-pages.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Extracted',len(result),'full main texts, metadata, dates, JSON-LD and semantic trees; exact normalized text parity')
