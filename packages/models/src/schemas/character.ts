import { z } from "zod";
import { abilitySchema, statBlockSchema, conditionSchema } from "./core";

// Character Schemas

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
