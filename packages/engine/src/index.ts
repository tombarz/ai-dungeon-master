// Engine placeholder for AI Dungeon Master
// Future implementation will handle dice rolling, rules, and encounter control

export interface DiceResult {
  base: number;
  modifier: number;
  total: number;
  rolls: number[];
}

// Simple dice rolling placeholder
export class DiceRoller {
  roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
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
}

// Export singleton instance
export const diceRoller = new DiceRoller();