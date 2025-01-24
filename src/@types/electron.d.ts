import { Emulator } from "src/interfaces/interfaces";
import { Game } from "src/interfaces/interfaces";

declare global {
    interface Window {
      electronAPI: {
        searchAndSaveGames: (supportedExtensions: string[]) => Promise<{ message: string }[]>;
        getGames: (supportedExtensions: string[]) => Promise<Game[]>;
        runGame: (gameName: string, emulatorName: string) => Promise<{ success: true, message: 'Jogo iniciado.' }>;
        getLocalEmulator: () => Promise<Emulator[]>;
        registerEmulator: () => Promise<{ message: string }[]>;
        isEmulatorRunning: () => Promise<boolean>;
        checkForNewExecutables: () => Promise<string[]>;
        registerNewExecutables: (executables: string[]) => Promise<void>;
        checkIfRomsExist: () => Promise<{ message: string }>;
        getLocalGames: (supportedExtensions: string[]) => Promise<Game[]>;
        checkForNewRoms: () => Promise<{ hasNewRoms: boolean, romStatus: { [key: string]: string } }>;
      };
    }
  }
  export {};
  