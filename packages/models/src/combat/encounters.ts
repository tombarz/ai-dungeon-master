// Combat encounters and initiative

import type { Character } from "../character/character";
import type { NPC } from "../creatures/npc";
import type { TurnLog } from "../logging/turn-log";

export interface EncounterState {
  id: string;
  name: string;
  type: "combat" | "social" | "exploration" | "puzzle" | "other";
  participants: (Character | NPC)[];
  initiative: InitiativeEntry[];
  currentTurn?: number; // Index in initiative array
  round: number; // ≥ 1
  status: "preparing" | "active" | "completed" | "paused";
  environment: EnvironmentEffect[];
  objectives: EncounterObjective[];
  turnLog: TurnLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InitiativeEntry {
  id: string; // Character/NPC ID
  name: string;
  initiative: number; // 1-30
  type: "character" | "npc" | "environment";
}

export interface EnvironmentEffect {
  name: string;
  description: string;
  type: "lighting" | "weather" | "terrain" | "magical" | "other";
  intensity?: number; // 1-10
  duration?: number; // Rounds
  affects: string[]; // IDs of affected entities
}

export interface EncounterObjective {
  id: string;
  description: string;
  type: "defeat" | "protect" | "retrieve" | "escape" | "investigate" | "other";
  target?: string; // ID of target
  completed: boolean;
  optional: boolean;
}
