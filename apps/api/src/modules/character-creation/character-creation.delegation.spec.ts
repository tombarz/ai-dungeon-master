import { CharacterCreationService } from './character-creation.service';

describe('CharacterCreationService - delegation via model', () => {
  it('delegates numeric field (ac) to model suggestions', async () => {
    const mockExtractor = {
      extractCharacterUpdate: async () => ({}),
      detectDelegation: async () => true,
      suggestCharacterValues: async () => ({ ac: 12 }),
    } as any;

    const service = new CharacterCreationService(mockExtractor);
    const draft = service.createEmptyDraft();

    const res = await service.applyAnswerToDraft(draft, 'ac', "I don't care");
    expect(res.error).toBeUndefined();
    expect(res.draft.ac).toBe(12);
  });

  it('delegates backstory generation to the model', async () => {
    const mockExtractor = {
      extractCharacterUpdate: async () => ({}),
      detectDelegation: async () => true,
      suggestCharacterValues: async () => ({ backstory: 'Born under a crimson moon, seeking lost lore.' }),
    } as any;

    const service = new CharacterCreationService(mockExtractor);
    const draft = service.createEmptyDraft();

    const res = await service.applyAnswerToDraft(draft, 'backstory', 'you decide');
    expect(res.error).toBeUndefined();
    expect(typeof res.draft.backstory).toBe('string');
    expect((res.draft.backstory as string).length).toBeGreaterThan(0);
  });
});
