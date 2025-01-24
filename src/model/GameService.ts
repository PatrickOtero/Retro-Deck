import * as path from 'path';
import { app } from 'electron';
import { GameListService } from './getGamesListService';
import { Emulator, Game } from '../interfaces/interfaces';
import { RegisterEmulatorService } from './registerEmulatorDataService';
import { SearchOnRawgAndSaveOnDb } from './searchOnRawgAndSaveOnDb';
import log from "electron-log"
import { RegisterNewExecutablesService } from './registerNewExecutableService';
import { CheckForNewExecutablesService } from './checkForNewExecutablesService';
import { RomCheckService } from './romCheckService';
import { LocalGameListService } from './romFetchService';
import { EmulatorListLocalService } from './getEmulatorListLocalService';
import { CheckNewRomService } from './checkNewRomsService';

export class GameModel {
  private basePath: string;
  private romsPath: string;
  private emulatorPath: string;
  private gameListService: GameListService;
  private registerEmulatorService: RegisterEmulatorService
  private searchOnRawgAndSaveOnDb: SearchOnRawgAndSaveOnDb;
  private registerNewExecutablesService: RegisterNewExecutablesService;
  private checkForNewExecutablesService: CheckForNewExecutablesService;
  private romCheckService: RomCheckService;
  private localGameListService: LocalGameListService;
  private localEmulatorListService: EmulatorListLocalService
  private checkNewRomService: CheckNewRomService;

  constructor() {
    this.basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
    this.romsPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'roms') 
    : path.join(app.getAppPath(),'roms');

    console.log("roms: " + this.romsPath)
    log.info("roms: " + this.romsPath)
  
  this.emulatorPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'emulators') 
    : path.join(app.getAppPath(),'emulators');
    this.gameListService = new GameListService();
    this.registerEmulatorService = new RegisterEmulatorService()
    this.searchOnRawgAndSaveOnDb = new SearchOnRawgAndSaveOnDb();
    this.registerNewExecutablesService = new RegisterNewExecutablesService();
    this.checkForNewExecutablesService = new CheckForNewExecutablesService();
    this.romCheckService = new RomCheckService();
    this.localGameListService = new LocalGameListService();
    this.localEmulatorListService = new EmulatorListLocalService()
    this.checkNewRomService = new CheckNewRomService();
  }

  async checkForNewRoms(): Promise<{ hasNewRoms: boolean, romStatus: { [key: string]: string } }> {
    return await this.checkNewRomService.checkForNewRomsAndValidate();
  }

  async checkIfRomsExist(): Promise<{ message: string }> {
    return this.romCheckService.checkIfRomsExist();
  }

  async getLocalGamesList(supportedExtensions: string[]): Promise<Game[]> {
    return this.localGameListService.getLocalGamesList(supportedExtensions);
  }

  async searchAndSaveGames(supportedExtensions: string[]): Promise<{ message: string }[]> {
    return this.searchOnRawgAndSaveOnDb.searchOnRawgAndSaveOnDb(supportedExtensions);
  }

  async getGamesList(supportedExtensions: string[]): Promise<Game[]> {
    console.log()
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
