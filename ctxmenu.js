// Smart-Analysis – قوائم الكليك يمين (Data View / Variable View / المخرجات) على طريقة SPSS وأحدث.
// showMenu(x,y,items): items = عناصر {t:[ع,En],k:'اختصار',i:'أيقونة',f:دالة,off,danger} أو '-' للفاصل. بلا قوائم فرعية عمداً (سريعة وواضحة).
import {T} from './i18n.js';import {ic} from './icons.js';
import {store,replaceAll,setVar} from './data.js';
import {api,goTo,copy,paste,refresh} from './ui-grid.js';
import {insertCases,deleteCases,insertVar,deleteVars,duplicateVar} from './dataops.js';
import {sortCases} from './transform.js';import {setFilter} from './analyses.js';
import {openValues,openMissing} from './varpicker.js';
const $=s=>document.querySelector(s),say=t=>{$('#status').textContent=t};
const isField=t=>t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);
let box=null,back=null,rowMark=null;
export const isOpen=()=>!!box;
export function closeMenu(){if(!box)return;box.remove();box=null;rowMark&&rowMark.classList.remove('cx');rowMark=null;
 removeEventListener('pointerdown',away,true);removeEventListener('wheel',closeMenu,true);removeEventListener('resize',closeMenu);removeEventListener('blur',closeMenu);
 const b=back;back=null;b&&b.isConnected&&b.focus&&b.focus({preventScroll:true})}
function away(e){if(box&&!box.contains(e.target))closeMenu()}
export function showMenu(x,y,items,{mark}={}){closeMenu();back=document.activeElement;
 box=document.createElement('div');box.className='cm';box.setAttribute('role','menu');box.dir=document.documentElement.dir||'';
 const clean=items.filter((it,i,a)=>it!=='-'||(i>0&&a[i-1]!=='-'&&i<a.length-1));
 box.innerHTML=clean.map((it,i)=>it==='-'?'<div class="cms" role="separator"></div>':`<button type="button" role="menuitem" class="cmi${it.danger?' dg':''}" data-i="${i}"${it.off?' disabled':''}><span class="cmic">${it.i?ic(it.i,16):''}</span><span class="cml">${T(it.t[0],it.t[1])}</span>${it.k?`<kbd>${it.k}</kbd>`:''}</button>`).join('');
 document.body.append(box);if(mark){rowMark=mark;mark.classList.add('cx')}
 const w=box.offsetWidth,h=box.offsetHeight;box.style.left=Math.max(4,Math.min(x,innerWidth-w-4))+'px';box.style.top=Math.max(4,Math.min(y,innerHeight-h-4))+'px';
 const me=box,btns=()=>[...me.querySelectorAll('.cmi:not(:disabled)')];
 const run=b=>{const it=clean[+b.dataset.i];closeMenu();try{it.f&&it.f()}catch(err){say(String(err.message||err))}};
 box.addEventListener('click',e=>{const b=e.target.closest('.cmi');if(b&&!b.disabled)run(b)});
 box.addEventListener('contextmenu',e=>e.preventDefault());
 box.addEventListener('mousemove',e=>{const b=e.target.closest('.cmi');if(b&&!b.disabled&&document.activeElement!==b)b.focus({preventScroll:true})});
 box.addEventListener('keydown',e=>{if(box!==me)return;const L=btns(),i=L.indexOf(document.activeElement),k=e.key;
  if(k==='Escape'||k==='Tab'){e.preventDefault();closeMenu()}
  else if(k==='ArrowDown'){e.preventDefault();L[(i+1)%L.length].focus()}
  else if(k==='ArrowUp'){e.preventDefault();L[(i<=0?L.length:i)-1].focus()}
  else if(k==='Home'){e.preventDefault();L[0].focus()}else if(k==='End'){e.preventDefault();L[L.length-1].focus()}
  else if(k==='Enter'||k===' '){e.preventDefault();i>=0&&run(L[i])}
  e.stopPropagation()});
 addEventListener('pointerdown',away,true);addEventListener('wheel',closeMenu,true);addEventListener('resize',closeMenu);addEventListener('blur',closeMenu);
 const f=btns()[0];f&&f.focus({preventScroll:true});return box}

