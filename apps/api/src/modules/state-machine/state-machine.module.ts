import { Module } from '@nestjs/common';

import { CharacterCreationService } from './character-creation.service';
import { ExtractionService } from './extraction.service';

@Module({
  providers: [CharacterCreationService, ExtractionService],
  exports: [CharacterCreationService, ExtractionService],
})
export class StateMachineModule {}

