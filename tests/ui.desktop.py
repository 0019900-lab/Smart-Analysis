# الوضع الفاتح افتراضياً + إخفاء غير المنفَّذ + أوامر سطح المكتب (بمحاكاة window.desktop):  python3 tests/ui.desktop.py
import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8782','-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
res=[]
def chk(n,c):res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n)
FAKE="""window.__calls=[];window.desktop={platform:'win32',onOpenFile:()=>{},initialFile:async()=>null,getSettings:async()=>({startFullscreen:true}),
 setSetting:(k,v)=>window.__calls.push(['set',k,v]),toggleFullscreen:async()=>{window.__calls.push(['fs']);return true},quit:()=>window.__calls.push(['quit'])}"""
try:
 with sync_playwright() as p:
  b=p.chromium.launch()
  # 1) المتصفح مع نظام داكن: يجب أن يفتح فاتحاً + لا عناصر غير منفَّذة
  pg=b.new_context(color_scheme='dark').new_page();pg.goto('http://localhost:8782/index.html');pg.wait_for_selector('.welcome')
  chk('default theme is light',pg.evaluate("document.documentElement.dataset.theme")=='light')
  r=pg.evaluate("""()=>{const {ACT,MENUS}=globalThis.__statlab;const bad=[];MENUS.forEach(m=>(m[2]||[]).forEach(it=>{if(Array.isArray(it)&&!(it[3]&&ACT[it[3]]))bad.push(it[0])}));return{bad,tops:MENUS.map(m=>m[0]),txt:document.querySelector('#menubar').innerText}}""")
  chk('no unimplemented menu items',r['bad']==[])
  chk('empty menu removed',not any(t=='إضافات' for t in r['tops']))
  chk('no "coming soon" text in menus',('قريباً' not in r['txt']) and ('soon' not in r['txt'].lower()))
  chk('no desktop-only items in browser',pg.evaluate("!globalThis.__statlab.ACT.fullscreen"))
  # 2) سطح المكتب
  pg2=b.new_context().new_page();pg2.add_init_script(FAKE);pg2.goto('http://localhost:8782/index.html');pg2.wait_for_selector('.welcome')
  r2=pg2.evaluate("""()=>{const {ACT,MENUS}=globalThis.__statlab;const lab=l=>(MENUS.find(m=>m[0]===l)[2]).map(i=>i[0]);return{view:lab('عرض'),file:lab('ملف'),cls:document.documentElement.classList.contains('desktop')}}""")
  chk('desktop: fullscreen items in View',any('ملء الشاشة' in x for x in r2['view']) and any('عند بدء التشغيل' in x for x in r2['view']))
  chk('desktop: Exit in File',any(x=='خروج' for x in r2['file']))
  pg2.evaluate("globalThis.__statlab.ACT.fullscreen();globalThis.__statlab.ACT.startFullscreen();globalThis.__statlab.ACT.quitApp()");pg2.wait_for_timeout(200)
  calls=pg2.evaluate("window.__calls");chk('desktop actions call bridge',['fs'] in calls and ['set','startFullscreen',False] in calls and ['quit'] in calls)
  b.close()
finally:srv.terminate()
print(f"desktop ui: {sum(res)} passed, {len(res)-sum(res)} failed");sys.exit(0 if all(res) else 1)
