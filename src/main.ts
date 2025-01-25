import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { GameController } from './controller/GameController';
import log from 'electron-log';
import * as fs from 'fs';

function ensureDatabaseExists() {
    if (app.isPackaged) {
    const dbSourcePath = path.join(__dirname, 'model', 'database', 'retro-portal');

    const dbDestinationPath = path.join(process.resourcesPath, 'database', 'retro-portal');

    if (!fs.existsSync(dbDestinationPath)) {
      const dbDirectory = path.dirname(dbDestinationPath);
      if (!fs.existsSync(dbDirectory)) {
        fs.mkdirSync(dbDirectory, { recursive: true });
      }

      fs.copyFileSync(dbSourcePath, dbDestinationPath);
      log.info(`Database copied to: ${dbDestinationPath}`);
    } else {
      log.info('Database is already on external location.');
    }
  }
}

function ensureDirectoriesExist() {
  const romsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'roms') 
    : path.join(app.getAppPath(), 'roms');

  const emulatorsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'emulators') 
    : path.join(app.getAppPath(), 'emulators');

  if (!fs.existsSync(romsPath)) {
    log.warn(`Roms directory not found at: ${romsPath}`);
  }

  if (!fs.existsSync(emulatorsPath)) {
    log.warn(`Emulators directory not found at: ${emulatorsPath}`);
  }
}

const logResourcersPath = path.join(process.resourcesPath, 'logs');

if (!fs.existsSync(logResourcersPath)) {
  fs.mkdirSync(logResourcersPath, { recursive: true });
}

const logFileName = 'main.log';

log.transports.file.resolvePathFn = () => {
  return path.join(logResourcersPath, logFileName ?? 'default.log');
};

log.info('Logs configuration initialized. Logs will be saved inside resources folder on instalation directory.');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

let mainWindow: BrowserWindow;

function createWindow() {
  log.info('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '..', 'dist', 'preload.js'),
      nodeIntegration: false,
    },
    icon: "../assets/RetroPortalIcon.ico"
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'views', 'index.html'))
    .then(() => log.info('Main window loaded.'))
    .catch((err) => log.error('Error when loading main window:', err));

  new GameController();

  mainWindow.on('resize', () => {
    if (!mainWindow.isFullScreen()) {
      mainWindow.setSize(800, 600);
    }
  });
}

function createAboutWindow() {
  log.info('Opening the "About" window...');
  const aboutWindow = new BrowserWindow({
    width: 480,
    height: 400,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'About',
    modal: true,
    parent: mainWindow || undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  aboutWindow.setMenu(null);
  aboutWindow.loadFile(path.join(__dirname, '..', 'src', 'views', 'about.html'))
    .then(() => log.info('About window loaded.'))
    .catch((err) => log.error('Error when loading "About" window:', err));
}

app.whenReady().then( async () => {
  ensureDatabaseExists()
  ensureDirectoriesExist();
  log.info('Program ready.');
  createWindow();

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            createAboutWindow();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  log.info('All windows were closed.');
  if (process.platform !== 'darwin') {
    app.quit();
    log.info('Program ended.');
  }
});

app.on('activate', () => {
  log.info('Program activated.');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
