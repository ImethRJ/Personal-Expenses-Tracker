import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, month: number, year: number) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const spendingByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const catId = exp.categoryId;
      spendingByCategory[catId] = (spendingByCategory[catId] || 0) + Number(exp.amount);
    }

    const budgetProgress = budgets.map((b) => {
      const budgetAmount = Number(b.amount);
      const spent = spendingByCategory[b.categoryId] || 0;
      const percentage = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(1)) : 0;
      const remaining = budgetAmount - spent;
      const isExceeded = spent > budgetAmount;
      const exceededAmount = isExceeded ? Number((spent - budgetAmount).toFixed(2)) : 0;

      return {
        id: b.id,
        category: b.category,
        budgetAmount,
        spentAmount: Number(spent.toFixed(2)),
        remainingAmount: Number(remaining.toFixed(2)),
        percentage,
        isExceeded,
        exceededAmount,
        month: b.month,
        year: b.year,
      };
    });

    return budgetProgress;
  }

  async upsert(userId: string, createBudgetDto: CreateBudgetDto) {
    const existing = await this.prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: createBudgetDto.categoryId,
          month: createBudgetDto.month,
          year: createBudgetDto.year,
        },
      },
    });

    if (existing) {
      return this.prisma.budget.update({
        where: { id: existing.id },
        data: { amount: createBudgetDto.amount },
        include: { category: true },
      });
    }

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: createBudgetDto.categoryId,
        amount: createBudgetDto.amount,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id },
    });
  }
}
