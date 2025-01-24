import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import log from 'electron-log';
import { Emulator } from '../interfaces/interfaces';
import { DatabaseController } from './database/databaseController';

export class EmulatorListLocalService {
  private emulatorPath: string;
  private dbController: DatabaseController;

  constructor() {
    this.emulatorPath = app.isPackaged
      ? path.join(process.resourcesPath, 'emulators')
      : path.join(app.getAppPath(), 'emulators');

    this.dbController = new DatabaseController();
  }

  async filterValidExecutables(files: string[]): Promise<string[]> {
    log.info('Filtrando executáveis válidos na pasta de emuladores...');
    return files.filter((file) => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
      const isValid = stats.size > 2 * 1024 * 1024;
      log.info(`Arquivo analisado: ${file}, Tamanho: ${stats.size}, Válido: ${isValid}`);
      return isValid;
    });
  }

  async getLocalEmulatorList(): Promise<Emulator[]> {
    try {
      const files = fs.readdirSync(this.emulatorPath).filter((file) =>
        file.endsWith('.exe')
      );
      log.info(`Arquivos executáveis encontrados: ${files}`);

      const validExecutables = await this.filterValidExecutables(files);
      log.info(`Executáveis válidos: ${validExecutables}`);

      const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
        const emulatorName = path.parse(validExecutable).name;

        try {
          log.info(`Buscando informações do emulador no banco local: ${emulatorName}`);
          const emulator = await this.dbController.getEmulatorByName(emulatorName);

          if (!emulator) {
            log.warn(`Emulador não encontrado no banco local: ${emulatorName}`);
            return null;
          }

          emulator.romExtensions = JSON.parse(emulator.romExtensions);

          log.info(emulator.romExtensions)

          return emulator;
        } catch (error: any) {
          log.error(`Erro ao buscar o emulador ${emulatorName}: ${error.message}`);
          return null;
        }
      });

      const emulatorData = await Promise.all(emulatorDataPromises);

      log.info(emulatorData)
      
      return emulatorData.filter((emulator) => emulator !== null) as Emulator[];
    } catch (error: any) {
      log.error(`Erro ao listar emuladores: ${error.message}`);
      return [];
    }
  }
}
