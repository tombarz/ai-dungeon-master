import { ExploringState } from './exploring.state';

class MockChatService {
  public lastMessages: any[] | null = null;
  constructor(private reply: string) {}
  async sendChat(payload: { messages: any; systemPrompt?: string }): Promise<{ content: string }> {
    this.lastMessages = payload.messages;
    return { content: this.reply };
  }
}

describe('ExploringState', () => {
  it('sends conversation history to the model', async () => {
    const chat = new MockChatService('The torchlight flickers against damp stone.');
    const state = new ExploringState(chat as any);

    const ctx = {
      sessionId: 's1',
      history: [
        { role: 'assistant', content: 'You stand at a crossroads in a cavern.' },
        { role: 'user', content: 'I head north.' },
      ],
    };

    const res = await state.transition(ctx as any, { message: 'I light a torch.' });
    expect(res.output).toContain('torch');
    expect(Array.isArray((chat as any).lastMessages)).toBe(true);
    expect((chat as any).lastMessages).toHaveLength(2);
    expect((chat as any).lastMessages[0].role).toBe('assistant');
  });
});

