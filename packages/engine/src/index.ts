// Engine for AI Dungeon Master
// Handles dice rolling, rules, and encounter control

export interface DiceResult {
  base: number;
  modifier: number;
  total: number;
  rolls: number[];
}

// Extended dice result interface for advantage/disadvantage
export interface ExtendedDiceResult extends DiceResult {
  advantage?: boolean;
  disadvantage?: boolean;
}

// Simple dice rolling placeholder (legacy)
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

// Ability score calculator
export class AbilityScoreCalculator {
  static getModifier(abilityScore: number): number {
    return Math.floor((abilityScore - 10) / 2);
  }

  static rollAbilityScores(): {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  } {
    const roller = new DiceRoller();
    
    const rollStat = (): number => {
      // Roll 4d6, drop lowest
      const rolls = [roller.roll(6), roller.roll(6), roller.roll(6), roller.roll(6)];
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    return {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };
  }
}

// Combat calculator
export class CombatCalculator {
  static calculateArmorClass(baseAC: number, dexModifier: number, armorBonus: number): number {
    return baseAC + dexModifier + armorBonus;
  }

  static calculateProficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
  }
}

// Export legacy singleton instance
export const diceRoller = new DiceRoller();

// Export new provably fair dice service
export * from './dice';