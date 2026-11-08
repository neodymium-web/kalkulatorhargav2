"""Contact sheets of actual captures; generating a sheet does not mark it inspected."""
from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
import hashlib,json
routes=['home','bisnis','marketplace','keuangan','pajak','media-sosial','sehari-hari','kalkulator-food-cost','kalkulator-hpp','kalkulator-pph-final-umkm'];idx=[]
for phase in ['baseline','candidate']:
 root=Path('/tmp/issue53-visual')/(phase+'-fresh')
 if not (root/'1440-kalkulator-pph-final-umkm.jpg').exists():continue
 out=Path('docs/audit/cutover/visual-baseline')if phase=='baseline'else Path('/tmp/issue53-visual-review');out.mkdir(exist_ok=True)
 for width in [375,1440]:
  for part in [0,1]:
   W=1000 if width==375 else 2200;H=2700;sheet=Image.new('RGB',(W,H),'white');d=ImageDraw.Draw(sheet)
   for i,slug in enumerate(routes[part*5:part*5+5]):
    p=root/f'{width}-{slug}.jpg';im=Image.open(p);col=i%2;row=i//2;cellW=W//2;top=row*900;d.text((col*cellW+8,top+4),f'{phase.upper()} {width}px {slug}',fill='black');view=ImageOps.contain(im.crop((0,0,im.width,min(im.height,900))),(cellW-20,850));sheet.paste(view,(col*cellW+8,top+30));idx.append({'phase':phase,'route':slug,'width':width,'originalSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'originalDimensions':im.size,'sheet':f'{phase}/{width}-{part+1}.jpg','inspection':'PENDING'})
   sheet.save(out/f'{width}-{part+1}.jpg',quality=85)
Path('docs/audit/cutover/visual-index.json').write_text(json.dumps(idx,indent=2)+'\n');print('contact-sheet frames',len(idx))
