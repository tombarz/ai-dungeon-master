import { createHash, randomBytes } from 'crypto';
import type { DiceRollResult, DiceVerificationResult } from '@ai-dungeon-master/models';

export type { DiceRollResult, DiceVerificationResult } from '@ai-dungeon-master/models';

/**
 * Represents a parsed dice expression
 */
interface ParsedDiceExpression {
  count: number;
  sides: number;
  modifier: number;
  valid: boolean;
  error?: string;
}

/**
 * Provably fair dice service with cryptographic seeding
 */
export class ProvablyFairDiceService {
  private static readonly DICE_EXPR_REGEX = /^\s*(\d+)d(\d+)\s*([+-]\s*\d+)?\s*$/i;
  private static readonly UINT32_RANGE = 0x100000000; // 2^32
  
  /**
   * Roll dice based on expression with optional seed
   * @param expr Dice expression (e.g., "2d6+3", "1d20-1")
   * @param seed Optional cryptographic seed (generated if not provided)
   * @returns Roll result with breakdown and seed
   */
  roll(expr: string, seed?: string): DiceRollResult {
    const parsedExpr = this.parseExpression(expr);
    
    if (!parsedExpr.valid) {
      throw new Error(`Invalid dice expression: ${parsedExpr.error}`);
    }
    
    const actualSeed = seed || this.generateSeed();
    const breakdown = this.rollDice(parsedExpr.count, parsedExpr.sides, actualSeed);
    const diceTotal = breakdown.reduce((sum, roll) => sum + roll, 0);
    const result = diceTotal + parsedExpr.modifier;
    
    return {
      result,
      breakdown,
      seed: actualSeed
    };
  }
  
  /**
   * Verify a dice roll result
   * @param expr Original dice expression
   * @param seed Seed used for the roll
   * @param breakdown Expected breakdown of individual dice
   * @returns Verification result
   */
  verify(expr: string, seed: string, breakdown: number[]): boolean {
    try {
      const parsedExpr = this.parseExpression(expr);
      
      if (!parsedExpr.valid) {
        return false;
      }
      
      // Re-roll with the same seed and check if breakdown matches
      const expectedBreakdown = this.rollDice(parsedExpr.count, parsedExpr.sides, seed);
      
      if (breakdown.length !== expectedBreakdown.length) {
        return false;
      }
      
      return breakdown.every((value, index) => value === expectedBreakdown[index]);
    } catch {
      return false;
    }
  }
  
  /**
   * Roll with advantage (roll twice, take higher)
   * @param expr Dice expression
   * @param seed Optional seed
   * @returns Roll result with advantage applied
   */
  rollWithAdvantage(expr: string, seed?: string): DiceRollResult {
    const actualSeed = seed || this.generateSeed();
    
    // Roll twice with deterministic seeds derived from main seed
    const seed1 = this.deriveSeed(actualSeed, 'advantage_1');
    const seed2 = this.deriveSeed(actualSeed, 'advantage_2');
    
    const roll1 = this.roll(expr, seed1);
    const roll2 = this.roll(expr, seed2);
    
    const useFirstRoll = roll1.result >= roll2.result;
    
    return {
      result: useFirstRoll ? roll1.result : roll2.result,
      breakdown: [...roll1.breakdown, ...roll2.breakdown],
      seed: actualSeed
    };
  }
  
  /**
   * Roll with disadvantage (roll twice, take lower)
   * @param expr Dice expression
   * @param seed Optional seed
   * @returns Roll result with disadvantage applied
   */
  rollWithDisadvantage(expr: string, seed?: string): DiceRollResult {
    const actualSeed = seed || this.generateSeed();
    
    // Roll twice with deterministic seeds derived from main seed
    const seed1 = this.deriveSeed(actualSeed, 'disadvantage_1');
    const seed2 = this.deriveSeed(actualSeed, 'disadvantage_2');
    
    const roll1 = this.roll(expr, seed1);
    const roll2 = this.roll(expr, seed2);
    
    const useFirstRoll = roll1.result <= roll2.result;
    
    return {
      result: useFirstRoll ? roll1.result : roll2.result,
      breakdown: [...roll1.breakdown, ...roll2.breakdown],
      seed: actualSeed
    };
  }
  
