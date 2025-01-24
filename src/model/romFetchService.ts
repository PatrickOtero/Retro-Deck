import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { Game } from '../interfaces/interfaces';
import { DatabaseController } from './database/databaseController';
import log from "electron-log";

export class LocalGameListService {
  private romsPath: string;
  private dbController: DatabaseController;

  constructor() {
    this.romsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'roms')
      : path.join(app.getAppPath(), 'roms');
    
    this.dbController = new DatabaseController();
  }

  async getLocalGamesList(supportedExtensions: string[]): Promise<Game[]> {

    
    const files = fs.readdirSync(this.romsPath).filter(file =>
      supportedExtensions.some(ext => file.endsWith(ext))
    );

    const gameDataPromises = files.map(async (file) => {
      const romName = path.parse(file).name;

      try {
        const game = await this.dbController.getGameByName(romName);

        if (game) {
          game.fileName = file

          return game;
        }

        return {
          id: '',
          gameName: romName,
          description: 'Informações não disponíveis',
          backgroundImage: '',
          fileName: file,
        };
      } catch (error: any) {
        log.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
        return {
          id: '',
          gameName: romName,
          description: 'Erro ao buscar informações',
          backgroundImage: '',
          fileName: file,
        };
      }
    });
    return await Promise.all(gameDataPromises);
  }
}
