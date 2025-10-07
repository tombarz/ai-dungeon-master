import { randomUUID } from "crypto";

import type { Ability, Creature, PlayerCharacter } from "@ai-dungeon-master/models";

const DEFAULT_ABILITY_ORDER: Ability[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
const MIN_LEVEL = 1;
const MAX_LEVEL = 20;
const MIN_ARMOR_CLASS = 5;
const MIN_HIT_POINTS = 1;

export type CharacterField =
  | "name"
  | "race"
  | "class"
  | "level"
  | "abilities"
  | "ac"
  | "maxHP"
  | "hp"
  | "backstory";

export interface CharacterDraft
  extends Partial<
    Pick<
      Creature,
      "id" | "kind" | "name" | "race" | "class" | "level" | "ac" | "maxHP" | "hp" | "abilities"
    >
  > {
  backstory?: string;
}

export interface CharacterQuestion {
  field: CharacterField;
  prompt: string;
}

const FIELD_PROMPTS: Record<CharacterField, string> = {
  name: "What's the character's name?",
  race: "What race is the character (e.g., Human, Elf, Dwarf)?",
  class: "What class does the character belong to (e.g., Fighter, Wizard)?",
  level: "What level is the character? (1-20)",
  abilities:
    "Provide ability scores for STR, DEX, CON, INT, WIS, CHA (e.g., '15 14 13 12 10 8') or say 'auto' for the standard array.",
  ac: "What is the character's armor class?",
  maxHP: "What is the character's maximum hit points?",
  hp: "What is the character's starting hit points?",
  backstory: "Share a brief backstory (under 100 words).",
};

const REQUIRED_FIELDS: CharacterField[] = [
  "name",
  "race",
  "class",
  "level",
  "abilities",
  "ac",
  "maxHP",
  "hp",
  "backstory",
];

export const createEmptyDraft = (): CharacterDraft => ({ kind: "character" });

export const generateStandardAbilityScores = (
  order: Ability[] = DEFAULT_ABILITY_ORDER,
): Record<Ability, number> => {
  const result = {} as Record<Ability, number>;
  order.forEach((ability, index) => {
    result[ability] = STANDARD_ARRAY[Math.min(index, STANDARD_ARRAY.length - 1)];
  });
  return result;
};

export const parseAbilityInput = (answer: string): Record<Ability, number> | null => {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return null;
  if (["auto", "standard", "default", "yes"].includes(normalized)) {
    return generateStandardAbilityScores();
  }

  const explicitMatches = Array.from(
    normalized.matchAll(/(str|dex|con|int|wis|cha)\s*[:=]?\s*(\d{1,2})/gi),
  );

  if (explicitMatches.length > 0) {
    const abilityMap: Partial<Record<Ability, number>> = {};
    explicitMatches.forEach(([, key, raw]) => {
      const ability = key.toUpperCase() as Ability;
      const value = clamp(parseInt(raw, 10), 1, 30);
      abilityMap[ability] = value;
    });
    if (DEFAULT_ABILITY_ORDER.every((ability) => abilityMap[ability] !== undefined)) {
      return abilityMap as Record<Ability, number>;
    }
  }

  const numberTokens = normalized
    .split(/[^0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (numberTokens.length === DEFAULT_ABILITY_ORDER.length) {
    const abilityScores = {} as Record<Ability, number>;
    DEFAULT_ABILITY_ORDER.forEach((ability, index) => {
      const score = clamp(parseInt(numberTokens[index]!, 10), 1, 30);
      abilityScores[ability] = score;
    });
    return abilityScores;
  }

  return null;
};
export const applyAnswerToDraft = (
  draft: CharacterDraft,
  field: CharacterField,
  answer: string,
): { draft: CharacterDraft; error?: string } => {
  const trimmed = answer.trim();
  if (!trimmed) {
    return { draft, error: "Please provide a response." };
  }

  switch (field) {
    case "name":
    case "race":
    case "class":
      return { draft: { ...draft, [field]: trimmed } };
    case "level": {
      const value = clamp(parseInt(trimmed, 10), MIN_LEVEL, MAX_LEVEL);
      if (Number.isNaN(value)) {
        return { draft, error: "Unable to parse level." };
      }
      return { draft: { ...draft, level: value } };
    }
    case "ac": {
      const value = clamp(parseInt(trimmed, 10), MIN_ARMOR_CLASS, 99);
      if (Number.isNaN(value)) {
        return { draft, error: "Unable to parse armor class." };
      }
      return { draft: { ...draft, ac: value } };
    }
    case "maxHP": {
      const value = clamp(parseInt(trimmed, 10), MIN_HIT_POINTS, 999);
      if (Number.isNaN(value)) {
        return { draft, error: "Unable to parse maximum hit points." };
      }
      const nextDraft = { ...draft, maxHP: value };
      if (nextDraft.hp !== undefined && nextDraft.hp > value) {
        nextDraft.hp = value;
      }
      return { draft: nextDraft };
    }
    case "hp": {
      const value = clamp(parseInt(trimmed, 10), MIN_HIT_POINTS, 999);
      if (Number.isNaN(value)) {
        return { draft, error: "Unable to parse current hit points." };
      }
      const maxHP = draft.maxHP ?? value;
      return { draft: { ...draft, hp: Math.min(value, maxHP), maxHP } };
    }
    case "abilities": {
      const abilities = parseAbilityInput(trimmed);
      if (!abilities) {
        return { draft, error: "Unable to interpret ability scores. Try 'auto' or provide values for STR DEX CON INT WIS CHA." };
      }
      return { draft: { ...draft, abilities } };
    }
    case "backstory":
      return { draft: { ...draft, backstory: trimmed } };
    default:
      return { draft };
  }
};

export const getMissingFields = (draft: CharacterDraft): CharacterField[] => {
  const missing: CharacterField[] = [];
  REQUIRED_FIELDS.forEach((field) => {
    if (!hasFieldValue(draft, field)) {
      missing.push(field);
    }
  });
  return missing;
};

export const getNextQuestion = (draft: CharacterDraft): CharacterQuestion | null => {
  const missing = getMissingFields(draft);
  if (missing.length === 0) return null;
  const field = missing[0]!;
  return { field, prompt: FIELD_PROMPTS[field] };
};

export const isDraftComplete = (draft: CharacterDraft): draft is CharacterDraft & {
  name: string;
  race: string;
  class: string;
  level: number;
  abilities: Record<Ability, number>;
  ac: number;
  maxHP: number;
  hp: number;
  backstory: string;
} => getMissingFields(draft).length === 0;

export const finalizeCharacter = (draft: CharacterDraft): PlayerCharacter => {
  if (!isDraftComplete(draft)) {
    throw new Error("Character draft is incomplete");
  }

  const id = draft.id ?? safeUUID();
  const hp = Math.min(draft.hp, draft.maxHP);

  return {
    id,
    kind: "character",
    name: draft.name,
    race: draft.race,
    class: draft.class,
    level: draft.level,
    abilities: draft.abilities,
    ac: draft.ac,
    maxHP: draft.maxHP,
    hp,
    backstory: draft.backstory,
  };
};

const hasFieldValue = (draft: CharacterDraft, field: CharacterField): boolean => {
  switch (field) {
    case "name":
    case "race":
    case "class":
    case "backstory":
      return typeof draft[field] === "string" && draft[field]!.trim().length > 0;
    case "level":
      return typeof draft.level === "number" && draft.level >= MIN_LEVEL;
    case "ac":
      return typeof draft.ac === "number" && draft.ac >= MIN_ARMOR_CLASS;
    case "maxHP":
      return typeof draft.maxHP === "number" && draft.maxHP >= MIN_HIT_POINTS;
    case "hp":
      return typeof draft.hp === "number" && draft.hp >= MIN_HIT_POINTS;
    case "abilities":
      return (
        !!draft.abilities &&
        DEFAULT_ABILITY_ORDER.every((ability) =>
          typeof draft.abilities![ability] === "number" && draft.abilities![ability]! >= 1,
        )
      );
    default:
      return false;
  }
};

const safeUUID = () => {
  if (typeof randomUUID === "function") return randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

