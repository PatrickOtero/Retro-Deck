import * as fs from 'fs';
import * as path from 'path';
import { DatabaseController } from './database/databaseController';
import { app } from 'electron';

export class CheckForNewExecutablesService {
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

  async checkForNewExecutables(): Promise<string[]> {
    if (!this.checkEmulatorDirectoryExists()) return [];
  
    const files = fs.readdirSync(this.emulatorPath).filter(file => file.endsWith('.exe'));
    const validExecutables = await this.filterValidExecutables(files);
  
    const registeredEmulators = await this.db.getAllEmulators();
    const newExecutables = validExecutables.filter(exe =>
      !registeredEmulators.some((emulator: any) =>
        emulator?.name?.toLowerCase() === path.parse(exe).name.toLowerCase()
      )
    );
  
    return newExecutables;
  }
}
