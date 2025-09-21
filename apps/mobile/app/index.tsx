// Mobile app placeholder for AI Dungeon Master MVP
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        AI Dungeon Master - Mobile App
      </Text>
      <Text style={{ textAlign: 'center' }}>
        Placeholder for the mobile application.
      </Text>
      <Text style={{ textAlign: 'center', marginTop: 8 }}>
        The real focus is on the types and schemas in the models package.
      </Text>
    </View>
  );
}