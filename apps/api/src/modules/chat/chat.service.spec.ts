import { ChatService } from './chat.service';
import { ChatMessageDto, ChatRequestDto } from './chat.dto';

describe('ChatService', () => {
  let service: ChatService;
  const originalFetch = global.fetch;
  const baseRequest: ChatRequestDto = {
    messages: [{ role: 'user', content: 'Tell me a tale.' } as ChatMessageDto],
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ChatService();
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (global as { fetch?: typeof fetch }).fetch;
    }
    delete process.env.OLLAMA_ENDPOINT;
    delete process.env.OLLAMA_MODEL;
    delete process.env.OLLAMA_SYSTEM_PROMPT;
  });

  it('sends chat payload with default directive when no custom prompt provided', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: { content: 'Short answer.' } }),
      text: async () => '',
    } as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await service.sendChat(baseRequest);

    expect(result.content).toBe('Short answer.');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://localhost:11434/api/chat');
    const payload = JSON.parse((init as RequestInit).body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(payload.messages[0].role).toBe('system');
    expect(payload.messages[0].content).toContain('Keep every reply under 30 words');
    expect(payload.messages[1]).toEqual({ role: 'user', content: 'Tell me a tale.' });
  });

  it('appends directive when custom prompt missing constraint', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ response: 'Brief tale.' }),
      text: async () => '',
    } as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await service.sendChat({
      ...baseRequest,
      systemPrompt: 'You are a whimsical narrator.',
    });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse((init as RequestInit).body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(payload.messages[0].content).toContain('You are a whimsical narrator.');
    expect(payload.messages[0].content).toContain('Keep every reply under 30 words');
  });

  it('throws descriptive error when Ollama returns non-OK status', async () => {
    const mockResponse = {
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: async () => 'upstream unavailable',
    } as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await expect(service.sendChat(baseRequest)).rejects.toThrow(
      'Ollama request failed (502): upstream unavailable',
    );
  });
});
