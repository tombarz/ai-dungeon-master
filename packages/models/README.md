# Models Package

Core domain types and Zod schemas for the AI Dungeon Master application.

## Overview

This package contains all the fundamental types and interfaces used throughout the application, including:

- Character and player data structures
- Game session management
- Encounter and combat definitions
- AI dungeon master responses
- Item and inventory management

## Key Types

### Character Types
- `Character` - Complete character definition with stats, class, and inventory
- `CharacterClass` - Class definitions with hit dice and abilities
- `CharacterStats` - Six core ability scores

### Game Types
- `GameSession` - Active game session with players and state
- `Player` - Player within a game session
- `GameState` - Current state of the game (lobby, combat, etc.)

### Encounter Types
- `Encounter` - Combat or story encounters
- `Enemy` - Enemy definitions with stats and abilities
- `Reward` - Experience, gold, and item rewards

### AI Types
- `DungeonMasterAction` - Actions the AI can take
- `AIResponse` - Structured AI responses with confidence scores

## Usage

```typescript
import { Character, GameSession, Encounter } from "@ai-dungeon-master/models";

// Create a new character
const character: Character = {
  id: "char-1",
  name: "Aragorn",
  level: 5,
  class: fighterClass,
  stats: { strength: 16, dexterity: 14, /* ... */ },
  inventory: []
};

// Create a game session
const session: GameSession = {
  id: "session-1",
  name: "The Lost Mines",
  players: [{ id: "p1", userId: "user-1", character, isActive: true }],
  gameState: GameState.LOBBY,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## Dependencies

- `zod` - Runtime type validation and parsing
