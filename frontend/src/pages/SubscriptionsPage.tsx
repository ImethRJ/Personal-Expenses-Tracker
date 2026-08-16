import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus, Calendar, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SubscriptionCards } from '../components/subscriptions/SubscriptionCards';
import { AddEditSubscriptionModal } from '../components/subscriptions/AddEditSubscriptionModal';
import { Category, Subscription } from '../types';

export const SubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await apiClient.get('/subscriptions');
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
    mutationFn: (subData: any) => apiClient.post('/subscriptions', subData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/subscriptions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const subscriptions: Subscription[] = data?.subscriptions || [];
  const summary = data?.summary || { totalActive: 0, totalMonthlyCost: 0, upcomingPayments: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-400" />
            Recurring Subscriptions
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage recurring SaaS, streaming, and utility memberships</p>
        </div>
        <button
          onClick={() => {
            setEditingSub(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Subscription Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Recurring Outflow
            </span>
            <p className="text-3xl font-extrabold text-purple-400 mt-1">
              {formatCurrency(summary.totalMonthlyCost, user?.currency || 'LKR')}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Upcoming Renewals
          </span>
          {summary.upcomingPayments.length === 0 ? (
            <p className="text-xs text-slate-500">No upcoming renewal dates scheduled</p>
          ) : (
            <div className="space-y-1.5">
              {summary.upcomingPayments.slice(0, 3).map((up: Subscription) => (
                <div key={up.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{up.name}</span>
                  <span className="text-slate-400 font-medium">{formatDate(up.nextPaymentDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading subscriptions...</div>
      ) : (
        <SubscriptionCards
          subscriptions={subscriptions}
          currency={user?.currency || 'LKR'}
          onEdit={(sub) => {
            setEditingSub(sub);
            setIsModalOpen(true);
          }}
          onDelete={(sub) => {
            if (confirm(`Remove subscription for ${sub.name}?`)) deleteMutation.mutate(sub.id);
          }}
        />
      )}

      <AddEditSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialData={editingSub}
        onSubmit={async (formData) => {
          if (editingSub) {
            await updateMutation.mutateAsync({ id: editingSub.id, data: formData });
          } else {
            await createMutation.mutateAsync(formData);
          }
        }}
      />
    </div>
  );
};
