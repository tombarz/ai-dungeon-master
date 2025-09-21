# Storage Package

Storage interface and drivers for web IndexedDB and mobile SQLite.

## Overview

This package provides a unified storage interface that works across both web and mobile platforms. It includes:

- Abstract storage interface
- IndexedDB driver for web browsers
- Mock driver for development/testing
- Future SQLite driver for mobile

## Key Interfaces

### StorageDriver
Abstract interface for storage operations:
- `initialize()` - Initialize the storage system
- `close()` - Close storage connections
- `saveGameSession(session)` - Save game session data
- `getGameSession(id)` - Retrieve game session
- `getAllGameSessions()` - Get all game sessions
- `deleteGameSession(id)` - Remove game session

Similar methods exist for `Character` and `Encounter` entities.

## Key Classes

### StorageManager
Main interface that wraps storage drivers:
- Provides a unified API regardless of underlying storage
- Handles initialization and cleanup
- Manages all CRUD operations for game data

### IndexedDBDriver
Web browser storage implementation:
- Uses IndexedDB for persistent storage
- Handles database creation and migrations
- Provides async/await interface for all operations

### MockStorageDriver
Development/testing implementation:
- In-memory storage using Maps
- No persistence between sessions
- Useful for testing and development

## Usage

```typescript
import { 
  StorageManager, 
  IndexedDBDriver, 
  MockStorageDriver 
} from "@ai-dungeon-master/storage";

// Web usage
const webDriver = new IndexedDBDriver();
const storage = new StorageManager(webDriver);

await storage.initialize();

// Save game session
await storage.saveGameSession(gameSession);

// Retrieve game session
const session = await storage.getGameSession("session-id");

// Development/testing usage
const mockDriver = new MockStorageDriver();
const mockStorage = new StorageManager(mockDriver);

await mockStorage.initialize();
// ... use same API
```

## Platform Support

### Web (IndexedDB)
- Persistent storage in browser
- Handles database creation and versioning
- Works offline once initialized

### Mobile (Future SQLite)
- Local SQLite database
- Offline-first storage
- High performance for complex queries

### Development (Mock)
- In-memory storage
- No persistence
- Fast for testing

## Data Structure

All stored data follows the types defined in `@ai-dungeon-master/models`:

- **Game Sessions**: Complete game state with players and encounters
- **Characters**: Player characters with stats, inventory, and progression
- **Encounters**: Predefined encounters with enemies and rewards

## Dependencies

- `@ai-dungeon-master/models` - For data type definitions
