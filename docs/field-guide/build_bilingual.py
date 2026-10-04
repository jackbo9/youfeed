"""Build mirrored Chinese/English spreads from the same vector layout.
Run after or instead of build_guide.py. Produces a 16-page paired A4 guide,
a two-page bilingual quick sheet, and an eight-spread A3 reading copy.
"""
from pathlib import Path
from copy import copy
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import NameObject
import build_guide as g
FINAL=g.ROOT/'output/pdf'; FINAL.mkdir(parents=True,exist_ok=True)

# English uses normal word wrapping; geometry, numbering and color meaning match Chinese.
for style in g.styles.values():
 style.fontName='Helvetica-Bold' if style.fontName=='CNBold' else 'Helvetica'
 style.wordWrap=None
 style.textColor=HexColor(g.INK if style.name!='small' else g.GRAY)
g.MD=[]
class EnglishBook(g.Book):
 def page(self,kicker,title,sub):
  if self.n: self.c.showPage()
  self.n+=1; c=self.c
  c.setFillColor(HexColor(g.RED)); c.rect(0,g.H-8,g.W,8,fill=1,stroke=0)
  c.setFont('Helvetica-Bold',13); c.drawString(40,g.H-40,'Giacomini')
  c.setFillColor(HexColor(g.INK)); c.setFont('Helvetica',10); c.drawRightString(g.W-40,g.H-40,'YouFeed / Field guide')
  c.setFillColor(HexColor(g.GRAY)); c.setFont('Helvetica',9); c.drawString(40,g.H-76,kicker)
  c.setFillColor(HexColor(g.INK)); c.setFont('Helvetica-Bold',25); c.drawString(40,g.H-112,title)
  self.y=g.H-135; g.MD.append('\n# '+title+'\n'); self.para(sub,style='small',gap=22)
  c.setStrokeColor(HexColor(g.LINE)); c.line(40,49,g.W-40,49)
  c.setFillColor(HexColor(g.GRAY)); c.setFont('Helvetica',8); c.drawString(40,33,'Reconstruction v1.1 / 2026.10.04 / Not an original / Field rules to confirm')
  c.drawRightString(g.W-40,33,'QUICK / EN' if self.quick else f'{self.n:02d} / 08 / EN')
 def card(self,num,situation,purpose,quote,avoid):
  i=int(num)-1
  if i==0: self.card_top=self.y
  x=40+(i%2)*265; top=self.card_top-(i//2)*185; w=250; h=173; c=self.c
  c.setFillColor(HexColor(g.PALE)); c.roundRect(x,top-h,w,h,7,fill=1,stroke=0)
  self.badge(num,x+21,top-23); self.text_at(situation,x+41,top-13,w-52,'head')
  self.text_at('AIM / '+purpose,x+13,top-48,w-26,'small')
  c.setStrokeColor(HexColor(g.LINE)); c.line(x+13,top-69,x+w-13,top-69)
  self.text_at('“'+quote+'”',x+13,top-79,w-26,'body')
  self.text_at('AVOID / '+avoid,x+13,top-130,w-26,'small')
  g.MD.append(f'### {num} {situation}\nAim: {purpose}\nSay: “{quote}”\nAvoid: {avoid}\n'); self.y=top-h-12
 def decision(self,mode='entry'):
  c=self.c; top=self.y
  label='First: have they written or pressed submit?' if mode=='entry' else 'First: what does the page show?'
  self.text_at(label,40,top,515,'head'); cy=top-51
  labels=[('Nothing written','Check entry / connection','#245B78'),('A draft exists','Do not refresh; protect text',g.GREEN),('Submitted / unclear','Do not resubmit. See E6.',g.RED)] if mode=='entry' else [('Voice unavailable','Switch to text. See E4.','#245B78'),('Explicit error','Safe to retry? See E5.',g.GREEN),('No clear result','Stop resubmitting. See E6.',g.RED)]
  c.setStrokeColor(HexColor(g.LINE)); c.line(123,cy+7,473,cy+7); c.line(297.5,top-26,297.5,cy+7)
  for i,(title,action,col) in enumerate(labels):
   x=40+i*176; self.arrow(x+81,cy+7,x+81,cy-8,col)
   c.setFillColor(HexColor(g.PALE)); c.roundRect(x,cy-65,163,55,5,fill=1,stroke=0)
   self.text_at(title,x+10,cy-18,143,'body'); self.text_at(action,x+10,cy-39,143,'small')
  self.y=cy-79; g.MD.append(label+'\n'+'; '.join(a+' > '+b for a,b,_ in labels)+'\n')
 def incident(self,title,observe,check,alternative,stop,record):
  self.head(title)
  for label,value in [('SEE',observe),('CHECK',check),('TRY',alternative),('STOP',stop),('HAND OFF',record)]:
   h=self.text_at(value,97,self.y,458,'small')
   self.c.setFillColor(HexColor(g.RED if label=='STOP' else g.GRAY)); self.c.setFont('Helvetica-Bold',8); self.c.drawString(42,self.y-10,label)
   g.MD.append(label+' / '+value+'\n'); self.y-=h+3
  self.y-=12
  if self.y<62: raise ValueError(f'English incident overflow {self.n}: {self.y}')
 def regions(self):
  y=self.y; w=163; h=300
  data=[('A','Overall experience','#245B78','The exhibition as a whole. Choose one thing that stood out.','Area and visit stage','What would you most like to share about your visit?','[A-01] [Area to fill]'),('P','Product',g.RED,'This specific product. Separate first impressions from use.','Product name and image','What do you think of this product?','[P-01] [Product to fill]'),('T','Talk / session',g.GREEN,'This specific session. Content, understanding or experience.','Title, session and time','What would you most like to share about this session?','[T-01] [Session to fill]')]
  for i,(letter,title,col,task,check,q,entry) in enumerate(data):
   x=40+i*176; c=self.c; c.setFillColor(HexColor(g.PALE)); c.roundRect(x,y-h,w,h,8,fill=1,stroke=0)
   c.setFillColor(HexColor(col)); c.rect(x,y-4,w,4,fill=1,stroke=0); self.icon(letter,x+16,y-64,col); self.badge(letter,x+140,y-32,col)
   self.text_at(title,x+14,y-80,w-28,'head'); self.text_at(entry,x+14,y-105,w-28,'small')
   self.text_at('WHAT TO COMMENT ON',x+14,y-133,w-28,'small'); self.text_at(task,x+14,y-149,w-28,'body')
   self.text_at('CHECK / '+check,x+14,y-204,w-28,'small'); self.text_at('“'+q+'”',x+14,y-237,w-28,'body')
   g.MD.append(f'### {letter} {title} / {entry}\nTask: {task}\nCheck: {check}\nQuestion: {q}\n')
  self.y=y-h-15
  self.para('Optional follow-up: A “At what point?” / P “A first impression or experience of use?” / T “Which part made you feel that way?”',style='small',gap=17)

b=EnglishBook(g.OUT/'youfeed-field-guide-en.pdf')
b.c.setTitle('YouFeed Exhibition Field Guide / Reconstruction v1.1 / English')
b.page('01 / BEFORE THE EVENT / PURPOSE & ROLES','Help visitors share their views','Before the event: sections 01–03 and 08. During a shift: 04–06. Record and hand over issues: 07.')
b.box('About this guide','Recreated from a participant’s recollections and current project materials; not the historical original. Area tasks, questions, prompts and field rules are newly proposed. The screenshot shows the later concept demo.')
b.head('Service flow / The final stage belongs to the backend team')
flow=[('STAFF','Invite'),('VISITOR','Open the right entry'),('VISITOR','Give feedback'),('VISITOR','Review and finish'),('BACKEND','Receive / analyse')]
for j,(role,step) in enumerate(flow):
 x=40+j*105; b.c.setFillColor(HexColor(g.PALE)); b.c.roundRect(x,b.y-100,95,100,4,fill=1,stroke=0)
 top=b.y; b.badge(str(j+1),x+16,top-18,g.RED if j==0 else (g.GREEN if j==4 else '#245B78')); b.y-=36
 b.para(role,x=x+7,width=81,style='small',record=False,gap=5); b.para(step,x=x+7,width=81,style='table',record=False,gap=0); b.y=top
 if j<4: b.arrow(x+96,top-51,x+104,top-51,g.RED)
g.MD.append('Staff invite > Visitor opens the correct entry > Gives feedback > Reviews and finishes > Backend receives and analyses.\n'); b.y-=115
b.para('This diagram shows the service relationship. The current mobile demo captures no audio, sends no feedback and is not connected to the company platform or InsightGPT.',style='small')
b.head('An invitation / Explain the purpose, then offer a choice')
b.para('“We’re collecting views on the exhibition, products and sessions. If you’d like to take part, tap this NFC card with your phone or scan the QR code to share your thoughts. Taking part is entirely up to you.”',style='quote',gap=19)
b.head('Who does what')
b.para('Visitor: chooses whether to join, what to say, what to edit and when to stop.\nStaff: checks the subject and explains the task and controls; does not answer or rewrite feedback for visitors.\nField lead: checks entries, coordinates issues and accepts handovers.\nBackend team: checks receipt and system issues. Analysis design is outside this guide.')
b.para('For demo training, add: “This is a simulation. Voice uses sample text and nothing is sent.” Do not promise anonymity, a fixed duration, retention periods or a response time.',style='small')

b.page('02 / FIND YOUR AREA','Area & feedback task map','A / P / T are placeholder codes in this reconstruction. They are not historical or live access points.')
b.regions()
b.box('Before your shift / Complete one check per area','My area: ______________  Feedback subject: ______________\nCard ID: ______________  Page subject: __________________\nVerified backup entry: _________________________________\nArea contact / channel: _________________________________')
b.head('Match the subject before inviting')
b.para('Check the product or session sign, the NFC / QR material, and the name and question on the page. If they do not match, stop using the material and notify the lead. Do not ask visitors to continue on the wrong page.')
b.para('The current demo only shows R146C product feedback. It does not prove this product appeared at the original event; A / T entry routes and product switching are not implemented. Confirm actual areas, sessions, questions and routes before testing.',style='small')

b.page('03 / STANDARD STEPS','Invite. Enter. Express. Review.','The screenshot explains the controls. It is the current R7 concept demo, not the historical event interface.')
start=b.y; img=g.ROOT/'screenshots/r7-home-390.png'; iw,ih=g.ImageReader(str(img)).getSize(); scale=155/(iw/2); imageh=452*scale
b.c.saveState(); clip=b.c.beginPath(); clip.rect(40,start-imageh,155,imageh); b.c.clipPath(clip,stroke=0,fill=0); b.c.drawImage(str(img),40,start-ih*scale,width=iw*scale,height=ih*scale,mask='auto'); b.c.restoreState()
g.MD.append('[R7 demo screenshot](../../screenshots/r7-home-390.png)\n')
for title,text in [('01  Invite / Participation is optional','Use the invitation in section 01. If the visitor declines or wants to leave, stop without asking them to justify it.'),('02  Enter / Confirm the subject','Ask the visitor to check the product or session name. If NFC does not respond, use a verified QR code for the same subject. Actual NFC / QR links are not verified by this repository.'),('03  Express / Let the visitor choose','Try speaking is the simulated voice entry. Write a thought opens text input. Visitors can write directly; there is no need to try voice first.'),('04  Review / The visitor owns the words','Ask whether the text says what they mean. Edit changes the example; Continue as text keeps the existing words for editing. Explain controls, but do not rewrite their opinion.')]:
 b.para(title,x=216,width=339,style='head',gap=7); b.para(text,x=216,width=339,gap=15)
b.y=min(b.y,start-imageh-16)
b.head('05  Finish / A finished page is not proof of receipt')
b.para('Demo complete means only that the demo ended; the page states nothing was sent. At a live event, use the agreed completion indicator. If the result is unclear, do not claim success or immediately resubmit. See section 06.')
b.box('Protect what has already been written','In the demo, switching views keeps existing text; refreshing or restarting clears it. A new voice sample can replace the draft. Explain any clear or re-record confirmation first, then let the visitor decide.')

b.page('04 / SIX PROMPT CARDS','Support their own words','Listen first. Offer one prompt. If they do not want to add anything, accept their answer or let them finish.')
b.card('01','What is YouFeed?','Explain purpose and choice.','It’s a way to share your views about this place. You can choose whether you’d like to take part.','No promises of anonymity, timing, rewards or action on every comment.')
b.card('02','What should I comment on?','Confirm and narrow the subject.','This page is about [subject]. You can share just one thing that stood out. A first impression is fine.','Do not suggest an answer or say “You could praise the design.”')
b.card('03','“No comments” / “It’s fine”','Offer one optional follow-up.','If you’d like, what made you feel that way? It’s also fine to leave it there.','Do not turn vague words into praise, keep probing or require more words.')
b.card('04','Voice is inconvenient','Make writing a direct choice.','You can choose text and write it in your own way.','No forced microphone access or speaking for them. The demo does not record.')
b.card('05','Wrong product or session','Pause and check the subject.','This page shows [page subject]. Did you mean [target subject]? Let’s check the entry first.','No wrong-page entry or automatic draft transfer. Explain loss risks first.')
b.card('06','They want to stop','Respect the decision to leave.','Of course. Thank you. You can stop whenever you like.','No pressure, private questions or finishing for them. Closing is not deletion.')

b.page('05 / RECOVERY / ENTRY & CONNECTION','Check the subject, then recover','[UI] = current demo. [TBC] = unverified live capability. All other recovery and stop rules are proposed for the field team.')
b.decision('entry')
b.incident('E1 / Unstable network or page will not open','Endless loading, a blank page or connection error.','Ask whether they have written anything or pressed submit. Do not refresh a draft. Check the entry and connection.','With no draft, the visitor may choose another available network and reopen the verified entry. For a draft or prior submit, see E6.','After one changed recovery attempt fails, or the visitor wants to stop. Do not repeatedly refresh.','Log time, area, entry, error and outcome to the lead. If the same entry fails on multiple devices, pause invitations there.')
b.incident('E2 / NFC or QR code does not open','No response to tapping, unreadable QR code or failed redirect.','Check the subject on the card, any obstruction and the destination. Do not ask visitors to install an unknown app.','Use a verified QR code for the same subject after NFC fails. If QR fails, use only a backup link verified by the lead.','If the alternative fails or none is verified. Do not invent links or use another product’s entry.','Log touchpoint ID, NFC / QR, symptom and result to the lead for material and route checks.')
b.incident('E3 / The page shows the wrong subject','The name, image or session differs from the intended feedback subject.','Compare the product / sign, card and page; pause writing.','With no draft, open the verified correct entry. If text exists, explain possible loss before the visitor chooses whether to continue.','If the correct entry is still wrong or cannot be found. Do not send feedback to the wrong subject.','Log entry ID, shown and intended subject. Lead pauses the material; technical support checks mapping. [TBC] Draft transfer.')

b.page('06 / RECOVERY / EXPRESSION & COMPLETION','Unclear result? Do not resubmit.','[UI] = current simulation. [TBC] = live capability to confirm. Other recovery and stop rules are proposed for the field team.')
b.decision('status')
b.incident('E4 / Voice unavailable, empty or not transcribed','Voice unavailable, No words picked up, or a transcription error.','[UI] Check for a simulated label. This demo does not request microphone permission, record sound or transcribe audio.','[UI] Write instead keeps earlier text. Try voice again / Try again tests simulated recovery.','After one unsuccessful recovery attempt, or if they prefer not to speak: write or finish. Do not keep requesting permission.','Log the message and whether switching helped to the lead. [TBC] Technical support checks live permissions and compatibility.')
b.incident('E5 / The page explicitly reports a submit error','An error is shown with a retry option.','[UI] The demo keeps the draft for retry. This does not prove a live system has not already received a submission.','Use the lead’s confirmed interpretation of live errors. Let the visitor retry only when it is known to be safe.','After one safe retry fails, or receipt becomes uncertain. Move to E6.','Log error, time, retry count and last state to the lead / technical support. [TBC] Timeout meaning and duplicate handling.')
b.incident('E6 / Completion is unclear','Still waiting, page closed, connection lost or no clear completion message.','No success message does not mean nothing was received. Ask what happened last and whether submit was pressed.','Keep the page if still open; do not refresh or reopen to resubmit. Let the visitor leave. The lead asks the backend team to check.','When no confirmed mechanism can establish the outcome. Record “unclear”; do not ask the visitor to wait indefinitely.','Log time, entry, last action and page state; receipt ID only if provided. Lead hands over to backend. The demo has no live receipt lookup.')

b.page('07 / FIRST TEST / RECORD & HANDOVER','Record the issue and the help','One record per attempt or issue. Copy this page as needed. No visitor name, phone number or full feedback is needed.')
b.table([['FIELD','COMPLETE ON SITE'],['Context','Record ID: __________  Time: __________\nArea / entry ID: __________________________________\nProduct / feedback subject / session: _________________'],['Observation & help','Difficulty or essential quote (remove personal details):\n________________________________________________\nHelp given / number of retries: ______________________\n________________________________________________'],['Completion (choose one)','Independent / With help / Not completed / Unclear\nHelp includes extra explanation, prompts or troubleshooting; the standard invitation does not count.'],['Outcome & evidence','Last page state: __________________________________\nLive receipt: Verified / Unverified / N/A (simulation)\nEvidence or receipt ID, if available: ___________________'],['Handover','Follow-up needed: Yes / No   Assign to: _______________\nStaff code: ________  Accepted by / at: ________________\nStatus: Awaiting acceptance / In progress / Closed\nNext check: ________  Outcome / closure evidence: ______']],[125,390])
b.head('Who receives it / Close the loop [proposed]')
b.para('Staff hand records to the field lead. Entry, network and voice issues go to technical support; receipt checks to the backend team; subject names, sessions and wording to the area content owner. Fill actual contacts in section 08.')
b.para('Escalate repeated entry failures, wrong subjects or unexpected personal information immediately. Hand over other records at the agreed shift interval. The recipient accepts the issue, sets a follow-up time and records closure evidence; forwarding is not closure.')
b.para('Collect only what troubleshooting needs. Do not keep visitor feedback, audio or identifiable screenshots on personal devices. If a screenshot is necessary, the lead confirms the method and unrelated details are hidden. Agree storage, access and retention first.',style='small')

b.page('08 / PREPARATION & MATERIAL CHECK','Complete before field use','The lead must approve the proposed field rules. This reconstruction supports discussion and rehearsal; it is not an approved operating procedure.')
b.table([['OWNER / SETUP','INFORMATION TO COMPLETE'],['Field lead / backup','Name or staff code: __________ / __________\nContact channel: __________________  Shift: ________'],['Technical / backend / content','Contacts and channels: ___________________________\nEscalation if the first contact is unavailable: __________'],['Entries & recovery rules','A / P / T entries, backup links and live completion checked: ___\nSafe retry conditions / wait limit / escalation point: ______'],['Records & visitor information','Storage / authorised access / retention: ______________\nApproved purpose, privacy wording and client owner: ____']],[140,375])
b.head('Three walkthroughs / This reconstruction only')
b.para('1. New staff: choose an area; find the subject and entry check, then give a voluntary invitation. Use sections 01–03.\n2. A visitor does not know what to say: use cards 02 / 03 in section 04. Offer a neutral prompt and allow no further detail.\n3. Connection fails: use E1 in section 05; if submit was already pressed, move to E6 in section 06. Name the stop condition and handover owner.')
b.para('Rehearsal log: Date ______  Participant staff code ______\nFor each task: Found / Needed a prompt / Not found\nObserved difficulty __________________  Change needed ______________\nOwner ______  Review date ______')
b.head('Version & evidence')
b.para('User brief and participant account: historical context and scope of involvement. Current R7 interface and code: product feedback, text / simulated voice, draft and submission states. Visual cues follow the local Giacomini red and light-grey system; the document layout is newly designed.',style='small')
b.para('Local sources: HANDOFF.md; docs/giacomini-content.md; docs/design-system.md; src/YouFeed.jsx; src/feedback-state.js; src/demo-feedback.js. Screenshot: screenshots/r7-home-390.png. These are project references, not original event materials or evidence of historical outcomes.',style='small',gap=3)
b.para('Portfolio selections: 02 area map, 04 prompt cards and 05–06 recovery. Label “Reconstructed from project experience, 2026”. Explain the problem addressed without attributing new rules or results to the original event.',style='small')
b.save(); (g.ROOT/'docs/field-guide/guide-content-en.md').write_text('# YouFeed Exhibition Field Guide / Reconstruction v1.1\n\n'+'\n'.join(g.MD))

g.MD=[]
q=EnglishBook(g.OUT/'youfeed-field-quick-reference-en.pdf',quick=True); q.c.setTitle('YouFeed Field Quick Reference / English / v1.1')
q.page('POCKET REFERENCE / A4 / PRINT SEPARATELY','Check. Support. Finish clearly.','Reconstruction. The current version simulates voice and submission. Do not promise anything that has not been confirmed.')
q.head('01 / Invite and identify the area')
q.para('“We’d like to hear your views on [subject]. If you’d like to take part, tap the NFC card or scan the QR code. It is entirely optional.” For a demo, add: “Voice uses sample text and nothing is sent.”')
q.table([['A / EXHIBITION','P / PRODUCT','T / TALK OR SESSION'],['Choose one thing that stood out.','Confirm the product; separate first impressions from use.','Confirm title / session; discuss content, understanding or experience.']],[171,172,172])
q.head('02 / If they do not know what to say')
q.para('“You can share just one thing that stood out.” Then, if useful: “What made you feel that way?”\nOffer text if voice is inconvenient; let them stop. Do not suggest praise, write for them or insist on more.')
q.head('03 / Check, try an alternative, stop, hand over')
q.table([['SYMPTOM','NEXT STEP AND STOP CONDITION'],['Entry / network fails','With no draft: verify the subject; try a verified alternative entry or network once. Stop if it still fails. Do not refresh a draft. E1 / E2.'],['Wrong subject','Pause. Match material and page; stop if no correct entry exists. Do not promise draft transfer. Ask the lead to pause wrong material. E3.'],['Voice unavailable','Switch to text; the demo does not record. Stop after one failed recovery attempt. E4.'],['Submit error / unclear','Retry once only if confirmed safe. If unclear, do not resubmit. Keep the page if open, let them leave and ask backend to check. E5 / E6.']],[105,410])
q.head('04 / Finish and record the minimum')
q.para('Log time, area / entry, subject, difficulty, help, retries, last state and owner.\nChoose: Independent / With help / Not completed / Unclear. Separately record verified receipt.\nDemo complete is not live receipt. Refreshing clears the demo draft. No unrelated personal data.',gap=13)
q.para('Lead / channel: ____________________  Backup: ____________________\nTechnical / backend contact: ________________  Follow-up time: __________\nThese stop rules are proposed. Confirm entries, live completion and safe retries before field use.',style='small')
q.save(); (g.ROOT/'docs/field-guide/quick-reference-content-en.md').write_text('# YouFeed Field Quick Reference / Reconstruction v1.1\n\n'+'\n'.join(g.MD))

for stem,count in [('youfeed-field-guide',8),('youfeed-field-quick-reference',1)]:
 cn=PdfReader(g.OUT/(stem+'-zh.pdf')); en=PdfReader(g.OUT/(stem+'-en.pdf'))
 assert len(cn.pages)==len(en.pages)==count
 writer=PdfWriter(); writer.page_layout='/TwoPageLeft'
 for i in range(count):
  writer.add_page(cn.pages[i]); writer.add_page(en.pages[i])
  writer.add_outline_item(('主题 / Section '+str(i+1)) if count>1 else '速查 / Quick reference',i*2)
 writer.add_metadata({'/Title':'YouFeed / Chinese-English / Reconstruction v1.1','/Author':'YouFeed / Reconstructed materials'})
 with open(FINAL/(stem+'-bilingual.pdf'),'wb') as f: writer.write(f)
 if count==1:
  print(stem,'bilingual',count*2,'A4 pages'); continue
 # Paired A3 spread: every theme stays on one page for direct comparison.
 spread=PdfWriter()
 for i in range(count):
  p=spread.add_blank_page(width=g.W*2,height=g.H)
  p.merge_page(cn.pages[i]); p.merge_transformed_page(en.pages[i],Transformation().translate(tx=g.W))
 spread.add_metadata({'/Title':'YouFeed / Chinese-English side by side / v1.1'})
 with open(FINAL/(stem+'-bilingual-spreads.pdf'),'wb') as f: spread.write(f)
 print(stem,'bilingual',count*2,'A4 pages;',count,'A3 spreads')
