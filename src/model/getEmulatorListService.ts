import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Emulator } from '../interfaces/interfaces';

export class EmulatorListService {
  private emulatorPath: string;

  constructor() {
    this.emulatorPath = path.join(app.getAppPath(), 'emulators');
  }

    async filterValidExecutables(files: string[]): Promise<string[]> {
      return files.filter(file => {
        const filePath = path.join(this.emulatorPath, file);
        const stats = fs.statSync(filePath);
    
        return stats.size > 2.5 * 1024 * 1024; 
      });
    }

  async getEmulatorList(): Promise<Emulator[] | { message: string }[]> {
    const files = fs.readdirSync(this.emulatorPath).filter(file =>
      file.endsWith('.exe')
    );
    
    const validExecutables = await this.filterValidExecutables(files);

    const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
      const emulatorName = path.parse(validExecutable).name;

        try {
          const response = await axiosInstance.get<any>(
            `/getEmulator/${emulatorName}`
          );

          if (!response.data.emulatorName) {
            return { message: response.data.message };
          }

        return response.data;

      } catch (error: any) {
        console.error(`Erro ao buscar o emulador ${emulatorName}:`, error.message);
        return { message: `Erro ao buscar o emulador: ${emulatorName}` };
      }
    });

    return await Promise.all(emulatorDataPromises);
  }
}
