/**
 * Core enums and primitives for the AI Dungeon Master MVP
 */

/** Unique identifier for entities */
export type ID = string;

/** Six core D&D abilities */
export type Ability = 'STR'|'DEX'|'CON'|'INT'|'WIS'|'CHA';

/** Who is speaking in the conversation */
export type Speaker = 'AI'|'PLAYER'|'SYSTEM';

/** Supported languages for the game */
export type Language = 'en'|'he';

/** Content rating for the campaign */
export type Rating = 'E'|'PG-13'|'R';

/** Types of damage in D&D */
export type DamageType = 'bludgeoning'|'piercing'|'slashing'|'fire'|'cold'|'lightning'|'thunder'|'poison'|'acid'|'psychic'|'necrotic'|'radiant'|'force';

/** Status conditions that can affect creatures */
export type Condition = 'prone'|'grappled'|'restrained'|'stunned'|'unconscious'|'poisoned'|'frightened'|'charmed'|'blinded'|'deafened';

/**
 * Stat blocks and actors for creatures and characters
 */

/** Complete stat block for any creature */
export interface StatBlock {
  /** Armor class, typically 5-35 */
  ac: number;
  /** Maximum hit points, must be ≥ 1 */
  maxHP: number;
  /** Current hit points, must be between 0 and maxHP */
  hp: number;
  /** Raw ability scores for all six abilities */
  abilities: Record<Ability, number>;
  /** Proficiency bonus for skilled creatures */
  profBonus?: number;
  /** Damage types this creature resists */
  resist?: DamageType[];
  /** Damage types this creature is vulnerable to */
  vuln?: DamageType[];
  /** Damage types this creature is immune to */
  immune?: DamageType[];
}

/** Kind of creature in the game */
export type CreatureKind = 'character'|'npc'|'monster';

/** Any creature or character in the game world */
export interface Creature extends StatBlock {
  /** Unique identifier */
  id: ID;
  /** What type of creature this is */
  kind: CreatureKind;
  /** Display name */
  name: string;
  /** Items carried by this creature */
  inventory?: { name: string; qty?: number }[];
  /** Active status conditions */
  conditions?: Condition[];
}

/**
 * Party state for group management
 */

/** State of the adventuring party */
export interface PartyState {
  /** Player characters in the party */
  characters: Creature[];
  /** Optional NPC companions */
  companions?: Creature[];
}

/**
 * Encounter and effects for combat tracking
 */

/** An active effect on a creature */
export interface EffectInstance {
  /** Unique identifier for this effect */
  id: ID;
  /** ID of the creature this affects */
  targetId: ID;
  /** The condition being applied */
  condition: Condition;
  /** Round number when this effect expires */
  expiresOnRound?: number;
}

/** Current state of an encounter */
export interface EncounterState {
  /** Unique identifier */
  id: ID;
  /** Current round number, must be ≥ 1 */
  round: number;
  /** Ordered list of creature IDs by initiative */
  initiative: ID[];
  /** ID of the creature whose turn it is */
  activeId: ID;
  /** All creatures participating in the encounter */
  entities: Record<ID, Creature>;
  /** Active effects on creatures */
  effects?: EffectInstance[];
}

/**
 * Rolls and chat timeline for game history
 */

/** A single dice roll with provenance */
export interface RollLog {
  /** Unique identifier */
  id: ID;
  /** Dice expression that was rolled */
  expr: string;
  /** Seed for provably fair rolling */
  seed: string;
  /** Final calculated result */
  result: number;
  /** Individual dice results */
  breakdown: number[];
  /** Optional reason for the roll */
  reason?: string;
}

/** A single turn or message in the conversation */
export interface TurnLog {
  /** Unique identifier */
  id: ID;
  /** ISO timestamp of when this occurred */
  ts: string;
  /** Who said this */
  speaker: Speaker;
  /** The actual text content */
  text: string;
  /** Any dice rolls made during this turn */
  rolls?: RollLog[];
}

/**
 * World and canon for world-building
 */

/** Type of canon fact in the game world */
export type CanonKind = 'NPC'|'Location'|'Faction'|'Item'|'Lore';

/** A piece of established world lore */
export interface CanonFact {
  /** Unique identifier */
  id: ID;
  /** What type of lore this is */
  kind: CanonKind;
  /** Brief summary of the fact */
  summary: string;
  /** Optional detailed data */
  data?: unknown;
  /** Whether this fact can be modified */
  locked?: boolean;
}

/**
 * Campaign and session for game management
 */

/** A complete D&D campaign */
export interface Campaign {
  /** Unique identifier */
  id: ID;
  /** Campaign name */
  name: string;
  /** ISO timestamp when created */
  createdAt: string;
  /** Language and safety settings */
  settings: { language: Language; safety: Rating };
  /** Optional world lore */
  canon?: CanonFact[];
  /** Optional quest progress flags */
  questFlags?: { key: string; value: string | number | boolean }[];
}

/** A single game session */
export interface Session {
  /** Unique identifier */
  id: ID;
  /** ID of the parent campaign */
  campaignId: ID;
  /** Seed for deterministic gameplay */
  seed: string;
  /** Complete conversation history */
  timeline: TurnLog[];
  /** Current game state */
  state: {
    /** The adventuring party */
    party: PartyState;
    /** Optional active encounter */
    encounter?: EncounterState;
    /** Current location description */
    location?: string;
  };
  /** ISO timestamp when last updated */
  updatedAt: string;
}
