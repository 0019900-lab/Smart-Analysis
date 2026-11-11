const {contextBridge,ipcRenderer}=require('electron');const I=(c,...a)=>ipcRenderer.invoke(c,...a);
contextBridge.exposeInMainWorld('desktop',{platform:process.platform,
 onOpenFile:cb=>ipcRenderer.on('open-file',(_e,o)=>o&&cb(o)),initialFile:()=>I('initial-file'),
 getSettings:()=>I('settings-get'),setSetting:(k,v)=>I('settings-set',k,v),applyWindowMode:m=>I('apply-window-mode',m),toggleFullscreen:()=>I('toggle-fullscreen'),quit:()=>I('quit'),
 storageInfo:()=>I('storage-info'),openDataFolder:()=>I('open-data-folder'),clearCache:()=>I('clear-cache'),clearData:()=>I('clear-data'),uninstall:()=>I('uninstall')});
