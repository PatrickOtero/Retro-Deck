import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { GameController } from './controller/GameController';
import log from 'electron-log';
import * as fs from 'fs';

function ensureDirectoriesExist() {
  const romsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'roms') 
    : path.join(app.getAppPath(), 'roms');

  const emulatorsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'emulators') 
    : path.join(app.getAppPath(), 'emulators');

  if (!fs.existsSync(romsPath)) {
    log.warn(`Diretório "roms" não encontrado em: ${romsPath}`);
  }

  if (!fs.existsSync(emulatorsPath)) {
    log.warn(`Diretório "emulators" não encontrado em: ${emulatorsPath}`);
  }
}

const desktopPath = path.join(app.getPath('desktop'), 'logs');

if (!fs.existsSync(desktopPath)) {
  fs.mkdirSync(desktopPath, { recursive: true });
}

const logFileName = 'main.log';

log.transports.file.resolvePathFn = () => {
  return path.join(desktopPath, logFileName ?? 'default.log');
};

log.info('Configuração de logs inicializada. Logs serão salvos na área de trabalho.');
log.error('Este é um exemplo de erro.');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

let mainWindow: BrowserWindow;

function createWindow() {
  log.info('Criando a janela principal...');
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
    .then(() => log.info('Janela principal carregada.'))
    .catch((err) => log.error('Erro ao carregar a janela principal:', err));

  new GameController();

  mainWindow.webContents.openDevTools()

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
    .then(() => log.info('Janela "Sobre" carregada.'))
    .catch((err) => log.error('Erro ao carregar a janela "Sobre":', err));
}

app.whenReady().then( async () => {
  ensureDirectoriesExist();
  log.info('Aplicativo pronto.');
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
  log.info('Todas as janelas foram fechadas.');
  if (process.platform !== 'darwin') {
    app.quit();
    log.info('Aplicativo encerrado.');
  }
});

app.on('activate', () => {
  log.info('Aplicativo ativado.');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
