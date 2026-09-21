import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { UsersModule } from './users/users.module.js';
import { UsersModule } from './users/users.module.js';
import { UsersModule } from './users/users.module.js';
import { UsersModule } from './users/users.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [UsersModule, SubscriptionsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
