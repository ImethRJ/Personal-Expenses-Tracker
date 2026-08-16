import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Currency, Transaction } from '../../types';
import { Badge } from '../common/Badge';

interface TransactionTableProps {
  transactions: Transaction[];
  currency: Currency;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading transaction records...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
        <div className="p-3 bg-slate-800 rounded-full text-slate-400 mb-3">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-white">No transactions found</h4>
        <p className="text-sm text-slate-400 mt-1">Start by adding your income or expenses above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-0">
      {/* Mobile Card List View (Visible on < sm) */}
      <div className="block sm:hidden space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          return (
            <div
              key={`mobile-${tx.type}-${tx.id}`}
              className="p-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-lg space-y-3 relative overflow-hidden"
            >
              {/* Top Row: Date & Type Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{formatDate(tx.date)}</span>
                <Badge variant={isIncome ? 'income' : 'expense'}>
                  {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isIncome ? 'Income' : 'Expense'}
                </Badge>
              </div>

              {/* Title / Category & Amount */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tx.categoryColor || (isIncome ? '#10b981' : '#ef4444') }}
                  />
                  <span className="font-bold text-white text-base truncate">
                    {tx.title || tx.category}
                  </span>
                </div>
                <span
                  className={`text-lg font-extrabold flex-shrink-0 ${
                    isIncome ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>

              {/* Description & Method */}
              {(tx.description || tx.paymentMethod) && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs text-slate-400">
                  {tx.paymentMethod && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      {tx.paymentMethod}
                    </span>
                  )}
                  {tx.description && (
                    <p className="italic truncate max-w-full text-slate-400">{tx.description}</p>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onEdit(tx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold active:scale-95 transition-all min-h-[36px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold active:scale-95 transition-all min-h-[36px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (Visible on >= sm) */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Category / Source</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={isIncome ? 'income' : 'expense'}>
                      {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tx.categoryColor || (isIncome ? '#10b981' : '#ef4444') }}
                      />
                      {tx.title || tx.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-400">
                    {tx.description || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {tx.paymentMethod || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit"
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        title="Delete"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

