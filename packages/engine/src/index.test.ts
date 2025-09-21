import { describe, it, expect } from "vitest";
import { diceRoller, AbilityScoreCalculator, CombatCalculator } from "./index";

describe("Engine", () => {
  describe("DiceRoller", () => {
    it("should roll a d20", () => {
      const result = diceRoller.rollD20();
      expect(result.base).toBeGreaterThanOrEqual(1);
      expect(result.base).toBeLessThanOrEqual(20);
      expect(result.total).toBe(result.base + result.modifier);
    });

    it("should roll with advantage", () => {
      const result = diceRoller.rollD20WithAdvantage();
      expect(result.advantage).toBe(true);
      expect(result.rolls).toHaveLength(2);
      expect(result.base).toBe(Math.max(...result.rolls));
    });

    it("should roll with disadvantage", () => {
      const result = diceRoller.rollD20WithDisadvantage();
      expect(result.disadvantage).toBe(true);
      expect(result.rolls).toHaveLength(2);
      expect(result.base).toBe(Math.min(...result.rolls));
    });
  });

  describe("AbilityScoreCalculator", () => {
    it("should calculate ability modifier", () => {
      expect(AbilityScoreCalculator.getModifier(10)).toBe(0);
      expect(AbilityScoreCalculator.getModifier(12)).toBe(1);
      expect(AbilityScoreCalculator.getModifier(8)).toBe(-1);
      expect(AbilityScoreCalculator.getModifier(18)).toBe(4);
    });

    it("should roll ability scores", () => {
      const stats = AbilityScoreCalculator.rollAbilityScores();
      expect(stats.strength).toBeGreaterThanOrEqual(3);
      expect(stats.strength).toBeLessThanOrEqual(18);
      expect(stats.dexterity).toBeGreaterThanOrEqual(3);
      expect(stats.dexterity).toBeLessThanOrEqual(18);
    });
  });

  describe("CombatCalculator", () => {
    it("should calculate armor class", () => {
      const ac = CombatCalculator.calculateArmorClass(10, 2, 3);
      expect(ac).toBe(15); // 10 + 2 + 3
    });

    it("should calculate proficiency bonus", () => {
      expect(CombatCalculator.calculateProficiencyBonus(1)).toBe(2);
      expect(CombatCalculator.calculateProficiencyBonus(5)).toBe(3);
      expect(CombatCalculator.calculateProficiencyBonus(9)).toBe(4);
      expect(CombatCalculator.calculateProficiencyBonus(13)).toBe(5);
    });
  });
});
