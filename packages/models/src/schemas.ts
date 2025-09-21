import { z } from "zod";

/**
 * Core enums and primitives schemas
 */

/** Schema for unique identifiers */
export const zID = z.string().uuid("ID must be a valid UUID");

/** Schema for D&D abilities */
export const zAbility = z.enum(['STR','DEX','CON','INT','WIS','CHA'], {
  description: "Must be one of the six core D&D abilities"
});

/** Schema for conversation speakers */
export const zSpeaker = z.enum(['AI','PLAYER','SYSTEM'], {
  description: "Who is speaking in the conversation"
});

/** Schema for supported languages */
export const zLanguage = z.enum(['en','he'], {
  description: "Supported language codes"
});

/** Schema for content ratings */
export const zRating = z.enum(['E','PG-13','R'], {
  description: "Content rating for the campaign"
});

/** Schema for damage types */
export const zDamageType = z.enum([
  'bludgeoning','piercing','slashing','fire','cold','lightning',
  'thunder','poison','acid','psychic','necrotic','radiant','force'
], {
  description: "D&D damage type"
});

/** Schema for status conditions */
export const zCondition = z.enum([
  'prone','grappled','restrained','stunned','unconscious',
  'poisoned','frightened','charmed','blinded','deafened'
], {
  description: "D&D status condition"
});

/**
 * Stat blocks and actors schemas
 */

/** Schema for stat blocks */
export const zStatBlock = z.object({
  ac: z.number().int().min(5).max(35, "Armor class must be between 5 and 35"),
  maxHP: z.number().int().min(1, "Maximum HP must be at least 1"),
  hp: z.number().int().min(0, "Current HP cannot be negative"),
  abilities: z.record(zAbility, z.number().int().min(1).max(30, "Ability scores must be between 1 and 30"))
    .refine((obj) => Object.keys(obj).length === 6, "Must include all six abilities")
    .describe("Raw ability scores for all six abilities"),
  profBonus: z.number().int().optional().describe("Proficiency bonus for skilled creatures"),
  resist: z.array(zDamageType).default([]).describe("Damage types this creature resists"),
  vuln: z.array(zDamageType).default([]).describe("Damage types this creature is vulnerable to"),
  immune: z.array(zDamageType).default([]).describe("Damage types this creature is immune to"),
}).refine((data) => data.hp <= data.maxHP, "Current HP cannot exceed maximum HP")
  .describe("Complete stat block for any creature");

/** Schema for creature kinds */
export const zCreatureKind = z.enum(['character','npc','monster'], {
  description: "Kind of creature in the game"
});

/** Schema for creatures */
export const zCreature = z.object({
  // Stat block properties
  ac: z.number().int().min(5).max(35, "Armor class must be between 5 and 35"),
  maxHP: z.number().int().min(1, "Maximum HP must be at least 1"),
  hp: z.number().int().min(0, "Current HP cannot be negative"),
  abilities: z.record(zAbility, z.number().int().min(1).max(30, "Ability scores must be between 1 and 30"))
    .refine((obj) => Object.keys(obj).length === 6, "Must include all six abilities")
    .describe("Raw ability scores for all six abilities"),
  profBonus: z.number().int().optional().describe("Proficiency bonus for skilled creatures"),
  resist: z.array(zDamageType).default([]).describe("Damage types this creature resists"),
  vuln: z.array(zDamageType).default([]).describe("Damage types this creature is vulnerable to"),
  immune: z.array(zDamageType).default([]).describe("Damage types this creature is immune to"),
  // Creature-specific properties
  id: zID.describe("Unique identifier"),
  kind: zCreatureKind.describe("What type of creature this is"),
  name: z.string().min(1).describe("Display name"),
  inventory: z.array(z.object({
    name: z.string(),
    qty: z.number().int().min(1).optional()
  })).default([]).describe("Items carried by this creature"),
  conditions: z.array(zCondition).default([]).describe("Active status conditions"),
}).refine((data) => data.hp <= data.maxHP, "Current HP cannot exceed maximum HP")
.describe("Any creature or character in the game world");

/**
 * Party state schemas
 */

/** Schema for party state */
export const zPartyState = z.object({
  characters: z.array(zCreature).describe("Player characters in the party"),
  companions: z.array(zCreature).default([]).describe("Optional NPC companions"),
}).refine((data) =>
  data.characters.every(char => char.kind === 'character'),
  "All characters must have kind 'character'"
).describe("State of the adventuring party");

