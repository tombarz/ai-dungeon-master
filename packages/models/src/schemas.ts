import { z } from "zod";

// Core D&D Schemas

export const abilitySchema = z.object({
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
});

export const damageTypeSchema = z.enum([
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
]);

export const conditionSchema = z.enum([
  "blinded",
  "charmed",
  "deafened",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
]);

export const statBlockSchema = z.object({
  armorClass: z.number().int().min(5).max(35),
  hitPoints: z.number().int().min(0),
  speed: z.number().int().min(0),
  abilities: abilitySchema,
  savingThrows: abilitySchema.partial().optional(),
  skills: z.record(z.string(), z.number().int()).optional(),
  damageResistances: z.array(damageTypeSchema).default([]),
  damageImmunities: z.array(damageTypeSchema).default([]),
  damageVulnerabilities: z.array(damageTypeSchema).default([]),
  conditionImmunities: z.array(conditionSchema).default([]),
  senses: z.record(z.string(), z.string()).optional(),
  languages: z.array(z.string()).default([]),
  challengeRating: z.number().min(0).max(30).optional(),
  proficiencyBonus: z.number().int().min(0).max(9).optional(),
});

// Character Schemas

export const characterClassSchema = z.object({
  name: z.string().min(1),
  hitDie: z.number().int().refine((val) => [4, 6, 8, 10, 12].includes(val), {
    message: "Hit die must be 4, 6, 8, 10, or 12",
  }),
  primaryAbility: z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]),
  savingThrowProficiencies: z.array(z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"])).default([]),
  armorProficiencies: z.array(z.string()).default([]),
  weaponProficiencies: z.array(z.string()).default([]),
  toolProficiencies: z.array(z.string()).default([]),
  skillProficiencies: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
});

export const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["weapon", "armor", "shield", "tool", "consumable", "other"]),
  description: z.string(),
  weight: z.number().min(0).optional(),
  value: z.number().min(0).optional(),
  rarity: z.enum(["common", "uncommon", "rare", "very rare", "legendary", "artifact"]).optional(),
  magical: z.boolean().default(false),
  properties: z.array(z.string()).default([]),
  damage: z.string().optional(),
  armorClass: z.number().int().min(5).max(35).optional(),
  charges: z.number().int().min(0).optional(),
  maxCharges: z.number().int().min(0).optional(),
});

export const spellSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(9),
  school: z.enum(["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"]),
  castingTime: z.string(),
  range: z.string(),
  components: z.array(z.string()).default([]),
  duration: z.string(),
  description: z.string(),
  higherLevels: z.string().optional(),
  ritual: z.boolean().default(false),
  concentration: z.boolean().default(false),
});

export const featureSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  level: z.number().int().min(1).max(20).optional(),
  uses: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
  recharge: z.enum(["short rest", "long rest", "daily", "never"]).optional(),
});

export const hitDiceSchema = z.object({
  die: z.number().int().refine((val) => [4, 6, 8, 10, 12].includes(val), {
    message: "Die must be 4, 6, 8, 10, or 12",
  }),
  count: z.number().int().min(0),
  used: z.number().int().min(0),
}).refine((data) => data.used <= data.count, {
  message: "Used dice cannot exceed total count",
});

export const deathSavesSchema = z.object({
  successes: z.number().int().min(0).max(3),
  failures: z.number().int().min(0).max(3),
});

export const characterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  level: z.number().int().min(1).max(20),
  class: characterClassSchema,
  race: z.string().min(1),
  background: z.string().min(1),
  alignment: z.string().min(1),
  stats: statBlockSchema,
  equipment: z.array(equipmentSchema).default([]),
  spells: z.array(spellSchema).default([]),
  features: z.array(featureSchema).default([]),
  conditions: z.array(conditionSchema).default([]),
  temporaryHitPoints: z.number().int().min(0).optional(),
  hitDice: z.array(hitDiceSchema).default([]),
  experiencePoints: z.number().int().min(0).optional(),
  inspiration: z.boolean().default(false),
  deathSaves: deathSavesSchema.optional(),
});

// NPC/Monster Schemas

export const damageRollSchema = z.object({
  dice: z.string().regex(/^\d+d\d+([+-]\d+)?$/, "Must be in format like '2d6+3'"),
  type: damageTypeSchema,
  modifier: z.number().int().optional(),
});

