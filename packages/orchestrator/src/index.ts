import {
  GameSession,
  GameState,
  DungeonMasterAction,
  DungeonMasterActionType,
  AIResponse,
  Player,
  Encounter,
} from "@ai-dungeon-master/models";

// AI Provider interface - abstract contract for AI services
export interface AIProvider {
  generateResponse(prompt: string, context?: Record<string, unknown>): Promise<string>;
  generateStructuredResponse<T>(
    prompt: string, 
    schema: Record<string, unknown>, 
    context?: Record<string, unknown>
  ): Promise<T>;
}

// Dungeon Master Agent interface
export interface DungeonMasterAgent {
  processGameState(session: GameSession): Promise<DungeonMasterAction>;
  respondToPlayerAction(session: GameSession, playerAction: string): Promise<DungeonMasterAction>;
  generateNarration(context: string): Promise<string>;
  makeDecision(question: string, options: string[]): Promise<string>;
  clarifyRules(rule: string, context: string): Promise<string>;
}

// Game Orchestrator - main coordinator
export class GameOrchestrator {
  private aiProvider: AIProvider;
  private dungeonMasterAgent: DungeonMasterAgent;

  constructor(aiProvider: AIProvider, dungeonMasterAgent: DungeonMasterAgent) {
    this.aiProvider = aiProvider;
    this.dungeonMasterAgent = dungeonMasterAgent;
  }

  async startGame(session: GameSession): Promise<DungeonMasterAction> {
    const prompt = this.buildGameStartPrompt(session);
    const context = this.buildGameContext(session);
    
    const response = await this.dungeonMasterAgent.processGameState(session);
    return response;
  }

  async handlePlayerAction(session: GameSession, playerId: string, action: string): Promise<DungeonMasterAction> {
    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in session`);
    }

    return await this.dungeonMasterAgent.respondToPlayerAction(session, action);
  }

  async transitionToEncounter(session: GameSession, encounter: Encounter): Promise<DungeonMasterAction> {
    const prompt = this.buildEncounterPrompt(session, encounter);
    const context = this.buildEncounterContext(session, encounter);
    
    const narration = await this.dungeonMasterAgent.generateNarration(prompt);
    
    return {
      type: DungeonMasterActionType.NARRATION,
      content: narration,
      timestamp: new Date(),
      context,
    };
  }

  async endGame(session: GameSession, reason: string): Promise<DungeonMasterAction> {
    const prompt = this.buildGameEndPrompt(session, reason);
    const context = this.buildGameContext(session);
    
    const narration = await this.dungeonMasterAgent.generateNarration(prompt);
    
    return {
      type: DungeonMasterActionType.NARRATION,
      content: narration,
      timestamp: new Date(),
      context,
    };
  }

  private buildGameStartPrompt(session: GameSession): string {
    const players = session.players.map(p => 
      `${p.character.name} (${p.character.class.name}, Level ${p.character.level})`
    ).join(", ");

    return `
      Welcome to a new D&D session: "${session.name}"
      
      Players: ${players}
      
      Please provide an engaging opening narration that sets the scene and draws the players into the adventure.
      Keep it brief but atmospheric, and end with a hook that encourages player interaction.
    `;
  }

  private buildGameEndPrompt(session: GameSession, reason: string): string {
    return `
      The session "${session.name}" is coming to an end.
      
      Reason: ${reason}
      
      Please provide a satisfying conclusion that wraps up the current story arc and acknowledges the players' achievements.
    `;
  }

  private buildEncounterPrompt(session: GameSession, encounter: Encounter): string {
    const players = session.players.map(p => 
      `${p.character.name} (${p.character.class.name}, Level ${p.character.level})`
    ).join(", ");

    return `
      The party encounters: ${encounter.name}
      
      Players: ${players}
      Encounter Description: ${encounter.description}
      Difficulty: ${encounter.difficulty}
      
      Please provide an engaging description of this encounter that draws the players in and sets the scene for action.
    `;
  }

  private buildGameContext(session: GameSession): Record<string, unknown> {
    return {
      sessionId: session.id,
      sessionName: session.name,
      playerCount: session.players.length,
      gameState: session.gameState,
      currentEncounter: session.currentEncounter,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private buildEncounterContext(session: GameSession, encounter: Encounter): Record<string, unknown> {
    return {
      ...this.buildGameContext(session),
      encounterId: encounter.id,
      encounterName: encounter.name,
      encounterDifficulty: encounter.difficulty,
      enemyCount: encounter.enemies.length,
    };
  }
}

// Mock implementations for development/testing
export class MockAIProvider implements AIProvider {
  async generateResponse(prompt: string, context?: Record<string, unknown>): Promise<string> {
    // Mock response for development
    return `Mock AI response to: ${prompt.substring(0, 50)}...`;
  }

  async generateStructuredResponse<T>(
    prompt: string, 
    schema: Record<string, unknown>, 
    context?: Record<string, unknown>
  ): Promise<T> {
    // Mock structured response
    return {
      response: `Mock structured response to: ${prompt.substring(0, 50)}...`,
      confidence: 0.8,
    } as T;
  }
}

export class MockDungeonMasterAgent implements DungeonMasterAgent {
  async processGameState(session: GameSession): Promise<DungeonMasterAction> {
    return {
      type: DungeonMasterActionType.NARRATION,
      content: `Welcome to ${session.name}! The adventure begins...`,
      timestamp: new Date(),
    };
  }

  async respondToPlayerAction(session: GameSession, playerAction: string): Promise<DungeonMasterAction> {
    return {
      type: DungeonMasterActionType.NARRATION,
      content: `The dungeon master responds to: ${playerAction}`,
      timestamp: new Date(),
    };
  }

  async generateNarration(context: string): Promise<string> {
    return `Narration: ${context}`;
  }

  async makeDecision(question: string, options: string[]): Promise<string> {
    return options[0] || "I choose the first option.";
  }

  async clarifyRules(rule: string, context: string): Promise<string> {
    return `Rule clarification for ${rule}: ${context}`;
  }
}
