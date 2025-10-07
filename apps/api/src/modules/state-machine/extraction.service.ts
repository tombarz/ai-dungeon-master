import { Injectable, Logger } from '@nestjs/common';

import { ChatService } from '../chat/chat.service';
import type { CharacterField, CharacterUpdate, Ability } from '@ai-dungeon-master/models';

const abilityKeys: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  constructor(private readonly chat: ChatService) {}

  async extractCharacterUpdate(text: string, expected: CharacterField[]): Promise<CharacterUpdate> {
    const systemPrompt = this.buildSystemPrompt(expected);
    const { content } = await this.chat.sendChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt,
    });

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
