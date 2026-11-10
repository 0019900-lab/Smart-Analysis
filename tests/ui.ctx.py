# قوائم الكليك يمين: python3 tests/ui.ctx.py  (اللقطات في /tmp/shotsctx)
import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.makedirs('/tmp/shotsctx',exist_ok=True)
srv=subprocess.Popen([sys.executable,'-m','http.server','8774','-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[];res=[]
def chk(n,c):res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n)
try:
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':800})
  pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_NAME_NOT_RESOLVED' not in m.text else None);pg.on('pageerror',lambda e:errs.append(str(e)+' | '+str(getattr(e,'stack',''))[:400]))
  pg.goto('http://localhost:8774/index.html');pg.wait_for_selector('.welcome');pg.click('[data-a=demo]');pg.wait_for_timeout(1500)
  st=lambda:pg.evaluate("async()=>{const m=await import('./data.js');return{n:m.store.n,v:m.store.vars.map(v=>v.name),a:m.store.cols[0].slice(0,4)}}")
  s0=st();n0,v0=s0['n'],len(s0['v'])
  pg.mouse.click(1,1)
  # 1) كليك يمين على خلية
  td=pg.query_selector('td[data-r="2"][data-c="1"]');td.click(button='right');pg.wait_for_selector('.cm')
  chk('cell menu opens',pg.query_selector('.cm') is not None)
  labels=[x.inner_text() for x in pg.query_selector_all('.cm .cml')]
  chk('cell menu has cut/copy/paste/insert/delete/sort',all(any(k in l for l in labels) for k in ['قص','نسخ','لصق','إدراج','حذف','ترتيب']))
  pg.screenshot(path='/tmp/shotsctx/cell.png')
  # 2) إدراج حالة
  pg.click('.cm .cmi:has-text("إدراج حالة أعلى")');pg.wait_for_timeout(300)
  s1=st();chk('insert case: n+1',s1['n']==n0+1)
  chk('selection moved to inserted row',pg.evaluate("document.querySelector('td.cur')?.dataset.r")=='2')
  # 3) تراجع
  pg.keyboard.press('Control+z');pg.wait_for_timeout(300);chk('undo insert',st()['n']==n0)
  # 4) عنوان عمود: إدراج متغير على اليسار + حذف
  pg.query_selector('th[data-hc="1"]').click(button='right');pg.wait_for_selector('.cm')
  pg.click('.cm .cmi:has-text("إدراج متغير على اليسار")');pg.wait_for_timeout(300)
  s2=st();chk('insert variable',len(s2['v'])==v0+1 and s2['v'][1].startswith('VAR'))
  pg.query_selector('th[data-hc="1"]').click(button='right');pg.wait_for_selector('.cm')
  pg.click('.cm .cmi.dg');pg.wait_for_timeout(300);chk('delete variable',len(st()['v'])==v0)
  # 5) ترتيب تنازلي من قائمة العمود
  pg.query_selector('th[data-hc="0"]').click(button='right');pg.wait_for_selector('.cm')
  pg.click('.cm .cmi:has-text("ترتيب تنازلي")');pg.wait_for_timeout(800)
  a=st()['a'];chk('sort descending',a[0]>=a[1]>=a[2] if all(isinstance(x,(int,float)) for x in a) else True)
  # 6) رقم الصف: حذف
  pg.query_selector('tbody th:has-text("3")').click(button='right');pg.wait_for_selector('.cm')
  pg.click('.cm .cmi.dg');pg.wait_for_timeout(500);chk('delete case',st()['n']==n0-1)
  pg.evaluate("document.querySelector('#gridWrap').scrollTop=0");pg.wait_for_timeout(300)
  print('rows rendered:',pg.evaluate("[...document.querySelectorAll('td[data-r]')].slice(0,2).map(x=>x.dataset.r+','+x.dataset.c)"),pg.evaluate("document.querySelector('#gridWrap').scrollTop"))
  # 7) لوحة المفاتيح داخل القائمة + Escape
  pg.query_selector('td[data-r="1"][data-c="0"]').click(button='right');pg.wait_for_selector('.cm')
  pg.keyboard.press('ArrowDown');pg.keyboard.press('Escape');pg.wait_for_timeout(150);chk('Escape closes',pg.query_selector('.cm') is None)
  # 8) النقر خارج القائمة يغلقها
  pg.query_selector('td[data-r="1"][data-c="0"]').click(button='right');pg.wait_for_selector('.cm');pg.mouse.click(700,30);pg.wait_for_timeout(150);chk('outside click closes',pg.query_selector('.cm') is None)
  # 9) Variable View
  pg.click('.tab[data-view=var]');pg.wait_for_timeout(300)
  pg.query_selector('#varGrid tbody tr:nth-child(2) th').click(button='right');pg.wait_for_selector('.cm')
  vl=[x.inner_text() for x in pg.query_selector_all('.cm .cml')]
  chk('variable view menu',any('تسميات القيم' in l for l in vl) and any('تكرار' in l for l in vl))
  pg.screenshot(path='/tmp/shotsctx/varview.png')
  pg.click('.cm .cmi:has-text("تكرار المتغير")');pg.wait_for_timeout(300);chk('duplicate variable',len(st()['v'])==v0+1)
  pg.keyboard.press('Control+z');pg.wait_for_timeout(300)
  # 10) المخرجات
  pg.click('.tab[data-view=data]')
  pg.evaluate("async()=>{const m=await import('./output.js');m.addBlock('Alpha table',[{cap:'Demo',head:['Group','N'],rows:[['A','10']],lc:1}],['APA line'],null);m.addBlock('Beta table',[{cap:'Demo',head:['G','N'],rows:[['B','12']],lc:1}],[],null)}");pg.wait_for_timeout(500)
  pg.query_selector('#outputBody .blk h4').click(button='right');pg.wait_for_selector('.cm')
  chk('output menu',any('حذف من المخرجات' in x.inner_text() for x in pg.query_selector_all('.cm .cml')))
  pg.screenshot(path='/tmp/shotsctx/output.png')
  pg.click('.cm .cmi:has-text("نقل للأسفل")');pg.wait_for_timeout(300)
  chk('move down via menu',pg.query_selector_all('#outputBody .blk h4')[0].inner_text()=='Beta table')
  pg.query_selector('#outputBody .blk h4').click(button='right');pg.wait_for_selector('.cm');pg.click('.cm .cmi.dg');pg.wait_for_timeout(300)
  chk('delete output item',len(pg.query_selector_all('#outputBody .blk'))==1)
  # 11) حقل إدخال يحتفظ بقائمته الأصلية
  pg.query_selector('td[data-r="1"][data-c="0"]').dblclick();pg.wait_for_selector('#cellEditor:not([hidden])')
  pg.query_selector('#cellEditor').click(button='right');pg.wait_for_timeout(200);chk('cell editor keeps native menu',pg.query_selector('.cm') is None)
  pg.keyboard.press('Escape')
  # 12) English
  pg.keyboard.press('Alt+l');pg.wait_for_timeout(300);pg.query_selector('td[data-r="1"][data-c="0"]').click(button='right');pg.wait_for_selector('.cm')
  el=[x.inner_text() for x in pg.query_selector_all('.cm .cml')];chk('english labels',any('Insert' in l for l in el) and not any(any('\u0600'<=ch<='\u06ff' for ch in l) for l in el))
  pg.screenshot(path='/tmp/shotsctx/en.png')
  chk('no console errors',not errs)
  b.close()
finally:srv.terminate()
print(f"ctx ui: {sum(res)} passed, {len(res)-sum(res)} failed",errs[:3]);sys.exit(0 if all(res) else 1)
