// Orchestrator placeholder for AI Dungeon Master
// Future implementation will handle AI agent contracts

export interface AIAgent {
  generateResponse(prompt: string): Promise<string>;
}

// Simple placeholder agent
export class PlaceholderAgent implements AIAgent {
  async generateResponse(prompt: string): Promise<string> {
    return `AI response to: ${prompt}`;
  }
}