import type { CharacterDraft, CharacterField } from '@ai-dungeon-master/models';

export enum SessionPhase {
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  EXPLORING = 'EXPLORING',
}

export type ConversationMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export interface SessionContext {
  sessionId: string;
  campaignId?: string;
  draft?: CharacterDraft;
  pendingField?: CharacterField;
  history?: ConversationMessage[];
}

export interface TransitionInput {
  message: string;
}

export interface TransitionResult {
  nextPhase: SessionPhase;
  output: string;
  context: SessionContext;
}

export interface StateHandler {
  readonly phase: SessionPhase;
  transition(ctx: SessionContext, input: TransitionInput): Promise<TransitionResult>;
}
