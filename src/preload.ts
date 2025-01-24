import { contextBridge, ipcRenderer } from 'electron';
import { Emulator, Game } from './interfaces/interfaces';

contextBridge.exposeInMainWorld('electronAPI', {
  searchAndSaveGames: (supportedExtensions: string[]): Promise<{ message: string }[]> => ipcRenderer.invoke('search-and-save-games', supportedExtensions),
  getGames: (supportedExtensions: string[]): Promise<Game[]> => ipcRenderer.invoke('get-games', supportedExtensions),
  runGame: (gameName: string, emulatorName: string) => ipcRenderer.invoke('run-game', gameName, emulatorName),
  getLocalEmulator: (): Promise<Emulator[] | {message: string}[]> => ipcRenderer.invoke('get-local-emulator'),
  registerEmulator: (): Promise<{message: string}[]> => ipcRenderer.invoke('register-emulator'),
  isEmulatorRunning: () => ipcRenderer.invoke('is-emulator-running'),
  checkForNewExecutables: (): Promise<string[]> => ipcRenderer.invoke('check-for-new-executables'),
  registerNewExecutables: (executables: string[]): Promise<void> => ipcRenderer.invoke('register-new-executables', executables),
  checkIfRomsExist: (): Promise<{ message: string }> => ipcRenderer.invoke('check-if-roms-exist'),
  getLocalGames: (supportedExtensions: string[]): Promise<Game[]> => ipcRenderer.invoke('get-local-games', supportedExtensions),
  checkForNewRoms: () => Promise<{ hasNewRoms: boolean, romStatus: { [key: string]: string } }>
});