  /**
   * Generate a cryptographically strong seed
   * @returns Hex-encoded random seed
   */
  private generateSeed(): string {
    return randomBytes(32).toString('hex');
  }
  
  /**
   * Derive a deterministic seed from a parent seed
   * @param parentSeed Parent seed
   * @param context Context string for derivation
   * @returns Derived seed
   */
  private deriveSeed(parentSeed: string, context: string): string {
    return createHash('sha256')
      .update(parentSeed + context)
      .digest('hex');
  }
  
  /**
   * Parse dice expression into components
   * @param expr Dice expression to parse
   * @returns Parsed expression components
   */
  private parseExpression(expr: string): ParsedDiceExpression {
    if (!expr || typeof expr !== 'string') {
      return {
        count: 0,
        sides: 0,
        modifier: 0,
        valid: false,
        error: 'Expression must be a non-empty string'
      };
    }
    
    const trimmed = expr.trim();
    const match = ProvablyFairDiceService.DICE_EXPR_REGEX.exec(trimmed);
    
    if (!match) {
      return {
        count: 0,
        sides: 0,
        modifier: 0,
        valid: false,
        error: 'Expression must be in format NdM or NdM+K or NdM-K (e.g., "2d6+3", "1d20-1")'
      };
    }
    
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifierStr = match[3] || '+0';
    // Remove whitespace from modifier string before parsing
    const modifier = parseInt(modifierStr.replace(/\s/g, ''), 10);
    
    // Validation
    if (count < 1 || count > 100) {
      return {
        count,
        sides,
        modifier,
        valid: false,
        error: 'Number of dice must be between 1 and 100'
      };
    }
    
    if (sides < 2 || sides > 1000) {
      return {
        count,
        sides,
        modifier,
        valid: false,
        error: 'Number of sides must be between 2 and 1000'
      };
    }
    
    if (Math.abs(modifier) > 10000) {
      return {
        count,
        sides,
        modifier,
        valid: false,
        error: 'Modifier must be between -10000 and 10000'
      };
    }
    
    return {
      count,
      sides,
      modifier,
      valid: true
    };
  }
  
  /**
   * Roll dice using deterministic pseudo-random generation based on seed
   * @param count Number of dice to roll
   * @param sides Number of sides per die
   * @param seed Cryptographic seed
   * @returns Array of individual die results
   */
  private rollDice(count: number, sides: number, seed: string): number[] {
    const results: number[] = [];
    
    for (let i = 0; i < count; i++) {
      results.push(this.rollFairDie(sides, seed, i));
    }
    
    return results;
  }

  /**
   * Generate a single fair die result using rejection sampling to avoid modulo bias
   */
  private rollFairDie(sides: number, seed: string, dieIndex: number): number {
    const range = ProvablyFairDiceService.UINT32_RANGE;
    const limit = range - (range % sides);
    let attempt = 0;

    while (true) {
      const randomValue = this.generateUInt32(seed, dieIndex, attempt);

      if (randomValue < limit) {
        return (randomValue % sides) + 1;
      }

      attempt += 1;

      // The chance of repeated rejections is extremely small, but we guard against
      // potential infinite loops to preserve reliability in deterministic contexts.
      if (attempt > 1000) {
        throw new Error('Failed to generate a fair dice roll after multiple attempts');
      }
    }
  }

  /**
   * Deterministically derive a 32-bit unsigned integer from the seed, die index, and attempt
   */
  private generateUInt32(seed: string, dieIndex: number, attempt: number): number {
    const hash = createHash('sha256')
      .update(`${seed}:${dieIndex}:${attempt}`)
      .digest();

    return hash.readUInt32BE(0);
  }

}
// Export singleton instance
export const diceService = new ProvablyFairDiceService();
