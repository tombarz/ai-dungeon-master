import { CharacterCreationService } from './character-creation.service';
import type { CharacterDraft, CharacterField } from '@ai-dungeon-master/models/types/state-machine';

describe('CharacterCreationService', () => {
  let service: CharacterCreationService;
  let draft: CharacterDraft;

  const answer = async (field: CharacterField, value: string) => {
    const result = await service.applyAnswerToDraft(draft, field, value);
    if (result.error) {
      throw new Error(`Unexpected error: ${result.error}`);
    }
    draft = result.draft;
  };

  beforeEach(() => {
    service = new CharacterCreationService();
    draft = service.createEmptyDraft();
  });

  it('generates standard ability scores when requested', () => {
    expect(service.parseAbilityInput('auto')).toEqual(service.generateStandardAbilityScores());
  });

  it('uses extractor to infer abilities from natural language when provided', async () => {
    const mockExtractor = {
      extractCharacterUpdate: async () => ({
        abilities: { STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 },
      }),
    } as any;
    const svc = new (require('./character-creation.service').CharacterCreationService)(mockExtractor);
    let d = svc.createEmptyDraft();
    const result = await svc.applyAnswerToDraft(
      d,
      'abilities',
      'I rolled 16 strength, 14 dex, 13 con, 12 int, 10 wis, 9 cha.',
    );
    expect(result.error).toBeUndefined();
    expect(result.draft.abilities).toEqual({ STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 });
  });

  it('tracks missing fields and produces prompts', () => {
    expect(service.getNextQuestion(draft)?.field).toBe('name');
    expect(service.getMissingFields(draft)).toContain('race');
  });

  it('advances the draft until complete', async () => {
    await answer('name', 'Eira');
    await answer('race', 'Elf');
    await answer('class', 'Wizard');
    await answer('level', '3');
    await answer('abilities', 'auto');
    await answer('ac', '16');
    await answer('maxHP', '24');
    await answer('hp', '24');
    await answer('backstory', 'An apprentice seeking lost lore.');

    expect(service.isDraftComplete(draft)).toBe(true);
    expect(service.getMissingFields(draft)).toHaveLength(0);
  });

  it('finalizes a draft into a player character', async () => {
    await answer('name', 'Eira');
    await answer('race', 'Elf');
    await answer('class', 'Wizard');
    await answer('level', '3');
    await answer('abilities', 'auto');
    await answer('ac', '16');
    await answer('maxHP', '24');
    await answer('hp', '20');
    await answer('backstory', 'An apprentice seeking lost lore.');

    const character = service.finalizeCharacter(draft);
    expect(character.kind).toBe('character');
    expect(character.name).toBe('Eira');
    expect(Object.values(character.abilities)).toContain(15);
  });
});




