import { Knex } from "knex"
import { Emulator, Game } from '../../interfaces/interfaces';

export class DatabaseRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db
  }

  async insertEmulators(emulators: Emulator[]): Promise<void> {
    try {
      await this.db('emulators').insert(emulators);
    } catch (error: any) {
      console.error('Erro ao inserir emuladores:', error.message);
      throw new Error('Erro ao inserir emuladores');
    }
  }

  async insertGames(games: Game[]): Promise<void> {
    try {
      await this.db('games').insert(games);
    } catch (error: any) {
      console.error('Erro ao inserir jogos:', error.message);
      throw new Error('Erro ao inserir jogos');
    }
  }

  async checkEmulatorExists(emulatorId: string): Promise<boolean> {
    const result = await this.db('emulators')
      .where('id', emulatorId)
      .count('* as count')
      .first();

      if (result) {
        return true
      } else {
        return false
      }
  }

  async checkGameExists(gameId: string): Promise<boolean> {
    const result = await this.db('games')
      .where('id', gameId)
      .count('* as count')
      .first();

      if (result) {
        return true
      } else {
        return false
      }
  }

  async upsertEmulator(emulator: Emulator): Promise<void> {
    try {
      await this.db('emulators')
        .insert(emulator)
        .onConflict('id')
        .merge();
    } catch (error: any) {
      console.error('Erro ao realizar upsert de emulador:', error.message);
      throw new Error('Erro ao realizar upsert de emulador');
    }
  }
  
  async upsertGame(game: Game): Promise<void> {
    try {
      await this.db('games')
        .insert(game)
        .onConflict('id')
        .merge();
    } catch (error: any) {
      console.error('Erro ao realizar upsert de jogo:', error.message);
      throw new Error('Erro ao realizar upsert de jogo');
    }
  }  

  async getEmulators(): Promise<Emulator[]> {
    return this.db('emulators').select('*');
  }

  async getGames(): Promise<Game[]> {
    return this.db('games').select('*');
  }
}
