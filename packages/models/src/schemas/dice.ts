import { z } from "zod";

/**
 * Dice-related schemas shared across engine and clients
 */

/** Schema for dice roll results */
export const zDiceRollResult = z.object({
  result: z.number().int().describe("Total result of the roll after modifiers"),
  breakdown: z.array(z.number().int().min(1, "Each die result must be at least 1")).nonempty({
    message: "At least one die roll is required"
  }).describe("Individual die results in roll order"),
  seed: z.string().min(1, "Seed must be provided").describe("Seed used to generate the roll")
}).describe("Result of a provably fair dice roll");

/** Schema for dice roll verification */
export const zDiceVerificationResult = z.object({
  valid: z.boolean().describe("Whether the roll is valid given the seed and breakdown"),
  error: z.string().min(1).optional().describe("Reason the verification failed, if any")
}).refine((data) => data.valid || data.error, {
  message: "Error message is required when verification fails",
  path: ['error']
}).describe("Verification output for a dice roll");
