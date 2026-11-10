const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{platform:process.platform,
 onOpenFile:cb=>ipcRenderer.on('open-file',(_e,o)=>o&&cb(o)),initialFile:()=>ipcRenderer.invoke('initial-file')});
