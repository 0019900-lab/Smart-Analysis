import * as S from '../../stats.js';
let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
const norm=()=>Math.sqrt(-2*Math.log(rnd()+1e-12))*Math.cos(2*Math.PI*rnd());
const gen=(n,m=0,s=1)=>Array.from({length:n},()=>m+s*norm());
const T=(name,f)=>{const t=performance.now();f();console.log(name.padEnd(46),((performance.now()-t)).toFixed(0).padStart(7),'ms')};
for(const n of [10000,100000,1000000]){
  console.log('\n=== n =',n.toLocaleString(),'===');
  const a=gen(n,50,10),b=gen(n,51,10),c=gen(n,52,10),x1=gen(n),x2=gen(n),x3=gen(n);
  const y=a.map((v,i)=>v+2*x1[i]+norm()), yb=a.map((v,i)=>(v-50)/10+x1[i]+norm()>0?1:0);
  T('Descriptives (mean/sd/skew/kurt)',()=>S.desc(a));
  T('Independent t-test + Levene',()=>S.tInd(a,b));
  T('One-way ANOVA (3 groups)',()=>S.anovaOne([a,b,c]));
  T('Welch ANOVA + Levene',()=>{S.welchAnova([a,b,c]);S.levene([a,b,c])});
  T('Pearson + Spearman',()=>{S.corr(a,b);S.spearman(a,b)});
  T('Mann-Whitney U',()=>S.mannWhitney(a,b));
  T('Kruskal-Wallis (3 groups)',()=>S.kruskal([a,b,c]));
  T('Linear regression (3 predictors)',()=>S.linreg([x1,x2,x3],y));
  if(n<=1000000)T('Logistic regression (3 predictors)',()=>S.logistic([x1,x2,x3],yb));
  if(n<=100000)T('Dunn post-hoc (3 groups)',()=>S.dunn([a.slice(0,3000),b.slice(0,3000),c.slice(0,3000)]));
}
const a=gen(5000);T('\nShapiro-Wilk (n=5000)',()=>S.shapiroWilk(a));
