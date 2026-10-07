const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    exitApp: () => ipcRenderer.send('exit-app'),
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    minimize: () => ipcRenderer.send('minimize-window')
});
