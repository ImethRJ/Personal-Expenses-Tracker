export type Currency = 'LKR' | 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: Currency;
  savingsGoal: number;
  createdAt: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Income {
  id: string;
  userId: string;
  categoryId?: string | null;
  amount: number;
  source: string;
  description?: string;
  date: string;
  category?: Category;
  createdAt?: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description?: string;
  paymentMethod: string;
  date: string;
  category: Category;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  description?: string;
  date: string;
  paymentMethod?: string;
}

export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAUSED';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  status: SubscriptionStatus;
  description?: string;
  categoryId?: string;
  category?: Category;
}

export interface Budget {
  id: string;
  category: Category;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isExceeded: boolean;
  exceededAmount: number;
  month: number;
  year: number;
}

export interface DashboardSummary {
  month: number;
  year: number;
  currency: Currency;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    currentNetBalance: number;
    expenseRatio: number;
    savingsAmount: number;
    savingsGoal: number;
  };
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    color: string;
    icon: string;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
}

export interface FinancialInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  icon: string;
}

export interface MonthlyTrendData {
  month: string;
  monthNumber: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  netBalance: number;
}
