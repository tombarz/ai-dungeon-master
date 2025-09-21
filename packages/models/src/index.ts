// Core domain types
export interface Character {
  id: string;
  name: string;
  level: number;
  class: CharacterClass;
  stats: CharacterStats;
  inventory: Item[];
}

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: string;
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  CONSUMABLE = "consumable",
  TOOL = "tool",
  TREASURE = "treasure",
}

export enum ItemRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  difficulty: EncounterDifficulty;
  enemies: Enemy[];
  rewards: Reward[];
}

export enum EncounterDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  DEADLY = "deadly",
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  challengeRating: number;
  hitPoints: number;
  armorClass: number;
  stats: CharacterStats;
  abilities: string[];
}

export interface Reward {
  experience: number;
  gold: number;
  items: Item[];
}

// Game state types
export interface GameSession {
  id: string;
  name: string;
  players: Player[];
  currentEncounter?: Encounter;
  gameState: GameState;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  userId: string;
  character: Character;
  isActive: boolean;
}

export enum GameState {
  LOBBY = "lobby",
  EXPLORATION = "exploration",
  ENCOUNTER = "encounter",
  COMBAT = "combat",
  PAUSED = "paused",
  ENDED = "ended",
}

// AI Dungeon Master types
export interface DungeonMasterAction {
  type: DungeonMasterActionType;
  content: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export enum DungeonMasterActionType {
  NARRATION = "narration",
  QUESTION = "question",
  DECISION = "decision",
  COMBAT_INSTRUCTION = "combat_instruction",
  RULE_CLARIFICATION = "rule_clarification",
}

export interface AIResponse {
  action: DungeonMasterAction;
  confidence: number;
  reasoning?: string;
}

// Dice and calculation types
export interface DiceResult {
  base: number;
  modifier: number;
  total: number;
  rolls: number[];
  advantage?: boolean;
  disadvantage?: boolean;
}
