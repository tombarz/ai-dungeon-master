// Core D&D ability scores and related types

export interface Ability {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type AbilityKey = keyof Ability;
