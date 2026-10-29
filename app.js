import * as G from './ui-grid.js';import * as F from './files.js';import {store,undo,redo} from './data.js';import {A} from './analyses.js';
import {initOutput,addText,clearOutput,EXPORT} from './output.js';import {T} from './i18n.js';import {ic,mark} from './icons.js';
import {initGuide,openGuide,undocumented} from './guide.js';import {showWelcome,showAbout} from './welcome.js';import {openFind,closeFind} from './find.js';
// StatLab – القوائم. كل عنصر: [عربي, English, اختصار, أمر, مرحلة] — مرحلة 0 = قريباً بدون موعد محدد
const S='-';
const MENUS=[
['ملف','File',[['جديد','New','','new',0],['فتح / استيراد (CSV, Excel, مشروع)...','Open / Import (CSV, Excel, project)...','Ctrl+O','open',0],['حفظ المشروع','Save project','Ctrl+S','save',0],S,['تصدير المخرجات: HTML','Export output: HTML','','exportHtml',3],['تصدير المخرجات: Word','Export output: Word','','exportWord',3],['تصدير المخرجات: PDF','Export output: PDF','','exportPdf',3],['تصدير المخرجات: Markdown','Export output: Markdown','','exportMd',3],['تصدير الجداول: Excel','Export tables: Excel','','exportXlsx',3],S,['تصدير البيانات: CSV','Export data: CSV','','exportCsv',0],['بيانات تجريبية (100 ألف صف)','Demo data (100k rows)','','demo',0],S,['طباعة','Print','Ctrl+P','print',0]]],
['تحرير','Edit',[['تراجع','Undo','Ctrl+Z','undo',0],['إعادة','Redo','Ctrl+Y','redo',0],S,['نسخ','Copy','Ctrl+C','copy',0],['لصق','Paste','Ctrl+V','paste',0],S,['بحث...','Find...','Ctrl+F','find',3],['إضافة ملاحظة للمخرجات','Add note to output','','addText',3]]],
['عرض','View','',null],['بيانات','Data','',null],['تحويل','Transform','',null],['تحليل','Analyze','',null],['رسوم','Graphs','',null],['أدوات','Utilities','',null],['إضافات','Extensions','',null],['نافذة','Window','',null],['مساعدة','Help','',null]];
const D={
'عرض':[['الوضع الداكن / الفاتح','Dark / Light mode','Ctrl+Shift+D','theme',0],['اللغة: عربي / English','Language: Arabic / English','Ctrl+Shift+L','lang',0],['لوحة الأوامر','Command palette','Ctrl+K','palette',0],['إظهار / إخفاء المخرجات','Show / hide output','Ctrl+Shift+O','pane',0],['نافذة المخرجات الكبيرة','Wide output window','','outputWide',3],['شاشة الترحيب','Welcome screen','','welcome',3]],
'بيانات':[['تعريف خصائص المتغير','Define Variable Properties','',null,0],['ترتيب الحالات','Sort Cases','',null,0],['دمج الملفات','Merge Files','',null,0],['تقسيم الملف','Split File','',null,0],['اختيار الحالات','Select Cases','',null,0],['ترجيح الحالات','Weight Cases','',null,0]],
'تحويل':[['حساب متغير','Compute Variable','',null,0],['إعادة ترميز','Recode','',null,0],['تصنيف بصري (Binning)','Visual Binning','',null,0],['استبدال القيم المفقودة','Replace Missing Values','',null,0]],
'تحليل':[['التكرارات','Frequencies','','frequencies',0],['الإحصاء الوصفي','Descriptives','','descriptives',0],['الجداول التقاطعية','Crosstabs','','crosstabs',0],S,['اختبار T لعينة واحدة','One-Sample T Test','','ttest1',0],['اختبار T لعينتين مستقلتين','Independent-Samples T Test','','ttestInd',0],['اختبار T لعينتين مرتبطتين','Paired-Samples T Test','','ttestPair',0],['تحليل التباين الأحادي','One-Way ANOVA','','anova',0],S,['الارتباط (Pearson / Spearman)','Correlate (Pearson / Spearman)','','correlate',0],S,['الانحدار','Regression','',null,5],['الاختبارات اللامعلمية','Nonparametric Tests','',null,5],['التحليل العاملي','Factor Analysis','',null,5],['اختبار الثبات (ألفا)','Reliability (Alpha)','',null,5]],
'رسوم':[['المدرج التكراري','Histogram','',null,4],['مخطط الصندوق','Boxplot','',null,4],['مخطط الانتشار','Scatter','',null,4],['مخطط الأعمدة','Bar','',null,4]],
'أدوات':[['تصدير الكود (Python / R)','Export code (Python / R)','',null,6],['سجل العمليات','History','',null,6]],
'إضافات':[['مكتبة الإضافات','Extension Hub','',null,8]],
'نافذة':[['عرض البيانات','Data window','','showData',0],['نافذة المخرجات','Output window','','outputWide',3]],
'مساعدة':[['دليل StatLab','StatLab Guide','F1','guide',3],['اختصارات لوحة المفاتيح','Keyboard shortcuts','','guideKeys',3],['شاشة الترحيب','Welcome screen','','welcome',3],['عن StatLab','About StatLab','','about',0]]};
MENUS.forEach(m=>{if(!m[2]||m[2]==='')m[2]=D[m[0]]||[]});
const ICON={new:'new',open:'open',save:'save',exportHtml:'html',exportWord:'word',exportPdf:'pdf',exportMd:'md',exportXlsx:'excel',exportCsv:'export',demo:'sparkle',print:'print',undo:'undo',redo:'redo',copy:'copy',paste:'copy',find:'find',addText:'text',theme:'theme',lang:'lang',palette:'cmd',pane:'output',outputWide:'expand',welcome:'rocket',frequencies:'table',descriptives:'analyze',crosstabs:'data',ttest1:'chart',ttestInd:'chart',ttestPair:'chart',anova:'chart',correlate:'chart',showData:'data',guide:'guide',guideKeys:'keyboard',about:'info'};
// شريط الأدوات: [أيقونة، أمر، عربي، English، اختصار]
const TB=[['new','new','جديد','New',''],['open','open','فتح','Open','Ctrl+O'],['save','save','حفظ','Save','Ctrl+S'],'|',['undo','undo','تراجع','Undo','Ctrl+Z'],['redo','redo','إعادة','Redo','Ctrl+Y'],'|',['find','find','بحث','Find','Ctrl+F'],['cmd','palette','لوحة الأوامر','Command palette','Ctrl+K'],['compute','compute','حساب متغير (قريباً)','Compute Variable (soon)',''],['analyze','descriptives','إحصاء وصفي','Descriptives',''],['chart','graphs','رسوم (قريباً)','Graphs (soon)',''],'|',['theme','theme','فاتح / داكن','Light / Dark','Ctrl+Shift+D'],['lang','lang','English / عربي','Arabic / English','Ctrl+Shift+L'],['guide','guide','الدليل','Guide','F1']];
const $=s=>document.querySelector(s),root=document.documentElement;
let lang=localStorage.lang||'ar',theme=localStorage.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
root.lang=lang;
function say(t){$('#status').textContent=t}
function applyLook(){root.dataset.theme=theme;root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';localStorage.lang=lang;localStorage.theme=theme;
 $('#titlebar .brand').innerHTML=mark(26)+'<span class="wm"><b>Stat</b><i>Lab</i></span>';
 $('#btnGuide').innerHTML=ic('guide',16)+`<span>${T('الدليل','Guide')}</span>`;$('#btnGuide').title='F1';
 document.querySelectorAll('.tab').forEach(b=>{const v=b.dataset.view==='data';b.innerHTML=lang==='ar'?`${v?'عرض البيانات':'عرض المتغيرات'} <small>${v?'Data View':'Variable View'}</small>`:(v?'Data View':'Variable View')});
 buildMenus();buildToolbar();$('#outputPane').relang();G.refresh&&G.refresh();
 say(T('المحرك جاهز','Engine ready'));$('#hint').textContent=T('Ctrl+K للبحث عن أي أمر · F1 للدليل','Ctrl+K to search any command · F1 for the guide');
 $('#palInput').placeholder=T('ابحث عن أمر أو تحليل...','Search a command or analysis...');$('#btnInstall').textContent=T('تثبيت','Install')}
