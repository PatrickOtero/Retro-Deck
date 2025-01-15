import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { GameController } from './controller/GameController'

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
        preload: path.join(__dirname, '..', 'dist', 'preload.js'), 
        nodeIntegration: false, 
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'views', 'index.html'));

  new GameController();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
