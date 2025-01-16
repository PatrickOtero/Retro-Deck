import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';

export class SearchOnRawgAndSaveOnDb {
  private romsPath: string;

  constructor() {
    this.romsPath = path.join(app.getAppPath(), 'roms');
  }

  async searchOnRawgAndSaveOnDb(
    supportedExtensions: string[]
  ): Promise<{ message: string }[]> {
    const files = fs.readdirSync(this.romsPath).filter(file =>
      supportedExtensions.some(ext => file.endsWith(ext))
    );

    const gameDataPromises = files.map(async file => {
      const romName = path.parse(file).name;

      try {
        await axiosInstance.get<{ message: string }>(
          `/games/${romName}`
        );

        return { message: `Game info for ${romName} found and saved.` };
      } catch (error: any) {
        console.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
        return { message: `Error saving game info for ${romName}.` };
      }
    });

    return Promise.all(gameDataPromises);
  }
}