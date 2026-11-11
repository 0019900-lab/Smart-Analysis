# الإعدادات: python3 tests/ui.settings.py
import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8783','-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
res=[];errs=[]
def chk(n,c):res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n)
FAKE="""window.__c=[];window.desktop={platform:'win32',onOpenFile:()=>{},initialFile:async()=>null,getSettings:async()=>({startMode:'maximized'}),
 setSetting:async(k,v)=>window.__c.push(['set',k,v]),applyWindowMode:async m=>window.__c.push(['mode',m]),toggleFullscreen:async()=>true,quit:()=>{},
 storageInfo:async()=>({path:'C:\\\\Users\\\\me\\\\AppData\\\\Roaming\\\\Smart-Analysis',size:5242880,installPath:'C:\\\\Program Files\\\\Smart-Analysis',version:'0.20.0',packaged:true}),
 openDataFolder:async()=>window.__c.push(['open']),clearCache:async()=>window.__c.push(['cache']),clearData:async()=>window.__c.push(['clearData']),uninstall:async()=>{window.__c.push(['uninstall']);return'started'}}"""
try:
 with sync_playwright() as p:
  b=p.chromium.launch()
  ctx=b.new_context(viewport={'width':1366,'height':800});pg=ctx.new_page()
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto('http://localhost:8783/index.html');pg.wait_for_selector('.welcome');pg.click('[data-a=demo]');pg.wait_for_timeout(1200)
  pg.click('#btnSettings');pg.wait_for_selector('.stdlg')
  navs=[x.inner_text() for x in pg.query_selector_all('.sti')]
  chk('web sections: general/storage/about only',len(navs)==3 and not any('النافذة' in n or 'إزالة' in n for n in navs))
  pg.screenshot(path='/tmp/shotsctx/settings_ar.png')
  # الوضع الافتراضي = داكن، يطبَّق فوراً ويُحفظ
  pg.click('.stseg[data-id=themePref] button[data-v=dark]');pg.wait_for_timeout(200)
  chk('default mode dark saved + applied',pg.evaluate("localStorage.themePref")=='dark' and pg.evaluate("document.documentElement.dataset.theme")=='dark')
  chk('saved message shown',pg.inner_text('.stmsg').strip().startswith('✓'))
  pg.keyboard.press('Escape');pg.wait_for_timeout(150);chk('Esc closes',pg.query_selector('.stdlg') is None)
  pg.reload();pg.wait_for_selector('.welcome');pg.click('[data-a=demo]');pg.wait_for_timeout(1200);chk('reopens in dark by preference',pg.evaluate("document.documentElement.dataset.theme")=='dark')
  # اللغة
  pg.keyboard.press('Control+,');pg.wait_for_selector('.stdlg')
  pg.click('.stseg[data-id=lang] button[data-v=en]');pg.wait_for_timeout(200)
  t=pg.inner_text('.stdlg');chk('English labels',('Default mode at startup' in t) and ('Storage' in t))
  chk('no Arabic leftovers in English view',not any('\u0600'<=ch<='\u06ff' for ch in pg.inner_text('.stbody').replace('العربية','')))
  pg.click('.sti[data-s=storage]');pg.wait_for_timeout(500);pg.screenshot(path='/tmp/shotsctx/settings_en_storage.png')
  chk('storage size shown',any(u in pg.inner_text('.stsize') for u in ['KB','MB','B']))
  # حذف كل البيانات بخطوتين
  pg.click('[data-b=clearAll]');chk('two-step confirm armed',pg.query_selector('[data-b=clearAll].arm') is not None)
  pg.click('.stseg >> nth=0') if False else None
  # reset
  pg.click('[data-b=reset]');pg.wait_for_timeout(200);chk('restore defaults -> light',pg.evaluate("localStorage.themePref")=='light' and pg.evaluate("document.documentElement.dataset.theme")=='light')
  # سطح المكتب (محاكاة)
  pg2=b.new_context(viewport={'width':1366,'height':800}).new_page();pg2.add_init_script(FAKE);pg2.on('pageerror',lambda e:errs.append(str(e)));pg2.goto('http://localhost:8783/index.html');pg2.wait_for_selector('.welcome');pg2.click('[data-a=demo]');pg2.wait_for_timeout(1200)
  pg2.click('#btnSettings');pg2.wait_for_selector('.stdlg')
  navs=[x.inner_text() for x in pg2.query_selector_all('.sti')];chk('desktop sections incl. window+uninstall',len(navs)==5)
  pg2.click('.sti[data-s=window]');pg2.wait_for_timeout(300)
  chk('window mode shows current (maximized) as selected',pg2.get_attribute('.stseg[data-id=startMode] button.on','data-v')=='maximized')
  pg2.click('.stseg[data-id=startMode] button[data-v=fullscreen]');pg2.wait_for_timeout(300)
  calls=pg2.evaluate("window.__c");chk('fullscreen choice saved+applied',['set','startMode','fullscreen'] in calls and ['mode','fullscreen'] in calls)
  chk('selection reflected in UI',pg2.get_attribute('.stseg[data-id=startMode] button.on','data-v')=='fullscreen')
  pg2.screenshot(path='/tmp/shotsctx/settings_desktop_window.png')
  pg2.click('.sti[data-s=storage]');pg2.wait_for_timeout(300)
  chk('storage path+size shown',('AppData' in pg2.inner_text('.stpath')) and ('5.0 MB' in pg2.inner_text('.stsize')))
  pg2.click('[data-b=openFolder]');pg2.click('[data-b=clearCache]');pg2.wait_for_timeout(200);c2=pg2.evaluate("window.__c");chk('open folder + clear cache call bridge',['open'] in c2 and ['cache'] in c2)
  pg2.click('.sti[data-s=uninstall]');pg2.click('[data-b=uninstall]');chk('uninstall needs confirmation',['uninstall'] not in pg2.evaluate("window.__c"))
  pg2.click('[data-b=uninstall]');pg2.wait_for_timeout(200);chk('uninstall called after confirm',['uninstall'] in pg2.evaluate("window.__c"))
  chk('no page errors',not errs)
  b.close()
finally:srv.terminate()
print(f"settings ui: {sum(res)} passed, {len(res)-sum(res)} failed",errs[:3]);sys.exit(0 if all(res) else 1)
