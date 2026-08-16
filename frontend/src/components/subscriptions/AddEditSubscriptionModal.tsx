import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { BillingCycle, Category, Subscription, SubscriptionStatus } from '../../types';

interface AddEditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Subscription | null;
  categories: Category[];
}

export const AddEditSubscriptionModal: React.FC<AddEditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount.toString());
      setBillingCycle(initialData.billingCycle);
      setNextPaymentDate(new Date(initialData.nextPaymentDate).toISOString().split('T')[0]);
      setStatus(initialData.status);
      setCategoryId(initialData.categoryId || '');
    } else {
      setName('');
      setAmount('');
      setBillingCycle('MONTHLY');
      setNextPaymentDate(new Date().toISOString().split('T')[0]);
      setStatus('ACTIVE');
      setCategoryId(categories.find((c) => c.name.toLowerCase().includes('sub'))?.id || '');
    }
    setError('');
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subscription name is required');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        name,
        amount: parseFloat(amount),
        billingCycle,
        nextPaymentDate,
        status,
        categoryId: categoryId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Subscription' : 'Add Subscription'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Service Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Netflix, Spotify, GitHub, AWS"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 15.00"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Billing Cycle *
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Next Payment Date *
          </label>
          <input
            type="date"
            required
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white rounded-xl active:scale-95 transition-all min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-glow-brand active:scale-95 transition-all min-h-[44px]"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Subscription' : 'Save Subscription'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
