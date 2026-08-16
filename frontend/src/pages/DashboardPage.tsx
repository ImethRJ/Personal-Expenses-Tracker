import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ExpenseDonutChart } from '../components/dashboard/ExpenseDonutChart';
import { IncomeExpenseBarChart } from '../components/dashboard/IncomeExpenseBarChart';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { AddEditIncomeModal } from '../components/transactions/AddEditIncomeModal';
import { AddEditExpenseModal } from '../components/transactions/AddEditExpenseModal';
import { DashboardSummary, Category, Transaction } from '../types';

export const DashboardPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch Dashboard Summary
  const { data: dashboardData, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`);
      return res.data;
    },
  });

  // Fetch Monthly Trend Data for Bar Chart
  const { data: trendData } = useQuery({
    queryKey: ['analytics-monthly-trend'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/monthly?months=6');
      return res.data;
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    },
  });

  // Income Mutations
  const createIncomeMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/incomes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/incomes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/incomes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
    },
  });

  // Expense Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-monthly-trend'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    if (tx.type === 'INCOME') {
      setIsIncomeModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  const handleDelete = (tx: Transaction) => {
    if (confirm(`Are you sure you want to delete this ${tx.type.toLowerCase()} record?`)) {
      if (tx.type === 'INCOME') {
        deleteIncomeMutation.mutate(tx.id);
      } else {
        deleteExpenseMutation.mutate(tx.id);
      }
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
        Calculating financial balance...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'User'} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time balance status for <strong className="text-indigo-400 font-semibold">{dashboardData.month}/{dashboardData.year}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsIncomeModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-glow-green transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Add Income
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-glow-red transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={dashboardData.summary} currency={dashboardData.currency} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses Bar Chart */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Income vs Expenses</h3>
          <IncomeExpenseBarChart data={trendData || []} currency={dashboardData.currency} />
        </div>

        {/* Expense Breakdown Donut Chart */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Expense Breakdown by Category</h3>
          <ExpenseDonutChart data={dashboardData.categoryBreakdown} currency={dashboardData.currency} />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white tracking-tight">Recent Transactions</h3>
          <a href="/transactions" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            View All →
          </a>
        </div>
        <TransactionTable
          transactions={dashboardData.recentTransactions}
          currency={dashboardData.currency}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Income Modal */}
      <AddEditIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        categories={categories}
        initialData={editingTransaction?.type === 'INCOME' ? (editingTransaction as any) : null}
        onSubmit={async (data) => {
          if (editingTransaction) {
            await updateIncomeMutation.mutateAsync({ id: editingTransaction.id, data });
          } else {
            await createIncomeMutation.mutateAsync(data);
          }
        }}
      />

      {/* Expense Modal */}
      <AddEditExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
        initialData={editingTransaction?.type === 'EXPENSE' ? (editingTransaction as any) : null}
        onSubmit={async (data) => {
          if (editingTransaction) {
            await updateExpenseMutation.mutateAsync({ id: editingTransaction.id, data });
          } else {
            await createExpenseMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
};
