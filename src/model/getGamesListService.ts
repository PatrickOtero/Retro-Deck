import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Game, ApiResponse } from '../interfaces/interfaces';

export class GameListService {
  private romsPath: string;

  constructor() {
    this.romsPath = app.isPackaged
    ? path.join(process.resourcesPath, 'roms')
    : path.join(app.getAppPath(), 'roms');
  }

  async getGamesList(supportedExtensions: string[]): Promise<Game[]> {
    const files = fs.readdirSync(this.romsPath).filter(file => 
      supportedExtensions.some(ext => file.endsWith(ext))
    );

    const gameDataPromises = files.map(async (file) => {
      const romName = path.parse(file).name;

        try {
          const responseLocal = await axiosInstance.get<ApiResponse>(
            `/searchGamesLocalDb/${romName}`
          );

          if (responseLocal.data?.game?.gameName) {

            const game = responseLocal.data.game

            return {
              id: '',
              gameName: game.gameName,
              description: game.description,
              backgroundImage: game.backgroundImage,
              fileName: file,
            };
          }
      
        return {
          id: '',
          gameName: romName,
          description: 'Informações não disponíveis',
          backgroundImage: '',
          fileName: file,
        };
      } catch (error: any) {
        console.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
        return {
          id: '',
          gameName: romName,
          description: 'Erro ao buscar informações',
          backgroundImage: '',
          fileName: file,
        };
      }
    });

    return await Promise.all(gameDataPromises);
  }
}
