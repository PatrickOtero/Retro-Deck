import { Emulator } from "src/interfaces/interfaces";
import { Game } from "src/interfaces/interfaces";

declare global {
    interface Window {
      electronAPI: {
        searchAndSaveGames: (supportedExtensions: string[]) => Promise<{ message: string }[]>;
        getGames: (supportedExtensions: string[]) => Promise<Game[]>;
        runGame: (gameName: string, emulatorName: string) => Promise<{ success: true, message: 'Jogo iniciado.' }>;
        getEmulator: () => Promise<Emulator[]>;
        registerEmulator: () => Promise<{ message: string }[]>;
        isEmulatorRunning: () => Promise<boolean>;
      };
    }
  }
  export {};
  