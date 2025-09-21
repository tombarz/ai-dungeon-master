// Stat blocks and core statistics

import type { Ability } from "./abilities";
import type { DamageType } from "./damage";
import type { Condition } from "./conditions";

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
