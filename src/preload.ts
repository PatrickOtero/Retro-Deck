import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getGames: () => ipcRenderer.invoke('get-games'),
  runGame: (gameName: string) => ipcRenderer.invoke('run-game', gameName),
  isEmulatorRunning: () => ipcRenderer.invoke('is-emulator-running'),
});