export const effectInstanceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["condition", "damage", "healing", "buff", "debuff", "custom"]),
  name: z.string().min(1),
  description: z.string(),
  duration: z.number().int().min(0),
  remainingRounds: z.number().int().min(0),
  value: z.number().optional(),
  target: z.string().uuid(),
  source: z.string().uuid(),
  stackable: z.boolean().default(false),
  concentration: z.boolean().default(false),
}).refine((data) => data.remainingRounds <= data.duration, {
  message: "Remaining rounds cannot exceed duration",
});

export const actionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["action", "bonus action", "reaction", "legendary action", "lair action"]),
  description: z.string(),
  range: z.string().optional(),
  target: z.string().optional(),
  toHit: z.number().int().optional(),
  damage: z.array(damageRollSchema).default([]),
  effects: z.array(effectInstanceSchema).default([]),
  uses: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
  recharge: z.enum(["short rest", "long rest", "daily", "never"]).optional(),
  cost: z.number().int().min(0).optional(),
});

export const npcSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["humanoid", "beast", "monster", "undead", "construct", "elemental", "fey", "fiend", "celestial", "dragon"]),
  size: z.enum(["tiny", "small", "medium", "large", "huge", "gargantuan"]),
  alignment: z.string().min(1),
  stats: statBlockSchema,
  actions: z.array(actionSchema).default([]),
  reactions: z.array(actionSchema).default([]),
  legendaryActions: z.array(actionSchema).default([]),
  lairActions: z.array(actionSchema).default([]),
  regionalEffects: z.array(z.string()).default([]),
  description: z.string(),
  roleplayNotes: z.string().optional(),
  isDead: z.boolean().default(false),
  currentHitPoints: z.number().int().min(0),
  temporaryHitPoints: z.number().int().min(0).optional(),
  conditions: z.array(conditionSchema).default([]),
  legendaryResistances: z.number().int().min(0).optional(),
  legendaryResistancesUsed: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.legendaryResistancesUsed !== undefined && data.legendaryResistances !== undefined) {
    return data.legendaryResistancesUsed <= data.legendaryResistances;
  }
  return true;
}, {
  message: "Used legendary resistances cannot exceed total legendary resistances",
});

export const monsterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["humanoid", "beast", "monster", "undead", "construct", "elemental", "fey", "fiend", "celestial", "dragon"]),
  size: z.enum(["tiny", "small", "medium", "large", "huge", "gargantuan"]),
  alignment: z.string().min(1),
  stats: statBlockSchema,
  actions: z.array(actionSchema).default([]),
  reactions: z.array(actionSchema).default([]),
  legendaryActions: z.array(actionSchema).default([]),
  lairActions: z.array(actionSchema).default([]),
  regionalEffects: z.array(z.string()).default([]),
  description: z.string(),
  roleplayNotes: z.string().optional(),
  isDead: z.boolean().default(false),
  currentHitPoints: z.number().int().min(0),
  temporaryHitPoints: z.number().int().min(0).optional(),
  conditions: z.array(conditionSchema).default([]),
  legendaryResistances: z.number().int().min(0).optional(),
  legendaryResistancesUsed: z.number().int().min(0).optional(),
  challengeRating: z.number().min(0).max(30),
  experiencePoints: z.number().int().min(0),
}).refine((data) => {
  if (data.legendaryResistancesUsed !== undefined && data.legendaryResistances !== undefined) {
    return data.legendaryResistancesUsed <= data.legendaryResistances;
  }
  return true;
}, {
  message: "Used legendary resistances cannot exceed total legendary resistances",
});

// Quest and Campaign Schemas

export const questFlagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["boolean", "number", "string", "object"]),
  value: z.union([z.boolean(), z.number(), z.string(), z.record(z.unknown())]),
  description: z.string().optional(),
  timestamp: z.date(),
});

export const canonFactSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  category: z.enum(["history", "geography", "culture", "religion", "politics", "magic", "other"]),
  importance: z.enum(["minor", "major", "critical"]),
  verified: z.boolean().default(false),
  source: z.string().optional(),
  relatedFacts: z.array(z.string().uuid()).default([]),
  timestamp: z.date(),
});

// Game State Schemas

export const partyStateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  characters: z.array(characterSchema).default([]),
  level: z.number().int().min(1).max(20),
  experiencePoints: z.number().int().min(0),
  gold: z.number().min(0),
  reputation: z.record(z.string(), z.number()).default({}),
  questFlags: z.array(questFlagSchema).default([]),
  inventory: z.array(equipmentSchema).default([]),
  notes: z.string().default(""),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const initiativeEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  initiative: z.number().int().min(1).max(30),
  type: z.enum(["character", "npc", "environment"]),
});

