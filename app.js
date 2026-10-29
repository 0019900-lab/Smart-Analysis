import * as G from './ui-grid.js';import * as F from './files.js';import {store,undo,redo} from './data.js';import {A} from './analyses.js';import {initOutput} from './output.js';
// StatLab – Phase 0 shell. كل عنصر: [عربي, English, اختصار, أمر, مرحلة]
const S='-';
const MENUS=[
['ملف','File',[['جديد','New','','new',0],['فتح / استيراد (CSV, Excel, مشروع)...','Open / Import...','Ctrl+O','open',0],['حفظ المشروع','Save project','Ctrl+S','save',0],S,['تصدير CSV','Export CSV','','exportCsv',0],['بيانات تجريبية (100 ألف صف)','Demo data (100k rows)','','demo',0],S,['طباعة','Print','Ctrl+P','print',0]]],
['تحرير','Edit',[['تراجع','Undo','Ctrl+Z','undo',0],['إعادة','Redo','Ctrl+Y','redo',0],S,['نسخ','Copy','Ctrl+C','copy',0],['لصق','Paste','Ctrl+V','paste',0],S,['بحث...','Find...','Ctrl+F',null,2]]],
['عرض','View','',null],
['بيانات','Data','',null],
['تحويل','Transform','',null],
['تحليل','Analyze','',null],
['رسوم','Graphs','',null],
['أدوات','Utilities','',null],
['إضافات','Extensions','',null],
['نافذة','Window','',null],
['مساعدة','Help','',null]];
// قوائم تفصيلية (تتفعل تدريجياً حسب المرحلة)
const D={
'عرض':[['الوضع الداكن/الفاتح','Toggle theme','Ctrl+Shift+D','theme',0],['العربية / English','Language','Ctrl+Shift+L','lang',0],['لوحة الأوامر','Command palette','Ctrl+K','palette',0],['اللوحة الجانبية للنتائج','Toggle output pane','Ctrl+Shift+O','pane',0]],
'بيانات':[['تعريف خصائص المتغير','Define Variable Properties','',null,1],['ترتيب الحالات','Sort Cases','',null,1],['دمج ملفات','Merge Files','',null,1],['تقسيم الملف','Split File','',null,1],['اختيار حالات','Select Cases','',null,1],['ترجيح الحالات','Weight Cases','',null,1]],
'تحويل':[['حساب متغير','Compute Variable','',null,1],['إعادة ترميز','Recode','',null,1],['تجميع (Binning)','Visual Binning','',null,1],['استبدال القيم المفقودة','Replace Missing','',null,2]],
'تحليل':[['تكرارات','Frequencies','','frequencies',0],['إحصاء وصفي','Descriptives','','descriptives',0],['جداول تقاطعية','Crosstabs','','crosstabs',0],S,['T لعينة واحدة','One-Sample T Test','','ttest1',0],['T لعينتين مستقلتين','Independent-Samples T Test','','ttestInd',0],['T لعينتين مرتبطتين','Paired-Samples T Test','','ttestPair',0],['تحليل التباين الأحادي','One-Way ANOVA','','anova',0],S,['ارتباط (Pearson / Spearman)','Correlate','','correlate',0],S,['انحدار','Regression','',null,5],['اختبارات لامعلمية','Nonparametric','',null,5],['تحليل عاملي','Factor Analysis','',null,5],['الثبات (ألفا)','Reliability','',null,5]],
'رسوم':[['هيستوجرام','Histogram','',null,4],['Boxplot','Boxplot','',null,4],['نقاط (Scatter)','Scatter','',null,4],['أعمدة','Bar','',null,4]],
'أدوات':[['تصدير الكود (Python/R)','Export code','',null,6],['سجل العمليات','History','',null,6]],
'إضافات':[['مكتبة الإضافات','Extension Hub','',null,8]],
'نافذة':[['بيانات','Data window','',null,1],['مخرجات','Output window','',null,3]],
'مساعدة':[['اختصارات لوحة المفاتيح','Shortcuts','',null,8],['عن StatLab','About','','about',0]]};
const TB=[['📄','new'],['📂','open'],['💾','save'],'|',['↶','undo'],['↷','redo'],'|',['🔍','palette'],['ƒx','compute'],['Σ','analyze'],['📊','graphs'],'|',['🌓','theme'],['🌐','lang']];
const $=s=>document.querySelector(s),root=document.documentElement;
let lang=localStorage.lang||'ar',theme=localStorage.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
const T=(a,e)=>lang==='ar'?a:e;
MENUS.forEach(m=>{if(!m[2]||m[2]==='')m[2]=D[m[0]]||[]});
function applyLook(){root.dataset.theme=theme;root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';localStorage.lang=lang;localStorage.theme=theme;buildMenus();buildToolbar();
 if($('#outputBody').classList.contains('empty'))$('#outputBody').textContent=T('النتائج هتظهر هنا','Results will appear here');$('#status').textContent=T('المحرك جاهز','Engine ready');
 $('#hint').textContent=T('Ctrl+K للبحث عن أي أمر','Ctrl+K to search any command');$('#palInput').placeholder=T('ابحث عن أمر أو تحليل...','Search a command or analysis...');
 $('#outputPane h3').textContent=T('المخرجات','Output');$('#btnInstall').textContent=T('تثبيت','Install')}
