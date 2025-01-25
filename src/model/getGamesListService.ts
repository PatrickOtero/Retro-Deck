import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Game } from '../interfaces/interfaces';
import { DatabaseController } from './database/databaseController';
import log from "electron-log";

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

      let game = await this.checkLocalDb(romName, file);
      if (!game) game = await this.checkRemoteDb(romName, file);
      if (!game) game = await this.checkRawgDb(romName, file);

      return game || this.getFallbackGame(romName, file);
    });

    return await Promise.all(gameDataPromises);
  }

  private async checkLocalDb(romName: string, file: string): Promise<Game | null> {
    try {
      const existingGame = await this.dbController.getGameByName(romName);
      if (existingGame) {
        log.info("Game found in local database: " + existingGame);
        existingGame.fileName = file;
        return existingGame;
      }
    } catch (error) {
      log.error(`Error checking local DB for ${romName}:`, error);
    }

    return null;
  }

  private async checkRemoteDb(romName: string, file: string): Promise<Game | null> {
    try {
      const response = await axiosInstance.get<any>(`/searchGamesLocalDb/${romName}`);
      if (response.data?.game?.gameName && response.data?.localDB) {
        const game = response.data.game;
        log.info("Game found in remote database: " + game);
        game.fileName = file;
        await this.dbController.saveOrUpdateGames(game);
        return game;
      }
    } catch (error: any) {
      log.error(`Error checking remote DB for ${romName}:`, error.response?.data || error);
    }

    return null;
  }

  private async checkRawgDb(romName: string, file: string): Promise<Game | null> {
    try {
      log.info("Searching in RAWG for: " + romName);
      const responseRawg = await axiosInstance.get<any>(`/games/${romName}`);
      if (responseRawg.data?.game?.gameName && !responseRawg.data?.localDB) {
        const rawgGame = responseRawg.data.game;

        return rawgGame;
      }
    } catch (error: any) {
      log.error(`Error searching RAWG for ${romName}:`, error.response?.data || error);
    }

    return null;
  }

  private getFallbackGame(romName: string, file: string): Game {
    return {
      id: '',
      gameName: romName,
      description: 'No info found',
      backgroundImage: '',
      fileName: file,
    };
  }
}
