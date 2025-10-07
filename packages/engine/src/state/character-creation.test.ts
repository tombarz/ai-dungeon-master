import { describe, expect, it } from "vitest";

import {
  applyAnswerToDraft,
  createEmptyDraft,
  finalizeCharacter,
  generateStandardAbilityScores,
  getMissingFields,
  getNextQuestion,
  isDraftComplete,
  parseAbilityInput,
} from "./character-creation";

const abilityKeys = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

describe("character creation helpers", () => {
  it("returns the standard array when auto is requested", () => {
    const abilities = parseAbilityInput("auto");
    expect(abilities).toEqual(generateStandardAbilityScores());
  });

  it("parses explicit ability mappings", () => {
    const abilities = parseAbilityInput("STR 16, DEX 14, CON 13, INT 12, WIS 10, CHA 9");
    expect(abilities).toEqual({ STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 });
  });

  it("parses numeric sequences in ability order", () => {
    const abilities = parseAbilityInput("15 14 13 12 10 8");
    expect(abilities).toEqual({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 });
  });

  it("tracks missing fields and produces next questions", () => {
    const draft = createEmptyDraft();
    const firstQuestion = getNextQuestion(draft);
    expect(firstQuestion?.field).toBe("name");
    expect(getMissingFields(draft)).toContain("race");
  });

  it("advances the draft as answers are applied", () => {
    let draft = createEmptyDraft();
    ({ draft } = applyAnswerToDraft(draft, "name", "Eira"));
    ({ draft } = applyAnswerToDraft(draft, "race", "Elf"));
    ({ draft } = applyAnswerToDraft(draft, "class", "Wizard"));
    ({ draft } = applyAnswerToDraft(draft, "level", "3"));
    ({ draft } = applyAnswerToDraft(draft, "abilities", "15 14 13 12 10 8"));
    ({ draft } = applyAnswerToDraft(draft, "ac", "16"));
    ({ draft } = applyAnswerToDraft(draft, "maxHP", "24"));
    ({ draft } = applyAnswerToDraft(draft, "hp", "24"));
    ({ draft } = applyAnswerToDraft(draft, "backstory", "An apprentice seeking lost lore."));

    expect(isDraftComplete(draft)).toBe(true);
    expect(getMissingFields(draft)).toHaveLength(0);
  });

  it("finalizes a complete draft into a player character", () => {
    let draft = createEmptyDraft();
    ({ draft } = applyAnswerToDraft(draft, "name", "Eira"));
    ({ draft } = applyAnswerToDraft(draft, "race", "Elf"));
    ({ draft } = applyAnswerToDraft(draft, "class", "Wizard"));
    ({ draft } = applyAnswerToDraft(draft, "level", "3"));
    ({ draft } = applyAnswerToDraft(draft, "abilities", "15 14 13 12 10 8"));
    ({ draft } = applyAnswerToDraft(draft, "ac", "16"));
    ({ draft } = applyAnswerToDraft(draft, "maxHP", "24"));
    ({ draft } = applyAnswerToDraft(draft, "hp", "20"));
    ({ draft } = applyAnswerToDraft(draft, "backstory", "An apprentice seeking lost lore."));

    const character = finalizeCharacter(draft);
    expect(character.kind).toBe("character");
    expect(character.name).toBe("Eira");
    expect(character.hp).toBe(20);
    expect(abilityKeys.every((key) => character.abilities[key] !== undefined)).toBe(true);
  });
});
