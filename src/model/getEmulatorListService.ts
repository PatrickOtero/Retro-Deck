import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Emulator } from '../interfaces/interfaces';
import log from "electron-log";
import { DatabaseController } from './database/databaseController';

export class EmulatorListService {
  private emulatorPath: string;
  private dbController: DatabaseController;

  constructor() {
    this.emulatorPath = app.isPackaged
      ? path.join(process.resourcesPath, 'emulators')
      : path.join(app.getAppPath(), 'emulators');
    
    this.dbController = new DatabaseController();
  }

  async filterValidExecutables(files: string[]): Promise<string[]> {
    log.info('Filtering valid executables in the emulators folder...');
    return files.filter(file => {
      const filePath = path.join(this.emulatorPath, file);
      const stats = fs.statSync(filePath);
      const isValid = stats.size > 2.5 * 1024 * 1024;
      log.info(`Analyzed file: ${file}, Size: ${stats.size}, Valid: ${isValid}`);
      return isValid;
    });
  }

  async getEmulatorList(): Promise<Emulator[] | { message: string }[]> {
    try {
      const files = fs.readdirSync(this.emulatorPath).filter(file =>
        file.endsWith('.exe')
      );
      log.info(`Executable files found: ${files}`);
  
      const validExecutables = await this.filterValidExecutables(files);
      log.info(`Valid executables: ${validExecutables}`);
  
      const emulatorDataPromises = validExecutables.map(async (validExecutable) => {
        const emulatorName = path.parse(validExecutable).name;
  
        try {
          log.info(`Fetching emulator information: ${emulatorName}`);
          const response = await axiosInstance.get<any>(`/getEmulator/${emulatorName}`);
  
          if (!response.data.emulatorName) {
            log.warn(`Incomplete data for emulator ${emulatorName}`);
            return { message: response.data.message };
          }
  
          await this.dbController.saveEmulator(emulatorName);
  
          return response.data;
        } catch (error: any) {
          log.error(`Error fetching emulator ${emulatorName}: ${error.message}`);
          return { message: `Error fetching emulator: ${emulatorName}` };
        }
      });
  
      return await Promise.all(emulatorDataPromises);
    } catch (error: any) {
      log.error(`Error listing emulators: ${error.message}`);
      return [{ message: 'Error listing emulators.' }];
    }
  }  
}
