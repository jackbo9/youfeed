# coding: utf-8
"""Create paired A4, A3 spreads, bilingual quick reference and separate-language guides."""
import shutil
from pypdf import PdfReader, PdfWriter, Transformation
import build_guide as g

FINAL=g.ROOT/'output/pdf'
FINAL.mkdir(parents=True,exist_ok=True)
for lang in ['zh','en']:
    g.build(lang)
    shutil.copy2(g.OUT/f'youfeed-field-guide-{lang}.pdf',FINAL/f'youfeed-field-guide-{lang}.pdf')
for stem,count in [('youfeed-field-guide',8),('youfeed-field-quick-reference',1)]:
    cn=PdfReader(g.OUT/(stem+'-zh.pdf'));en=PdfReader(g.OUT/(stem+'-en.pdf'))
    assert len(cn.pages)==len(en.pages)==count
    writer=PdfWriter();writer.page_layout='/TwoPageLeft'
    for i in range(count):
        writer.add_page(cn.pages[i]);writer.add_page(en.pages[i])
        writer.add_outline_item(f'Section {i+1:02}',i*2)
    writer.add_metadata({'/Title':'YouFeed / Chinese-English / '+g.VERSION})
    writer.write(FINAL/(stem+'-bilingual.pdf'))
    if count==1:continue
    spread=PdfWriter()
    for i in range(count):
        p=spread.add_blank_page(width=g.W*2,height=g.H)
        p.merge_page(cn.pages[i]);p.merge_transformed_page(en.pages[i],Transformation().translate(tx=g.W))
        spread.add_outline_item(f'Section {i+1:02}',i)
    spread.add_metadata({'/Title':'YouFeed / Bilingual spreads / '+g.VERSION})
    spread.write(FINAL/(stem+'-bilingual-spreads.pdf'))
for name,count in [('youfeed-field-guide-zh.pdf',8),('youfeed-field-guide-en.pdf',8),('youfeed-field-guide-bilingual.pdf',16),('youfeed-field-guide-bilingual-spreads.pdf',8),('youfeed-field-quick-reference-bilingual.pdf',2)]:
    r=PdfReader(FINAL/name)
    assert len(r.pages)==count
    assert all(len(p.extract_text())>100 for p in r.pages)
    print(name,count,'pages; text extraction OK')
