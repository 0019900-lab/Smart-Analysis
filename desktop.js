// Smart-Analysis – ربط نسخة الكمبيوتر (Electron): فتح ملفات .smart بالنقر المزدوج. لا أثر له في المتصفح.
import {openFile} from './files.js';
export function initDesktop(){const d=window.desktop;if(!d)return;document.documentElement.classList.add('desktop');
 const open=o=>{if(o&&o.data)openFile(new File([o.data],o.name))};d.onOpenFile(open);d.initialFile().then(open).catch(()=>{})}
