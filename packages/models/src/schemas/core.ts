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
