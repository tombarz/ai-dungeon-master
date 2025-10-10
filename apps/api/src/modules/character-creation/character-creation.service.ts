import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type {
  Ability,
  PlayerCharacter,
  CharacterDraft,
  CharacterField,
  CharacterQuestion,
  CompleteCharacterDraft,
} from '@ai-dungeon-master/models';
import { ExtractionService } from './extraction.service';

const DEFAULT_ABILITY_ORDER: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
const MIN_LEVEL = 1;
const MAX_LEVEL = 20;
const MIN_ARMOR_CLASS = 5;
const MIN_HIT_POINTS = 1;

const FIELD_PROMPTS: Record<CharacterField, string> = {
  name: "What's the character's name?",
  race: 'What race is the character (e.g., Human, Elf, Dwarf)?',
  class: 'What class does the character belong to (e.g., Fighter, Wizard)?',
  level: 'What level is the character? (1-20)',
  abilities:
    "Provide ability scores for STR, DEX, CON, INT, WIS, CHA (e.g., '15 14 13 12 10 8') or say 'auto' for the standard array.",
  ac: "What is the character's armor class?",
  maxHP: "What is the character's maximum hit points?",
  hp: "What is the character's starting hit points?",
  backstory: 'Share a brief backstory (under 100 words).',
};

const REQUIRED_FIELDS: CharacterField[] = [
  'name',
  'race',
  'class',
  'level',
  'abilities',
  'ac',
  'maxHP',
  'hp',
  'backstory',
];

@Injectable()
export class CharacterCreationService {
  constructor(private readonly extractor?: ExtractionService) {}

  createEmptyDraft(): CharacterDraft {
    return { kind: 'character' };
  }

  generateStandardAbilityScores(order: Ability[] = DEFAULT_ABILITY_ORDER): Record<Ability, number> {
    const result = {} as Record<Ability, number>;
    order.forEach((ability, index) => {
      result[ability] = STANDARD_ARRAY[Math.min(index, STANDARD_ARRAY.length - 1)];
    });
    return result;
  }

  parseAbilityInput(answer: string): Record<Ability, number> | null {
    const normalized = answer.trim().toLowerCase();
    if (!normalized) return null;
    if (["auto", "standard", "default", "yes"].includes(normalized)) {
      return this.generateStandardAbilityScores();
    }
    return null;
  }

