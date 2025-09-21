import { z } from "zod";
import { statBlockSchema, conditionSchema } from "./core";
import { actionSchema } from "./combat";

// Creature Schemas

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
