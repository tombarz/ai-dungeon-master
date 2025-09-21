import { z } from "zod";
import { characterSchema, equipmentSchema } from "./character";

// Campaign Schemas

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

export const campaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  setting: z.string(),
  level: z.number().int().min(1).max(20),
  party: partyStateSchema,
  encounters: z.array(z.lazy(() => z.any())).default([]), // Will be properly typed with encounters
  canonFacts: z.array(canonFactSchema).default([]),
  sessions: z.array(z.lazy(() => z.any())).default([]), // Will be properly typed with sessions
  notes: z.string().default(""),
  createdAt: z.date(),
  updatedAt: z.date(),
});
