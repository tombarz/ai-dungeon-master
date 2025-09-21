// Versioned types for migration support

import type { Session } from "../session/session";
import type { Campaign } from "../campaign/campaign";
import type { Character } from "../character/character";
import type { PartyState } from "../campaign/party";
import type { EncounterState } from "../combat/encounters";

// Generic versioned wrapper
export interface Versioned<T> {
  version: number;
  data: T;
}

// Specific versioned types
export type VersionedSession = Versioned<Session>;
export type VersionedCampaign = Versioned<Campaign>;
export type VersionedCharacter = Versioned<Character>;
export type VersionedPartyState = Versioned<PartyState>;
export type VersionedEncounterState = Versioned<EncounterState>;
