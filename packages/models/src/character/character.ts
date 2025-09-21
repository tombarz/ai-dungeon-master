// Player characters

import type { StatBlock } from "../core/stats";
import type { Condition } from "../core/conditions";
import type { CharacterClass, Feature, HitDice, DeathSaves } from "./classes";
import type { Equipment } from "./equipment";
import type { Spell } from "./spells";

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
