// التحاليل الأساسية – Phase 2
import {T} from './i18n.js';
import {store,parseNum} from './data.js';
import * as S from './stats.js';
import {addBlock} from './output.js';
import {dialog} from './dialog.js';
const {fx,fnz,fp,apaP}=S;
function missSet(v){if(!v.missing)return null;const s=new Set();for(const t of v.missing.split(/[,;\s]+/)){if(t==='')continue;if(v.type==='Numeric'){const n=parseNum(t);if(n!==null&&!Number.isNaN(n))s.add(n)}else s.add(t)}return s.size?s:null}
export function col(c){const v=store.vars[c],a=store.cols[c],ms=missSet(v),out=new Array(store.n);for(let r=0;r<store.n;r++){let x=a[r];if(x==null||x===''||(ms&&ms.has(x)))x=null;out[r]=x}return out}
function labelMap(v){const m=new Map();for(const p of(v.values||'').split(/[;\n]+/)){const i=p.indexOf('=');if(i<0)continue;const k=p.slice(0,i).trim(),l=p.slice(i+1).trim();m.set(v.type==='Numeric'?parseNum(k):k,l)}return m}
const lab=(m,x)=>m.has(x)?m.get(x):String(x);
const cmp=V=>V.type==='Numeric'?(a,b)=>a-b:(a,b)=>String(a).localeCompare(String(b));
const star=p=>p<.01?'**':p<.05?'*':'';
const pct=(a,b)=>fx(a/b*100,1)+'%';
function split(dep,fac){const d=col(dep),f=col(fac),m=new Map();for(let i=0;i<store.n;i++){const x=d[i],g=f[i];if(x===null||g===null)continue;if(!m.has(g))m.set(g,[]);m.get(g).push(x)}return m}
export const RUN={};
RUN.frequencies=v=>{const stat={cap:'Statistics',head:[''],rows:['N Valid','N Missing','Mean','Median','Mode','Std. Deviation','Variance','Minimum','Maximum','25th Percentile','75th Percentile'].map(x=>[x])},ft=[];
 for(const c of v.vars){const V=store.vars[c],a=col(c),lm=labelMap(V),valid=a.filter(x=>x!==null),N=a.length,nv=valid.length,cnt=new Map();
  for(const x of valid)cnt.set(x,(cnt.get(x)||0)+1);
  stat.head.push(V.name);stat.rows[0].push(nv);stat.rows[1].push(N-nv);
  if(V.type==='Numeric'&&nv){const s=Float64Array.from(valid).sort(),d=S.desc(valid);let mode=null,mc=0;for(const[k,f]of cnt)if(f>mc||(f===mc&&k<mode)){mode=k;mc=f}
   const dp=V.decimals;[[d.mean,3],[S.percentile(s,.5),3],[mode,dp],[d.sd,3],[d.var,3],[d.min,dp],[d.max,dp],[S.percentile(s,.25),3],[S.percentile(s,.75),3]].forEach(([x,k],i)=>stat.rows[2+i].push(fx(x,k)))}
  else for(let i=2;i<11;i++)stat.rows[i].push('');
  const keys=[...cnt.keys()].sort(cmp(V)),lim=Math.min(keys.length,500),rows=[];let cum=0;
  for(let i=0;i<lim;i++){const k=keys[i],f=cnt.get(k);cum+=f;rows.push([lab(lm,k),f,fx(f/N*100,1),fx(f/nv*100,1),fx(cum/nv*100,1)])}
  rows.push(['Total (valid)',nv,fx(nv/N*100,1),'100.0','']);if(N-nv)rows.push(['Missing',N-nv,fx((N-nv)/N*100,1),'','']);rows.push(['Total',N,'100.0','','']);
  ft.push({cap:V.name+(V.label?' – '+V.label:''),head:['','Frequency','Percent','Valid Percent','Cumulative Percent'],rows,note:keys.length>lim?`Showing first ${lim} of ${keys.length.toLocaleString()} distinct values.`:''})}
 return{title:'Frequencies',tables:(v.stats?[stat]:[]).concat(ft)}};
