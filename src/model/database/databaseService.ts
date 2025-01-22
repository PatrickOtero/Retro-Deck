import { Emulator, Game } from '../../interfaces/interfaces';
import { DatabaseRepository } from './databaseRepository';
import knexInstance from "../../../connection"

export class DatabaseService {
  private repository: DatabaseRepository;

  constructor() {
    this.repository = new DatabaseRepository(knexInstance);
  }

  async saveEmulators(emulators: Emulator[]): Promise<void> {
    await this.repository.insertEmulators(emulators);
  }

  async saveGames(games: Game[]): Promise<void> {
    await this.repository.insertGames(games);
  }

  async getEmulators(): Promise<Emulator[]> {
    return await this.repository.getEmulators();
  }

  async getGames(): Promise<Game[]> {
    return await this.repository.getGames();
  }

  async upsertEmulators(emulators: Emulator[]): Promise<void> {
    for (const emulator of emulators) {
      await this.repository.upsertEmulator(emulator);
    }
  }
  
  async upsertGames(games: Game[]): Promise<void> {
    for (const game of games) {
      await this.repository.upsertGame(game);
    }
  }

  async checkEmulatorExists(emulatorId: string): Promise<boolean> {
    return await this.repository.checkEmulatorExists(emulatorId);
  }

  async checkGameExists(gameId: string): Promise<boolean> {
    return await this.repository.checkGameExists(gameId);
  }
}
