import { describe, it, expect } from "vitest";
import {
  // Schemas
  abilitySchema,
  statBlockSchema,
  characterSchema,
  npcSchema,
  monsterSchema,
  actionSchema,
  effectInstanceSchema,
  questFlagSchema,
  canonFactSchema,
  partyStateSchema,
  encounterStateSchema,
  campaignSchema,
  sessionSchema,
  turnLogSchema,
  rollLogSchema,
  // Parsers
  parseSession,
  parseCampaign,
  parseCharacter,
  parseNPC,
  parseMonster,
  parseAbility,
  parseStatBlock,
  parseAction,
  parseEffectInstance,
  parseQuestFlag,
  parseCanonFact,
  parseTurnLog,
  parseRollLog,
  // Types
  type Ability,
  type Character,
  type NPC,
  type Monster,
  type Action,
  type EffectInstance,
  type QuestFlag,
  type CanonFact,
  type PartyState,
  type EncounterState,
  type Campaign,
  type Session,
  type TurnLog,
  type RollLog,
  type VersionedSession,
} from "../src";

describe("Domain Types and Zod Schemas", () => {
  describe("Ability Schema", () => {
    it("should validate valid ability scores", () => {
      const validAbility: Ability = {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      };

      expect(() => parseAbility(validAbility)).not.toThrow();
      expect(parseAbility(validAbility)).toEqual(validAbility);
    });

    it("should reject invalid ability scores", () => {
      const invalidAbility = {
        strength: 0, // Too low
        dexterity: 35, // Too high
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      };

      expect(() => parseAbility(invalidAbility)).toThrow();
    });

    it("should reject non-integer ability scores", () => {
      const invalidAbility = {
        strength: 15.5,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      };

      expect(() => parseAbility(invalidAbility)).toThrow();
    });
  });

  describe("Character Schema", () => {
    const validCharacter: Character = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Aragorn",
      level: 5,
      class: {
        name: "Ranger",
        hitDie: 10,
        primaryAbility: "dexterity",
        savingThrowProficiencies: ["strength", "dexterity"],
        armorProficiencies: ["light armor", "medium armor", "shields"],
        weaponProficiencies: ["simple weapons", "martial weapons"],
        toolProficiencies: [],
        skillProficiencies: ["animal handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
        features: ["favored enemy", "natural explorer", "spellcasting"],
      },
      race: "Human",
      background: "Noble",
      alignment: "Lawful Good",
      stats: {
        armorClass: 15,
        hitPoints: 45,
        speed: 30,
        abilities: {
          strength: 16,
          dexterity: 18,
          constitution: 14,
          intelligence: 13,
          wisdom: 15,
          charisma: 12,
        },
        skills: {
          athletics: 6,
          stealth: 8,
          perception: 5,
        },
        languages: ["Common", "Elvish", "Orcish"],
      },
      equipment: [
        {
          name: "Longsword",
          type: "weapon",
          description: "A well-balanced sword",
          damage: "1d8+3 slashing",
          weight: 3,
          value: 15,
          rarity: "common",
          magical: false,
          properties: ["versatile"],
        },
      ],
      spells: [],
      features: [],
      conditions: [],
      temporaryHitPoints: 0,
      hitDice: [
        {
          die: 10,
          count: 5,
          used: 2,
        },
      ],
      experiencePoints: 6500,
      inspiration: false,
    };

    it("should validate a complete character", () => {
      expect(() => parseCharacter(validCharacter)).not.toThrow();
      const parsed = parseCharacter(validCharacter);
      expect(parsed.name).toBe("Aragorn");
      expect(parsed.level).toBe(5);
      expect(parsed.stats.abilities.dexterity).toBe(18);
    });

    it("should reject character with invalid level", () => {
      const invalidCharacter = {
        ...validCharacter,
        level: 25, // Too high
      };

      expect(() => parseCharacter(invalidCharacter)).toThrow();
    });

    it("should reject character with invalid armor class", () => {
      const invalidCharacter = {
        ...validCharacter,
        stats: {
          ...validCharacter.stats,
          armorClass: 40, // Too high
        },
      };

      expect(() => parseCharacter(invalidCharacter)).toThrow();
    });

    it("should reject character with negative hit points", () => {
      const invalidCharacter = {
        ...validCharacter,
        stats: {
          ...validCharacter.stats,
          hitPoints: -5, // Negative
        },
      };

      expect(() => parseCharacter(invalidCharacter)).toThrow();
    });
  });

  describe("NPC Schema", () => {
    const validNPC: NPC = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Goblin Warrior",
      type: "humanoid",
      size: "small",
      alignment: "neutral evil",
      stats: {
        armorClass: 15,
        hitPoints: 7,
        speed: 30,
        abilities: {
          strength: 8,
          dexterity: 14,
          constitution: 10,
          intelligence: 10,
          wisdom: 8,
          charisma: 8,
        },
        skills: {
          stealth: 6,
        },
        languages: ["Common", "Goblin"],
        challengeRating: 0.25,
        proficiencyBonus: 2,
      },
      actions: [
        {
          name: "Scimitar",
          type: "action",
          description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.",
          range: "5 ft.",
          target: "one target",
          toHit: 4,
          damage: [
            {
              dice: "1d6+2",
              type: "slashing",
            },
          ],
        },
      ],
      reactions: [],
      legendaryActions: [],
      lairActions: [],
      regionalEffects: [],
      description: "A small, cunning humanoid with dark skin and yellow eyes.",
      isDead: false,
      currentHitPoints: 7,
      conditions: [],
    };

    it("should validate a complete NPC", () => {
      expect(() => parseNPC(validNPC)).not.toThrow();
      const parsed = parseNPC(validNPC);
      expect(parsed.name).toBe("Goblin Warrior");
      expect(parsed.type).toBe("humanoid");
      expect(parsed.actions).toHaveLength(1);
    });

    it("should reject NPC with invalid challenge rating", () => {
      const invalidNPC = {
        ...validNPC,
        stats: {
          ...validNPC.stats,
          challengeRating: 35, // Too high
        },
      };

      expect(() => parseNPC(invalidNPC)).toThrow();
    });
  });

  describe("Monster Schema", () => {
    const validMonster: Monster = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Adult Red Dragon",
      type: "dragon",
      size: "huge",
      alignment: "chaotic evil",
      stats: {
        armorClass: 19,
        hitPoints: 256,
        speed: 40,
        abilities: {
          strength: 27,
          dexterity: 10,
          constitution: 25,
          intelligence: 16,
          wisdom: 13,
          charisma: 21,
        },
        skills: {
          perception: 13,
          stealth: 6,
        },
        damageResistances: ["fire"],
        damageImmunities: ["fire"],
        conditionImmunities: ["frightened"],
        senses: {
          blindsight: "60 ft.",
          darkvision: "120 ft.",
        },
        languages: ["Common", "Draconic"],
        challengeRating: 17,
        proficiencyBonus: 6,
      },
      actions: [
        {
          name: "Multiattack",
          type: "action",
          description: "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.",
        },
        {
          name: "Bite",
          type: "action",
          description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.",
          range: "10 ft.",
          target: "one target",
          toHit: 14,
          damage: [
            {
              dice: "2d10+8",
              type: "piercing",
            },
            {
              dice: "2d6",
              type: "fire",
            },
          ],
        },
      ],
      legendaryActions: [
        {
          name: "Detect",
          type: "legendary action",
          description: "The dragon makes a Wisdom (Perception) check.",
          cost: 1,
        },
        {
          name: "Tail Attack",
          type: "legendary action",
          description: "The dragon makes a tail attack.",
          range: "15 ft.",
          target: "one target",
          toHit: 14,
          damage: [
            {
              dice: "2d8+8",
              type: "bludgeoning",
            },
          ],
          cost: 2,
        },
      ],
      lairActions: [
        {
          name: "Magma Eruption",
          type: "lair action",
          description: "A fountain of molten rock erupts from a point on the ground the dragon can see within 120 feet of it.",
          range: "120 ft.",
        },
      ],
      regionalEffects: [
        "The region containing a legendary red dragon's lair is warped by the dragon's magic.",
      ],
      description: "A massive, ancient dragon with crimson scales that shimmer like molten metal.",
      isDead: false,
      currentHitPoints: 256,
      legendaryResistances: 3,
      legendaryResistancesUsed: 0,
      conditions: [],
      challengeRating: 17,
      experiencePoints: 18000,
    };

    it("should validate a complete monster", () => {
      expect(() => parseMonster(validMonster)).not.toThrow();
      const parsed = parseMonster(validMonster);
      expect(parsed.name).toBe("Adult Red Dragon");
      expect(parsed.challengeRating).toBe(17);
      expect(parsed.legendaryActions).toHaveLength(2);
    });

    it("should reject monster with invalid experience points", () => {
      const invalidMonster = {
        ...validMonster,
        experiencePoints: -1000, // Negative
      };

      expect(() => parseMonster(invalidMonster)).toThrow();
    });
  });

  describe("Action Schema", () => {
    const validAction: Action = {
      name: "Fireball",
      type: "action",
      description: "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.",
      range: "150 feet",
      target: "Each creature in a 20-foot-radius sphere centered on that point",
      toHit: 15,
      damage: [
        {
          dice: "8d6",
          type: "fire",
        },
      ],
      effects: [],
    };

    it("should validate a complete action", () => {
      expect(() => parseAction(validAction)).not.toThrow();
      const parsed = parseAction(validAction);
      expect(parsed.name).toBe("Fireball");
      expect(parsed.damage).toHaveLength(1);
      expect(parsed.damage[0].dice).toBe("8d6");
    });

    it("should reject action with invalid dice notation", () => {
      const invalidAction = {
        ...validAction,
        damage: [
          {
            dice: "invalid-dice",
            type: "fire" as const,
          },
        ],
      };

      expect(() => parseAction(invalidAction)).toThrow();
    });
  });

  describe("Effect Instance Schema", () => {
    const validEffect: EffectInstance = {
      id: "550e8400-e29b-41d4-a716-446655440003",
      type: "condition",
      name: "Poisoned",
      description: "The target is poisoned and has disadvantage on attack rolls and ability checks.",
      duration: 10,
      remainingRounds: 8,
      target: "550e8400-e29b-41d4-a716-446655440000",
      source: "550e8400-e29b-41d4-a716-446655440001",
      stackable: false,
      concentration: false,
    };

    it("should validate a complete effect instance", () => {
      expect(() => parseEffectInstance(validEffect)).not.toThrow();
      const parsed = parseEffectInstance(validEffect);
      expect(parsed.name).toBe("Poisoned");
      expect(parsed.remainingRounds).toBe(8);
    });

    it("should reject effect with remaining rounds exceeding duration", () => {
      const invalidEffect = {
        ...validEffect,
        remainingRounds: 15, // Exceeds duration of 10
      };

      expect(() => parseEffectInstance(invalidEffect)).toThrow();
    });
  });

  describe("Quest Flag Schema", () => {
    const validQuestFlag: QuestFlag = {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Dragon Defeated",
      type: "boolean",
      value: true,
      description: "The red dragon has been defeated by the party",
      timestamp: new Date("2024-01-15T10:30:00Z"),
    };

    it("should validate a boolean quest flag", () => {
      expect(() => parseQuestFlag(validQuestFlag)).not.toThrow();
      const parsed = parseQuestFlag(validQuestFlag);
      expect(parsed.value).toBe(true);
    });

    it("should validate a number quest flag", () => {
      const numberFlag = {
        ...validQuestFlag,
        type: "number" as const,
        value: 42,
      };

      expect(() => parseQuestFlag(numberFlag)).not.toThrow();
    });

    it("should validate a string quest flag", () => {
      const stringFlag = {
        ...validQuestFlag,
        type: "string" as const,
        value: "The party has gained the trust of the villagers",
      };

      expect(() => parseQuestFlag(stringFlag)).not.toThrow();
    });
  });

  describe("Canon Fact Schema", () => {
    const validCanonFact: CanonFact = {
      id: "550e8400-e29b-41d4-a716-446655440005",
      title: "The Great War",
      content: "A massive conflict between the elves and orcs that lasted for 100 years, ending with the defeat of the orc armies at the Battle of the Three Hills.",
      category: "history",
      importance: "major",
      verified: true,
      source: "Elvish Historical Records",
      relatedFacts: [],
      timestamp: new Date("2024-01-10T14:20:00Z"),
    };

    it("should validate a complete canon fact", () => {
      expect(() => parseCanonFact(validCanonFact)).not.toThrow();
      const parsed = parseCanonFact(validCanonFact);
      expect(parsed.title).toBe("The Great War");
      expect(parsed.importance).toBe("major");
    });

    it("should reject canon fact with invalid category", () => {
      const invalidFact = {
        ...validCanonFact,
        category: "invalid-category",
      };

      expect(() => parseCanonFact(invalidFact)).toThrow();
    });
  });

  describe("Turn Log Schema", () => {
    const validTurnLog: TurnLog = {
      id: "550e8400-e29b-41d4-a716-446655440006",
      turn: 1,
      actor: "550e8400-e29b-41d4-a716-446655440000",
      action: "Attacks with longsword",
      target: "550e8400-e29b-41d4-a716-446655440001",
      result: "Hit for 8 slashing damage",
      damage: 8,
      effects: [],
      timestamp: new Date("2024-01-15T10:35:00Z"),
    };

    it("should validate a complete turn log entry", () => {
      expect(() => parseTurnLog(validTurnLog)).not.toThrow();
      const parsed = parseTurnLog(validTurnLog);
      expect(parsed.turn).toBe(1);
      expect(parsed.damage).toBe(8);
    });

    it("should reject turn log with invalid turn number", () => {
      const invalidTurnLog = {
        ...validTurnLog,
        turn: 0, // Must be at least 1
      };

      expect(() => parseTurnLog(invalidTurnLog)).toThrow();
    });
  });

  describe("Roll Log Schema", () => {
    const validRollLog: RollLog = {
      id: "550e8400-e29b-41d4-a716-446655440007",
      actor: "550e8400-e29b-41d4-a716-446655440000",
      type: "attack",
      dice: "1d20+5",
      result: 18,
      naturalRoll: 13,
      modifier: 5,
      advantage: false,
      success: true,
      target: "550e8400-e29b-41d4-a716-446655440001",
      description: "Longsword attack against goblin",
      timestamp: new Date("2024-01-15T10:36:00Z"),
    };

    it("should validate a complete roll log entry", () => {
      expect(() => parseRollLog(validRollLog)).not.toThrow();
      const parsed = parseRollLog(validRollLog);
      expect(parsed.result).toBe(18);
      expect(parsed.naturalRoll).toBe(13);
      expect(parsed.modifier).toBe(5);
    });

    it("should reject roll log with invalid dice notation", () => {
      const invalidRollLog = {
        ...validRollLog,
        dice: "invalid-dice-notation",
      };

      expect(() => parseRollLog(invalidRollLog)).toThrow();
    });

    it("should reject roll log with invalid natural roll", () => {
      const invalidRollLog = {
        ...validRollLog,
        naturalRoll: 25, // Must be 1-20 for d20 rolls
      };

      expect(() => parseRollLog(invalidRollLog)).toThrow();
    });
  });

  describe("Session Schema", () => {
    const validSession: Session = {
      id: "550e8400-e29b-41d4-a716-446655440008",
      campaignId: "550e8400-e29b-41d4-a716-446655440009",
      name: "Session 1: The Goblin Cave",
      date: new Date("2024-01-15T19:00:00Z"),
      duration: 240, // 4 hours in minutes
      participants: ["550e8400-e29b-41d4-a716-446655440000"],
      encounters: [],
      questFlags: [],
      canonFacts: [],
      experienceGained: 300,
      goldGained: 50,
      notes: "The party explored the goblin cave and defeated the goblin warriors.",
      turnLog: [],
      rollLog: [],
      status: "completed",
      createdAt: new Date("2024-01-15T18:30:00Z"),
      updatedAt: new Date("2024-01-15T23:00:00Z"),
    };

    it("should validate a complete session", () => {
      expect(() => parseSession(validSession)).not.toThrow();
      const parsed = parseSession(validSession);
      expect(parsed.name).toBe("Session 1: The Goblin Cave");
      expect(parsed.duration).toBe(240);
      expect(parsed.status).toBe("completed");
    });

    it("should reject session with negative duration", () => {
      const invalidSession = {
        ...validSession,
        duration: -30, // Negative duration
      };

      expect(() => parseSession(invalidSession)).toThrow();
    });

    it("should reject session with negative experience", () => {
      const invalidSession = {
        ...validSession,
        experienceGained: -100, // Negative experience
      };

      expect(() => parseSession(invalidSession)).toThrow();
    });

    it("should create a minimal valid session snapshot", () => {
      const minimalSession: Session = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        campaignId: "550e8400-e29b-41d4-a716-446655440011",
        name: "Minimal Session",
        date: new Date("2024-01-01T00:00:00Z"),
        duration: 0,
        participants: [],
        encounters: [],
        questFlags: [],
        canonFacts: [],
        experienceGained: 0,
        goldGained: 0,
        notes: "",
        turnLog: [],
        rollLog: [],
        status: "planned",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      expect(() => parseSession(minimalSession)).not.toThrow();
      
      // Create snapshot for regression testing
      expect(minimalSession).toMatchSnapshot();
    });
  });

  describe("Campaign Schema", () => {
    const validCampaign: Campaign = {
      id: "550e8400-e29b-41d4-a716-446655440009",
      name: "The Lost Mines of Phandelver",
      description: "A classic D&D adventure for new players",
      setting: "Forgotten Realms",
      level: 5,
      party: {
        id: "550e8400-e29b-41d4-a716-446655440012",
        name: "The Heroes of Phandalin",
        characters: [],
        level: 5,
        experiencePoints: 6500,
        gold: 250,
        reputation: {
          "Lord's Alliance": 2,
          "Harpers": 1,
        },
        questFlags: [],
        inventory: [],
        notes: "A brave group of adventurers seeking fortune and glory.",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-15T23:00:00Z"),
      },
      encounters: [],
      canonFacts: [],
      sessions: [],
      notes: "A classic adventure that introduces new players to D&D.",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-15T23:00:00Z"),
    };

    it("should validate a complete campaign", () => {
      expect(() => parseCampaign(validCampaign)).not.toThrow();
      const parsed = parseCampaign(validCampaign);
      expect(parsed.name).toBe("The Lost Mines of Phandelver");
      expect(parsed.party.name).toBe("The Heroes of Phandalin");
    });

    it("should reject campaign with invalid level", () => {
      const invalidCampaign = {
        ...validCampaign,
        level: 25, // Too high
      };

      expect(() => parseCampaign(invalidCampaign)).toThrow();
    });
  });

  describe("Array Defaults", () => {
    it("should default empty arrays for optional fields", () => {
      const minimalAbility = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      };

      const parsed = abilitySchema.parse(minimalAbility);
      expect(parsed).toEqual(minimalAbility);
    });

    it("should default empty arrays in stat blocks", () => {
      const minimalStatBlock = {
        armorClass: 10,
        hitPoints: 10,
        speed: 30,
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      };

      const parsed = statBlockSchema.parse(minimalStatBlock);
      expect(parsed.damageResistances).toEqual([]);
      expect(parsed.damageImmunities).toEqual([]);
      expect(parsed.damageVulnerabilities).toEqual([]);
      expect(parsed.conditionImmunities).toEqual([]);
      expect(parsed.languages).toEqual([]);
    });
  });

  describe("Versioned Types", () => {
    it("should validate versioned session", () => {
      const versionedSession: VersionedSession = {
        version: 1,
        data: {
          id: "550e8400-e29b-41d4-a716-446655440013",
          campaignId: "550e8400-e29b-41d4-a716-446655440014",
          name: "Versioned Session",
          date: new Date("2024-01-01T00:00:00Z"),
          duration: 0,
          participants: [],
          encounters: [],
          questFlags: [],
          canonFacts: [],
          experienceGained: 0,
          goldGained: 0,
          notes: "",
          turnLog: [],
          rollLog: [],
          status: "planned",
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        },
      };

      expect(() => parseSession(versionedSession.data)).not.toThrow();
      expect(versionedSession.version).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum valid values", () => {
      const maxAbility: Ability = {
        strength: 30,
        dexterity: 30,
        constitution: 30,
        intelligence: 30,
        wisdom: 30,
        charisma: 30,
      };

      expect(() => parseAbility(maxAbility)).not.toThrow();
    });

    it("should handle minimum valid values", () => {
      const minAbility: Ability = {
        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        charisma: 1,
      };

      expect(() => parseAbility(minAbility)).not.toThrow();
    });

    it("should handle zero values where appropriate", () => {
      const zeroStatBlock = {
        armorClass: 5,
        hitPoints: 0,
        speed: 0,
        abilities: {
          strength: 1,
          dexterity: 1,
          constitution: 1,
          intelligence: 1,
          wisdom: 1,
          charisma: 1,
        },
      };

      expect(() => parseStatBlock(zeroStatBlock)).not.toThrow();
    });
  });
});
