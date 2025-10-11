import type { CharacterDraft } from '@ai-dungeon-master/models';
import { SessionPhase } from '../interfaces/state';

export class StateResponseDto {
  sessionId!: string;
  phase!: SessionPhase;
  output!: string;
  draft?: CharacterDraft;
  pendingField?: string;
}

