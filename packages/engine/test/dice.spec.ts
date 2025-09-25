import { describe, it, expect, beforeEach } from "vitest";
import { ProvablyFairDiceService, diceService } from "../src/dice";

describe("ProvablyFairDiceService", () => {
  let service: ProvablyFairDiceService;

  beforeEach(() => {
    service = new ProvablyFairDiceService();
  });

  describe("Basic Dice Rolling", () => {
    it("should roll a single d6", () => {
      const result = service.roll("1d6");
      
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThanOrEqual(6);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0]).toBeGreaterThanOrEqual(1);
      expect(result.breakdown[0]).toBeLessThanOrEqual(6);
      expect(result.seed).toBeDefined();
      expect(typeof result.seed).toBe("string");
      expect(result.seed.length).toBeGreaterThan(0);
    });

    it("should roll multiple dice", () => {
      const result = service.roll("3d6");
      
      expect(result.breakdown).toHaveLength(3);
      expect(result.result).toBe(result.breakdown.reduce((sum, roll) => sum + roll, 0));
      
      result.breakdown.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });

    it("should handle positive modifiers", () => {
      const result = service.roll("1d6+3");
      
      expect(result.breakdown).toHaveLength(1);
      expect(result.result).toBe(result.breakdown[0] + 3);
      expect(result.result).toBeGreaterThanOrEqual(4); // 1+3
      expect(result.result).toBeLessThanOrEqual(9);    // 6+3
    });

    it("should handle negative modifiers", () => {
      const result = service.roll("1d6-2");
      
      expect(result.breakdown).toHaveLength(1);
      expect(result.result).toBe(result.breakdown[0] - 2);
      expect(result.result).toBeGreaterThanOrEqual(-1); // 1-2
      expect(result.result).toBeLessThanOrEqual(4);     // 6-2
    });

    it("should handle complex expressions", () => {
      const result = service.roll("2d20+5");
      
      expect(result.breakdown).toHaveLength(2);
      expect(result.result).toBe(result.breakdown[0] + result.breakdown[1] + 5);
      
      result.breakdown.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(20);
      });
    });
  });

  describe("Determinism Tests", () => {
    it("should produce identical results with the same seed", () => {
      const seed = "test-seed-12345";
      
      const result1 = service.roll("2d6+3", seed);
      const result2 = service.roll("2d6+3", seed);
      
      expect(result1.result).toBe(result2.result);
      expect(result1.breakdown).toEqual(result2.breakdown);
      expect(result1.seed).toBe(result2.seed);
    });

    it("should produce different results with different seeds", () => {
      const result1 = service.roll("3d6");
      const result2 = service.roll("3d6");
      
      // With high probability, these should be different
      // (probability of identical 3d6 rolls is 1/216 ≈ 0.46%)
      expect(result1.seed).not.toBe(result2.seed);
    });

    it("should maintain determinism across complex expressions", () => {
      const seed = "complex-test-seed";
      
      const result1 = service.roll("5d10-15", seed);
      const result2 = service.roll("5d10-15", seed);
      
      expect(result1.result).toBe(result2.result);
      expect(result1.breakdown).toEqual(result2.breakdown);
      expect(result1.breakdown).toHaveLength(5);
    });

    it("should produce consistent results across multiple runs with same seed", () => {
      const seed = "consistency-test";
      const expression = "4d8+2";
      const runs = 10;
      
      const firstResult = service.roll(expression, seed);
      
      for (let i = 0; i < runs; i++) {
        const result = service.roll(expression, seed);
        expect(result.result).toBe(firstResult.result);
        expect(result.breakdown).toEqual(firstResult.breakdown);
      }
    });
  });

  describe("Verification Tests", () => {
    it("should verify valid roll results", () => {
      const seed = "verification-test";
      const result = service.roll("2d6+1", seed);
      
      const isValid = service.verify("2d6+1", seed, result.breakdown);
      expect(isValid).toBe(true);
    });

    it("should reject invalid breakdown", () => {
      const seed = "verification-test";
      const result = service.roll("2d6", seed);
      
      // Modify the breakdown to make it invalid
      const invalidBreakdown = [...result.breakdown];
      invalidBreakdown[0] = 7; // Invalid for d6
      
      const isValid = service.verify("2d6", seed, invalidBreakdown);
      expect(isValid).toBe(false);
    });

    it("should reject wrong breakdown length", () => {
      const seed = "verification-test";
      
      const isValid = service.verify("2d6", seed, [3]); // Only 1 die instead of 2
      expect(isValid).toBe(false);
    });

    it("should reject tampered results", () => {
      const seed = "verification-test";
      const result = service.roll("3d6", seed);
      
      // Try to verify with a different breakdown
      const tamperedBreakdown = [6, 6, 6]; // Perfect roll, unlikely to match
      
      const isValid = service.verify("3d6", seed, tamperedBreakdown);
      // This should be false unless the original roll was actually [6,6,6]
      if (result.breakdown.join(",") !== "6,6,6") {
        expect(isValid).toBe(false);
      }
    });

    it("should handle invalid expressions in verification", () => {
      const isValid = service.verify("invalid", "seed", [1, 2, 3]);
      expect(isValid).toBe(false);
    });
  });

  describe("Expression Validation Tests", () => {
    it("should reject empty expressions", () => {
      expect(() => service.roll("")).toThrow();
      expect(() => service.roll("   ")).toThrow();
    });

    it("should reject non-string expressions", () => {
      expect(() => service.roll(null as any)).toThrow();
      expect(() => service.roll(undefined as any)).toThrow();
    });

    it("should reject invalid formats", () => {
      const invalidExpressions = [
        "d6",           // Missing count
        "2d",           // Missing sides
        "2x6",          // Wrong separator
        "2d6*3",        // Invalid operator
        "hello",        // Non-numeric
        "2d6+",         // Incomplete modifier
        "2d6++3",       // Double operator
        "-2d6",         // Negative dice count
        "2d-6"          // Negative sides
      ];

      invalidExpressions.forEach(expr => {
        expect(() => service.roll(expr)).toThrow();
      });
    });

    it("should reject out-of-range values", () => {
      expect(() => service.roll("0d6")).toThrow();     // No dice
      expect(() => service.roll("101d6")).toThrow();   // Too many dice
      expect(() => service.roll("1d1")).toThrow();     // Too few sides
      expect(() => service.roll("1d1001")).toThrow();  // Too many sides
      expect(() => service.roll("1d6+10001")).toThrow(); // Modifier too large
      expect(() => service.roll("1d6-10001")).toThrow(); // Modifier too small
    });

    it("should accept valid edge cases", () => {
      expect(() => service.roll("1d2")).not.toThrow();    // Minimum sides
      expect(() => service.roll("100d1000")).not.toThrow(); // Maximum values
      expect(() => service.roll("1d6+10000")).not.toThrow(); // Max positive modifier
      expect(() => service.roll("1d6-10000")).not.toThrow(); // Max negative modifier
    });
  });

  describe("Advantage and Disadvantage", () => {
    it("should roll with advantage", () => {
      const seed = "advantage-test";
      const result = service.rollWithAdvantage("1d20", seed);
      
      expect(result.breakdown).toHaveLength(2); // Two d20 rolls
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThanOrEqual(20);
      expect(result.seed).toBe(seed);
      
      // Result should be the higher of the two rolls
      const [roll1, roll2] = result.breakdown;
      expect(result.result).toBe(Math.max(roll1, roll2));
    });

    it("should roll with disadvantage", () => {
      const seed = "disadvantage-test";
      const result = service.rollWithDisadvantage("1d20", seed);
      
      expect(result.breakdown).toHaveLength(2); // Two d20 rolls
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThanOrEqual(20);
      expect(result.seed).toBe(seed);
      
      // Result should be the lower of the two rolls
      const [roll1, roll2] = result.breakdown;
      expect(result.result).toBe(Math.min(roll1, roll2));
    });

    it("should be deterministic for advantage/disadvantage", () => {
      const seed = "deterministic-advantage";
      
      const result1 = service.rollWithAdvantage("1d20+5", seed);
      const result2 = service.rollWithAdvantage("1d20+5", seed);
      
      expect(result1.result).toBe(result2.result);
      expect(result1.breakdown).toEqual(result2.breakdown);
    });
  });

  describe("Distribution Sanity Tests", () => {
    it("should have reasonable distribution for d6", () => {
      const samples = 6000; // 1000 samples per face
      const results: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const result = service.roll("1d6");
        results.push(result.result);
      }
      
      // Calculate mean
      const mean = results.reduce((sum, val) => sum + val, 0) / samples;
      const expectedMean = 3.5; // Expected mean for 1d6
      
      // Mean should be within 0.2 of expected (generous tolerance for random variation)
      expect(Math.abs(mean - expectedMean)).toBeLessThan(0.2);
      
      // Check that we see all possible values
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBe(6);
      expect(uniqueValues.has(1)).toBe(true);
      expect(uniqueValues.has(6)).toBe(true);
    });

    it("should have reasonable distribution for 2d6+3", () => {
      const samples = 3600; // Large sample size
      const results: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const result = service.roll("2d6+3");
        results.push(result.result);
      }
      
      // Calculate mean
      const mean = results.reduce((sum, val) => sum + val, 0) / samples;
      const expectedMean = 10; // (3.5 * 2) + 3 = 10
      
      // Mean should be close to expected
      expect(Math.abs(mean - expectedMean)).toBeLessThan(0.3);
      
      // Check range (minimum: 2+3=5, maximum: 12+3=15)
      const min = Math.min(...results);
      const max = Math.max(...results);
      expect(min).toBeGreaterThanOrEqual(5);
      expect(max).toBeLessThanOrEqual(15);
    });

    it("should have reasonable distribution for advantage", () => {
      const samples = 2000;
      const normalResults: number[] = [];
      const advantageResults: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const normal = service.roll("1d20");
        const advantage = service.rollWithAdvantage("1d20");
        
        normalResults.push(normal.result);
        advantageResults.push(advantage.result);
      }
      
      const normalMean = normalResults.reduce((sum, val) => sum + val, 0) / samples;
      const advantageMean = advantageResults.reduce((sum, val) => sum + val, 0) / samples;
      
      // Advantage should have a higher mean than normal rolling
      expect(advantageMean).toBeGreaterThan(normalMean);
      
      // Advantage mean should be significantly higher (expected ≈ 13.8 vs 10.5)
      expect(advantageMean).toBeGreaterThan(12);
    });

    it("should have reasonable distribution for disadvantage", () => {
      const samples = 2000;
      const normalResults: number[] = [];
      const disadvantageResults: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const normal = service.roll("1d20");
        const disadvantage = service.rollWithDisadvantage("1d20");
        
        normalResults.push(normal.result);
        disadvantageResults.push(disadvantage.result);
      }
      
      const normalMean = normalResults.reduce((sum, val) => sum + val, 0) / samples;
      const disadvantageMean = disadvantageResults.reduce((sum, val) => sum + val, 0) / samples;
      
      // Disadvantage should have a lower mean than normal rolling
      expect(disadvantageMean).toBeLessThan(normalMean);
      
      // Disadvantage mean should be significantly lower (expected ≈ 7.2 vs 10.5)
      expect(disadvantageMean).toBeLessThan(9);
    });
  });

  describe("Singleton Instance", () => {
    it("should export a working singleton instance", () => {
      const result = diceService.roll("1d6");
      
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThanOrEqual(6);
      expect(result.breakdown).toHaveLength(1);
      expect(result.seed).toBeDefined();
    });

    it("should maintain consistency in singleton", () => {
      const seed = "singleton-test";
      
      const result1 = diceService.roll("2d8", seed);
      const result2 = diceService.roll("2d8", seed);
      
      expect(result1.result).toBe(result2.result);
      expect(result1.breakdown).toEqual(result2.breakdown);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle very large dice counts", () => {
      const result = service.roll("100d6");
      
      expect(result.breakdown).toHaveLength(100);
      expect(result.result).toBeGreaterThanOrEqual(100); // Minimum possible
      expect(result.result).toBeLessThanOrEqual(600);    // Maximum possible
      
      // All dice should be valid
      result.breakdown.forEach(die => {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      });
    });

    it("should handle very large dice sides", () => {
      const result = service.roll("1d1000");
      
      expect(result.breakdown).toHaveLength(1);
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThanOrEqual(1000);
    });

    it("should handle case insensitive expressions", () => {
      const result1 = service.roll("2D6");
      const result2 = service.roll("2d6");
      
      expect(result1.breakdown).toHaveLength(2);
      expect(result2.breakdown).toHaveLength(2);
      
      // Both should work (we can't compare results since they use different random seeds)
      result1.breakdown.forEach(die => {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      });
    });

    it("should handle whitespace in expressions", () => {
      const expressions = [
        " 2d6 ",
        "2d6 + 3",
        " 1d20 - 1 ",
        "  3d8+5  "
      ];

      expressions.forEach(expr => {
        expect(() => service.roll(expr)).not.toThrow();
      });
    });
  });
});
