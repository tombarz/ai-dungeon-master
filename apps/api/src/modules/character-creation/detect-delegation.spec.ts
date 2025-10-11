import { ExtractionService } from './extraction.service';

class CapturingChatService {
  public lastMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
  constructor(private reply: string) {}
  async sendChat(payload: { messages: any; systemPrompt?: string }): Promise<{ content: string }> {
    this.lastMessages = payload.messages;
    return { content: this.reply };
  }
}

describe('ExtractionService.detectDelegation', () => {
  it('uses only the last user input (single message)', async () => {
    const chat = new CapturingChatService('{"delegated": true}') as any;
    const svc = new ExtractionService(chat);
    const delegated = await svc.detectDelegation("you decide the armor class", 'ac');

    expect(delegated).toBe(true);
    expect(Array.isArray((chat as any).lastMessages)).toBe(true);
    expect((chat as any).lastMessages).toHaveLength(1);
    expect((chat as any).lastMessages[0].role).toBe('user');
    expect((chat as any).lastMessages[0].content).toContain('armor class');
  });
});

