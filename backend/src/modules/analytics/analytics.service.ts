import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyTrend(userId: string, monthsCount: number = 6) {
    const months = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const monthName = date.toLocaleString('default', { month: 'short' });

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

      const incomes = await this.prisma.income.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });

      const expenses = await this.prisma.expense.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });

      const incomeTotal = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
      const expenseTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const netBalance = incomeTotal - expenseTotal;

      months.push({
        month: monthName,
        monthNumber: m,
        year: y,
        label: `${monthName} ${y}`,
        income: Number(incomeTotal.toFixed(2)),
        expenses: Number(expenseTotal.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
      });
    }

    return months;
  }

  async getCategoryBreakdown(userId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const m = month || currentDate.getMonth() + 1;
    const y = year || currentDate.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { category: true },
    });

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    for (const exp of expenses) {
      const catId = exp.categoryId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          name: exp.category.name,
          amount: 0,
          color: exp.category.color,
          icon: exp.category.icon,
        };
      }
      categoryMap[catId].amount += Number(exp.amount);
    }

    return Object.values(categoryMap).map((cat) => ({
      ...cat,
      amount: Number(cat.amount.toFixed(2)),
      percentage: totalExpenseAmount > 0 ? Number(((cat.amount / totalExpenseAmount) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }

  async getInsights(userId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const m = month || currentDate.getMonth() + 1;
    const y = year || currentDate.getFullYear();

    // Current Month Range
    const currStart = new Date(y, m - 1, 1);
    const currEnd = new Date(y, m, 0, 23, 59, 59, 999);

    // Previous Month Range
    const prevDate = new Date(y, m - 2, 1);
    const prevM = prevDate.getMonth() + 1;
    const prevY = prevDate.getFullYear();
    const prevStart = new Date(prevY, prevM - 1, 1);
    const prevEnd = new Date(prevY, prevM, 0, 23, 59, 59, 999);

    // Fetch Current Month Data
    const currIncomes = await this.prisma.income.findMany({ where: { userId, date: { gte: currStart, lte: currEnd } } });
    const currExpenses = await this.prisma.expense.findMany({ where: { userId, date: { gte: currStart, lte: currEnd } }, include: { category: true } });

    // Fetch Previous Month Data
    const prevExpenses = await this.prisma.expense.findMany({ where: { userId, date: { gte: prevStart, lte: prevEnd } }, include: { category: true } });

    const currTotalIncome = currIncomes.reduce((s, i) => s + Number(i.amount), 0);
    const currTotalExpense = currExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const prevTotalExpense = prevExpenses.reduce((s, e) => s + Number(e.amount), 0);

    const insights: Array<{ id: string; type: 'info' | 'warning' | 'success' | 'trend'; title: string; description: string; icon: string }> = [];

    // 1. Month-over-Month Expense Comparison
    if (prevTotalExpense > 0) {
      const diffPct = Number((((currTotalExpense - prevTotalExpense) / prevTotalExpense) * 100).toFixed(1));
      if (diffPct > 0) {
        insights.push({
          id: 'mom-expense-increase',
          type: 'warning',
          title: 'Increased Monthly Spending',
          description: `Your expenses increased by ${diffPct}% compared to last month.`,
          icon: 'trending-up',
        });
      } else if (diffPct < 0) {
        insights.push({
          id: 'mom-expense-decrease',
          type: 'success',
          title: 'Decreased Monthly Spending',
          description: `Great job! Your expenses decreased by ${Math.abs(diffPct)}% compared to last month.`,
          icon: 'trending-down',
        });
      }
    }

    // 2. Savings Rate Insight
    if (currTotalIncome > 0) {
      const savingsRate = Number((((currTotalIncome - currTotalExpense) / currTotalIncome) * 100).toFixed(1));
      if (savingsRate >= 20) {
        insights.push({
          id: 'high-savings-rate',
          type: 'success',
          title: 'Strong Savings Rate',
          description: `🎯 You are currently saving ${savingsRate}% of your income this month.`,
          icon: 'target',
        });
      } else if (savingsRate < 10 && savingsRate > 0) {
        insights.push({
          id: 'low-savings-rate',
          type: 'warning',
          title: 'Low Savings Margin',
          description: `Your current savings rate is ${savingsRate}%. Consider reviewing non-essential spending.`,
          icon: 'alert-circle',
        });
      }
    }

    // 3. Category Variance Insight (e.g., Food spending variance)
    const foodCurr = currExpenses.filter(e => e.category.name.toLowerCase().includes('food')).reduce((s, e) => s + Number(e.amount), 0);
    const foodPrev = prevExpenses.filter(e => e.category.name.toLowerCase().includes('food')).reduce((s, e) => s + Number(e.amount), 0);

    if (foodPrev > 0 && foodCurr > 0) {
      const foodDiff = Number((((foodCurr - foodPrev) / foodPrev) * 100).toFixed(1));
      if (foodDiff > 10) {
        insights.push({
          id: 'food-spend-increase',
          type: 'info',
          title: 'Food & Dining Variance',
          description: `💡 You spent ${foodDiff}% more on food this month compared to last month.`,
          icon: 'utensils',
        });
      }
    }

    // 4. Subscriptions Load Insight
    const subExpenses = currExpenses.filter(e => e.category.name.toLowerCase().includes('subscription')).reduce((s, e) => s + Number(e.amount), 0);
    if (currTotalExpense > 0 && subExpenses > 0) {
      const subRatio = Number(((subExpenses / currTotalExpense) * 100).toFixed(1));
      if (subRatio >= 10) {
        insights.push({
          id: 'subscription-load',
          type: 'warning',
          title: 'Subscription Load',
          description: `⚠️ Subscriptions account for ${subRatio}% of your total monthly expenses.`,
          icon: 'smartphone',
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: 'balanced-finances',
        type: 'info',
        title: 'Financial Health Check',
        description: 'Your transactions are looking steady. Keep logging your daily income and expenses for actionable insights.',
        icon: 'smile',
      });
    }

    return insights;
  }
}
