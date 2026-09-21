import { Injectable } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import {
  BillingPeriod,
  SubscriptionStatus,
} from '../subscriptions/entities/subscription.entity.js';

@Injectable()
export class AiToolsService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Tool 1: Obtener suscripciones activas del usuario
   */
  async getUserSubscriptions(userId: string) {
    const all = await this.subscriptionsService.findAllByUser(userId);
    return all.filter((sub) => sub.status === SubscriptionStatus.ACTIVE);
  }

  /**
   * Tool 2: Calcular el gasto total mensual proyectado
   */
  async getMonthlyExpenses(userId: string) {
    const subscriptions = await this.subscriptionsService.findAllByUser(userId);
    const activeSubs = subscriptions.filter(
      (sub) => sub.status === SubscriptionStatus.ACTIVE,
    );

    const totalUSD = activeSubs.reduce((sum, sub) => {
      const price = Number(sub.price);
      if (sub.billingPeriod === BillingPeriod.YEARLY) {
        return sum + price / 12;
      }
      return sum + price;
    }, 0);

    return {
      activeSubscriptionsCount: activeSubs.length,
      totalMonthlyExpenseUSD: Number(totalUSD.toFixed(2)),
      currency: 'USD',
    };
  }

  /**
   * Tool 3: Registrar una nueva suscripción desde el chat
   */
  async createSubscription(
    userId: string,
    args: {
      name: string;
      price: number;
      category?: string;
      billingPeriod?: BillingPeriod;
      nextBillingDate?: string;
    },
  ) {
    return this.subscriptionsService.create(userId, {
      name: args.name,
      price: args.price,
      category: args.category || 'General',
      billingPeriod: args.billingPeriod || BillingPeriod.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: args.nextBillingDate,
    });
  }

  /**
   * Tool 4: Cancelar una suscripción existente por nombre
   */
  async cancelSubscription(userId: string, args: { name: string }) {
    const subscriptions = await this.subscriptionsService.findAllByUser(userId);
    const target = subscriptions.find(
      (sub) =>
        sub.name.toLowerCase().includes(args.name.toLowerCase()) &&
        sub.status === SubscriptionStatus.ACTIVE,
    );

    if (!target) {
      return {
        success: false,
        message: `No se encontró ninguna suscripción activa con el nombre "${args.name}".`,
      };
    }

    const updated = await this.subscriptionsService.update(userId, target.id, {
      status: SubscriptionStatus.CANCELLED,
    });

    return {
      success: true,
      message: `La suscripción a ${updated.name} ha sido marcada como CANCELLED.`,
      subscription: updated,
    };
  }
}