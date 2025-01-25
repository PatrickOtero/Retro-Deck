import { Emulator, Game } from '../../interfaces/interfaces';
import { DatabaseService } from './databaseService';
import log from "electron-log";

export class DatabaseController {
    private service: DatabaseService;

    constructor() {
        this.service = new DatabaseService();
    }

    async getAllEmulators(): Promise<Emulator[]> {
        try {
            const emulators = await this.service.getAllEmulators();
            return emulators;
        } catch (error: any) {
            console.error('Error fetching all emulators:', error.message);
            return [];
        }
    }

    async getAllGames(): Promise<Game[]> {
        try {
            const games = await this.service.getAllGames();
            return games;
        } catch (error: any) {
            console.error('Error fetching all games:', error.message);
            return [];
        }
    }

    async saveEmulator(emulatorName: string): Promise<{ message: string }> {

        log.info("saveEmulator executed");
        if (!emulatorName) {
            return { message: 'Emulator name is required' };
        }

        try {
            await this.service.saveEmulator(emulatorName);
            return { message: 'Emulator created successfully' };
        } catch (error: any) {
            console.error('Error saving emulator to the database:', error.message);
            return { message: 'Internal server error' };
        }
    }

    async saveOrUpdateGames(game: Game): Promise<{ message: string }[]> {
        try {
            await this.service.upsertGames(game);
            return [{ message: 'Game saved or updated successfully!' }];
        } catch (error: any) {
            console.error('Error saving or updating game:', error.message);
            return [{ message: 'Error saving or updating game.' }];
        }
    }

    async getEmulatorByName(emulatorName: string): Promise<Emulator | null> {
        log.info(`Fetching emulator by name: ${emulatorName}`);
        try {
            const emulator = await this.service.getEmulatorByName(emulatorName);
            if (!emulator) {
                log.warn(`Emulator not found: ${emulatorName}`);
            }
            return emulator;
        } catch (error: any) {
            log.error(`Error fetching emulator: ${error.message}`);
            return null;
        }
    }

    async getGameByName(gameId: string): Promise<Game | null> {
        log.info(`Fetching game with ID: ${gameId} from the local database...`);
        try {
            return await this.service.getGameByName(gameId);
        } catch (error: any) {
            console.error('Error fetching game:', error.message);
            return null;
        }
    }

    async checkEmulatorExists(emulatorId: string): Promise<boolean> {
        log.info("Executing 'checkEmulatorExists' in the local database");
        try {
            return await this.service.checkEmulatorExists(emulatorId);
        } catch (error: any) {
            console.error('Error checking emulator:', error.message);
            return false;
        }
    }

    async checkGamesExist(gameNames: string[]): Promise<string[]> {
        try {
            return await this.service.checkGamesExist(gameNames);
        } catch (error: any) {
            console.error('Error checking multiple games in the database:', error.message);
            return [];
        }
    }

    async checkGameExists(gameId: string): Promise<boolean> {
        log.info("Executing 'checkGameExists' in the local database");
        try {
            return await this.service.checkGameExists(gameId);
        } catch (error: any) {
            console.error('Error checking game:', error.message);
            return false;
        }
    }
}