RUN.descriptives=v=>{const head=['','N','Minimum','Maximum','Mean','Std. Deviation'];
 if(v.variance)head.push('Variance');if(v.shape)head.push('Skewness','Std. Error','Kurtosis','Std. Error');if(v.se)head.push('SE Mean');if(v.sum)head.push('Sum');
 const cs=v.vars.map(c=>({V:store.vars[c],a:col(c)})),rows=[];
 for(const{V,a}of cs){const x=a.filter(t=>t!==null),d=S.desc(x),dp=V.decimals,r=[V.name,x.length,fx(d.min,dp),fx(d.max,dp),fx(d.mean),fx(d.sd)];
  if(v.variance)r.push(fx(d.var));if(v.shape)r.push(fx(d.skew),fx(d.seSkew),fx(d.kurt),fx(d.seKurt));if(v.se)r.push(fx(d.se));if(v.sum)r.push(fx(d.sum,Math.max(dp,2)));rows.push(r)}
 let ok=0;for(let i=0;i<store.n;i++)if(cs.every(({a})=>a[i]!==null))ok++;rows.push(['Valid N (listwise)',ok]);
 return{title:'Descriptive Statistics',tables:[{cap:'Descriptive Statistics',head,rows}]}};
RUN.crosstabs=v=>{const RV=store.vars[v.row],CV=store.vars[v.col],ra=col(v.row),ca=col(v.col),rl=labelMap(RV),cl=labelMap(CV);
 const rs=new Set(),cs=new Set();for(let i=0;i<store.n;i++)if(ra[i]!==null&&ca[i]!==null){rs.add(ra[i]);cs.add(ca[i])}
 const rk=[...rs].sort(cmp(RV)),ck=[...cs].sort(cmp(CV));if(rk.length<2||ck.length<2)throw new Error(T('يجب أن يحتوي كل متغير على قيمتين مختلفتين على الأقل','Each variable needs at least two distinct values'));
 if(rk.length>50||ck.length>50)throw new Error(T('عدد الفئات كبير (أكثر من 50) — اختر متغيراً تصنيفياً','Too many categories (over 50) — pick a categorical variable'));
 const ri=new Map(rk.map((k,i)=>[k,i])),ci=new Map(ck.map((k,i)=>[k,i])),t=rk.map(()=>ck.map(()=>0));
 for(let i=0;i<store.n;i++)if(ra[i]!==null&&ca[i]!==null)t[ri.get(ra[i])][ci.get(ca[i])]++;
 const X=S.chiSq(t),n=X.n,head=[RV.name,'',...ck.map(k=>lab(cl,k)),'Total'],rows=[];
 const lines=[['Count',(i,j)=>t[i][j],(i)=>X.rt[i],(j)=>X.ct[j],()=>n,true]];
 if(v.exp)lines.push(['Expected',(i,j)=>fx(X.exp[i][j],1),i=>fx(X.rt[i],1),j=>fx(X.ct[j],1),()=>fx(n,1)]);
 if(v.rowp)lines.push(['% within row',(i,j)=>pct(t[i][j],X.rt[i]),()=>'100.0%',j=>pct(X.ct[j],n),()=>'100.0%']);
 if(v.colp)lines.push(['% within column',(i,j)=>pct(t[i][j],X.ct[j]),i=>pct(X.rt[i],n),()=>'100.0%',()=>'100.0%']);
 if(v.totp)lines.push(['% of total',(i,j)=>pct(t[i][j],n),i=>pct(X.rt[i],n),j=>pct(X.ct[j],n),()=>'100.0%']);
 if(v.res)lines.push(['Adj. residual',(i,j)=>fx((t[i][j]-X.exp[i][j])/Math.sqrt(X.exp[i][j]*(1-X.rt[i]/n)*(1-X.ct[j]/n)),2),()=>'',()=>'',()=>'']);
 rk.forEach((k,i)=>lines.forEach((L,li)=>rows.push([li?'':lab(rl,k),L[0],...ck.map((_,j)=>L[1](i,j)),L[2](i)])));
 lines.forEach((L,li)=>rows.push([li?'':'Total',L[0],...ck.map((_,j)=>L[3](j)),L[4]()]));
 const ct={cap:`${RV.name} × ${CV.name}`,head,rows,lc:2},ch=[['Pearson Chi-Square',fx(X.chi),X.df,fp(X.p)],['Likelihood Ratio',fx(X.lr),X.df,fp(X.pLr)]];
 if(X.yates!==undefined){ch.push(['Continuity Correction',fx(X.yates),1,fp(X.pYates)]);ch.push(["Fisher's Exact Test",'','',fp(X.fisher)])}
 ch.push(['N of Valid Cases',n,'','']);
 const tests={cap:'Chi-Square Tests',head:['','Value','df','Sig.'],rows:ch,note:`${fx(X.pctLt5,1)}% of cells have expected count < 5; minimum expected count = ${fx(X.minE,2)}.`+(X.pctLt5>20?' Assumption violated: consider Fisher\'s exact test or merging categories.':'')};
 const meas={cap:'Symmetric Measures',head:['','Value','Approx. Sig.'],rows:[...(X.R===2&&X.C===2?[['Phi',fnz(X.phi),fp(X.p)]]:[]),["Cramér's V",fnz(X.V),fp(X.p)],['Contingency Coefficient',fnz(X.cc),fp(X.p)]]};
 return{title:`Crosstabs: ${RV.name} × ${CV.name}`,tables:[ct,tests,meas],apa:`χ²(${X.df}, N = ${n}) = ${fx(X.chi,2)}, ${apaP(X.p)}, Cramér's V = ${fnz(X.V,2)}`}};
