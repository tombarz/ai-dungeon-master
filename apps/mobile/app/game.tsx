// Mobile game screen placeholder for AI Dungeon Master MVP
import { View, Text } from 'react-native';

export default function Game() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Game Screen
      </Text>
      <Text style={{ textAlign: 'center' }}>
        Placeholder for the game screen.
      </Text>
      <Text style={{ textAlign: 'center', marginTop: 8 }}>
        The real focus is on the types and schemas in the models package.
      </Text>
    </View>
  );
}