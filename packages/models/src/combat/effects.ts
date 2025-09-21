// Effects, conditions, and status tracking

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
