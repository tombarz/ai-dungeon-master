"use client";

import { useState } from "react";
import { Button, Card } from "@ai-dungeon-master/ui";
import { GameOrchestrator, MockAIProvider, MockDungeonMasterAgent } from "@ai-dungeon-master/orchestrator";
import { IndexedDBDriver, StorageManager } from "@ai-dungeon-master/storage";
import { GameSession, GameState } from "@ai-dungeon-master/models";

export default function Home() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameMessage, setGameMessage] = useState<string>("");

  const startNewGame = async () => {
    setIsLoading(true);
    
    try {
      // Initialize storage
      const storageDriver = new IndexedDBDriver();
      const storage = new StorageManager(storageDriver);
      await storage.initialize();

      // Initialize AI components
      const aiProvider = new MockAIProvider();
      const dungeonMaster = new MockDungeonMasterAgent();
      const orchestrator = new GameOrchestrator(aiProvider, dungeonMaster);

      // Create a new game session
      const newSession: GameSession = {
        id: crypto.randomUUID(),
        name: "New Adventure",
        players: [],
        gameState: GameState.LOBBY,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Start the game
      const action = await orchestrator.startGame(newSession);
      setGameMessage(action.content);
      setGameSession(newSession);

      await storage.close();
    } catch (error) {
      console.error("Failed to start game:", error);
      setGameMessage("Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerAction = async (action: string) => {
    if (!gameSession) return;

    setIsLoading(true);
    
    try {
      // Initialize components again
      const storageDriver = new IndexedDBDriver();
      const storage = new StorageManager(storageDriver);
      await storage.initialize();

      const aiProvider = new MockAIProvider();
      const dungeonMaster = new MockDungeonMasterAgent();
      const orchestrator = new GameOrchestrator(aiProvider, dungeonMaster);

      // Handle player action
      const response = await orchestrator.handlePlayerAction(
        gameSession, 
        "mock-player-id", 
        action
      );
      
      setGameMessage(response.content);
      await storage.close();
    } catch (error) {
      console.error("Failed to handle player action:", error);
      setGameMessage("Failed to process action. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Dungeon Master
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Start Your Adventure</h2>
            <p className="text-gray-600 mb-6">
              Begin a new D&D session with your AI dungeon master. Create characters, 
              explore dungeons, and embark on epic quests!
            </p>
            <Button
              title={isLoading ? "Starting..." : "Start New Game"}
              onPress={startNewGame}
              disabled={isLoading}
              style={{ width: "100%" }}
            />
          </Card>

          {gameSession && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Game Session</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Session: {gameSession.name}</p>
                  <p className="text-sm text-gray-600">
                    State: {gameSession.gameState}
                  </p>
                </div>
                
                {gameMessage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Dungeon Master:</h3>
                    <p className="text-gray-700">{gameMessage}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button
                    title="I want to explore"
                    onPress={() => handlePlayerAction("I want to explore the area")}
                    disabled={isLoading}
                    style={{ width: "100%" }}
                  />
                  <Button
                    title="I attack the nearest enemy"
                    onPress={() => handlePlayerAction("I attack the nearest enemy")}
                    disabled={isLoading}
                    variant="secondary"
                    style={{ width: "100%" }}
                  />
                  <Button
                    title="I cast a spell"
                    onPress={() => handlePlayerAction("I cast a spell")}
                    disabled={isLoading}
                    variant="secondary"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-medium mb-2">AI Dungeon Master</h3>
              <p className="text-sm text-gray-600">
                Intelligent AI that guides your adventure with dynamic storytelling
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Character Management</h3>
              <p className="text-sm text-gray-600">
                Create and manage D&D characters with full stat tracking
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Cross-Platform</h3>
              <p className="text-sm text-gray-600">
                Play on web and mobile with synchronized game state
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
