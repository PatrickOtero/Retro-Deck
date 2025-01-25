import { Emulator, Game } from '../../interfaces/interfaces';
import { DatabaseRepository } from './databaseRepository';
import knexInstance from "../../connection"
import log from "electron-log";

export class DatabaseService {
  private repository: DatabaseRepository;

  constructor() {
    this.repository = new DatabaseRepository(knexInstance);
  }

  async getAllEmulators(): Promise<Emulator[]> {
    return await this.repository.getAllEmulators();
  }

  async getAllGames(): Promise<Game[]> {
    return await this.repository.getAllGames();
  }

  async saveEmulator(emulatorName: string): Promise<void> {
    const emulatorExists = await this.repository.findEmulatorByName(emulatorName);

    if (emulatorExists) {
      throw new Error('Emulator already registered');
    }

    await this.repository.insertEmulator(emulatorName);
  }

  async saveGames(game: Game): Promise<void> {
    await this.repository.insertGames(game);
  }

  async getEmulatorByName(emulatorName: string): Promise<Emulator | null> {
    return await this.repository.findEmulatorByName(emulatorName);
  }

  async getGameByName(gameId: string): Promise<Game | null> {
    return await this.repository.getGameByName(gameId);
  }

  async upsertEmulators(emulator: Emulator): Promise<void> {
      await this.repository.upsertEmulator(emulator);
  }
  
  async upsertGames(game: Game): Promise<void> {
      await this.repository.upsertGame(game);
  }

  async checkEmulatorExists(emulatorId: string): Promise<boolean> {
    return await this.repository.checkEmulatorExists(emulatorId);
  }

  async checkGamesExist(gameNames: string[]): Promise<string[]> {
    return await this.repository.checkGamesExist(gameNames);
  }

  async checkGameExists(gameId: string): Promise<boolean> {
    return await this.repository.checkGameExists(gameId);
  }
}
