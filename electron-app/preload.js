const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  quit: () => ipcRenderer.send('app-quit'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen')
});
