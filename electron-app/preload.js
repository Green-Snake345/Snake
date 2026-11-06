const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  quit: () => ipcRenderer.send('app-quit'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  loadSaveSync: () => ipcRenderer.sendSync('load-save-sync'),
  saveGameData: (data) => ipcRenderer.send('save-game-data', data)
});
