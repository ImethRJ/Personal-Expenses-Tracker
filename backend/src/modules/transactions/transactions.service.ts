import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    month?: number,
    year?: number,
    type?: 'INCOME' | 'EXPENSE',
    search?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    let dateFilter: any = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    let incomes: any[] = [];
    let expenses: any[] = [];

    if (!type || type === 'INCOME') {
      const incomeWhere: any = { userId, ...dateFilter };
      if (search) {
        incomeWhere.OR = [
          { source: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const rawIncomes = await this.prisma.income.findMany({
        where: incomeWhere,
        include: { category: true },
      });

      incomes = rawIncomes.map((inc) => ({
        id: inc.id,
        type: 'INCOME',
        amount: Number(inc.amount),
        title: inc.source,
        category: inc.category?.name || 'Income',
        categoryIcon: inc.category?.icon || 'briefcase',
        categoryColor: inc.category?.color || '#10b981',
        description: inc.description,
        date: inc.date,
        paymentMethod: 'N/A',
        createdAt: inc.createdAt,
      }));
    }

    if (!type || type === 'EXPENSE') {
      const expenseWhere: any = { userId, ...dateFilter };
      if (search) {
        expenseWhere.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const rawExpenses = await this.prisma.expense.findMany({
        where: expenseWhere,
        include: { category: true },
      });

      expenses = rawExpenses.map((exp) => ({
        id: exp.id,
        type: 'EXPENSE',
        amount: Number(exp.amount),
        title: exp.category.name,
        category: exp.category.name,
        categoryIcon: exp.category.icon,
        categoryColor: exp.category.color,
        description: exp.description,
        date: exp.date,
        paymentMethod: exp.paymentMethod,
        createdAt: exp.createdAt,
      }));
    }

    const combined = [...incomes, ...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const total = combined.length;
    const startIndex = (page - 1) * limit;
    const paginated = combined.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
