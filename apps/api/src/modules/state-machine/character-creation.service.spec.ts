import { CharacterCreationService } from './character-creation.service';
import type { CharacterDraft, CharacterField } from '@ai-dungeon-master/models';

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

  it('parses explicit ability lists', () => {
    const abilities = service.parseAbilityInput('STR 16, DEX 14, CON 13, INT 12, WIS 10, CHA 9');
    expect(abilities).toEqual({ STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 });
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
    await answer('abilities', '15 14 13 12 10 8');
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
    await answer('abilities', '15 14 13 12 10 8');
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
