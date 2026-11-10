# يولّد بيانات عشوائية (بذرة ثابتة) ونتائج مرجعية من scipy/numpy بدقة double.
import json, numpy as np
from scipy import stats as st
rng=np.random.default_rng(20261109)
def sample(kind,n):
    if kind=='norm':return rng.normal(50,10,n)
    if kind=='lognorm':return rng.lognormal(1,.8,n)
    if kind=='ties':return rng.integers(1,8,n).astype(float)
    if kind=='offset':return 1e6+rng.normal(0,3,n)
    if kind=='unif':return rng.uniform(-5,5,n)
    if kind=='tiny':return rng.normal(0,1e-4,n)
kinds=['norm','lognorm','ties','offset','unif','tiny']
sizes=[6,9,15,30,60,200,1000]
out={'cases':[]}
def desc(a):
    return dict(mean=a.mean(),sd=a.std(ddof=1),skew=float(st.skew(a,bias=False)),kurt=float(st.kurtosis(a,bias=False)))
for kind in kinds:
  for n in sizes:
    a,b,c=sample(kind,n),sample(kind,n+3)+ (0.3*a_s if (a_s:=np.std(sample(kind,n)))>0 else 0),sample(kind,max(n-2,4))
    x=a+rng.normal(0,np.std(a)*.7,n); 
    d=dict(kind=kind,n=n,a=a.tolist(),b=b.tolist(),c=c.tolist(),x=x.tolist())
    d['desc']=desc(a)
    t1=st.ttest_1samp(a,float(np.mean(a))+.5);ci=t1.confidence_interval(.95)
    mu0=float(np.mean(a))+.5;d['t1']=dict(t=t1.statistic,p=t1.pvalue,lo=ci.low-mu0,hi=ci.high-mu0)
    te=st.ttest_ind(a,b,equal_var=True);tw=st.ttest_ind(a,b,equal_var=False)
    d['tind']=dict(t=te.statistic,p=te.pvalue,tw=tw.statistic,pw=tw.pvalue,dfw=tw.df,lo=te.confidence_interval(.95).low,hi=te.confidence_interval(.95).high)
    lv=st.levene(a,b,center='mean');d['lev']=dict(F=lv.statistic,p=lv.pvalue)
    tp=st.ttest_rel(a,x);d['tpair']=dict(t=tp.statistic,p=tp.pvalue)
    fo=st.f_oneway(a,b,c);d['anova']=dict(F=fo.statistic,p=fo.pvalue)
    # Welch ANOVA
    g=[a,b,c];k=3;nn=np.array([len(v) for v in g]);m=np.array([v.mean() for v in g]);v=np.array([v.var(ddof=1) for v in g])
    w=nn/v;mw=(w*m).sum()/w.sum();A=(w*(m-mw)**2).sum()/(k-1);lam=(((1-w/w.sum())**2)/(nn-1)).sum()
    Fw=A/(1+2*(k-2)/(k**2-1)*lam);df2=(k**2-1)/(3*lam);d['welch']=dict(F=Fw,df2=df2,p=float(st.f.sf(Fw,k-1,df2)))
    mwu=st.mannwhitneyu(a,b,method='asymptotic',use_continuity=False);d['mw']=dict(U=mwu.statistic,p=mwu.pvalue)
    if np.any(a!=x):
        wl=st.wilcoxon(a,x,method='asymptotic',correction=False,zero_method='wilcox');d['wil']=dict(p=wl.pvalue)
    kw=st.kruskal(a,b,c);d['kw']=dict(H=kw.statistic,p=kw.pvalue)
    pr=st.pearsonr(a,x);sp=st.spearmanr(a,x);d['pear']=dict(r=pr.statistic,p=pr.pvalue);d['spear']=dict(r=sp.statistic,p=sp.pvalue)
    if 3<=n<=5000 and np.ptp(a)>0:
        sw=st.shapiro(a);d['sw']=dict(W=sw.statistic,p=sw.pvalue)
    # regression
    z=rng.normal(0,1,n);y=2+.5*a/ (np.std(a) or 1)+.3*z+rng.normal(0,1,n)
    import mpmath as mp
    mp.mp.dps=50
    Xm=mp.matrix([[1,mp.mpf(float(a[i])),mp.mpf(float(z[i]))] for i in range(n)]);ym_=mp.matrix([mp.mpf(float(v)) for v in y])
    XtX=Xm.T*Xm;Xinv=XtX**-1;bm=Xinv*(Xm.T*ym_);rm=ym_-Xm*bm;dfe=n-3;s2m=(rm.T*rm)[0]/dfe
    beta=np.array([float(v) for v in bm]);res=np.array([float(v) for v in rm]);se=np.array([float(mp.sqrt(s2m*Xinv[i,i])) for i in range(3)]);tt=beta/se
    sst=((y-y.mean())**2).sum();R2=1-res@res/sst;F=(R2/2)/((1-R2)/dfe)
    d['reg']=dict(y=y.tolist(),z=z.tolist(),b=beta.tolist(),se=se.tolist(),p=(2*st.t.sf(abs(tt),dfe)).tolist(),R2=R2,F=F,pF=float(st.f.sf(F,2,dfe)))
    # logistic (Newton-Raphson, double)
    if n>=30:
        pz=1/(1+np.exp(-(0.3+0.9*(a-a.mean())/(a.std() or 1)+0.4*z)));yy=(rng.uniform(size=n)<pz).astype(float)
        if 0<yy.sum()<n:
            ma=a.mean();sa=a.std() or 1;Xl=np.column_stack([np.ones(n),(a-ma)/sa,z]);bb=np.zeros(3)
            for _ in range(100):
                p=1/(1+np.exp(-Xl@bb));Wd=p*(1-p);H=Xl.T@(Xl*Wd[:,None]);gr=Xl.T@(yy-p);step=np.linalg.solve(H,gr);bb=bb+step
                if np.abs(step).max()<1e-13:break
            p=1/(1+np.exp(-Xl@bb));H=Xl.T@(Xl*(p*(1-p))[:,None]);C=np.linalg.inv(H)
            Am=np.array([[1,-ma/sa,0],[0,1/sa,0],[0,0,1]]);bb=Am@bb;sel=np.sqrt(np.diag(Am@C@Am.T))
            d['logit']=dict(y=yy.tolist(),z=z.tolist(),b=bb.tolist(),se=sel.tolist(),LL=float((yy*np.log(p)+(1-yy)*np.log(1-p)).sum()))
    # cronbach
    it=[a,x,a+rng.normal(0,np.std(a),n),z*np.std(a)+a.mean()];M=np.array(it);tot=M.sum(0);kk=len(it)
    d['alpha']=kk/(kk-1)*(1-M.var(axis=1,ddof=1).sum()/tot.var(ddof=1));d['items']=[v.tolist() for v in it]
    out['cases'].append(d)
# tables
out['tables']=[]
for _ in range(60):
    R=rng.integers(2,5);C=rng.integers(2,5);t=rng.integers(3,60,(R,C))
    ch=st.chi2_contingency(t,correction=False);o=dict(t=t.tolist(),chi=ch.statistic,p=ch.pvalue,df=int(ch.dof))
    if R==2 and C==2:
        o['fisher']=st.fisher_exact(t)[1]
    out['tables'].append(o)
for _ in range(40):
    t=rng.integers(0,25,(2,2))
    if t.sum(0).min()==0 or t.sum(1).min()==0:continue
    out['tables'].append(dict(t=t.tolist(),fisher=st.fisher_exact(t)[1],chi=st.chi2_contingency(t,correction=False)[0],p=st.chi2_contingency(t,correction=False)[1],df=1))
json.dump(out,open('ref.json','w'))
print('cases',len(out['cases']),'tables',len(out['tables']))
