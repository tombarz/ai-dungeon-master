import { Injectable, Logger } from '@nestjs/common';

import { ChatMessageDto, ChatRequestDto, ChatResponseDto } from './chat.dto';

const DEFAULT_ENDPOINT = process.env.OLLAMA_ENDPOINT ?? 'http://localhost:11434';
const SHORT_REPLY_DIRECTIVE = 'Keep every reply under 30 words.';
const rawDefaultPrompt = process.env.OLLAMA_SYSTEM_PROMPT?.trim();
const DEFAULT_SYSTEM_PROMPT = rawDefaultPrompt
  ? rawDefaultPrompt.includes(SHORT_REPLY_DIRECTIVE)
    ? rawDefaultPrompt
    : `${rawDefaultPrompt}\n${SHORT_REPLY_DIRECTIVE}`
  : `You are an imaginative but concise dungeon master. ${SHORT_REPLY_DIRECTIVE}`;

type PayloadMessage = { role: ChatMessageDto['role'] | 'system'; content: string };

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async sendChat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const endpoint = this.normalizeEndpoint(request.endpoint ?? DEFAULT_ENDPOINT);
    const model = request.model ?? process.env.OLLAMA_MODEL ?? 'phi4:14b';
    const systemPrompt = this.composeSystemPrompt(request.systemPrompt);
    const payload = this.buildPayload(request.messages, model, systemPrompt);

    this.logger.log(`Sending chat to Ollama`, {
      endpoint,
      model,
      messageCount: request.messages.length,
    } as Record<string, unknown>);

    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await this.readErrorBody(response);
      this.logger.error(`Ollama request failed`, {
        status: response.status,
        details: errorDetails,
      } as Record<string, unknown>);
      throw new Error(`Ollama request failed (${response.status}): ${errorDetails}`.trim());
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    const content = data?.message?.content ?? data?.response ?? '';
    this.logger.log(`Ollama request succeeded`, {
      endpoint,
      model,
      messageCount: request.messages.length,
      contentPreview: content.slice(0, 80),
    } as Record<string, unknown>);

    return { content };
  }

  private composeSystemPrompt(customPrompt?: string) {
    const trimmed = customPrompt?.trim();
    if (!trimmed) {
      return DEFAULT_SYSTEM_PROMPT;
    }
    return trimmed.includes(SHORT_REPLY_DIRECTIVE) ? trimmed : `${trimmed}\n${SHORT_REPLY_DIRECTIVE}`;
  }

  private buildPayload(messages: ChatMessageDto[], model: string, systemPrompt: string) {
    const payloadMessages: PayloadMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ];

    return {
      model,
      messages: payloadMessages,
      stream: false,
    };
  }

  private normalizeEndpoint(endpoint: string) {
    return endpoint.replace(/\/$/, '');
  }

  private async readErrorBody(response: Response) {
    try {
      const text = await response.text();
      if (text.trim().length > 0) return text;
    } catch (error) {
      this.logger.warn('Failed to read error body', error as Error);
    }
    return response.statusText ?? '';
  }
}
