// Game sessions

import type { EncounterState } from "../combat/encounters";
import type { QuestFlag, CanonFact } from "../campaign/quests";
import type { TurnLog } from "../logging/turn-log";
import type { RollLog } from "../logging/roll-log";

export interface Session {
  id: string;
  campaignId: string;
  name: string;
  date: Date;
  duration: number; // Minutes, ≥ 0
  participants: string[]; // Character IDs
  encounters: EncounterState[];
  questFlags: QuestFlag[];
  canonFacts: CanonFact[];
  experienceGained: number; // ≥ 0
  goldGained: number; // ≥ 0
  notes: string;
  turnLog: TurnLog[];
  rollLog: RollLog[];
  status: "planned" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
