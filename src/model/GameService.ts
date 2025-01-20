import * as path from 'path';
import { app } from 'electron';
import { GameListService } from './getGamesListService';
import { Emulator, Game } from '../interfaces/interfaces';
import { EmulatorListService } from './getEmulatorListService';
import { RegisterEmulatorService } from './registerEmulatorDataService';
import { SearchOnRawgAndSaveOnDb } from './searchOnRawgAndSaveOnDb';
import log from "electron-log"

export class GameModel {
  private basePath: string;
  private romsPath: string;
  private emulatorPath: string;
  private gameListService: GameListService;
  private emulatorListService: EmulatorListService
  private registerEmulatorService: RegisterEmulatorService
  private searchOnRawgAndSaveOnDb: SearchOnRawgAndSaveOnDb;

  constructor() {
    this.basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    this.romsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'roms') 
    : path.join(app.getAppPath(), 'resources', 'roms');
  
  this.emulatorPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'emulators') 
    : path.join(app.getAppPath(), 'resources', 'emulators');
    this.gameListService = new GameListService();
    this.emulatorListService = new EmulatorListService()
    this.registerEmulatorService = new RegisterEmulatorService()
    this.searchOnRawgAndSaveOnDb = new SearchOnRawgAndSaveOnDb();
  }

  async searchAndSaveGames(supportedExtensions: string[]): Promise<{ message: string }[]> {
    return this.searchOnRawgAndSaveOnDb.searchOnRawgAndSaveOnDb(supportedExtensions);
  }

  async getGamesList(supportedExtensions: string[]): Promise<Game[]> {
    return this.gameListService.getGamesList(supportedExtensions);
  }

  async getEmulatorList(): Promise<Emulator[] | { message: string}[]> {
    return this.emulatorListService.getEmulatorList();
  }

  async registerEmulator(): Promise<{ message: string}[]> {
    return this.registerEmulatorService.registerEmulator();
  }

  getGamePath(gameName: string): string {
    const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    const gamePath = path.join(basePath, 'roms', gameName);
    log.info(`Gerado caminho do jogo: ${gamePath}`);
    return gamePath;
  }
  
  getEmulatorPath(emulatorName: string): string {
    const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    const emulatorPath = path.join(basePath, 'emulators', emulatorName);
    log.info(`Gerado caminho do emulador: ${emulatorPath}`);
    return emulatorPath;
  }
}
