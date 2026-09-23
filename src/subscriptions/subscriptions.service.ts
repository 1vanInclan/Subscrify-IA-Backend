import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity.js';
import { Repository } from 'typeorm';
import { REDIS_CLIENT } from '../common/redis/redis.module.js';
import { Redis } from 'ioredis';

@Injectable()
export class SubscriptionsService {

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private async invalidateUserCache(userId: string): Promise<void> {
    await this.redis.del(`subscriptions:${userId}`);
  }

  async create(userId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...dto,
      userId,
    });
    const saved = await this.subscriptionRepository.save(subscription);
    await this.invalidateUserCache(userId);
    return saved;
  }

  async findAllByUser(userId: string): Promise<Subscription[]> {
    const cacheKey = `subscriptions:${userId}`;

    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    await this.redis.set(cacheKey, JSON.stringify(subscriptions), 'EX', 3600);

    return subscriptions;
  }

  async findOneByUser(userId: string, id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID" ${id}" not found`);
    }

    return subscription;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOneByUser(userId, id);
    Object.assign(subscription, dto);
    const updated = await this.subscriptionRepository.save(subscription);
    await this.invalidateUserCache(userId);
    return updated;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const subscription = await this.findOneByUser(userId, id);
    await this.subscriptionRepository.remove(subscription);
    await this.invalidateUserCache(userId);
    return { message: 'Subscription deleted successfully' };
  }
}
