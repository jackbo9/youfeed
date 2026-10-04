# coding: utf-8
"""Shared bilingual layout. Run build_bilingual.py to rebuild all five PDFs."""
from pathlib import Path
import os, re, json
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image
from guide_copy import COPY

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/field-guide-build'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 595.276, 841.89
RED, INK, GRAY, PALE, LINE = '#E0001B', '#292B2D', '#55595B', '#F5F5F2', '#D8D9D6'
BLUE, GREEN = '#245B78', '#276047'
VERSION = 'v1.2 / 2026.10.05'
for name, file in [('CN','STHeiti Light.ttc'),('CNBold','STHeiti Medium.ttc')]:
    env = 'YOUFEED_FONT_BOLD' if name == 'CNBold' else 'YOUFEED_FONT_REGULAR'
    pdfmetrics.registerFont(TTFont(name, os.environ.get(env, '/System/Library/Fonts/'+file), subfontIndex=0))

class Book:
    def __init__(self, path, lang, quick=False):
        self.lang, self.quick = lang, quick
        self.d = COPY[lang]
        self.c = canvas.Canvas(str(path), pagesize=(W,H))
        self.c.setTitle('YouFeed / Field guide / '+lang+' / '+VERSION)
        self.c.setAuthor('YouFeed / Reconstructed from project experience')
        self.styles = {}
        for name,size,leading,bold,color in [('body',10.5,15,False,INK),('small',9,13,False,GRAY),('head',13,18,True,INK),('quote',12,18,False,INK),('table',10,14,False,INK),('incident',10.3,14.4,False,INK)]:
            font = ('CNBold' if bold else 'CN') if lang=='zh' else ('Helvetica-Bold' if bold else 'Helvetica')
            self.styles[name] = ParagraphStyle(name,fontName=font,fontSize=size,leading=leading,textColor=HexColor(color),splitLongWords=False)
        self.n, self.y = 0, 0
        self.md, self.excerpts = [], {}

    def markup(self,text,width,style):
        """Break Chinese at grapheme-like groups, keeping closing punctuation off line starts."""
        st=self.styles[style]
        if self.lang!='zh':
            return escape(text).replace('\n','<br/>').replace('□','<font name="CN">□</font>')
        paragraphs=[]
        for source in text.split('\n'):
            tokens=re.findall(r'[A-Za-z0-9_]+(?:[./-][A-Za-z0-9_]+)*|\s+|.', source)
            groups=[]; opening=''
            for token in tokens:
                if token in '“‘（《「【':
                    opening+=token
                elif token in '，。！？；：、”’）》」】' and groups:
                    groups[-1]+=token
                else:
                    groups.append(opening+token); opening=''
            if opening: groups.append(opening)
            lines=[]; line=''
            for group in groups:
                candidate=line+group
                if line and pdfmetrics.stringWidth(candidate,st.fontName,st.fontSize)>width:
                    lines.append(line.rstrip());line=group.lstrip()
                else:line=candidate
            lines.append(line.rstrip())
            paragraphs.append('<br/>'.join(escape(x) for x in lines))
        return '<br/>'.join(paragraphs)

    def paragraph(self,text,width=515,style='body'):
        p=Paragraph(self.markup(text,width,style),self.styles[style]);_,h=p.wrap(width,1000)
        return p,h
    def text_at(self,text,x,top,width=515,style='body',max_height=None):
        p,h=self.paragraph(text,width,style)
        if top-h<60 or (max_height and h>max_height):
            raise ValueError(f'{self.lang} page {self.n} overflow: {text[:55]} top={top} h={h} max={max_height}')
        p.drawOn(self.c,x,top-h);return h
    def para(self,text,style='body',gap=10):
        self.md.append(text+'\n');self.y-=self.text_at(text,40,self.y,515,style)+gap
    def head(self,text):self.para(text,'head',7)
    def page(self,index=None):
        if self.n:self.c.showPage()
        self.n+=1;c=self.c
        c.setFillColor(HexColor(RED));c.rect(0,H-8,W,8,fill=1,stroke=0)
        c.setFont('Helvetica-Bold',13);c.drawString(40,H-40,'Giacomini')
        c.setFillColor(HexColor(INK));c.setFont('CN' if self.lang=='zh' else 'Helvetica',10)
        c.drawRightString(W-40,H-40,'YouFeed / 现场运行指南' if self.lang=='zh' else 'YouFeed / Field guide')
        kicker=('现场速查 / A4 单页' if self.lang=='zh' else 'FIELD QUICK REFERENCE / A4') if self.quick else self.d['kickers'][index]
        title=self.d['quick_title'] if self.quick else self.d['titles'][index]
        sub=self.d['quick_sub'] if self.quick else self.d['subs'][index]
        c.setFont('CN' if self.lang=='zh' else 'Helvetica',9);c.setFillColor(HexColor(GRAY));c.drawString(40,H-76,kicker)
        font='CNBold' if self.lang=='zh' else 'Helvetica-Bold';size=24
        while pdfmetrics.stringWidth(title,font,size)>515:size-=.5
        c.setFont(font,size);c.setFillColor(HexColor(INK));c.drawString(40,H-111,title)
        self.y=H-134;self.md.append('\n# '+title+'\n');self.para(sub,'small',20)
        c.setStrokeColor(HexColor(LINE));c.line(40,49,W-40,49)
        c.setFillColor(HexColor(GRAY));c.setFont('Helvetica',8);c.drawString(40,33,VERSION)
        c.drawRightString(W-40,33,('QUICK' if self.quick else f'{self.n:02d} / 08')+' / '+self.lang.upper())
    def box(self,title,text):
        _,h=self.paragraph(text,485);height=h+46
        if self.y-height<60:raise ValueError('Box overflow '+title)
        self.c.setFillColor(HexColor(PALE));self.c.roundRect(40,self.y-height,515,height,6,fill=1,stroke=0)
        self.text_at(title,55,self.y-11,485,'head');self.text_at(text,55,self.y-34,485)
        self.md.extend([title+'\n',text+'\n']);self.y-=height+15
    def table(self,rows,widths,padding=8):
        data=[[self.paragraph(v,widths[i]-20,'table')[0] for i,v in enumerate(row)] for row in rows]
        table=Table(data,colWidths=widths,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#EAECE8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),padding),('BOTTOMPADDING',(0,0),(-1,-1),padding),('LINEBELOW',(0,0),(-1,-1),.5,HexColor(LINE))]))
        _,h=table.wrap(515,1000)
        if self.y-h<60:raise ValueError(f'Table overflow {self.lang} p{self.n}: y={self.y} h={h}')
        table.drawOn(self.c,40,self.y-h);self.y-=h+15
        self.md+=[' | '.join(row)+'\n' for row in rows]
    def arrow(self,x1,y1,x2,y2,color=RED):
        import math
        c=self.c;c.setStrokeColor(HexColor(color));c.setLineWidth(.9);c.line(x1,y1,x2,y2)
        angle=math.atan2(y2-y1,x2-x1)
        for sign in [-1,1]:c.line(x2,y2,x2-4*math.cos(angle+sign*.5),y2-4*math.sin(angle+sign*.5))
    def badge(self,label,x,y,color=RED):
        c=self.c;c.setFillColor(HexColor(color));c.circle(x,y,12,fill=1,stroke=0);c.setFillColor(white);c.setFont('Helvetica',10);c.drawCentredString(x,y-3.5,label)
    def icon(self,kind,x,y,color):
        c=self.c;c.saveState();c.translate(x,y);c.setStrokeColor(HexColor(color));c.setLineWidth(1.5)
        if kind=='A':
            c.rect(0,0,38,26);c.line(0,18,38,18);c.line(13,0,13,18);c.line(25,0,25,18);c.line(-3,29,41,29)
        elif kind=='P':
            for line in [(1,9,18,0),(18,0,37,9),(37,9,37,31),(37,31,18,40),(18,40,1,31),(1,31,1,9),(1,31,18,22),(18,22,37,31),(18,22,18,0)]:c.line(*line)
        else:
            c.rect(0,12,40,27);c.line(20,12,20,5);c.line(8,4,32,4)
            for xx in [3,18,33]:c.circle(xx,-6,3);c.arc(xx-5,-20,xx+5,-10,0,180)
        c.restoreState()
    def flow(self):
        top=self.y
        for i,(role,step) in enumerate(self.d['flow']):
            x=40+i*105;col=RED if i==0 else (GREEN if i==4 else BLUE)
            self.c.setFillColor(HexColor(PALE));self.c.roundRect(x,top-96,95,96,5,fill=1,stroke=0)
            self.badge(str(i+1),x+17,top-19,col)
            self.text_at(role,x+9,top-39,77,'small');self.text_at(step,x+9,top-57,77,'table')
            if i<4:self.arrow(x+96,top-48,x+104,top-48)
        self.md.extend([role+' → '+step+'\n' for role,step in self.d['flow']]);self.y-=114
    def regions(self):
        top=self.y;h=310
        for i,(letter,title,subject,check,question,follow) in enumerate(self.d['regions']):
            x=40+i*176;w=163;col=[BLUE,RED,GREEN][i]
            self.c.setFillColor(HexColor(PALE));self.c.roundRect(x,top-h,w,h,7,fill=1,stroke=0)
            self.c.setFillColor(HexColor(col));self.c.rect(x,top-4,w,4,fill=1,stroke=0)
            self.icon(letter,x+16,top-63,col);self.badge(letter,x+140,top-31,col)
            self.text_at(title,x+14,top-80,w-28,'head')
            self.text_at(self.d['region_labels'][0],x+14,top-116,w-28,'small')
            self.text_at(subject,x+14,top-134,w-28,'body',max_height=66)
            self.text_at(self.d['region_labels'][1],x+14,top-203,w-28,'small')
            self.text_at(check,x+14,top-219,w-28,'table',max_height=32)
            self.text_at('“'+question+'”',x+14,top-255,w-28,'body',max_height=49)
            self.md.append(f'## {letter} {title}\n{subject}\n{check}\n{question}\nOptional: {follow}\n')
        self.excerpts['regions']={'page':2,'box':[40,top-h,555,top]}
        self.y-=h+14;self.para(self.d['region_note'],'small',15)
    def steps(self):
        self.para(self.d['steps_intro'],'body',14)
        for title,text,filename,crop in self.d['steps']:
            top=self.y;image=Image.open(ROOT/'docs/field-guide/assets'/filename).crop(crop)
            iw,ih=image.size;scale=min(148/iw,143/ih);ww,hh=iw*scale,ih*scale
            self.c.setFillColor(HexColor(PALE));self.c.roundRect(40,top-151,158,151,5,fill=1,stroke=0)
            self.c.drawImage(ImageReader(image),40+(158-ww)/2,top-(151+hh)/2,width=ww,height=hh)
            self.text_at(title,214,top-7,341,'head',max_height=40)
            self.text_at(text,214,top-49,341,'body',max_height=100)
            self.md.extend([title+'\n',text+'\n']);self.y-=167
        self.head(self.d['protect_title']);self.para(self.d['protect'],'small',0)
    def cards(self):
        top=self.y
        for i,(title,aim,quote,avoid) in enumerate(self.d['cards']):
            x=40+(i%2)*265;y=top-(i//2)*183;w=250;h=171
            self.c.setFillColor(HexColor(PALE));self.c.roundRect(x,y-h,w,h,7,fill=1,stroke=0)
            self.badge(f'{i+1:02}',x+21,y-22)
            self.text_at(title,x+41,y-13,w-51,'head',max_height=38)
            self.text_at(self.d['card_labels'][0]+' / '+aim,x+13,y-49,w-26,'small',max_height=26)
            self.c.setStrokeColor(HexColor(LINE));self.c.line(x+13,y-77,x+w-13,y-77)
            self.text_at('“'+quote+'”',x+13,y-86,w-26,'body',max_height=46)
            self.text_at(self.d['card_labels'][2]+' / '+avoid,x+13,y-135,w-26,'small',max_height=29)
            self.md.append(f'## {i+1:02} {title}\n{aim}\n{quote}\n{avoid}\n')
        self.excerpts['prompts']={'page':4,'boxes':[[305,top-171,555,top],[40,top-183-171,290,top-183]]}
        self.y=top-549
    def branches(self,mode):
        top=self.y;data=self.d['entry_branches' if mode=='entry' else 'status_branches']
        for i,(title,action,col) in enumerate(data):
            x=40+i*176;self.c.setFillColor(HexColor(PALE));self.c.roundRect(x,top-67,163,67,5,fill=1,stroke=0)
            self.c.setFillColor(HexColor(col));self.c.rect(x,top-3,163,3,fill=1,stroke=0)
            self.text_at(title,x+10,top-13,143,'body');self.text_at(action,x+10,top-40,143,'small')
        self.md.extend([a+' → '+b+'\n' for a,b,_ in data]);self.y-=85
    def incident(self,index):
        title,rows=self.d['incidents'][index];top=self.y;self.head(title)
        for label,text in rows:
            labelwidth=70 if self.lang=='en' else 59;bodyx=40+labelwidth+5;bodyw=555-bodyx
            self.text_at(label,40,self.y,labelwidth,'small')
            h=self.text_at(text,bodyx,self.y,bodyw,'incident')
            if 'STOP' in label or '停止' in label:
                self.c.setFillColor(HexColor(RED));self.c.rect(33,self.y-h,2,h,fill=1,stroke=0)
            self.md.append(label+' / '+text+'\n');self.y-=h+5
        if index==0:self.excerpts['recovery']={'page':5,'box':[31,self.y-4,555,top]}
        self.y-=15
    def save(self):self.c.save()

def build(lang):
    d=COPY[lang];b=Book(OUT/f'youfeed-field-guide-{lang}.pdf',lang)
    b.page(0);b.box(d['source_title'],d['source']);b.head(d['flow_title']);b.flow()
    b.head(d['invitation_title']);b.para(d['invitation'],'quote',15)
    b.head(d['roles_title'])
    for role,detail in d['roles']:b.para(role+' / '+detail,'body',5)
    b.para(d['purpose_note'],'small',0)
    b.page(1);b.regions();b.box(d['region_check_title'],d['region_check']);b.head(d['match_title']);b.para(d['match'])
    b.page(2);b.steps()
    b.page(3);b.cards()
    b.page(4);b.branches('entry')
    for i in [0,1,2]:b.incident(i)
    b.page(5);b.branches('status')
    for i in [3,4,5]:b.incident(i)
    b.para(d['incident_note'],'small',0)
    b.page(6);b.head(d['record_staff_title']);b.table(d['record_staff'],[125,390],7);b.para(d['record_note'],'small',12)
    b.head(d['record_lead_title']);b.table(d['record_lead'],[125,390],7);b.para(d['handoff'],'small',0)
    b.page(7);b.table(d['setup'],[125,390],9);b.box(d['demo_title'],d['demo']);b.head(d['walk_title'])
    for i,text in enumerate(d['walk'],1):b.para(f'{i}. '+text,'body',7)
    b.para(d['walk_log'],'small',0);b.save()
    suffix='' if lang=='zh' else '-en'
    (ROOT/f'docs/field-guide/guide-content{suffix}.md').write_text('# YouFeed / '+VERSION+'\n'+'\n'.join(b.md))
    (OUT/f'excerpts-{lang}.json').write_text(json.dumps(b.excerpts,ensure_ascii=False,indent=2))
    q=Book(OUT/f'youfeed-field-quick-reference-{lang}.pdf',lang,True);q.page()
    q.box('邀请与引导' if lang=='zh' else 'Invite and support',d['quick_prompt'])
    q.table(d['quick_rows'],[100,246,169],9);q.para(d['quick_end'],'small',0);q.save()
    (ROOT/f'docs/field-guide/quick-reference-content{suffix}.md').write_text('# YouFeed / '+VERSION+'\n'+'\n'.join(q.md))
    print(lang,'guide: 8 pages; quick reference: 1 page')

if __name__=='__main__':build('zh')
