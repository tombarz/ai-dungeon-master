import { z } from "zod";
import { damageRollSchema, conditionSchema } from "./core";
import { characterSchema } from "./character";

// Combat Schemas

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

// Forward declaration for NPC schema
const npcSchemaForward = z.lazy(() => npcSchema);

export const encounterStateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["combat", "social", "exploration", "puzzle", "other"]),
  participants: z.array(z.union([characterSchema, npcSchemaForward])).default([]),
  initiative: z.array(initiativeEntrySchema).default([]),
  currentTurn: z.number().int().min(0).optional(),
  round: z.number().int().min(1),
  status: z.enum(["preparing", "active", "completed", "paused"]),
  environment: z.array(environmentEffectSchema).default([]),
  objectives: z.array(encounterObjectiveSchema).default([]),
  turnLog: z.array(z.lazy(() => z.any())).default([]), // Will be properly typed later
  createdAt: z.date(),
  updatedAt: z.date(),
});

// NPC Schema (needed for encounters)
export const npcSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["humanoid", "beast", "monster", "undead", "construct", "elemental", "fey", "fiend", "celestial", "dragon"]),
  size: z.enum(["tiny", "small", "medium", "large", "huge", "gargantuan"]),
  alignment: z.string().min(1),
  stats: z.lazy(() => z.any()), // Will be properly imported
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
