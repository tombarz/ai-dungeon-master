import { z } from "zod";
import { effectInstanceSchema } from "./combat";

// Logging Schemas

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
