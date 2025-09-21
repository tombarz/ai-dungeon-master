import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Character, GameSession, Encounter } from "@ai-dungeon-master/models";

// Base UI Components
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${variant}`],
    disabled && styles.button_disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
}) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

export interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  style,
}) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor="#666"
    />
  );
};

// Game-specific components
export interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
  showDetails?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
  showDetails = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={!onPress}>
      <Card style={styles.characterCard}>
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={styles.characterClass}>
          {character.class.name} - Level {character.level}
        </Text>
        {showDetails && (
          <View style={styles.characterStats}>
            <Text style={styles.statText}>
              HP: {character.stats.constitution}
            </Text>
            <Text style={styles.statText}>
              AC: {character.stats.dexterity + 10}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export interface GameSessionCardProps {
  session: GameSession;
  onPress?: () => void;
}

export const GameSessionCard: React.FC<GameSessionCardProps> = ({
  session,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.sessionCard}>
        <Text style={styles.sessionName}>{session.name}</Text>
        <Text style={styles.sessionStatus}>
          Status: {session.gameState}
        </Text>
        <Text style={styles.sessionPlayers}>
          Players: {session.players.length}
        </Text>
        <Text style={styles.sessionDate}>
          Created: {session.createdAt.toLocaleDateString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

export interface EncounterCardProps {
  encounter: Encounter;
  onPress?: () => void;
}

export const EncounterCard: React.FC<EncounterCardProps> = ({
  encounter,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.encounterCard}>
        <Text style={styles.encounterName}>{encounter.name}</Text>
        <Text style={styles.encounterDifficulty}>
          Difficulty: {encounter.difficulty}
        </Text>
        <Text style={styles.encounterDescription} numberOfLines={2}>
          {encounter.description}
        </Text>
        <Text style={styles.encounterEnemies}>
          Enemies: {encounter.enemies.length}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

export interface DiceRollerProps {
  onRoll: (sides: number, count: number, modifier: number) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [sides, setSides] = React.useState("20");
  const [count, setCount] = React.useState("1");
  const [modifier, setModifier] = React.useState("0");

  const handleRoll = () => {
    const sidesNum = parseInt(sides, 10);
    const countNum = parseInt(count, 10);
    const modifierNum = parseInt(modifier, 10);
    
    if (sidesNum > 0 && countNum > 0) {
      onRoll(sidesNum, countNum, modifierNum);
    }
  };

  return (
    <Card style={styles.diceRoller}>
      <Text style={styles.diceRollerTitle}>Dice Roller</Text>
      <View style={styles.diceRollerInputs}>
        <View style={styles.diceRollerInput}>
          <Text style={styles.diceRollerLabel}>Count</Text>
          <Input
            value={count}
            onChangeText={setCount}
            style={styles.diceRollerTextInput}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.diceRollerOperator}>d</Text>
        <View style={styles.diceRollerInput}>
          <Text style={styles.diceRollerLabel}>Sides</Text>
          <Input
            value={sides}
            onChangeText={setSides}
            style={styles.diceRollerTextInput}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.diceRollerOperator}>+</Text>
        <View style={styles.diceRollerInput}>
          <Text style={styles.diceRollerLabel}>Mod</Text>
          <Input
            value={modifier}
            onChangeText={setModifier}
            style={styles.diceRollerTextInput}
            keyboardType="numeric"
          />
        </View>
      </View>
      <Button title="Roll" onPress={handleRoll} style={styles.diceRollerButton} />
    </Card>
  );
};

// Styles
const styles = StyleSheet.create({
  // Base component styles
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  button_primary: {
    backgroundColor: "#007AFF",
  },
  button_secondary: {
    backgroundColor: "#8E8E93",
  },
  button_danger: {
    backgroundColor: "#FF3B30",
  },
  button_disabled: {
    backgroundColor: "#C7C7CC",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonText_secondary: {
    color: "#FFFFFF",
  },
  buttonText_danger: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  // Character card styles
  characterCard: {
    marginVertical: 4,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  characterClass: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  characterStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 12,
    color: "#666666",
  },
  // Session card styles
  sessionCard: {
    marginVertical: 4,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 2,
  },
  sessionPlayers: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: "#999999",
  },
  // Encounter card styles
  encounterCard: {
    marginVertical: 4,
  },
  encounterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  encounterDifficulty: {
    fontSize: 14,
    color: "#FF9500",
    marginBottom: 4,
  },
  encounterDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  encounterEnemies: {
    fontSize: 12,
    color: "#999999",
  },
  // Dice roller styles
  diceRoller: {
    alignItems: "center",
  },
  diceRollerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  diceRollerInputs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  diceRollerInput: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  diceRollerLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  diceRollerTextInput: {
    width: 60,
    textAlign: "center",
  },
  diceRollerOperator: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  diceRollerButton: {
    minWidth: 100,
  },
});
