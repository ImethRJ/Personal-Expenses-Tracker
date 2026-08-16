import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';

interface AddEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { categoryId: string; amount: number; month: number; year: number }) => Promise<void>;
  categories: Category[];
  month: number;
  year: number;
}

export const AddEditBudgetModal: React.FC<AddEditBudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  month,
  year,
}) => {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id);
    }
  }, [expenseCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Budget target amount must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        categoryId,
        amount: parseFloat(amount),
        month,
        year,
      });
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save budget target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Category Budget Target">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          >
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Monthly Budget Cap *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 400.00"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-glow-brand transition-all"
          >
            {isSubmitting ? 'Saving Target...' : 'Save Budget Target'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
