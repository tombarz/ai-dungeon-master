import { Module } from '@nestjs/common';

import { ChatModule } from './modules/chat/chat.module';
import { CharacterCreationModule } from './modules/character-creation/character-creation.module';

@Module({
  imports: [ChatModule, CharacterCreationModule],
})
export class AppModule {}

