# Orchestrator Package

AI agent contracts and orchestration logic for the AI Dungeon Master.

## Overview

This package provides the interface and orchestration logic for AI-powered dungeon master functionality. It includes:

- AI provider interfaces for different AI services
- Dungeon master agent contracts
- Game orchestration and flow management
- Mock implementations for development

## Key Interfaces

### AIProvider
Abstract interface for AI services:
- `generateResponse(prompt, context)` - Generate text responses
- `generateStructuredResponse<T>(prompt, schema, context)` - Generate structured responses

### DungeonMasterAgent
Interface for AI dungeon master behavior:
- `processGameState(session)` - Process current game state
- `respondToPlayerAction(session, playerAction)` - Respond to player actions
- `generateNarration(context)` - Create narrative text
- `makeDecision(question, options)` - Make game decisions
- `clarifyRules(rule, context)` - Provide rule clarifications

## Key Classes

### GameOrchestrator
Main coordinator that manages game flow:
- `startGame(session)` - Initialize a new game session
- `handlePlayerAction(session, playerId, action)` - Process player actions
- `transitionToEncounter(session, encounter)` - Handle encounter transitions
- `endGame(session, reason)` - Conclude game sessions

### Mock Implementations
Development/testing implementations:
- `MockAIProvider` - Mock AI service for development
- `MockDungeonMasterAgent` - Mock dungeon master for testing

## Usage

```typescript
import { 
  GameOrchestrator, 
  MockAIProvider, 
  MockDungeonMasterAgent 
} from "@ai-dungeon-master/orchestrator";

// Initialize components
const aiProvider = new MockAIProvider();
const dungeonMaster = new MockDungeonMasterAgent();
const orchestrator = new GameOrchestrator(aiProvider, dungeonMaster);

// Start a game
const action = await orchestrator.startGame(gameSession);
console.log(action.content); // "Welcome to The Lost Mines!"

// Handle player action
const response = await orchestrator.handlePlayerAction(
  session, 
  "player-1", 
  "I attack the goblin"
);
console.log(response.content); // AI response to player action
```

## AI Integration

The package is designed to work with any AI provider that implements the `AIProvider` interface. Future integrations could include:

- OpenAI GPT models
- Anthropic Claude
- Local language models
- Custom fine-tuned models

## Dependencies

- `@ai-dungeon-master/models` - For game data types
- `@ai-dungeon-master/engine` - For game mechanics
