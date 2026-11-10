// مولّد/فاحص الأرقام التسلسلية للمُثبّت:  node tools/serial.mjs            -> الرقم الرئيسي
//   node tools/serial.mjs 5821   -> رقم لعميل بعينه (NNNN بين 1000 و9999)   |   node tools/serial.mjs check SMART-4949-2468
const chk=n=>(n*7919+1337)%10000,mk=n=>`SMART-${n}-${chk(n)}`;
const ok=s=>{const m=/^SMART-(\d{4})-(\d{4})$/i.exec(s||'');return !!m&&+m[1]>=1000&&chk(+m[1])===+m[2]};
const [a,b]=process.argv.slice(2);
if(a==='check')console.log(ok(b)?'valid':'INVALID');
else{const n=a?+a:4949;if(!(n>=1000&&n<=9999)||chk(n)<1000){console.log('اختر رقماً بين 1000 و9999 (ناتج الفحص يجب ألا يقل عن 1000)');process.exit(1)}console.log(mk(n))}