RUN.ttest1=v=>{const g=[],t=[],apa=[];
 for(const c of v.vars){const V=store.vars[c],a=col(c).filter(x=>x!==null);if(a.length<2)throw new Error(T(`"${V.name}" يحتوي على أقل من قيمتين صالحتين`,`"${V.name}" has fewer than two valid values`));const r=S.tOne(a,v.testValue);
  g.push([V.name,r.n,fx(r.mean),fx(r.sd),fx(r.se)]);t.push([V.name,fx(r.t),r.df,fp(r.p),fx(r.diff),fx(r.lo),fx(r.hi),fx(r.d,2)]);
  apa.push(`${V.name}: t(${r.df}) = ${fx(r.t,2)}, ${apaP(r.p)}, d = ${fx(r.d,2)}`)}
 return{title:`One-Sample T Test (test value = ${v.testValue})`,tables:[{cap:'One-Sample Statistics',head:['','N','Mean','Std. Deviation','Std. Error Mean'],rows:g},{cap:`One-Sample Test (Test Value = ${v.testValue})`,head:['','t','df','Sig. (2-tailed)','Mean Difference','95% CI Lower','95% CI Upper',"Cohen's d"],rows:t}],apa}};
RUN.ttestInd=v=>{const G=store.vars[v.group],gl=labelMap(G),gc=col(v.group),all=[...new Set(gc.filter(x=>x!==null))].sort(cmp(G));let g1,g2;
 if(String(v.g1).trim()!==''&&String(v.g2).trim()!==''){const pv=s=>G.type==='Numeric'?parseNum(s):String(s).trim();g1=pv(v.g1);g2=pv(v.g2);if(g1===g2)throw new Error(T('يجب أن تختلف قيمتا المجموعتين','The two group values must differ'))}
 else if(all.length===2)[g1,g2]=all;else throw new Error(T(`يحتوي متغير التجميع على ${all.length} قيم — أدخل قيمتي المجموعتين`,`The grouping variable has ${all.length} values — enter the two group values`));
 const gs=[],ts=[],apa=[];
 for(const c of v.vars){const V=store.vars[c],d=col(c),a=[],b=[];for(let i=0;i<store.n;i++){if(d[i]===null)continue;if(gc[i]===g1)a.push(d[i]);else if(gc[i]===g2)b.push(d[i])}
  if(a.length<2||b.length<2)throw new Error(T(`"${V.name}": تحتاج كل مجموعة إلى قيمتين على الأقل`,`"${V.name}": each group needs at least two values`));const r=S.tInd(a,b);
  gs.push([V.name,lab(gl,g1),r.A.n,fx(r.A.mean),fx(r.A.sd),fx(r.A.se)],['',lab(gl,g2),r.B.n,fx(r.B.mean),fx(r.B.sd),fx(r.B.se)]);
  const e=r.eq,u=r.un;ts.push([V.name,'Equal variances assumed',fx(r.lev.F),fp(r.lev.p),fx(e.t),e.df,fp(e.p),fx(r.diff),fx(e.se),fx(e.lo),fx(e.hi),fx(r.d,2)],['','Equal variances not assumed','','',fx(u.t),fx(u.df),fp(u.p),fx(r.diff),fx(u.se),fx(u.lo),fx(u.hi),'']);
  const w=r.lev.p<.05,z=w?u:e;apa.push(`${V.name}: t(${w?fx(z.df,1):z.df}) = ${fx(z.t,2)}, ${apaP(z.p)}, d = ${fx(r.d,2)}${w?' (Welch — Levene p '+(r.lev.p<.001?'< .001':'= '+fnz(r.lev.p))+')':''}`)}
 return{title:`Independent-Samples T Test by ${G.name}`,tables:[{cap:'Group Statistics',head:['',G.name,'N','Mean','Std. Deviation','Std. Error Mean'],rows:gs,lc:2},{cap:'Independent Samples Test',head:['','',"Levene F",'Levene Sig.','t','df','Sig. (2-tailed)','Mean Diff.','SE Diff.','95% CI Lower','95% CI Upper',"Cohen's d"],rows:ts,lc:2,note:'If Levene Sig. < .05 use the "not assumed" (Welch) row.'}],apa}};
