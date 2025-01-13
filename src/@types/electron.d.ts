declare global {
    interface Window {
      electronAPI: {
        getGames: () => Promise<any[]>;
        runGame: (gameName: string) => Promise<{ success: true, message: 'Jogo iniciado.' }>;
        isEmulatorRunning: () => Promise<boolean>;
      };
    }
  }
  export {};
  