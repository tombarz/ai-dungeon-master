import { z } from "zod";
import { questFlagSchema, canonFactSchema } from "./campaign";
import { turnLogSchema, rollLogSchema } from "./logging";

// Session Schemas

export const sessionSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  name: z.string().min(1),
  date: z.date(),
  duration: z.number().int().min(0),
  participants: z.array(z.string().uuid()).default([]),
  encounters: z.array(z.lazy(() => z.any())).default([]), // Will be properly typed with encounters
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
