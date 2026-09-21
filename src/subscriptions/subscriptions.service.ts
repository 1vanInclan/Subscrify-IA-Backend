import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

async create(userId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...dto,
      userId,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async findAllByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
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
    return this.subscriptionRepository.save(subscription);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const subscription = await this.findOneByUser(userId, id);
    await this.subscriptionRepository.remove(subscription);
    return { message: 'Subscription deleted successfully' };
  }
}
