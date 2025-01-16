import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { GameModel } from '../model/GameService';
import * as fs from 'fs';
import { BrowserWindow } from 'electron';
import { Emulator, Game } from '../interfaces/interfaces';

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
      console.log("Get games executado!", supportedExtensions)

      if (!supportedExtensions || supportedExtensions.length === 0) {
        console.error('Nenhuma extensão fornecida.');
        return [];
      }

      const games = await this.gameModel.getGamesList(supportedExtensions);
      return games;
    });

    ipcMain.handle('register-emulator', async (): Promise<{ message: string}[]> => {
      console.log("Register emulator executado!")
      const emulatorRegistered = await this.gameModel.registerEmulator();
      return emulatorRegistered;
    });

    ipcMain.handle('get-emulator', async (): Promise<Emulator[] | { message: string} []> => {
      console.log("Get emulators executado!")
      const emulators = await this.gameModel.getEmulatorList();
      console.log('Emulators fetched:', emulators);
      return emulators;
    });

    ipcMain.handle('run-game', async (event, gameName: string, emulatorName: string) => {
      console.log("Run game executado!")
      if (!emulatorName) {
        console.error('Erro: Nome do emulador está indefinido.');
        return { success: false, message: 'Nome do emulador está indefinido.' };
      }
    
      const gamePath = this.gameModel.getGamePath(gameName);
    
      if (!gamePath) {
        console.error('Erro: Caminho do jogo não encontrado.');
        return { success: false, message: 'Caminho do jogo não encontrado.' };
      }
    
      if (this.isEmulatorRunning) {
        console.log('O emulador já está em execução.');
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
    const emulatorPath = `C:\\Users\\Patrick Otero\\Desktop\\Entertainment\\Consoles emulation\\My programs\\Retro-Deck\\emulators\\${emulatorName}.exe`;
  
    if (!gamePath || !emulatorName) {
      console.error('Erro: Caminho do jogo ou nome do emulador está indefinido.');
      return;
    }
  
    if (!fs.existsSync(gamePath)) {
      console.error(`Erro: Caminho do jogo não encontrado: ${gamePath}`);
      return;
    }
  
    if (!fs.existsSync(emulatorPath)) {
      console.error(`Erro: Caminho do emulador não encontrado: ${emulatorPath}`);
      return;
    }
  
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      mainWindow.hide();
    }
  
    this.isEmulatorRunning = true;
  
    const childProcess = exec(`"${emulatorPath}" "${gamePath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Erro ao rodar o ${emulatorName}: ${err}`);
        this.isEmulatorRunning = false;
        return;
      }
      if (stderr) {
        console.error(`Erro no ${emulatorName}: ${stderr}`);
        this.isEmulatorRunning = false;
        return;
      }
      console.log(`Saída do ${emulatorName}: ${stdout}`);
    });
  
    childProcess.on('close', (code) => {
      console.log(`O emulador foi fechado com o código: ${code}`);
      this.isEmulatorRunning = false;
  
      if (mainWindow) {
        mainWindow.show();
      }
    });
  }
  
}
