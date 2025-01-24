import { Emulator, Game } from '../../interfaces/interfaces';
import { DatabaseService } from './databaseService';
import log from "electron-log";

export class DatabaseController {
    private service: DatabaseService;

    constructor() {
      this.service = new DatabaseService();
    }

    async getAllEmulators(): Promise<Emulator[]> {
      try {
        const emulators = await this.service.getAllEmulators();
        return emulators;
      } catch (error: any) {
        console.error('Erro ao buscar todos os emuladores:', error.message);
        return [];
      }
    }

    async getAllGames(): Promise<Game[]> {
      try {
        const games = await this.service.getAllGames();
        return games;
      } catch (error: any) {
        console.error('Erro ao buscar todos os games:', error.message);
        return [];
      }
    }

    async saveEmulator(emulatorName: string): Promise<{ message: string }> {

      log.info("saveEmulator executado")
      if (!emulatorName) {
        return { message: 'Emulator name is required' };
      }

      try {
        await this.service.saveEmulator(emulatorName);
        return { message: 'Emulator created successfully' };
      } catch (error: any) {
        console.error('Erro ao salvar o emulador no banco de dados:', error.message);
        return { message: 'Internal server error' };
      }
    }
      
      async saveOrUpdateGames(game: Game): Promise<{ message: string }[]> {
        try {
          await this.service.upsertGames(game);
          return [{ message: 'Jogo salvo ou atualizado com sucesso!' }];
        } catch (error: any) {
          console.error('Erro ao salvar ou atualizar jogo:', error.message);
          return [{ message: 'Erro ao salvar ou atualizar jogo.' }];
        }
      }

      async getEmulatorByName(emulatorName: string): Promise<Emulator | null> {
        log.info(`Buscando emulador pelo nome: ${emulatorName}`);
        try {
          const emulator = await this.service.getEmulatorByName(emulatorName);
          if (!emulator) {
            log.warn(`Emulador não encontrado: ${emulatorName}`);
          }
          return emulator;
        } catch (error: any) {
          log.error(`Erro ao obter emulador: ${error.message}`);
          return null;
        }
      }

  async getGameByName(gameId: string): Promise<Game | null> {
    log.info(`Buscando jogo com ID: ${gameId} no banco de dados local...`);
    try {
      return await this.service.getGameByName(gameId);
    } catch (error: any) {
      console.error('Erro ao obter jogo:', error.message);
      return null;
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
