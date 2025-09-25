import { describe, it, expect } from "vitest";
import {
  parseSession,
  parseCampaign,
  zSession,
  zCampaign,
  zPartyState,
  zEncounterState,
  zStatBlock,
  zCanonFact,
  zDiceRollResult,
  zDiceVerificationResult
} from "../src";

describe("AI Dungeon Master Models - Minimal MVP", () => {
  describe("Happy path session", () => {
    it("builds a minimal valid Session JSON and parseSession succeeds", () => {
      const minimalSession = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        campaignId: "550e8400-e29b-41d4-a716-446655440001",
        seed: "test-seed-789",
        timeline: [],
        state: {
          party: {
            characters: [{
              id: "550e8400-e29b-41d4-a716-446655440002",
              kind: "character",
              name: "Test Character",
              ac: 15,
              maxHP: 10,
              hp: 10,
              abilities: {
                STR: 15,
                DEX: 14,
                CON: 13,
                INT: 12,
                WIS: 10,
                CHA: 8
              }
            }]
          }
        },
        updatedAt: "2024-01-15T10:30:00.000Z"
      };

      expect(() => parseSession(minimalSession)).not.toThrow();
      const parsed = parseSession(minimalSession);
      expect(parsed).toMatchInlineSnapshot(`
        {
          "campaignId": "550e8400-e29b-41d4-a716-446655440001",
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "seed": "test-seed-789",
          "state": {
            "party": {
              "characters": [
                {
                  "abilities": {
                    "CHA": 8,
                    "CON": 13,
                    "DEX": 14,
                    "INT": 12,
                    "STR": 15,
                    "WIS": 10,
                  },
                  "ac": 15,
                  "conditions": [],
                  "hp": 10,
                  "id": "550e8400-e29b-41d4-a716-446655440002",
                  "immune": [],
                  "inventory": [],
                  "kind": "character",
                  "maxHP": 10,
                  "name": "Test Character",
                  "resist": [],
                  "skills": [],
                  "vuln": [],
                },
              ],
              "companions": [],
            },
          },
          "timeline": [],
          "updatedAt": "2024-01-15T10:30:00.000Z",
        }
      `);
    });
  });

  describe("Encounter integrity", () => {
    it("invalid when activeId not in initiative", () => {
      const invalidEncounter = {
        id: "550e8400-e29b-41d4-a716-446655440003",
        round: 1,
        initiative: ["550e8400-e29b-41d4-a716-446655440004", "550e8400-e29b-41d4-a716-446655440005"],
        activeId: "550e8400-e29b-41d4-a716-446655440006", // Not in initiative
        entities: {
          "550e8400-e29b-41d4-a716-446655440004": {
            id: "550e8400-e29b-41d4-a716-446655440004",
            kind: "character",
            name: "Character 1",
            ac: 15,
            maxHP: 10,
            hp: 10,
            abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
          },
          "550e8400-e29b-41d4-a716-446655440005": {
            id: "550e8400-e29b-41d4-a716-446655440005",
            kind: "character",
            name: "Character 2",
            ac: 15,
            maxHP: 10,
            hp: 10,
            abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
          }
        }
      };

      expect(() => zEncounterState.parse(invalidEncounter)).toThrow();
    });

    it("invalid when initiative id not present in entities", () => {
      const invalidEncounter = {
        id: "550e8400-e29b-41d4-a716-446655440007",
        round: 1,
        initiative: ["550e8400-e29b-41d4-a716-446655440008", "550e8400-e29b-41d4-a716-446655440009", "550e8400-e29b-41d4-a716-446655440010"], // char-3 not in entities
        activeId: "550e8400-e29b-41d4-a716-446655440008",
        entities: {
          "550e8400-e29b-41d4-a716-446655440008": {
            id: "550e8400-e29b-41d4-a716-446655440008",
            kind: "character",
            name: "Character 1",
            ac: 15,
            maxHP: 10,
            hp: 10,
            abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
          },
          "550e8400-e29b-41d4-a716-446655440009": {
            id: "550e8400-e29b-41d4-a716-446655440009",
            kind: "character",
            name: "Character 2",
            ac: 15,
            maxHP: 10,
            hp: 10,
            abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
          }
        }
      };

      expect(() => zEncounterState.parse(invalidEncounter)).toThrow();
    });
  });

  describe("Party constraints", () => {
    it("invalid when characters[] entry has kind !== 'character'", () => {
      const invalidParty = {
        characters: [{
          id: "550e8400-e29b-41d4-a716-446655440011",
          kind: "npc", // Should be 'character'
          name: "NPC Character",
          ac: 15,
          maxHP: 10,
          hp: 10,
          abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
        }]
      };

      expect(() => zPartyState.parse(invalidParty)).toThrow();
    });
  });

  describe("HP bounds", () => {
    it("invalid when hp > maxHP", () => {
      const invalidStatBlock = {
        ac: 15,
        maxHP: 10,
        hp: 15, // Greater than maxHP
        abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
      };

      expect(() => zStatBlock.parse(invalidStatBlock)).toThrow();
    });

    it("invalid when hp < 0", () => {
      const invalidStatBlock = {
        ac: 15,
        maxHP: 10,
        hp: -5, // Negative HP
        abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
      };

      expect(() => zStatBlock.parse(invalidStatBlock)).toThrow();
    });

    it("valid when hp === 0 or hp === maxHP", () => {
      const zeroHP = {
        ac: 15,
        maxHP: 10,
        hp: 0,
        abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
      };

      const fullHP = {
        ac: 15,
        maxHP: 10,
        hp: 10,
        abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
      };

      expect(() => zStatBlock.parse(zeroHP)).not.toThrow();
      expect(() => zStatBlock.parse(fullHP)).not.toThrow();
    });
  });

  describe("Abilities coverage", () => {
    it("invalid if abilities missing any of the six keys", () => {
      const missingAbilities = {
        ac: 15,
        maxHP: 10,
        hp: 10,
        abilities: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          // Missing CHA
        }
      };

      expect(() => zStatBlock.parse(missingAbilities)).toThrow();
    });

    it("invalid if any ability is outside [1, 30]", () => {
      const invalidAbility = {
        ac: 15,
        maxHP: 10,
        hp: 10,
        abilities: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 35 // Too high
        }
      };

      const invalidAbility2 = {
        ac: 15,
        maxHP: 10,
        hp: 10,
        abilities: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 0 // Too low
        }
      };

      expect(() => zStatBlock.parse(invalidAbility)).toThrow();
      expect(() => zStatBlock.parse(invalidAbility2)).toThrow();
    });
  });

  describe("ISO dates", () => {
    it("invalid createdAt/updatedAt when not ISO", () => {
      const invalidCampaign = {
        id: "550e8400-e29b-41d4-a716-446655440015",
        name: "Test Campaign",
        createdAt: "not-an-iso-date",
        settings: { language: "en", safety: "PG-13" }
      };

      const invalidSession = {
        id: "550e8400-e29b-41d4-a716-446655440016",
        campaignId: "550e8400-e29b-41d4-a716-446655440015",
        seed: "test-seed",
        timeline: [],
        state: { party: { characters: [] } },
        updatedAt: "also-not-an-iso-date"
      };

      expect(() => zCampaign.parse(invalidCampaign)).toThrow();
      expect(() => zSession.parse(invalidSession)).toThrow();
    });

    it("valid when properly formatted", () => {
      const validCampaign = {
        id: "550e8400-e29b-41d4-a716-446655440017",
        name: "Test Campaign",
        createdAt: "2024-01-15T10:30:00.000Z",
        settings: { language: "en", safety: "PG-13" }
      };

      const validSession = {
        id: "550e8400-e29b-41d4-a716-446655440018",
        campaignId: "550e8400-e29b-41d4-a716-446655440017",
        seed: "test-seed",
        timeline: [],
        state: { party: { characters: [] } },
        updatedAt: "2024-01-15T10:30:00.000Z"
      };

      expect(() => zCampaign.parse(validCampaign)).not.toThrow();
      expect(() => zSession.parse(validSession)).not.toThrow();
    });
  });

  describe("Defaults", () => {
    it("confirm arrays default to empty where specified", () => {
      const minimalSession = {
        id: "550e8400-e29b-41d4-a716-446655440012",
        campaignId: "550e8400-e29b-41d4-a716-446655440013",
        seed: "test-seed",
        timeline: [],
        state: {
          party: {
            characters: [{
              id: "550e8400-e29b-41d4-a716-446655440014",
              kind: "character",
              name: "Character 1",
              ac: 15,
              maxHP: 10,
              hp: 10,
              abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
            }]
          }
        },
        updatedAt: "2024-01-15T10:30:00.000Z"
      };

      const parsed = parseSession(minimalSession);
      expect(parsed.timeline).toEqual([]);
      expect(parsed.state.party.companions).toEqual([]);
      expect(parsed.state.party.characters[0].conditions).toEqual([]);
      expect(parsed.state.party.characters[0].inventory).toEqual([]);
    });
  });

  describe("Canon summary", () => {
    it("invalid if summary is blank/whitespace only", () => {
      const invalidCanon = {
        id: "canon-1",
        kind: "Lore",
        summary: "   " // Just whitespace
      };

      const invalidCanon2 = {
        id: "canon-2",
        kind: "Lore",
        summary: "" // Empty
      };

      expect(() => zCanonFact.parse(invalidCanon)).toThrow();
      expect(() => zCanonFact.parse(invalidCanon2)).toThrow();
    });

    it("valid when summary has content after trimming", () => {
      const validCanon = {
        id: "550e8400-e29b-41d4-a716-446655440019",
        kind: "Lore",
        summary: "  The Great War was a major conflict  " // Has content after trim
      };

      expect(() => zCanonFact.parse(validCanon)).not.toThrow();
    });
  });

  describe("Dice schemas", () => {
    it("accepts valid roll results", () => {
      const roll = {
        result: 12,
        breakdown: [6, 6],
        seed: "seed-123"
      };

      const parsed = zDiceRollResult.parse(roll);
      expect(parsed).toEqual(roll);
    });

    it("requires an explanation when verification fails", () => {
      const verified = { valid: true };
      expect(zDiceVerificationResult.parse(verified)).toEqual(verified);

      expect(() => zDiceVerificationResult.parse({ valid: false })).toThrow();

      const failed = { valid: false, error: "checksum mismatch" };
      expect(zDiceVerificationResult.parse(failed)).toEqual(failed);
    });
  });

});
