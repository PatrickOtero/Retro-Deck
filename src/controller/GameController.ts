import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { GameModel } from '../model/GameService';
import * as fs from 'fs';
import { BrowserWindow } from 'electron';
import { Emulator, Game } from '../interfaces/interfaces';
import log from 'electron-log';

export class GameController {
  private gameModel: GameModel;
  private isEmulatorRunning: boolean; 

  constructor() {
    this.gameModel = new GameModel();
    this.isEmulatorRunning = false; 
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {

    ipcMain.handle('get-games', async (event, supportedExtensions: string[]): Promise<Game[]> => {
      return await this.gameModel.getGames(supportedExtensions);
    });

    ipcMain.handle('register-emulator', async (): Promise<{ message: string}[]> => {
      const emulatorRegistered = await this.gameModel.registerEmulator();
      return emulatorRegistered;
    });

    ipcMain.handle('check-for-new-executables', async (): Promise<string[]> => {
      const newExecutables = await this.gameModel.checkForNewExecutables();
      return newExecutables;
    });
    
    ipcMain.handle('register-new-executables', async (event, executables: string[]): Promise<{ success: boolean; message: string }> => {
    
      if (!executables || executables.length === 0) {
        return { success: false, message: 'No executable given.' };
      }
    
      try {
        await this.gameModel.registerNewExecutables(executables);
        return { success: true, message: 'Executables registered successfully.' };
      } catch (error: any) {
        console.error(`Error ao when registering executables: ${error.message}`);
        return { success: false, message: error.message };
      }
    });

    ipcMain.handle('get-local-emulator', async (): Promise<Emulator[] | { message: string} []> => {
      const emulators = await this.gameModel.getLocalEmulatorList();
      return emulators;
    });

    ipcMain.handle('run-game', async (event, gameName: string, emulatorName: string) => {
      log.info(`Run game executed! Game: ${gameName}, Emulator: ${emulatorName}`);
      if (!emulatorName) {
        log.error('Error: Emulator name in undefined.');
        return { success: false, message: 'Emulator name is undefined.' };
      }
    
      const gamePath = this.gameModel.getGamePath(gameName);
      log.info(`Game path: ${gamePath}`);
      if (!gamePath) {
        log.error('Error: Game path not found.');
        return { success: false, message: 'Game path not found.' };
      }
    
      if (this.isEmulatorRunning) {
        log.warn('Emulator already running.');
        return { success: false, message: 'Emulator already running.' };
      }
    
      this.runGame(gameName, emulatorName);
      return { success: true, message: 'Game started' };
    });

    ipcMain.handle('is-emulator-running', () => {
      return this.isEmulatorRunning;
    });
  }

  private runGame(gameName: string, emulatorName: string): void {
    const gamePath = this.gameModel.getGamePath(gameName);
    const emulatorPath = this.gameModel.getEmulatorPath(emulatorName + ".exe");
  
    log.info(`Trying to start emulator: ${emulatorPath} with game: ${gamePath}`);
  
    if (!gamePath || !fs.existsSync(gamePath)) {
      log.error(`Erro: Game path not found: ${gamePath}`);
      return;
    }
  
    if (!emulatorPath || !fs.existsSync(emulatorPath)) {
      log.error(`Erro: Emulator path not found: ${emulatorPath}`);
      return;
    }
  
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      log.info('Hiding main window before starting the emulator.');
      mainWindow.hide();
    }
  
    this.isEmulatorRunning = true;

    log.info(gamePath)
  
    const childProcess = exec(`"${emulatorPath}" "${gamePath}"`, (err, stdout, stderr) => {
      if (err) {
        log.error(`Error when executing emulator: ${err.message}`);
        this.isEmulatorRunning = false;
        return;
      }
      log.info(`Emulator output: ${stdout}`);
      if (stderr) {
        log.warn(`Emulator's warning: ${stderr}`);
      }
    });
  
    childProcess.on('close', (code) => {
      log.info(`The emulator was closed with the code: ${code}`);
      this.isEmulatorRunning = false;
  
      if (mainWindow) {
        log.info('Restoring the main window after closing the emulator.');
        mainWindow.show();
      }
    });
  }
}
