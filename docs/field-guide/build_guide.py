"""Build the reconstructed Chinese field guide and a standalone quick sheet.
Run with Python + reportlab + pypdf. Fonts default to macOS STHeiti.
All wording is below; generated Markdown is the editable copy for content review.
"""
from pathlib import Path
import os
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'artifacts/field-guide-build'; OUT.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('CN',os.environ.get('YOUFEED_FONT_REGULAR','/System/Library/Fonts/STHeiti Light.ttc'),subfontIndex=0))
pdfmetrics.registerFont(TTFont('CNBold',os.environ.get('YOUFEED_FONT_BOLD','/System/Library/Fonts/STHeiti Medium.ttc'),subfontIndex=0))
W,H=595.276,841.89
RED='#E0001B'; INK='#292B2D'; GRAY='#656769'; PALE='#F5F5F2'; LINE='#D8D9D6'; GREEN='#276047'
styles={
 'body':ParagraphStyle('body',fontName='CN',fontSize=10.5,leading=16,textColor=HexColor(INK),wordWrap='CJK'),
 'small':ParagraphStyle('small',fontName='CN',fontSize=9,leading=13,textColor=HexColor(GRAY),wordWrap='CJK'),
 'head':ParagraphStyle('head',fontName='CNBold',fontSize=13,leading=19,textColor=HexColor(INK),wordWrap='CJK'),
 'quote':ParagraphStyle('quote',fontName='CN',fontSize=13,leading=21,textColor=HexColor(INK),wordWrap='CJK'),
 'table':ParagraphStyle('table',fontName='CN',fontSize=9.5,leading=14,textColor=HexColor(INK),wordWrap='CJK'),
}
MD=[]
class Book:
 def __init__(self,path,quick=False):
  self.c=canvas.Canvas(str(path),pagesize=(W,H)); self.c.setTitle('YouFeed 展会现场运行指南｜重建版 v1.1' if not quick else 'YouFeed 现场速查｜重建版 v1.1'); self.c.setAuthor('YouFeed · 重建材料'); self.quick=quick; self.n=0; self.y=0
 def para(self,text,x=40,width=515,style='body',gap=10,record=True):
  if record: MD.append(text+'\n')
  p=Paragraph(escape(text).replace('\n','<br/>'),styles[style]); _,h=p.wrap(width,700)
  if self.y-h<62: raise ValueError(f'Page {self.n} overflow: {text[:35]} y={self.y} h={h}')
  p.drawOn(self.c,x,self.y-h); self.y-=h+gap
 def page(self,kicker,title,sub):
  if self.n: self.c.showPage()
  self.n+=1; c=self.c
  c.setFillColor(HexColor(RED)); c.rect(0,H-8,W,8,fill=1,stroke=0)
  c.setFont('CNBold',13); c.drawString(40,H-40,'Giacomini')
  c.setFillColor(HexColor(INK)); c.setFont('CN',10); c.drawRightString(W-40,H-40,'YouFeed / 现场运行指南')
  c.setFillColor(HexColor(GRAY)); c.setFont('CN',9); c.drawString(40,H-76,kicker)
  c.setFillColor(HexColor(INK)); c.setFont('CNBold',25); c.drawString(40,H-112,title)
  self.y=H-135; MD.append('\n# '+title+'\n'); self.para(sub,style='small',gap=22)
  c.setStrokeColor(HexColor(LINE)); c.line(40,49,W-40,49)
  c.setFillColor(HexColor(GRAY)); c.setFont('CN',8); c.drawString(40,33,'重建版 v1.1 · 2026.10.04 · 非历史原件 / 现场规则待确认')
  c.drawRightString(W-40,33,('速查' if self.quick else f'{self.n:02d} / 08'))
 def head(self,text): self.para(text,style='head',gap=7)
 def box(self,title,text,fill=PALE):
  p=Paragraph(escape(text).replace('\n','<br/>'),styles['body']); _,h=p.wrap(485,700)
  height=h+48
  if self.y-height<62: raise ValueError(f'Box overflow p{self.n}: {title}')
  self.c.setFillColor(HexColor(fill)); self.c.roundRect(40,self.y-height,515,height,6,fill=1,stroke=0)
  old=self.y; self.y-=12; self.para(title,x=55,width=485,style='head',gap=6); self.para(text,x=55,width=485,gap=0); self.y=old-height-15
 def table(self,rows,widths):
  MD.append('| '+' | '.join(rows[0])+' |\n'); MD.append('| '+' | '.join(['---']*len(widths))+' |\n'); MD.extend(['| '+' | '.join(v.replace('\n','<br>') for v in row)+' |\n' for row in rows[1:]])
  data=[[Paragraph(escape(v).replace('\n','<br/>'),styles['table']) for v in row] for row in rows]
  t=Table(data,colWidths=widths,hAlign='LEFT'); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#EAECE8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),7 if self.quick else 10),('BOTTOMPADDING',(0,0),(-1,-1),7 if self.quick else 10),('LINEBELOW',(0,0),(-1,-1),.5,HexColor(LINE))]))
  _,h=t.wrap(515,700)
  if self.y-h<62: raise ValueError(f'Table overflow {self.n} {h}')
  t.drawOn(self.c,40,self.y-h); self.y-=h+18
 def text_at(self,text,x,y,w,style='body'):
  p=Paragraph(escape(text).replace('\n','<br/>'),styles[style]); _,h=p.wrap(w,700); p.drawOn(self.c,x,y-h); return h
 def arrow(self,x1,y1,x2,y2,color=GRAY):
  import math
  c=self.c; c.setStrokeColor(HexColor(color)); c.setLineWidth(1); c.line(x1,y1,x2,y2)
  angle=math.atan2(y2-y1,x2-x1); c.line(x2,y2,x2-5*math.cos(angle-.5),y2-5*math.sin(angle-.5)); c.line(x2,y2,x2-5*math.cos(angle+.5),y2-5*math.sin(angle+.5))
 def badge(self,text,x,y,color=RED):
  c=self.c; c.setFillColor(HexColor(color)); c.circle(x,y,12,fill=1,stroke=0); c.setFillColor(white); c.setFont('CNBold',10); c.drawCentredString(x,y-3.5,text)
 def icon(self,kind,x,y,color):
  c=self.c; c.saveState(); c.translate(x,y); c.setStrokeColor(HexColor(color)); c.setLineWidth(1.6)
  if kind=='A':
   c.rect(0,0,38,26,fill=0,stroke=1); c.line(0,18,38,18); c.line(13,0,13,18); c.line(25,0,25,18); c.line(-3,29,41,29)
  elif kind=='P':
   for aa,bb,cc,dd in [(1,9,18,0),(18,0,37,9),(37,9,37,31),(37,31,18,40),(18,40,1,31),(1,31,1,9),(1,31,18,22),(18,22,37,31),(18,22,18,0)]: c.line(aa,bb,cc,dd)
  else:
   c.rect(0,12,40,27,fill=0,stroke=1); c.line(20,12,20,5); c.line(8,4,32,4)
   for xx in [3,18,33]: c.circle(xx,-6,3,fill=0,stroke=1); c.arc(xx-5,-20,xx+5,-10,0,180)
  c.restoreState()
 def regions(self):
  y=self.y; w=163; h=300
  data=[('A','整体体验','#245B78','展会整体','任选最有感受的一点','区域与参观环节','这次参观，您最想反馈的一点是什么？','是在什么环节产生这种感受的？','[A-01] [区域名待填]'),('P','具体产品',RED,'眼前这件产品','区分第一印象与使用经验','产品名称与图片','您对这件产品有什么看法？','这是刚看到的印象，还是实际使用后的体验？','[P-01] [产品名待填]'),('T','座谈 / 演讲',GREEN,'具体活动场次','内容、理解或参与体验','标题、场次或时间','关于这场活动，您最想反馈什么？','哪一部分让您产生了这个想法？','[T-01] [场次待填]')]
  for i,(letter,title,col,obj,task,check,q,follow,entry) in enumerate(data):
   x=40+i*176; c=self.c; c.setFillColor(HexColor(PALE)); c.roundRect(x,y-h,w,h,8,fill=1,stroke=0)
   c.setFillColor(HexColor(col)); c.rect(x,y-4,w,4,fill=1,stroke=0); self.icon(letter,x+16,y-64,col); self.badge(letter,x+140,y-32,col)
   self.text_at(title,x+14,y-80,w-28,'head'); self.text_at(entry,x+14,y-105,w-28,'small')
   self.text_at('评价什么',x+14,y-133,w-28,'small'); self.text_at(obj+'；'+task+'。',x+14,y-149,w-28,'body')
   self.text_at('先确认｜'+check,x+14,y-204,w-28,'small'); self.text_at('“'+q+'”',x+14,y-218,w-28,'body')
   MD.append(f'### {letter} {title} / {entry}\n评价：{obj}；{task}。先确认：{check}。\n问题：{q}\n中性追问：{follow}\n')
  self.y=y-h-15
  self.para('需要时再追问：A「在哪个环节？」 / P「第一印象还是使用经验？」 / T「哪一部分让您这样想？」',style='small',gap=17,record=False)
 def card(self,num,situation,purpose,quote,avoid):
  i=int(num)-1
  if i==0: self.card_top=self.y
  x=40+(i%2)*265; top=self.card_top-(i//2)*185; w=250; h=173; c=self.c
  c.setFillColor(HexColor(PALE)); c.roundRect(x,top-h,w,h,7,fill=1,stroke=0)
  self.badge(num,x+21,top-23); self.text_at(situation,x+41,top-13,w-52,'head')
  self.text_at('目的｜'+purpose,x+13,top-48,w-26,'small')
  c.setStrokeColor(HexColor(LINE)); c.line(x+13,top-69,x+w-13,top-69)
  self.text_at('“'+quote+'”',x+13,top-79,w-26,'body')
  self.text_at('避免｜'+avoid,x+13,top-130,w-26,'small')
  MD.append(f'### {num} {situation}\n目的：{purpose}\n可说：“{quote}”\n避免：{avoid}\n')
  self.y=top-h-12
 def decision(self,mode='entry'):
  c=self.c; top=self.y; label='先判断：是否已填写或点击提交？' if mode=='entry' else '先判断：现在看到什么状态？'
  self.text_at(label,40,top,515,'head'); cy=top-51
  labels=[('尚未填写','核对入口 / 网络','#245B78'),('已有文字','不刷新，先保护内容',GREEN),('已点提交 / 不明','不重复提交 → E6',RED)] if mode=='entry' else [('语音不可用','转文字 → E4','#245B78'),('明确显示失败','确认能安全重试 → E5',GREEN),('没有明确结果','停止重复提交 → E6',RED)]
  c.setStrokeColor(HexColor(LINE)); c.line(123,cy+7,473,cy+7); c.line(297.5,top-26,297.5,cy+7)
  for i,(title,action,col) in enumerate(labels):
   x=40+i*176; self.arrow(x+81,cy+7,x+81,cy-8,col)
   c.setFillColor(HexColor(PALE)); c.roundRect(x,cy-65,163,55,5,fill=1,stroke=0)
   self.text_at(title,x+10,cy-18,143,'body'); self.text_at(action,x+10,cy-39,143,'small')
  self.y=cy-79
  MD.append(label+'\n'+'；'.join(a+' → '+b for a,b,_ in labels)+'\n')
 def incident(self,title,observe,check,alternative,stop,record):
  # Consistent five-part micro-layout with an explicit stop rail.
  top=self.y; self.head(title)
  for label,value in [('现象',observe),('先查',check),('替代',alternative),('停止',stop),('交接',record)]:
   value=value.replace('【现场拟定】','')
   sty='small'; h=self.text_at(value,79,self.y,476,sty)
   self.c.setFillColor(HexColor(RED if label=='停止' else GRAY)); self.c.setFont('CNBold',9); self.c.drawString(42,self.y-10,label)
   MD.append(label+'｜'+value+'\n'); self.y-=h+3
  self.y-=12
  if self.y<62: raise ValueError(f'Incident overflow {self.n} {title} {self.y}')
 def save(self): self.c.save()

b=Book(OUT/'youfeed-field-guide-zh.pdf')
b.page('01 / 展前先读 · 服务与职责','帮助观众留下自己的看法','使用顺序：展前读 01–03、08；现场查 04–06；记录与交接用 07。')
b.box('本指南是什么','依据参与者回忆与现有项目资料重新设计的工作人员材料，不是当年原件。三类区域、问题、引导语和处理规则均为本次拟定；当前截图来自后续概念演示。')
b.head('服务流程 / 最后一段由后台团队负责')
flow=[('工作人员','邀请参与'),('观众','进入对应入口'),('观众','表达反馈'),('观众','核对与完成'),('后台团队','平台接收 / 分析')]
for j,(role,step) in enumerate(flow):
 x=40+j*105
 b.c.setFillColor(HexColor(PALE)); b.c.roundRect(x,b.y-100,95,100,4,fill=1,stroke=0)
 top=b.y; b.badge(str(j+1),x+16,b.y-18,RED if j==0 else (GREEN if j==4 else '#245B78')); b.y-=36; b.para(role,x=x+7,width=81,style='small',record=False,gap=5); b.para(step,x=x+7,width=81,style='table',record=False,gap=0); b.y=top
 if j<4:
  b.arrow(x+96,b.y-51,x+104,b.y-51,RED)
MD.append('工作人员邀请 → 观众进入对应入口 → 表达反馈 → 核对与完成 → 后台团队：企业平台接收和分析\n')
b.y-=115
b.para('这张图表达服务关系。当前演示只覆盖手机端模拟体验，未采集音频、未发送反馈，也未连接企业平台或 InsightGPT。',style='small')
b.head('邀请话术 / 先说明用途，再给选择')
b.para('“我们在收集大家对这里的体验、产品或活动的看法。您愿意的话，可以用手机轻触这张 NFC 卡，或扫描二维码，进入对应页面留下意见。不参加也完全没关系。”',style='quote',gap=19)
b.head('各自负责什么')
b.para('观众：决定是否参与、表达什么、是否修改，以及何时结束。\n工作人员：确认对象，解释操作和问题范围；不替观众评价或改写。\n现场负责人：核对入口、协调异常、接收记录并安排交接。\n后台团队：核实接收状态及系统问题；本指南不展开分析设计。')
b.para('演示培训前另说：“今天体验的是模拟版本，语音使用样例，内容不会送出。”不承诺匿名、完成耗时、数据保存期限或客户响应时间。',style='small')

b.page('02 / 找到自己的区域','区域与反馈任务地图','A / P / T 是本次指南的占位编号，不是历史入口，也不能用于实际扫码。')
b.regions()
b.box('值守前填写 / 一区一张核对单','我的区域：________________  反馈对象：________________\n卡片编号：________________  页面对象：________________\n已核实的备用入口：___________________________________\n区域联系人 / 联系方式：_______________________________')
b.head('先对对象，再邀请')
b.para('对照实物或活动牌 → 读 NFC / 二维码物料上的对象 → 打开页面核对名称和问题。三处不一致，暂停使用该物料并交给负责人，不让观众在错误页面继续。')
b.para('当前演示只展示 R146C 产品反馈；它不证明当年现场使用该产品，也未实现 A / T 区域入口或多产品切换。实际区域名称、场次、问题和路由由负责人在测试前确认。',style='small')

b.page('03 / 标准操作','邀请 → 进入 → 表达 → 核对','页面用于解释操作。下图是 R7 当前概念演示截图，不是历史现场界面。')
start=b.y
img=ROOT/'screenshots/r7-home-390.png'
iw,ih=ImageReader(str(img)).getSize()
# The source capture includes empty right/bottom canvas. Clip that whitespace in layout only.
# Keep the complete visible app, including demo disclosure and demo controls.
scale=155/(iw/2); imageh=452*scale
b.c.saveState(); clip=b.c.beginPath(); clip.rect(40,start-imageh,155,imageh); b.c.clipPath(clip,stroke=0,fill=0)
b.c.drawImage(str(img),40,start-ih*scale,width=iw*scale,height=ih*scale,mask='auto'); b.c.restoreState()
MD.append('[当前 R7 演示截图](../../screenshots/r7-home-390.png)\n')
b.para('01  邀请 / 先得到参与意愿',x=216,width=339,style='head',gap=7)
b.para('用第 1 节话术。观众拒绝或想结束就停止，不追问理由。',x=216,width=339,gap=15)
b.para('02  进入 / 确认对象',x=216,width=339,style='head',gap=7)
b.para('请观众核对产品名或活动名。NFC 不响应时，可用同一对象的已核实二维码；目前仓库未验证实际 NFC / 二维码链路。',x=216,width=339,gap=15)
b.para('03  表达 / 让观众自己选择',x=216,width=339,style='head',gap=7)
b.para('圆形 Try speaking 是模拟语音入口；Write a thought 是文字入口。不方便说话可直接写，不必先试语音。',x=216,width=339,gap=15)
b.para('04  核对 / 内容由观众决定',x=216,width=339,style='head',gap=7)
b.para('请观众检查是否表达了本意。核对页可 Edit；Continue as text 可继续编辑已有文字。工作人员只解释按钮，不代改评价。',x=216,width=339,gap=15)
b.y=min(b.y,start-imageh-16)
b.head('05  完成 / 区分“页面结束”和“真实接收”')
b.para('当前 Demo complete 只表示演示结束，页面明确说明反馈未送出。真实现场应按已确认的完成提示判断；若状态不明确，不声称成功，也不立即重复提交，转第 6 节。')
b.box('保护已经写下的内容','当前演示在页内切换时保留已形成的文字；刷新、重启会清空。开始新的模拟语音并生成样例，会替换原稿；看到清空或重录确认框时，先向观众解释后果，由其决定。')

b.page('04 / 六张引导卡','帮助表达，不替人作答','先听，再用一条提示；观众仍不想补充，就接受其原有表达或结束。')
b.card('01','不知道 YouFeed 是什么','说明用途与参与方式。','这是一个反馈入口，帮助我们了解您对这里的看法。您可以自己选择是否参与。','不许诺匿名、固定耗时、奖励或意见一定获采纳。')
b.card('02','不知道该评价什么','确认对象，缩小范围。','这里对应的是[对象]。您可以只说最有感受的一点，第一印象也可以。','不把示例答案当提示，不说“可以夸一下设计”。')
b.card('03','“没什么意见”或评价很笼统','给一次自愿补充的机会。','如果愿意，您可以说说是什么让您有这个感觉；不补充也可以。','不将“还行”改成正面评价，不反复追问，不要求凑字数。')
b.card('04','不方便使用语音','让文字成为直接选择。','您可以选择文字输入，按自己的方式写就好。','不要求先开麦、不代录；模拟版不能说它正在录下声音。')
b.card('05','进入错误产品或活动页面','停止错配，重新确认对象。','这里显示的是[页面对象]，您想评价的是[目标对象]，对吗？我们先核对入口。','不在错误页面硬填；不承诺内容可自动迁移。已有内容先告知风险。')
b.card('06','不愿参与或希望结束','尊重退出，结束协助。','好的，谢谢您，您可以随时结束。','不劝留、不追问私人原因、不替其完成；不能承诺关闭等于删除已提交内容。')

b.page('05 / 异常处理 · 入口与连接','先确认对象，再恢复连接','【界面】为当前演示；【待确认】为未验证能力；其余恢复与停止规则为现场拟定。')
b.decision('entry')
b.incident('E1 / 网络不稳定或页面打不开','持续加载、空白、连接错误。','【现场拟定】先问是否已经输入或点击提交；有内容就不要先刷新。确认链接与当前网络状态。','【现场拟定】尚未填写时，可由观众自愿切换可用网络，再打开已核实入口；已有内容或已提交转 E6。','【现场拟定】完成一次有变化的恢复尝试后仍失败，或观众不愿继续，即停止；不连续刷新。','记录时间、区域、入口、可见错误和尝试结果 → 现场负责人；多设备同入口异常则暂停该入口邀请。')
b.incident('E2 / NFC 或二维码无法打开','轻触无响应，或扫码无法识别、跳转失败。','【现场拟定】确认卡片对象、二维码是否遮挡及目标链接；不要求观众安装不明应用。','【现场拟定】NFC 失败改用同对象已核实二维码；二维码失败仅用负责人提供并核实的备用链接。','【现场拟定】替代入口仍失败或没有已核实替代路径，停止；不临时编造链接或把其他产品入口当备用。','记录触点编号、NFC / 二维码类型、现象与结果 → 现场负责人核对物料和入口。')
b.incident('E3 / 页面对象不对应','名称、产品图或活动场次与观众想反馈的对象不同。','【现场拟定】核对实物、卡片、页面三处身份，先停止填写。','【现场拟定】无内容时转已核实正确入口；已有内容先说明重新打开可能丢失，由观众决定是否继续。','正确入口仍错配，或找不到目标对象，即停止。不得把意见提交给错误对象。','记下入口编号和错误 / 目标对象 → 现场负责人暂停该物料，交技术支持检查映射。【待确认】草稿跨入口迁移。')

b.page('06 / 异常处理 · 表达与完成','结果不明确时，先停止重复提交','【界面】为当前模拟行为；【待确认】为真实服务能力；其余恢复与停止规则为现场拟定。')
b.decision('status')
b.incident('E4 / 语音不可用、无内容或转写失败','显示语音不可用、No words picked up 或转写错误。','【界面】先看是否标有 simulated；当前演示不请求麦克风、不录音、不做真实转写。','【界面】Write instead 转文字；已有文字保留。演示可点 Try voice again / Try again 测试恢复。','【现场拟定】一次恢复后仍失败或观众不愿说，就转文字或结束，不反复要求授权。','记录页面提示及切换后是否完成 → 现场负责人；【待确认】真实权限、浏览器兼容与转写能力由技术支持核实。')
b.incident('E5 / 明确显示提交失败','页面明确显示错误并提供重试入口。','【界面】当前演示保留草稿，可在原页重试；这是模拟行为，不等于真实系统确认未接收。','【现场拟定】真实现场先按负责人确认的失败语义处理；仅在已确认可安全重试时，由观众选择重试。','【现场拟定】一次安全重试仍失败，或接收状态不确定，停止并转 E6。','记录报错、点击时间、重试次数与最后状态 → 现场负责人 / 技术支持。【待确认】超时语义和重复提交去重。')
b.incident('E6 / 完成状态不明确','点击后一直等待、页面关闭、断网，或没有明确完成提示。','不要把“无成功提示”视为“未提交”。先询问最后一步、可见状态及是否已点过提交。','【现场拟定】保持原页，不刷新、不重开重复提交；允许观众结束等待。负责人再请后台核查。','无法由已确认机制判断时就停止操作，记录“结果不明确”；不要求观众无限等待。','记录时间、入口、最后动作和页面状态；有系统回执编号才记编号 → 负责人交后台核实。当前演示无真实接收查询。')

b.page('07 / 首次测试记录与交接','记录发生了什么、是否需要帮助','一条记录对应一次体验或一个问题。可复制本页使用；不需要姓名、电话或完整反馈内容。')
b.table([['记录字段','现场填写'],['基本信息','记录编号：__________  时间：__________\n区域 / 入口编号：________________________________\n反馈对象 / 产品 / 活动场次：______________________'],['观察与协助','困难或必要原话（去除个人信息）：__________________\n________________________________________________\n工作人员采取的协助 / 重试次数：___________________\n________________________________________________'],['完成方式（单选）','独立完成 / 协助后完成 / 未完成 / 结果不明确\n说明：“协助”包括额外解释、提示或操作排障；统一邀请不计。'],['结果与依据','页面最后显示：__________________________________\n真实接收：已核实 / 未核实 / 不适用（模拟演示）\n依据或系统回执编号（如有）：______________________'],['后续交接','需后续处理：是 / 否    交给谁：____________________\n记录人工作代号：________  接收人 / 接收时间：________\n处理状态：待接收 / 处理中 / 已关闭\n下次回查时间：________  结果 / 关闭依据：____________']],[125,390])
b.head('交给谁 / 如何闭环【现场拟定】')
b.para('工作人员 → 现场负责人汇总；入口、网络和语音故障 → 技术支持；提交状态 → 后台团队；对象、活动名称和问题文案 → 区域内容负责人。实际人员和联系方式见第 8 节。')
b.para('同一入口连续出错、对象错配或出现意外个人信息，立即联系负责人；其他记录按约定班次交接。接收人确认收到，填下一次回查时间，解决后补依据，不以“已转发”当关闭。')
b.para('只记录排查所需的信息。不要用私人设备保存观众反馈、录音或带个人信息的截图。确需截图时，由负责人确认方式并遮蔽无关内容；保存位置、访问范围和保留期限须预先约定。',style='small')

b.page('08 / 展前配置与材料检查','带到现场之前，填完这些空白','所有“现场拟定”规则需负责人确认。当前文件可用于讨论与演练，尚不能作为已批准的现场运行规程。')
b.table([['负责人配置','需补齐的信息'],['现场负责人 / 备援','姓名或工作代号：________ / ________\n联系渠道：________________  值守时段：________'],['技术 / 后台 / 区域内容','联系人及渠道：________________________________\n主联系人无响应时转交：________________________'],['入口与规则','A / P / T 对照表、备用链接、真实完成提示已核对：____\n安全重试条件 / 等待上限 / 升级时点：_______________'],['记录与数据说明','记录存放位置 / 可访问人员 / 保留期限：_____________\n对外用途说明、隐私口径与客户确认人：_____________']],[140,375])
b.head('三种情境走查 / 本次材料检查，不是历史验证')
b.para('① 新工作人员：抽取一个区域，找到反馈对象与入口核对方法，并说出自愿参与的邀请。查第 1–3 节。\n② 观众说“不知道怎么答”：找到第 4 节卡片 02 / 03，给出不暗示答案的提示，并允许不补充。\n③ 连接异常：查第 5 节 E1；若已经点击提交，转第 6 节 E6，指出停止条件和交接对象。')
b.para('实际演练记录：日期______  参与者工作代号______\n每题：能找到 / 需提示 / 未找到；观察到的困难________________\n需修改内容________________  负责人______  复查日期______')
b.head('版本与依据')
b.para('本次 brief 与参与者说明：历史服务背景及个人参与范围。当前界面与代码：R7 产品反馈、文字 / 模拟语音、草稿和提交状态。品牌线索：沿用仓库中的 Giacomini 红色与浅灰体系；文档版式为本次设计。',style='small')
b.para('核对入口：HANDOFF.md、docs/giacomini-content.md、docs/design-system.md、src/YouFeed.jsx、src/feedback-state.js、src/demo-feedback.js。截图：screenshots/r7-home-390.png。上述是本地项目依据，不是当年原始物料或现场效果证据。',style='small')
b.para('作品集截取建议：02 区域地图、04 引导卡、05–06 异常处理。标注“依据项目经历重建，2026”；解释解决的问题，不附会当年的成效或验收。',style='small')
b.save()
(ROOT/'docs/field-guide/guide-content.md').write_text('# YouFeed 展会现场运行指南｜重建版 v1.1\n\n'+ '\n'.join(MD),encoding='utf-8')
MD=[]
q=Book(OUT/'youfeed-field-quick-reference-zh.pdf',quick=True)
q.page('随身速查 / A4 单页 · 可单独打印','先对对象，帮助表达，明确结束','重建材料；当前版本只做模拟语音与模拟提交。没有确认的信息，不向观众承诺。')
q.head('01 / 邀请与区域')
q.para('“我们想了解您对[对象]的看法。愿意的话，可以轻触 NFC 或扫码进入；不参加也完全没关系。”演示时补充：语音用样例，内容不会送出。')
q.table([['A 整体体验','P 具体产品','T 座谈 / 演讲'],['任选最有感受的一点','先确认产品；区分第一印象和使用经验','先确认标题 / 场次；谈内容、理解或体验']],[171,172,172])
q.head('02 / 不知道怎么答时')
q.para('“您可以只说最有感受的一点。” → “如果愿意，可以说说是什么让您有这个感觉。”\n不方便说就选择文字；不想继续就结束。不提示正面答案、不代写、不强迫补充。')
q.head('03 / 异常：先查 → 替代 → 停止 → 交接')
q.table([['现象','下一步与停止条件'],['入口 / 网络失败','无内容：核实对象，换同对象已核实入口或网络。\n一次恢复仍失败就停；已有内容先勿刷新。指南 E1 / E2。'],['对象错误','暂停填写，核对物料与页面；无正确入口就停。\n已有内容不承诺迁移；通知负责人停用错配物料。E3。'],['语音不可用','转文字；当前演示不录音。一次恢复仍失败就停。E4。'],['提交失败 / 结果不明','只在确认可安全重试时重试一次；不明就不再提交。\n保留原页，可结束等待；记录“结果不明确”，交后台查。E5 / E6。']],[105,410])
q.head('04 / 收尾与最小记录')
q.para('记：时间、区域 / 入口、对象、困难、协助与重试次数、最后状态、交给谁。\n区分：独立完成 / 协助后完成 / 未完成 / 结果不明确。另记真实接收是否核实。\n当前 Demo complete ≠ 真实送达；刷新会清空演示草稿。不收集无关个人信息。',gap=13)
q.para('负责人 / 渠道：____________________  备援：____________________\n技术 / 后台联系：__________________  回查时间：________________\n以上停止规则为现场拟定；展前须确认入口、真实完成提示及安全重试条件。',style='small')
q.save()
(ROOT/'docs/field-guide/quick-reference-content.md').write_text('# YouFeed 现场速查｜重建版 v1.1\n\n'+'\n'.join(MD),encoding='utf-8')
for file,expected in [('youfeed-field-guide-zh.pdf',8),('youfeed-field-quick-reference-zh.pdf',1)]:
 r=PdfReader(OUT/file); assert len(r.pages)==expected,(file,len(r.pages)); assert all(len(p.extract_text())>100 for p in r.pages)
 print(file,len(r.pages),'pages; text extraction OK')
