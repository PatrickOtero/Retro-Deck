export interface Game {
    id: string;
    gameName: string;
    description: string;
    backgroundImage: string;
    createdAt?: string;
    fileName?: string | null | undefined;
  }

  export interface Emulator {
    id: string;
    emulatorName: string;
    romExtensions: string[];
    createdAt?: string;
  }

  export interface ApiResponse {
    game: Game;
    localDb: boolean;
  }