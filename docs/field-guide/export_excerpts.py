# coding: utf-8
"""Export literal PDF crops for portfolio figures. Usage: python export_excerpts.py OUTPUT_DIR"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image
import build_guide as g

target=Path(sys.argv[1]);target.mkdir(parents=True,exist_ok=True)
qa=g.OUT/'excerpt-renders';qa.mkdir(exist_ok=True)
manifest={}
for lang in ['zh','en']:
    meta=json.loads((g.OUT/f'excerpts-{lang}.json').read_text())
    pdf=g.ROOT/f'output/pdf/youfeed-field-guide-{lang}.pdf'
    for key,item in meta.items():
        page=item['page'];prefix=qa/f'{lang}-{page}'
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r','144','-singlefile','-png',str(pdf),str(prefix)],check=True,capture_output=True)
        image=Image.open(str(prefix)+'.png');sx=image.width/g.W;sy=image.height/g.H
        def crop(box):
            left,bottom,right,top=box
            return image.crop((round(left*sx),round((g.H-top)*sy),round(right*sx),round((g.H-bottom)*sy)))
        if key=='regions':
            l,b,r,t=item['box']
            boxes=[[l+i*176,b,l+i*176+163,t] for i in range(3)]
            names=[f'region-{x}-{lang}.png' for x in ['a','p','t']]
        elif key=='prompts':
            boxes=item['boxes'];names=[f'prompt-{x}-{lang}.png' for x in ['02','03']]
        else:
            boxes=[item['box']];names=[f'recovery-e1-{lang}.png']
        for box,name in zip(boxes,names):
            result=crop(box);result.save(target/name,optimize=True)
            manifest[name]={'width':result.width,'height':result.height,'source':pdf.name,'page':page,'crop_pdf_points':box}
(target/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({name:[d['width'],d['height']] for name,d in manifest.items()},indent=2))