// ---------- تطبيق عملية على بنية البيانات (تراجع/إعادة تلقائياً عبر replaceAll) ----------
const cur=()=>({name:store.name,vars:store.vars,cols:store.cols,n:store.n});
const apply=(fn,title,fields)=>{const st=fn(cur());if(st===cur())return;replaceAll(st,false,{fn:'data.edit',title,fields:fields||{},opts:{}})};
const rowsOp=(fn,title)=>{setFilter(null);apply(fn,title)}; // المرشّح مبني على ترتيب الصفوف فيُلغى عند تغييرها
function rangeSel(){const q=api.rng();return{...q,nr:q.r1-q.r0+1,nc:q.c1-q.c0+1}}
const nameOf=c=>store.vars[c]?store.vars[c].name:'';
function insertCasesAt(at,k){rowsOp(s=>insertCases(s,at,k),'Insert cases');api.setSel({r:at,c:api.rng().c0},{r:at+k-1,c:api.rng().c1});say(T(`تمت إضافة ${k} حالة`,`Inserted ${k} case(s)`))}
function insertVarsAt(at,k){apply(s=>{for(let i=0;i<k;i++)s=insertVar(s,at);return s},'Insert variables');api.setSel({r:0,c:at},{r:Math.max(store.n-1,0),c:at+k-1});say(T(`تمت إضافة ${k} متغير`,`Inserted ${k} variable(s)`))}
function deleteCasesRange(r0,r1){const k=r1-r0+1;rowsOp(s=>deleteCases(s,r0,r1),'Delete cases');const r=Math.min(r0,Math.max(store.n-1,0));api.setSel({r,c:api.rng().c0},{r,c:api.rng().c0});say(T(`تم حذف ${k} حالة (يمكن التراجع Ctrl+Z)`,`Deleted ${k} case(s) (Ctrl+Z to undo)`))}
function deleteVarsRange(c0,c1){const k=c1-c0+1;apply(s=>deleteVars(s,c0,c1),'Delete variables');const c=Math.min(c0,Math.max(store.vars.length-1,0));api.setSel({r:0,c},{r:0,c});say(T(`تم حذف ${k} متغير (يمكن التراجع Ctrl+Z)`,`Deleted ${k} variable(s) (Ctrl+Z to undo)`))}
const sortBy=(c,desc)=>{if(!store.vars[c])return;sortCases({by:[c],desc});say(T(`تم ترتيب الحالات حسب ${nameOf(c)} ${desc?'تنازلياً':'تصاعدياً'}`,`Sorted cases by ${nameOf(c)} ${desc?'descending':'ascending'}`))};
const noun=(n,a1,a2,e1,e2)=>T(n>1?`${n} ${a2}`:a1,n>1?`${n} ${e2}`:e1);

// ---------- عناصر القوائم ----------
const editItems=()=>[{t:['قص','Cut'],k:'Ctrl+X',i:'cut',f:()=>api.cut()},{t:['نسخ','Copy'],k:'Ctrl+C',i:'copy',f:copy},{t:['لصق','Paste'],k:'Ctrl+V',i:'paste',f:paste},{t:['مسح المحتوى','Clear'],k:'Del',i:'eraser',f:()=>api.clear()}];
function cellMenu(ACT){const q=rangeSel(),c=q.c0,hasVar=!!store.vars[c],M=[...editItems(),'-',{t:['تعديل الخلية','Edit cell'],k:'F2',i:'edit',f:()=>api.edit()},'-',
 {t:[`إدراج ${q.nr>1?q.nr+' حالات':'حالة'} أعلى`,`Insert ${q.nr>1?q.nr+' cases':'case'} above`],i:'plus',f:()=>insertCasesAt(q.r0,Math.min(q.nr,1000))},
 {t:['إدراج متغير على اليسار','Insert variable before'],i:'plus',f:()=>insertVarsAt(Math.min(c,store.vars.length),1)},
 {t:[`حذف ${q.nr>1?q.nr+' حالات':'الحالة'}`,`Delete ${q.nr>1?q.nr+' cases':'case'}`],i:'trash',danger:true,off:q.r0>=store.n,f:()=>deleteCasesRange(q.r0,Math.min(q.r1,store.n-1))}];
 if(hasVar)M.push('-',{t:[`ترتيب تصاعدي حسب ${nameOf(c)}`,`Sort ascending by ${nameOf(c)}`],i:'sortAsc',f:()=>sortBy(c,false)},{t:[`ترتيب تنازلي حسب ${nameOf(c)}`,`Sort descending by ${nameOf(c)}`],i:'sortDesc',f:()=>sortBy(c,true)},'-',
  {t:['إحصاء وصفي…','Descriptive statistics…'],i:'analyze',off:!ACT.descriptives,f:()=>ACT.descriptives()},{t:['تكرارات…','Frequencies…'],i:'analyze',off:!ACT.frequencies,f:()=>ACT.frequencies()});
 return M}
