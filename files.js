import {store,rowsToState,parseDelimited,replaceAll,markSaved,toCSV,toProject,fromProject,demoState} from './data.js';
const say=t=>{document.querySelector('#status').textContent=t};
const tick=()=>new Promise(r=>setTimeout(r,20));
function dl(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
async function loadXlsx(f){
 if(!window.XLSX)await new Promise(ok=>{const s=document.createElement('script');s.src='vendor/xlsx.full.min.js';s.onload=ok;s.onerror=ok;document.head.append(s)});
 if(!window.XLSX)throw new Error('ملف Excel محتاج مكتبة SheetJS: حط xlsx.full.min.js في مجلد vendor (شوف README)');
 const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:null})}
export async function openFile(f){
 const ext=f.name.split('.').pop().toLowerCase(),nm=f.name.replace(/\.[^.]+$/,'');
 try{say('جاري التحميل…');await tick();const t0=performance.now();
  if(ext==='statlab'||ext==='json')replaceAll(fromProject(await f.text()),true);
  else if(ext==='xlsx'||ext==='xls')replaceAll(rowsToState(await loadXlsx(f),nm),false);
  else replaceAll(rowsToState(parseDelimited(await f.text()),nm),false);
  say(`اتحمل: ${store.n.toLocaleString()} حالة × ${store.vars.length} متغير (${Math.round(performance.now()-t0)} ms)`)}
 catch(e){say('تعذر فتح الملف: '+e.message)}}
const inp=document.createElement('input');inp.type='file';inp.accept='.statlab,.json,.csv,.tsv,.txt,.xlsx,.xls';
inp.onchange=()=>{const f=inp.files[0];inp.value='';if(f)openFile(f)};
export const openDialog=()=>inp.click();
export function newDoc(){if(store.dirty&&!confirm('فيه تغييرات متحفظتش. تبدأ ملف جديد؟'))return;replaceAll({name:'Untitled1',vars:[],cols:[],n:0},true);say('ملف جديد')}
export function save(){dl(store.name+'.statlab',toProject(),'application/json');markSaved();say('اتحفظ المشروع')}
export function exportCsv(){dl(store.name+'.csv',toCSV(),'text/csv;charset=utf-8');say('اتصدّر CSV')}
export async function demo(){say('بنولّد 100,000 صف…');await tick();const t0=performance.now();replaceAll(demoState(),false);say(`جاهز: 100,000 حالة (${Math.round(performance.now()-t0)} ms)`)}
addEventListener('dragover',e=>e.preventDefault());
addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)openFile(f)});
