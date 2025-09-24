// Storage interface placeholder for AI Dungeon Master
// Future implementation will handle web IndexedDB and mobile SQLite

export interface StorageDriver {
  initialize(): Promise<void>;
  close(): Promise<void>;
}

// Minimal storage manager placeholder
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
}

// Simple placeholder driver
export class MockStorageDriver implements StorageDriver {
  async initialize(): Promise<void> {
    // Mock initialization
  }

  async close(): Promise<void> {
    // Mock close
  }
}