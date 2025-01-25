import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Game } from '../interfaces/interfaces';
import { DatabaseController } from './database/databaseController';

export class GameListService {
  private romsPath: string;
  private dbController: DatabaseController;

  constructor() {
    this.romsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'roms')
      : path.join(app.getAppPath(), 'roms');
    this.dbController = new DatabaseController();
  }

  async getGamesList(supportedExtensions: string[]): Promise<Game[]> {
    const files = fs.readdirSync(this.romsPath).filter(file =>
      supportedExtensions.some(ext => file.endsWith(ext))
    );
  
    const gameDataPromises = files.map(async (file) => {
      const romName = path.parse(file).name;
  
      try {
        const existingGame = await this.dbController.getGameByName(romName);
        if (existingGame) {
          existingGame.fileName = file; 
          return existingGame;
        }
  
        const responseLocal = await axiosInstance.get<any>(`/searchGamesLocalDb/${romName}`);
        if (responseLocal.data?.game?.gameName) {
          const game = responseLocal.data.game;
          game.fileName = file;
  
          await this.dbController.saveOrUpdateGames(game);
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
        console.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
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