export const environmentEffectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(["lighting", "weather", "terrain", "magical", "other"]),
  intensity: z.number().int().min(1).max(10).optional(),
  duration: z.number().int().min(0).optional(),
  affects: z.array(z.string().uuid()).default([]),
});

export const encounterObjectiveSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  type: z.enum(["defeat", "protect", "retrieve", "escape", "investigate", "other"]),
  target: z.string().uuid().optional(),
  completed: z.boolean().default(false),
  optional: z.boolean().default(false),
});

export const turnLogSchema = z.object({
  id: z.string().uuid(),
  turn: z.number().int().min(1),
  actor: z.string().uuid(),
  action: z.string(),
  target: z.string().uuid().optional(),
  result: z.string(),
  damage: z.number().optional(),
  healing: z.number().optional(),
  effects: z.array(effectInstanceSchema).default([]),
  timestamp: z.date(),
});

export const rollLogSchema = z.object({
  id: z.string().uuid(),
  actor: z.string().uuid(),
  type: z.enum(["attack", "damage", "saving throw", "ability check", "skill check", "death save", "other"]),
  dice: z.string().regex(/^\d+d\d+([+-]\d+)?$/, "Must be in format like '1d20+5'"),
  result: z.number(),
  naturalRoll: z.number().int().min(1).max(20),
  modifier: z.number(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
  success: z.boolean().optional(),
  target: z.string().uuid().optional(),
  description: z.string(),
  timestamp: z.date(),
});

export const encounterStateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["combat", "social", "exploration", "puzzle", "other"]),
  participants: z.array(z.union([characterSchema, npcSchema])).default([]),
  initiative: z.array(initiativeEntrySchema).default([]),
  currentTurn: z.number().int().min(0).optional(),
  round: z.number().int().min(1),
  status: z.enum(["preparing", "active", "completed", "paused"]),
  environment: z.array(environmentEffectSchema).default([]),
  objectives: z.array(encounterObjectiveSchema).default([]),
  turnLog: z.array(turnLogSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sessionSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  name: z.string().min(1),
  date: z.date(),
  duration: z.number().int().min(0),
  participants: z.array(z.string().uuid()).default([]),
  encounters: z.array(encounterStateSchema).default([]),
  questFlags: z.array(questFlagSchema).default([]),
  canonFacts: z.array(canonFactSchema).default([]),
  experienceGained: z.number().int().min(0),
  goldGained: z.number().min(0),
  notes: z.string().default(""),
  turnLog: z.array(turnLogSchema).default([]),
  rollLog: z.array(rollLogSchema).default([]),
  status: z.enum(["planned", "active", "completed", "cancelled"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const campaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  setting: z.string(),
  level: z.number().int().min(1).max(20),
  party: partyStateSchema,
  encounters: z.array(encounterStateSchema).default([]),
  canonFacts: z.array(canonFactSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
  notes: z.string().default(""),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Versioned Schemas

export const versionedSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    version: z.number().int().min(1),
    data: dataSchema,
  });

export const versionedSessionSchema = versionedSchema(sessionSchema);
export const versionedCampaignSchema = versionedSchema(campaignSchema);
export const versionedCharacterSchema = versionedSchema(characterSchema);
export const versionedPartyStateSchema = versionedSchema(partyStateSchema);
export const versionedEncounterStateSchema = versionedSchema(encounterStateSchema);

// Parser Functions

export const parseSession = (data: unknown) => sessionSchema.parse(data);
export const parseCampaign = (data: unknown) => campaignSchema.parse(data);
export const parseCharacter = (data: unknown) => characterSchema.parse(data);
export const parsePartyState = (data: unknown) => partyStateSchema.parse(data);
export const parseEncounterState = (data: unknown) => encounterStateSchema.parse(data);
export const parseNPC = (data: unknown) => npcSchema.parse(data);
export const parseMonster = (data: unknown) => monsterSchema.parse(data);
export const parseAbility = (data: unknown) => abilitySchema.parse(data);
export const parseStatBlock = (data: unknown) => statBlockSchema.parse(data);
export const parseAction = (data: unknown) => actionSchema.parse(data);
export const parseEffectInstance = (data: unknown) => effectInstanceSchema.parse(data);
export const parseQuestFlag = (data: unknown) => questFlagSchema.parse(data);
export const parseCanonFact = (data: unknown) => canonFactSchema.parse(data);
export const parseTurnLog = (data: unknown) => turnLogSchema.parse(data);
export const parseRollLog = (data: unknown) => rollLogSchema.parse(data);
