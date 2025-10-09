import { CharacterCreationService } from './character-creation.service';
import type { CharacterDraft, CharacterField } from '@ai-dungeon-master/models/types/state-machine';

class MockExtractor {
  constructor(private patch: Partial<Record<CharacterField, unknown>>) {}
  async extractCharacterUpdate() {
    return this.patch as any;
  }
}

describe('CharacterCreationService (integration with extractor)', () => {
  it('uses extractor to infer abilities from natural language when provided', async () => {
    const service = new CharacterCreationService(
      new MockExtractor({ abilities: { STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 } }) as any,
    );
    let draft: CharacterDraft = service.createEmptyDraft();
    const result = await service.applyAnswerToDraft(
      draft,
      'abilities',
      'I rolled 16 strength, 14 dex, 13 con, 12 int, 10 wis, 9 cha.',
    );
    expect(result.error).toBeUndefined();
    expect(result.draft.abilities).toEqual({ STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 9 });
  });

  it('uses extractor to infer numeric fields from natural language when provided', async () => {
    const service = new CharacterCreationService(new MockExtractor({ ac: 16, level: 3 }) as any);
    let draft: CharacterDraft = service.createEmptyDraft();

    let out = await service.applyAnswerToDraft(draft, 'ac', 'My armor class should be about sixteen.');
    draft = out.draft;
    expect(draft.ac).toBe(16);

    out = await service.applyAnswerToDraft(draft, 'level', 'I am level three.');
    draft = out.draft;
    expect(draft.level).toBe(3);
  });
});
