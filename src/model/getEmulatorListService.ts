import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Emulator } from '../interfaces/interfaces';
import log from "electron-log"

export class EmulatorListService {
  private emulatorPath: string;

  constructor() {
    this.emulatorPath = app.isPackaged
    ? path.join(process.resourcesPath, 'emulators')
    : path.join(app.getAppPath(), 'emulators');
  }

  async filterValidExecutables(files: string[]): Promise<string[]> {
    log.info('Filtrando executáveis válidos na pasta de emuladores...');
    return files.filter(file => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
      const isValid = stats.size > 2.5 * 1024 * 1024;
      log.info(`Arquivo analisado: ${file}, Tamanho: ${stats.size}, Válido: ${isValid}`);
      return isValid;
    });
  }

  async getEmulatorList(): Promise<Emulator[] | { message: string }[]> {
    try {
      const files = fs.readdirSync(this.emulatorPath).filter(file =>
        file.endsWith('.exe')
      );
      log.info(`Encontrados arquivos executáveis: ${files}`);
  
      const validExecutables = await this.filterValidExecutables(files);
      log.info(`Executáveis válidos: ${validExecutables}`);
  
      const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
        const emulatorName = path.parse(validExecutable).name;
        try {
          log.info(`Buscando informações do emulador: ${emulatorName}`);
          const response = await axiosInstance.get<any>(
            `/getEmulator/${emulatorName}`
          );
  
          if (!response.data.emulatorName) {
            log.warn(`Dados incompletos para o emulador ${emulatorName}`);
            return { message: response.data.message };
          }
  
          return response.data;
        } catch (error: any) {
          log.error(`Erro ao buscar o emulador ${emulatorName}: ${error.message}`);
          return { message: `Erro ao buscar o emulador: ${emulatorName}` };
        }
      });
  
      return await Promise.all(emulatorDataPromises);
    } catch (error: any) {
      log.error(`Erro ao listar emuladores: ${error.message}`);
      return [{ message: 'Erro ao listar emuladores.' }];
    }
  }
}
