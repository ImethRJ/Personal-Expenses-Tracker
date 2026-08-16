import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AddEditIncomeModal } from '../components/transactions/AddEditIncomeModal';
import { Category, Income } from '../types';

export const IncomesPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const { data: incomes = [], isLoading } = useQuery<Income[]>({
    queryKey: ['incomes', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/incomes?month=${selectedMonth}&year=${selectedYear}`);
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
    mutationFn: (data: any) => apiClient.post('/incomes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/incomes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/incomes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            Income Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Record and monitor all earnings and salary entries</p>
        </div>
        <button
          onClick={() => {
            setEditingIncome(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-glow-green active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Add Income Record
        </button>
      </div>

      {/* Income Summary Banner */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Income</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
            {formatCurrency(totalIncome, user?.currency || 'LKR')}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-slate-400 font-medium">
          {incomes.length} Record{incomes.length !== 1 ? 's' : ''} logged
        </span>
      </div>

      {/* Income Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading income logs...</div>
      ) : incomes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          No income records logged for this month.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {incomes.map((inc) => (
            <div key={inc.id} className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base">{inc.source}</h3>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(inc.date)}</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 my-2">
                  +{formatCurrency(inc.amount, user?.currency || 'LKR')}
                </p>
                {inc.description && <p className="text-xs text-slate-400 mt-1">{inc.description}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setEditingIncome(inc);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this income record?')) deleteMutation.mutate(inc.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      <AddEditIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialData={editingIncome}
        onSubmit={async (data) => {
          if (editingIncome) {
            await updateMutation.mutateAsync({ id: editingIncome.id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
};