const ACT={theme(){theme=theme==='dark'?'light':'dark';applyLook()},lang(){lang=lang==='ar'?'en':'ar';applyLook()},palette:openPal,
 pane(){const p=$('#outputPane');p.style.display=p.style.display==='none'?'':'none'},print(){print()},about:showAbout,
 outputWide(){const p=$('#outputPane');p.style.display='';p.classList.toggle('wide');p.relang()},
 showData(){$('.tab[data-view=data]').click()},find:()=>openFind(),addText,guide:()=>openGuide(),guideKeys:()=>openGuide('keys'),welcome:()=>showWelcome(ACT,true),
 exportHtml:EXPORT.html,exportWord:EXPORT.word,exportPdf:EXPORT.pdf,exportMd:EXPORT.md,exportXlsx:EXPORT.xlsx};
function run(it){if(it[3]&&ACT[it[3]])ACT[it[3]]();else say(it[4]?T(`«${it[0]}» هتتفعل في المرحلة ${it[4]}`,`“${it[1]}” arrives in phase ${it[4]}`):T(`«${it[0]}» قريباً`,`“${it[1]}” is coming soon`))}
const label=it=>lang==='ar'?`${it[0]} <small class="en">${it[1]}</small>`:it[1];
function buildMenus(){const bar=$('#menubar');bar.innerHTML='';
 MENUS.forEach(m=>{const w=document.createElement('div');w.className='menu';const b=document.createElement('button');b.textContent=T(m[0],m[1]);w.append(b);
  const dd=document.createElement('div');dd.className='dd';
  m[2].forEach(it=>{if(it===S){dd.append(document.createElement('hr'));return}const live=it[3]&&ACT[it[3]],x=document.createElement('button');
   x.className=live?'':'soonit';x.innerHTML=`<span class="ico">${ICON[it[3]]?ic(ICON[it[3]],16):''}</span><span class="lb">${label(it)}</span>${live?`<kbd>${it[2]}</kbd>`:`<em class="soon">${it[4]?'P'+it[4]:T('قريباً','Soon')}</em>`}`;
   x.onclick=()=>{close();run(it)};dd.append(x)});
  w.append(dd);b.onclick=e=>{e.stopPropagation();const o=w.classList.contains('open');close();if(!o)w.classList.add('open')};
  b.onmouseenter=()=>{if(document.querySelector('.menu.open')){close();w.classList.add('open')}};bar.append(w)})}
