import { IsString } from 'class-validator';

export class StateInputDto {
  @IsString()
  sessionId!: string;

  @IsString()
  message!: string;
}

