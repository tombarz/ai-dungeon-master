import { describe, it, expect } from "vitest";
import { parseAbility, parseCharacter } from "./index";

describe("Legacy Models Compatibility", () => {
  it("should parse basic ability scores", () => {
    const ability = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };

    expect(() => parseAbility(ability)).not.toThrow();
    const parsed = parseAbility(ability);
    expect(parsed.strength).toBe(15);
  });

  it("should parse a minimal character", () => {
    const character = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Hero",
      level: 1,
      class: {
        name: "Fighter",
        hitDie: 10,
        primaryAbility: "strength" as const,
        savingThrowProficiencies: [],
        armorProficiencies: [],
        weaponProficiencies: [],
        toolProficiencies: [],
        skillProficiencies: [],
        features: [],
      },
      race: "Human",
      background: "Soldier",
      alignment: "Lawful Good",
      stats: {
        armorClass: 16,
        hitPoints: 12,
        speed: 30,
        abilities: {
          strength: 16,
          dexterity: 13,
          constitution: 15,
          intelligence: 12,
          wisdom: 14,
          charisma: 10,
        },
      },
    };

    expect(() => parseCharacter(character)).not.toThrow();
    const parsed = parseCharacter(character);
    expect(parsed.name).toBe("Test Hero");
    expect(parsed.level).toBe(1);
  });
});
