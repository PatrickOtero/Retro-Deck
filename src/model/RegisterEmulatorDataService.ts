import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { DatabaseController } from './database/databaseController';

export class RegisterEmulatorService {
  private emulatorPath: string;
  private db: DatabaseController;

  constructor() {
    this.emulatorPath = app.isPackaged
    ? path.join(process.resourcesPath, 'emulators')
    : path.join(app.getAppPath(), 'emulators');

    this.db = new DatabaseController()
  }

  private checkEmulatorDirectoryExists(): boolean {
    return fs.existsSync(this.emulatorPath);
  }

  async filterValidExecutables(files: string[]): Promise<string[]> {
    return files.filter(file => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
  
      return stats.size > 2 * 1024 * 1024; 
    });
  }

  async registerEmulator(): Promise<{ message: string }[]> {
    if (!this.checkEmulatorDirectoryExists()) {
      return [{ message: 'The "emulators" folder does not exist. No emulator can be registered.' }];
    }
  
    const files = fs.readdirSync(this.emulatorPath).filter(file =>
      file.endsWith('.exe')
    );
    const validExecutables = await this.filterValidExecutables(files);
  
    const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
      const emulatorName = path.parse(validExecutable).name;
  
      try {
        const response = await this.db.saveEmulator(emulatorName);
        return response;

      } catch (error: any) {
        console.error(`Error registering emulator data ${emulatorName}:`, error.message);
        return { message: `Error registering emulator: ${emulatorName}` };
      }
    });
  
    return await Promise.all(emulatorDataPromises);
  }
}
