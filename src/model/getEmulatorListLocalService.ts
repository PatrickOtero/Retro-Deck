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
    log.info('Filtering valid executables in emulators folder...');
    return files.filter((file) => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
      const isValid = stats.size > 2 * 1024 * 1024;
      log.info(`File analyzed: ${file}, Size: ${stats.size}, Valid: ${isValid}`);
      return isValid;
    });
  }

  async getLocalEmulatorList(): Promise<Emulator[]> {
    try {
      const files = fs.readdirSync(this.emulatorPath).filter((file) =>
        file.endsWith('.exe')
      );
      log.info(`Executable files found: ${files}`);

      const validExecutables = await this.filterValidExecutables(files);
      log.info(`Valid executables: ${validExecutables}`);

      const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
        const emulatorName = path.parse(validExecutable).name;

        try {
          log.info(`Fetching emulator information from local database ${emulatorName}`);
          const emulator = await this.dbController.getEmulatorByName(emulatorName);

          if (!emulator) {
            log.warn(`Emulator not found in local database: ${emulatorName}`);
            return null;
          }

          emulator.romExtensions = JSON.parse(emulator.romExtensions);

          log.info(emulator.romExtensions)

          return emulator;
        } catch (error: any) {
          log.error(`Error searching for emulator ${emulatorName}: ${error.message}`);
          return null;
        }
      });

      const emulatorData = await Promise.all(emulatorDataPromises);

      log.info(emulatorData)
      
      return emulatorData.filter((emulator) => emulator !== null) as Emulator[];
    } catch (error: any) {
      log.error(`Error listing emulators: ${error.message}`);
      return [];
    }
  }
}
