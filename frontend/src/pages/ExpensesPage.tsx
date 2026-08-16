import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AddEditExpenseModal } from '../components/transactions/AddEditExpenseModal';
import { Category, Expense } from '../types';

export const ExpensesPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/expenses?month=${selectedMonth}&year=${selectedYear}`);
      return res.data;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-400" />
            Expense Management
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Track and categorize every daily expense item</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-glow-red transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Expense Record
        </button>
      </div>

      {/* Expense Summary Banner */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Expenses</span>
          <p className="text-3xl font-extrabold text-rose-400 mt-1">
            {formatCurrency(totalExpense, user?.currency || 'LKR')}
          </p>
        </div>
        <span className="text-sm text-slate-400 font-medium">
          {expenses.length} Item{expenses.length !== 1 ? 's' : ''} logged
        </span>
      </div>

      {/* Expenses Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading expense items...</div>
      ) : expenses.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          No expenses recorded for this month.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: exp.category.color }}
                    />
                    <h3 className="font-bold text-white text-base">{exp.category.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(exp.date)}</span>
                </div>
                <p className="text-2xl font-extrabold text-rose-400 my-2">
                  -{formatCurrency(exp.amount, user?.currency || 'LKR')}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Method: {exp.paymentMethod || 'Cash'}</span>
                </div>
                {exp.description && <p className="text-xs text-slate-400 mt-2 italic">{exp.description}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setEditingExpense(exp);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this expense record?')) deleteMutation.mutate(exp.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialData={editingExpense}
        onSubmit={async (data) => {
          if (editingExpense) {
            await updateMutation.mutateAsync({ id: editingExpense.id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
};
