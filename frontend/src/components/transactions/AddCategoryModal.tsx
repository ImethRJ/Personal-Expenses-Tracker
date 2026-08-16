import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CategoryType } from '../../types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: CategoryType; icon: string; color: string }) => Promise<void>;
}

const colorPresets = [
  '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899',
  '#10b981', '#06b6d4', '#a855f7', '#14b8a6', '#64748b',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [color, setColor] = useState(colorPresets[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({ name, type, icon: 'tag', color });
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create custom category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gym & Fitness, Pet Care"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Category Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2.5 px-4 rounded-xl border text-sm font-semibold active:scale-95 transition-all min-h-[44px] ${
                type === 'EXPENSE'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2.5 px-4 rounded-xl border text-sm font-semibold active:scale-95 transition-all min-h-[44px] ${
                type === 'INCOME'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              💰 Income
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Badge Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-95 ${
                  color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
