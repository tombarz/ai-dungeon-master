import { DiceRoller } from "./dice-roller";

/**
 * Calculates D&D ability score modifiers and ability arrays.
 */
export class AbilityScoreCalculator {
  static getModifier(abilityScore: number): number {
    return Math.floor((abilityScore - 10) / 2);
  }

  static rollAbilityScores(roller: DiceRoller = new DiceRoller()): {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  } {
    const rollStat = (): number => {
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
