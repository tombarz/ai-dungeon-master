/**
 * Dice-related types shared across engine and clients
 */

/** Result of a provably fair dice roll */
export interface DiceRollResult {
  result: number;
  breakdown: number[];
  seed: string;
}

/** Verification output for a dice roll */
export interface DiceVerificationResult {
  valid: boolean;
  error?: string;
}
