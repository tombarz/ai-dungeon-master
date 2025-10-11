import { Injectable } from '@nestjs/common';

import { SessionPhase, StateHandler, TransitionInput, TransitionResult, SessionContext } from '../interfaces/state';
import { ChatService } from '../../chat/chat.service';

@Injectable()
export class ExploringState implements StateHandler {
  readonly phase = SessionPhase.EXPLORING as const;

  constructor(private readonly chat: ChatService) {}

  async transition(ctx: SessionContext, input: TransitionInput): Promise<TransitionResult> {
    const trimmed = input.message?.trim() ?? '';
    if (!trimmed) {
      return {
        nextPhase: this.phase,
        output: 'You are exploring. What do you do?',
        context: ctx,
      };
    }

    const systemPrompt = this.buildSystemPrompt(ctx);
    const { content } = await this.chat.sendChat({
      messages: ctx.history && ctx.history.length ? ctx.history : [{ role: 'user', content: trimmed }],
      systemPrompt,
    });

    return {
      nextPhase: this.phase,
      output: content ?? '',
      context: ctx,
    };
  }

  private buildSystemPrompt(ctx: SessionContext): string {
    const base =
      'You are an imaginative but concise dungeon master guiding exploration. Keep every reply under 30 words.';
    const draft = ctx.draft;
    if (!draft) return base;
    const parts: string[] = [base, 'Player character context:'];
    if (draft.name) parts.push(`Name: ${draft.name}`);
    if (draft.race) parts.push(`Race: ${draft.race}`);
    if (draft.class) parts.push(`Class: ${draft.class}`);
    if (draft.level) parts.push(`Level: ${draft.level}`);
    if (draft.ac) parts.push(`AC: ${draft.ac}`);
    if (draft.maxHP !== undefined && draft.hp !== undefined) parts.push(`HP: ${draft.hp}/${draft.maxHP}`);
    return parts.join(' ');
  }
}

