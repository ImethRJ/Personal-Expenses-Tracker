import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { BudgetProgressBar } from '../components/budgets/BudgetProgressBar';
import { AddEditBudgetModal } from '../components/budgets/AddEditBudgetModal';
import { Budget, Category } from '../types';

export const BudgetsPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
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

  const upsertMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            Budget Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Define category spending targets and monitor over-budget alerts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-brand active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Set Budget Target
        </button>
      </div>


      {/* Budget Bars Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading budget progress...</div>
      ) : (
        <BudgetProgressBar
          budgets={budgets}
          currency={user?.currency || 'LKR'}
          onDelete={(id) => {
            if (confirm('Remove budget cap for this category?')) deleteMutation.mutate(id);
          }}
        />
      )}

      <AddEditBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        month={selectedMonth}
        year={selectedYear}
        onSubmit={async (data) => {
          await upsertMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};
