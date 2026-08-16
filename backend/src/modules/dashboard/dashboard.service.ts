import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const m = month || currentDate.getMonth() + 1;
    const y = year || currentDate.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true, savingsGoal: true },
    });

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const currentNetBalance = totalIncome - totalExpenses;

    const expenseRatio = totalIncome > 0
      ? Number(((totalExpenses / totalIncome) * 100).toFixed(1))
      : 0;

    const savingsAmount = Math.max(0, currentNetBalance);
    const savingsGoal = Number(user?.savingsGoal || 0);

    // Expense Breakdown by Category
    const categoryTotals: Record<string, { name: string; amount: number; color: string; icon: string }> = {};
    for (const exp of expenses) {
      const catId = exp.categoryId;
      const catName = exp.category.name;
      const catColor = exp.category.color;
      const catIcon = exp.category.icon;
      const amt = Number(exp.amount);

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = { name: catName, amount: 0, color: catColor, icon: catIcon };
      }
      categoryTotals[catId].amount += amt;
    }

    const categoryBreakdown = Object.values(categoryTotals).map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? Number(((item.amount / totalExpenses) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Recent 5 Transactions
    const recentIncomes = incomes.map((inc) => ({
      id: inc.id,
      type: 'INCOME',
      title: inc.source,
      amount: Number(inc.amount),
      category: 'Income',
      date: inc.date,
    }));

    const recentExpenses = expenses.map((exp) => ({
      id: exp.id,
      type: 'EXPENSE',
      title: exp.category.name,
      amount: Number(exp.amount),
      category: exp.category.name,
      date: exp.date,
    }));

    const recentTransactions = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      month: m,
      year: y,
      currency: user?.currency || 'LKR',
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        currentNetBalance: Number(currentNetBalance.toFixed(2)),
        expenseRatio,
        savingsAmount: Number(savingsAmount.toFixed(2)),
        savingsGoal,
      },
      categoryBreakdown,
      recentTransactions,
    };
  }
}
