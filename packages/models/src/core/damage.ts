// Damage types and related mechanics

export type DamageType = 
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";

export interface DamageRoll {
  dice: string; // e.g., "2d6+3"
  type: DamageType;
  modifier?: number;
}
