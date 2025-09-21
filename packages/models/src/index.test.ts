import { describe, it, expect } from "vitest";
import { Character, CharacterClass, ItemType, ItemRarity } from "./index";

describe("Models", () => {
  it("should create a valid character", () => {
    const characterClass: CharacterClass = {
      id: "fighter",
      name: "Fighter",
      description: "A warrior",
      hitDie: 10,
      primaryAbility: "strength",
    };

    const character: Character = {
      id: "test-character",
      name: "Test Hero",
      level: 1,
      class: characterClass,
      stats: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      inventory: [],
    };

    expect(character.name).toBe("Test Hero");
    expect(character.level).toBe(1);
    expect(character.class.name).toBe("Fighter");
    expect(character.stats.strength).toBe(15);
  });

  it("should have valid enum values", () => {
    expect(ItemType.WEAPON).toBe("weapon");
    expect(ItemType.ARMOR).toBe("armor");
    expect(ItemRarity.COMMON).toBe("common");
    expect(ItemRarity.LEGENDARY).toBe("legendary");
  });
});
