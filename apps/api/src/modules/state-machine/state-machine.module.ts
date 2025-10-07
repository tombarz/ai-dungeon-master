import { Module } from '@nestjs/common';

import { CharacterCreationService } from './character-creation.service';

@Module({
  providers: [CharacterCreationService],
  exports: [CharacterCreationService],
})
export class StateMachineModule {}
