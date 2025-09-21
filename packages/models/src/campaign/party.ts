// Party state and management

import type { Character } from "../character/character";
import type { Equipment } from "../character/equipment";
import type { QuestFlag } from "./quests";

export interface PartyState {
  id: string;
  name: string;
  characters: Character[];
  level: number; // 1-20
  experiencePoints: number; // ≥ 0
  gold: number; // ≥ 0
  reputation: Record<string, number>; // Faction reputation scores
  questFlags: QuestFlag[];
  inventory: Equipment[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
