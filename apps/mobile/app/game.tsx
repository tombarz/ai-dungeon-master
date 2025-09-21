import React, { useState } from "react";
import { View, ScrollView, TextInput, Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card } from "@ai-dungeon-master/ui";
import { GameOrchestrator, MockAIProvider, MockDungeonMasterAgent } from "@ai-dungeon-master/orchestrator";
import { MockStorageDriver, StorageManager } from "@ai-dungeon-master/storage";
import { GameSession, GameState } from "@ai-dungeon-master/models";

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [gameMessage, setGameMessage] = useState(params.initialMessage as string || "");
  const [playerInput, setPlayerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);

  const sessionId = params.sessionId as string;
  const sessionName = params.sessionName as string;

  const handlePlayerAction = async (action: string) => {
    if (!action.trim()) return;

    setIsLoading(true);
    setPlayerInput("");
    
    try {
      // Initialize components
      const storageDriver = new MockStorageDriver();
      const storage = new StorageManager(storageDriver);
      await storage.initialize();

      const aiProvider = new MockAIProvider();
      const dungeonMaster = new MockDungeonMasterAgent();
      const orchestrator = new GameOrchestrator(aiProvider, dungeonMaster);

      // Create session object from params
      const session: GameSession = {
        id: sessionId,
        name: sessionName,
        players: [],
        gameState: params.gameState as GameState || GameState.LOBBY,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Handle player action
      const response = await orchestrator.handlePlayerAction(
        session, 
        "mock-player-id", 
        action
      );
      
      // Update game state
      const newMessage = `Player: ${action}\n\nDungeon Master: ${response.content}`;
      setGameMessage(response.content);
      setGameHistory(prev => [...prev, newMessage]);
      
      await storage.close();
    } catch (error) {
      console.error("Failed to handle player action:", error);
      Alert.alert("Error", "Failed to process action. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "I want to explore the area",
    "I attack the nearest enemy",
    "I cast a spell",
    "I search for traps",
    "I try to persuade the NPC",
    "I use my special ability",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Current Game Message */}
        {gameMessage && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#007AFF" }}>
                Dungeon Master
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20 }}>
                {gameMessage}
              </Text>
            </View>
          </Card>
        )}

        {/* Game History */}
        {gameHistory.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
                Game History
              </Text>
              {gameHistory.slice(-3).map((entry, index) => (
                <Text key={index} style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  {entry}
                </Text>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
              Quick Actions
            </Text>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                title={action}
                onPress={() => handlePlayerAction(action)}
                disabled={isLoading}
                variant="secondary"
                style={{ marginBottom: 8 }}
              />
            ))}
          </View>
        </Card>

        {/* Custom Input */}
        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Custom Action
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                backgroundColor: "#fff",
              }}
              placeholder="Describe your action..."
              value={playerInput}
              onChangeText={setPlayerInput}
              multiline
              numberOfLines={3}
            />
            <Button
              title={isLoading ? "Processing..." : "Submit Action"}
              onPress={() => handlePlayerAction(playerInput)}
              disabled={isLoading || !playerInput.trim()}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
