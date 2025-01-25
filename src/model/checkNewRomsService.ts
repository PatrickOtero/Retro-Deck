import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { DatabaseController } from './database/databaseController';
import log from "electron-log";

export class CheckNewRomService {
  private romsPath: string;
  private dbController: DatabaseController;

  constructor() {
    this.romsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'roms')
      : path.join(app.getAppPath(), 'roms');

    this.dbController = new DatabaseController();
  }

  async checkForNewRomsAndValidate(): Promise<{ hasNewRoms: boolean, romStatus: { [key: string]: string } }> {
    try {
      const files = fs.readdirSync(this.romsPath);

      const romStatus: { [key: string]: string } = {};

      const romsPromises = files.map(async (file) => {
        const romName = path.parse(file).name;
        const existsInDb = await this.dbController.checkGameExists(romName);
        
        if (!existsInDb) {
          romStatus[romName] = 'Nova ROM encontrada, não registrada no banco de dados.';
        } else {
          romStatus[romName] = 'ROM já registrada no banco de dados.';
        }
      });

      await Promise.all(romsPromises);

      const hasNewRoms = Object.values(romStatus).some(status => status.includes('Nova ROM'));

      log.info(hasNewRoms)

      return { hasNewRoms, romStatus };
    } catch (error: any) {
      log.error("Erro ao verificar ROMs:", error.message);
      return { hasNewRoms: false, romStatus: {} };
    }
  }
}