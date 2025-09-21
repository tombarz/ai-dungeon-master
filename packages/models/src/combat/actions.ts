// Combat actions and abilities

import type { DamageRoll } from "../core/damage";
import type { EffectInstance } from "./effects";

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
