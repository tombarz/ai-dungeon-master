import { Injectable, Logger } from '@nestjs/common';

import { ChatService } from '../chat/chat.service';
import type { ChatMessageDto } from '../chat/dto/chat-message.dto';
import type { CharacterField, CharacterUpdate, Ability, CharacterDraft } from '@ai-dungeon-master/models';

const abilityKeys: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  constructor(private readonly chat: ChatService) {}

  async extractCharacterUpdate(text: string, expected: CharacterField[], history?: { role: 'user'|'assistant'|'system'; content: string }[]): Promise<CharacterUpdate> {
    const systemPrompt = this.buildSystemPrompt(expected);
    const messages = ((history && history.length) ? history : [{ role: 'user', content: text }]) as unknown as ChatMessageDto[];
    const { content } = await this.chat.sendChat({ messages, systemPrompt });

    const json = this.firstJsonObject(content);
    if (!json) return {};

    try {
      const raw = JSON.parse(json) as Record<string, unknown>;
      return this.normalizeUpdate(raw);
    } catch (err) {
      this.logger.warn(`Failed to parse extraction JSON`, err as Error);
      return {};
    }
  }

  /**
   * When the user delegates a choice (e.g., "you decide", "random", "auto"),
   * ask the model to propose plausible values for the requested fields.
   */
  async suggestCharacterValues(expected: CharacterField[], draft?: CharacterDraft, history?: { role: 'user'|'assistant'|'system'; content: string }[]): Promise<CharacterUpdate> {
    const systemPrompt = this.buildSuggestionPrompt(expected);
    const userPayload = [
      'Suggest appropriate values for the requested fields based on typical low-level fantasy RPG characters.',
      draft ? `Current partial draft: ${JSON.stringify(this.minifyDraft(draft))}` : undefined,
    ]
      .filter(Boolean)
      .join(' ');

    const messages = ((history && history.length) ? history : [{ role: 'user', content: userPayload }]) as unknown as ChatMessageDto[];
    const { content } = await this.chat.sendChat({ messages, systemPrompt });

    const json = this.firstJsonObject(content);
    if (!json) return {};
    try {
      const raw = JSON.parse(json) as Record<string, unknown>;
      return this.normalizeUpdate(raw);
    } catch (err) {
      this.logger.warn(`Failed to parse suggestion JSON`, err as Error);
      return {};
    }
  }

  /**
   * Classify if the user is delegating the choice for the given field.
   * Returns true when delegating, false otherwise.
   */
    async detectDelegation(
    text: string,
    field?: CharacterField,
    _history?: { role: 'user' | 'assistant' | 'system'; content: string }[],
  ): Promise<boolean> {
    const systemPrompt = this.buildDelegationPrompt(field);
    // For delegation classification, only the last user input is required.
    const messages = [{ role: 'user', content: text }] as unknown as import('../chat/dto/chat-message.dto').ChatMessageDto[];
    const { content } = await this.chat.sendChat({ messages, systemPrompt });
    const json = this.firstJsonObject(content);
    if (!json) return false;
    try {
      const parsed = JSON.parse(json) as { delegated?: boolean };
      return parsed?.delegated === true;
    } catch {
      return false;
    }
  }

  private buildSystemPrompt(expected: CharacterField[]): string {
    const keys = expected; // restrict to requested fields
    return [
      'You extract structured character data from natural language.',
      'Return ONLY minified JSON (no code fences, no extra text).',
      `Keys allowed: ${JSON.stringify(keys)} plus "abilities" when relevant.`,
      'For abilities, use an object with keys ["STR","DEX","CON","INT","WIS","CHA"] and numeric values.',
      'For missing values, omit the key.',
    ].join(' ');
  }

  private buildDelegationPrompt(field?: CharacterField): string {
    const fieldText = field ? ` for the field "${field}"` : '';
    return [
      'You are a strict classifier.',
      `Task: Determine if the user is delegating the decision${fieldText}.`,
      'Delegation means the user asks the DM/app to pick a value (e.g., "you decide", "whatever", "random", "I don\'t care").',
      'Return ONLY minified JSON: {"delegated": true|false}. No extra text, no code fences.',
    ].join(' ');
  }

  private buildSuggestionPrompt(expected: CharacterField[]): string {
    const keys = expected;
    const wants = (k: CharacterField) => keys.includes(k);
    const lines: string[] = [];
    lines.push('You propose plausible character values when the user delegates.');
    lines.push('Return ONLY minified JSON with only the requested keys (no code fences, no extra text).');
    lines.push(`Keys required from this set: ${JSON.stringify(keys)}.`);
    if (wants('level')) lines.push('For "level": 1-20, prefer 1-3 by default.');
    if (wants('ac')) lines.push('For "ac": integer >=5, prefer 10-16 by default.');
    if (wants('maxHP')) lines.push('For "maxHP": integer 1-999.');
    if (wants('hp')) lines.push('For "hp": integer 1-999 and hp <= maxHP when both present.');
    if (wants('abilities'))
      lines.push('For "abilities": object with keys ["STR","DEX","CON","INT","WIS","CHA"] and values 3-18.');
    if (wants('name')) lines.push('For "name": a concise fantasy-style name (string).');
    if (wants('race')) lines.push('For "race": a typical fantasy race (string), e.g., Human, Elf, Dwarf.');
    if (wants('class')) lines.push('For "class": a typical class (string), e.g., Fighter, Wizard, Rogue.');
    if (wants('backstory')) lines.push('For "backstory": a brief flavorful paragraph under 100 words (string).');
    return lines.join(' ');
  }

  private minifyDraft(draft: CharacterDraft) {
    const { name, race, class: clazz, level, ac, maxHP, hp } = draft as any;
    return { name, race, class: clazz, level, ac, maxHP, hp };
  }

  private firstJsonObject(text: string): string | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return text.slice(start, end + 1);
  }

  private normalizeUpdate(raw: Record<string, unknown>): CharacterUpdate {
    const update: CharacterUpdate = {};

    if (typeof raw.name === 'string' && raw.name.trim()) update.name = raw.name.trim();
    if (typeof raw.race === 'string' && raw.race.trim()) update.race = raw.race.trim();
    if (typeof raw.class === 'string' && raw.class.trim()) update.class = raw.class.trim();
    if (typeof raw.backstory === 'string' && raw.backstory.trim()) update.backstory = raw.backstory.trim();

    const asInt = (v: unknown) => (typeof v === 'number' ? Math.trunc(v) : Number.parseInt(String(v), 10));

    const lvl = asInt(raw.level);
    if (!Number.isNaN(lvl)) update.level = clamp(lvl, 1, 20);

    const ac = asInt(raw.ac);
    if (!Number.isNaN(ac)) update.ac = clamp(ac, 5, 99);

    const maxHP = asInt(raw.maxHP);
    if (!Number.isNaN(maxHP)) update.maxHP = clamp(maxHP, 1, 999);

    const hp = asInt(raw.hp);
    if (!Number.isNaN(hp)) update.hp = clamp(hp, 1, 999);

    const abilities = raw.abilities as Record<string, unknown> | undefined;
    if (abilities && typeof abilities === 'object') {
      const normalized: Partial<Record<Ability, number>> = {};
      for (const key of abilityKeys) {
        const val = asInt((abilities as any)[key]);
        if (!Number.isNaN(val)) normalized[key] = clamp(val, 1, 30);
      }
      if (abilityKeys.every((k) => typeof normalized[k] === 'number')) {
        update.abilities = normalized as Record<Ability, number>;
      }
    }

    // Ensure hp<=maxHP if both exist
    if (update.hp !== undefined && update.maxHP !== undefined) {
      update.hp = Math.min(update.hp, update.maxHP);
    }

    return update;
  }
}

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};






