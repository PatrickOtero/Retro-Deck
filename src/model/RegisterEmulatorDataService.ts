import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';

export class RegisterEmulatorService {
  private emulatorPath: string;

  constructor() {
    this.emulatorPath = path.join(app.getAppPath(), 'emulators');
    console.log(this.emulatorPath)
  }

  async filterValidExecutables(files: string[]): Promise<string[]> {
    return files.filter(file => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
  
      return stats.size > 3 * 1024 * 1024; 
    });
  }

  async registerEmulator(): Promise<{ message: string }[]> {
    const files = fs.readdirSync(this.emulatorPath).filter(file =>
      file.endsWith('.exe')
    );
    const validExecutables = await this.filterValidExecutables(files);

    const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
      const emulatorName = path.parse(validExecutable).name;

      try {
        const response = await axiosInstance.post<{ message: string }>(
          `/saveEmulator`,
          { emulatorName }
        );
        
        return { message: response.data.message };

      } catch (error: any) {
        console.error(`Erro ao registrar dados do emulador ${emulatorName}:`, error.message);
        return { message: `Erro ao registrar o emulador: ${emulatorName}` };
      }
    });

    return await Promise.all(emulatorDataPromises);
  }
}
