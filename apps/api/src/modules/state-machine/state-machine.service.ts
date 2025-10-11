import { Injectable } from '@nestjs/common';

import { CharacterCreationState } from './states/character-creation.state';
import { ExploringState } from './states/exploring.state';
import { SessionContext, SessionPhase, ConversationMessage } from './interfaces/state';

@Injectable()
export class StateMachineService {
  private readonly sessions = new Map<string, { phase: SessionPhase; ctx: SessionContext }>();

  constructor(
    private readonly characterCreation: CharacterCreationState,
    private readonly exploring: ExploringState,
  ) {}

  async step(sessionId: string, message: string) {
    const existing = this.sessions.get(sessionId) ?? {
      phase: SessionPhase.CHARACTER_CREATION,
      ctx: { sessionId, history: [] as ConversationMessage[] },
    };
    const history = existing.ctx.history ?? [];
    const withUser: SessionContext = {
      ...existing.ctx,
      history: history.concat([{ role: 'user', content: message }]),
    };

    const handler = this.getHandler(existing.phase);
    const { nextPhase, output, context } = await handler.transition(withUser, { message });

    const nextHistory = (context.history ?? withUser.history ?? []).concat([
      { role: 'assistant', content: output },
    ]);
    const nextCtx: SessionContext = { ...context, history: nextHistory };

    this.sessions.set(sessionId, { phase: nextPhase, ctx: nextCtx });

    return {
      sessionId,
      phase: nextPhase,
      output,
      draft: nextCtx.draft,
      pendingField: nextCtx.pendingField,
    };
  }

  getSession(sessionId: string) {
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    return { sessionId, phase: s.phase, draft: s.ctx.draft, pendingField: s.ctx.pendingField };
  }

  private getHandler(phase: SessionPhase) {
    switch (phase) {
      case SessionPhase.CHARACTER_CREATION:
        return this.characterCreation;
      case SessionPhase.EXPLORING:
        return this.exploring;
      default:
        return this.characterCreation;
    }
  }
}
