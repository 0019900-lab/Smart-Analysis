// Smart-Analysis Desktop – غلاف Electron: يحمّل تطبيق الويب محلياً عبر app:// بلا خادم ولا إنترنت.
const {app,BrowserWindow,protocol,net,shell,dialog,session,Menu,ipcMain}=require('electron');
const path=require('path'),fs=require('fs'),{pathToFileURL}=require('url'),{spawn}=require('child_process');
const ROOT=path.join(__dirname,'app'),PRODUCT='Smart-Analysis';
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
let win=null,pending=null;
const SF=()=>path.join(app.getPath('userData'),'settings.json');
const MODES=['maximized','fullscreen','windowed'];
const readSet=()=>{try{const o=JSON.parse(fs.readFileSync(SF(),'utf8'));return{startMode:MODES.includes(o.startMode)?o.startMode:'maximized'}}catch{return{startMode:'maximized'}}};
const writeSet=o=>{try{fs.mkdirSync(path.dirname(SF()),{recursive:true});fs.writeFileSync(SF(),JSON.stringify(o))}catch{}};
async function dirSize(p){let t=0;try{for(const e of await fs.promises.readdir(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())t+=await dirSize(f);else{try{t+=(await fs.promises.stat(f)).size}catch{}}}}catch{}return t}
function applyMode(m){if(!win)return;if(m==='fullscreen')win.setFullScreen(true);else{win.setFullScreen(false);setTimeout(()=>{if(!win)return;m==='maximized'?win.maximize():win.unmaximize()},120)}}
const argFile=a=>a.find(x=>/\.(smart|statlab)$/i.test(x)&&fs.existsSync(x));
const load=p=>{try{return{name:path.basename(p),data:fs.readFileSync(p)}}catch{return null}};
if(!app.requestSingleInstanceLock()){app.quit()}else{
 app.on('second-instance',(_e,argv)=>{if(win){if(win.isMinimized())win.restore();win.focus();const f=argFile(argv);if(f)win.webContents.send('open-file',load(f))}});
 app.on('open-file',(e,p)=>{e.preventDefault();pending=p;if(win)win.webContents.send('open-file',load(p))});
 ipcMain.handle('settings-get',()=>readSet());
 ipcMain.handle('settings-set',(_e,k,v)=>{if(k==='startMode'&&MODES.includes(v))writeSet({...readSet(),startMode:v})});
 ipcMain.handle('apply-window-mode',(_e,m)=>{if(MODES.includes(m))applyMode(m)});
 ipcMain.handle('toggle-fullscreen',()=>{if(!win)return false;win.setFullScreen(!win.isFullScreen());return win.isFullScreen()});
 ipcMain.handle('quit',()=>app.quit());
 ipcMain.handle('storage-info',async()=>({path:app.getPath('userData'),size:await dirSize(app.getPath('userData')),installPath:path.dirname(process.execPath),version:app.getVersion(),packaged:app.isPackaged}));
 ipcMain.handle('open-data-folder',()=>shell.openPath(app.getPath('userData')));
 ipcMain.handle('clear-cache',()=>session.defaultSession.clearCache());
 ipcMain.handle('clear-data',async()=>{await session.defaultSession.clearStorageData();await session.defaultSession.clearCache();try{fs.rmSync(SF(),{force:true})}catch{}if(win)win.reload()});
 ipcMain.handle('uninstall',()=>{if(!app.isPackaged)return'dev';const un=path.join(path.dirname(process.execPath),`Uninstall ${PRODUCT}.exe`);
  if(fs.existsSync(un)){try{spawn(un,[],{detached:true,stdio:'ignore'}).unref();setTimeout(()=>app.quit(),300);return'started'}catch{}}
  shell.openExternal('ms-settings:appsfeatures');return'fallback'});
 ipcMain.handle('initial-file',()=>{const p=pending||argFile(process.argv.slice(1));pending=null;return p?load(p):null});
 function createWindow(){
  const mode=readSet().startMode;
  win=new BrowserWindow({width:1400,height:880,minWidth:1000,minHeight:640,backgroundColor:'#f2f6fb',title:PRODUCT,icon:path.join(__dirname,'build','icon.ico'),show:false,fullscreen:mode==='fullscreen',
   webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,devTools:!app.isPackaged}});
  win.once('ready-to-show',()=>{if(mode==='maximized')win.maximize();win.show()});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11'){e.preventDefault();win.setFullScreen(!win.isFullScreen())}});
  win.loadURL('app://local/index.html');
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return{action:'deny'}});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('app://')){e.preventDefault();if(/^https:\/\//i.test(url))shell.openExternal(url)}});
  win.webContents.on('will-prevent-unload',e=>{const c=dialog.showMessageBoxSync(win,{type:'warning',buttons:['البقاء / Stay','إغلاق دون حفظ / Close without saving'],defaultId:0,cancelId:0,title:PRODUCT,message:'توجد تغييرات غير محفوظة\nYou have unsaved changes'});if(c===1)e.preventDefault()});
  win.on('closed',()=>{win=null});
 }
 app.whenReady().then(()=>{
  Menu.setApplicationMenu(null);
  protocol.handle('app',req=>{let p=decodeURIComponent(new URL(req.url).pathname);if(!p||p==='/')p='/index.html';const f=path.normalize(path.join(ROOT,p));
   if(!f.startsWith(ROOT))return new Response('forbidden',{status:403});return net.fetch(pathToFileURL(f).toString())});
  const okPerm=p=>['clipboard-read','clipboard-sanitized-write'].includes(p);
  session.defaultSession.setPermissionRequestHandler((_w,p,cb)=>cb(okPerm(p)));session.defaultSession.setPermissionCheckHandler((_w,p)=>okPerm(p));
  createWindow();
  app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()});
 });
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
}