function headMenu(ACT){const q=rangeSel(),c0=q.c0,c1=Math.min(q.c1,store.vars.length-1),has=c1>=c0&&store.vars[c0],k=q.nc,M=[{t:['نسخ','Copy'],k:'Ctrl+C',i:'copy',f:copy},{t:['لصق','Paste'],k:'Ctrl+V',i:'paste',f:paste},{t:['مسح المحتوى','Clear'],k:'Del',i:'eraser',f:()=>api.clear()},'-',
 {t:[`إدراج ${k>1?k+' متغيرات':'متغير'} على اليسار`,`Insert ${k>1?k+' variables':'variable'} before`],i:'plus',f:()=>insertVarsAt(Math.min(c0,store.vars.length),Math.min(k,50))},
 {t:['إدراج متغير على اليمين','Insert variable after'],i:'plus',f:()=>insertVarsAt(Math.min(q.c1+1,store.vars.length),1)}];
 if(has)M.push({t:['تكرار المتغير','Duplicate variable'],i:'copy',off:k>1,f:()=>{apply(s=>duplicateVar(s,c0),'Duplicate variable',{var:nameOf(c0)});api.setSel({r:0,c:c0+1},{r:Math.max(store.n-1,0),c:c0+1})}},
  {t:[`حذف ${c1>c0?(c1-c0+1)+' متغيرات':'المتغير'}`,`Delete ${c1>c0?(c1-c0+1)+' variables':'variable'}`],i:'trash',danger:true,f:()=>deleteVarsRange(c0,c1)},'-',
  {t:['ترتيب تصاعدي','Sort ascending'],i:'sortAsc',f:()=>sortBy(c0,false)},{t:['ترتيب تنازلي','Sort descending'],i:'sortDesc',f:()=>sortBy(c0,true)},'-',
  {t:['خصائص المتغير (Variable View)','Variable properties (Variable View)'],i:'vars',f:()=>{api.setView('var');requestAnimationFrame(()=>{const tr=document.querySelectorAll('#varGrid tbody tr')[c0];tr&&tr.scrollIntoView({block:'center'})})}},
  {t:['إحصاء وصفي…','Descriptive statistics…'],i:'analyze',off:!ACT.descriptives,f:()=>ACT.descriptives()},{t:['تكرارات…','Frequencies…'],i:'analyze',off:!ACT.frequencies,f:()=>ACT.frequencies()});
 return M}
function rowMenu(){const q=rangeSel(),k=q.nr,M=[{t:['نسخ','Copy'],k:'Ctrl+C',i:'copy',f:copy},{t:['لصق','Paste'],k:'Ctrl+V',i:'paste',f:paste},{t:['مسح المحتوى','Clear'],k:'Del',i:'eraser',f:()=>api.clear()},'-',
 {t:[`إدراج ${k>1?k+' حالات':'حالة'} أعلى`,`Insert ${k>1?k+' cases':'case'} above`],i:'plus',f:()=>insertCasesAt(q.r0,Math.min(k,1000))},
 {t:['إدراج حالة أسفل','Insert case below'],i:'plus',f:()=>insertCasesAt(q.r1+1,1)},
 {t:[`حذف ${k>1?k+' حالات':'الحالة'}`,`Delete ${k>1?k+' cases':'case'}`],i:'trash',danger:true,off:q.r0>=store.n,f:()=>deleteCasesRange(q.r0,Math.min(q.r1,store.n-1))}];return M}
function varViewMenu(i){const v=store.vars[i],M=[{t:['إدراج متغير هنا','Insert variable here'],i:'plus',f:()=>{apply(s=>insertVar(s,Math.min(i,store.vars.length)),'Insert variable');refresh()}}];
 if(v)M.push({t:['تكرار المتغير','Duplicate variable'],i:'copy',f:()=>{apply(s=>duplicateVar(s,i),'Duplicate variable',{var:v.name});refresh()}},
  {t:['حذف المتغير','Delete variable'],i:'trash',danger:true,f:()=>{apply(s=>deleteVars(s,i,i),'Delete variable',{var:v.name});refresh();say(T('تم حذف المتغير (يمكن التراجع Ctrl+Z)','Variable deleted (Ctrl+Z to undo)'))}},'-',
  {t:['تسميات القيم…','Value labels…'],i:'tags',f:()=>openValues(i,s=>{const err=setVar(i,'values',s);if(err)say(err);refresh()})},
  {t:['القيم المفقودة…','Missing values…'],i:'tags',f:()=>openMissing(i,s=>{const err=setVar(i,'missing',s);if(err)say(err);refresh()})},'-',
  {t:['إظهار في شبكة البيانات','Show in Data View'],i:'data',f:()=>goTo(0,i)});return M}
