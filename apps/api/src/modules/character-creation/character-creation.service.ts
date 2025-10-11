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
    history?: { role: 'user'|'assistant'|'system'; content: string }[],
  ): Promise<{ draft: CharacterDraft; error?: string }> {
    const trimmed = answer.trim();
    if (!trimmed) {
      return { draft, error: 'Please provide a response.' };
    }

    const delegated = await this.computeDelegation(trimmed, field, history);

    switch (field) {
      case 'name': {
        if (delegated && this.extractor) {
          const u = await this.extractor.suggestCharacterValues(['name'], draft, history);
          if (u.name) return { draft: { ...draft, name: u.name } };
        }
        return { draft: { ...draft, name: trimmed } };
      }
      case 'race': {
        if (delegated && this.extractor) {
          const u = await this.extractor.suggestCharacterValues(['race'], draft, history);
          if (u.race) return { draft: { ...draft, race: u.race } };
        }
        return { draft: { ...draft, race: trimmed } };
      }
      case 'class': {
        if (delegated && this.extractor) {
          const u = await this.extractor.suggestCharacterValues(['class'], draft, history);
          if (u.class) return { draft: { ...draft, class: u.class } };
        }
        return { draft: { ...draft, class: trimmed } };
      }
      case 'level': {
        if (!/^\d+$/.test(trimmed) && this.extractor) {
          const u1 = await this.extractor.extractCharacterUpdate(trimmed, ['level'], history);
          if (u1.level !== undefined) return { draft: { ...draft, level: u1.level } };
          if (delegated) {
            const u2 = await this.extractor.suggestCharacterValues(['level'], draft, history);
            if (u2.level !== undefined) return { draft: { ...draft, level: u2.level } };
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
          const u1 = await this.extractor.extractCharacterUpdate(trimmed, ['ac'], history);
          if (u1.ac !== undefined) return { draft: { ...draft, ac: u1.ac } };
          if (delegated) {
            const u2 = await this.extractor.suggestCharacterValues(['ac'], draft, history);
            if (u2.ac !== undefined) return { draft: { ...draft, ac: u2.ac } };
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
          const u1 = await this.extractor.extractCharacterUpdate(trimmed, ['maxHP'], history);
          if (u1.maxHP !== undefined) {
            const nextDraft = { ...draft, maxHP: u1.maxHP } as CharacterDraft;
            if (nextDraft.hp !== undefined && nextDraft.hp > u1.maxHP) nextDraft.hp = u1.maxHP;
            return { draft: nextDraft };
          }
          if (delegated) {
            const u2 = await this.extractor.suggestCharacterValues(['maxHP'], draft, history);
            if (u2.maxHP !== undefined) {
              const nextDraft = { ...draft, maxHP: u2.maxHP } as CharacterDraft;
              if (nextDraft.hp !== undefined && nextDraft.hp > u2.maxHP) nextDraft.hp = u2.maxHP;
              return { draft: nextDraft };
            }
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
          const u1 = await this.extractor.extractCharacterUpdate(trimmed, ['hp'], history);
          if (u1.hp !== undefined) {
            const maxHP = draft.maxHP ?? u1.hp;
            return { draft: { ...draft, hp: Math.min(u1.hp, maxHP), maxHP } };
          }
          if (delegated) {
            const u2 = await this.extractor.suggestCharacterValues(['hp'], draft, history);
            if (u2.hp !== undefined) {
              const maxHP = draft.maxHP ?? u2.hp;
              return { draft: { ...draft, hp: Math.min(u2.hp, maxHP), maxHP } };
            }
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
          const u1 = await this.extractor.extractCharacterUpdate(trimmed, ['abilities'], history);
          if (u1.abilities) return { draft: { ...draft, abilities: u1.abilities } };
          if (delegated) {
            const u2 = await this.extractor.suggestCharacterValues(['abilities'], draft, history);
            if (u2.abilities) return { draft: { ...draft, abilities: u2.abilities } };
          }
        }
        if (!abilities) {
          return { draft, error: "Unable to interpret ability scores. Try 'auto' or provide values for STR DEX CON INT WIS CHA." };
        }
        return { draft: { ...draft, abilities } };
      }
      case 'backstory': {
        if (delegated && this.extractor) {
          const u = await this.extractor.suggestCharacterValues(['backstory'], draft, history);
          if (u.backstory) return { draft: { ...draft, backstory: u.backstory } };
        }
        // If user supplied text, accept as-is
        return { draft: { ...draft, backstory: trimmed } };
      }
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

  private async computeDelegation(
    text: string,
    field: CharacterField,
    history?: { role: 'user'|'assistant'|'system'; content: string }[],
  ): Promise<boolean> {
    try {
      if (this.extractor) {
        const delegated = await this.extractor.detectDelegation(text, field, history);
        if (typeof delegated === 'boolean') return delegated;
      }
    } catch {}
    return localDelegationHeuristic(text);
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

const localDelegationHeuristic = (text: string) => {
  const t = text.trim().toLowerCase();
  return [
    'auto',
    'automatic',
    'random',
    'you decide',
    "you choose",
    'your choice',
    'up to you',
    'decide',
    'pick for me',
    'choose for me',
    "i don't care",
    "i dont care",
    "don't care",
    "dont care",
    "doesn't matter",
    "doesnt matter",
    'whatever',
    'anything works',
    'any value',
    'no preference',
    'you pick',
    'as you wish',
  ].some((p) => t.includes(p));
};






