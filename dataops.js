// Smart-Analysis – عمليات تحرير بنية البيانات (دوال نقية على {name,vars,cols,n}) تُستعمل من قائمة الكليك يمين.
// كل دالة ترجع حالة جديدة ولا تعدّل المدخل؛ التطبيق يمرّرها إلى replaceAll(...,false) فيعمل التراجع/الإعادة.
import {mkVar,validName} from './data.js';
const clampI=(x,a,b)=>Math.max(a,Math.min(b,Math.trunc(x)));
export function uniqueName(vars,base='VAR'){let b=String(base||'VAR').replace(/[^\p{L}\p{N}_.@#$]/gu,'_');if(!/^[\p{L}@]/u.test(b))b='V'+b;
 if(!vars.some(v=>v.name.toLowerCase()===b.toLowerCase()))return b;
 for(let k=1;;k++){const nm=`${b}_${k}`;if(!vars.some(v=>v.name.toLowerCase()===nm.toLowerCase()))return nm}}
export function newVarName(vars){let k=vars.length+1,nm;do{nm='VAR'+String(k++).padStart(5,'0')}while(vars.some(v=>v.name.toLowerCase()===nm.toLowerCase()));return nm}
// إدراج k حالة فارغة قبل الصف at (0-based). at>=n تضيف في النهاية.
export function insertCases(st,at,k=1){const n=st.n;k=clampI(k,1,100000);at=clampI(at,0,n);
 const cols=st.cols.map(c=>{const o=new Array(n+k);for(let r=0;r<at;r++)o[r]=c[r]??null;for(let r=0;r<k;r++)o[at+r]=null;for(let r=at;r<n;r++)o[r+k]=c[r]??null;return o});
 return{name:st.name,vars:st.vars,cols,n:n+k}}
// حذف الحالات من r0 إلى r1 (شاملة).
export function deleteCases(st,r0,r1){const n=st.n,a=Math.min(r0,r1),b=Math.max(r0,r1);r0=clampI(a,0,n);r1=clampI(b,0,n-1);if(r1<r0||!n)return st;
 const cut=r1-r0+1,cols=st.cols.map(c=>{const o=new Array(n-cut);let j=0;for(let r=0;r<n;r++)if(r<r0||r>r1)o[j++]=c[r]??null;return o});
 return{name:st.name,vars:st.vars,cols,n:n-cut}}
// إدراج متغير جديد (رقمي افتراضياً) قبل العمود at.
export function insertVar(st,at,{type='Numeric',name}={}){at=clampI(at,0,st.vars.length);const v=mkVar(name&&validName(name)?name:newVarName(st.vars),type);
 const vars=st.vars.slice(),cols=st.cols.slice();vars.splice(at,0,v);cols.splice(at,0,new Array(st.n).fill(null));return{name:st.name,vars,cols,n:st.n}}
export function deleteVars(st,c0,c1){const nv=st.vars.length,a=Math.min(c0,c1),b=Math.max(c0,c1);c0=clampI(a,0,nv);c1=clampI(b,0,nv-1);if(c1<c0||!nv)return st;
 const keep=i=>i<c0||i>c1;return{name:st.name,vars:st.vars.filter((_,i)=>keep(i)),cols:st.cols.filter((_,i)=>keep(i)),n:st.n}}
// نسخ متغير (مع بياناته وخصائصه) إلى يمينه باسم فريد.
export function duplicateVar(st,c){if(c<0||c>=st.vars.length)return st;const v={...st.vars[c],name:uniqueName(st.vars,st.vars[c].name+'_copy')},vars=st.vars.slice(),cols=st.cols.slice();
 vars.splice(c+1,0,v);cols.splice(c+1,0,st.cols[c].slice());return{name:st.name,vars,cols,n:st.n}}
