import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export class GameModel {
  private romsPath: string;

  constructor() {
    this.romsPath = path.join(app.getAppPath(), 'roms'); 
  }

  async getGamesList(): Promise<any[]> {
    const files = fs.readdirSync(this.romsPath).filter(file =>
      file.endsWith('.bin') || file.endsWith('.smd') || file.endsWith('.md')
    );

    console.log('Roms path:', this.romsPath);
    console.log('Filtered ROMs:', files);

    
    const gameDataPromises = files.map(async (file) => {
      const romName = path.parse(file).name;

      try {
        
        const responseLocal = await axios.get(`http://localhost:3000/games/local/${romName}`);

        if (responseLocal.status === 201 && responseLocal.data) {
          
          return {
            fileName: file,
            name: responseLocal.data.game.name,
            description: responseLocal.data.game.description,
            backgroundImage: responseLocal.data.game.background_image,
          };
        } else {
          
          const responseRawg = await axios.get(`http://localhost:3000/games/${romName}`);

          if (responseRawg.status === 201 && responseRawg.data) {
            return {
              fileName: file,
              name: responseRawg.data.game.name,
              description: responseRawg.data.game.description,
              backgroundImage: responseRawg.data.game.background_image,
            };
          }
        }

        return {
          fileName: file,
          name: romName,
          description: 'Informações não disponíveis',
          backgroundImage: null,
        };
      } catch (error: any) {
        console.error(`Erro ao buscar dados do jogo ${romName}:`, error.message);
        
        return {
          fileName: file,
          name: romName,
          description: 'Informações não disponíveis',
          backgroundImage: null,
        };
      }
    });
 
    return await Promise.all(gameDataPromises);
  }

  getGamePath(gameName: string): string {
    return path.join(this.romsPath, gameName);
  }
}
