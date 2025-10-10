import { Body, Controller, Post } from '@nestjs/common';

import { ChatRequestDto, ChatResponseDto } from './dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.sendChat(body);
  }
}
