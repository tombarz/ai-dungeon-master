import { Module } from '@nestjs/common';

import { StateMachineService } from './state-machine.service';
import { StateMachineController } from './state-machine.controller';
import { CharacterCreationModule } from '../character-creation/character-creation.module';
import { ChatModule } from '../chat/chat.module';
import { CharacterCreationState } from './states/character-creation.state';
import { ExploringState } from './states/exploring.state';

@Module({
  imports: [CharacterCreationModule, ChatModule],
  controllers: [StateMachineController],
  providers: [StateMachineService, CharacterCreationState, ExploringState],
})
export class StateMachineModule {}
