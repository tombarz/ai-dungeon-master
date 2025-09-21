// Character classes and class features

import type { AbilityKey } from "../core/abilities";

export interface CharacterClass {
  name: string;
  hitDie: number; // 4, 6, 8, 10, 12
  primaryAbility: AbilityKey;
  savingThrowProficiencies: AbilityKey[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillProficiencies: string[];
  features: string[];
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
