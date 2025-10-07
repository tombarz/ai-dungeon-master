import { CharacterCreationService, type CharacterDraft, type CharacterField } from './character-creation.service';

describe('CharacterCreationService', () => {
  let service: CharacterCreationService;
  let draft: CharacterDraft;

  const answer = (field: CharacterField, value: string) => {
    const result = service.applyAnswerToDraft(draft, field, value);
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

  it('advances the draft until complete', () => {
    answer('name', 'Eira');
    answer('race', 'Elf');
    answer('class', 'Wizard');
    answer('level', '3');
    answer('abilities', '15 14 13 12 10 8');
    answer('ac', '16');
    answer('maxHP', '24');
    answer('hp', '24');
    answer('backstory', 'An apprentice seeking lost lore.');

    expect(service.isDraftComplete(draft)).toBe(true);
    expect(service.getMissingFields(draft)).toHaveLength(0);
  });

  it('finalizes a draft into a player character', () => {
    answer('name', 'Eira');
    answer('race', 'Elf');
    answer('class', 'Wizard');
    answer('level', '3');
    answer('abilities', '15 14 13 12 10 8');
    answer('ac', '16');
    answer('maxHP', '24');
    answer('hp', '20');
    answer('backstory', 'An apprentice seeking lost lore.');

    const character = service.finalizeCharacter(draft);
    expect(character.kind).toBe('character');
    expect(character.name).toBe('Eira');
    expect(Object.values(character.abilities)).toContain(15);
  });
});
