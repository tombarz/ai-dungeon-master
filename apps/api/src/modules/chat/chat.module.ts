import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CharacterCreationService } from './character-creation.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, CharacterCreationService],
  exports: [CharacterCreationService],
})
export class ChatModule {}
