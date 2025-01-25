import { Emulator } from "src/interfaces/interfaces";
import { Game } from "src/interfaces/interfaces";

declare global {
    interface Window {
      electronAPI: {
        getGames: (supportedExtensions: string[]) => Promise<Game[]>;
        runGame: (gameName: string, emulatorName: string) => Promise<{ success: true, message: 'Jogo iniciado.' }>;
        getLocalEmulator: () => Promise<Emulator[]>;
        registerEmulator: () => Promise<{ message: string }[]>;
        isEmulatorRunning: () => Promise<boolean>;
        checkForNewExecutables: () => Promise<string[]>;
        registerNewExecutables: (executables: string[]) => Promise<void>;
      };
    }
  }
  export {};
  