RUN.ttestPair=v=>{const A=store.vars[v.a],B=store.vars[v.b],x=col(v.a),y=col(v.b),p=[],q=[];for(let i=0;i<store.n;i++)if(x[i]!==null&&y[i]!==null){p.push(x[i]);q.push(y[i])}
 if(p.length<3)throw new Error(T('يلزم 3 أزواج صالحة على الأقل','Needs at least 3 valid pairs'));const r=S.tPaired(p,q);
 return{title:`Paired-Samples T Test: ${A.name} – ${B.name}`,tables:[
  {cap:'Paired Samples Statistics',head:['','Mean','N','Std. Deviation','Std. Error Mean'],rows:[[A.name,fx(r.A.mean),r.n,fx(r.A.sd),fx(r.A.se)],[B.name,fx(r.B.mean),r.n,fx(r.B.sd),fx(r.B.se)]]},
  {cap:'Paired Samples Correlation',head:['','N','Correlation','Sig.'],rows:[[`${A.name} & ${B.name}`,r.n,fnz(r.r),fp(r.rp)]]},
  {cap:'Paired Samples Test',head:['','Mean','Std. Deviation','Std. Error Mean','95% CI Lower','95% CI Upper','t','df','Sig. (2-tailed)',"Cohen's dz"],rows:[[`${A.name} – ${B.name}`,fx(r.diff),fx(r.sd),fx(r.se),fx(r.lo),fx(r.hi),fx(r.t),r.df,fp(r.p),fx(r.dz,2)]]}],
  apa:`t(${r.df}) = ${fx(r.t,2)}, ${apaP(r.p)}, dz = ${fx(r.dz,2)}`}};
