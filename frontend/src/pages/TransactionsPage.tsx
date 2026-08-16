import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, ArrowRightLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { AddEditIncomeModal } from '../components/transactions/AddEditIncomeModal';
import { AddEditExpenseModal } from '../components/transactions/AddEditExpenseModal';
import { AddCategoryModal } from '../components/transactions/AddCategoryModal';
import { Category, Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [page, setPage] = useState(1);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch Transactions
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', selectedMonth, selectedYear, typeFilter, search, page],
    queryFn: async () => {
      const typeParam = typeFilter !== 'ALL' ? `&type=${typeFilter}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get(
        `/transactions?month=${selectedMonth}&year=${selectedYear}&page=${page}&limit=15${typeParam}${searchParam}`,
      );
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/incomes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/incomes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Expense Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    if (confirm(`Are you sure you want to delete this ${tx.type.toLowerCase()}?`)) {
      if (tx.type === 'INCOME') {
        deleteIncomeMutation.mutate(tx.id);
      } else {
        deleteExpenseMutation.mutate(tx.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Search, filter, and edit all income and expense logs</p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-2.5 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 active:scale-95 transition-all min-h-[40px] text-center"
          >
            + Category
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsIncomeModalOpen(true);
            }}
            className="px-2.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-glow-green active:scale-95 transition-all min-h-[40px] text-center"
          >
            + Income
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsExpenseModalOpen(true);
            }}
            className="px-2.5 sm:px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-glow-red active:scale-95 transition-all min-h-[40px] text-center"
          >
            + Expense
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search source or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 hidden sm:block" />
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all ${
                typeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all ${
                typeFilter === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Incomes
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all ${
                typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>


      {/* Table */}
      <TransactionTable
        transactions={data?.data || []}
        currency={user?.currency || 'LKR'}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        categories={categories}
        initialData={editingTransaction?.type === 'INCOME' ? (editingTransaction as any) : null}
        onSubmit={async (formData) => {
          if (editingTransaction) {
            await updateIncomeMutation.mutateAsync({ id: editingTransaction.id, data: formData });
          } else {
            await createIncomeMutation.mutateAsync(formData);
          }
        }}
      />

      <AddEditExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
        initialData={editingTransaction?.type === 'EXPENSE' ? (editingTransaction as any) : null}
        onSubmit={async (formData) => {
          if (editingTransaction) {
            await updateExpenseMutation.mutateAsync({ id: editingTransaction.id, data: formData });
          } else {
            await createExpenseMutation.mutateAsync(formData);
          }
        }}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={async (catData) => {
          await createCategoryMutation.mutateAsync(catData);
        }}
      />
    </div>
  );
};
