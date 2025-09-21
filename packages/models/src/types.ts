// Core D&D Types

export interface Ability {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type DamageType = 
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";

export type Condition = 
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious";

export interface StatBlock {
  armorClass: number; // 5-35
  hitPoints: number; // ≥ 0
  speed: number; // ≥ 0
  abilities: Ability;
  savingThrows?: Partial<Ability>;
  skills?: Record<string, number>;
  damageResistances?: DamageType[];
  damageImmunities?: DamageType[];
  damageVulnerabilities?: DamageType[];
  conditionImmunities?: Condition[];
  senses?: Record<string, string>;
  languages?: string[];
  challengeRating?: number; // 0-30
  proficiencyBonus?: number; // 0-9
}

// Character Types

export interface Character {
  id: string;
  name: string;
  level: number; // 1-20
  class: CharacterClass;
  race: string;
  background: string;
  alignment: string;
  stats: StatBlock;
  equipment: Equipment[];
  spells?: Spell[];
  features?: Feature[];
  conditions: Condition[];
  temporaryHitPoints?: number; // ≥ 0
  hitDice?: HitDice[];
  experiencePoints?: number; // ≥ 0
  inspiration?: boolean;
  deathSaves?: DeathSaves;
}

export interface CharacterClass {
  name: string;
  hitDie: number; // 4, 6, 8, 10, 12
  primaryAbility: keyof Ability;
  savingThrowProficiencies: (keyof Ability)[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillProficiencies: string[];
  features: string[];
}

export interface Equipment {
  name: string;
  type: "weapon" | "armor" | "shield" | "tool" | "consumable" | "other";
  description: string;
  weight?: number; // ≥ 0
  value?: number; // ≥ 0
  rarity?: "common" | "uncommon" | "rare" | "very rare" | "legendary" | "artifact";
  magical?: boolean;
  properties?: string[];
  damage?: string;
  armorClass?: number; // 5-35
  charges?: number; // ≥ 0
  maxCharges?: number; // ≥ 0
}

export interface Spell {
  name: string;
  level: number; // 0-9
  school: "abjuration" | "conjuration" | "divination" | "enchantment" | "evocation" | "illusion" | "necromancy" | "transmutation";
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
}

export interface Feature {
  name: string;
  description: string;
  level?: number; // 1-20
  uses?: number; // ≥ 0
  maxUses?: number; // ≥ 0
  recharge?: "short rest" | "long rest" | "daily" | "never";
}

export interface HitDice {
  die: number; // 4, 6, 8, 10, 12
  count: number; // ≥ 0
  used: number; // ≥ 0, ≤ count
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number; // 0-3
}

// NPC/Monster Types

export interface NPC {
  id: string;
  name: string;
  type: "humanoid" | "beast" | "monster" | "undead" | "construct" | "elemental" | "fey" | "fiend" | "celestial" | "dragon";
  size: "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";
  alignment: string;
  stats: StatBlock;
  actions: Action[];
  reactions?: Action[];
  legendaryActions?: Action[];
  lairActions?: Action[];
  regionalEffects?: string[];
  description: string;
  roleplayNotes?: string;
  isDead: boolean;
  currentHitPoints: number; // ≥ 0
  temporaryHitPoints?: number; // ≥ 0
  conditions: Condition[];
  legendaryResistances?: number; // ≥ 0
  legendaryResistancesUsed?: number; // ≥ 0, ≤ legendaryResistances
}

export interface Monster extends NPC {
  challengeRating: number; // 0-30
  experiencePoints: number; // ≥ 0
  legendaryActions?: Action[];
  lairActions?: Action[];
  regionalEffects?: string[];
}

// Action Types

export interface Action {
  name: string;
  type: "action" | "bonus action" | "reaction" | "legendary action" | "lair action";
  description: string;
  range?: string;
  target?: string;
  toHit?: number;
  damage?: DamageRoll[];
  effects?: EffectInstance[];
  uses?: number; // ≥ 0
  maxUses?: number; // ≥ 0
  recharge?: "short rest" | "long rest" | "daily" | "never";
  cost?: number; // For legendary actions
}

export interface DamageRoll {
  dice: string; // e.g., "2d6+3"
  type: DamageType;
  modifier?: number;
}

export interface EffectInstance {
  id: string;
  type: "condition" | "damage" | "healing" | "buff" | "debuff" | "custom";
  name: string;
  description: string;
  duration: number; // Rounds, ≥ 0
  remainingRounds: number; // ≥ 0, ≤ duration
  value?: number;
  target: string; // ID of target
  source: string; // ID of source
  stackable?: boolean;
  concentration?: boolean;
}

// Quest and Campaign Types

export interface QuestFlag {
  id: string;
  name: string;
  type: "boolean" | "number" | "string" | "object";
  value: boolean | number | string | Record<string, unknown>;
  description?: string;
  timestamp: Date;
}

export interface CanonFact {
  id: string;
  title: string;
  content: string;
  category: "history" | "geography" | "culture" | "religion" | "politics" | "magic" | "other";
  importance: "minor" | "major" | "critical";
  verified: boolean;
  source?: string;
  relatedFacts?: string[]; // IDs of related facts
  timestamp: Date;
}

// Game State Types

export interface PartyState {
  id: string;
  name: string;
  characters: Character[];
  level: number; // 1-20
  experiencePoints: number; // ≥ 0
  gold: number; // ≥ 0
  reputation: Record<string, number>; // Faction reputation scores
  questFlags: QuestFlag[];
  inventory: Equipment[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncounterState {
  id: string;
  name: string;
  type: "combat" | "social" | "exploration" | "puzzle" | "other";
  participants: (Character | NPC)[];
  initiative: InitiativeEntry[];
  currentTurn?: number; // Index in initiative array
  round: number; // ≥ 1
  status: "preparing" | "active" | "completed" | "paused";
  environment: EnvironmentEffect[];
  objectives: EncounterObjective[];
  turnLog: TurnLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InitiativeEntry {
  id: string; // Character/NPC ID
  name: string;
  initiative: number; // 1-30
  type: "character" | "npc" | "environment";
}

export interface EnvironmentEffect {
  name: string;
  description: string;
  type: "lighting" | "weather" | "terrain" | "magical" | "other";
  intensity?: number; // 1-10
  duration?: number; // Rounds
  affects: string[]; // IDs of affected entities
}

export interface EncounterObjective {
  id: string;
  description: string;
  type: "defeat" | "protect" | "retrieve" | "escape" | "investigate" | "other";
  target?: string; // ID of target
  completed: boolean;
  optional: boolean;
}

export interface TurnLog {
  id: string;
  turn: number;
  actor: string; // ID of actor
  action: string;
  target?: string; // ID of target
  result: string;
  damage?: number;
  healing?: number;
  effects: EffectInstance[];
  timestamp: Date;
}

export interface RollLog {
  id: string;
  actor: string; // ID of actor
  type: "attack" | "damage" | "saving throw" | "ability check" | "skill check" | "death save" | "other";
  dice: string; // e.g., "1d20+5"
  result: number;
  naturalRoll: number; // 1-20 for d20 rolls
  modifier: number;
  advantage?: boolean;
  disadvantage?: boolean;
  success?: boolean;
  target?: string; // ID of target
  description: string;
  timestamp: Date;
}

// Campaign Types

export interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  level: number; // 1-20
  party: PartyState;
  encounters: EncounterState[];
  canonFacts: CanonFact[];
  sessions: Session[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  campaignId: string;
  name: string;
  date: Date;
  duration: number; // Minutes, ≥ 0
  participants: string[]; // Character IDs
  encounters: EncounterState[];
  questFlags: QuestFlag[];
  canonFacts: CanonFact[];
  experienceGained: number; // ≥ 0
  goldGained: number; // ≥ 0
  notes: string;
  turnLog: TurnLog[];
  rollLog: RollLog[];
  status: "planned" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Versioned Types for Migration Support

export interface Versioned<T> {
  version: number;
  data: T;
}

// Specific versioned types
export type VersionedSession = Versioned<Session>;
export type VersionedCampaign = Versioned<Campaign>;
export type VersionedCharacter = Versioned<Character>;
export type VersionedPartyState = Versioned<PartyState>;
export type VersionedEncounterState = Versioned<EncounterState>;
