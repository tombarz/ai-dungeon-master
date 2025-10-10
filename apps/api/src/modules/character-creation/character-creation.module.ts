import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { CharacterCreationService } from './character-creation.service';
import { ExtractionService } from './extraction.service';

@Module({
  imports: [ChatModule],
  providers: [CharacterCreationService, ExtractionService],
  exports: [CharacterCreationService, ExtractionService],
})
export class CharacterCreationModule {}
