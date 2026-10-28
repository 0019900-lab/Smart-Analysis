// StatLab – Phase 0 shell. كل عنصر: [عربي, English, اختصار, أمر, مرحلة]
const S='-';
const MENUS=[
['ملف','File',[['جديد','New','Ctrl+N',null,1],['فتح بيانات...','Open Data...','Ctrl+O',null,1],['حفظ','Save','Ctrl+S',null,1],S,['استيراد CSV / Excel','Import CSV / Excel','',null,1],['تصدير...','Export...','',null,3],S,['طباعة','Print','Ctrl+P','print',0]]],
['تحرير','Edit',[['تراجع','Undo','Ctrl+Z',null,1],['إعادة','Redo','Ctrl+Y',null,1],S,['نسخ','Copy','Ctrl+C',null,1],['لصق','Paste','Ctrl+V',null,1],S,['بحث...','Find...','Ctrl+F',null,1]]],
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
'تحليل':[['إحصاء وصفي: تكرارات','Frequencies','',null,2],['إحصاء وصفي: وصفي','Descriptives','',null,2],['جداول تقاطعية','Crosstabs','',null,2],['اختبار T','T-Test','',null,2],['ANOVA','One-Way ANOVA','',null,2],['ارتباط','Correlate','',null,2],['انحدار','Regression','',null,5],['اختبارات لامعلمية','Nonparametric','',null,5],['تحليل عاملي','Factor Analysis','',null,5],['الثبات (ألفا)','Reliability','',null,5]],
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
 $('#outputBody').textContent=T('النتائج هتظهر هنا','Results will appear here');$('#status').textContent=T('المحرك جاهز','Engine ready');
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
// ---- الشبكة (هيكل فقط في المرحلة 0) ----
const ROWS=60,COLS=14,colName=i=>'var'+(i+1);
function buildGrid(){const g=$('#grid');let h='<thead><tr><th></th>';for(let c=0;c<COLS;c++)h+=`<th>${colName(c)}</th>`;h+='</tr></thead><tbody>';
 for(let r=0;r<ROWS;r++){h+=`<tr><th>${r+1}</th>`;for(let c=0;c<COLS;c++)h+=`<td contenteditable="true" data-r="${r}" data-c="${c}"></td>`;h+='</tr>'}g.innerHTML=h+'</tbody>';
 g.addEventListener('focusin',e=>{const td=e.target.closest('td');if(!td)return;$('#cellRef').textContent=`${+td.dataset.r+1} : ${colName(+td.dataset.c)}`;$('#cellInput').value=td.textContent});
 g.addEventListener('keydown',e=>{const td=e.target.closest('td');if(!td)return;const r=+td.dataset.r,c=+td.dataset.c;let n=null;
  if(e.key==='Enter'||e.key==='ArrowDown')n=[r+1,c];else if(e.key==='ArrowUp')n=[r-1,c];else if(e.key==='Tab')n=[r,c+(e.shiftKey?-1:1)];
  if(n){e.preventDefault();const x=g.querySelector(`td[data-r="${n[0]}"][data-c="${n[1]}"]`);x&&x.focus()}});
 const v=$('#varGrid');const hd=['Name','Type','Width','Decimals','Label','Values','Missing','Columns','Align','Measure','Role'];
 let vh='<thead><tr><th></th>'+hd.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>';
 for(let c=0;c<COLS;c++)vh+=`<tr><th>${c+1}</th><td>${colName(c)}</td><td>Numeric</td><td>8</td><td>2</td><td></td><td>None</td><td>None</td><td>8</td><td>Right</td><td>Scale</td><td>Input</td></tr>`;
 v.innerHTML=vh+'</tbody>'}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));const d=b.dataset.view==='data';$('#grid').hidden=!d;$('#varGrid').hidden=d});
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
 else if(k==='escape')close()});
// ---- PWA ----
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#btnInstall').hidden=false});
$('#btnInstall').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#btnInstall').hidden=true}};
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
buildGrid();applyLook();
