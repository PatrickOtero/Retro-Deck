import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import axiosInstance from '../utils/axiosInstace';
import { Game, ApiResponse } from '../interfaces/interfaces';

export class GameListService {
  private romsPath: string;

  constructor() {
    this.romsPath = path.join(app.getAppPath(), 'roms');
  }

  async getGamesList(supportedExtensions: string[]): Promise<Game[]> {
    const files = fs.readdirSync(this.romsPath).filter(file => 
      supportedExtensions.some(ext => file.endsWith(ext))
    );

    const gameDataPromises = files.map(async (file) => {
      const romName = path.parse(file).name;

      try {
        let game: Game | null = null;

        try {
          const responseLocal = await axiosInstance.get<ApiResponse>(
            `/searchGamesLocalDb/${romName}`
          );

          if (responseLocal.data?.game?.gameName) {
            game = { ...responseLocal.data.game, fileName: file };
          }
        } catch (localError: any) {
          console.warn(`Jogo ${romName} não encontrado no banco local:`, localError.message);
        }

        if (!game) {
          try {
            const responseRawg = await axiosInstance.get<ApiResponse>(
              `/games/${romName}`
            );

            if (responseRawg.data?.game?.gameName) {
              game = { ...responseRawg.data.game, fileName: file };
            }
          } catch (rawgError: any) {
            console.warn(`Jogo ${romName} não encontrado na RAWG API:`, rawgError.message);
          }
        }

        if (game) {
          return game;
        }

        return {
          id: '',
          gameName: romName,
          description: 'Informações não disponíveis',
          backgroundImage: '',
          createdAt: new Date().toISOString(),
          emulators: [],
          fileName: file,
        };
      } catch (error: any) {
        console.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
        return {
          id: '',
          gameName: romName,
          description: 'Erro ao buscar informações',
          backgroundImage: '',
          createdAt: new Date().toISOString(),
          emulators: [],
          fileName: file,
        };
      }
    });

    return await Promise.all(gameDataPromises);
  }
}
