// Smart-Analysis – نسخة الكمبيوتر (Electron): فتح ملفات .smart، ملء الشاشة، الخروج. لا أثر لها في المتصفح.
import {openFile} from './files.js';
// يحذف من القوائم أي عنصر لا أمر له (خدمة غير منفَّذة) وأي قائمة صارت فارغة، فلا يظهر «قريباً» للمستخدم.
export function pruneMenus(MENUS,ACT){for(let k=MENUS.length-1;k>=0;k--){const m=MENUS[k];if(!Array.isArray(m[2]))continue;
 m[2]=m[2].filter(it=>!Array.isArray(it)||(it[3]&&ACT[it[3]]));while(m[2].length&&!Array.isArray(m[2][0]))m[2].shift();while(m[2].length&&!Array.isArray(m[2][m[2].length-1]))m[2].pop();
 if(!m[2].length&&m[0]!=='مساعدة')MENUS.splice(k,1)}}
export function initDesktop(ACT,say,T,MENUS){const d=window.desktop;if(!d)return;document.documentElement.classList.add('desktop');
 const open=o=>{if(o&&o.data)openFile(new File([o.data],o.name))};d.onOpenFile(open);d.initialFile().then(open).catch(()=>{});
 let startFull=true;d.getSettings().then(s=>{startFull=s.startFullscreen!==false}).catch(()=>{});
 ACT.fullscreen=()=>d.toggleFullscreen().then(f=>say(T(f?'ملء الشاشة (F11 للرجوع)':'نافذة عادية','Fullscreen (F11 to exit)')));
 ACT.startFullscreen=()=>{startFull=!startFull;d.setSetting('startFullscreen',startFull);say(T(startFull?'سيفتح البرنامج بملء الشاشة عند التشغيل':'سيفتح البرنامج في نافذة عادية عند التشغيل',startFull?'The app will start in fullscreen':'The app will start in a normal window'))};
 ACT.quitApp=()=>d.quit();
 const add=(label,items)=>{const m=MENUS.find(x=>x[0]===label);m&&Array.isArray(m[2])&&m[2].push(...items)};
 add('عرض',[['ملء الشاشة','Fullscreen','F11','fullscreen',0],['ملء الشاشة عند بدء التشغيل (تشغيل/إيقاف)','Start in fullscreen (on/off)','','startFullscreen',0]]);
 add('ملف',[['خروج','Exit','Alt+F4','quitApp',0]])}
