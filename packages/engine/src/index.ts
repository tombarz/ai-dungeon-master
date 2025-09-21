import { Character, CharacterStats, Encounter, EncounterDifficulty, DiceResult } from "@ai-dungeon-master/models";

// Dice rolling utilities
export class DiceRoller {
  private static instance: DiceRoller;
  
  private constructor() {}
  
  static getInstance(): DiceRoller {
    if (!DiceRoller.instance) {
      DiceRoller.instance = new DiceRoller();
    }
    return DiceRoller.instance;
  }

  roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  rollMultiple(count: number, sides: number): number[] {
    return Array.from({ length: count }, () => this.roll(sides));
  }

  rollWithModifier(sides: number, modifier: number = 0): DiceResult {
    const base = this.roll(sides);
    return {
      base,
      modifier,
      total: base + modifier,
      rolls: [base],
    };
  }

  rollD20(): DiceResult {
    return this.rollWithModifier(20);
  }

  rollD20WithAdvantage(): DiceResult {
    const roll1 = this.roll(20);
    const roll2 = this.roll(20);
    const max = Math.max(roll1, roll2);
    return {
      base: max,
      modifier: 0,
      total: max,
      rolls: [roll1, roll2],
      advantage: true,
    };
  }

  rollD20WithDisadvantage(): DiceResult {
    const roll1 = this.roll(20);
    const roll2 = this.roll(20);
    const min = Math.min(roll1, roll2);
    return {
      base: min,
      modifier: 0,
      total: min,
      rolls: [roll1, roll2],
      disadvantage: true,
    };
  }
}

// Ability score utilities
export class AbilityScoreCalculator {
  static getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  static rollForAbilityScore(): number {
    const diceRoller = DiceRoller.getInstance();
    const rolls = diceRoller.rollMultiple(4, 6);
    // Drop the lowest die
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  }

  static rollAbilityScores(): CharacterStats {
    return {
      strength: this.rollForAbilityScore(),
      dexterity: this.rollForAbilityScore(),
      constitution: this.rollForAbilityScore(),
      intelligence: this.rollForAbilityScore(),
      wisdom: this.rollForAbilityScore(),
      charisma: this.rollForAbilityScore(),
    };
  }
}

// Combat utilities
export class CombatCalculator {
  static calculateArmorClass(base: number, dexterityModifier: number, armorBonus: number = 0): number {
    return base + dexterityModifier + armorBonus;
  }

  static calculateHitPoints(hitDie: number, level: number, constitutionModifier: number): number {
    const diceRoller = DiceRoller.getInstance();
    let total = hitDie + constitutionModifier; // First level
    
    for (let i = 1; i < level; i++) {
      const roll = diceRoller.roll(hitDie);
      total += roll + constitutionModifier;
    }
    
    return Math.max(1, total); // Minimum 1 HP
  }

  static calculateProficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
  }

  static calculateAttackBonus(
    abilityModifier: number, 
    proficiencyBonus: number, 
    weaponBonus: number = 0
  ): number {
    return abilityModifier + proficiencyBonus + weaponBonus;
  }

  static calculateDamage(
    diceCount: number, 
    diceSize: number, 
    abilityModifier: number, 
    weaponBonus: number = 0
  ): DiceResult {
    const diceRoller = DiceRoller.getInstance();
    const rolls = diceRoller.rollMultiple(diceCount, diceSize);
    const base = rolls.reduce((sum, roll) => sum + roll, 0);
    const modifier = abilityModifier + weaponBonus;
    
    return {
      base,
      modifier,
      total: base + modifier,
      rolls,
    };
  }
}

// Encounter difficulty calculator
export class EncounterCalculator {
  static calculateEncounterDifficulty(
    partyLevel: number,
    partySize: number,
    encounterXP: number
  ): EncounterDifficulty {
    const thresholds = this.getDifficultyThresholds(partyLevel, partySize);
    
    if (encounterXP <= thresholds.easy) return EncounterDifficulty.EASY;
    if (encounterXP <= thresholds.medium) return EncounterDifficulty.MEDIUM;
    if (encounterXP <= thresholds.hard) return EncounterDifficulty.HARD;
    return EncounterDifficulty.DEADLY;
  }

  private static getDifficultyThresholds(level: number, size: number): {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  } {
    const baseThresholds = {
      1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
      2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
      3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
      4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
      5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    };
    
    const multiplier = size === 1 ? 1 : size <= 2 ? 1.5 : size <= 3 ? 2 : 2.5;
    const thresholds = baseThresholds[Math.min(level, 5) as keyof typeof baseThresholds];
    
    return {
      easy: thresholds.easy * multiplier,
      medium: thresholds.medium * multiplier,
      hard: thresholds.hard * multiplier,
      deadly: thresholds.deadly * multiplier,
    };
  }
}

// Initiative tracker
export class InitiativeTracker {
  private initiatives: Map<string, number> = new Map();
  
  addParticipant(id: string, initiative: number): void {
    this.initiatives.set(id, initiative);
  }
  
  getOrder(): string[] {
    return Array.from(this.initiatives.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);
  }
  
  getCurrentTurn(order: string[], currentIndex: number): string {
    return order[currentIndex % order.length];
  }
  
  nextTurn(currentIndex: number): number {
    return currentIndex + 1;
  }
}

// Export singleton instances
export const diceRoller = DiceRoller.getInstance();
