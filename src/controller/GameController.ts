import { BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import { GameModel } from '../model/GameService';

export class GameController {
  private gameModel: GameModel;
  private mainWindow: BrowserWindow;
  private isEmulatorRunning: boolean; 

  constructor(mainWindow: BrowserWindow) {
    this.gameModel = new GameModel();
    this.mainWindow = mainWindow;
    this.isEmulatorRunning = false; 
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('get-games', async () => {
      const games = await this.gameModel.getGamesList();
      console.log('Games fetched:', games);
      return games;
    });

    ipcMain.handle('run-game', async (event, gameName: string) => {
      if (this.isEmulatorRunning) {
        console.log('O emulador já está em execução.');
        return { success: false, message: 'O emulador já está rodando.' };
      }
      this.runGame(gameName);
      return { success: true, message: 'Jogo iniciado.' };
    });

    ipcMain.handle('is-emulator-running', () => {
      return this.isEmulatorRunning;
    });
  }

  private runGame(gameName: string): void {
    const gamePath = this.gameModel.getGamePath(gameName);
    const fusionPath = 'C:\\Users\\Patrick Otero\\Desktop\\Entertainment\\Consoles emulation\\Fusion\\Fusion.exe';

    this.isEmulatorRunning = true;

    const childProcess = exec(`"${fusionPath}" "${gamePath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Erro ao rodar o Fusion: ${err}`);
        this.isEmulatorRunning = false; 
        return;
      }
      if (stderr) {
        console.error(`Erro no Fusion: ${stderr}`);
        this.isEmulatorRunning = false; 
        return;
      }
      console.log(`Saída do Fusion: ${stdout}`);
    });

    
    childProcess.on('close', (code) => {
      console.log(`O emulador foi fechado com o código: ${code}`);
      this.isEmulatorRunning = false;
    });
  }
}
