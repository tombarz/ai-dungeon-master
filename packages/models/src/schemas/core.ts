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

export const damageRollSchema = z.object({
  dice: z.string().regex(/^\d+d\d+([+-]\d+)?$/, "Must be in format like '2d6+3'"),
  type: damageTypeSchema,
  modifier: z.number().int().optional(),
});

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
