// Smart-Analysis – نافذة الإعدادات (عام / النافذة / التخزين / إزالة التثبيت / حول). تعمل في المتصفح ونسخة الكمبيوتر.
// عناصر سطح المكتب تظهر فقط حين يوجد window.desktop. كل تغيير يُطبَّق ويُحفظ فوراً مع رسالة «تم الحفظ».
import {T} from './i18n.js';import {ic} from './icons.js';import {VERSION,BUILD} from './version.js';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=b=>b==null?'—':b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':b<1073741824?(b/1048576).toFixed(1)+' MB':(b/1073741824).toFixed(2)+' GB';
const THEME_PREFS=[['light',['فاتح','Light']],['dark',['داكن','Dark']],['system',['حسب النظام','System']],['last',['آخر ما استخدمته','Last used']]];
const WIN_MODES=[['maximized',['نافذة مكبّرة','Maximized']],['fullscreen',['ملء الشاشة','Fullscreen']],['windowed',['نافذة عادية','Windowed']]];
let ov=null;
export const themePref=()=>localStorage.themePref||'light';
export function closeSettings(){if(!ov)return;ov.remove();ov=null;document.removeEventListener('keydown',onKey,true)}
function onKey(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSettings()}}
export function openSettings(ACT,section='general'){
 closeSettings();const D=window.desktop||null;let sec=section,msgT=0,info=null,usage=null;
 const SECS=[['general','gear',['عام','General']],...(D?[['window','window',['النافذة','Window']]]:[]),['storage','disk',['التخزين','Storage']],...(D?[['uninstall','trash',['إزالة التثبيت','Uninstall']]]:[]),['about','info',['حول','About']]];
 ov=document.createElement('div');ov.className='dlgov stov';document.body.append(ov);document.addEventListener('keydown',onKey,true);
 const lang=()=>document.documentElement.lang==='en'?'en':'ar';
 const saved=()=>{const m=ov.querySelector('.stmsg');if(!m)return;m.textContent='✓ '+T('تم الحفظ','Saved');m.classList.add('on');clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('on'),1800)};
 const seg=(id,opts,cur)=>`<div class="seg stseg" role="radiogroup" data-id="${id}">${opts.map(([v,l])=>`<button type="button" role="radio" aria-checked="${v===cur}" class="${v===cur?'on':''}" data-v="${v}">${esc(T(l[0],l[1]))}</button>`).join('')}</div>`;
 const row=(t,d,c,cls='')=>`<div class="strow ${cls}"><div class="stl"><b>${t}</b>${d?`<small>${d}</small>`:''}</div><div class="stc">${c}</div></div>`;
 const btn=(id,t,cls='')=>`<button type="button" class="stb ${cls}" data-b="${id}">${t}</button>`;
 const card=(t,rows)=>`<div class="stcard">${t?`<h4>${t}</h4>`:''}${rows}</div>`;
 const body={
  general:()=>card(T('اللغة والمظهر','Language & appearance'),
   row(T('لغة البرنامج','Interface language'),T('تتغير القوائم والنتائج فوراً.','Menus and results change instantly.'),seg('lang',[['ar',['العربية','العربية']],['en',['English','English']]],lang()))+
   row(T('الوضع الافتراضي عند التشغيل','Default mode at startup'),T('يُطبَّق كلما فتحت البرنامج. يمكنك التبديل اللحظي من الزر العلوي.','Applied every time the app opens. You can still switch instantly from the top bar.'),seg('themePref',THEME_PREFS,themePref()),'col')),
  window:()=>card(T('نافذة البرنامج','Application window'),
   row(T('طريقة الفتح','Startup mode'),T('«نافذة مكبّرة» تُبقي شريط العنوان وأزرار التصغير والإغلاق. «ملء الشاشة» يخفيها (F11 للتبديل المؤقت).','“Maximized” keeps the title bar with minimize and close. “Fullscreen” hides them (F11 toggles temporarily).'),seg('startMode',WIN_MODES,(info&&info.startMode)||'maximized'),'col')),
  storage:()=>card(T('مكان التخزين','Storage location'),
   row(T('الموقع','Location'),D?T('هنا يحفظ البرنامج إعداداته وبياناته المحلية.','Where the app keeps its settings and local data.'):T('يخزّن المتصفح بيانات البرنامج محلياً على جهازك.','Your browser stores the app data locally on this device.'),
    D?`<code class="stpath" dir="ltr">${esc(info?info.path:'…')}</code><div class="stbtns">${btn('openFolder',ic('open',14)+' '+T('فتح المجلد','Open folder'))}${btn('copyPath',ic('copy',14)+' '+T('نسخ المسار','Copy path'))}</div>`:`<code class="stpath" dir="ltr">${esc(location.origin)}</code>`,'col')+
   row(T('المساحة المستخدمة','Space used'),'',`<b class="stsize">${usage==null?'…':fmt(usage.used)}</b>${usage&&usage.quota?` <small class="mute">/ ${fmt(usage.quota)}</small>`:''}`))+
   card(T('تنظيف','Cleanup'),
   row(T('مسح الذاكرة المؤقتة','Clear cache'),T('آمن: لا يمس مشاريعك أو إعداداتك.','Safe: your projects and settings stay.'),btn('clearCache',T('مسح المؤقت','Clear cache')))+
   row(T('حذف كل بيانات البرنامج','Delete all app data'),T('يحذف الإعدادات والبيانات المحفوظة محلياً ثم يعيد التشغيل. لا يمكن التراجع.','Deletes settings and locally saved data, then restarts. Cannot be undone.'),btn('clearAll',T('حذف كل البيانات…','Delete all data…'),'dg'))),
  uninstall:()=>card(T('إزالة التثبيت','Uninstall'),
   row(T('الإصدار المثبّت','Installed version'),'',`<b>${esc(VERSION)}</b>`)+
   row(T('مجلد التثبيت','Install folder'),'',`<code class="stpath" dir="ltr">${esc(info?info.installPath:'…')}</code>`,'col')+
   row(T('إزالة Smart-Analysis من هذا الجهاز','Remove Smart-Analysis from this computer'),T('سيُغلق البرنامج ويفتح معالج الإزالة. مشاريعك المحفوظة كملفات لن تُحذف. لحذف الإعدادات أيضاً استخدم «حذف كل البيانات» من قسم التخزين أولاً.','The app closes and the uninstaller opens. Projects you saved as files are not deleted. To remove settings too, use “Delete all data” in Storage first.'),btn('uninstall',T('إزالة التثبيت…','Uninstall…'),'dg'))),
  about:()=>card('',`<div class="stabout"><img src="assets/mark.png" alt="" width="64" height="75"><div><h3>Smart-Analysis</h3><div class="mute">${T('الإصدار','Version')} ${esc(VERSION)} · ${esc(BUILD)}</div><p>${T('بديل حديث لـ SPSS: تحليلات إحصائية دقيقة بنتائج بصيغة APA، تعمل بالكامل على جهازك.','A modern SPSS alternative: accurate statistics with APA-style results, running entirely on your device.')}</p></div></div>`+
   row(T('دليل الاستخدام','User guide'),'',btn('guide',T('فتح الدليل','Open guide')))+row(T('معلومات الإصدار والشعار','Version & logo'),'',btn('about',T('عن البرنامج','About')))+(D?'':row(T('الخصوصية','Privacy'),'',`<small class="mute">${T('بياناتك لا تُرسل لأي خادم.','Your data never leaves your device.')}</small>`)))
 };
 const armed=new Map();
 const twoStep=(b,label,go)=>{if(armed.get(b.dataset.b)){armed.delete(b.dataset.b);go();return}armed.set(b.dataset.b,1);const old=b.innerHTML;b.innerHTML=T('اضغط مرة أخرى للتأكيد','Click again to confirm');b.classList.add('arm');setTimeout(()=>{if(armed.get(b.dataset.b)){armed.delete(b.dataset.b);b.innerHTML=old;b.classList.remove('arm')}},4000)};
 async function load(){if(D){try{const s=await D.getSettings(),i=await D.storageInfo();info={...s,...i};usage={used:i.size}}catch{}}else{try{const e=await navigator.storage.estimate();usage={used:e.usage,quota:e.quota}}catch{usage=null}}if(ov)render()}
 function render(){const L=SECS.find(s=>s[0]===sec)||SECS[0];
  ov.dir=document.documentElement.dir||'';
  ov.innerHTML=`<div class="stdlg" role="dialog" aria-modal="true" aria-label="${T('الإعدادات','Settings')}"><aside class="stnav"><div class="sthead"><span class="stlogo">${ic('gear',20)}</span><div><b>${T('الإعدادات','Settings')}</b><small>Smart-Analysis</small></div></div>${SECS.map(s=>`<button type="button" class="sti ${s[0]===sec?'on':''}" data-s="${s[0]}">${ic(s[1],17)}<span>${T(s[2][0],s[2][1])}</span></button>`).join('')}</aside>
   <section class="stmain"><header class="stph"><h3>${T(L[2][0],L[2][1])}</h3><button type="button" class="stx" data-b="close" aria-label="${T('إغلاق','Close')}">${ic('x',16)}</button></header><div class="stbody">${body[L[0]]()}</div>
   <footer class="stft"><span class="stmsg" role="status"></span><span class="stfsp"></span><button type="button" class="stb" data-b="reset">${T('استعادة الإعدادات الافتراضية','Restore defaults')}</button><button type="button" class="stb pri" data-b="close">${T('إغلاق','Close')}</button></footer></section></div>`;
  ov.querySelector('.sti.on,.sti')&&0;const f=ov.querySelector('.sti.on');f&&f.focus({preventScroll:true})}
 ov.addEventListener('mousedown',e=>{if(e.target===ov)closeSettings()});
 ov.addEventListener('click',async e=>{const t=e.target,n=t.closest('.sti'),sg=t.closest('.stseg button'),b=t.closest('[data-b]');
  if(n){sec=n.dataset.s;render();return}
  if(sg){const id=sg.parentElement.dataset.id,v=sg.dataset.v;
   if(id==='lang'){ACT.setLang(v);render();saved()}
   else if(id==='themePref'){localStorage.themePref=v;if(v==='light'||v==='dark')ACT.setTheme(v);else if(v==='system')ACT.setTheme(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');render();saved()}
   else if(id==='startMode'&&D){await D.setSetting('startMode',v);await D.applyWindowMode(v);info={...info,startMode:v};render();saved()}
   return}
  if(!b)return;const k=b.dataset.b;
  if(k==='close')closeSettings();
  else if(k==='reset'){localStorage.themePref='light';ACT.setTheme('light');if(D){await D.setSetting('startMode','maximized');await D.applyWindowMode('maximized');info={...info,startMode:'maximized'}}render();saved()}
  else if(k==='openFolder')D.openDataFolder();
  else if(k==='copyPath'){try{await navigator.clipboard.writeText(info.path);saved()}catch{}}
  else if(k==='clearCache'){try{if(D)await D.clearCache();else if(globalThis.caches)for(const c of await caches.keys())await caches.delete(c)}catch{}await load();saved()}
  else if(k==='clearAll')twoStep(b,'',async()=>{if(D){await D.clearData()}else{try{localStorage.clear();sessionStorage.clear();if(indexedDB.databases)for(const d of await indexedDB.databases())indexedDB.deleteDatabase(d.name);if(globalThis.caches)for(const c of await caches.keys())await caches.delete(c)}catch{}location.reload()}});
  else if(k==='uninstall')twoStep(b,'',async()=>{const r=await D.uninstall();const m=ov.querySelector('.stmsg');if(r==='dev'){m.textContent=T('الإزالة متاحة في النسخة المثبّتة فقط','Uninstall is available in the installed app only');m.classList.add('on')}});
  else if(k==='guide'){closeSettings();ACT.guide()}
  else if(k==='about'){closeSettings();ACT.about()}});
 render();load()}
