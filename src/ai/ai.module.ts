import { Module } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';
import { AiToolsService } from './ai-tools.service.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [SubscriptionsModule, AuthModule],
  controllers: [AiController],
  providers: [AiService, AiToolsService],
  exports: [AiService],
})
export class AiModule {}
