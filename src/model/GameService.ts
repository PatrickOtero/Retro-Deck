import * as path from 'path';
import { app } from 'electron';
import { Emulator, Game } from '../interfaces/interfaces';
import { RegisterEmulatorService } from './registerEmulatorDataService';
import log from "electron-log"
import { RegisterNewExecutablesService } from './registerNewExecutableService';
import { CheckForNewExecutablesService } from './checkForNewExecutablesService';
import { EmulatorListLocalService } from './getEmulatorListLocalService';
import { GameListService } from './getGamesListService';

export class GameModel {
  private basePath: string;
  private romsPath: string;
  private emulatorPath: string;
  private gameListService: GameListService;
  private registerEmulatorService: RegisterEmulatorService
  private registerNewExecutablesService: RegisterNewExecutablesService;
  private checkForNewExecutablesService: CheckForNewExecutablesService;
  private localEmulatorListService: EmulatorListLocalService

  constructor() {
    this.basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    this.romsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'roms') 
    : path.join(app.getAppPath(),'roms');

    log.info("roms: " + this.romsPath)
  
  this.emulatorPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'emulators') 
    : path.join(app.getAppPath(),'emulators');
    this.gameListService = new GameListService();
    this.registerEmulatorService = new RegisterEmulatorService()
    this.registerNewExecutablesService = new RegisterNewExecutablesService();
    this.checkForNewExecutablesService = new CheckForNewExecutablesService();
    this.localEmulatorListService = new EmulatorListLocalService()
  }

  async getGames(supportedExtensions: string[]): Promise<Game[]> {
    return this.gameListService.getGamesList(supportedExtensions);
  }

  async getLocalEmulatorList(): Promise<Emulator[] | { message: string}[]> {
    return this.localEmulatorListService.getLocalEmulatorList();
  }

  async registerEmulator(): Promise<{ message: string}[]> {
    return this.registerEmulatorService.registerEmulator();
  }

  async checkForNewExecutables(): Promise<string[]> {
    return await this.checkForNewExecutablesService.checkForNewExecutables();
  }

  async registerNewExecutables(executables: string[]): Promise<void> {
    await this.registerNewExecutablesService.registerNewExecutables(executables);
  }

  getGamePath(gameName: string): string {
    const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    const gamePath = path.join(basePath, 'roms', gameName);
    log.info(`Game path generated: ${gamePath}`);
    return gamePath;
  }
  
  getEmulatorPath(emulatorName: string): string {
    const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    const emulatorPath = path.join(basePath, 'emulators', emulatorName);
    log.info(`Emulator path generated: ${emulatorPath}`);
    return emulatorPath;
  }
}