const ACT={theme(){theme=theme==='dark'?'light':'dark';applyLook()},lang(){lang=lang==='ar'?'en':'ar';applyLook()},palette:openPal,pane(){const p=$('#outputPane');p.style.display=p.style.display==='none'?'':'none'},print(){print()},about(){say(T('StatLab v0.1 – المرحلة 0','StatLab v0.1 – Phase 0'))}};
function say(t){$('#status').textContent=t}
function run(it){if(it[3]&&ACT[it[3]])ACT[it[3]]();else say(T(`«${it[0]}» هتتفعل في المرحلة ${it[4]}`,`"${it[1]}" arrives in phase ${it[4]}`))}
function buildMenus(){const bar=$('#menubar');bar.innerHTML='';
 MENUS.forEach(m=>{const w=document.createElement('div');w.className='menu';const b=document.createElement('button');b.textContent=T(m[0],m[1]);w.append(b);
  const dd=document.createElement('div');dd.className='dd';
  m[2].forEach(it=>{if(it===S){dd.append(document.createElement('hr'));return}
   const x=document.createElement('button');x.innerHTML=`<span>${T(it[0],it[1])}</span><kbd>${it[2]||(it[3]?'':'⏳')}</kbd>`;
   if(!it[3]&&it[4])x.title=T('قريباً','Soon');x.onclick=()=>{close();run(it)};dd.append(x)});
  w.append(dd);b.onclick=e=>{e.stopPropagation();const o=w.classList.contains('open');close();if(!o)w.classList.add('open')};
  b.onmouseenter=()=>{if(document.querySelector('.menu.open')){close();w.classList.add('open')}};bar.append(w)})}
function close(){document.querySelectorAll('.menu.open').forEach(x=>x.classList.remove('open'))}
document.addEventListener('click',close);
function buildToolbar(){const t=$('#toolbar');t.innerHTML='';TB.forEach(i=>{if(i==='|'){const s=document.createElement('span');s.className='sep';t.append(s);return}
 const b=document.createElement('button');b.textContent=i[0];b.title=i[1];b.onclick=()=>run([i[1],i[1],'',ACT[i[1]]?i[1]:null,i[1]==='compute'?1:i[1]==='analyze'?2:i[1]==='graphs'?4:1]);t.append(b)})}
// ---- لوحة الأوامر ----
let sel=0,items=[];
function openPal(){$('#palette').hidden=false;$('#palInput').value='';filter();$('#palInput').focus()}
function filter(){const q=$('#palInput').value.toLowerCase();items=[];MENUS.forEach(m=>m[2].forEach(it=>{if(it!==S&&(it[0]+' '+it[1]).toLowerCase().includes(q))items.push([it,T(m[0],m[1])])}));sel=0;drawPal()}
function drawPal(){const u=$('#palList');u.innerHTML='';items.slice(0,40).forEach((x,i)=>{const li=document.createElement('li');if(i===sel)li.className='sel';li.innerHTML=`<span>${T(x[0][0],x[0][1])}</span><kbd class="soon">${x[1]}</kbd>`;li.onclick=()=>pick(i);u.append(li)})}
function pick(i){const x=items[i];if(!x)return;$('#palette').hidden=true;run(x[0])}
$('#palInput').oninput=filter;
$('#palInput').onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(sel+1,items.length-1);drawPal()}else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);drawPal()}else if(e.key==='Enter')pick(sel);else if(e.key==='Escape')$('#palette').hidden=true};
$('#palette').onclick=e=>{if(e.target.id==='palette')$('#palette').hidden=true};
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();openPal()}
 else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&k==='d'){e.preventDefault();ACT.theme()}
 else if((e.ctrlKey||e.metaKey)&&e.shiftKey&&k==='l'){e.preventDefault();ACT.lang()}
 else if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();ACT.save()}else if((e.ctrlKey||e.metaKey)&&k==='o'){e.preventDefault();ACT.open()}else if(k==='escape')close()});
// ---- PWA ----
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#btnInstall').hidden=false});
$('#btnInstall').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#btnInstall').hidden=true}};
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
Object.assign(ACT,{new:F.newDoc,open:F.openDialog,save:F.save,exportCsv:F.exportCsv,demo:F.demo,undo:()=>{undo()},redo:()=>{redo()},copy:G.copy,paste:G.paste,analyze:A.descriptives,...A});
initOutput();
applyLook();G.init();
addEventListener('beforeunload',e=>{if(store.dirty){e.preventDefault();e.returnValue=''}});
