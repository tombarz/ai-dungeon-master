// Monsters and challenging creatures

import type { NPC } from "./npc";
import type { Action } from "../combat/actions";

export interface Monster extends NPC {
  challengeRating: number; // 0-30
  experiencePoints: number; // ≥ 0
  legendaryActions?: Action[];
  lairActions?: Action[];
  regionalEffects?: string[];
}