  async applyAnswerToDraft(
    draft: CharacterDraft,
    field: CharacterField,
    answer: string,
  ): Promise<{ draft: CharacterDraft; error?: string }> {
    const trimmed = answer.trim();
    if (!trimmed) {
      return { draft, error: 'Please provide a response.' };
    }

    switch (field) {
      case 'name':
      case 'race':
      case 'class':
        return { draft: { ...draft, [field]: trimmed } };
      case 'level': {
        if (!/^\d+$/.test(trimmed) && this.extractor) {
          const u = await this.extractor.extractCharacterUpdate(trimmed, ['level']);
          if (u.level !== undefined) {
            return { draft: { ...draft, level: u.level } };
          }
        }
        const parsed = parseInt(trimmed, 10);
        if (Number.isNaN(parsed)) {
          return { draft, error: 'Unable to parse level.' };
        }
        const value = clamp(parsed, MIN_LEVEL, MAX_LEVEL);
        return { draft: { ...draft, level: value } };
      }
      case 'ac': {
        if (!/^\d+$/.test(trimmed) && this.extractor) {
          const u = await this.extractor.extractCharacterUpdate(trimmed, ['ac']);
          if (u.ac !== undefined) {
            return { draft: { ...draft, ac: u.ac } };
          }
        }
        const parsed = parseInt(trimmed, 10);
        if (Number.isNaN(parsed)) {
          return { draft, error: 'Unable to parse armor class.' };
        }
        const value = clamp(parsed, MIN_ARMOR_CLASS, 99);
        return { draft: { ...draft, ac: value } };
      }
      case 'maxHP': {
        if (!/^\d+$/.test(trimmed) && this.extractor) {
          const u = await this.extractor.extractCharacterUpdate(trimmed, ['maxHP']);
          if (u.maxHP !== undefined) {
            const nextDraft = { ...draft, maxHP: u.maxHP } as CharacterDraft;
            if (nextDraft.hp !== undefined && nextDraft.hp > u.maxHP) nextDraft.hp = u.maxHP;
            return { draft: nextDraft };
          }
        }
        const parsed = parseInt(trimmed, 10);
        if (Number.isNaN(parsed)) {
          return { draft, error: 'Unable to parse maximum hit points.' };
        }
        const value = clamp(parsed, MIN_HIT_POINTS, 999);
        const nextDraft = { ...draft, maxHP: value } as CharacterDraft;
        if (nextDraft.hp !== undefined && nextDraft.hp > value) {
          nextDraft.hp = value;
        }
        return { draft: nextDraft };
      }
      case 'hp': {
        if (!/^\d+$/.test(trimmed) && this.extractor) {
          const u = await this.extractor.extractCharacterUpdate(trimmed, ['hp']);
          if (u.hp !== undefined) {
            const maxHP = draft.maxHP ?? u.hp;
            return { draft: { ...draft, hp: Math.min(u.hp, maxHP), maxHP } };
          }
        }
        const parsed = parseInt(trimmed, 10);
        if (Number.isNaN(parsed)) {
          return { draft, error: 'Unable to parse current hit points.' };
        }
        const value = clamp(parsed, MIN_HIT_POINTS, 999);
        const maxHP = draft.maxHP ?? value;
        return { draft: { ...draft, hp: Math.min(value, maxHP), maxHP } };
      }
      case 'abilities': {
        const abilities = this.parseAbilityInput(trimmed);
        if (!abilities && this.extractor) {
          const u = await this.extractor.extractCharacterUpdate(trimmed, ['abilities']);
          if (u.abilities) {
            return { draft: { ...draft, abilities: u.abilities } };
          }
        }
        if (!abilities) {
          return { draft, error: "Unable to interpret ability scores. Try 'auto' or provide values for STR DEX CON INT WIS CHA." };
        }
        return { draft: { ...draft, abilities } };
      }
      case 'backstory':
        return { draft: { ...draft, backstory: trimmed } };
      default:
        return { draft };
    }
  }

  getMissingFields(draft: CharacterDraft): CharacterField[] {
    return REQUIRED_FIELDS.filter((field) => !this.hasFieldValue(draft, field));
  }

  getNextQuestion(draft: CharacterDraft): CharacterQuestion | null {
    const missing = this.getMissingFields(draft);
    if (missing.length === 0) return null;
    const field = missing[0]!;
    return { field, prompt: FIELD_PROMPTS[field] };
  }

  isDraftComplete(draft: CharacterDraft): draft is CompleteCharacterDraft {
    return this.getMissingFields(draft).length === 0;
  }

  finalizeCharacter(draft: CharacterDraft): PlayerCharacter {
    if (!this.isDraftComplete(draft)) {
      throw new Error('Character draft is incomplete');
    }

    const id = draft.id ?? safeUUID();
    const hp = Math.min(draft.hp, draft.maxHP);

    return {
      id,
      kind: 'character',
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
  }

  private hasFieldValue(draft: CharacterDraft, field: CharacterField): boolean {
    switch (field) {
      case 'name':
      case 'race':
      case 'class':
      case 'backstory':
        return typeof draft[field] === 'string' && draft[field]!.trim().length > 0;
      case 'level':
        return typeof draft.level === 'number' && draft.level >= MIN_LEVEL;
      case 'ac':
        return typeof draft.ac === 'number' && draft.ac >= MIN_ARMOR_CLASS;
      case 'maxHP':
        return typeof draft.maxHP === 'number' && draft.maxHP >= MIN_HIT_POINTS;
      case 'hp':
        return typeof draft.hp === 'number' && draft.hp >= MIN_HIT_POINTS;
      case 'abilities':
        return (
          !!draft.abilities &&
          DEFAULT_ABILITY_ORDER.every(
            (ability) => typeof draft.abilities![ability] === 'number' && draft.abilities![ability]! >= 1,
          )
        );
      default:
        return false;
    }
  }
}

const safeUUID = () => {
  if (typeof randomUUID === 'function') return randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};




