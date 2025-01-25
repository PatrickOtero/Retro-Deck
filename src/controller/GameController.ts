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

    ipcMain.handle('check-if-roms-exist', async (): Promise<{ message: string }> => {
      const result = await this.gameModel.checkIfRomsExist();
      return result;
    });
  
    ipcMain.handle('get-local-games', async (event, supportedExtensions: string[]): Promise<Game[]> => {
      const games = await this.gameModel.getLocalGamesList(supportedExtensions);
      return games;
    });

    ipcMain.handle('search-and-save-games', async (event, supportedExtensions: string[]): Promise<{ message: string }[]> => {
    
      if (!supportedExtensions || supportedExtensions.length === 0) {
        console.error('Nenhuma extensão fornecida.');
        return [{ message: 'Nenhuma extensão fornecida.' }];
      }
    
      const result = await this.gameModel.searchAndSaveGames(supportedExtensions);
      return result;
    });

    ipcMain.handle('get-games', async (event, supportedExtensions: string[]): Promise<Game[]> => {

      if (!supportedExtensions || supportedExtensions.length === 0) {
        console.error('Nenhuma extensão fornecida.');
        return [];
      }

      const games = await this.gameModel.getGamesList(supportedExtensions);
      return games;
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
        return { success: false, message: 'Nenhum executável fornecido.' };
      }
    
      try {
        await this.gameModel.registerNewExecutables(executables);
        return { success: true, message: 'Executáveis registrados com sucesso.' };
      } catch (error: any) {
        console.error(`Erro ao registrar executáveis: ${error.message}`);
        return { success: false, message: error.message };
      }
    });

    ipcMain.handle('get-local-emulator', async (): Promise<Emulator[] | { message: string} []> => {
      const emulators = await this.gameModel.getLocalEmulatorList();
      return emulators;
    });

    ipcMain.handle('run-game', async (event, gameName: string, emulatorName: string) => {
      log.info(`Run game executado! Jogo: ${gameName}, Emulador: ${emulatorName}`);
      if (!emulatorName) {
        log.error('Erro: Nome do emulador está indefinido.');
        return { success: false, message: 'Nome do emulador está indefinido.' };
      }
    
      const gamePath = this.gameModel.getGamePath(gameName);
      log.info(`Caminho do jogo: ${gamePath}`);
      if (!gamePath) {
        log.error('Erro: Caminho do jogo não encontrado.');
        return { success: false, message: 'Caminho do jogo não encontrado.' };
      }
    
      if (this.isEmulatorRunning) {
        log.warn('O emulador já está em execução.');
        return { success: false, message: 'O emulador já está rodando.' };
      }
    
      this.runGame(gameName, emulatorName);
      return { success: true, message: 'Jogo iniciado.' };
    });

    ipcMain.handle('is-emulator-running', () => {
      return this.isEmulatorRunning;
    });
  }

  private runGame(gameName: string, emulatorName: string): void {
    const gamePath = this.gameModel.getGamePath(gameName);
    const emulatorPath = this.gameModel.getEmulatorPath(emulatorName + ".exe");
  
    log.info(`Tentando iniciar o emulador: ${emulatorPath} com o jogo: ${gamePath}`);
  
    if (!gamePath || !fs.existsSync(gamePath)) {
      log.error(`Erro: Caminho do jogo não encontrado: ${gamePath}`);
      return;
    }
  
    if (!emulatorPath || !fs.existsSync(emulatorPath)) {
      log.error(`Erro: Caminho do emulador não encontrado: ${emulatorPath}`);
      return;
    }
  
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      log.info('Ocultando janela principal antes de iniciar o emulador.');
      mainWindow.hide();
    }
  
    this.isEmulatorRunning = true;

    log.info(gamePath)
  
    const childProcess = exec(`"${emulatorPath}" "${gamePath}"`, (err, stdout, stderr) => {
      if (err) {
        log.error(`Erro ao executar o emulador: ${err.message}`);
        this.isEmulatorRunning = false;
        return;
      }
      log.info(`Saída do emulador: ${stdout}`);
      if (stderr) {
        log.warn(`Aviso do emulador: ${stderr}`);
      }
    });
  
    childProcess.on('close', (code) => {
      log.info(`O emulador foi encerrado com o código: ${code}`);
      this.isEmulatorRunning = false;
  
      if (mainWindow) {
        log.info('Restaurando a janela principal após o encerramento do emulador.');
        mainWindow.show();
      }
    });
  }
}