function close(){document.querySelectorAll('.menu.open').forEach(x=>x.classList.remove('open'))}
document.addEventListener('click',close);
function buildToolbar(){const t=$('#toolbar');t.innerHTML='';TB.forEach(i=>{if(i==='|'){const s=document.createElement('span');s.className='sep';t.append(s);return}
 const live=!!ACT[i[1]],b=document.createElement('button');b.innerHTML=ic(i[0],19);b.title=T(i[2],i[3])+(i[4]?`  (${i[4]})`:'');b.setAttribute('aria-label',T(i[2],i[3]));if(!live)b.classList.add('soonit');
 b.onclick=()=>run([i[2],i[3],'',live?i[1]:null,i[1]==='graphs'?4:0]);t.append(b)})}
// ---- لوحة الأوامر ----
let sel=0,items=[];
function openPal(){$('#palette').hidden=false;$('#palInput').value='';filter();$('#palInput').focus()}
function filter(){const q=$('#palInput').value.toLowerCase();items=[];MENUS.forEach(m=>m[2].forEach(it=>{if(it!==S&&(it[0]+' '+it[1]).toLowerCase().includes(q))items.push([it,T(m[0],m[1])])}));sel=0;drawPal()}
function drawPal(){const u=$('#palList');u.innerHTML='';items.slice(0,40).forEach((x,i)=>{const li=document.createElement('li'),it=x[0],live=it[3]&&ACT[it[3]];if(i===sel)li.className='sel';
 li.innerHTML=`<span class="pl">${ICON[it[3]]?ic(ICON[it[3]],16):'<i class="pi"></i>'}${label(it)}</span><kbd class="soon">${live?(it[2]||x[1]):x[1]+' · '+T('قريباً','soon')}</kbd>`;li.onclick=()=>pick(i);u.append(li)});
 const s=u.querySelector('.sel');s&&s.scrollIntoView({block:'nearest'})}
function pick(i){const x=items[i];if(!x)return;$('#palette').hidden=true;run(x[0])}
$('#palInput').oninput=filter;
$('#palInput').onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(sel+1,items.length-1);drawPal()}else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);drawPal()}else if(e.key==='Enter')pick(sel);else if(e.key==='Escape')$('#palette').hidden=true};
$('#palette').onclick=e=>{if(e.target.id==='palette')$('#palette').hidden=true};
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
 if(m&&k==='k'){e.preventDefault();openPal()}
 else if(m&&e.shiftKey&&k==='d'){e.preventDefault();ACT.theme()}
 else if(m&&e.shiftKey&&k==='l'){e.preventDefault();ACT.lang()}
 else if(m&&e.shiftKey&&k==='o'){e.preventDefault();ACT.pane()}
 else if(m&&!e.shiftKey&&k==='f'){e.preventDefault();openFind()}
 else if(m&&k==='s'){e.preventDefault();ACT.save()}else if(m&&k==='o'){e.preventDefault();ACT.open()}
 else if(e.key==='F1'){e.preventDefault();ACT.guide()}else if(k==='escape')close()});
document.addEventListener('statlab:find',e=>openFind(e.detail));
// ---- PWA ----
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#btnInstall').hidden=false});
$('#btnInstall').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#btnInstall').hidden=true}};
$('#btnGuide').onclick=()=>ACT.guide();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
Object.assign(ACT,{new:F.newDoc,open:F.openDialog,save:F.save,exportCsv:F.exportCsv,demo:F.demo,undo:()=>{undo()},redo:()=>{redo()},copy:G.copy,paste:G.paste,...A});
initOutput();initGuide({menus:MENUS,acts:ACT,toolbar:TB,icon:c=>ICON[c]});
applyLook();G.init();
const miss=undocumented();if(miss.length)console.warn('StatLab guide: missing docs for',miss.join(', '));
globalThis.__statlab={ACT,MENUS,undocumented};
setTimeout(()=>showWelcome(ACT),350);
addEventListener('beforeunload',e=>{if(store.dirty){e.preventDefault();e.returnValue=''}});
