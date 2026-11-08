"""Create review sheets from actual screenshots; original images remain unchanged."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageOps,ImageDraw
out=Path('/tmp/issue51-visual-review');out.mkdir(exist_ok=True)
index=[]
for p in sorted(Path('test-results').glob('release-audit-*/audit.json')):
 r=json.loads(p.read_text())
 if 'axeInitial' not in r:continue
 device='mobile' if r['viewport']==375 else 'desktop';slug=r['path'].strip('/').replace('/','-') or 'home'
 original=p.parent/'initial-viewport.jpg';im=Image.open(original).convert('RGB')
 if device=='mobile':
  left=ImageOps.contain(im,(750,1800));W,H=1500,1860
 else:left=ImageOps.contain(im,(1440,900));W,H=2140,1860
 canvas=Image.new('RGB',(W,H),'white');draw=ImageDraw.Draw(canvas);draw.text((12,12),r['path']+' | '+device+' | actual screenshot pixels',fill='black');canvas.paste(left,(0,45))
 full=Image.open(p.parent/('result-full.jpg' if 'id' in r else 'initial.jpg')).convert('RGB');thumb=ImageOps.contain(full,(650,450));canvas.paste(thumb,(W-670,H-460))
 if 'id' in r:
  result=Image.open(p.parent/'result.jpg').convert('RGB');crop=result.crop((0,0,result.width,min(result.height,round(result.width*2.3))));right=ImageOps.contain(crop,(680,1360));canvas.paste(right,(W-690,45))
  draw.text((W-690,1415),'Full-page structure thumbnail below',fill='black')
 filename=f'{device}-{slug}.jpg';canvas.save(out/filename,quality=90)
 index.append({'path':r['path'],'device':device,'reviewSheet':filename,'artifactDirectory':p.parent.name,'initialScreenshotSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'fullPage':str(p.parent/('result-full.jpg' if 'id' in r else 'initial.jpg')),'state':'initial + computed result + fullpage structure' if 'id' in r else 'initial + fullpage structure','inspection':'PENDING'})
Path('docs/audit/screenshot-index.json').write_text(json.dumps(index,indent=2,ensure_ascii=False)+'\n')
print('review sheets',len(index),'at',out)
