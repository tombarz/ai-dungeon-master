import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { StateMachineService } from './state-machine.service';
import { StateInputDto } from './dto/state-input.dto';
import { StateResponseDto } from './dto/state-response.dto';

@Controller('state-machine')
export class StateMachineController {
  constructor(private readonly sm: StateMachineService) {}

  @Post('step')
  async step(@Body() body: StateInputDto): Promise<StateResponseDto> {
    const res = await this.sm.step(body.sessionId, body.message);
    return res as StateResponseDto;
  }

  @Get(':sessionId')
  async get(@Param('sessionId') sessionId: string) {
    return this.sm.getSession(sessionId) ?? { sessionId, phase: null };
  }
}

