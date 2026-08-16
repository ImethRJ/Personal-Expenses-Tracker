import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { BillingCycle } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { nextPaymentDate: 'asc' },
    });

    const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE');

    const totalMonthlyCost = activeSubscriptions.reduce((sum, s) => {
      const amount = Number(s.amount);
      switch (s.billingCycle) {
        case BillingCycle.WEEKLY:
          return sum + amount * 4.33;
        case BillingCycle.MONTHLY:
          return sum + amount;
        case BillingCycle.QUARTERLY:
          return sum + amount / 3;
        case BillingCycle.YEARLY:
          return sum + amount / 12;
        default:
          return sum + amount;
      }
    }, 0);

    const upcomingPayments = activeSubscriptions
      .filter((s) => new Date(s.nextPaymentDate) >= new Date())
      .slice(0, 5);

    return {
      subscriptions,
      summary: {
        totalActive: activeSubscriptions.length,
        totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
        upcomingPayments,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription record not found');
    }

    return subscription;
  }

  async create(userId: string, createDto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        name: createDto.name,
        amount: createDto.amount,
        billingCycle: createDto.billingCycle,
        nextPaymentDate: new Date(createDto.nextPaymentDate),
        status: createDto.status || 'ACTIVE',
        categoryId: createDto.categoryId,
        description: createDto.description,
        userId,
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, updateDto: UpdateSubscriptionDto) {
    await this.findOne(userId, id);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
        ...(updateDto.billingCycle && { billingCycle: updateDto.billingCycle }),
        ...(updateDto.nextPaymentDate && { nextPaymentDate: new Date(updateDto.nextPaymentDate) }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.categoryId !== undefined && { categoryId: updateDto.categoryId }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
