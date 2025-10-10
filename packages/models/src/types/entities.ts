/**
 * Entities - creatures, characters, and stat blocks
 */

import type { ID, Ability, DamageType, Condition } from "./core";

/** Complete stat block for any creature */
export interface StatBlock {
  /** Armor class, typically 5-35 */
  ac: number;
  /** Maximum hit points, must be  1 */
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
export type CreatureKind = "character" | "npc" | "monster";

/** Any creature or character in the game world */
export interface Creature extends StatBlock {
  /** Unique identifier */
  id: ID;
  /** What type of creature this is */
  kind: CreatureKind;
  /** Display name */
  name: string;
  /** Character race (e.g., "Human", "Elf", "Dwarf") */
  race?: string;
  /** Character class (e.g., "Fighter", "Wizard", "Rogue") */
  class?: string;
  /** Character level (1-20 for D&D) */
  level?: number;
  /** Known skills and proficiencies */
  skills?: string[];
  /** Items carried by this creature */
  inventory?: { name: string; qty?: number }[];
  /** Active status conditions */
  conditions?: Condition[];
  /** Narrative backstory for role-play context */
  backstory?: string;
}

/** Fully realized player-controlled character */
export interface PlayerCharacter extends Creature {
  backstory: string;
}
