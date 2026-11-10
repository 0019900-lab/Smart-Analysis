// Smart-Analysis Desktop – غلاف Electron بسيط: يحمّل نفس تطبيق الويب محلياً عبر app:// بلا خادم ولا إنترنت.
const {app,BrowserWindow,protocol,net,shell,dialog,session,Menu,ipcMain}=require('electron');
const path=require('path'),fs=require('fs'),{pathToFileURL}=require('url');
const ROOT=path.join(__dirname,'app');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
let win=null,pending=null;
const SF=()=>path.join(app.getPath('userData'),'settings.json');
const readSet=()=>{try{return{startFullscreen:true,...JSON.parse(fs.readFileSync(SF(),'utf8'))}}catch{return{startFullscreen:true}}};
const writeSet=o=>{try{fs.mkdirSync(path.dirname(SF()),{recursive:true});fs.writeFileSync(SF(),JSON.stringify(o))}catch{}};
const argFile=a=>a.find(x=>/\.(smart|statlab)$/i.test(x)&&fs.existsSync(x));
const load=p=>{try{return{name:path.basename(p),data:fs.readFileSync(p)}}catch{return null}};
if(!app.requestSingleInstanceLock()){app.quit()}else{
 app.on('second-instance',(_e,argv)=>{if(win){if(win.isMinimized())win.restore();win.focus();const f=argFile(argv);if(f)win.webContents.send('open-file',load(f))}});
 app.on('open-file',(e,p)=>{e.preventDefault();pending=p;if(win)win.webContents.send('open-file',load(p))});
 ipcMain.handle('settings-get',()=>readSet());
 ipcMain.handle('settings-set',(_e,k,v)=>{if(k==='startFullscreen')writeSet({...readSet(),[k]:!!v})});
 ipcMain.handle('toggle-fullscreen',()=>{if(!win)return false;win.setFullScreen(!win.isFullScreen());return win.isFullScreen()});
 ipcMain.handle('quit',()=>app.quit());
 ipcMain.handle('initial-file',()=>{const p=pending||argFile(process.argv.slice(1));pending=null;return p?load(p):null});
 function createWindow(){
  win=new BrowserWindow({width:1400,height:880,minWidth:1000,minHeight:640,backgroundColor:'#f2f6fb',fullscreen:readSet().startFullscreen!==false,title:'Smart-Analysis',icon:path.join(__dirname,'build','icon.ico'),show:false,
   webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,devTools:!app.isPackaged}});
  win.once('ready-to-show',()=>win.show());
  win.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11'){e.preventDefault();win.setFullScreen(!win.isFullScreen())}});
  win.loadURL('app://local/index.html');
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return{action:'deny'}});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('app://')){e.preventDefault();if(/^https:\/\//i.test(url))shell.openExternal(url)}});
  // تغييرات غير محفوظة: التطبيق يطلب منع الإغلاق (beforeunload) فنسأل المستخدم
  win.webContents.on('will-prevent-unload',e=>{const c=dialog.showMessageBoxSync(win,{type:'warning',buttons:['البقاء / Stay','إغلاق دون حفظ / Close without saving'],defaultId:0,cancelId:0,title:'Smart-Analysis',message:'توجد تغييرات غير محفوظة\nYou have unsaved changes'});if(c===1)e.preventDefault()});
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
