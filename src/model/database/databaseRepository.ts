import { Knex } from "knex"
import { Emulator, Game } from '../../interfaces/interfaces';
import { nameNormalizer } from "../../utils/nameNormalizer";
import { removeHtmlTags } from "../../utils/descriptionNormalizer"
import { v4 as uuidv4 } from "uuid"

export class DatabaseRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db
  }

  async insertEmulator(emulatorName: string): Promise<void> {
    try {

      let romExtensions: string[] = [];
      const emulatorLowerCase = emulatorName.trim().toLowerCase();
    
      if (emulatorLowerCase.includes('snes')) {
        romExtensions = [".sfc", ".smc"];
      } else if (emulatorLowerCase.includes('fusion')) {
        romExtensions = [".gen", ".md", ".smd", ".32x"];
      } else if (emulatorLowerCase.includes('mesen')) {
        romExtensions = [".nes", ".fds", ".unf"];
      }

      await this.db('emulators').insert({
         id: uuidv4(),
         emulatorName, 
         romExtensions: JSON.stringify(romExtensions),
      });
    } catch (error: any) {
      console.error('Erro ao inserir o emulador no banco de dados:', error.message);
      throw new Error('Erro ao inserir o emulador no banco de dados');
    }
  }

  async insertGames(game: Game): Promise<void> {
    try {
      await this.db('games').insert(game);
    } catch (error: any) {
      console.error('Erro ao inserir jogos:', error.message);
      throw new Error('Erro ao inserir jogos');
    }
  }

  async checkEmulatorExists(emulatorId: string): Promise<boolean> {
    const result = await this.db('emulators')
      .where('emulatorName', emulatorId)
      .count('* as count')
      .first();

      const count = result?.count ? Number(result.count) : 0;
      return count > 0;
  }

  async checkGamesExist(gameNames: string[]): Promise<string[]> {
    try {
      const normalizedNames = gameNames.map(nameNormalizer);
      const results = await this.db('games')
        .select('gameName')
        .whereIn('gameName', normalizedNames);
  
      return results.map((game) => game.gameName);
    } catch (error: any) {
      console.error('Erro ao verificar múltiplos jogos no banco de dados:', error.message);
      throw new Error('Erro ao verificar múltiplos jogos no banco de dados');
    }
  }

  async checkGameExists(gameId: string): Promise<boolean> {
    const gameName = nameNormalizer(gameId)
    const result = await this.db('games')
      .where('gameName', gameName)
      .count('* as count')
      .first();

      const count = result?.count ? Number(result.count) : 0;
      return count > 0;
  }

  async upsertEmulator(emulator: any): Promise<void> {
    try {
      if (Array.isArray(emulator.romExtensions)) {
        emulator.romExtensions = JSON.stringify(emulator.romExtensions);
        
        await this.db('emulators')
          .insert(emulator)
          .onConflict('id')
          .merge();
      }
    } catch (error: any) {
      console.error('Erro ao realizar upsert de emulador:', error.message);
      throw new Error('Erro ao realizar upsert de emulador');
    }
  }
  
  async upsertGame(game: Game): Promise<void> {
    game.gameName = nameNormalizer(game.gameName)
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

  async getAllEmulators(): Promise<Emulator[]> {
    try {
      const emulators = await this.db('emulators').select('*');
      return emulators;
    } catch (error: any) {
      console.error('Erro ao buscar todos os emuladores no banco de dados:', error.message);
      throw new Error('Erro ao buscar todos os emuladores');
    }
  }

  async getAllGames(): Promise<Game[]> {
    try {
      const games = await this.db('games').select('*');
      return games;
    } catch (error: any) {
      console.error('Erro ao buscar todos os games no banco de dados:', error.message);
      throw new Error('Erro ao buscar todos os games');
    }
  }

  async findEmulatorByName(emulatorName: string): Promise<Emulator | null> {
    try {
      const result = await this.db('emulators')
      .whereRaw('LOWER(emulatorName) = ?', [emulatorName.toLowerCase()])
      .first();

      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar o emulador no banco de dados: ${error.message}`);
    }
  }

  async getGameByName(gameId: string): Promise<Game> {
    const gameName = nameNormalizer(gameId)

    const result = await this.db('games')
      .where('gameName', gameName)
      .first();

      result.description = removeHtmlTags(result.description) 
    return result;
  }
}
