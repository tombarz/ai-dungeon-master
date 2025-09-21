import { z } from "zod";
import { zAbility, zDamageType, zCondition } from "./core";

/**
 * Entity schemas - creatures, characters, and stat blocks
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
  id: z.string().uuid("ID must be a valid UUID").describe("Unique identifier"),
  kind: zCreatureKind.describe("What type of creature this is"),
  name: z.string().min(1).describe("Display name"),
  inventory: z.array(z.object({
    name: z.string(),
    qty: z.number().int().min(1).optional()
  })).default([]).describe("Items carried by this creature"),
  conditions: z.array(zCondition).default([]).describe("Active status conditions"),
}).refine((data) => data.hp <= data.maxHP, "Current HP cannot exceed maximum HP")
.describe("Any creature or character in the game world");
