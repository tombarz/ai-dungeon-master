// Schema exports with parsers

// Re-export all schemas
export * from "./core";
export * from "./character";
export * from "./combat";
export * from "./creatures";
export * from "./campaign";
export * from "./logging";
export * from "./session";
export * from "./versioning";

// Import schemas for parsers
import { 
  abilitySchema, 
  statBlockSchema,
  damageRollSchema,
} from "./core";
import { characterSchema, equipmentSchema, spellSchema } from "./character";
import { 
  actionSchema, 
  effectInstanceSchema, 
  encounterStateSchema,
  npcSchema as combatNpcSchema,
} from "./combat";
import { 
  npcSchema, 
  monsterSchema,
} from "./creatures";
import { 
  questFlagSchema, 
  canonFactSchema, 
  partyStateSchema, 
  campaignSchema,
} from "./campaign";
import { turnLogSchema, rollLogSchema } from "./logging";
import { sessionSchema } from "./session";

// Parser Functions
export const parseAbility = (data: unknown) => abilitySchema.parse(data);
export const parseStatBlock = (data: unknown) => statBlockSchema.parse(data);
export const parseDamageRoll = (data: unknown) => damageRollSchema.parse(data);

export const parseCharacter = (data: unknown) => characterSchema.parse(data);
export const parseEquipment = (data: unknown) => equipmentSchema.parse(data);
export const parseSpell = (data: unknown) => spellSchema.parse(data);

export const parseAction = (data: unknown) => actionSchema.parse(data);
export const parseEffectInstance = (data: unknown) => effectInstanceSchema.parse(data);
export const parseEncounterState = (data: unknown) => encounterStateSchema.parse(data);

export const parseNPC = (data: unknown) => npcSchema.parse(data);
export const parseMonster = (data: unknown) => monsterSchema.parse(data);

export const parseQuestFlag = (data: unknown) => questFlagSchema.parse(data);
export const parseCanonFact = (data: unknown) => canonFactSchema.parse(data);
export const parsePartyState = (data: unknown) => partyStateSchema.parse(data);
export const parseCampaign = (data: unknown) => campaignSchema.parse(data);

export const parseTurnLog = (data: unknown) => turnLogSchema.parse(data);
export const parseRollLog = (data: unknown) => rollLogSchema.parse(data);

export const parseSession = (data: unknown) => sessionSchema.parse(data);
