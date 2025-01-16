import { contextBridge, ipcRenderer } from 'electron';
import { Emulator, Game } from './interfaces/interfaces';

contextBridge.exposeInMainWorld('electronAPI', {
  searchAndSaveGames: (supportedExtensions: string[]): Promise<{ message: string }[]> => ipcRenderer.invoke('search-and-save-games', supportedExtensions),
  getGames: (supportedExtensions: string[]): Promise<Game[]> => ipcRenderer.invoke('get-games', supportedExtensions),
  runGame: (gameName: string, emulatorName: string) => ipcRenderer.invoke('run-game', gameName, emulatorName),
  getEmulator: (): Promise<Emulator[] | {message: string}[]> => ipcRenderer.invoke('get-emulator'),
  registerEmulator: (): Promise<{message: string}[]> => ipcRenderer.invoke('register-emulator'),
  isEmulatorRunning: () => ipcRenderer.invoke('is-emulator-running'),
});