/**
 * Encounter and effects schemas
 */

/** Schema for effect instances */
export const zEffectInstance = z.object({
  id: zID.describe("Unique identifier for this effect"),
  targetId: zID.describe("ID of the creature this affects"),
  condition: zCondition.describe("The condition being applied"),
  expiresOnRound: z.number().int().optional().describe("Round number when this effect expires"),
}).describe("An active effect on a creature");

/** Schema for encounter state */
export const zEncounterState = z.object({
  id: zID.describe("Unique identifier"),
  round: z.number().int().min(1, "Round must be at least 1"),
  initiative: z.array(zID).describe("Ordered list of creature IDs by initiative"),
  activeId: zID.describe("ID of the creature whose turn it is"),
  entities: z.record(zID, zCreature).describe("All creatures participating in the encounter"),
  effects: z.array(zEffectInstance).default([]).describe("Active effects on creatures"),
}).refine((data) => data.initiative.includes(data.activeId), "activeId must be in initiative")
.refine((data) => data.initiative.every(id => id in data.entities), "All initiative IDs must exist in entities")
.describe("Current state of an encounter");

/**
 * Rolls and chat timeline schemas
 */

/** Schema for roll logs */
export const zRollLog = z.object({
  id: zID.describe("Unique identifier"),
  expr: z.string().describe("Dice expression that was rolled"),
  seed: z.string().describe("Seed for provably fair rolling"),
  result: z.number().describe("Final calculated result"),
  breakdown: z.array(z.number()).describe("Individual dice results"),
  reason: z.string().optional().describe("Optional reason for the roll"),
}).describe("A single dice roll with provenance");

/** Schema for turn logs */
export const zTurnLog = z.object({
  id: zID.describe("Unique identifier"),
  ts: z.string().datetime("Must be an ISO datetime string").describe("ISO timestamp of when this occurred"),
  speaker: zSpeaker.describe("Who said this"),
  text: z.string().describe("The actual text content"),
  rolls: z.array(zRollLog).default([]).describe("Any dice rolls made during this turn"),
}).describe("A single turn or message in the conversation");

/**
 * World and canon schemas
 */

/** Schema for canon kinds */
export const zCanonKind = z.enum(['NPC','Location','Faction','Item','Lore'], {
  description: "Type of canon fact in the game world"
});

/** Schema for canon facts */
export const zCanonFact = z.object({
  id: zID.describe("Unique identifier"),
  kind: zCanonKind.describe("What type of lore this is"),
  summary: z.string().trim().min(1, "Summary cannot be empty after trimming").describe("Brief summary of the fact"),
  data: z.unknown().optional().describe("Optional detailed data"),
  locked: z.boolean().default(false).describe("Whether this fact can be modified"),
}).describe("A piece of established world lore");

/**
 * Campaign and session schemas
 */

/** Schema for campaigns */
export const zCampaign = z.object({
  id: zID.describe("Unique identifier"),
  name: z.string().trim().min(1, "Campaign name cannot be empty").describe("Campaign name"),
  createdAt: z.string().datetime("Must be an ISO datetime string").describe("ISO timestamp when created"),
  settings: z.object({
    language: zLanguage,
    safety: zRating
  }).describe("Language and safety settings"),
  canon: z.array(zCanonFact).default([]).describe("Optional world lore"),
  questFlags: z.array(z.object({
    key: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()])
  })).default([]).describe("Optional quest progress flags"),
}).describe("A complete D&D campaign");

/** Schema for sessions */
export const zSession = z.object({
  id: zID.describe("Unique identifier"),
  campaignId: zID.describe("ID of the parent campaign"),
  seed: z.string().describe("Seed for deterministic gameplay"),
  timeline: z.array(zTurnLog).default([]).describe("Complete conversation history"),
  state: z.object({
    party: zPartyState.describe("The adventuring party"),
    encounter: zEncounterState.optional().describe("Optional active encounter"),
    location: z.string().optional().describe("Current location description"),
  }).describe("Current game state"),
  updatedAt: z.string().datetime("Must be an ISO datetime string").describe("ISO timestamp when last updated"),
}).describe("A single game session");

/**
 * Parser functions
 */

export const parseSession = (data: unknown) => zSession.parse(data);
export const parseCampaign = (data: unknown) => zCampaign.parse(data);
