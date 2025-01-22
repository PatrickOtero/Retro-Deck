import { Emulator, Game } from '../../interfaces/interfaces';
import { DatabaseService } from './databaseService';
import log from "electron-log";

export class DatabaseController {
    private service: DatabaseService;

    constructor() {
      this.service = new DatabaseService();
    }

    async saveOrUpdateEmulators(emulators: Emulator[]): Promise<{ message: string }[]> {
        try {
          await this.service.upsertEmulators(emulators);
          return [{ message: 'Emuladores salvos ou atualizados com sucesso!' }];
        } catch (error: any) {
          console.error('Erro ao salvar ou atualizar emuladores:', error.message);
          return [{ message: 'Erro ao salvar ou atualizar emuladores.' }];
        }
      }
      
      async saveOrUpdateGames(games: Game[]): Promise<{ message: string }[]> {
        try {
          await this.service.upsertGames(games);
          return [{ message: 'Jogos salvos ou atualizados com sucesso!' }];
        } catch (error: any) {
          console.error('Erro ao salvar ou atualizar jogos:', error.message);
          return [{ message: 'Erro ao salvar ou atualizar jogos.' }];
        }
      }

  async getEmulators(): Promise<Emulator[]> {
    log.info("Função 'getEmulators' do banco de dados local do app sendo executada");
    try {
      return await this.service.getEmulators();
    } catch (error: any) {
      console.error('Erro ao obter emuladores:', error.message);
      return [];
    }
  }

  async getGames(): Promise<Game[]> {
    log.info("Função 'getGames' do banco de dados local do app sendo executada");
    try {
      return await this.service.getGames();
    } catch (error: any) {
      console.error('Erro ao obter jogos:', error.message);
      return [];
    }
  }

  async checkEmulatorExists(emulatorId: string): Promise<boolean> {
    log.info("Função 'checkEmulatorExists' do banco de dados local do app sendo executada");
    try {
      return await this.service.checkEmulatorExists(emulatorId);
    } catch (error: any) {
      console.error('Erro ao verificar emulador:', error.message);
      return false;
    }
  }

  async checkGameExists(gameId: string): Promise<boolean> {
    log.info("Função 'checkGameExists' do banco de dados local do app sendo executada");
    try {
      return await this.service.checkGameExists(gameId);
    } catch (error: any) {
      console.error('Erro ao verificar jogo:', error.message);
      return false;
    }
  }
}