RUN.anova=v=>{const F=store.vars[v.factor],fl=labelMap(F),tables=[],apa=[],ds=[],lv=[],an=[],ef=[],rb=[],ph=[];
 for(const c of v.vars){const V=store.vars[c],m=split(c,v.factor),keys=[...m.keys()].sort(cmp(F)),gr=keys.map(k=>m.get(k));
  if(keys.length<2)throw new Error(T('يجب أن يضم متغير التجميع مجموعتين على الأقل','The factor needs at least two groups'));const a=S.anovaOne(gr);if(a.dfw<1)throw new Error(T('عدد الحالات قليل مقارنة بالمجموعات','Too few cases relative to the number of groups'));
  const lev=S.levene(gr);
  keys.forEach((k,i)=>{const d=a.ds[i],h=d.n>1?S.tCrit(.05,d.n-1)*d.se:NaN;ds.push([i?'':V.name,lab(fl,k),d.n,fx(d.mean),fx(d.sd),fx(d.se),fx(d.mean-h),fx(d.mean+h),fx(d.min,V.decimals),fx(d.max,V.decimals)])});
  lv.push([V.name,fx(lev.F),lev.df1,lev.df2,fp(lev.p)]);
  an.push([V.name,'Between Groups',fx(a.ssb),a.dfb,fx(a.msb),fx(a.F),fp(a.p)],['','Within Groups',fx(a.ssw),a.dfw,fx(a.msw),'',''],['','Total',fx(a.ssb+a.ssw),a.N-1,'','','']);
  ef.push([V.name,fnz(a.eta2),fnz(a.omega2)]);
  const w=S.welchAnova(gr);if(v.welch)rb.push([V.name,fx(w.F),w.df1,fx(w.df2),fp(w.p)]);
  let line=`${V.name}: F(${a.dfb}, ${a.dfw}) = ${fx(a.F,2)}, ${apaP(a.p)}, η² = ${fnz(a.eta2,2)}`;if(lev.p<.05&&v.welch)line+=` | Welch F(${w.df1}, ${fx(w.df2,1)}) = ${fx(w.F,2)}, ${apaP(w.p)} (Levene p ${lev.p<.001?'< .001':'= '+fnz(lev.p)})`;apa.push(line);
  if(v.post!=='none'&&keys.length>1){const k=keys.length,mc=k*(k-1)/2;
   for(let i=0;i<k;i++)for(let j=i+1;j<k;j++){const di=a.ds[i],dj=a.ds[j],diff=di.mean-dj.mean,se=Math.sqrt(a.msw*(1/di.n+1/dj.n)),pr=S.pT2(diff/se,a.dfw),pa=v.post==='bonf'?Math.min(1,pr*mc):pr,h=S.tCrit(v.post==='bonf'?.05/mc:.05,a.dfw)*se;
    ph.push([i===0&&j===1?V.name:'',lab(fl,keys[i]),lab(fl,keys[j]),fx(diff),fx(se),fp(pa),fx(diff-h),fx(diff+h)])}}}
 tables.push(...(v.desc?[{cap:'Descriptives',head:['',F.name,'N','Mean','Std. Deviation','Std. Error','95% CI Lower','95% CI Upper','Minimum','Maximum'],rows:ds,lc:2}]:[]),
  {cap:'Test of Homogeneity of Variances (Levene, based on mean)',head:['','Levene Statistic','df1','df2','Sig.'],rows:lv},
  {cap:'ANOVA',head:['','','Sum of Squares','df','Mean Square','F','Sig.'],rows:an,lc:2},
  {cap:'Effect Size',head:['','Eta-squared','Omega-squared'],rows:ef});
 if(v.welch)tables.push({cap:'Robust Test of Equality of Means (Welch)',head:['','Statistic','df1','df2','Sig.'],rows:rb});
 if(ph.length)tables.push({cap:`Multiple Comparisons (${v.post==='bonf'?'Bonferroni':'LSD'})`,head:['','(I)','(J)','Mean Diff. (I−J)','Std. Error','Sig.','95% CI Lower','95% CI Upper'],rows:ph,lc:3});
 return{title:`One-Way ANOVA by ${F.name}`,tables,apa}};
RUN.correlate=v=>{const cs=v.vars.map(c=>col(c)),names=v.vars.map(c=>store.vars[c].name),tables=[];
 const pair=(i,j)=>{const x=[],y=[];for(let r=0;r<store.n;r++)if(cs[i][r]!==null&&cs[j][r]!==null){x.push(cs[i][r]);y.push(cs[j][r])}return[x,y]};
 for(const[key,title,f]of[['pearson','Pearson Correlations',S.corr],['spearman',"Spearman's rho",S.spearman]]){if(!v[key])continue;
  const rows=[];names.forEach((nm,i)=>{const r1=[nm,'r'],r2=['','Sig. (2-tailed)'],r3=['','N'];
   names.forEach((_,j)=>{const[x,y]=pair(i,j),n=x.length;if(i===j){r1.push('1');r2.push('');r3.push(n)}else{const r=n>2?f(x,y):NaN,p=S.corrP(r,n);r1.push(fnz(r)+star(p));r2.push(fp(p));r3.push(n)}});rows.push(r1,r2,r3)});
  tables.push({cap:title,head:['','',...names],rows,lc:2,note:'** p < .01, * p < .05 (2-tailed). Pairwise deletion of missing values.'})}
 return{title:'Correlations',tables}};
// ---------- النوافذ ----------
const say=t=>{document.querySelector('#status').textContent=t};
const one=['اختر متغيراً واحداً على الأقل','Pick at least one variable'];
const open=(id,spec,fn)=>()=>{if(!store.vars.length){say(T('حمّل البيانات أولاً (ملف ← بيانات تجريبية)','Load data first (File → Demo data)'));return}
 dialog(id,spec,v=>{const t0=performance.now(),b=RUN[fn](v);addBlock(b.title,b.tables,b.apa);say(`${b.title} — ${Math.round(performance.now()-t0)} ms`)})};
