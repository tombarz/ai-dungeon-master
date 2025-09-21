// NPCs and non-player characters

import type { StatBlock } from "../core/stats";
import type { Condition } from "../core/conditions";
import type { Action } from "../combat/actions";

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
