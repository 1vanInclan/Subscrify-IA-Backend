import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service.js';
import { ChatMessageDto } from './dto/chat-message.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({ mediom: { limit: 5, ttl: 60000 } })
  @Post('chat')
  chat(@GetUser() user: User, @Body() dto: ChatMessageDto) {
    return this.aiService.processMessage(user.id, dto.message);
  }
}