const chk=(key,label,def)=>({key,type:'check',label,def});
export const A={
 frequencies:open('f',{title:['تكرارات','Frequencies'],fields:[{key:'vars',label:['المتغيرات','Variables'],multi:true}],options:[chk('stats',['إحصاءات (متوسط، وسيط، منوال...)','Statistics'],true)],need:v=>v.vars.length?'':one},'frequencies'),
 descriptives:open('d',{title:['إحصاء وصفي','Descriptives'],fields:[{key:'vars',label:['المتغيرات الرقمية','Numeric variables'],multi:true,num:true}],options:[chk('variance',['التباين','Variance'],false),chk('shape',['الالتواء والتفلطح','Skewness & kurtosis'],false),chk('se',['الخطأ المعياري للمتوسط','Std. error of mean'],false),chk('sum',['المجموع','Sum'],false)],need:v=>v.vars.length?'':one},'descriptives'),
 crosstabs:open('x',{title:['جداول تقاطعية','Crosstabs'],fields:[{key:'row',label:['متغير الصفوف','Row variable']},{key:'col',label:['متغير الأعمدة','Column variable']}],options:[chk('rowp',['% داخل الصف','% within row'],true),chk('colp',['% داخل العمود','% within column'],false),chk('totp',['% من الإجمالي','% of total'],false),chk('exp',['التكرار المتوقع','Expected count'],false),chk('res',['البواقي المعدّلة','Adjusted residuals'],false)],need:v=>v.row<0||v.col<0?['اختر متغيري الصفوف والأعمدة','Pick row and column variables']:v.row===v.col?['اختر متغيرين مختلفين','Pick two different variables']:''},'crosstabs'),
 ttest1:open('t1',{title:['اختبار T لعينة واحدة','One-Sample T Test'],fields:[{key:'vars',label:['المتغيرات','Variables'],multi:true,num:true}],options:[{key:'testValue',type:'num',label:['القيمة المختبَرة','Test value'],def:0}],need:v=>v.vars.length?'':one},'ttest1'),
 ttestInd:open('ti',{title:['اختبار T لعينتين مستقلتين','Independent-Samples T Test'],fields:[{key:'vars',label:['المتغيرات التابعة','Test variables'],multi:true,num:true},{key:'group',label:['متغير التجميع','Grouping variable']}],options:[{key:'g1',type:'text',label:['قيمة المجموعة 1 (اتركها فارغة إن كان في المتغير قيمتان فقط)','Group 1 value (blank if only 2 values)'],def:''},{key:'g2',type:'text',label:['قيمة المجموعة 2','Group 2 value'],def:''}],need:v=>!v.vars.length?one:v.group<0?['اختر متغير التجميع','Pick grouping variable']:v.vars.includes(v.group)?['يجب ألا يكون متغير التجميع تابعاً','Grouping variable cannot be a test variable']:''},'ttestInd'),
 ttestPair:open('tp',{title:['اختبار T لعينتين مرتبطتين','Paired-Samples T Test'],fields:[{key:'a',label:['المتغير الأول','Variable 1'],num:true},{key:'b',label:['المتغير الثاني','Variable 2'],num:true}],options:[],need:v=>v.a<0||v.b<0?['اختر المتغيرين','Pick both variables']:v.a===v.b?['اختر متغيرين مختلفين','Pick two different variables']:''},'ttestPair'),
 anova:open('a',{title:['تحليل التباين الأحادي','One-Way ANOVA'],fields:[{key:'vars',label:['المتغيرات التابعة','Dependent variables'],multi:true,num:true},{key:'factor',label:['العامل (المجموعات)','Factor']}],options:[chk('desc',['إحصاءات وصفية','Descriptives'],true),chk('welch',['اختبار Welch (متين)','Welch robust test'],true),{key:'post',type:'sel',label:['المقارنات البعدية','Post hoc'],def:'bonf',opts:[['none',['بدون','None']],['bonf',['Bonferroni','Bonferroni']],['lsd',['LSD','LSD']]]}],need:v=>!v.vars.length?one:v.factor<0?['اختر العامل','Pick the factor']:v.vars.includes(v.factor)?['يجب ألا يكون العامل تابعاً','Factor cannot be dependent']:''},'anova'),
 correlate:open('c',{title:['ارتباط','Bivariate Correlations'],fields:[{key:'vars',label:['المتغيرات','Variables'],multi:true,num:true}],options:[chk('pearson',['Pearson','Pearson'],true),chk('spearman',['Spearman','Spearman'],false)],need:v=>v.vars.length<2?['اختر متغيرين على الأقل','Pick at least two variables']:!v.pearson&&!v.spearman?['اختر نوع الارتباط','Pick a correlation type']:''},'correlate')};
