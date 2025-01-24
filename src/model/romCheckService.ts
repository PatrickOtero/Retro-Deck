import { DatabaseController } from './database/databaseController';

export class RomCheckService {
  private dbController: DatabaseController;

  constructor() {
    this.dbController = new DatabaseController();
  }

  async checkIfRomsExist(): Promise<{ message: string }> {
    try {
      const games = await this.dbController.getAllGames();
      if (games.length > 0) {
        return { message: 'Existem ROMs no banco de dados local.' };
      }
      return { message: 'Não existem ROMs no banco de dados local.' };
    } catch (error: any) {
      console.error('Erro ao verificar ROMs no banco de dados local:', error.message);
      return { message: 'Erro ao verificar ROMs no banco de dados local.' };
    }
  }
}