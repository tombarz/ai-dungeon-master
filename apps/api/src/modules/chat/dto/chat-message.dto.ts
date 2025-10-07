import { IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  role!: 'user' | 'assistant' | 'system';

  @IsString()
  content!: string;
}
