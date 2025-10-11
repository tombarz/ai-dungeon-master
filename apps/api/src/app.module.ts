import { Module } from '@nestjs/common';

import { ChatModule } from './modules/chat/chat.module';
import { CharacterCreationModule } from './modules/character-creation/character-creation.module';
import { StateMachineModule } from './modules/state-machine/state-machine.module';

@Module({
  imports: [ChatModule, CharacterCreationModule, StateMachineModule],
})
export class AppModule {}

