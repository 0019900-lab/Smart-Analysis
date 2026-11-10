const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{platform:process.platform,
 onOpenFile:cb=>ipcRenderer.on('open-file',(_e,o)=>o&&cb(o)),initialFile:()=>ipcRenderer.invoke('initial-file'),getSettings:()=>ipcRenderer.invoke('settings-get'),setSetting:(k,v)=>ipcRenderer.invoke('settings-set',k,v),toggleFullscreen:()=>ipcRenderer.invoke('toggle-fullscreen'),quit:()=>ipcRenderer.invoke('quit')});
