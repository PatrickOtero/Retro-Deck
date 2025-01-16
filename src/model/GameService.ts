import * as path from 'path';
import { app } from 'electron';
import { GameListService } from './GameListService';
import { Emulator, Game } from '../interfaces/interfaces';
import { EmulatorListService } from './getEmulatorListService';
import { RegisterEmulatorService } from './RegisterEmulatorDataService';

export class GameModel {
  private romsPath: string;
  private emulatorPath: string;
  private gameListService: GameListService;
  private emulatorListService: EmulatorListService
  private registerEmulatorService: RegisterEmulatorService

  constructor() {
    this.romsPath = path.join(app.getAppPath(), 'roms');
    this.emulatorPath = path.join(app.getAppPath(), 'emulators');
    this.gameListService = new GameListService();
    this.emulatorListService = new EmulatorListService()
    this.registerEmulatorService = new RegisterEmulatorService()
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
    return path.join(this.romsPath, gameName);
  }

  getEmulatorPath(emulatorName: string): string {
    return path.join(this.emulatorPath, emulatorName);
  }
}
