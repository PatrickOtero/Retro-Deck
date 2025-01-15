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


  async registerEmulator(): Promise<{ message: string }[]> {
    const files = fs.readdirSync(this.emulatorPath).filter(file =>
      file.endsWith('.exe')
    );

    console.log(files)

    const emulatorDataPromises = files.map(async (file) => {
      const emulatorName = path.parse(file).name;

      console.log(emulatorName)

        try {
          const response = await axiosInstance.post<{ message: string }>(
            `/saveEmulator`,
            { emulatorName }
          );

          console.log(response.data)

        return { message: response.data.message };

      } catch (error: any) {
        console.error(`Erro ao registrar dados do emulador ${emulatorName}:`, error.message);
        return { message: `Erro ao registrar o emulador: ${emulatorName}` };
      }
    });

    return await Promise.all(emulatorDataPromises);
  }
}
