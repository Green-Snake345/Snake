const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Змейка',
    icon: path.join(__dirname, 'build/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('https://green-snake345.github.io/Snake/');
  win.on('page-title-updated', (e) => e.preventDefault());

  ipcMain.on('app-quit', () => app.quit());
  ipcMain.on('toggle-fullscreen', () => win.setFullScreen(!win.isFullScreen()));

  const savePath = path.join(app.getPath('userData'), 'savegame.json');

  ipcMain.on('load-save-sync', (event) => {
    try {
      if (fs.existsSync(savePath)) {
        event.returnValue = fs.readFileSync(savePath, 'utf-8');
      } else {
        event.returnValue = null;
      }
    } catch (e) {
      console.error('Ошибка чтения сохранения:', e);
      event.returnValue = null;
    }
  });

  ipcMain.on('save-game-data', (event, data) => {
    try {
      fs.writeFileSync(savePath, data, 'utf-8');
    } catch (e) {
      console.error('Ошибка записи сохранения:', e);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      console.log('Ошибка проверки обновлений (возможно, нет интернета):', err);
    });
  }, 3000);
});

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Доступно обновление',
    message: `Найдена новая версия ${info.version}!`,
    detail: 'Хотите скачать и установить обновление?',
    buttons: ['Скачать', 'Позже'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Обновление готово',
    message: 'Обновление скачано и будет установлено после перезапуска.',
    detail: 'Перезапустить игру сейчас?',
    buttons: ['Перезапустить', 'Позже'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.log('AutoUpdater error:', err.message);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
