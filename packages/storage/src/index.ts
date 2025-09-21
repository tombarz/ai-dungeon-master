import { GameSession, Character, Encounter } from "@ai-dungeon-master/models";

// Storage interface
export interface StorageDriver {
  initialize(): Promise<void>;
  close(): Promise<void>;
  
  // Game sessions
  saveGameSession(session: GameSession): Promise<void>;
  getGameSession(id: string): Promise<GameSession | null>;
  getAllGameSessions(): Promise<GameSession[]>;
  deleteGameSession(id: string): Promise<void>;
  
  // Characters
  saveCharacter(character: Character): Promise<void>;
  getCharacter(id: string): Promise<Character | null>;
  getAllCharacters(): Promise<Character[]>;
  deleteCharacter(id: string): Promise<void>;
  
  // Encounters
  saveEncounter(encounter: Encounter): Promise<void>;
  getEncounter(id: string): Promise<Encounter | null>;
  getAllEncounters(): Promise<Encounter[]>;
  deleteEncounter(id: string): Promise<void>;
}

// Storage manager - main interface
export class StorageManager {
  private driver: StorageDriver;

  constructor(driver: StorageDriver) {
    this.driver = driver;
  }

  async initialize(): Promise<void> {
    await this.driver.initialize();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  // Game session operations
  async saveGameSession(session: GameSession): Promise<void> {
    await this.driver.saveGameSession(session);
  }

  async getGameSession(id: string): Promise<GameSession | null> {
    return await this.driver.getGameSession(id);
  }

  async getAllGameSessions(): Promise<GameSession[]> {
    return await this.driver.getAllGameSessions();
  }

  async deleteGameSession(id: string): Promise<void> {
    await this.driver.deleteGameSession(id);
  }

  // Character operations
  async saveCharacter(character: Character): Promise<void> {
    await this.driver.saveCharacter(character);
  }

  async getCharacter(id: string): Promise<Character | null> {
    return await this.driver.getCharacter(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return await this.driver.getAllCharacters();
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.driver.deleteCharacter(id);
  }

  // Encounter operations
  async saveEncounter(encounter: Encounter): Promise<void> {
    await this.driver.saveEncounter(encounter);
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    return await this.driver.getEncounter(id);
  }

  async getAllEncounters(): Promise<Encounter[]> {
    return await this.driver.getAllEncounters();
  }

  async deleteEncounter(id: string): Promise<void> {
    await this.driver.deleteEncounter(id);
  }
}

// Web IndexedDB driver
export class IndexedDBDriver implements StorageDriver {
  private db: IDBDatabase | null = null;
  private dbName = "ai-dungeon-master";
  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains("gameSessions")) {
          db.createObjectStore("gameSessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("characters")) {
          db.createObjectStore("characters", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("encounters")) {
          db.createObjectStore("encounters", { keyPath: "id" });
        }
      };
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.transaction([storeName], mode).objectStore(storeName);
  }

  async saveGameSession(session: GameSession): Promise<void> {
    const store = await this.getStore("gameSessions", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getGameSession(id: string): Promise<GameSession | null> {
    const store = await this.getStore("gameSessions");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllGameSessions(): Promise<GameSession[]> {
    const store = await this.getStore("gameSessions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteGameSession(id: string): Promise<void> {
    const store = await this.getStore("gameSessions", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveCharacter(character: Character): Promise<void> {
    const store = await this.getStore("characters", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(character);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCharacter(id: string): Promise<Character | null> {
    const store = await this.getStore("characters");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCharacters(): Promise<Character[]> {
    const store = await this.getStore("characters");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCharacter(id: string): Promise<void> {
    const store = await this.getStore("characters", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveEncounter(encounter: Encounter): Promise<void> {
    const store = await this.getStore("encounters", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(encounter);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    const store = await this.getStore("encounters");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEncounters(): Promise<Encounter[]> {
    const store = await this.getStore("encounters");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEncounter(id: string): Promise<void> {
    const store = await this.getStore("encounters", "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Mock driver for development/testing
export class MockStorageDriver implements StorageDriver {
  private data: {
    gameSessions: Map<string, GameSession>;
    characters: Map<string, Character>;
    encounters: Map<string, Encounter>;
  } = {
    gameSessions: new Map(),
    characters: new Map(),
    encounters: new Map(),
  };

  async initialize(): Promise<void> {
    // Mock initialization
  }

  async close(): Promise<void> {
    // Mock close
  }

  async saveGameSession(session: GameSession): Promise<void> {
    this.data.gameSessions.set(session.id, session);
  }

  async getGameSession(id: string): Promise<GameSession | null> {
    return this.data.gameSessions.get(id) || null;
  }

  async getAllGameSessions(): Promise<GameSession[]> {
    return Array.from(this.data.gameSessions.values());
  }

  async deleteGameSession(id: string): Promise<void> {
    this.data.gameSessions.delete(id);
  }

  async saveCharacter(character: Character): Promise<void> {
    this.data.characters.set(character.id, character);
  }

  async getCharacter(id: string): Promise<Character | null> {
    return this.data.characters.get(id) || null;
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.data.characters.values());
  }

  async deleteCharacter(id: string): Promise<void> {
    this.data.characters.delete(id);
  }

  async saveEncounter(encounter: Encounter): Promise<void> {
    this.data.encounters.set(encounter.id, encounter);
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    return this.data.encounters.get(id) || null;
  }

  async getAllEncounters(): Promise<Encounter[]> {
    return Array.from(this.data.encounters.values());
  }

  async deleteEncounter(id: string): Promise<void> {
    this.data.encounters.delete(id);
  }
}
