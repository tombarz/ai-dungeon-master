import { Injectable } from '@nestjs/common';

import type { CharacterDraft, CharacterField } from '@ai-dungeon-master/models';
import { CharacterCreationService } from '../../character-creation/character-creation.service';
import { SessionPhase, StateHandler, TransitionInput, TransitionResult, SessionContext } from '../interfaces/state';

@Injectable()
export class CharacterCreationState implements StateHandler {
  readonly phase = SessionPhase.CHARACTER_CREATION as const;

  constructor(private readonly cc: CharacterCreationService) {}

  async transition(ctx: SessionContext, input: TransitionInput): Promise<TransitionResult> {
    const draft: CharacterDraft = ctx.draft ?? this.cc.createEmptyDraft();

    // If we have a pending field, try to apply the answer
    if (ctx.pendingField) {
      const { draft: nextDraft, error } = await this.cc.applyAnswerToDraft(
        draft,
        ctx.pendingField,
        input.message,
        ctx.history,
      );
      if (error) {
        const prompt = this.promptForField(ctx.pendingField);
        return {
          nextPhase: this.phase,
          output: `${error}\n${prompt}`.trim(),
          context: { ...ctx, draft: nextDraft, pendingField: ctx.pendingField },
        };
      }
      ctx = { ...ctx, draft: nextDraft, pendingField: undefined };
    }

    // Decide next question or transition
    if (this.cc.isDraftComplete(ctx.draft ?? draft)) {
      const complete = this.cc.finalizeCharacter(ctx.draft ?? draft);
      const summary = this.describeCharacter(complete);
      return {
        nextPhase: SessionPhase.EXPLORING,
        output: `Character created! ${summary}\nEntering exploring phase...`,
        context: { ...ctx, draft: complete },
      };
    }

    const question = this.cc.getNextQuestion(ctx.draft ?? draft);
    if (question) {
      return {
        nextPhase: this.phase,
        output: question.prompt,
        context: { ...ctx, draft: ctx.draft ?? draft, pendingField: question.field },
      };
    }

    // Fallback (shouldn't happen): ask for name first
    return {
      nextPhase: this.phase,
      output: this.promptForField('name'),
      context: { ...ctx, draft: ctx.draft ?? draft, pendingField: 'name' },
    };
  }

  private promptForField(field: CharacterField): string {
    const q = this.cc.getNextQuestion({ ...this.cc.createEmptyDraft(), [field]: undefined } as CharacterDraft);
    // Fallback to simple text if service doesn't provide
    switch (field) {
      case 'name':
        return "What's the character's name?";
      case 'race':
        return 'What race is the character (e.g., Human, Elf, Dwarf)?';
      case 'class':
        return 'What class does the character belong to (e.g., Fighter, Wizard)?';
      case 'level':
        return 'What level is the character? (1-20)';
      case 'abilities':
        return "Provide ability scores for STR, DEX, CON, INT, WIS, CHA (e.g., '15 14 13 12 10 8') or say 'auto' for the standard array.";
      case 'ac':
        return "What is the character's armor class?";
      case 'maxHP':
        return "What is the character's maximum hit points?";
      case 'hp':
        return "What is the character's starting hit points?";
      case 'backstory':
        return 'Share a brief backstory (under 100 words).';
      default:
        return 'Please provide the requested character detail.';
    }
  }

  private describeCharacter(pc: ReturnType<CharacterCreationService['finalizeCharacter']>): string {
    return `${pc.name} the ${pc.race} ${pc.class} (Level ${pc.level}, AC ${pc.ac}, HP ${pc.hp}/${pc.maxHP}).`;
  }
}
