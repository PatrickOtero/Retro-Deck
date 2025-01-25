import * as path from 'path';
import { DatabaseController } from './database/databaseController';
import { app } from 'electron';
import fs from "fs"
import log from "electron-log"

export class RegisterNewExecutablesService {
  private emulatorPath: string;
  private db: DatabaseController;

  constructor() {
    this.emulatorPath = app.isPackaged
      ? path.join(process.resourcesPath, 'emulators')
      : path.join(app.getAppPath(), 'emulators');
    this.db = new DatabaseController();
  }

  private checkEmulatorDirectoryExists(): boolean {
    return fs.existsSync(this.emulatorPath);
  }

  private async filterValidExecutables(files: string[]): Promise<string[]> {
    return files.filter(file => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
  
      return stats.size > 2 * 1024 * 1024;
    });
  }

  async registerNewExecutables(executables: string[]): Promise<void> {
    if (!this.checkEmulatorDirectoryExists()) {
      throw new Error('Emulator directory does not exist.');
    }
  
    const validExecutables = await this.filterValidExecutables(executables);
    
    for (const executable of validExecutables) {
      const emulatorName = path.parse(executable).name;
  
      const existingEmulator = await this.db.getEmulatorByName(emulatorName);
      if (existingEmulator) {
        log.info(`Emulador já registrado: ${emulatorName}`);
        continue;
      }
      
      await this.db.saveEmulator(emulatorName);
    }
  }
}
