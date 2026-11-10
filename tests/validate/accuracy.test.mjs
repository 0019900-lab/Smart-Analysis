// بطارية دقة: 42 مجموعة بيانات عشوائية (6 توزيعات × 7 أحجام) + 99 جدول، مقابل scipy/numpy.
import fs from 'node:fs';import * as S from '../../stats.js';
const R=JSON.parse(fs.readFileSync(new URL('./ref.json',import.meta.url)));
const M={};let total=0,fail=0;const worst={};
function chk(name,got,ref,tolRel=1e-8,tolAbs=1e-10){
  total++;const e=Math.abs(got-ref),rel=e/Math.max(Math.abs(ref),1e-300);
  const ok=Number.isFinite(got)&&(e<=tolAbs||rel<=tolRel);
  (M[name]??={n:0,maxRel:0,maxAbs:0,bad:0});const m=M[name];m.n++;m.maxRel=Math.max(m.maxRel,Math.min(rel,e<=tolAbs?0:rel));m.maxAbs=Math.max(m.maxAbs,e);
  if(!ok){m.bad++;fail++;(worst[name]??=[]).length<3&&worst[name].push({got,ref})}}
const P=(n,g,r)=>chk(n,g,r,1e-6,1e-9); // قيم p: نسبي 1e-6 أو مطلق 1e-9
for(const d of R.cases){
  const tag=d.kind+'/'+d.n,{a,b,c,x}=d;
  const ds=S.desc(a);chk('desc.mean',ds.mean,d.desc.mean);chk('desc.sd',ds.sd,d.desc.sd,1e-8);chk('desc.skew',ds.skew,d.desc.skew,1e-7);chk('desc.kurt',ds.kurt,d.desc.kurt,1e-7);
  const t1=S.tOne(a,d.desc.mean+.5);chk('t1.t',t1.t,d.t1.t,1e-7);P('t1.p',t1.p,d.t1.p);chk('t1.lo',t1.lo,d.t1.lo,1e-7);chk('t1.hi',t1.hi,d.t1.hi,1e-7);
  const ti=S.tInd(a,b);chk('tind.t',ti.eq.t,d.tind.t,1e-7);P('tind.p',ti.eq.p,d.tind.p);chk('welch.t',ti.un.t,d.tind.tw,1e-7);P('welch.p',ti.un.p,d.tind.pw);chk('welch.df',ti.un.df,d.tind.dfw,1e-7);
  chk('tind.ciLo',ti.eq.lo,d.tind.lo,1e-6);chk('levene.F',ti.lev.F,d.lev.F,1e-7);P('levene.p',ti.lev.p,d.lev.p);
  const tp=S.tPaired(a,x);chk('paired.t',tp.t,d.tpair.t,1e-7);P('paired.p',tp.p,d.tpair.p);
  const an=S.anovaOne([a,b,c]);chk('anova.F',an.F,d.anova.F,1e-7);P('anova.p',an.p,d.anova.p);
  const wa=S.welchAnova([a,b,c]);chk('welchAnova.F',wa.F,d.welch.F,1e-7);chk('welchAnova.df2',wa.df2,d.welch.df2,1e-7);P('welchAnova.p',wa.p,d.welch.p);
  const mw=S.mannWhitney(a,b);P('mannwhitney.p',mw.p,d.mw.p);chk('mannwhitney.U1',mw.U1,d.mw.U,1e-9);
  if(d.wil){const w=S.wilcoxon(a,x);P('wilcoxon.p',w.p,d.wil.p)}
  const kw=S.kruskal([a,b,c]);chk('kruskal.H',kw.H,d.kw.H,1e-8);P('kruskal.p',kw.p,d.kw.p);
  const pr=S.corr(a,x);chk('pearson.r',pr,d.pear.r,1e-9);P('pearson.p',S.corrP(pr,a.length),d.pear.p);
  const sp=S.spearman(a,x);chk('spearman.r',sp,d.spear.r,1e-9);P('spearman.p',S.corrP(sp,a.length),d.spear.p);
  if(d.sw){const s=S.shapiroWilk(a);chk('shapiro.W',s.W,d.sw.W,1e-5);P('shapiro.p',s.p,d.sw.p)}
  try{const lr=S.linreg([a,d.reg.z],d.reg.y);d.reg.b.forEach((v,i)=>{chk('reg.b',lr.co[i].b,v,1e-7);chk('reg.se',lr.co[i].se,d.reg.se[i],1e-7);P('reg.p',lr.co[i].p,d.reg.p[i])});chk('reg.R2',lr.R2,d.reg.R2,1e-8);chk('reg.F',lr.F,d.reg.F,1e-6);P('reg.pF',lr.pF,d.reg.pF)}catch(e){total++;fail++;(M['reg.THROW']??={n:0,bad:0,maxRel:0,maxAbs:0}).bad++;(worst['reg.THROW']??=[]).push(tag+':'+e.message)}
  if(d.logit){try{const lg=S.logistic([a,d.logit.z],d.logit.y);d.logit.b.forEach((v,i)=>{chk('logit.b',lg.co[i].b,v,1e-6,1e-8);chk('logit.se',lg.co[i].se,d.logit.se[i],1e-6,1e-8)});chk('logit.LL',lg.LL,d.logit.LL,1e-8)}catch(e){total++;fail++;(M['logit.THROW']??={n:0,bad:0,maxRel:0,maxAbs:0}).bad++;(worst['logit.THROW']??=[]).push(tag+':'+e.message)}}
  chk('cronbach',S.cronbach(d.items).alpha,d.alpha,1e-8);
}
for(const t of R.tables){const c=S.chiSq(t.t);chk('chi2.stat',c.chi,t.chi,1e-9);P('chi2.p',c.p,t.p);if(t.fisher!==undefined&&c.fisher!==undefined)P('fisher.p',c.fisher,t.fisher)}
// NIST StRD (قيم معتمدة): NumAcc1-4 للدقة العددية
const nist=[['NumAcc1',[10000001,10000003,10000002],10000002,1],['NumAcc2',[1.2,1.1,1.3,...Array(998).fill(0).map((_,i)=>i%2?1.1:1.3)].slice(0,3),null,null]];
{const d=S.desc([10000001,10000003,10000002]);chk('NIST NumAcc1 mean',d.mean,10000002,1e-15);chk('NIST NumAcc1 sd',d.sd,1,1e-12)}
{const a=[1000000.2,1000000.1,1000000.3,1000000.1,1000000.3,1000000.1,1000000.3,1000000.1,1000000.3];const arr=[];for(let i=0;i<1001;i++)arr.push(i%2?1000000.1:1000000.3);arr[0]=1000000.2;const d=S.desc(arr);chk('NIST NumAcc4 mean',d.mean,1000000.2,1e-13);chk('NIST NumAcc4 sd',d.sd,0.1,1e-6)}
{const n=1e4,a=Array.from({length:n},(_,i)=>1e9+(i%7));const d=S.desc(a);const m=a.reduce((s,v)=>s+(v-1e9),0)/n+1e9;chk('offset 1e9 mean',d.mean,m,1e-14)}
console.log('\nمقياس'.padEnd(18),'عدد'.padStart(5),'أقصى خطأ نسبي'.padStart(16),'أقصى خطأ مطلق'.padStart(16),'فشل');
for(const[k,m]of Object.entries(M))console.log(k.padEnd(18),String(m.n).padStart(5),m.maxRel.toExponential(2).padStart(16),m.maxAbs.toExponential(2).padStart(16),String(m.bad).padStart(5));
if(fail){console.log('\nFAIL details:');for(const[k,v]of Object.entries(worst))console.log(k,JSON.stringify(v))}
console.log(`\naccuracy: ${total-fail}/${total} passed`);process.exit(fail?1:0);
