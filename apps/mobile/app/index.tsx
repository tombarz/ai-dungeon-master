import React, { useState } from "react";
import { View, ScrollView, Alert, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card } from "@ai-dungeon-master/ui";
import { GameOrchestrator, MockAIProvider, MockDungeonMasterAgent } from "@ai-dungeon-master/orchestrator";
import { MockStorageDriver, StorageManager } from "@ai-dungeon-master/storage";
import { GameSession, GameState } from "@ai-dungeon-master/models";

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const startNewGame = async () => {
    setIsLoading(true);
    
    try {
      // Initialize storage
      const storageDriver = new MockStorageDriver();
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
      
      // Navigate to game screen with session data
      router.push({
        pathname: "/game",
        params: {
          sessionId: newSession.id,
          sessionName: newSession.name,
          gameState: newSession.gameState,
          initialMessage: action.content,
        },
      });

      await storage.close();
    } catch (error) {
      console.error("Failed to start game:", error);
      Alert.alert("Error", "Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <Button
              title={isLoading ? "Starting..." : "Start New Game"}
              onPress={startNewGame}
              disabled={isLoading}
              style={{ marginBottom: 16 }}
            />
            
            <Button
              title="Load Existing Game"
              onPress={() => Alert.alert("Coming Soon", "This feature will be available soon!")}
              variant="secondary"
              style={{ marginBottom: 16 }}
            />
            
            <Button
              title="Character Creator"
              onPress={() => Alert.alert("Coming Soon", "This feature will be available soon!")}
              variant="secondary"
            />
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              Welcome to AI Dungeon Master
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
              Your AI-powered companion for D&D adventures. Create characters, 
              explore dungeons, and embark on epic quests with intelligent 
              storytelling and dynamic encounters.
            </Text>
          </View>
        </Card>

        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Features
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              • AI Dungeon Master with dynamic storytelling
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              • Character creation and management
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              • Dice rolling and combat calculations
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
              • Cross-platform sync with web version
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              • Offline play with local storage
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
