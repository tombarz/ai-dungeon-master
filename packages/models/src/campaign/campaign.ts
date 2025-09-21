// Campaign management

import type { PartyState } from "./party";
import type { CanonFact } from "./quests";
import type { EncounterState } from "../combat/encounters";
import type { Session } from "../session/session";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  level: number; // 1-20
  party: PartyState;
  encounters: EncounterState[];
  canonFacts: CanonFact[];
  sessions: Session[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
