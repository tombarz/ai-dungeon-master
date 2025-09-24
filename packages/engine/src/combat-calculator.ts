/**
 * Helpers for lightweight combat-related calculations.
 */
export class CombatCalculator {
  static calculateArmorClass(baseAC: number, dexModifier: number, armorBonus: number): number {
    return baseAC + dexModifier + armorBonus;
  }

  static calculateProficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
  }
}
