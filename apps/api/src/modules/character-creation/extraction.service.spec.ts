import { ExtractionService } from './extraction.service';
import type { CharacterField } from '@ai-dungeon-master/models';

class MockChatService {
  constructor(private reply: string) {}
  async sendChat(): Promise<{ content: string }> {
    return { content: this.reply };
  }
}

describe('ExtractionService', () => {
  it('parses JSON and normalizes values including abilities', async () => {
    const json = JSON.stringify({
      name: 'Eira',
      race: 'Elf',
      class: 'Wizard',
      level: 3,
      ac: 16,
      maxHP: 24,
      hp: 30, // will be clamped later
      abilities: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
    });
    const svc = new ExtractionService(new MockChatService(json) as any);
    const result = await svc.extractCharacterUpdate('irrelevant', [
      'name',
      'race',
      'class',
      'level',
      'ac',
      'maxHP',
      'hp',
      'abilities',
    ] as CharacterField[]);

    expect(result.name).toBe('Eira');
    expect(result.race).toBe('Elf');
    expect(result.class).toBe('Wizard');
    expect(result.level).toBe(3);
    expect(result.ac).toBe(16);
    expect(result.maxHP).toBe(24);
    expect(result.hp).toBe(24); // clamped to maxHP
    expect(result.abilities).toEqual({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 });
  });

  it('returns empty update when no JSON is found', async () => {
    const svc = new ExtractionService(new MockChatService('no json here') as any);
    const result = await svc.extractCharacterUpdate('irrelevant', ['level'] as CharacterField[]);
    expect(result).toEqual({});
  });

  it('clamps out-of-range numbers', async () => {
    const json = JSON.stringify({ level: 99, ac: 1, maxHP: 2000, hp: -5 });
    const svc = new ExtractionService(new MockChatService(json) as any);
    const result = await svc.extractCharacterUpdate('irrelevant', [
      'level',
      'ac',
      'maxHP',
      'hp',
    ] as CharacterField[]);
    expect(result.level).toBe(20);
    expect(result.ac).toBe(5);
    expect(result.maxHP).toBe(999);
    expect(result.hp).toBe(1);
  });
});
