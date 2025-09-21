// Equipment, items, and gear

export interface Equipment {
  name: string;
  type: "weapon" | "armor" | "shield" | "tool" | "consumable" | "other";
  description: string;
  weight?: number; // ≥ 0
  value?: number; // ≥ 0
  rarity?: "common" | "uncommon" | "rare" | "very rare" | "legendary" | "artifact";
  magical?: boolean;
  properties?: string[];
  damage?: string;
  armorClass?: number; // 5-35
  charges?: number; // ≥ 0
  maxCharges?: number; // ≥ 0
}