function outMenu(sec,ACT,e){const A=a=>()=>{const b=sec.querySelector(`[data-act="${a}"]`);b&&b.click()},has=a=>!!sec.querySelector(`[data-act="${a}"]`),M=[];
 const tbw=e.target.closest('.tbw'),cp=tbw&&tbw.querySelector('[data-act=copy]');
 if(cp)M.push({t:['نسخ هذا الجدول','Copy this table'],i:'copy',f:()=>cp.click()});
 if(has('copyapa'))M.push({t:['نسخ سطر APA','Copy APA line'],i:'copy',f:A('copyapa')});
 if(M.length)M.push('-');
 if(has('toggle'))M.push({t:['طيّ / توسيع','Collapse / expand'],i:'collapse',f:A('toggle')});
 if(has('explain'))M.push({t:['فسّر نتائجي','Explain my results'],i:'sparkle',f:A('explain')});
 const h=sec.querySelector('h4[data-act=rename]');if(h)M.push({t:['إعادة تسمية…','Rename…'],i:'edit',f:()=>h.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))});
 M.push('-',{t:['نقل للأعلى','Move up'],i:'up',f:A('up')},{t:['نقل للأسفل','Move down'],i:'down',f:A('down')},'-',{t:['حذف من المخرجات','Delete from output'],i:'trash',danger:true,f:A('del')});return M}
function outBlankMenu(ACT){return[{t:['إضافة ملاحظة…','Add note…'],i:'note',off:!ACT.addText,f:()=>ACT.addText()},{t:['فسّر آخر نتيجة','Explain latest result'],i:'sparkle',off:!ACT.explain,f:()=>ACT.explain()},'-',
 {t:['تصدير: Word','Export: Word'],i:'word',off:!ACT.exportWord,f:()=>ACT.exportWord()},{t:['تصدير: PDF','Export: PDF'],i:'pdf',off:!ACT.exportPdf,f:()=>ACT.exportPdf()},{t:['تصدير: HTML','Export: HTML'],i:'html',off:!ACT.exportHtml,f:()=>ACT.exportHtml()}]}

export function initContext(ACT){
 document.addEventListener('contextmenu',e=>{const t=e.target;if(!t||!t.closest)return;
  const wrap=t.closest('#gridWrap'),vg=t.closest('#varGrid'),pane=t.closest('#outputPane');
  if(!wrap&&!vg&&!pane)return; // خارج مناطق العمل: القائمة الأصلية للمتصفح
  if(isField(t)&&!vg)return;  // حقول الكتابة تحتفظ بقائمتها الأصلية (قص/نسخ/لصق)
  e.preventDefault();let x=e.clientX,y=e.clientY,M=null,mark=null;
  if(wrap&&api.view()==='data'){
   let td=t.closest('td[data-r]'),th=t.closest('th[data-hc]'),rh=!td&&!th&&t.closest('tbody th');
   if(t===wrap||t.id==='gridWrap'){td=wrap.querySelector('td.cur');if(td){const r=td.getBoundingClientRect();x=r.left+10;y=r.bottom-4}}
   const n=store.n,C=Math.max(store.vars.length,1),q=api.rng(),S=api.getSel();
   if(td){const p={r:+td.dataset.r,c:+td.dataset.c};if(!(p.r>=q.r0&&p.r<=q.r1&&p.c>=q.c0&&p.c<=q.c1))api.setSel(p,p);M=cellMenu(ACT)}
   else if(th){const c=+th.dataset.hc;if(!(S.anc.r===0&&S.sel.r>=Math.max(n-1,0)&&c>=q.c0&&c<=q.c1))api.setSel({r:0,c},{r:Math.max(n-1,0),c});M=headMenu(ACT)}
   else if(rh){const r=+rh.textContent-1;if(!(S.anc.c===0&&S.sel.c>=C-1&&r>=q.r0&&r<=q.r1))api.setSel({r,c:0},{r,c:C-1});M=rowMenu()}
   else if(t.closest('thead')){M=null}
  }else if(vg){const tr=t.closest('tbody tr');if(!tr)return;const i=tr.rowIndex-1;mark=tr;M=varViewMenu(i)}
  else if(pane){const sec=t.closest('.blk');M=sec?outMenu(sec,ACT,e):(t.closest('#outputBody')?outBlankMenu(ACT):null);mark=sec||null}
  if(M&&M.length)showMenu(x,y,M,{mark})});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){e.preventDefault();closeMenu()}},true)}
