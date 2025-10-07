import { Module } from '@nestjs/common';

import { ChatModule } from './modules/chat/chat.module';
import { StateMachineModule } from './modules/state-machine/state-machine.module';

@Module({
  imports: [ChatModule, StateMachineModule],
})
export class AppModule {}
