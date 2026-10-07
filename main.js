const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 750,
        minWidth: 600,
        minHeight: 500,
        resizable: true,
        fullscreen: false,
        autoHideMenuBar: true,
        title: 'Змейка',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            autoplayPolicy: 'no-user-gesture-required'
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'game', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
            event.preventDefault();
        }
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

// IPC-обработчики — принимают команды от игры
ipcMain.on('exit-app', () => {
    if (mainWindow) mainWindow.close();
    app.quit();
});

ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
