/**
 * Dice rolling utilities powered by a pluggable random number generator.
 *
 * The RNG dependency enables deterministic testing or cryptographically
 * secure behaviour via alternative implementations (Strategy pattern).
 */
export interface RandomNumberGenerator {
  roll(sides: number): number;
}

/** Default RNG that delegates to Math.random */
export class MathRandomNumberGenerator implements RandomNumberGenerator {
  roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }
}

export interface DiceResult {
  base: number;
  modifier: number;
  total: number;
  rolls: number[];
}

export interface ExtendedDiceResult extends DiceResult {
  advantage?: boolean;
  disadvantage?: boolean;
}

export class DiceRoller {
  constructor(private readonly rng: RandomNumberGenerator = new MathRandomNumberGenerator()) {}

  roll(sides: number): number {
    return this.rng.roll(sides);
  }

  rollD20(): DiceResult {
    const base = this.roll(20);
    return {
      base,
      modifier: 0,
      total: base,
      rolls: [base],
    };
  }

  rollD20WithAdvantage(): ExtendedDiceResult {
    const roll1 = this.roll(20);
    const roll2 = this.roll(20);
    const base = Math.max(roll1, roll2);
    return {
      base,
      modifier: 0,
      total: base,
      rolls: [roll1, roll2],
      advantage: true,
    };
  }

  rollD20WithDisadvantage(): ExtendedDiceResult {
    const roll1 = this.roll(20);
    const roll2 = this.roll(20);
    const base = Math.min(roll1, roll2);
    return {
      base,
      modifier: 0,
      total: base,
      rolls: [roll1, roll2],
      disadvantage: true,
    };
  }
}

export const diceRoller = new DiceRoller();
