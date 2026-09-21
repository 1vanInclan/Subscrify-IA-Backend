import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { SubscriptionStatus, BillingPeriod } from '../../subscriptions/entities/subscription.entity.js';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(BillingPeriod)
  @IsOptional()
  billingPeriod?: BillingPeriod;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDateString()
  @IsOptional()
  nextBillingDate?: string;

  @IsString()
  @IsOptional()
  category?: string;
}